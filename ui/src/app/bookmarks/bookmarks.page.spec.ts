import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PopoverController, ToastController, LoadingController } from '@ionic/angular';

import { BookmarksPageModule } from 'src/app/bookmarks/bookmarks.module';
import { BookmarksPage } from 'src/app/bookmarks/bookmarks.page';
import { ComicDatabaseService } from 'src/app/comic-database.service';
import { ComicStorageService } from 'src/app/comic-storage.service';
import { ComicsService } from 'src/app/comics.service';
import { ThumbnailsService } from 'src/app/thumbnails.service';
import { ComicDatabaseServiceMocks } from 'src/testing/comic-database.service.mocks';
import { ComicStorageServiceMocks } from 'src/testing/comic-storage.service.mocks';
import { ComicFixtures } from 'src/testing/comic.fixtures';
import { ComicsServiceMocks } from 'src/testing/comics.service.mocks';
import { LoadingControllerMocks } from 'src/testing/loading.controller.mocks';
import { PopoverControllerMocks } from 'src/testing/popover.controller.mocks';
import { ThumbnailsServiceMocks } from 'src/testing/thumbnails.service.mocks';
import { ToastControllerMocks } from 'src/testing/toast.controller.mocks';

let component: BookmarksPage;
let fixture: ComponentFixture<BookmarksPage>;
let comicsService: jasmine.SpyObj<ComicsService>;
let thumbnailsService: jasmine.SpyObj<ThumbnailsService>;
let toastController: jasmine.SpyObj<ToastController>;
let toastElement: jasmine.SpyObj<HTMLIonToastElement>;
let loadingController: jasmine.SpyObj<LoadingController>;
let loadingElement: jasmine.SpyObj<HTMLIonLoadingElement>;
let popoverElement: jasmine.SpyObj<HTMLIonPopoverElement>;
let popoverController: jasmine.SpyObj<PopoverController>;
let comicStorageService: jasmine.SpyObj<ComicStorageService>;
let comicDatabaseService: jasmine.SpyObj<ComicDatabaseService>;

describe('BookmarksPage', () => {

  beforeEach(<any>fakeAsync(async () => {
    loadingController = LoadingControllerMocks.loadingController;
    loadingElement = LoadingControllerMocks.loadingElementSpy;
    comicsService = ComicsServiceMocks.comicsService;
    thumbnailsService = ThumbnailsServiceMocks.thumbnailsService;
    popoverController = PopoverControllerMocks.popoverController;
    popoverElement = PopoverControllerMocks.popoverElementSpy;
    toastController = ToastControllerMocks.toastController;
    toastElement = ToastControllerMocks.toastElementSpy;
    comicStorageService = ComicStorageServiceMocks.comicStorageService;
    comicDatabaseService = ComicDatabaseServiceMocks.comicDatabaseService;

    TestBed.configureTestingModule({
      imports: [
        BookmarksPageModule,
        RouterTestingModule
      ],
      providers: [
        { provide: ComicsService, useValue: comicsService },
        { provide: ThumbnailsService, useValue: thumbnailsService },
        { provide: PopoverController, useValue: popoverController },
        { provide: LoadingController, useValue: loadingController },
        { provide: ToastController, useValue: toastController },
        { provide: ComicStorageService, useValue: comicStorageService },
        { provide: ComicDatabaseService, useValue: comicDatabaseService }
      ]
    });

    const dbService = TestBed.inject(ComicDatabaseService);
    await dbService.ready.toPromise();

    fixture = TestBed.createComponent(BookmarksPage);
    component = fixture.componentInstance;
    component.ionViewDidEnter();

    await comicDatabaseService.ready.toPromise();
    await loadingController.create.calls.mostRecent().returnValue;
    await loadingElement.present.calls.mostRecent().returnValue;
    tick();
    await comicStorageService.getBookmarks.calls.mostRecent().returnValue;

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('displays feedback while loading', <any>fakeAsync(async () => {
    loadingElement.dismiss.calls.reset();
    component.ionViewDidEnter();

    expect(loadingController.create).toHaveBeenCalledWith({
      message: 'Loading bookmarks...'
    });

    await loadingController.create.calls.mostRecent().returnValue;
    await loadingElement.present.calls.mostRecent().returnValue;
    tick();
    await comicStorageService.getBookmarks.calls.mostRecent().returnValue;

    expect(loadingElement.dismiss).toHaveBeenCalled();
  }));

  describe('on loading error', () => {

    beforeEach(() => {
      comicStorageService.getBookmarks.and.rejectWith(null);
    });

    it('dismisses loading feedback', <any>fakeAsync(async () => {
      loadingElement.dismiss.calls.reset();
      component.ionViewDidEnter();

      expect(loadingController.create).toHaveBeenCalledWith({
        message: 'Loading bookmarks...'
      });

      await loadingController.create.calls.mostRecent().returnValue;
      await loadingElement.present.calls.mostRecent().returnValue;
      tick();
      await new Promise(resolve =>
        comicStorageService.getBookmarks.calls.mostRecent().returnValue.catch(resolve));

      expect(loadingElement.dismiss).toHaveBeenCalled();
    }));
  });

  describe('#openMenu', () => {

    it('creates a popover', async () => {
      component.openMenu(new Event(''), ComicFixtures.comic);

      expect(popoverController.create).toHaveBeenCalled();
      expect(popoverController.create.calls.mostRecent().args[0].componentProps)
        .toEqual({ comic: ComicFixtures.comic });
      await popoverController.create.calls.mostRecent().returnValue;
      expect(popoverElement.present).toHaveBeenCalled();
    });
  });

  describe('#sync', () => {

    it('stores adjacent comics', () => {
      component.sync(ComicFixtures.comic);

      expect(comicStorageService.storeSurrounding).toHaveBeenCalledWith(ComicFixtures.comic.id);
    });

    describe('on success', () => {

      it('shows a success toast and updates comic status', async () => {
        component.sync(ComicFixtures.comic);
        expect(component.syncing).toBe(true);

        await comicStorageService.storeSurrounding.calls.mostRecent().returnValue;
        expect(comicDatabaseService.isStored).toHaveBeenCalledWith(ComicFixtures.comic.id);
        expect(component.syncing).toBe(false);
        expect(toastController.create).toHaveBeenCalledWith({
          duration: 3000,
          message: 'Volume cached.'
        });
        await toastController.create.calls.mostRecent().returnValue;
        expect(toastElement.present).toHaveBeenCalled();
      });
    });

    describe('on error', () => {

      beforeEach(() => {
        comicStorageService.storeSurrounding.and.rejectWith(null);
      });

      it('shows an error toast', async () => {
        component.sync(ComicFixtures.comic);
        expect(component.syncing).toBe(true);

        await new Promise(resolve => {
          comicStorageService.storeSurrounding.calls.mostRecent().returnValue.catch(resolve);
        });
        expect(component.syncing).toBe(false);
        expect(toastController.create).toHaveBeenCalledWith({
          duration: 4000,
          message: 'Error while syncing volume.'
        });
        await toastController.create.calls.mostRecent().returnValue;
        expect(toastElement.present).toHaveBeenCalled();
      });
    });
  });

  describe('#delete', () => {

    it('removes the entire volume from cache', () => {
      component.delete(ComicFixtures.comic);

      expect(comicStorageService.deleteVolume).toHaveBeenCalledWith(ComicFixtures.comic);
    });

    it('updates comic status once removed from cache', async () => {
      component.delete(ComicFixtures.comic);

      await comicStorageService.deleteVolume.calls.mostRecent().returnValue;
      expect(comicDatabaseService.isStored).toHaveBeenCalledWith(ComicFixtures.comic.id);
    });
  });
});
