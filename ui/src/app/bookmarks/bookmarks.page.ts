import { Component } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { PopoverController } from '@ionic/angular';
import { Observable } from 'rxjs';

import { BookmarkActionsComponent } from './bookmark-actions/bookmark-actions.component';
import { ThumbnailsService } from '../thumbnails.service';
import { ComicDatabaseService } from '../comic-database.service';
import { ComicStorageService } from '../comic-storage.service';
import { Comic } from '../comic';

@Component({
  selector: 'app-bookmarks',
  templateUrl: './bookmarks.page.html',
  styleUrls: ['./bookmarks.page.sass']
})
export class BookmarksPage {

  comics: Comic[];
  thumbnails = new Map<string, Observable<SafeUrl>>();
  synching = false;
  stored: { [name: string]: Promise<boolean> } = {};

  constructor (
    private db: ComicDatabaseService,
    private popoverController: PopoverController,
    private thumbnailsService: ThumbnailsService,
    private comicStorageService: ComicStorageService,
  ) { }

  ionViewDidEnter () {
    this.list();
  }

  private list () {
    this.comicStorageService.getBookmarks().then((comics: Comic[]) => {
      this.comics = comics;
      this.comics.forEach((comic: Comic) => {
        this.thumbnails.set(comic.id, this.thumbnailsService.get(comic.id));
        this.updateStoredState(comic);
      });
    });
 }

  async openMenu (event: any, comic: Comic) {
    const popover = await this.popoverController.create({
      component: BookmarkActionsComponent,
      componentProps: { comic },
      event,
      translucent: true
    });
    popover.onWillDismiss().finally(() => {
      this.list();
    });
    await popover.present();
  }

  sync (comic: Comic): void {
    this.synching = true;
    this.comicStorageService.storeSurrounding(comic.id)
      .then(() => {
        this.updateStoredState(comic);
        this.synching = false;
      }).catch((error) => {
        console.error(error);
        this.synching = false;
      });
  }

  delete (comic: Comic): void {
    this.db.delete(comic).then(() => {
      this.updateStoredState(comic);
    });
  }

  private updateStoredState (comic: Comic) {
    this.stored[comic.id] = this.db.isStored(comic.id);
  }
}
