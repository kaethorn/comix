import { Component, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { UserService } from 'src/app/user.service';

@Component({
  selector: 'app-login',
  styleUrls: [ './login.page.sass' ],
  templateUrl: './login.page.html'
})
export class LoginPage {

  public message: string | null = null;

  constructor(
    private userService: UserService,
    private ngZone: NgZone,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.userService.setupGoogleSignIn();
    this.userService.user
      .subscribe(() => {
        this.ngZone.run(() => {
          if (this.route.snapshot.queryParams.target) {
            this.router.navigate([ this.route.snapshot.queryParams.target ]);
          } else {
            this.router.navigate([ '/library' ]);
          }
        });
      }, (error: string) => {
        this.ngZone.run(() => {
          this.message = error;
        });
      });
  }
}
