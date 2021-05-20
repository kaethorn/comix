import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { StatsService } from 'src/app/stats.service';
import { StatsHttpMocks } from 'src/testing/stats.http.mocks';

let service: StatsService;
let httpMock: HttpTestingController;

describe('StatsService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ]
    });
    service = TestBed.inject(StatsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  describe('#get', () => {

    it('lists all statistics', () => {
      service.get().subscribe(stats => {
        expect(stats.issues).toBe(305);
        expect(stats.publishers).toBe(3);
        expect(stats.series).toBe(5);
        expect(stats.volumes).toBe(9);
        expect(stats.users).toBe(1);
      });

      const req = httpMock.expectOne('/api/stats');
      expect(req.request.method).toBe('GET');
      req.flush(StatsHttpMocks.stats);
    });
  });
});
