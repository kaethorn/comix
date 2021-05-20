import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastController } from '@ionic/angular';
import { throwError } from 'rxjs';

import { ComicsService } from 'src/app/comics.service';
import { LOCATION_TOKEN } from 'src/app/location.token';
import { SettingsService } from 'src/app/settings.service';
import { SettingsPageModule } from 'src/app/settings/settings.module';
import { SettingsPage } from 'src/app/settings/settings.page';
import { StatsService } from 'src/app/stats.service';
import { User } from 'src/app/user';
import { UserSettingsService } from 'src/app/user-settings.service';
import { UserService } from 'src/app/user.service';
import { ComicsServiceMocks } from 'src/testing/comics.service.mocks';
import { SettingFixtures } from 'src/testing/setting.fixtures';
import { SettingsServiceMocks } from 'src/testing/settings.service.mocks';
import { StatsServiceMocks } from 'src/testing/stats.service.mocks';
import { ToastControllerMocks } from 'src/testing/toast.controller.mocks';
import { UserServiceMocks } from 'src/testing/user.service.mocks';

let component: SettingsPage;
let fixture: ComponentFixture<SettingsPage>;
let comicsService: jasmine.SpyObj<ComicsService>;
let settingsService: jasmine.SpyObj<SettingsService>;
let userService: jasmine.SpyObj<UserService>;
let statsService: jasmine.SpyObj<StatsService>;
let toastController: jasmine.SpyObj<ToastController>;
let toastElement: jasmine.SpyObj<HTMLIonToastElement>;
let location: Location;

describe('SettingsPage', () => {

  beforeEach(() => {
    comicsService = ComicsServiceMocks.comicsService;
    settingsService = SettingsServiceMocks.settingsService;
    statsService = StatsServiceMocks.statsService;
    userService = UserServiceMocks.userService;
    toastController = ToastControllerMocks.toastController;
    toastElement = ToastControllerMocks.toastElementSpy;
    location = jasmine.createSpyObj('Location', [ 'reload' ]);

    TestBed.configureTestingModule({
      imports: [
        SettingsPageModule,
        RouterTestingModule
      ],
      providers: [
        { provide: SettingsService, useValue: settingsService },
        { provide: ComicsService, useValue: comicsService },
        { provide: StatsService, useValue: statsService },
        { provide: ToastController, useValue: toastController },
        { provide: UserService, useValue: userService },
        { provide: LOCATION_TOKEN, useValue: location },
        UserSettingsService
      ]
    });
    fixture = TestBed.createComponent(SettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('retrieves user info on startup', () => {
    expect((component.user as User).email).toEqual('foo@bar.com');
  });

  describe('#onSubmit', () => {

    beforeEach(async () => {
      component.ionViewWillEnter();
      await settingsService.list.calls.mostRecent().returnValue.toPromise();
    });

    it('updates settings', () => {
      component.onSubmit();

      expect(settingsService.update).toHaveBeenCalledTimes(1);
      expect(settingsService.update).toHaveBeenCalledWith(SettingFixtures.setting);
    });

    describe('on success', () => {

      it('shows a success toast', async () => {
        component.onSubmit();

        await settingsService.update.calls.mostRecent().returnValue.toPromise();
        expect(toastController.create).toHaveBeenCalledWith({
          duration: 3000,
          message: 'Settings saved.'
        });
        await toastController.create.calls.mostRecent().returnValue;
        expect(toastElement.present).toHaveBeenCalled();
      });
    });

    describe('on error', () => {

      beforeEach(() => {
        settingsService.update.and.returnValue(throwError({
          status: 500,
          statusText: 'Server error'
        }));
      });

      it('shows an error toast', async () => {
        component.onSubmit();

        await new Promise(resolve =>
          settingsService.update.calls.mostRecent().returnValue.toPromise().catch(resolve));
        expect(toastController.create).toHaveBeenCalledWith({
          duration: 4000,
          message: 'Error saving settings (500: Server error).'
        });
        await toastController.create.calls.mostRecent().returnValue;
        expect(toastElement.present).toHaveBeenCalled();
      });
    });
  });

  describe('#saveUserSettings', () => {

    afterEach(() => {
      localStorage.clear();
    });

    it('saves user settings', () => {
      component.saveUserSettings();
      expect(JSON.parse(localStorage.getItem('userSettings') || '{}')).toEqual({});

      component.userSettings.darkMode = true;
      component.saveUserSettings();

      expect(JSON.parse(localStorage.getItem('userSettings') || '{}')).toEqual({
        darkMode: true
      });
    });
  });

  describe('#logout', () => {

    it('logs out the user and reloads', () => {
      component.logout();
      expect(userService.logout).toHaveBeenCalled();
      expect(location.reload).toHaveBeenCalled();
    });
  });
});
