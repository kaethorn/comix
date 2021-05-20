import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PopoverController, ToastController, LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';

import { Comic } from 'src/app/comic';
import { ComicDatabaseService } from 'src/app/comic-database.service';
import { ComicStorageService, StoredState } from 'src/app/comic-storage.service';
import { ComicsService } from 'src/app/comics.service';
import { IssueActionsComponent } from 'src/app/library/issues/issue-actions/issue-actions.component';
import { Thumbnail } from 'src/app/thumbnail';
import { ThumbnailsService } from 'src/app/thumbnails.service';
import { VolumesService } from 'src/app/volumes.service';

@Component({
  selector: 'app-issues',
  styleUrls: [ './issues.page.sass' ],
  templateUrl: './issues.page.html'
})
export class IssuesPage {

  public summaryToggles: boolean[] = [];
  public currentRoute = '';
  public thumbnails = new Map<string, Observable<Thumbnail>>();
  public comics: Array<Comic> = [];
  public stored: StoredState = {};
  private publisher = '';
  private series = '';
  private volume = '';

  constructor(
    private comicDatabaseService: ComicDatabaseService,
    private route: ActivatedRoute,
    private comicsService: ComicsService,
    private volumesService: VolumesService,
    private thumbnailsService: ThumbnailsService,
    private popoverController: PopoverController,
    private toastController: ToastController,
    private comicStorageService: ComicStorageService,
    private loadingController: LoadingController
  ) { }

  public ionViewDidEnter(): void {
    this.publisher = this.route.snapshot.params.publisher;
    this.series = this.route.snapshot.params.series;
    this.volume = this.route.snapshot.params.volume;
    this.currentRoute = `/library/publishers/${ this.publisher }/series/${ this.series }/volumes/${ this.volume }/issues`;

    this.list();
  }

  public markAsRead(comic: Comic): void {
    this.comicsService.markAsRead(comic).subscribe(resultComic => {
      this.replaceComic(resultComic);
      this.storeSurrounding(comic.nextId);
    });
  }

  public markAsUnread(comic: Comic): void {
    this.comicsService.markAsUnread(comic).subscribe(resultComic => {
      this.replaceComic(resultComic);
      this.storeSurrounding(comic.previousId);
    });
  }

  public markAsReadUntil(comic: Comic): void {
    this.volumesService.markAllAsReadUntil(comic).subscribe(() => {
      this.list();
      this.storeSurrounding(comic.nextId);
    });
  }

  public async openMenu(event: Event, comic: Comic): Promise<void> {
    const popover = await this.popoverController.create({
      component: IssueActionsComponent,
      componentProps: { comic },
      event,
      translucent: true
    });
    popover.onDidDismiss().then((action: any) => {
      if (action.data && action.data.markAsReadUntil) {
        this.markAsReadUntil(action.data.markAsReadUntil);
      }
    });
    await popover.present();
  }

  private async presentLoading(): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingController.create({
      message: 'Loading issues...'
    });
    await loading.present();
    return loading;
  }

  private async list(): Promise<void> {
    const loading = await this.presentLoading();
    this.comicsService.listByVolume(this.publisher, this.series, this.volume)
      .subscribe((data: Comic[]) => {
        loading.dismiss();
        this.comics = data;
        this.summaryToggles = new Array(data.length);
        this.comics.forEach((comic: Comic) => {
          this.thumbnails.set(comic.id, this.thumbnailsService.getFrontCover(comic.id));
          this.updateStoredState(comic.id);
          this.comicStorageService.saveIfStored(comic);
        });
      }, () => loading.dismiss());
  }

  private async updateStoredState(comicId: string): Promise<void> {
    this.stored[comicId] = await this.comicDatabaseService.isStored(comicId);
  }

  private replaceComic(comic: Comic): void {
    this.comicStorageService.saveIfStored(comic);
    this.comics[this.comics.findIndex(c => c.id === comic.id)] = comic;
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      duration: 3000,
      message
    });
    toast.present();
  }

  private storeSurrounding(comicId: string | null | undefined): void {
    if (!comicId) {
      return;
    }
    this.comicStorageService.storeSurrounding(comicId).then(storedComicIds => {
      this.showToast('Volume cached.');
      this.stored = storedComicIds;
    });
  }
}
