import { Component } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { PopoverController, LoadingController } from '@ionic/angular';

import { Comic } from 'src/app/comic';
import { ComicDatabaseService } from 'src/app/comic-database.service';
import { ComicStorageService, StoredState } from 'src/app/comic-storage.service';
import { ComicsService } from 'src/app/comics.service';
import { VolumeActionsComponent } from 'src/app/library/volumes/volume-actions/volume-actions.component';
import { Volume } from 'src/app/volume';
import { VolumesService } from 'src/app/volumes.service';

@Component({
  selector: 'app-volumes',
  styleUrls: [ './volumes.page.sass' ],
  templateUrl: './volumes.page.html'
})
export class VolumesPage {

  public volumes: Volume[] = [];
  public publisher = '';
  public series = '';
  public thumbnails = new Map<string, Promise<SafeUrl>>();
  public stored: StoredState = {};
  private volumesData: Volume[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private comicsService: ComicsService,
    private comicStorageService: ComicStorageService,
    private volumesService: VolumesService,
    private popoverController: PopoverController,
    private comicDatabaseService: ComicDatabaseService,
    private loadingController: LoadingController
  ) { }

  public ionViewDidEnter(): void {
    this.publisher = this.route.snapshot.params.publisher;
    this.series = this.route.snapshot.params.series;
    this.list(this.publisher, this.series);
  }

  public resumeVolume(volume: Volume): void {
    if (volume.read) {
      this.comicsService.getFirstByVolume(volume.publisher, volume.series, volume.name)
        .subscribe((comic: Comic) => {
          this.router.navigate([ '/read', comic.id ], {
            queryParams: { page: comic.currentPage, parent: `/library/publishers/${ comic.publisher }/series/${ comic.series }/volumes` }
          });
        });
    } else {
      this.comicsService.getLastUnreadByVolume(volume.publisher, volume.series, volume.name)
        .subscribe((comic: Comic) => {
          this.router.navigate([ '/read', comic.id ], {
            queryParams: { page: comic.currentPage, parent: `/library/publishers/${ comic.publisher }/series/${ comic.series }/volumes` }
          });
        });
    }
  }

  public async openMenu(event: any, volume: Volume): Promise<void> {
    const popover = await this.popoverController.create({
      component: VolumeActionsComponent,
      componentProps: { volume },
      event,
      translucent: true
    });
    popover.onWillDismiss().finally(() => {
      this.list(this.publisher, this.series);
    });
    await popover.present();
  }

  public filter(value: string): void {
    this.volumes = this.volumesData
      .filter(volume => volume.name.match(value));
  }

  private async updateStoredState(comicId: string): Promise<void> {
    this.stored[comicId] = await this.comicDatabaseService.isStored(comicId);
  }

  private async presentLoading(): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingController.create({
      message: 'Loading volumes...'
    });
    await loading.present();
    return loading;
  }

  private async list(publisher: string, series: string): Promise<void> {
    const loading = await this.presentLoading();
    this.volumesService.listVolumes(publisher, series)
      .subscribe((data: Volume[]) => {
        loading.dismiss();
        this.volumesData = data;
        this.volumes = this.volumesData;
        this.volumes.forEach((volume: Volume) => {
          this.thumbnails.set(volume.firstComicId, this.comicStorageService.getFrontCoverThumbnail(volume.firstComicId));
          this.updateStoredState(volume.firstComicId);
        });
      }, () => loading.dismiss());
  }
}
