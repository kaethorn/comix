import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';

import { CacheStorageService } from 'src/app/cache-storage.service';
import { Comic } from 'src/app/comic';
import { ComicsService } from 'src/app/comics.service';
import { Thumbnail } from 'src/app/thumbnail';
import { ThumbnailsService } from 'src/app/thumbnails.service';

@Component({
  selector: 'app-covers',
  styleUrls: [ './covers.page.sass' ],
  templateUrl: './covers.page.html'
})
export class CoversPage {

  public comics: Array<Comic> = [];
  public frontCoverThumbnails = new Map<string, Observable<Thumbnail>>();
  public backCoverThumbnails = new Map<string, Observable<Thumbnail>>();
  private publisher = '';
  private series = '';
  private volume = '';

  constructor(
    private cacheStorageService: CacheStorageService,
    private comicsService: ComicsService,
    private route: ActivatedRoute,
    private thumbnailsService: ThumbnailsService,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) { }

  public ionViewWillEnter(): void {
    this.publisher = this.route.snapshot.params.publisher;
    this.series = this.route.snapshot.params.series;
    this.volume = this.route.snapshot.params.volume;

    this.list();
  }

  public deleteFrontCover(comic: Comic): void {
    this.frontCoverThumbnails.get(comic.id)?.subscribe(thumbail => {
      this.comicsService.deletePage(comic, thumbail.path).subscribe(async () => {
        await this.updateThumbnails(comic);
        this.showToast(`Front cover of "${ comic.fileName }" deleted.`);
      }, () => {
        this.showToast(`Error while deleting front cover of "${ comic.fileName }".`, 4000);
      });
    });
  }

  public deleteBackCover(comic: Comic): void {
    this.backCoverThumbnails.get(comic.id)?.subscribe(thumbail => {
      this.comicsService.deletePage(comic, thumbail.path).subscribe(async () => {
        await this.updateThumbnails(comic);
        this.showToast(`Back cover of "${ comic.fileName }" deleted.`);
      }, () => {
        this.showToast(`Error while deleting back cover of "${ comic.fileName }".`, 4000);
      });
    });
  }

  private async updateThumbnails(comic: Comic): Promise<[Thumbnail, Thumbnail]> {
    await this.cacheStorageService.resetThumbnailsCache(comic.id);
    const frontCover = this.thumbnailsService.getFrontCover(comic.id);
    const backCover = this.thumbnailsService.getBackCover(comic.id);
    this.frontCoverThumbnails.set(comic.id, frontCover);
    this.backCoverThumbnails.set(comic.id, backCover);
    return Promise.all([ frontCover.toPromise(), backCover.toPromise() ]);
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
      message: 'Loading covers...'
    });
    await loading.present();
    return loading;
  }

  private async list(): Promise<void> {
    const loading = await this.presentLoading();
    this.comicsService.listComicsWithoutErrors(this.publisher, this.series, this.volume)
      .subscribe((data: Comic[]) => {
        loading.dismiss();
        this.comics = data;
        this.comics.forEach((comic: Comic) => this.updateThumbnails(comic));
      }, () => loading.dismiss());
  }
}
