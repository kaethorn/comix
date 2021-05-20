import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingController } from '@ionic/angular';

import { Series } from 'src/app/series';
import { VolumesService } from 'src/app/volumes.service';

@Component({
  selector: 'app-series',
  styleUrls: [ './series.page.sass' ],
  templateUrl: './series.page.html'
})
export class SeriesPage {

  public series: Series[] = [];
  public publisher = '';
  private seriesData: Series[] = [];

  constructor(
    private route: ActivatedRoute,
    private volumesService: VolumesService,
    private loadingController: LoadingController
  ) { }

  public ionViewDidEnter(): void {
    this.publisher = this.route.snapshot.params.publisher;
    this.list(this.publisher);
  }

  public filter(value: string): void {
    this.series = this.seriesData
      .filter(series => series.name.match(value));
  }

  private async presentLoading(): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingController.create({
      message: 'Loading series...'
    });
    await loading.present();
    return loading;
  }

  private async list(publisher: string): Promise<void> {
    const loading = await this.presentLoading();
    this.volumesService.listSeries(publisher)
      .subscribe((data: Series[]) => {
        loading.dismiss();
        this.seriesData = data;
        this.series = this.seriesData;
      }, () => loading.dismiss());
  }
}
