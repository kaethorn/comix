import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Setting } from 'src/app/setting';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor(
    private http: HttpClient
  ) { }

  public list(): Observable<Setting[]> {
    return this.http.get('/api/settings').pipe(
      this.consumeHateoas(),
      map((data: any) => data.map((item: any) => this.addId(item)))
    );
  }

  public get(key: string): Observable<Setting> {
    return this.http.get<Setting>(`/api/settings/search/findByKey?key=${ key }`).pipe(
      map((item: any) => this.addId(item))
    );
  }

  public update(setting: Setting): Observable<Setting> {
    return this.http.put<Setting>(`/api/settings/${ setting.id }`, setting);
  }

  private consumeHateoas(): any {
    return map((data: any) => data._embedded.settings);
  }

  private addId(item: any): any {
    item.id = item._links.self.href.split('/').pop();
    return item;
  }
}
