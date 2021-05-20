import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastController, LoadingController } from '@ionic/angular';

import { ComicStorageService } from 'src/app/comic-storage.service';
import { ReaderPageModule } from 'src/app/reader/reader.module';
import { ReaderPage } from 'src/app/reader/reader.page';
import { ComicStorageServiceMocks } from 'src/testing/comic-storage.service.mocks';
import { ComicFixtures } from 'src/testing/comic.fixtures';
import { LoadingControllerMocks } from 'src/testing/loading.controller.mocks';
import { ToastControllerMocks } from 'src/testing/toast.controller.mocks';

let component: ReaderPage;
let fixture: ComponentFixture<ReaderPage>;
let router: jasmine.SpyObj<Router>;
let comicStorageService: jasmine.SpyObj<ComicStorageService>;
let activatedRoute: any;
let toastElement: jasmine.SpyObj<HTMLIonToastElement>;
let toastController: jasmine.SpyObj<ToastController>;
let loadingController: jasmine.SpyObj<LoadingController>;
let loadingElement: jasmine.SpyObj<HTMLIonLoadingElement>;

const clickRightSide = async (): Promise<void> => {
  fixture.debugElement.query(By.css('.pages-layer'))
    .triggerEventHandler('click', {
      clientX      : 700,
      currentTarget: { offsetWidth: 800 }
    });
  await fixture.whenStable();
  fixture.detectChanges();
};
const clickLeftSide = async (): Promise<void> => {
  fixture.debugElement.query(By.css('.pages-layer'))
    .triggerEventHandler('click', {
      clientX      : 100,
      currentTarget: { offsetWidth: 800 }
    });
  await fixture.whenStable();
  fixture.detectChanges();
};
const clickCenter = async (): Promise<void> => {
  fixture.debugElement.query(By.css('.pages-layer'))
    .triggerEventHandler('click', {
      clientX      : 500,
      currentTarget: { offsetWidth: 800 }
    });
  await fixture.whenStable();
  fixture.detectChanges();
};

describe('ReaderPage', () => {

  beforeEach(async () => {
    router = jasmine.createSpyObj('Router', [ 'navigate' ]);
    comicStorageService = ComicStorageServiceMocks.comicStorageService;
    toastController = ToastControllerMocks.toastController;
    toastElement = ToastControllerMocks.toastElementSpy;
    loadingController = LoadingControllerMocks.loadingController;
    loadingElement = LoadingControllerMocks.loadingElementSpy;
    activatedRoute = {
      snapshot: {
        params: { id: '493' },
        queryParams: {
          page: 0,
          parent: '/library/series'
        }
      }
    };

    TestBed.configureTestingModule({
      imports: [
        ReaderPageModule,
        RouterTestingModule.withRoutes([
          { component: ReaderPage, path: 'read/:id' }
        ])
      ],
      providers: [{
        provide: ComicStorageService, useValue: comicStorageService
      }, {
        provide: ActivatedRoute, useValue: activatedRoute
      }, {
        provide: Router, useValue: router
      }, {
        provide: ToastController, useValue: toastController
      }, {
        provide: LoadingController, useValue: loadingController
      }]
    });

    fixture = TestBed.createComponent(ReaderPage);
    component = fixture.componentInstance;
    component.pagesLayer = {
      nativeElement: {
        parentElement: {
          clientHeight: 2000,
          clientWidth: 1000
        }
      }
    };
    component.ionViewDidEnter();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('#constructor', () => {

    describe('without a parent', () => {

      beforeEach(async () => {
        delete activatedRoute.snapshot.queryParams.parent;
        fixture = TestBed.createComponent(ReaderPage);
        component = fixture.componentInstance;
        component.ionViewDidEnter();
        await fixture.whenStable();
        component.handleEscape();
      });

      it('falls back to the publishers page', () => {
        expect(router.navigate).toHaveBeenCalledWith([ '/library/publishers' ]);
      });
    });

    describe('with an error loading the comic', () => {

      beforeEach(async () => {
        comicStorageService.get.and.rejectWith(null);
        component.ionViewDidEnter();
        await fixture.whenStable();
      });

      it('navigates back and shows an error toast', async () => {
        await new Promise(resolve => comicStorageService.get.calls.mostRecent().returnValue.catch(resolve));
        expect(router.navigate).toHaveBeenCalledWith([ '/library/series' ]);
        expect(toastController.create).toHaveBeenCalledWith({
          duration: 4000,
          message: 'Comic book not available, please try again later.'
        });
        await toastController.create.calls.mostRecent().returnValue;
        expect(toastElement.present).toHaveBeenCalled();
      });
    });
  });

  describe('on destroy', () => {

    beforeEach(() => {
      component.ionViewDidLeave();
    });

    it('dismisses the loading screen', () => {
      expect(loadingElement.dismiss).toHaveBeenCalled();
    });
  });

  describe('navigation', () => {

    beforeEach(async () => {
      await loadingElement.present.calls.mostRecent().returnValue;
      await comicStorageService.get.calls.mostRecent().returnValue;
      await comicStorageService.store.calls.mostRecent().returnValue;
    });

    it('starts off on the first page', () => {
      expect(component.comic.id).toBe('923');
      expect(router.navigate.calls.mostRecent().args[1]?.queryParams?.page).toEqual(0);
    });

    describe('when pressing ESC', () => {

      beforeEach(async () => {
        component.handleEscape();
        await fixture.whenStable();
      });

      it('navigates back to the parent page', () => {
        expect(router.navigate).toHaveBeenCalledWith([ '/library/series' ]);
      });
    });

    describe('when pressing the left & right keys', () => {

      it('opens the next and the previous page respectively', async () => {
        component.handleRight();
        await fixture.whenStable();
        expect(router.navigate.calls.mostRecent().args[1]?.queryParams?.page).toEqual(1);

        component.handleLeft();
        await fixture.whenStable();
        expect(router.navigate.calls.mostRecent().args[1]?.queryParams?.page).toEqual(0);
      });
    });

    describe('when clicking the center', () => {

      it('shows the controls when clicking in the center', async () => {
        expect(fixture.debugElement.query(By.css('.control-layer'))).toBeNull();
        await clickCenter();
        expect(fixture.debugElement.query(By.css('.control-layer'))).not.toBeNull();
      });

      it('does not navigate', async () => {
        await fixture.whenStable();
        router.navigate.calls.reset();
        clickCenter();
        expect(router.navigate).not.toHaveBeenCalled();
      });
    });

    describe('in single page mode', () => {

      beforeEach(async () => {
        component.pagesLayer = {
          nativeElement: {
            parentElement: {
              clientHeight: 2000,
              clientWidth : 1000
            }
          }
        };
        component.ionViewDidEnter();
        await fixture.whenStable();
        fixture.detectChanges();
      });

      it('loads only the cover', () => {
        expect(fixture.debugElement.query(By.css('.pages-layer')).styles.transform)
          .toEqual('translateX(0vw)');
      });

      describe('to the next page', () => {

        beforeEach(async () => {
          await clickRightSide();
        });

        it('sets the current page and updates the route', () => {
          expect(router.navigate.calls.mostRecent().args[1]?.queryParams?.page).toEqual(1);
        });
      });

      describe('at the end of the comic', () => {

        beforeEach(async () => {
          await clickRightSide();
          await clickRightSide();
          await clickRightSide();
        });

        it('does not exceed the last page', async () => {
          expect(router.navigate.calls.mostRecent().args[1]?.queryParams?.page).toEqual(3);
          await clickRightSide();
          expect(router.navigate.calls.mostRecent().args[1]?.queryParams?.page).toEqual(4);
          await clickRightSide();
          expect(router.navigate.calls.mostRecent().args[1]?.queryParams?.page).toEqual(4);
        });
      });
    });

    describe('in side by side mode', () => {

      beforeEach(async () => {
        component.pagesLayer = {
          nativeElement: {
            parentElement: {
              clientHeight: 1000,
              clientWidth : 2000
            }
          }
        };
        component.ionViewDidEnter();
        await fixture.whenStable();
        fixture.detectChanges();
      });

      it('loads only the cover', () => {
        expect(fixture.debugElement.query(By.css('.pages-layer')).styles.transform)
          .toEqual('translateX(0vw)');
      });

      describe('to the next page', () => {

        beforeEach(async () => {
          await clickRightSide();
        });

        it('updates the route', () => {
          expect(router.navigate.calls.mostRecent().args[1]?.queryParams?.page).toEqual(2);
        });

        it('displays two pages', () => {
          expect(fixture.debugElement.query(By.css('.pages-layer')).styles.transform)
            .toEqual('translateX(-100vw)');
        });

        it('navigating back displays only the cover', async () => {
          await clickLeftSide();
          expect(fixture.debugElement.query(By.css('.pages-layer')).styles.transform)
            .toEqual('translateX(0vw)');
        });
      });

      describe('at the end of the comic', () => {

        beforeEach(async () => {
          await clickRightSide();
          await clickRightSide();
        });

        it('does not exceed the last page', async () => {
          expect(router.navigate.calls.mostRecent().args[1]?.queryParams?.page).toEqual(4);
          await clickRightSide();
          expect(router.navigate.calls.mostRecent().args[1]?.queryParams?.page).toEqual(4);
        });
      });
    });
  });

  describe('#go', () => {

    beforeEach(async () => {
      comicStorageService.get.and.resolveTo(ComicFixtures.volume[1]);
      component.ionViewDidEnter();
      await fixture.whenStable();
      await comicStorageService.get.calls.mostRecent().returnValue;
    });

    describe('with an event', () => {

      it('stops propagation', () => {
        const event: jasmine.SpyObj<MouseEvent> = jasmine.createSpyObj('Event', [ 'stopPropagation' ]);
        component.go(0, event);
        expect(event.stopPropagation).toHaveBeenCalled();
      });
    });

    describe('going back on the first page', () => {

      beforeEach(() => {
        component.go(-1);
      });

      it('opens the previous issue in the volume', () => {
        expect(router.navigate.calls.mostRecent().args[0])
          .toEqual([ '/read', ComicFixtures.volume[0].id ]);
      });
    });
  });

  describe('#openPrevious', () => {

    beforeEach(async () => {
      comicStorageService.get.and.resolveTo(ComicFixtures.volume[1]);
      component.ionViewDidEnter();
      await fixture.whenStable();
      await comicStorageService.get.calls.mostRecent().returnValue;
      await comicStorageService.get.calls.mostRecent().returnValue;
      component.openPrevious();
    });

    it('caches the volume', () => {
      expect(comicStorageService.storeSurrounding).toHaveBeenCalledWith(ComicFixtures.volume[0].id);
    });

    it('opens the previous comic in the volume', () => {
      expect(router.navigate.calls.mostRecent().args[0])
        .toEqual([ '/read', ComicFixtures.volume[0].id ]);
    });

    describe('with the showToast option', () => {

      beforeEach(() => {
        component.openPrevious({ showToast: true });
      });

      it('shows a toast', () => {
        expect(toastController.create).toHaveBeenCalledWith({
          duration: 3000,
          message: 'Opening previous issue of Batman (1940).'
        });
      });
    });
  });

  describe('#openNext', () => {

    beforeEach(async () => {
      comicStorageService.get.and.resolveTo(ComicFixtures.volume[1]);
      component.ionViewDidEnter();
      await fixture.whenStable();
      await comicStorageService.get.calls.mostRecent().returnValue;
      await comicStorageService.get.calls.mostRecent().returnValue;
      component.openNext();
    });

    it('caches the volume', () => {
      expect(comicStorageService.storeSurrounding).toHaveBeenCalledWith(ComicFixtures.volume[2].id);
    });

    it('opens the next comic in the volume', () => {
      expect(router.navigate.calls.mostRecent().args[0])
        .toEqual([ '/read', ComicFixtures.volume[2].id ]);
    });

    describe('with the showToast option', () => {

      beforeEach(() => {
        component.openNext({ showToast: true });
      });

      it('shows a toast', () => {
        expect(toastController.create).toHaveBeenCalledWith({
          duration: 3000,
          message: 'Opening next issue of Batman (1940).'
        });
      });
    });
  });

  describe('#onSwipe', () => {

    beforeEach(async () => {
      await loadingElement.present.calls.mostRecent().returnValue;
      await comicStorageService.get.calls.mostRecent().returnValue;
      await comicStorageService.store.calls.mostRecent().returnValue;
    });

    it('navigates accordingly', async () => {
      component.onSwipe(1);
      await fixture.whenStable();
      expect(router.navigate.calls.mostRecent().args[1]?.queryParams?.page).toEqual(1);

      component.onSwipe(-1);
      await fixture.whenStable();
      expect(router.navigate.calls.mostRecent().args[1]?.queryParams?.page).toEqual(0);
    });
  });
});
