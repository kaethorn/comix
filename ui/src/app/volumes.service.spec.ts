import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { VolumesService } from 'src/app/volumes.service';
import { ComicFixtures } from 'src/testing/comic.fixtures';
import { VolumeFixtures } from 'src/testing/volume.fixtures';
import { VolumeHttpMocks } from 'src/testing/volume.http.mocks';

let service: VolumesService;
let httpMock: HttpTestingController;

describe('VolumesService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ]
    });
    service = TestBed.inject(VolumesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('gracefully handles a missing HATEOAS namespace', () => {
    service.listPublishers().subscribe();
    const req = httpMock.expectOne('/api/publishers');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  describe('#listPublishers', () => {

    it('lists all publishers', () => {
      service.listPublishers().subscribe(publishers => {
        expect(publishers.length).toBe(3);
        expect(publishers[0].name).toEqual('DC Comics');
        expect(publishers[0].series?.length).toBe(2);
        expect(publishers[0].series[0].name).toEqual('Batgirl');
        expect(publishers[0].series[1].name).toEqual('Batman');
        expect(publishers[1].name).toEqual('F5 Enteratinment');
        expect(publishers[1].series?.length).toBe(2);
        expect(publishers[1].series[0].name).toEqual('The Tenth');
        expect(publishers[1].series[1].name).toEqual('The Tenth: Resurrected');
        expect(publishers[2].name).toEqual('Top Cow');
        expect(publishers[2].series?.length).toBe(1);
        expect(publishers[2].series[0].name).toEqual('Rising Stars');
      });

      const req = httpMock.expectOne('/api/publishers');
      expect(req.request.method).toBe('GET');
      req.flush(VolumeHttpMocks.publishers);
    });
  });

  describe('#listSeries', () => {

    it('lists all series by the given publisher', () => {
      service.listSeries('DC Comics').subscribe(series => {
        expect(series.length).toBe(2);
        expect(series[0].name).toEqual('Batgirl');
        expect(series[1].name).toEqual('Batman');
      });

      const req = httpMock.expectOne('/api/series?publisher=DC%20Comics');
      expect(req.request.method).toBe('GET');
      req.flush(VolumeHttpMocks.series);
    });
  });

  describe('#listVolumes', () => {

    it('lists all volumes by the given publisher and series', () => {
      service.listVolumes('DC Comics', 'Batgirl').subscribe(volumes => {
        expect(volumes.length).toBe(5);
        expect(volumes[0].name).toEqual('2000');
        expect(volumes[1].name).toEqual('2008');
        expect(volumes[2].name).toEqual('2009');
        expect(volumes[3].name).toEqual('2011');
        expect(volumes[4].name).toEqual('2016');
      });

      const req = httpMock.expectOne('/api/volumes?publisher=DC%20Comics&series=Batgirl');
      expect(req.request.method).toBe('GET');
      req.flush(VolumeHttpMocks.volumes);
    });
  });

  describe('#markAsRead', () => {

    it('marks the volume as read', () => {
      service.markAsRead(VolumeFixtures.volume).subscribe();

      const req = httpMock.expectOne('/api/volumes/markAsRead');
      expect(req.request.body).toEqual(VolumeFixtures.volume);
      expect(req.request.method).toBe('PUT');
      req.flush('');
    });
  });

  describe('#markAsUnread', () => {

    it('marks the volume as unread', () => {
      service.markAsUnread(VolumeFixtures.volume).subscribe();

      const req = httpMock.expectOne('/api/volumes/markAsUnread');
      expect(req.request.body).toEqual(VolumeFixtures.volume);
      expect(req.request.method).toBe('PUT');
      req.flush('');
    });
  });

  describe('#markAllAsReadUntil', () => {

    it('marks the volume as read until the given issue', () => {
      service.markAllAsReadUntil(ComicFixtures.comic).subscribe();

      const req = httpMock.expectOne('/api/volumes/markAllAsReadUntil');
      expect(req.request.body).toEqual(ComicFixtures.comic);
      expect(req.request.method).toBe('PUT');
      req.flush('');
    });
  });
});
