import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LoadingController } from '@ionic/angular';
import { throwError } from 'rxjs';

import { LibraryPageModule } from 'src/app/library/library.module';
import { SeriesPage } from 'src/app/library/series/series.page';
import { VolumesService } from 'src/app/volumes.service';
import { LoadingControllerMocks } from 'src/testing/loading.controller.mocks';
import { VolumesServiceMocks } from 'src/testing/volumes.service.mocks';

let component: SeriesPage;
let fixture: ComponentFixture<SeriesPage>;
let loadingController: jasmine.SpyObj<LoadingController>;
let loadingElement: jasmine.SpyObj<HTMLIonLoadingElement>;
let volumesService: jasmine.SpyObj<VolumesService>;

describe('SeriesPage', () => {

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
    fixture = TestBed.createComponent(SeriesPage);
    component = fixture.componentInstance;
    component.ionViewDidEnter();

    await loadingController.create.calls.mostRecent().returnValue;
    await loadingElement.present.calls.mostRecent().returnValue;
    tick();
    await volumesService.listSeries.calls.mostRecent().returnValue.toPromise();

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('displays feedback while loading', <any>fakeAsync(async () => {
    loadingElement.dismiss.calls.reset();
    component.ionViewDidEnter();

    expect(loadingController.create).toHaveBeenCalledWith({
      message: 'Loading series...'
    });

    await loadingController.create.calls.mostRecent().returnValue;
    await loadingElement.present.calls.mostRecent().returnValue;
    tick();
    await volumesService.listSeries.calls.mostRecent().returnValue.toPromise();

    expect(loadingElement.dismiss).toHaveBeenCalled();
  }));

  describe('on loading error', () => {

    beforeEach(() => {
      volumesService.listSeries.and.returnValue(throwError(''));
    });

    it('dismisses loading feedback', <any>fakeAsync(async () => {
      loadingElement.dismiss.calls.reset();
      component.ionViewDidEnter();

      expect(loadingController.create).toHaveBeenCalledWith({
        message: 'Loading series...'
      });

      await loadingController.create.calls.mostRecent().returnValue;
      await loadingElement.present.calls.mostRecent().returnValue;
      tick();
      await new Promise(resolve =>
        volumesService.listSeries.calls.mostRecent().returnValue.toPromise().catch(resolve));

      expect(loadingElement.dismiss).toHaveBeenCalled();
    }));
  });

  describe('#filter', () => {

    it('filters the series by name', () => {
      expect(component.series.length).toBe(5);
      component.filter('man');
      expect(component.series.length).toBe(2);
      component.filter('Foo');
      expect(component.series.length).toBe(0);
    });
  });
});
