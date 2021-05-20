import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Thumbnail } from 'src/app/thumbnail';

@Injectable({
  providedIn: 'root'
})
export class ThumbnailsService {

  constructor(
    private sanitizer: DomSanitizer,
    private http: HttpClient
  ) {}

  public getFrontCover(comicId: string): Observable<Thumbnail> {
    return this.http.get<Thumbnail>(`/api/thumbnails/front-cover/${ comicId }`).pipe(
      map((thumbnail: any) => {
        thumbnail.url = this.sanitizer.bypassSecurityTrustUrl(`data:image/jpeg;base64,${ thumbnail.image }`);
        return thumbnail;
      })
    );
  }

  public getBackCover(comicId: string): Observable<Thumbnail> {
    return this.http.get<Thumbnail>(`/api/thumbnails/back-cover/${ comicId }`).pipe(
      map((thumbnail: any) => {
        thumbnail.url = this.sanitizer.bypassSecurityTrustUrl(`data:image/jpeg;base64,${ thumbnail.image }`);
        return thumbnail;
      })
    );
  }
}
