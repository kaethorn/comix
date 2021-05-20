import { Component } from '@angular/core';
import { Router, RouterEvent } from '@angular/router';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Platform } from '@ionic/angular';
import { filter } from 'rxjs/operators';

import { UpdateService } from 'src/app/update.service';
import { UserSettingsService } from 'src/app/user-settings.service';

@Component({
  selector: 'app-root',
  styleUrls: [ './app.component.sass' ],
  templateUrl: 'app.component.html'
})
export class AppComponent {
  public hideMenu = false;
  private fullScreenUrls = [ '/read' ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private router: Router,
    private userSettingsService: UserSettingsService,
    private updateService: UpdateService
  ) {
    this.updateService.start();
    this.userSettingsService.load();
    this.initializeApp();
    this.router.events.pipe(
      filter(event => event instanceof RouterEvent)
    ).subscribe((event: any) => {
      this.hideMenu = !!this.fullScreenUrls
        .reduce((result, fullScreenUrl) => result || event.url.startsWith(fullScreenUrl), false);
    });
  }

  private initializeApp(): void {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
