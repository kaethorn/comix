import { TestBed } from '@angular/core/testing';

import { UserSettingsService } from 'src/app/user-settings.service';

let service: UserSettingsService;

describe('UserSettingsService', () => {

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
    });
    service = TestBed.inject(UserSettingsService);
  });

  afterEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  describe('#load', () => {

    describe('without settings', () => {

      beforeEach(() => {
        service.load();
      });

      it('loads empty user settings', () => {
        expect(service.get()).toBeDefined();
      });

      it('determines dark mode user preference', () => {
        expect(service.get().darkMode).toBeDefined();
      });
    });

    describe('with existing settings', () => {

      beforeEach(() => {
        localStorage.setItem('userSettings', JSON.stringify({ foo: 'bar' }));
        service.load();
      });

      it('loads user settings', () => {
        expect(service.get().foo).toEqual('bar');
      });
    });

    describe('dark mode', () => {

      it('overrides user preference', () => {
        localStorage.setItem('userSettings', JSON.stringify({ darkMode: false }));
        service.load();
        expect(service.get().darkMode).toEqual(false);

        localStorage.setItem('userSettings', JSON.stringify({ darkMode: true }));
        service.load();
        expect(service.get().darkMode).toEqual(true);
      });
    });

    describe('when changing preferred color scheme', () => {

      beforeEach(() => {
        spyOn(window, 'matchMedia').and.returnValue({
          addEventListener: jasmine.createSpy()
        } as any);
        service.load();
      });

      it('changes the settings', () => {
        const initialDarkModeFlag = service.get().darkMode;
        expect(window.matchMedia).toHaveBeenCalled();
        // Retrieve and call the event listener
        (window.matchMedia as jasmine.Spy<any>).calls.mostRecent().returnValue
          .addEventListener.calls.mostRecent().args[1]({ matches: !initialDarkModeFlag });
        expect(service.get().darkMode).toBe(!initialDarkModeFlag);
      });
    });
  });

  describe('#save', () => {

    it('persists user settings', () => {
      expect(localStorage.getItem('userSettings')).toBeNull();

      service.get().foo = 'bar';
      service.save();

      expect(localStorage.getItem('userSettings')).toBeDefined();
      expect(JSON.parse(localStorage.getItem('userSettings') || '{}').foo).toEqual('bar');
    });
  });
});
