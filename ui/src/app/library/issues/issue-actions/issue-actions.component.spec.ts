import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NavParams, PopoverController } from '@ionic/angular';

import { IssueActionsComponent } from 'src/app/library/issues/issue-actions/issue-actions.component';
import { LibraryPageModule } from 'src/app/library/library.module';
import { ComicFixtures } from 'src/testing/comic.fixtures';
import { PopoverControllerMocks } from 'src/testing/popover.controller.mocks';

let component: IssueActionsComponent;
let fixture: ComponentFixture<IssueActionsComponent>;
let navParams: NavParams;
let router: jasmine.SpyObj<Router>;
let popoverController: jasmine.SpyObj<PopoverController>;

describe('IssueActionsComponent', () => {

  beforeEach(() => {
    router = jasmine.createSpyObj('Router', [ 'navigate' ]);
    popoverController = PopoverControllerMocks.popoverController;
    navParams = new NavParams({ comic: ComicFixtures.comic });

    TestBed.configureTestingModule({
      imports: [
        LibraryPageModule
      ],
      providers: [{
        provide: NavParams, useValue: navParams
      }, {
        provide: Router, useValue: router
      }, {
        provide: PopoverController, useValue: popoverController
      }]
    });
    fixture = TestBed.createComponent(IssueActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('#download', () => {

    it('closes the popover', () => {
      component.download();
      expect(popoverController.dismiss).toHaveBeenCalledWith();
    });
  });

  describe('#markAsReadUntil', () => {

    it('closes the popover', () => {
      component.markAsReadUntil(ComicFixtures.comic);
      expect(popoverController.dismiss).toHaveBeenCalledWith({
        markAsReadUntil: ComicFixtures.comic
      });
    });
  });

  describe('#goToLibrary', () => {

    it('navigates to the library and closes the popover', () => {
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

  describe('#edit', () => {

    it('navigates to the edit page and closes the popover', () => {
      component.edit(ComicFixtures.comic);
      expect(router.navigate).toHaveBeenCalledWith([
        '/library/publishers', ComicFixtures.comic.publisher,
        'series', ComicFixtures.comic.series,
        'volumes', ComicFixtures.comic.volume,
        'issues', ComicFixtures.comic.id,
        'edit'
      ]);
      expect(popoverController.dismiss).toHaveBeenCalledWith();
    });
  });
});
