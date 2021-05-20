import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { LoginPageModule } from 'src/app/login/login.module';
import { LoginPage } from 'src/app/login/login.page';
import { UserService } from 'src/app/user.service';
import { MockComponent } from 'src/testing/mock.component';
import { UserServiceMocks } from 'src/testing/user.service.mocks';

let component: LoginPage;
let fixture: ComponentFixture<LoginPage>;
let userService: jasmine.SpyObj<UserService>;
let router: jasmine.SpyObj<Router>;
let activatedRoute: any;

describe('LoginPage', () => {

  beforeEach(() => {
    userService = UserServiceMocks.userService;
    router = jasmine.createSpyObj('Router', [ 'navigate' ]);
    activatedRoute = {
      snapshot: {
        queryParams: {
        }
      }
    };

    TestBed.configureTestingModule({
      imports: [
        LoginPageModule,
        RouterTestingModule.withRoutes([
          { component: MockComponent, path: 'library' }
        ])
      ],
      providers: [{
        provide: UserService, useValue: userService
      }, {
        provide: ActivatedRoute, useValue: activatedRoute
      }, {
        provide: Router, useValue: router
      }]
    });
    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.message).toBeNull();
  });

  describe('when logging in', () => {

    describe('with a login error', () => {

      beforeEach(() => {
        userService.user.error('Invalid user.');
        fixture = TestBed.createComponent(LoginPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });

      it('displays the error message', () => {
        expect(component.message).toEqual('Invalid user.');
      });
    });

    describe('without a target parameter', () => {

      beforeEach(() => {
        delete activatedRoute.snapshot.queryParams.target;
        fixture = TestBed.createComponent(LoginPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });

      it('navigates to the library', () => {
        expect(router.navigate).toHaveBeenCalledWith([ '/library' ]);
      });
    });

    describe('with a target parameter', () => {

      beforeEach(() => {
        activatedRoute.snapshot.queryParams.target = '/bookmarks';
        fixture = TestBed.createComponent(LoginPage);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });

      it('navigates to the target', () => {
        expect(router.navigate).toHaveBeenCalledWith([ '/bookmarks' ]);
      });
    });
  });
});
