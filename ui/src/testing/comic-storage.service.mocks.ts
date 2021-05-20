import { ComicStorageService } from 'src/app/comic-storage.service';
import { ComicFixtures } from 'src/testing/comic.fixtures';

export class ComicStorageServiceMocks {

  public static get comicStorageService(): jasmine.SpyObj<ComicStorageService> {
    return jasmine.createSpyObj('ComicStorageService', {
      deleteVolume: Promise.resolve(),
      get: Promise.resolve(ComicFixtures.comic),
      getBookmarks: Promise.resolve(ComicFixtures.volume),
      getFrontCoverThumbnail: Promise.resolve(''),
      getPageUrl: Promise.resolve('/api/read/923/0'),
      saveIfStored: Promise.resolve(),
      saveProgress: Promise.resolve(),
      store: Promise.resolve({}),
      storeSurrounding: Promise.resolve({})
    });
  }
}
