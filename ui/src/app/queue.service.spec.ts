import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { Comic } from 'src/app/comic';
import { ComicDatabaseService } from 'src/app/comic-database.service';
import { ComicsService } from 'src/app/comics.service';
import { QueueService } from 'src/app/queue.service';
import { ComicDatabaseServiceMocks } from 'src/testing/comic-database.service.mocks';
import { ComicFixtures } from 'src/testing/comic.fixtures';
import { ComicsServiceMocks } from 'src/testing/comics.service.mocks';

let service: QueueService;
let comicDatabaseService: jasmine.SpyObj<ComicDatabaseService>;
let comicsService: jasmine.SpyObj<ComicsService>;

describe('QueueService', () => {

  beforeEach(() => {
    comicDatabaseService = ComicDatabaseServiceMocks.comicDatabaseService;
    comicsService = ComicsServiceMocks.comicsService;

    TestBed.configureTestingModule({
      providers: [{
        provide: ComicsService, useValue: comicsService
      }, {
        provide: ComicDatabaseService, useValue: comicDatabaseService
      }]
    });
    service = TestBed.inject(QueueService);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('#hasItems', () => {

    it('reflects the state of the internal queue', async () => {
      expect(await service.hasItems()).toBe(false);
      comicDatabaseService.getComicsBy.and.resolveTo([
        { id: 'one' } as Comic
      ]);
      expect(await service.hasItems()).toBe(true);
    });
  });

  describe('#process', () => {

    describe('without items in the queue', () => {

      it('completes', done => {
        service.process().subscribe(() => {
          expect(true).toBe(true);
        }, () => {
          expect(false).toBe(true);
          done();
        }, () => {
          expect(true).toBe(true);
          done();
        });
      });
    });

    describe('with items', () => {

      beforeEach(() => {
        comicDatabaseService.getComicsBy.and.resolveTo([
          { id: 'one' } as Comic,
          { id: 'two' } as Comic
        ]);
      });

      describe('on error', () => {

        beforeEach(() => {
          comicsService.updateProgress.and.returnValue(throwError(ComicFixtures.comic));
        });

        it('does not complete', done => {
          service.process().subscribe(() => {
          }, () => {
            expect(comicsService.updateProgress.calls.count()).toBe(1);
            done();
          });
        });
      });

      describe('on success', () => {

        it('completes', done => {
          service.process().subscribe(() => {
          }, () => {
          }, () => {
            expect(comicsService.updateProgress.calls.count()).toBe(2);
            expect(comicsService.updateProgress).toHaveBeenCalledWith({ id: 'one' } as Comic);
            expect(comicsService.updateProgress).toHaveBeenCalledWith({ id: 'two' } as Comic);
            done();
          });
        });
      });

      describe('on partial success', () => {

        beforeEach(() => {
          let index = 0;
          comicsService.updateProgress.and.callFake(() => {
            if (index > 0) {
              return throwError(ComicFixtures.comic);
            }
            index += 1;
            return of(ComicFixtures.comic);
          });
        });

        it('does not complete', done => {
          service.process().subscribe(() => {
          }, () => {
            expect(comicsService.updateProgress.calls.count()).toBe(2);
            done();
          });
        });
      });
    });
  });

  describe('#add', () => {

    it('sets the dirty flag on the comic and attempts to save the latter', async () => {
      const comic = ComicFixtures.comic;
      expect(comic.dirty).toBeUndefined();
      await service.add(comic);

      expect(comic.dirty).toBe(1);
      expect(comicDatabaseService.save).toHaveBeenCalledWith(comic);
    });
  });
});
