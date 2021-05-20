import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ComicsService } from 'src/app/comics.service';
import { ComicFixtures } from 'src/testing/comic.fixtures';
import { ComicHttpMocks } from 'src/testing/comic.http.mocks';

let service: ComicsService;
let httpMock: HttpTestingController;

describe('ComicsService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ]
    });
    service = TestBed.inject(ComicsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('gracefully handles a missing HATEOAS namespace', () => {
    service.listComicsWithErrors().subscribe();
    const req = httpMock.expectOne('/api/queue');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  describe('#list', () => {

    it('lists all comics', () => {
      service.list().subscribe(comics => {
        expect(comics.length).toBe(2);
        expect(comics[0].id).toEqual('1');
        expect(comics[0].path).toEqual('/batman 1.cbz');
        expect(comics[1].id).toEqual('2');
        expect(comics[1].path).toEqual('/batman 2.cbz');
      });

      const req = httpMock.expectOne('/api/comics/search/findAllByOrderByPublisherAscSeriesAscVolumeAscPositionAsc');
      expect(req.request.method).toBe('GET');
      req.flush(ComicHttpMocks.comics);
    });
  });

  describe('#listComicsWithErrors', () => {

    it('fetches all comics containing scan errors', () => {
      service.listComicsWithErrors().subscribe(comics => {
        expect(comics.length).toBe(2);
      });

      const req = httpMock.expectOne('/api/queue');
      expect(req.request.method).toBe('GET');
      req.flush(ComicHttpMocks.comics);
    });
  });

  describe('#listComicsWithoutErrors', () => {

    it('fetches all comics not containing scan errors', () => {
      service.listComicsWithoutErrors('DC Comics', 'Batman', '1940').subscribe(comics => {
        expect(comics.length).toBe(2);
      });

      const req = httpMock.expectOne('/api/queue/valid?'
            + 'publisher=DC%20Comics&series=Batman&volume=1940');
      expect(req.request.method).toBe('GET');
      req.flush(ComicHttpMocks.comics);
    });
  });

  describe('#listByVolume', () => {

    it('lists comics for the given volume', () => {
      service.listByVolume('DC Comics', 'Batman', '1940').subscribe(comics => {
        expect(comics.length).toBe(2);
        expect(comics[0].id).toEqual('1');
        expect(comics[0].path).toEqual('/batman 1.cbz');
        expect(comics[1].id).toEqual('2');
        expect(comics[1].path).toEqual('/batman 2.cbz');
      });

      const req = httpMock
        .expectOne('/api/comics/search/findAllByPublisherAndSeriesAndVolumeOrderByPosition?'
            + 'publisher=DC%20Comics&series=Batman&volume=1940');
      expect(req.request.method).toBe('GET');
      req.flush(ComicHttpMocks.comics);
    });
  });

  describe('#get', () => {

    it('fetches the given comic by ID', () => {
      service.get('923').subscribe(comic => {
        expect(comic.id).toBe('923');
      });

      const req = httpMock.expectOne('/api/comics/923');
      expect(req.request.method).toBe('GET');
      req.flush(ComicHttpMocks.comic);
    });
  });

  describe('#getLastUnreadByVolume', () => {

    it('retrieves the first issue in the current volume that has not been completed', () => {
      service.getLastUnreadByVolume('DC Comics', 'Batman', '1940').subscribe(comic => {
        expect(comic.id).toEqual('923');
        expect(comic.path).toEqual('/Batgirl 001 (2000).cbz');
      });

      const req = httpMock
        .expectOne('/api/comics/search/findLastReadForVolume?'
            + 'publisher=DC%20Comics&series=Batman&volume=1940');
      expect(req.request.method).toBe('GET');
      req.flush(ComicHttpMocks.comic);
    });
  });

  describe('#getFirstByVolume', () => {

    it('retrieves the first issue in the given volume', () => {
      service.getFirstByVolume('DC Comics', 'Batman', '1940').subscribe(comic => {
        expect(comic.id).toEqual('923');
        expect(comic.path).toEqual('/Batgirl 001 (2000).cbz');
      });

      const req = httpMock
        .expectOne('/api/comics/search/findFirstByPublisherAndSeriesAndVolumeOrderByPosition?'
            + 'publisher=DC%20Comics&series=Batman&volume=1940');
      expect(req.request.method).toBe('GET');
      req.flush(ComicHttpMocks.comic);
    });
  });

  describe('#listLastReadByVolume', () => {

    it('lists all bookmarks', () => {
      service.listLastReadByVolume().subscribe(comics => {
        expect(comics.length).toBe(2);
      });

      const req = httpMock.expectOne('/api/comics/search/findAllLastReadPerVolume');
      expect(req.request.method).toBe('GET');
      req.flush(ComicHttpMocks.comics);
    });
  });

  describe('#update', () => {

    it('saves the comic', () => {
      service.update(ComicFixtures.comic).subscribe(comic => {
        expect(comic.id).toEqual(ComicFixtures.comic.id);
      });

      const req = httpMock.expectOne('/api/comics');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(ComicFixtures.comic);
      req.flush(ComicHttpMocks.comic);
    });
  });

  describe('#updateProgress', () => {

    it('saves the progress for a given comic', () => {
      service.updateProgress(ComicFixtures.comic).subscribe(comic => {
        expect(comic.id).toEqual(ComicFixtures.comic.id);
      });

      const req = httpMock.expectOne('/api/comics/progress');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(ComicFixtures.comic);
      req.flush(ComicHttpMocks.comic);
    });
  });

  describe('#scrape', () => {

    it('triggers a scrape for the given comic', () => {
      service.scrape(ComicFixtures.comic).subscribe(comic => {
        expect(comic.id).toEqual(ComicFixtures.comic.id);
      });

      const req = httpMock.expectOne('/api/comics/scrape');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(ComicFixtures.comic);
      req.flush(ComicHttpMocks.comic);
    });
  });

  describe('#markAsRead', () => {

    it('marks the given comic as read', () => {
      service.markAsRead(ComicFixtures.comic).subscribe(comic => {
        expect(comic.id).toEqual(ComicFixtures.comic.id);
      });

      const req = httpMock.expectOne('/api/comics/markAsRead');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(ComicFixtures.comic);
      req.flush(ComicHttpMocks.comic);
    });
  });

  describe('#markAsUnread', () => {

    it('marks the given comic as unread', () => {
      service.markAsUnread(ComicFixtures.comic).subscribe(comic => {
        expect(comic.id).toEqual(ComicFixtures.comic.id);
      });

      const req = httpMock.expectOne('/api/comics/markAsUnread');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(ComicFixtures.comic);
      req.flush(ComicHttpMocks.comic);
    });
  });

  describe('#deleteComics', () => {

    it('removes all comics', () => {
      service.deleteComics().subscribe();

      const req = httpMock.expectOne('/api/comics');
      expect(req.request.method).toBe('DELETE');
      req.flush('');
    });
  });

  describe('#deleteProgress', () => {

    it('removes all progress', () => {
      service.deleteProgress().subscribe();

      const req = httpMock.expectOne('/api/progress');
      expect(req.request.method).toBe('DELETE');
      req.flush('');
    });
  });

  describe('#deleteProgressForCurrentUser', () => {

    it('removes progress for the current user', () => {
      service.deleteProgressForCurrentUser().subscribe();

      const req = httpMock.expectOne('/api/progress/me');
      expect(req.request.method).toBe('DELETE');
      req.flush('');
    });
  });

  describe('#deletePage', () => {

    it('deletes the given page from the archive', () => {
      service.deletePage(ComicFixtures.comic, '/1.png').subscribe(comic => {
        expect(comic.id).toEqual(ComicFixtures.comic.id);
      });

      const req = httpMock.expectOne(`/api/comics/${ ComicFixtures.comic.id }/page?path=/1.png`);
      expect(req.request.method).toBe('DELETE');
      req.flush(ComicHttpMocks.comic);
    });
  });

  describe('#bundleVolumes', () => {

    it('associates all comics', () => {
      service.bundleVolumes().subscribe();

      const req = httpMock.expectOne('/api/comics/bundle');
      expect(req.request.method).toBe('PUT');
      req.flush('');
    });
  });

  describe('#getPage', () => {

    it('downloads the given page', () => {
      service.getPage(ComicFixtures.comic.id, 4).subscribe(blob => {
        expect(blob.size).toBe(0);
      });

      const req = httpMock.expectOne(`/api/read/${ ComicFixtures.comic.id }/4`);
      expect(req.request.method).toBe('GET');
      req.flush(new Blob());
    });
  });

  describe('#fixIssue', () => {

    it('fixes an item from the queue', () => {
      service.fixIssue(ComicFixtures.comic, ComicFixtures.scannerIssueFixable).subscribe(comic => {
        expect(comic.id).toEqual(ComicFixtures.comic.id);
      });

      const req = httpMock.expectOne(`/api/queue/fix/${ ComicFixtures.scannerIssueFixable.type }`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(ComicFixtures.comic);
      req.flush(ComicHttpMocks.comic);
    });
  });
});
