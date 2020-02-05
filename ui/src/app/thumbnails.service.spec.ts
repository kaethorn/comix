import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';

import { ThumbnailsService } from './thumbnails.service';
import { comic1 as comic } from '../testing/comic.fixtures';
import { thumbnail1 } from 'src/testing/thumbnail.fixtures';

describe('ThumbnailsService', () => {
  let service: ThumbnailsService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ]
    });
    service = TestBed.get(ThumbnailsService);
    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  describe('#get', () => {

    it('returns a sanitized URL', () => {
      service.get(comic.id).subscribe(thumbnail => {
        expect((thumbnail as any).changingThisBreaksApplicationSecurity).toContain('abcedf1234');
      });
      const req = httpMock.expectOne(`api/thumbnails/${comic.id}`);
      expect(req.request.method).toBe('GET');
      req.flush(thumbnail1);
    });
  });
});