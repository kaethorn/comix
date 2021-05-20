import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LoadingController } from '@ionic/angular';
import { throwError } from 'rxjs';

import { LibraryPageModule } from 'src/app/library/library.module';
import { PublishersPage } from 'src/app/library/publishers/publishers.page';
import { VolumesService } from 'src/app/volumes.service';
import { LoadingControllerMocks } from 'src/testing/loading.controller.mocks';
import { VolumesServiceMocks } from 'src/testing/volumes.service.mocks';

let component: PublishersPage;
let fixture: ComponentFixture<PublishersPage>;
let loadingController: jasmine.SpyObj<LoadingController>;
let loadingElement: jasmine.SpyObj<HTMLIonLoadingElement>;
let volumesService: jasmine.SpyObj<VolumesService>;

describe('PublishersPage', () => {

  beforeEach(<any>fakeAsync(async () => {
    loadingController = LoadingControllerMocks.loadingController;
    loadingElement = LoadingControllerMocks.loadingElementSpy;
    volumesService = VolumesServiceMocks.volumesService;

    TestBed.configureTestingModule({
      imports: [
        LibraryPageModule,
        RouterTestingModule
      ],
      providers: [
        { provide: VolumesService, useValue: volumesService },
        { provide: LoadingController, useValue: loadingController }
      ]
    });

    fixture = TestBed.createComponent(PublishersPage);
    component = fixture.componentInstance;
    component.ionViewWillEnter();

    await loadingController.create.calls.mostRecent().returnValue;
    await loadingElement.present.calls.mostRecent().returnValue;
    tick();
    await volumesService.listPublishers.calls.mostRecent().returnValue.toPromise();

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('displays feedback while loading', <any>fakeAsync(async () => {
    loadingElement.dismiss.calls.reset();
    component.ionViewWillEnter();

    expect(loadingController.create).toHaveBeenCalledWith({
      message: 'Loading volumes...'
    });

    await loadingController.create.calls.mostRecent().returnValue;
    await loadingElement.present.calls.mostRecent().returnValue;
    tick();
    await volumesService.listPublishers.calls.mostRecent().returnValue.toPromise();

    expect(loadingElement.dismiss).toHaveBeenCalled();
  }));

  describe('on loading error', () => {

    beforeEach(() => {
      volumesService.listPublishers.and.returnValue(throwError(''));
    });

    it('dismisses loading feedback', <any>fakeAsync(async () => {
      loadingElement.dismiss.calls.reset();
      component.ionViewWillEnter();

      expect(loadingController.create).toHaveBeenCalledWith({
        message: 'Loading volumes...'
      });

      await loadingController.create.calls.mostRecent().returnValue;
      await loadingElement.present.calls.mostRecent().returnValue;
      tick();
      await new Promise(resolve =>
        volumesService.listPublishers.calls.mostRecent().returnValue.toPromise().catch(resolve));

      expect(loadingElement.dismiss).toHaveBeenCalled();
    }));
  });

  describe('#filter', () => {

    it('filters the publishers by series', () => {
      expect(component.publishers.length).toBe(5);
      component.filter('Fath');
      expect(component.publishers.length).toBe(1);
      component.filter('W');
      expect(component.publishers.length).toBe(3);
    });
  });
});
