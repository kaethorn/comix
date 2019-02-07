import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import { ComicsService } from './../comics.service';
import { Comic } from '../comic';

@Component({
  selector: 'app-volumes',
  templateUrl: './volumes.component.html',
  styleUrls: ['./volumes.component.sass']
})
export class VolumesComponent implements OnInit {

  comics: Array<Comic> = [];

  constructor(
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private comicsService: ComicsService
    ) {
  }

  ngOnInit() {
    this.comicsService.listByVolume(
      this.route.snapshot.params.publisher,
      this.route.snapshot.params.series,
      this.route.snapshot.params.volume).subscribe((data: Comic[]) => {
        this.comics = data;
      });
  }

  markAsRead (comic: Comic): void {
    comic.read = true;
    comic.lastRead = new Date();
    this.updateComic(comic);
  }

  markAsUnread (comic: Comic): void {
    comic.read = false;
    comic.lastRead = null;
    this.updateComic(comic);
  }

  private updateComic (comic: Comic): void {
    this.comicsService.update(comic).subscribe(() => {});
  }

  thumbnail (comic: Comic): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(`data:image/jpeg;base64,${ comic.thumbnail }`);
  }
}
