import { Component } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';

import { Volume } from '../../../volume';
import { VolumesService } from '../../../volumes.service';

@Component({
  selector: 'app-volume-actions',
  templateUrl: './volume-actions.component.html',
  styleUrls: ['./volume-actions.component.sass'],
})
export class VolumeActionsComponent {

  volume: Volume;

  constructor (
    private popoverCtrl: PopoverController,
    private volumesService: VolumesService,
    private navParams: NavParams
  ) {
    this.volume = this.navParams.get('volume');
  }

  public markAsRead (volume: Volume) {
    this.volumesService.markAsRead(volume).subscribe(
      () => this.popoverCtrl.dismiss(),
      () => this.popoverCtrl.dismiss());
  }

  public markAsUnread (volume: Volume) {
    this.volumesService.markAsUnread(volume).subscribe(
      () => this.popoverCtrl.dismiss(),
      () => this.popoverCtrl.dismiss());
  }
}
