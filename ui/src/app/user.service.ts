import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

import { User } from './user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public user: BehaviorSubject<User> = new BehaviorSubject<User>(null);
  private auth2: gapi.auth2.GoogleAuth;

  constructor (
    private ngZone: NgZone,
    private http: HttpClient
  ) {
    this.verifyCurrentUser();
  }

  verifyCurrentUser () {
    const currentUser: User = JSON.parse(localStorage.getItem('user') || '{}');
    if (!currentUser.token) {
      this.user.next(null);
      return;
    }

    this.http.get(`api/user/verify/${ currentUser.token }`).subscribe(() => {
      this.user.next(currentUser);
    }, () => {
      this.logout();
      this.user.next(null);
    });
  }

  setupGoogleSignIn () {
    if (typeof gapi === 'object') {
      gapi.load('auth2', () => {
        this.ngZone.run(() => {
          this.auth2 = gapi.auth2.init({
            client_id: '401455891931-28afa7q3453j1fsdfnlen5tf46oqeadr.apps.googleusercontent.com'
          });
          this.auth2.attachClickHandler('signin-button', {}, (googleUser: gapi.auth2.GoogleUser) => {
            const token = googleUser.getAuthResponse().id_token;
            this.http.post<User>(`api/user/sign-in/${ token }`, null).subscribe((user: User) => {
              this.user.next(user);
              localStorage.setItem('token', user.token);
              localStorage.setItem('user', JSON.stringify(user));
            });
          }, (errorData) => {
            console.log(`Login failure: ${ JSON.stringify(errorData, null, 2) }`);
          });

          if (this.auth2.isSignedIn.get() === true) {
            this.auth2.signIn();
          }
        });
      });
    } else {
      const mockUser: User = {
        email: 'b.wayne@waynecorp.com',
        name: 'B.Wayne',
        picture: 'https://img.icons8.com/office/80/000000/batman-old.png',
        token: 'mock-123'
      };
      this.http.get(`api/user/verify/${ mockUser.token }`).subscribe(() => {
        this.user.next(mockUser);
      });
    }
  }

  logout () {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
}
