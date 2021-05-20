import { Volume } from 'src/app/volume';

export class VolumeFixtures {

  public static get volume(): Volume {
    const volume: Volume = {} as Volume;
    volume.name = '1999';
    volume.series = 'Batgirl';
    volume.publisher = 'DC Comics';
    volume.read = false;
    volume.issueCount = 10;
    volume.readCount = 0;
    volume.firstComicId = '1234';

    return volume;
  }

  public static get volumes(): Volume[] {
    return [
      this.volume,
      Object.assign(this.volume, { name: '2003' }),
      Object.assign(this.volume, { name: '2008' }),
      Object.assign(this.volume, { name: '2009' })
    ];
  }
}
