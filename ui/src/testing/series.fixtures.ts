import { Series } from 'src/app/series';

export class SeriesFixtures {

  public static get serie(): Series {
    return {
      name: 'Batgirl',
      publisher: 'DC Comics',
      volumesCount: 7
    };
  }

  public static get series(): Series[] {
    return [
      this.serie,
      Object.assign(this.serie, { name: 'Batman', volumesCount: 1 }),
      Object.assign(this.serie, { name: 'Superman', volumesCount: 3 }),
      Object.assign(this.serie, { name: 'Green Lantern', volumesCount: 2 }),
      Object.assign(this.serie, { name: 'Arrow', volumesCount: 4 })
    ];
  }
}
