import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';

import { ComicDatabaseService } from 'src/app/comic-database.service';
import { ComicsService } from 'src/app/comics.service';
import { IndexedDbService } from 'src/app/indexed-db.service';
import { ComicFixtures } from 'src/testing/comic.fixtures';
import { ComicsServiceMocks } from 'src/testing/comics.service.mocks';
import { IndexedDbServiceMocks } from 'src/testing/indexed-db.service.mocks';

let service: ComicDatabaseService;
let comicsService: jasmine.SpyObj<ComicsService>;
let indexedDbService: jasmine.SpyObj<IndexedDbService>;

describe('ComicDatabaseService', () => {

  beforeEach(() => {
    comicsService = ComicsServiceMocks.comicsService;
    indexedDbService = IndexedDbServiceMocks.indexedDbService;

    TestBed.configureTestingModule({
      providers: [{
        provide: ComicsService, useValue: comicsService
      }, {
        provide: IndexedDbService, useValue: indexedDbService
      }]
    });
    service = TestBed.inject(ComicDatabaseService);
  });

  describe('#constructor', () => {

    beforeEach(() => {
      TestBed.resetTestingModule();
      indexedDbService = IndexedDbServiceMocks.indexedDbService;
      TestBed.configureTestingModule({
        providers: [{
          provide: ComicsService, useValue: comicsService
        }, {
          provide: IndexedDbService, useValue: indexedDbService
        }]
      });
    });

    it('opens the DB', () => {
      service = TestBed.inject(ComicDatabaseService);
      expect(indexedDbService.open)
        .toHaveBeenCalledWith('Comics', 2, jasmine.any(Array));
    });

    describe('on success', () => {

      it('sets the ready flag', async () => {
        try {
          service = TestBed.inject(ComicDatabaseService);
          await new Promise(resolve => service.ready.subscribe(undefined, undefined, resolve as any));
        } catch (exception) {
        }
        expect(service.ready.hasError).toBeFalse();
      });
    });

    describe('on error', () => {

      beforeEach(() => {
        indexedDbService.open.and.callFake(() => {
          indexedDbService.ready.error(null);
        });
      });

      it('does not set the ready flag', async () => {
        try {
          service = TestBed.inject(ComicDatabaseService);
          await new Promise(resolve => service.ready.subscribe(undefined, resolve, undefined));
          await new Promise(resolve => setTimeout(resolve));
        } catch (exception) {
        }
        expect(service.ready.hasError).toBeTrue();
      });
    });
  });

  describe('#store', () => {

    describe('when not cached', () => {

      beforeEach(() => {
        indexedDbService.hasKey.and.resolveTo(false);
      });

      it('caches images', async () => {
        await service.store(ComicFixtures.comic);
        expect(comicsService.getPage).toHaveBeenCalledTimes(5);
        expect(indexedDbService.save).toHaveBeenCalledTimes(6);
        expect(indexedDbService.save).toHaveBeenCalledWith('Comics', ComicFixtures.comic);
        expect(indexedDbService.save).toHaveBeenCalledWith('Images', null, '923/0');
        expect(indexedDbService.save).toHaveBeenCalledWith('Images', null, '923/1');
        expect(indexedDbService.save).toHaveBeenCalledWith('Images', null, '923/2');
        expect(indexedDbService.save).toHaveBeenCalledWith('Images', null, '923/3');
        expect(indexedDbService.save).toHaveBeenCalledWith('Images', null, '923/4');
      });

      describe('on image retrieval error', () => {

        beforeEach(() => {
          comicsService.getPage.and.returnValue(throwError(''));
        });

        it('rejects', async () => {
          try {
            await service.store(ComicFixtures.comic);
            expect(false).toBeTrue();
          } catch (exception) {
            expect(true).toBeTrue();
          }
        });
      });

      describe('on image caching error', () => {

        beforeEach(() => {
          indexedDbService.save.and.rejectWith('Out of space.');
        });

        it('rejects', async () => {
          try {
            await service.store(ComicFixtures.comic);
            expect(false).toBeTrue();
          } catch (exception) {
            expect(true).toBeTrue();
          }
        });
      });
    });

    describe('when already cached', () => {

      beforeEach(() => {
        indexedDbService.hasKey.and.resolveTo(true);
      });

      it('does not cache again', async () => {
        await service.store(ComicFixtures.comic);
        expect(comicsService.getPage).not.toHaveBeenCalled();
      });
    });
  });

  describe('#delete', () => {

    it('deletes the comics and all associated images', async () => {
      await service.delete(ComicFixtures.comic);
      expect(indexedDbService.delete).toHaveBeenCalledTimes(6);
      expect(indexedDbService.delete).toHaveBeenCalledWith('Images', '923/0');
      expect(indexedDbService.delete).toHaveBeenCalledWith('Images', '923/1');
      expect(indexedDbService.delete).toHaveBeenCalledWith('Images', '923/2');
      expect(indexedDbService.delete).toHaveBeenCalledWith('Images', '923/3');
      expect(indexedDbService.delete).toHaveBeenCalledWith('Images', '923/4');
      expect(indexedDbService.delete).toHaveBeenCalledWith('Comics', '923');
    });
  });

  describe('#deleteAll', () => {

    beforeEach(() => {
      indexedDbService.getAll.and.resolveTo(ComicFixtures.volume);
    });

    it('deletes all comics and their associated images', async () => {
      await service.deleteAll();
      expect(indexedDbService.delete).toHaveBeenCalledTimes(6 * ComicFixtures.volume.length);
    });
  });

  describe('#getImageUrl', () => {

    beforeEach(() => {
      indexedDbService.get.and.resolveTo(new Blob([ '' ], { type: 'image/png' }));
    });

    it('returns a URL of the given BLOB', async () => {
      const url = await service.getImageUrl(ComicFixtures.comic.id, 3);
      expect(indexedDbService.get).toHaveBeenCalledWith('Images', '923/3');
      expect(url).toContain('blob:http');
    });
  });

  describe('#getComic', () => {

    beforeEach(() => {
      indexedDbService.get.and.resolveTo(ComicFixtures.comic);
    });

    it('returns the comic by ID', async () => {
      const comic = await service.getComic(ComicFixtures.comic.id);
      expect(comic).toEqual(ComicFixtures.comic);
    });
  });

  describe('#getComicsBy', () => {

    beforeEach(() => {
      indexedDbService.getAllBy.and.resolveTo(ComicFixtures.volume);
    });

    it('returns all matching comics', async () => {
      const comics = await service.getComicsBy('series', '1940');
      expect(comics).toEqual(ComicFixtures.volume);
      expect(indexedDbService.getAllBy).toHaveBeenCalledWith('Comics', 'series', '1940');
    });
  });

  describe('#save', () => {

    it('saves the given comic', async () => {
      await service.save(ComicFixtures.comic);
      expect(indexedDbService.save).toHaveBeenCalledWith('Comics', ComicFixtures.comic);
    });
  });
});
