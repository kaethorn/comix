import { Publisher } from 'src/app/publisher';
import { SeriesFixtures } from 'src/testing/series.fixtures';

export class PublisherFixtures {

  public static get publisher(): Publisher {
    const publisher: Publisher = {} as Publisher;
    publisher.name = 'DC Comics';
    publisher.seriesCount = 4;
    publisher.series = [
      SeriesFixtures.serie,
      Object.assign(SeriesFixtures.serie, { name: 'Batgirl' }),
      Object.assign(SeriesFixtures.serie, { name: 'Green Lantern' }),
      Object.assign(SeriesFixtures.serie, { name: 'Flash' })
    ];

    return publisher;
  }

  public static get publishers(): Publisher[] {
    return [
      this.publisher,
      Object.assign(this.publisher, {
        name: 'Marvel Comics',
        series: [
          Object.assign(SeriesFixtures.serie, { name: 'Wolverine' }),
          Object.assign(SeriesFixtures.serie, { name: 'Spider-Man' })
        ],
        seriesCount: 2
      }),
      Object.assign(this.publisher, {
        name: 'Dark Horse Comics',
        series: [
          Object.assign(SeriesFixtures.serie, { name: 'Aliens' }),
          Object.assign(SeriesFixtures.serie, { name: 'Star Wars' })
        ],
        seriesCount: 2
      }),
      Object.assign(this.publisher, {
        name: 'Aspen Comics',
        series: [
          Object.assign(SeriesFixtures.serie, { name: 'Fathom' }),
          Object.assign(SeriesFixtures.serie, { name: 'Ekos' })
        ],
        seriesCount: 2
      }),
      Object.assign(this.publisher, {
        name: 'Top Cow Productions',
        series: [
          Object.assign(SeriesFixtures.serie, { name: 'Witchblade' }),
          Object.assign(SeriesFixtures.serie, { name: 'The Darkness' }),
          Object.assign(SeriesFixtures.serie, { name: 'Magdalena' })
        ],
        seriesCount: 3
      })
    ];
  }
}
