import { of } from 'rxjs';

import { ThumbnailsService } from 'src/app/thumbnails.service';
import { ThumbnailFixtures } from 'src/testing/thumbnail.fixtures';

export class ThumbnailsServiceMocks {

  public static get thumbnailsService(): jasmine.SpyObj<ThumbnailsService> {
    return jasmine.createSpyObj('ThumbnailsService', {
      getBackCover: of(ThumbnailFixtures.thumbnail),
      getFrontCover: of(ThumbnailFixtures.thumbnail)
    });
  }
}
