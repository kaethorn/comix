/* eslint-disable no-console */

import { TestBed } from '@angular/core/testing';
import { SwUpdate } from '@angular/service-worker';
import { AlertController } from '@ionic/angular';

import { LOCATION_TOKEN } from 'src/app/location.token';
import { UpdateService } from 'src/app/update.service';
import { AlertControllerMocks } from 'src/testing/alert.controller.mocks';
import { SwUpdateMocks } from 'src/testing/swupdate.mocks';

let service: UpdateService;
let swUpdate: jasmine.SpyObj<SwUpdate>;
let alertController: jasmine.SpyObj<AlertController>;
let alertElement: jasmine.SpyObj<HTMLIonAlertElement>;
let location: Location;

describe('UpdateService', () => {

  beforeEach(() => {
    swUpdate = SwUpdateMocks.swUpdate;
    alertController = AlertControllerMocks.alertController;
    alertElement = AlertControllerMocks.alertElementSpy;
    location = jasmine.createSpyObj('Location', [ 'reload' ]);
    spyOn(console, 'log');

    TestBed.configureTestingModule({
      providers: [
        { provide: SwUpdate, useValue: swUpdate },
        { provide: AlertController, useValue: alertController },
        { provide: LOCATION_TOKEN, useValue: location }
      ]
    });
    (swUpdate as any).isEnabled = true;
    service = TestBed.inject(UpdateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('subscribes to available and activated updates', () => {
    service.start();
    expect(console.log).toHaveBeenCalledWith('current version is', { hash: '1' });
    expect(console.log).toHaveBeenCalledWith('available version is', { hash: '2' });
    expect(console.log).toHaveBeenCalledWith('old version was', { hash: '3' });
    expect(console.log).toHaveBeenCalledWith('new version is', { hash: '4' });
  });

  it('checks for updates', () => {
    service.start();
    expect(swUpdate.checkForUpdate).toHaveBeenCalled();
  });

  describe('when disabled', () => {

    beforeEach(() => {
      (swUpdate as any).isEnabled = false;
    });

    it('does not check for updates', () => {
      service.start();
      expect(swUpdate.checkForUpdate).not.toHaveBeenCalled();
    });
  });

  describe('with an update', () => {

    beforeEach(() => {
      service.start();
    });

    it('shows an alert', async () => {
      expect(alertController.create).toHaveBeenCalledWith({
        buttons: (jasmine.any(Array) as any),
        header: 'Update',
        message: 'A new version is available.'
      });

      await alertController.create.calls.mostRecent().returnValue;
      expect(alertElement.present).toHaveBeenCalled();
    });

    describe('when accepting the update', () => {

      beforeEach(async () => {
        await alertController.create.calls.mostRecent().returnValue;
        const confirmButton = alertController.create.calls.mostRecent().args[0].buttons[1] as any;
        confirmButton.handler();
      });

      it('reloads the app', async () => {
        expect(swUpdate.activateUpdate).toHaveBeenCalled();
        await swUpdate.activateUpdate.calls.mostRecent().returnValue;
        expect(location.reload).toHaveBeenCalled();
      });
    });
  });
});
