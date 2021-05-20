import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { concatMap, flatMap } from 'rxjs/operators';

import { Comic } from 'src/app/comic';
import { ComicDatabaseService } from 'src/app/comic-database.service';
import { ComicsService } from 'src/app/comics.service';

@Injectable({
  providedIn: 'root'
})
export class QueueService {

  constructor(
    private comicsService: ComicsService,
    private comicDatabaseService: ComicDatabaseService
  ) {
    this.comicDatabaseService.ready.toPromise().then(() => this.process());
  }

  /**
   * Save each comic in the queue, removing it if successful.
   *
   * Returns an Observable that completes when all items are
   * processed successfully or fails on the first error.
   */
  public process(): Observable<Comic> {
    return from(this.load()).pipe(
      flatMap(comics => from(comics)),
      concatMap(comic => {
        delete comic.dirty;
        const update = this.comicsService.updateProgress(comic);
        update.subscribe(() => {
          this.comicDatabaseService.save(comic);
        }, () => {
          comic.dirty = 1;
          this.comicDatabaseService.save(comic);
        });
        return update;
      })
    );
  }

  public add(comic: Comic): Promise<Event> {
    comic.dirty = 1;
    return this.comicDatabaseService.save(comic);
  }

  public async hasItems(): Promise<boolean> {
    const count = await this.count();
    return count > 0;
  }

  public async count(): Promise<number> {
    const comics = await this.load();
    return comics.length;
  }

  private load(): Promise<Comic[]> {
    return this.comicDatabaseService.getComicsBy('dirty', 1);
  }
}
