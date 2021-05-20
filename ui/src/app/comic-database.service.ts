import { Injectable } from '@angular/core';
import { AsyncSubject } from 'rxjs';

import { Comic } from 'src/app/comic';
import { ComicsService } from 'src/app/comics.service';
import { IndexedDbService } from 'src/app/indexed-db.service';

@Injectable({
  providedIn: 'root'
})
export class ComicDatabaseService {

  public ready: AsyncSubject<void> = new AsyncSubject<void>();

  constructor(
    private comicService: ComicsService,
    private indexedDbService: IndexedDbService
  ) {
    this.indexedDbService.open('Comics', 2, [{
      name: 'Images',
      options: { autoIncrement: true }
    }, {
      indices: [
        [ 'id', 'id', { unique: true }],
        [ 'dirty', 'dirty', { unique: false }]
      ],
      name: 'Comics',
      options: { keyPath: 'id' }
    }]);

    this.indexedDbService.ready.subscribe(
      null,
      error => this.ready.error(error),
      () => this.ready.complete());
  }

  /**
   * Caches the entire given comic book, including meta data and images.
   * @param comic The comic to cache.
   */
  public async store(comic: Comic): Promise<Event> {
    const isStored = await this.isStored(comic.id);
    if (!isStored) {
      return Array.from(Array(comic.pageCount)).reduce((result, value, page) =>
        result.then(() => this.saveImage(comic.id, page))
      , Promise.resolve()).then(() => this.indexedDbService.save('Comics', comic));
    }
    return Promise.resolve(new Event(''));
  }

  public isStored(comicId: string): Promise<boolean> {
    return this.indexedDbService.hasKey('Comics', comicId);
  }

  /**
   * Deletes the comic and any stored images.
   * @param comic The comic to delete.
   */
  public delete(comic: Comic): Promise<Event> {
    return Array.from(Array(comic.pageCount))
      .reduce((result, value, page) =>
        result.then(() => this.indexedDbService.delete('Images', `${ comic.id }/${ page }`))
      , Promise.resolve())
      .then(() => this.indexedDbService.delete('Comics', comic.id));
  }

  public async deleteAll(): Promise<void> {
    const comics = await this.getComics();
    for (const comic of comics) {
      await this.delete(comic);
    }
  }

  public getImageUrl(comicId: string, page: number): Promise<string> {
    return this.indexedDbService.get('Images', `${ comicId }/${ page }`).then((data: any) =>
      URL.createObjectURL(data)
    );
  }

  public async getComic(comicId: string): Promise<Comic> {
    await this.ready.toPromise();
    return this.indexedDbService.get('Comics', comicId);
  }

  public async getComics(): Promise<Comic[]> {
    await this.ready.toPromise();
    return this.indexedDbService.getAll('Comics');
  }

  public getComicsBy(key: string, value: any): Promise<Comic[]> {
    return this.indexedDbService.getAllBy('Comics', key, value);
  }

  public save(comic: Comic): Promise<Event> {
    return this.indexedDbService.save('Comics', comic);
  }

  private saveImage(comicId: string, page: number): Promise<Event> {
    return new Promise((resolve, reject) => {
      this.comicService.getPage(comicId, page).subscribe((image: Blob) => {
        this.indexedDbService.save('Images', image, `${ comicId }/${ page }`)
          .then(resolve)
          .catch(error => reject(error));
      }, error => reject(error));
    });
  }
}
