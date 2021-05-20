import { TestBed } from '@angular/core/testing';

import { AdjacentComic, NavigatorService } from 'src/app/navigator.service';

let service: NavigatorService;

describe('NavigatorService', () => {

  beforeEach(() => {
    NavigatorService.page = 0;
    NavigatorService.offset = 1;
    NavigatorService.sideBySide = null as any;
    NavigatorService.pageCount = null as any;
    service = TestBed.inject(NavigatorService);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('#go', () => {

    let result: any;

    describe('navigating backwards', () => {

      describe('in side by side mode', () => {

        describe('when in the middle of an issue', () => {

          beforeEach(() => {
            service.set(10, 4, true);
            result = service.go(-1);
          });

          it('suggests to stay on the current issue', () => {
            expect(result.adjacent).toBe(AdjacentComic.SAME);
          });

          it('keeps side by side mode', () => {
            expect(result.sideBySide).toBe(true);
          });

          it('navigates to the previous pair of pages', () => {
            expect(NavigatorService.page).toBe(2);
          });
        });

        describe('when at the start of an issue', () => {

          beforeEach(() => {
            service.set(10, 0, true);
            result = service.go(-1);
          });

          it('suggests to open the previous issue', () => {
            expect(result.adjacent).toBe(AdjacentComic.PREVIOUS);
          });

          it('exits side by side mode', () => {
            expect(result.sideBySide).toBe(false);
          });

          it('navigates stays on the current page', () => {
            expect(NavigatorService.page).toBe(0);
          });
        });
      });

      describe('in single page mode', () => {

        describe('when in the middle of an issue', () => {

          beforeEach(() => {
            service.set(10, 4, false);
            result = service.go(-1);
          });

          it('suggests to stay on the current issue', () => {
            expect(result.adjacent).toBe(AdjacentComic.SAME);
          });

          it('keeps single pagemode', () => {
            expect(result.sideBySide).toBe(false);
          });

          it('navigates to the previous page', () => {
            expect(NavigatorService.page).toBe(3);
          });
        });

        describe('when at the start of an issue', () => {

          beforeEach(() => {
            service.set(10, 0, false);
            result = service.go(-1);
          });

          it('suggests to open the previous issue', () => {
            expect(result.adjacent).toBe(AdjacentComic.PREVIOUS);
          });

          it('keeps single page mode', () => {
            expect(result.sideBySide).toBe(false);
          });

          it('navigates stays on the current page', () => {
            expect(NavigatorService.page).toBe(0);
          });
        });
      });
    });

    describe('navigating forward', () => {

      describe('in side by side mode', () => {

        describe('when in the middle of an issue', () => {

          beforeEach(() => {
            service.set(10, 4, true);
            result = service.go(1);
          });

          it('suggests to stay on the current issue', () => {
            expect(result.adjacent).toBe(AdjacentComic.SAME);
          });

          it('keeps side by side mode', () => {
            expect(result.sideBySide).toBe(true);
          });

          it('navigates to the next pair of pages', () => {
            expect(NavigatorService.page).toBe(6);
          });
        });

        describe('when at the end of an issue', () => {

          beforeEach(() => {
            service.set(10, 9, true);
            result = service.go(1);
          });

          it('suggests to open the next issue', () => {
            expect(result.adjacent).toBe(AdjacentComic.NEXT);
          });

          it('exits side by side mode', () => {
            expect(result.sideBySide).toBe(false);
          });

          it('navigates stays on the current page', () => {
            expect(NavigatorService.page).toBe(9);
          });
        });
      });

      describe('in single page mode', () => {

        describe('when in the middle of an issue', () => {

          beforeEach(() => {
            service.set(10, 4, false);
            result = service.go(1);
          });

          it('suggests to stay on the current issue', () => {
            expect(result.adjacent).toBe(AdjacentComic.SAME);
          });

          it('keeps single pagemode', () => {
            expect(result.sideBySide).toBe(false);
          });

          it('navigates to the previous page', () => {
            expect(NavigatorService.page).toBe(5);
          });
        });

        describe('when at the end of an issue', () => {

          beforeEach(() => {
            service.set(10, 9, false);
            result = service.go(1);
          });

          it('suggests to open the next issue', () => {
            expect(result.adjacent).toBe(AdjacentComic.NEXT);
          });

          it('keeps single page mode', () => {
            expect(result.sideBySide).toBe(false);
          });

          it('navigates stays on the current page', () => {
            expect(NavigatorService.page).toBe(9);
          });
        });
      });
    });

    describe('resuming', () => {

      describe('in side by side mode', () => {

        describe('when on the first page', () => {

          beforeEach(() => {
            service.set(10, 0, true);
            service.go(0);
          });

          it('continues on the first page', () => {
            expect(NavigatorService.page).toBe(0);
          });
        });

        describe('when on a following page', () => {

          beforeEach(() => {
            service.set(10, 0, true);
            service.go(0);
          });

          it('continues on even pages', () => {
            expect(NavigatorService.page).toBe(0);

            service.set(10, 1, true);
            service.go(0);
            expect(NavigatorService.page).toBe(2);

            service.set(10, 2, true);
            service.go(0);
            expect(NavigatorService.page).toBe(2);

            service.set(10, 3, true);
            service.go(0);
            expect(NavigatorService.page).toBe(4);

            service.set(10, 4, true);
            service.go(0);
            expect(NavigatorService.page).toBe(4);
          });
        });
      });

      describe('in single page mode', () => {

        describe('when on the first page', () => {

          beforeEach(() => {
            service.set(10, 0, false);
            service.go(0);
          });

          it('continues on the first page', () => {
            expect(NavigatorService.page).toBe(0);
          });
        });

        describe('when on the second page', () => {

          beforeEach(() => {
            service.set(10, 1, false);
            service.go(0);
          });

          it('continues on the second page', () => {
            expect(NavigatorService.page).toBe(1);
          });
        });
      });
    });
  });

  describe('#set', () => {

    it('sets static attributes', () => {
      expect(NavigatorService.page).toBe(0);
      expect(NavigatorService.offset).toBe(1);
      expect(NavigatorService.sideBySide).toBeNull();
      expect(NavigatorService.pageCount).toBeNull();

      service.set(10, 1, false);

      expect(NavigatorService.page).toBe(1);
      expect(NavigatorService.offset).toBe(1);
      expect(NavigatorService.sideBySide).toBe(false);
      expect(NavigatorService.pageCount).toBe(10);
    });

    describe('in side by side mode', () => {

      it('returns an array of page sets', () => {
        expect(service.set(0, 0, true)).toEqual([]);
        expect(service.set(1, 0, true)).toEqual([
          [{
            loaded: false, page: 0
          }]
        ]);
        expect(service.set(4, 0, true)).toEqual([
          [{
            loaded: false, page: 0
          }],
          [{
            loaded: false, page: 1
          }, {
            loaded: false, page: 2
          }],
          [{
            loaded: false, page: 3
          }]
        ]);
        expect(service.set(5, 0, true)).toEqual([
          [{
            loaded: false, page: 0
          }],
          [{
            loaded: false, page: 1
          }, {
            loaded: false, page: 2
          }],
          [{
            loaded: false, page: 3
          }, {
            loaded: false, page: 4
          }]
        ]);
      });
    });

    describe('in single page mode', () => {

      it('returns an array of page sets', () => {
        expect(service.set(0, 0, false)).toEqual([]);
        expect(service.set(1, 0, false)).toEqual([
          [{
            loaded: false, page: 0
          }]
        ]);
        expect(service.set(4, 0, false)).toEqual([
          [{
            loaded: false, page: 0
          }],
          [{
            loaded: false, page: 1
          }],
          [{
            loaded: false, page: 2
          }],
          [{
            loaded: false, page: 3
          }]
        ]);
      });
    });
  });

  describe('#set', () => {

    it('returns the current set index in side by side mode', () => {
      service.set(10, 0, true);
      expect(service.getSet()).toBe(0);

      service.set(10, 1, true);
      expect(service.getSet()).toBe(1);

      service.set(10, 2, true);
      expect(service.getSet()).toBe(1);

      service.set(10, 3, true);
      expect(service.getSet()).toBe(2);

      service.set(10, 4, true);
      expect(service.getSet()).toBe(2);
    });

    it('returns the current set index in single page mode', () => {
      service.set(10, 0, false);
      expect(service.getSet()).toBe(0);

      service.set(10, 1, false);
      expect(service.getSet()).toBe(1);

      service.set(10, 2, false);
      expect(service.getSet()).toBe(2);

      service.set(10, 3, false);
      expect(service.getSet()).toBe(3);

      service.set(10, 4, false);
      expect(service.getSet()).toBe(4);
    });
  });
});
