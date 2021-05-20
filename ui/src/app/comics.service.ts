import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Comic, ScannerIssue } from 'src/app/comic';

@Injectable({
  providedIn: 'root'
})
export class ComicsService {

  constructor(
    private http: HttpClient
  ) {}

  public list(): Observable<Comic[]> {
    return this.http.get('/api/comics/search/findAllByOrderByPublisherAscSeriesAscVolumeAscPositionAsc').pipe(
      this.consumeHateoas(),
      map((data: any) => data.map(this.addId))
    );
  }

  public listComicsWithErrors(): Observable<Comic[]> {
    return this.http.get('/api/queue').pipe(
      this.consumeHateoas(),
      map((data: any) => data.map(this.addId))
    );
  }

  public listComicsWithoutErrors(publisher: string, series: string, volume: string): Observable<Comic[]> {
    const params = new HttpParams({
      fromObject: {
        publisher,
        series,
        volume
      }
    });
    return this.http.get('/api/queue/valid', { params }).pipe(
      this.consumeHateoas(),
      map((data: any) => data.map(this.addId))
    );
  }

  public listByVolume(publisher: string, series: string, volume: string): Observable<Comic[]> {
    const params = new HttpParams({
      fromObject: {
        publisher,
        series,
        volume
      }
    });
    return this.http.get('/api/comics/search/findAllByPublisherAndSeriesAndVolumeOrderByPosition', { params }).pipe(
      this.consumeHateoas(),
      map((data: any) => data.map(this.addId))
    );
  }

  public get(id: string): Observable<Comic> {
    return this.http.get<Comic>(`/api/comics/${ id }`).pipe(
      map(this.addId)
    );
  }

  public getLastUnreadByVolume(publisher: string, series: string, volume: string): Observable<Comic> {
    const params = new HttpParams({
      fromObject: {
        publisher,
        series,
        volume
      }
    });
    return this.http.get<Comic>('/api/comics/search/findLastReadForVolume', { params }).pipe(
      map(this.addId)
    );
  }

  public getFirstByVolume(publisher: string, series: string, volume: string): Observable<Comic> {
    const params = new HttpParams({
      fromObject: {
        publisher,
        series,
        volume
      }
    });
    return this.http.get<Comic>('/api/comics/search/findFirstByPublisherAndSeriesAndVolumeOrderByPosition', { params }).pipe(
      map(this.addId)
    );
  }

  public listLastReadByVolume(): Observable<Comic[]> {
    return this.http.get('/api/comics/search/findAllLastReadPerVolume').pipe(
      this.consumeHateoas(),
      map((data: any) => data.map(this.addId))
    );
  }

  public update(comic: Comic): Observable<Comic> {
    return this.http.put<Comic>('/api/comics', comic).pipe(
      map(this.addId)
    );
  }

  public updateProgress(comic: Comic): Observable<Comic> {
    return this.http.put<Comic>('/api/comics/progress', comic).pipe(
      map(this.addId)
    );
  }

  public scrape(comic: Comic): Observable<Comic> {
    return this.http.put<Comic>('/api/comics/scrape', comic).pipe(
      map(this.addId)
    );
  }

  public markAsRead(comic: Comic): Observable<any> {
    return this.http.put<Comic>('/api/comics/markAsRead', comic).pipe(
      map(this.addId)
    );
  }

  public markAsUnread(comic: Comic): Observable<any> {
    return this.http.put<Comic>('/api/comics/markAsUnread', comic).pipe(
      map(this.addId)
    );
  }

  public deleteComics(): Observable<any> {
    return this.http.delete('/api/comics');
  }

  public deleteProgress(): Observable<any> {
    return this.http.delete('/api/progress');
  }

  public deleteProgressForCurrentUser(): Observable<any> {
    return this.http.delete('/api/progress/me');
  }

  public deletePage(comic: Comic, path: string): Observable<Comic> {
    return this.http.delete<Comic>(`/api/comics/${ comic.id }/page`, {
      params: new HttpParams().set('path', path)
    }).pipe(
      map(this.addId)
    );
  }

  public bundleVolumes(): Observable<any> {
    return this.http.put('/api/comics/bundle', {});
  }

  public getPage(comicId: string, page: number): Observable<Blob> {
    return this.http.get(`/api/read/${ comicId }/${ page }`, {
      responseType: 'blob'
    });
  }

  public fixIssue(comic: Comic, error: ScannerIssue): Observable<Comic> {
    return this.http.put(`/api/queue/fix/${ error.type }`, comic).pipe(
      map(this.addId)
    );
  }

  private consumeHateoas(): any {
    return map((data: any) => (data._embedded ? data._embedded.comics : []));
  }

  private addId(item: any): any {
    item.id = item._links.self.href.split('/').pop();
    return item;
  }
}
