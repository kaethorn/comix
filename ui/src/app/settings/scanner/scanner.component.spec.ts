import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ComicDatabaseService } from 'src/app/comic-database.service';
import { ComicsService } from 'src/app/comics.service';
import { ScannerComponent } from 'src/app/settings/scanner/scanner.component';
import { SettingsPageModule } from 'src/app/settings/settings.module';
import { StatsService } from 'src/app/stats.service';
import { ComicDatabaseServiceMocks } from 'src/testing/comic-database.service.mocks';
import { ComicFixtures } from 'src/testing/comic.fixtures';
import { ComicsServiceMocks } from 'src/testing/comics.service.mocks';
import { StatsServiceMocks } from 'src/testing/stats.service.mocks';

let component: ScannerComponent;
let fixture: ComponentFixture<ScannerComponent>;
let comicsService: jasmine.SpyObj<ComicsService>;
let statsService: jasmine.SpyObj<StatsService>;
let comicDatabaseService: jasmine.SpyObj<ComicDatabaseService>;

describe('ScannerComponent', () => {

  beforeEach(() => {
    comicsService = ComicsServiceMocks.comicsService;
    statsService = StatsServiceMocks.statsService;
    comicDatabaseService = ComicDatabaseServiceMocks.comicDatabaseService;

    TestBed.configureTestingModule({
      imports: [
        SettingsPageModule,
        RouterTestingModule
      ],
      providers: [{
        provide: StatsService, useValue: statsService
      }, {
        provide: ComicsService, useValue: comicsService
      }, {
        provide: ComicDatabaseService, useValue: comicDatabaseService
      }]
    });
    fixture = TestBed.createComponent(ScannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('#scan', () => {

    beforeEach(() => {
      spyOn(EventSource.prototype, 'close');
      spyOn(component.scanned, 'emit');
      component.scan();
    });

    describe('on the `start` event', () => {

      beforeEach(() => {
        component.scanProgress?.dispatchEvent(new MessageEvent('START'));
      });

      it('reports counting files', () => {
        expect(component.indeterminate).toEqual('Counting files');
      });
    });

    describe('on the `total` event', () => {

      beforeEach(() => {
        component.scanProgress?.dispatchEvent(new MessageEvent('TOTAL', { data: 59 }));
      });

      it('updates the amount of files to scan', () => {
        expect(component.indeterminate).toBeNull();
        expect(component.total).toBe(59);
      });
    });

    describe('on the `current-file` event', () => {

      beforeEach(() => {
        component.scanProgress?.dispatchEvent(new MessageEvent('CURRENT_FILE', {
          data: '5.cbz'
        }));
      });

      it('updates the current file and file counter', () => {
        expect(component.file).toEqual('5.cbz');
        expect(component.counter).toBe(1);
      });
    });

    describe('on the `cleanUp` event', () => {

      beforeEach(() => {
        component.scanProgress?.dispatchEvent(new MessageEvent('CLEAN_UP'));
      });

      it('resets counters and reports cleaning up', () => {
        expect(component.counter).toBe(0);
        expect(component.total).toBe(0);
        expect(component.indeterminate).toEqual('Cleaning up');
      });
    });

    describe('on the `association` event', () => {

      beforeEach(() => {
        component.scanProgress?.dispatchEvent(new MessageEvent('ASSOCIATION'));
      });

      it('reports associating files', () => {
        expect(component.indeterminate).toEqual('Bundling volumes');
      });
    });

    describe('on the `scan-issue` event', () => {

      beforeEach(() => {
        (EventSource.prototype.close as jasmine.Spy).calls.reset();
      });

      it('receives a scanning issue', () => {
        component.scanProgress?.dispatchEvent(new MessageEvent('SCAN_ISSUE', {
          data: JSON.stringify(ComicFixtures.scannerIssueFixable)
        }));
        expect(EventSource.prototype.close).not.toHaveBeenCalled();
        expect(component.issues.length).toBe(1);
        expect(component.issues[0].message).toEqual(ComicFixtures.scannerIssueFixable.message);
      });

      it('closes the source when no data was received', () => {
        component.scanProgress?.dispatchEvent(new MessageEvent('SCAN_ISSUE'));
        expect(EventSource.prototype.close).toHaveBeenCalled();
        expect(component.issues.length).toBe(0);
      });
    });

    describe('on the `done` event', () => {

      beforeEach(() => {
        component.scanProgress?.dispatchEvent(new MessageEvent('DONE'));
      });

      it('wraps up the scan', () => {
        expect(component.indeterminate).toBeNull();
        expect(component.scanned.emit).toHaveBeenCalledWith(true);
        expect(statsService.get).toHaveBeenCalledWith();
        expect(comicsService.listComicsWithErrors).toHaveBeenCalledWith();
        expect(EventSource.prototype.close).toHaveBeenCalled();
      });
    });

    describe('on error', () => {

      beforeEach(() => {
        if (component.scanProgress?.onerror) {
          component.scanProgress.onerror(new Event('error'));
        }
      });

      it('closes the scan', () => {
        expect(EventSource.prototype.close).toHaveBeenCalled();
        expect(component.scanProgress).toBeNull();
      });
    });
  });

  describe('#deleteComics', () => {

    it('deletes all comics', () => {
      component.deleteComics();
      expect(comicsService.deleteComics).toHaveBeenCalledWith();
    });

    describe('on success', () => {

      it('updates status and comics with errors', async () => {
        component.deleteComics();
        await comicsService.deleteComics.calls.mostRecent().returnValue.toPromise();

        expect(statsService.get).toHaveBeenCalledWith();
        expect(comicsService.listComicsWithErrors).toHaveBeenCalledWith();
      });
    });
  });

  describe('#deleteProgress', () => {

    it('deletes all progress', () => {
      component.deleteProgress();
      expect(comicsService.deleteProgress).toHaveBeenCalledWith();
    });

    describe('on success', () => {

      it('updates status and comics with errors', async () => {
        component.deleteProgress();
        await comicsService.deleteProgress.calls.mostRecent().returnValue.toPromise();

        expect(statsService.get).toHaveBeenCalledWith();
        expect(comicsService.listComicsWithErrors).toHaveBeenCalledWith();
      });
    });
  });

  describe('#deleteProgressForCurrentUser', () => {

    it('deletes all progress for the current user', () => {
      component.deleteProgressForCurrentUser();
      expect(comicsService.deleteProgressForCurrentUser).toHaveBeenCalledWith();
    });

    describe('on success', () => {

      it('updates status and comics with errors', async () => {
        component.deleteProgressForCurrentUser();
        await comicsService.deleteProgressForCurrentUser.calls.mostRecent().returnValue.toPromise();

        expect(statsService.get).toHaveBeenCalledWith();
        expect(comicsService.listComicsWithErrors).toHaveBeenCalledWith();
      });
    });
  });

  describe('#bundleVolumes', () => {

    it('associates comics', () => {
      component.bundleVolumes();
      expect(comicsService.bundleVolumes).toHaveBeenCalled();
    });
  });

  describe('#deleteCachedComics', () => {

    beforeEach(() => {
      component.cachedComicsCount = 5;
    });

    it('deletes comics cached in the browser and updates the count', async () => {
      component.deleteCachedComics();

      expect(comicDatabaseService.deleteAll).toHaveBeenCalled();
      await comicDatabaseService.deleteAll.calls.mostRecent().returnValue;

      expect(comicDatabaseService.getComics).toHaveBeenCalled();
      await comicDatabaseService.getComics.calls.mostRecent().returnValue;

      expect(component.cachedComicsCount).toBe(0);
    });
  });
});
