import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NavParams, PopoverController } from '@ionic/angular';
import { throwError } from 'rxjs';

import { LibraryPageModule } from 'src/app/library/library.module';
import { VolumeActionsComponent } from 'src/app/library/volumes/volume-actions/volume-actions.component';
import { VolumesService } from 'src/app/volumes.service';
import { PopoverControllerMocks } from 'src/testing/popover.controller.mocks';
import { VolumeFixtures } from 'src/testing/volume.fixtures';
import { VolumesServiceMocks } from 'src/testing/volumes.service.mocks';

let component: VolumeActionsComponent;
let fixture: ComponentFixture<VolumeActionsComponent>;
let navParams: NavParams;
let router: jasmine.SpyObj<Router>;
let popoverController: jasmine.SpyObj<PopoverController>;
let volumesService: jasmine.SpyObj<VolumesService>;

describe('VolumeActionsComponent', () => {

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', [ 'navigate' ]);
    popoverController = PopoverControllerMocks.popoverController;
    volumesService = VolumesServiceMocks.volumesService;

    navParams = new NavParams({ volume: VolumeFixtures.volume });
    TestBed.configureTestingModule({
      imports: [
        LibraryPageModule
      ],
      providers: [{
        provide: NavParams, useValue: navParams
      }, {
        provide: Router, useValue: router
      }, {
        provide: VolumesService, useValue: volumesService
      }, {
        provide: PopoverController, useValue: popoverController
      }]
    });

    fixture = TestBed.createComponent(VolumeActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('#markAsRead', () => {

    it('marks the volme as read', () => {
      component.markAsRead(VolumeFixtures.volume);
      expect(volumesService.markAsRead).toHaveBeenCalledWith(VolumeFixtures.volume);
    });

    describe('on success', () => {

      it('closes the popover', async () => {
        component.markAsRead(VolumeFixtures.volume);
        await volumesService.markAsRead.calls.mostRecent().returnValue.toPromise();

        expect(popoverController.dismiss).toHaveBeenCalled();
      });
    });

    describe('on error', () => {

      beforeEach(() => {
        volumesService.markAsRead.and.returnValue(throwError(''));
      });

      it('closes the popover', async () => {
        component.markAsRead(VolumeFixtures.volume);
        await new Promise(resolve =>
          volumesService.markAsRead.calls.mostRecent().returnValue.toPromise().catch(resolve));

        expect(popoverController.dismiss).toHaveBeenCalled();
      });
    });
  });

  describe('#markAsUnread', () => {

    it('marks the volme as unread', () => {
      component.markAsUnread(VolumeFixtures.volume);
      expect(volumesService.markAsUnread).toHaveBeenCalledWith(VolumeFixtures.volume);
    });

    describe('on success', () => {

      it('closes the popover', async () => {
        component.markAsUnread(VolumeFixtures.volume);
        await volumesService.markAsUnread.calls.mostRecent().returnValue.toPromise();

        expect(popoverController.dismiss).toHaveBeenCalled();
      });
    });

    describe('on error', () => {

      beforeEach(() => {
        volumesService.markAsUnread.and.returnValue(throwError(''));
      });

      it('closes the popover', async () => {
        component.markAsUnread(VolumeFixtures.volume);
        await new Promise(resolve =>
          volumesService.markAsUnread.calls.mostRecent().returnValue.toPromise().catch(resolve));

        expect(popoverController.dismiss).toHaveBeenCalled();
      });
    });
  });

  describe('#showCovers', () => {

    it('navigates to the covers page and closes the popover', () => {
      component.showCovers(VolumeFixtures.volume);
      expect(router.navigate).toHaveBeenCalledWith([
        '/library/publishers',
        VolumeFixtures.volume.publisher,
        'series',
        VolumeFixtures.volume.series,
        'volumes',
        VolumeFixtures.volume.name,
        'covers'
      ]);
      expect(popoverController.dismiss).toHaveBeenCalledWith();
    });
  });
});
