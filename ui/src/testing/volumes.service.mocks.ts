import { of } from 'rxjs';

import { VolumesService } from 'src/app/volumes.service';
import { PublisherFixtures } from 'src/testing/publisher.fixtures';
import { SeriesFixtures } from 'src/testing/series.fixtures';
import { VolumeFixtures } from 'src/testing/volume.fixtures';

export class VolumesServiceMocks {

  public static get volumesService(): jasmine.SpyObj<VolumesService> {
    return jasmine.createSpyObj('VolumesService', {
      listPublishers: of(PublisherFixtures.publishers),
      listSeries: of(SeriesFixtures.series),
      listVolumes: of(VolumeFixtures.volumes),
      listVolumesByPublisher: of([ VolumeFixtures.volume ]),
      markAllAsReadUntil: of(null),
      markAsRead: of(null),
      markAsUnread: of(null)
    });
  }
}
