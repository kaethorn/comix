import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, RouterEvent, NavigationEnd } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Platform } from '@ionic/angular';
import { ReplaySubject } from 'rxjs';

import { AppComponent } from 'src/app/app.component';
import { LOCATION_TOKEN } from 'src/app/location.token';
import { UpdateService } from 'src/app/update.service';
import { UserService } from 'src/app/user.service';
import { UserServiceMocks } from 'src/testing/user.service.mocks';

let statusBarSpy: any, splashScreenSpy: any, platformReadySpy: any, platformSpy: any;
let component: AppComponent;
let fixture: ComponentFixture<AppComponent>;
let userService: jasmine.SpyObj<UserService>;
let location: Location;
let routerEvents: ReplaySubject<RouterEvent>;

describe('AppComponent', () => {

  beforeEach(() => {
    statusBarSpy = jasmine.createSpyObj('StatusBar', [ 'styleDefault' ]);
    splashScreenSpy = jasmine.createSpyObj('SplashScreen', [ 'hide' ]);
    platformReadySpy = Promise.resolve();
    platformSpy = jasmine.createSpyObj('Platform', { ready: platformReadySpy });
    userService = UserServiceMocks.userService;
    location = jasmine.createSpyObj('Location', [ 'reload' ]);
    routerEvents = new ReplaySubject<RouterEvent>(1);

    TestBed.configureTestingModule({
      declarations: [ AppComponent ],
      imports: [
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        { provide: UpdateService, useValue: { start: jasmine.createSpy() } },
        { provide: StatusBar, useValue: statusBarSpy },
        { provide: SplashScreen, useValue: splashScreenSpy },
        { provide: Platform, useValue: platformSpy },
        { provide: UserService, useValue: userService },
        { provide: LOCATION_TOKEN, useValue: location },
        { provide: Router, useValue: {
          events: routerEvents.asObservable(),
          routerState: {}
        } }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    });
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the app', async () => {
    expect(platformSpy.ready).toHaveBeenCalled();
    await platformReadySpy;
    expect(statusBarSpy.styleDefault).toHaveBeenCalled();
    expect(splashScreenSpy.hide).toHaveBeenCalled();
  });

  it('should have tab labels', () => {
    const app = fixture.nativeElement;
    const tabs = app.querySelectorAll('ion-tab-button');
    expect(tabs.length).toEqual(3);
    expect(tabs[0].textContent).toContain('Bookmarks');
    expect(tabs[1].textContent).toContain('Library');
    expect(tabs[2].textContent).toContain('Settings');
  });

  it('should have links', () => {
    const app = fixture.nativeElement;
    const tabs = app.querySelectorAll('ion-tab-button');
    expect(tabs.length).toEqual(3);
    expect(tabs[0].getAttribute('tab')).toEqual('bookmarks');
    expect(tabs[1].getAttribute('tab')).toEqual('library');
    expect(tabs[2].getAttribute('tab')).toEqual('settings');
  });

  describe('on route change', () => {

    beforeEach(() => {
      component.hideMenu = null as any;
    });

    describe('with a full screen page', () => {

      beforeEach(() => {
        routerEvents.next(new NavigationEnd(1, '/read', '/read'));
      });

      it('hides the menu', () => {
        expect(component.hideMenu).toBeTrue();
      });
    });

    describe('with a regular page', () => {

      beforeEach(() => {
        routerEvents.next(new NavigationEnd(1, '/library', '/library'));
      });

      it('shows the menu', () => {
        expect(component.hideMenu).toBeFalse();
      });
    });
  });
});
