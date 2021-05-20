import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Stats } from 'src/app/stats';

@Injectable({
  providedIn: 'root'
})
export class StatsService {

  constructor(
    private http: HttpClient
  ) { }

  public get(): Observable<Stats> {
    return this.http.get<Stats>('/api/stats').pipe(
      map((stats: any) => ({
        issues: stats.issues,
        lastScanFinished: stats.lastScanFinished,
        lastScanStarted: stats.lastScanStarted,
        publishers: stats.publishers,
        series: stats.series,
        users: stats.users,
        volumes: stats.volumes
      }))
    );
  }
}
