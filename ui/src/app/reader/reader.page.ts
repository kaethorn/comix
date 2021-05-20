import { Component, ViewChild, ElementRef, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';

import { Comic } from 'src/app/comic';
import { ComicStorageService } from 'src/app/comic-storage.service';
import { AdjacentComic, NavigationInstruction, NavigatorService, PageSource } from 'src/app/navigator.service';

interface IOpenOptions {
  showToast?: boolean;
}

@Component({
  selector: 'app-reader',
  styleUrls: [ './reader.page.sass' ],
  templateUrl: './reader.page.html'
})
export class ReaderPage {

  @ViewChild('pagesLayer', { static: true }) public pagesLayer!: ElementRef;
  public comic: Comic = {} as Comic;
  public imageSets!: PageSource[][];
  public showControls = false;
  public transformation = {};
  private parent!: string;
  private initialNavigation = true;
  private loading!: HTMLIonLoadingElement;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navigator: NavigatorService,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private comicStorageService: ComicStorageService
  ) { }

  @HostListener('document:keyup.esc', [ '$event' ])
  public handleEscape(): void {
    this.back();
  }

  @HostListener('document:keyup.arrowleft', [ '$event' ])
  public handleLeft(): void {
    this.go(-1);
  }
  @HostListener('document:keyup.arrowright', [ '$event' ])
  public handleRight(): void {
    this.go(1);
  }

  public ionViewDidEnter(): void {
    this.parent = this.route.snapshot.queryParams.parent || '/library/publishers';
    this.loadComic(this.route.snapshot.params.id);
  }

  public ionViewDidLeave(): void {
    this.loading.dismiss();
  }

  public onClick(event: MouseEvent): void {
    const direction = this.getDirection(event);
    if (direction === 0) {
      this.toggleControls();
    } else {
      this.go(direction);
    }
  }

  public go(direction: number, event?: MouseEvent): void {
    this.navigate(this.navigator.go(direction));
    event?.stopPropagation();
  }

  public openNext(options: IOpenOptions = {}): void {
    this.open('nextId', options);
  }

  public openPrevious(options: IOpenOptions = {}): void {
    this.open('previousId', options);
  }

  public toggleControls(): void {
    this.showControls = !this.showControls;
  }

  public onSwipe(direction: number): void {
    this.navigate(this.navigator.go(direction));
  }

  public back(): void {
    this.router.navigate([ this.parent ]);
  }

  public imageLoaded(image: PageSource): void {
    image.loaded = true;
  }

  private async loadComic(comicId: string): Promise<void> {
    await this.presentLoading();
    this.comicStorageService.get(comicId)
      .then(async comic => {
        this.comic = comic;
        await this.comicStorageService.store(comic);
        this.setup().then(() => this.loading.dismiss());
        this.comicStorageService.storeSurrounding(comicId).then(() => {
          this.showToast('Volume cached.');
        });
      }).catch(() => {
        this.loading.dismiss();
        this.showToast('Comic book not available, please try again later.', 4000);
        this.back();
      });
  }

  private navigate(instruction: NavigationInstruction): void {
    switch (instruction.adjacent) {
      case AdjacentComic.SAME:
        this.comic.currentPage = NavigatorService.page;
        this.router.navigate([], {
          queryParams: { page: NavigatorService.page },
          queryParamsHandling: 'merge',
          relativeTo: this.route,
          replaceUrl: true
        });
        this.setTransformation();
        this.comicStorageService.saveProgress(this.comic);
        break;
      case AdjacentComic.NEXT:
        this.openNext({ showToast: true });
        break;
      case AdjacentComic.PREVIOUS:
        this.openPrevious({ showToast: true });
        break;
    }
  }

  private setImage(image: PageSource): void {
    image.loader = this.comicStorageService.getPageUrl(this.comic.id, image.page).then(url => {
      image.src = url;
    });
  }

  /**
   * Partitions the comic pages, triggers loading of images and starts navigation.
   *
   * @param comic The comic to load
   * @returns A promise that resolves once the current set of pages are loaded.
   */
  private setup(): Promise<void[]> {
    this.imageSets = this.navigator.set(
      this.comic.pageCount,
      this.getPage(this.comic),
      this.isSideBySide()
    );
    for (const set of this.imageSets) {
      for (const image of set) {
        this.setImage(image);
      }
    }
    this.navigate(this.navigator.go());

    // Determine when the current set is loaded
    const currentSet = this.navigator.getSet();
    const pagesToLoad: (Promise<void> | undefined)[] = this.imageSets[currentSet].map(image => image.loader);
    return Promise.all(pagesToLoad);
  }

  private isSideBySide(): boolean {
    const parentElement = this.pagesLayer.nativeElement.parentElement;
    return parentElement.clientWidth > parentElement.clientHeight;
  }

  private getPage(comic: Comic): number {
    if (comic.currentPage === null || comic.currentPage === undefined) {
      return Number.parseInt(this.route.snapshot.queryParams.page, 10) || 0;
    }
    return comic.currentPage;
  }

  private setTransformation(): void {
    const currentSet = this.navigator.getSet();

    this.transformation = {
      transform: `translateX(-${ currentSet }00vw)`,
      transition: this.initialNavigation ? '' : 'transform 0.8s ease-out'
    };

    if (this.initialNavigation) {
      this.initialNavigation = false;
    }
  }

  /**
   * Determine the direction of page navigation.
   *
   * Evaluates the position the user clicked on the page. Clicking on the
   * left side of the page navigates back, clicking on the right side navigates
   * forward and clicking in the center shows controls.
   *
   * @returns `-1` for backwards, `1` for backwards and `0` for no navigation.
   */
  private getDirection(event: MouseEvent): number {
    const center = (<HTMLElement>event.currentTarget).offsetWidth / 2;
    const leftSide = center * 0.5;
    const rightSide = center * 1.5;
    if (event.clientX < leftSide) {
      return -1;
    } else if (event.clientX > rightSide) {
      return 1;
    } else {
      return 0;
    }
  }

  private open(adjacentAttr: keyof Comic, options: IOpenOptions): void {
    if (this.comic[adjacentAttr]) {
      this.comicStorageService.storeSurrounding(this.comic[adjacentAttr] as string);
      this.router.navigate([ '/read', this.comic[adjacentAttr] ], {
        queryParamsHandling: 'merge',
        relativeTo: this.route,
        replaceUrl: true
      });
      if (options.showToast) {
        if (adjacentAttr === 'nextId') {
          this.showToast(`Opening next issue of ${ this.comic.series } (${ this.comic.volume }).`);
        } else {
          this.showToast(`Opening previous issue of ${ this.comic.series } (${ this.comic.volume }).`);
        }
      }
    }
  }

  private async showToast(message: string, duration = 3000): Promise<void> {
    const toast = await this.toastController.create({
      duration,
      message
    });
    toast.present();
  }

  private async presentLoading(): Promise<HTMLIonLoadingElement> {
    this.loading = await this.loadingController.create({
      message: 'Opening comic...'
    });
    await this.loading.present();
    return this.loading;
  }
}
