import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverController, NavParams } from '@ionic/angular';

import { Volume } from 'src/app/volume';
import { VolumesService } from 'src/app/volumes.service';

@Component({
  selector: 'app-volume-actions',
  styleUrls: [ './volume-actions.component.sass' ],
  templateUrl: './volume-actions.component.html'
})
export class VolumeActionsComponent {

  public volume: Volume;

  constructor(
    private popoverCtrl: PopoverController,
    private volumesService: VolumesService,
    private navParams: NavParams,
    private router: Router
  ) {
    this.volume = this.navParams.get('volume');
  }

  public markAsRead(volume: Volume): void {
    this.volumesService.markAsRead(volume).subscribe(
      () => this.popoverCtrl.dismiss(),
      () => this.popoverCtrl.dismiss());
  }

  public markAsUnread(volume: Volume): void {
    this.volumesService.markAsUnread(volume).subscribe(
      () => this.popoverCtrl.dismiss(),
      () => this.popoverCtrl.dismiss());
  }

  public showCovers(volume: Volume): void {
    this.router.navigate([
      '/library/publishers', volume.publisher, 'series', volume.series, 'volumes', volume.name, 'covers'
    ]);
    this.popoverCtrl.dismiss();
  }
}
