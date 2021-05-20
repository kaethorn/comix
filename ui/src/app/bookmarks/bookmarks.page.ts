import { Component } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { PopoverController, ToastController, LoadingController } from '@ionic/angular';

import { BookmarkActionsComponent } from 'src/app/bookmarks/bookmark-actions/bookmark-actions.component';
import { Comic } from 'src/app/comic';
import { ComicDatabaseService } from 'src/app/comic-database.service';
import { ComicStorageService, StoredState } from 'src/app/comic-storage.service';

@Component({
  selector: 'app-bookmarks',
  styleUrls: [ './bookmarks.page.sass' ],
  templateUrl: './bookmarks.page.html'
})
export class BookmarksPage {

  public comics: Comic[] = [];
  public thumbnails = new Map<string, Promise<SafeUrl>>();
  public syncing = false;
  public stored: StoredState = {};

  constructor(
    private comicDatabaseService: ComicDatabaseService,
    private popoverController: PopoverController,
    private comicStorageService: ComicStorageService,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) { }

  public ionViewDidEnter(): void {
    this.comicDatabaseService.ready.toPromise().then(() => this.list());
  }

  public async openMenu(event: Event, comic: Comic): Promise<void> {
    const popover = await this.popoverController.create({
      component: BookmarkActionsComponent,
      componentProps: { comic },
      event,
      translucent: true
    });
    await popover.present();
  }

  public sync(comic: Comic): void {
    this.syncing = true;
    this.comicStorageService.storeSurrounding(comic.id)
      .then(() => {
        this.updateStoredState(comic.id);
        this.showToast('Volume cached.');
        this.syncing = false;
      }).catch(() => {
        this.showToast('Error while syncing volume.', 4000);
        this.syncing = false;
      });
  }

  public delete(comic: Comic): void {
    this.comicStorageService.deleteVolume(comic).then(() => {
      this.updateStoredState(comic.id);
    });
  }

  private async updateStoredState(comicId: string): Promise<void> {
    this.stored[comicId] = await this.comicDatabaseService.isStored(comicId);
  }

  private async showToast(message: string, duration = 3000): Promise<void> {
    const toast = await this.toastController.create({
      duration,
      message
    });
    toast.present();
  }

  private async presentLoading(): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingController.create({
      message: 'Loading bookmarks...'
    });
    await loading.present();
    return loading;
  }

  private async list(): Promise<void> {
    const loading = await this.presentLoading();
    this.comicStorageService.getBookmarks().then((comics: Comic[]) => {
      loading.dismiss();
      this.comics = comics;
      this.comics.forEach((comic: Comic) => {
        this.thumbnails.set(comic.id, this.comicStorageService.getFrontCoverThumbnail(comic.id));
        this.updateStoredState(comic.id);
      });
    }, () => loading.dismiss());
  }
}
