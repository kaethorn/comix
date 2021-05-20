import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NavParams, PopoverController } from '@ionic/angular';

import { BookmarkActionsComponent } from 'src/app/bookmarks/bookmark-actions/bookmark-actions.component';
import { BookmarksPageModule } from 'src/app/bookmarks/bookmarks.module';
import { ComicFixtures } from 'src/testing/comic.fixtures';
import { PopoverControllerMocks } from 'src/testing/popover.controller.mocks';

let component: BookmarkActionsComponent;
let fixture: ComponentFixture<BookmarkActionsComponent>;
let navParams: NavParams;
let router: jasmine.SpyObj<Router>;
let popoverController: jasmine.SpyObj<PopoverController>;

describe('BookmarkActionsComponent', () => {

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', [ 'navigate' ]);
    popoverController = PopoverControllerMocks.popoverController;
    navParams = new NavParams({ comic: ComicFixtures.comic });

    TestBed.configureTestingModule({
      imports: [
        BookmarksPageModule,
        RouterTestingModule
      ],
      providers: [{
        provide: NavParams, useValue: navParams
      }, {
        provide: Router, useValue: router
      }, {
        provide: PopoverController, useValue: popoverController
      }]
    });
    fixture = TestBed.createComponent(BookmarkActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('#gotToVolume', () => {

    it('navigates to the issues page and closes the popover', () => {
      component.goToVolume(ComicFixtures.comic);
      expect(router.navigate).toHaveBeenCalledWith([
        '/library/publishers', ComicFixtures.comic.publisher,
        'series', ComicFixtures.comic.series,
        'volumes', ComicFixtures.comic.volume,
        'issues'
      ]);
      expect(popoverController.dismiss).toHaveBeenCalledWith();
    });
  });

  describe('#gotToLibrary', () => {

    it('navigates to the library page and closes the popover', () => {
      component.goToLibrary(ComicFixtures.comic);
      expect(router.navigate).toHaveBeenCalledWith([
        '/library/publishers',
        ComicFixtures.comic.publisher,
        'series',
        ComicFixtures.comic.series,
        'volumes'
      ]);
      expect(popoverController.dismiss).toHaveBeenCalledWith();
    });
  });
});
