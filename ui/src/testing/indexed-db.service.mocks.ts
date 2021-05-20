import { AsyncSubject } from 'rxjs';

import { IndexedDbService } from 'src/app/indexed-db.service';

export class IndexedDbServiceMocks {

  public static get indexedDbService(): jasmine.SpyObj<IndexedDbService> {
    const service = jasmine.createSpyObj('IndexedDbService', {
      delete: Promise.resolve(new Event('')),
      get: Promise.resolve(),
      getAll: Promise.resolve([]),
      getAllBy: Promise.resolve([]),
      hasKey: Promise.resolve(true),
      open: null,
      save: Promise.resolve(new Event(''))
    });
    service.ready = new AsyncSubject<void>();

    service.open.and.callFake(() => {
      service.ready.complete();
    });

    return service;
  }
}
