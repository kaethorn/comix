import { Series } from 'src/app/series';

export interface Publisher {
  name: string;
  seriesCount: number;
  series: Series[];
}
