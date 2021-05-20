import { Injectable } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { from } from 'rxjs';
import { groupBy, mergeMap, filter, toArray, map } from 'rxjs/operators';

import { Comic } from 'src/app/comic';
import { ComicDatabaseService } from 'src/app/comic-database.service';
import { ComicsService } from 'src/app/comics.service';
import { QueueService } from 'src/app/queue.service';
import { ThumbnailsService } from 'src/app/thumbnails.service';

export interface StoredState {
  [name: string]: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ComicStorageService {

  constructor(
    private sanitizer: DomSanitizer,
    private thumbnailsService: ThumbnailsService,
    private comicDatabaseService: ComicDatabaseService,
    private comicsService: ComicsService,
    private queueService: QueueService
  ) { }

  /**
   * Retrieve the given comic from cache or from the server as a fallback.
   * @param comicId Comic ID to retrieve.
   * @returns A promise returning the comic.
   */
  public get(comicId: string): Promise<Comic> {
    return new Promise((resolve, reject) => {
      this.comicDatabaseService.getComic(comicId)
        .then(comic => resolve(comic))
        .catch(() => {
          this.comicsService.get(comicId).subscribe(
            apiComic => resolve(apiComic),
            () => reject());
        });
    });
  }

  /**
   * Marks the given page of this comic as read.
   * @param comic The comic to store
   * @returns A Promise that resolved when finished.
   */
  public async saveProgress(comic: Comic): Promise<Event> {
    comic.lastRead = new Date();
    if (comic.pageCount - 1 <= (comic.currentPage || 0)) {
      comic.read = true;
    }

    this.saveComicProgress(comic);
    if (await this.comicDatabaseService.isStored(comic.id)) {
      return this.comicDatabaseService.save(comic);
    }
    return Promise.resolve(new Event(''));
  }

  /**
   * Retrieves the given page of this comic, without setting the read state.
   * @param comicId The comic ID
   * @param page Page number
   * @returns The URL to the image.
   */
  public async getPageUrl(comicId: string, page: number): Promise<string> {
    if (await this.comicDatabaseService.isStored(comicId)) {
      return this.comicDatabaseService.getImageUrl(comicId, page);
    } else {
      return Promise.resolve(`/api/read/${ comicId }/${ page }`);
    }
  }

  public async saveIfStored(comic: Comic): Promise<void> {
    if (await this.comicDatabaseService.isStored(comic.id)) {
      await this.comicDatabaseService.save(comic);
    }
  }

  /**
   * Retrieves bookmarks either from API or from indexedDB.
   */
  public getBookmarks(): Promise<Comic[]> {
    return new Promise((resolve, reject) => {
      this.comicsService.listLastReadByVolume().subscribe((comics: Comic[]) => {
        this.queueService.process().subscribe(
          () => {},
          () => resolve(comics),
          () => {
            // Now that all queue items have been processed, the state on
            // the server is up to date and might differ from the previous
            // request. So we have to query the server once more.
            this.comicsService.listLastReadByVolume().subscribe((updatedComics: Comic[]) => {
              resolve(updatedComics);
            });
          });
      }, () => {
        this.comicDatabaseService.getComics().then((comics: Comic[]) => {
          from(comics).pipe(
            filter(comic => !comic.read),
            groupBy(comic => `${ comic.publisher }|${ comic.series }|${ comic.volume }`),
            mergeMap(group => group.pipe(
              toArray(),
              map(g => g.sort((a, b) => a.position > b.position ? 1 : -1))
            )),
            map(group => group[0]),
            toArray()
          ).subscribe(c => {
            resolve(c);
          }, reject);
        }, () => reject());
      });
    });
  }

  /**
   * Caches the current comic book.
   * @param comic The reference comic.
   * @returns A promise that resolves when the comic is cached.
   */
  public store(comic: Comic): Promise<Event> {
    return this.comicDatabaseService.store(comic);
  }

  /**
   * Caches the previous, the current and the three next comic books.
   * @param comicId The reference comic ID.
   * @returns A promise that resolves when all surrounding comics are cached.
   */
  public async storeSurrounding(comicId: string): Promise<StoredState> {
    const cachedIds: StoredState = {};
    const comic = await this.get(comicId);

    // Store the previous comic.
    if (comic.previousId !== null) {
      const previousComic = await this.get(comic.previousId);
      await this.comicDatabaseService.store(previousComic);
      cachedIds[previousComic.id] = true;
    }

    // Store the current comic.
    await this.comicDatabaseService.store(comic);
    cachedIds[comic.id] = true;

    // Store the next three comics.
    let nextComic: Comic = comic;
    for (const {} of Array(3).keys()) {
      if (nextComic.nextId !== null) {
        nextComic = await this.get(nextComic.nextId);
        await this.comicDatabaseService.store(nextComic);
        cachedIds[nextComic.id] = true;
      } else {
        break;
      }
    }

    // Traverse indexedDb's Comic collection for comic books outside
    // that range and delete them.
    const cachedComics = await this.comicDatabaseService.getComics();
    const comicsToDelete = cachedComics.filter(cachedComic =>
      // Filter out comics from other volumes:
      this.matchesVolume(comic, cachedComic) &&
        // Filter out comics that are not cached
        !(cachedComic.id in cachedIds)
    );
    for (const comicToDelete of comicsToDelete) {
      await this.comicDatabaseService.delete(comicToDelete);
    }
    return cachedIds;
  }

  /**
   * Deletes all stored comics in the given comic's volume.
   * @param referenceComic Reference comic.
   */
  public async deleteVolume(referenceComic: Comic): Promise<void> {
    const comics = await this.comicDatabaseService.getComics();
    const volume: Comic[] = comics.filter(comic => this.matchesVolume(referenceComic, comic));
    for (const comic of volume) {
      await this.comicDatabaseService.delete(comic);
    }
  }

  public getFrontCoverThumbnail(comicId: string): Promise<SafeUrl> {
    return new Promise((resolve, reject) => {
      this.comicDatabaseService.getImageUrl(comicId, 0)
        .then(thumbnail => {
          resolve(this.sanitizer.bypassSecurityTrustResourceUrl(thumbnail));
        }).catch(() => {
          this.thumbnailsService.getFrontCover(comicId)
            .pipe(map(thumbnail => thumbnail.url))
            .subscribe(resolve as any, reject);
        });
    });
  }

  public async getBackCoverThumbnail(comicId: string): Promise<SafeUrl> {
    const comic = await this.get(comicId);
    return new Promise((resolve, reject) => {
      this.comicDatabaseService.getImageUrl(comicId, comic.pageCount - 1)
        .then(thumbnail => {
          resolve(this.sanitizer.bypassSecurityTrustResourceUrl(thumbnail));
        }).catch(() => {
          this.thumbnailsService.getBackCover(comicId)
            .pipe(map(thumbnail => thumbnail.url))
            .subscribe(resolve as any, reject);
        });
    });
  }

  private matchesVolume(comicA: Comic, comicB: Comic): boolean {
    return comicA.publisher === comicB.publisher &&
      comicA.series === comicB.series &&
      comicA.volume === comicB.volume;
  }

  private saveComicProgress(comic: Comic): void {
    this.comicsService.updateProgress(comic).subscribe(
      () => this.queueService.process(),
      () => this.queueService.add(comic));
  }
}
