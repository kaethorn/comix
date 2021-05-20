import { Component } from '@angular/core';
import { ToastController, LoadingController } from '@ionic/angular';

import { Comic, ScannerIssue, ScannerIssueSeverity } from 'src/app/comic';
import { ComicsService } from 'src/app/comics.service';

@Component({
  selector: 'app-queue',
  styleUrls: [ './queue.page.sass' ],
  templateUrl: './queue.page.html'
})
export class QueuePage {

  public comics: Array<Comic> = [];
  public issueSeverityToColor: Record<ScannerIssueSeverity, string> = {
    [ScannerIssueSeverity.ERROR]: 'danger',
    [ScannerIssueSeverity.INFO]: 'secondary',
    [ScannerIssueSeverity.WARNING]: 'warning'
  };

  constructor(
    private comicsService: ComicsService,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) { }

  public ionViewWillEnter(): void {
    this.list();
  }

  public fix(comic: Comic, error: ScannerIssue): void {
    error.inProgress = true;
    this.comicsService.fixIssue(comic, error).subscribe(() => {
      delete error.inProgress;
      this.list();
      this.showToast(`Flattened comic archive "${ comic.fileName }".`);
    }, () => {
      delete error.inProgress;
      this.showToast(`Error while flattening comic archive "${ comic.fileName }".`, 4000);
    });
  }

  private async presentLoading(): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingController.create({
      message: 'Loading queue...'
    });
    await loading.present();
    return loading;
  }

  private async list(): Promise<void> {
    const loading = await this.presentLoading();
    this.comicsService.listComicsWithErrors()
      .subscribe((data: Comic[]) => {
        loading.dismiss();
        this.comics = data;
      }, () => loading.dismiss());
  }

  private async showToast(message: string, duration = 3000): Promise<void> {
    const toast = await this.toastController.create({
      duration,
      message
    });
    toast.present();
  }
}
