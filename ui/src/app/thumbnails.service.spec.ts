import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ThumbnailsService } from 'src/app/thumbnails.service';
import { ComicFixtures } from 'src/testing/comic.fixtures';
import { ThumbnailFixtures } from 'src/testing/thumbnail.fixtures';

let service: ThumbnailsService;
let httpMock: HttpTestingController;

describe('ThumbnailsService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ]
    });
    service = TestBed.inject(ThumbnailsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  describe('#getFrontCover', () => {

    it('returns a sanitized URL to the front cover', () => {
      service.getFrontCover(ComicFixtures.comic.id).subscribe(thumbnail => {
        expect((thumbnail.url as any).changingThisBreaksApplicationSecurity).toContain('abcedf1234');
      });
      const req = httpMock.expectOne(`/api/thumbnails/front-cover/${ ComicFixtures.comic.id }`);
      expect(req.request.method).toBe('GET');
      req.flush(ThumbnailFixtures.thumbnail);
    });
  });

  describe('#getBackCover', () => {

    it('returns a sanitized URL to the back cover', () => {
      service.getBackCover(ComicFixtures.comic.id).subscribe(thumbnail => {
        expect((thumbnail.url as any).changingThisBreaksApplicationSecurity).toContain('abcedf1234');
      });
      const req = httpMock.expectOne(`/api/thumbnails/back-cover/${ ComicFixtures.comic.id }`);
      expect(req.request.method).toBe('GET');
      req.flush(ThumbnailFixtures.thumbnail);
    });
  });
});
