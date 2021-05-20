import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AuthGuard } from 'src/app/auth.guard';
import { UserService } from 'src/app/user.service';

const userService = {
  user: of({}),
  verifyCurrentUser: (): void => {}
};
const router: jasmine.SpyObj<Router> = jasmine.createSpyObj('Router', [ 'navigate' ]);

let authGuard: AuthGuard;

describe('AuthGuard', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: UserService, useValue: userService },
        { provide: Router, useValue: router }
      ]
    });
    authGuard = new AuthGuard((userService as UserService), (router as Router));
  });

  describe('canActivate', () => {

    it('should return true for a logged in user', async () => {
      userService.user = of({});

      expect(await authGuard.canActivate(new ActivatedRouteSnapshot(), ({ url: '/settings' } as any)).toPromise())
        .toBe(true);
    });

    it('should navigate to home for a logged out user', async () => {
      userService.user = throwError('Login error');

      expect(await authGuard.canActivate(new ActivatedRouteSnapshot(), ({ url: '/settings' } as any)).toPromise())
        .toBe(false);
      expect(router.navigate).toHaveBeenCalledWith([ '/login' ], { queryParams: { target: '/settings' } });
    });
  });
});
