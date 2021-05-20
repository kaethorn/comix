/* eslint-disable no-console */

import { Injectable, ApplicationRef, Inject } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { AlertController } from '@ionic/angular';
import { interval, concat } from 'rxjs';
import { first } from 'rxjs/operators';

import { LOCATION_TOKEN } from 'src/app/location.token';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {

  constructor(
    private appRef: ApplicationRef,
    private updates: SwUpdate,
    private alertController: AlertController,
    @Inject(LOCATION_TOKEN) private location: Location
  ) { }

  public start(): void {
    if (!this.updates.isEnabled) {
      return;
    }
    this.updates.available.subscribe(event => {
      console.log('current version is', event.current);
      console.log('available version is', event.available);
      this.presentAlert();
    });
    this.updates.activated.subscribe(event => {
      console.log('old version was', event.previous);
      console.log('new version is', event.current);
    });
    this.checkForUpdates();
  }

  private checkForUpdates(): void {
    const appIsStable$ = this.appRef.isStable.pipe(first(isStable => isStable));
    const everySixHours$ = interval(6 * 60 * 60 * 1000);
    const everySixHoursOnceAppIsStable$ = concat(appIsStable$, everySixHours$);

    everySixHoursOnceAppIsStable$.subscribe(() => {
      this.updates.checkForUpdate();
    });
  }

  private async presentAlert(): Promise<void> {
    const alert = await this.alertController.create({
      buttons: [
        {
          cssClass: 'secondary',
          role: 'cancel',
          text: 'Cancel'
        }, {
          handler: (): void => {
            this.updates.activateUpdate().then(() => this.location.reload());
          },
          text: 'Update'
        }
      ],
      header: 'Update',
      message: 'A new version is available.'
    });

    await alert.present();
  }
}
