import { Component } from '@angular/core';
import { LoadingController } from '@ionic/angular';

import { Publisher } from 'src/app/publisher';
import { Series } from 'src/app/series';
import { VolumesService } from 'src/app/volumes.service';

@Component({
  selector: 'app-publishers',
  styleUrls: [ './publishers.page.sass' ],
  templateUrl: './publishers.page.html'
})
export class PublishersPage {

  public publishers: Publisher[] = [];
  private publishersData: Publisher[] = [];

  constructor(
    private volumesService: VolumesService,
    private loadingController: LoadingController
  ) { }

  public ionViewWillEnter(): void {
    this.list();
  }

  public filter(value: string): void {
    this.publishers = this.publishersData
      .reduce((result: Publisher[], publisher: Publisher): Publisher[] => {
        const series = publisher.series.filter((serie: Series) => serie.name.match(value));
        if (series.length) {
          result.push({
            name: publisher.name,
            series,
            seriesCount: publisher.seriesCount
          });
        }
        return result;
      }, []);
  }

  private async presentLoading(): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingController.create({
      message: 'Loading volumes...'
    });
    await loading.present();
    return loading;
  }

  private async list(): Promise<void> {
    const loading = await this.presentLoading();
    this.volumesService.listPublishers()
      .subscribe((data: Publisher[]) => {
        loading.dismiss();
        this.publishersData = data;
        this.publishers = this.publishersData;
      }, () => loading.dismiss());
  }
}
