import { of } from 'rxjs';

import { ComicsService } from 'src/app/comics.service';
import { ComicFixtures } from 'src/testing/comic.fixtures';

export class ComicsServiceMocks {

  public static get comicsService(): jasmine.SpyObj<ComicsService> {
    const comicsService: jasmine.SpyObj<ComicsService> = jasmine.createSpyObj(ComicsService, {
      bundleVolumes: of(null),
      deleteComics: of(null),
      deletePage: of(null),
      deleteProgress: of(null),
      deleteProgressForCurrentUser: of(null),
      fixIssue: of(null),
      get: of(ComicFixtures.comic),
      getFirstByVolume: of(ComicFixtures.comic),
      getLastUnreadByVolume: of(ComicFixtures.comic),
      getPage: of(null),
      list: of(ComicFixtures.volume),
      listByVolume: of(ComicFixtures.volume),
      listComicsWithErrors: of(ComicFixtures.volumeWithErrors),
      listComicsWithoutErrors: of(ComicFixtures.volume),
      listLastReadByVolume: of(ComicFixtures.volume),
      markAsRead: of(ComicFixtures.comic),
      markAsUnread: of(ComicFixtures.comic),
      scrape: of(ComicFixtures.comic),
      update: of(ComicFixtures.comic),
      updateProgress: of(ComicFixtures.comic)
    });
    comicsService.markAsRead.and.callFake(c => of(Object.assign({}, c, { read: true })));
    comicsService.markAsUnread.and.callFake(c => of(Object.assign({}, c, { read: false })));

    return comicsService;
  }
}
