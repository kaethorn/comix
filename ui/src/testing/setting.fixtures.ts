import { Setting } from 'src/app/setting';

export class SettingFixtures {

  public static get setting(): Setting {
    const setting: Setting = {} as Setting;
    setting.id = '9';
    setting.key = 'comics.path';
    setting.name = 'Path';
    setting.value = '/all/comics';
    setting.comment = 'Path to your comic library';

    return setting;
  }
}
