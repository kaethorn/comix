import { of } from 'rxjs';

import { QueueService } from 'src/app/queue.service';
import { ComicFixtures } from 'src/testing/comic.fixtures';

export class QueueServiceMocks {

  public static get queueService(): jasmine.SpyObj<QueueService> {
    return jasmine.createSpyObj('QueueService', {
      add: Promise.resolve(),
      process: of(ComicFixtures.comic)
    });
  }
}
