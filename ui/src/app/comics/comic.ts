export interface Comic {
  id: number;
  path: string;
  title: string;
  series: string;
	number: number;
	volume: string;
  summary: string;
  notes: string;
	year: number;
	month: number;
	writer: string;
	penciller: string;
	inker: string;
	colorist: string;
	letterer: string;
	cover_artist: string;
	editor: string;
	publisher: string;
	web: string;
	page_count: number;
	manga: boolean;
	characters: string;
	teams: string;
}
