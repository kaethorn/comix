import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { SettingsService } from 'src/app/settings.service';

let service: SettingsService;
let httpMock: HttpTestingController;

const mockSettingA = {
  _links: {
    self: {
      href: 'foo.bar/1'
    }
  },
  comment: '',
  id: '1',
  key: 'a',
  name: 'Sample A',
  value: 'foo'
};
const mockSettingB = {
  _links: {
    self: {
      href: 'foo.bar/2'
    }
  },
  comment: '',
  id: '2',
  key: 'b',
  name: 'Sample B',
  value: 'bar'
};
const mockSettings = {
  _embedded: {
    settings: [ mockSettingA, mockSettingB ]
  }
};

describe('SettingsService', () => {

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ]
    });
    service = TestBed.inject(SettingsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  describe('#list', () => {

    it('returns all settings', () => {
      service.list().subscribe(settings => {
        expect(settings.length).toBe(2);
        expect(settings[0].id).toEqual('1');
        expect(settings[1].id).toEqual('2');
      });
      const req = httpMock.expectOne('/api/settings');
      expect(req.request.method).toBe('GET');
      req.flush(mockSettings);
    });
  });

  describe('#get', () => {

    it('return a settings entry by key', () => {
      service.get('a').subscribe(setting => {
        expect(setting.id).toEqual('1');
      });
      const req = httpMock.expectOne('/api/settings/search/findByKey?key=a');
      expect(req.request.method).toBe('GET');
      req.flush(mockSettingA);
    });
  });

  describe('#update', () => {

    it('changes a settings entry', () => {
      service.update(mockSettingA).subscribe(setting => {
        expect(setting.id).toEqual('1');
      });
      const req = httpMock.expectOne('/api/settings/1');
      expect(req.request.method).toBe('PUT');
      req.flush(mockSettingA);
    });
  });
});
