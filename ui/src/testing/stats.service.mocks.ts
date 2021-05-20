import { of } from 'rxjs';

import { StatsService } from 'src/app/stats.service';

export class StatsServiceMocks {

  public static get statsService(): jasmine.SpyObj<StatsService> {
    return jasmine.createSpyObj('StatsService', {
      get: of({
        issues: 218,
        publishers: 4,
        series: 18,
        users: 2,
        volumes: 29
      })
    });
  }
}
