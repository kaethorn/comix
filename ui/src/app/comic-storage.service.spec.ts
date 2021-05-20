import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';

import { Comic } from 'src/app/comic';
import { ComicDatabaseService } from 'src/app/comic-database.service';
import { ComicStorageService } from 'src/app/comic-storage.service';
import { ComicsService } from 'src/app/comics.service';
import { QueueService } from 'src/app/queue.service';
import { ThumbnailsService } from 'src/app/thumbnails.service';
import { ComicDatabaseServiceMocks } from 'src/testing/comic-database.service.mocks';
import { ComicFixtures } from 'src/testing/comic.fixtures';
import { ComicsServiceMocks } from 'src/testing/comics.service.mocks';
import { QueueServiceMocks } from 'src/testing/queue.service.mocks';
import { ThumbnailsServiceMocks } from 'src/testing/thumbnails.service.mocks';

let service: ComicStorageService;
let comicDatabaseService: jasmine.SpyObj<ComicDatabaseService>;
let comicsService: jasmine.SpyObj<ComicsService>;
let queueService: jasmine.SpyObj<QueueService>;
let thumbnailsService: jasmine.SpyObj<ThumbnailsService>;

describe('ComicStorageService', () => {

  beforeEach(() => {
    comicDatabaseService = ComicDatabaseServiceMocks.comicDatabaseService;
    comicsService = ComicsServiceMocks.comicsService;
    queueService = QueueServiceMocks.queueService;
    thumbnailsService = ThumbnailsServiceMocks.thumbnailsService;

    TestBed.configureTestingModule({
      providers: [{
        provide: ComicsService, useValue: comicsService
      }, {
        provide: ComicDatabaseService, useValue: comicDatabaseService
      }, {
        provide: ThumbnailsService, useValue: thumbnailsService
      }, {
        provide: QueueService, useValue: queueService
      }]
    });
    service = TestBed.inject(ComicStorageService);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('#get', () => {

    it('fetches the comic from the cache', async () => {
      const comic: Comic = await service.get('923');
      expect(comicDatabaseService.getComic).toHaveBeenCalledWith('923');
      expect(comicsService.get).not.toHaveBeenCalled();
      expect(comic.series).toEqual('Batman');
    });

    describe('when not cached', () => {

      beforeEach(() => {
        comicDatabaseService.getComic.and.rejectWith(null);
      });

      it('fetches the comic from the server', async () => {
        const comic: Comic = await service.get('923');
        expect(comicDatabaseService.getComic).toHaveBeenCalledWith('923');
        expect(comicsService.get).toHaveBeenCalledWith('923');
        expect(comic.series).toEqual('Batman');
      });

      describe('on error', () => {

        beforeEach(() => {
          comicsService.get.and.returnValue(throwError(''));
        });

        it('rejects', done => {
          service.get('923').catch(() => {
            expect(comicDatabaseService.getComic).toHaveBeenCalledWith('923');
            expect(comicsService.get).toHaveBeenCalledWith('923');
            done();
          });
        });
      });
    });
  });

  describe('#saveProgress', () => {

    it('saves the current comic progress locally and on the server', async () => {
      expect(ComicFixtures.comic.lastRead).toBeUndefined();
      await service.saveProgress(ComicFixtures.comic);

      expect(comicsService.updateProgress).toHaveBeenCalled();
      expect(comicDatabaseService.save).toHaveBeenCalled();

      const comicToBeSaved: Comic = comicsService.updateProgress.calls.mostRecent().args[0];
      expect(comicToBeSaved.lastRead).toBeDefined();
      expect(comicToBeSaved.read).toBeUndefined();
      expect(comicDatabaseService.save.calls.mostRecent().args[0]).toEqual(comicToBeSaved);
    });

    describe('when on the last page', () => {

      it('sets the read flag', async () => {
        await service.saveProgress(Object.assign(ComicFixtures.comic, { currentPage: 5 }));

        expect(comicsService.updateProgress).toHaveBeenCalled();
        expect(comicDatabaseService.save).toHaveBeenCalled();

        const comicToBeSaved: Comic = comicsService.updateProgress.calls.mostRecent().args[0];
        expect(comicToBeSaved.lastRead).toBeDefined();
        expect(comicToBeSaved.read).toBeTrue();
        expect(comicDatabaseService.save.calls.mostRecent().args[0]).toEqual(comicToBeSaved);
      });
    });

    describe('when not cached', () => {

      beforeEach(() => {
        comicDatabaseService.isStored.and.resolveTo(false);
      });

      it('saves the progress only on the server', async () => {
        await service.saveProgress(ComicFixtures.comic);
        expect(comicsService.updateProgress).toHaveBeenCalled();
        expect(comicDatabaseService.save).not.toHaveBeenCalled();
      });
    });

    describe('on success', () => {

      it('processes the queue', async () => {
        await service.saveProgress(ComicFixtures.comic);
        await comicsService.updateProgress.calls.mostRecent().returnValue.toPromise();
        expect(queueService.process).toHaveBeenCalled();
        expect(queueService.add).not.toHaveBeenCalled();
      });
    });

    describe('on error', () => {

      beforeEach(() => {
        comicsService.updateProgress.and.returnValue(throwError(''));
      });

      it('add the comic the offline queue', async () => {
        await service.saveProgress(ComicFixtures.comic);
        await new Promise(resolve =>
          comicsService.updateProgress.calls.mostRecent().returnValue.toPromise().catch(resolve));
        expect(queueService.process).not.toHaveBeenCalled();
        expect(queueService.add).toHaveBeenCalled();
      });
    });
  });

  describe('#getPageUrl', () => {

    describe('when cached', () => {

      it('returns the URL from the cache', async () => {
        const URL = await service.getPageUrl('923', 2);
        expect(URL).toEqual('blob:http://localhost:4200/ed2dfdaa-b9b5-4e1a-b9af-28cbb34c4e4d');
        expect(comicDatabaseService.getImageUrl).toHaveBeenCalledWith('923', 2);
      });
    });

    describe('when not cached', () => {

      beforeEach(() => {
        comicDatabaseService.isStored.and.resolveTo(false);
      });

      it('returns the URL from the server', async () => {
        const URL = await service.getPageUrl('923', 2);
        expect(URL).toEqual('/api/read/923/2');
        expect(comicDatabaseService.getImageUrl).not.toHaveBeenCalled();
      });
    });
  });

  describe('#saveIfStored', () => {

    describe('when cached', () => {

      it('saves the comic locally', async () => {
        await service.saveIfStored(ComicFixtures.comic);
        expect(comicDatabaseService.save).toHaveBeenCalledWith(ComicFixtures.comic);
      });
    });

    describe('when not cached', () => {

      beforeEach(() => {
        comicDatabaseService.isStored.and.resolveTo(false);
      });

      it('returns the URL from the server', async () => {
        await service.saveIfStored(ComicFixtures.comic);
        expect(comicDatabaseService.save).not.toHaveBeenCalled();
      });
    });
  });

  describe('#getBookmarks', () => {

    describe('when online', () => {

      it('processes the queue', async () => {
        await service.getBookmarks();
        expect(queueService.process).toHaveBeenCalled();
      });

      describe('on error', () => {

        beforeEach(() => {
          queueService.process.and.returnValue(throwError(''));
        });

        it('returns all comics from the first request', async () => {
          const comics: Comic[] = await service.getBookmarks();
          expect(comics.length).toBe(8);
          expect(comicsService.listLastReadByVolume).toHaveBeenCalledTimes(1);
        });
      });

      describe('on success', () => {

        it('returns all comics from the a second request', async () => {
          const comics: Comic[] = await service.getBookmarks();
          expect(comics.length).toBe(8);
          expect(comicsService.listLastReadByVolume).toHaveBeenCalledTimes(2);
        });
      });
    });

    describe('when offline', () => {

      beforeEach(() => {
        comicsService.listLastReadByVolume.and.returnValue(throwError('Offline'));
      });

      describe('with synced comics', () => {

        beforeEach(() => {
          comicDatabaseService.getComics.and.resolveTo(ComicFixtures.volumesInProgress);
        });

        it('filters offline comics', async () => {
          const comics = await service.getBookmarks();
          expect(comics.length).toBe(2);
          expect(comics[0].id).toEqual('13');
          expect(comics[1].id).toEqual('22');
        });
      });

      describe('with unsorted comics', () => {

        beforeEach(() => {
          comicDatabaseService.getComics.and.resolveTo([
            ComicFixtures.volume[5],
            ComicFixtures.volume[2],
            ComicFixtures.volume[4],
            ComicFixtures.volume[1],
            ComicFixtures.volume[0],
            ComicFixtures.volume2[3],
            ComicFixtures.volume2[1],
            ComicFixtures.volume2[2]
          ]);
        });

        it('sorts by position', async () => {
          const comics = await service.getBookmarks();
          expect(comics.length).toBe(2);
          expect(comics[0].id).toEqual('11');
          expect(comics[1].id).toEqual('22');
        });
      });

      describe('without synced comics', () => {

        beforeEach(() => {
          comicDatabaseService.getComics.and.resolveTo([]);
        });

        it('returns no comics at all', async () => {
          const comics = await service.getBookmarks();
          expect(comics.length).toBe(0);
        });
      });

      describe('with an error', () => {

        beforeEach(() => {
          comicDatabaseService.getComics.and.rejectWith(null);
        });

        it('rejects', done => {
          service.getBookmarks().catch(() => {
            expect(comicsService.listLastReadByVolume).toHaveBeenCalledTimes(1);
            expect(comicDatabaseService.getComics).toHaveBeenCalled();
            done();
          });
        });
      });
    });
  });

  describe('#store', () => {

    it('stores the given comic', async () => {
      await service.store(ComicFixtures.volume[3]);
      expect(comicDatabaseService.store).toHaveBeenCalledTimes(1);
      expect(comicDatabaseService.store).toHaveBeenCalledWith(ComicFixtures.volume[3]);
    });
  });

  describe('#storeSurrounding', () => {

    beforeEach(() => {
      spyOn(service, 'get').and.callFake((comicId: string) =>
        Promise.resolve(ComicFixtures.volume.find(comic => comic.id === comicId))
      );
      comicDatabaseService.getComics.and.resolveTo(ComicFixtures.volume.slice(1, 5));
    });

    it('stores the previous comic', async () => {
      // Given a volume of 8 comics, where no. 2 is the cache reference:
      // 0. uncached
      // 1. cached
      // 2. cached
      // 3. cached
      // 4. cached
      // 5. cached
      // 6. uncached
      // 7. uncached
      //
      // Calling this method on no. 3 will result in the following scenario:
      // 0. uncached
      // 1. uncached
      // 2. cached
      // 3. cached
      // 4. cached
      // 5. cached
      // 6. cached
      // 7. uncached

      await service.storeSurrounding(ComicFixtures.volume[3].id);
      expect(comicDatabaseService.store).toHaveBeenCalledTimes(5);
      expect(comicDatabaseService.store).toHaveBeenCalledWith(ComicFixtures.volume[2]);
      expect(comicDatabaseService.store).toHaveBeenCalledWith(ComicFixtures.volume[3]);
      expect(comicDatabaseService.store).toHaveBeenCalledWith(ComicFixtures.volume[4]);
      expect(comicDatabaseService.store).toHaveBeenCalledWith(ComicFixtures.volume[5]);
      expect(comicDatabaseService.store).toHaveBeenCalledWith(ComicFixtures.volume[6]);

      expect(comicDatabaseService.delete).toHaveBeenCalledTimes(1);
      expect(comicDatabaseService.delete).toHaveBeenCalledWith(ComicFixtures.volume[1]);
    });

    describe('when at the end of a volume', () => {

      it('only stores until the end of the volume', async () => {
        await service.storeSurrounding(ComicFixtures.volume[6].id);
        expect(comicDatabaseService.store).toHaveBeenCalledTimes(3);
        expect(comicDatabaseService.store).toHaveBeenCalledWith(ComicFixtures.volume[5]);
        expect(comicDatabaseService.store).toHaveBeenCalledWith(ComicFixtures.volume[6]);
        expect(comicDatabaseService.store).toHaveBeenCalledWith(ComicFixtures.volume[7]);

        expect(comicDatabaseService.delete).toHaveBeenCalledTimes(4);
        expect(comicDatabaseService.delete).toHaveBeenCalledWith(ComicFixtures.volume[1]);
        expect(comicDatabaseService.delete).toHaveBeenCalledWith(ComicFixtures.volume[2]);
        expect(comicDatabaseService.delete).toHaveBeenCalledWith(ComicFixtures.volume[3]);
        expect(comicDatabaseService.delete).toHaveBeenCalledWith(ComicFixtures.volume[4]);
      });
    });

    describe('when at the beginning of a volume', () => {

      it('only stores until the end of the volume', async () => {
        await service.storeSurrounding(ComicFixtures.volume[0].id);
        expect(comicDatabaseService.store).toHaveBeenCalledTimes(4);
        expect(comicDatabaseService.store).toHaveBeenCalledWith(ComicFixtures.volume[0]);
        expect(comicDatabaseService.store).toHaveBeenCalledWith(ComicFixtures.volume[1]);
        expect(comicDatabaseService.store).toHaveBeenCalledWith(ComicFixtures.volume[2]);
        expect(comicDatabaseService.store).toHaveBeenCalledWith(ComicFixtures.volume[3]);

        expect(comicDatabaseService.delete).toHaveBeenCalledTimes(1);
        expect(comicDatabaseService.delete).toHaveBeenCalledWith(ComicFixtures.volume[4]);
      });
    });
  });

  describe('#deleteVolume', () => {

    beforeEach(() => {
      comicDatabaseService.getComics.and.resolveTo(ComicFixtures.volume);
    });

    it('removes all local comic for the given volume', async () => {
      await service.deleteVolume(ComicFixtures.comic);
      expect(comicDatabaseService.delete).toHaveBeenCalledTimes(8);
    });
  });

  describe('#getFrontCoverThumbnail', () => {

    describe('when cached', () => {

      it('retrieves the local thumbnail', async () => {
        const URL = await service.getFrontCoverThumbnail('923');
        expect((URL as any).changingThisBreaksApplicationSecurity)
          .toEqual('blob:http://localhost:4200/ed2dfdaa-b9b5-4e1a-b9af-28cbb34c4e4d');
        expect(comicDatabaseService.getImageUrl).toHaveBeenCalledWith('923', 0);
      });
    });

    describe('when not cached', () => {

      beforeEach(() => {
        comicDatabaseService.getImageUrl.and.rejectWith(null);
      });

      it('retrieves the thumbnail from the server', async () => {
        const URL = await service.getFrontCoverThumbnail('923');
        expect((URL as any).changingThisBreaksApplicationSecurity)
          .toEqual('data:image/jpeg;base64,9312321');
        expect(comicDatabaseService.getImageUrl).toHaveBeenCalledWith('923', 0);
      });
    });
  });

  describe('#getBackCoverThumbnail', () => {

    describe('when cached', () => {

      it('retrieves the local thumbnail', async () => {
        const URL = await service.getBackCoverThumbnail('923');
        expect((URL as any).changingThisBreaksApplicationSecurity)
          .toEqual('blob:http://localhost:4200/ed2dfdaa-b9b5-4e1a-b9af-28cbb34c4e4d');
        expect(comicDatabaseService.getImageUrl).toHaveBeenCalledWith('923', 4);
      });
    });

    describe('when not cached', () => {

      beforeEach(() => {
        comicDatabaseService.getImageUrl.and.rejectWith(null);
      });

      it('retrieves the thumbnail from the server', async () => {
        const URL = await service.getBackCoverThumbnail('923');
        expect((URL as any).changingThisBreaksApplicationSecurity)
          .toEqual('data:image/jpeg;base64,9312321');
        expect(comicDatabaseService.getImageUrl).toHaveBeenCalledWith('923', 4);
      });
    });
  });
});
