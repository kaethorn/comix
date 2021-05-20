import { Injectable, Inject } from '@angular/core';

import { CACHES_TOKEN } from 'src/app/caches.token';

@Injectable({
  providedIn: 'root'
})
export class CacheStorageService {

  constructor(
    @Inject(CACHES_TOKEN) private caches: CacheStorage
  ) { }

  /**
   * Remove the thumbnails for the given comic ID.
   *
   * Angular currently establishes the following Cache Storage entry responsible
   * for thumbnails from the API:
   * "ngsw:/:1:data:dynamic:thumbnails-api:cache"
   */
  public async resetThumbnailsCache(comicId: string): Promise<void> {
    const cacheNames = await this.caches.keys();
    const thumbnailCaches = cacheNames.filter(cacheName => /:thumbnails-api:cache$/.test(cacheName));
    for (const thumbailCache of thumbnailCaches) {
      const cache = await this.caches.open(thumbailCache);
      const requests = await cache.keys();
      const matchingRequests = requests.filter(request => request.url.includes(comicId));
      await Promise.all(matchingRequests.map(request => cache.delete(request)));
    }
  }
}
