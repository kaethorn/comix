import { Comic, ScannerIssue, ScannerIssueSeverity, ScannerIssueType } from 'src/app/comic';

export class ComicFixtures {

  public static get comic(): Comic {
    const comic: Comic = {} as Comic;
    comic.pageCount = 5;
    comic.number = 401;
    comic.id = '923';
    comic.title = 'There\'s Nothing So Savage as a Man Destroying Himself';
    comic.series = 'Batman';
    comic.volume = '1940';
    comic.publisher = 'DC Comics';
    comic.fileName = '401.cbz';
    comic.nextId = null;
    comic.previousId = null;

    return comic;
  }

  public static get volume(): Comic[] {
    return [
      Object.assign({}, this.comic, { id: '11', nextId: '12', position: '401.0' }),
      Object.assign({}, this.comic, { id: '12', nextId: '13', position: '402.0',  previousId: '11' }),
      Object.assign({}, this.comic, { id: '13', nextId: '14', position: '403.0',  previousId: '12' }),
      Object.assign({}, this.comic, { id: '14', nextId: '15', position: '404.0',  previousId: '13' }),
      Object.assign({}, this.comic, { id: '15', nextId: '16', position: '405.0',  previousId: '14' }),
      Object.assign({}, this.comic, { id: '16', nextId: '17', position: '406.0',  previousId: '15' }),
      Object.assign({}, this.comic, { id: '17', nextId: '18', position: '407.0',  previousId: '16' }),
      Object.assign({}, this.comic, { id: '18', position: '408.0', previousId: '17' })
    ];
  }

  public static get volumeWithErrors(): Comic[] {
    return ComicFixtures.volume.map((comic, index) => {
      if (index % 2) {
        comic.errors = [];
      }
      return comic;
    });
  }

  public static get volume2(): Comic[] {
    return [
      Object.assign({}, this.comic, { id: '21', nextId: '22', position: '1.0', series: 'Batgirl', volume: '2018' }),
      Object.assign({}, this.comic, { id: '22', nextId: '23', position: '2.0', previousId: '21', series: 'Batgirl', volume: '2018' }),
      Object.assign({}, this.comic, { id: '23', nextId: '24', position: '3.0', previousId: '22', series: 'Batgirl', volume: '2018' }),
      Object.assign({}, this.comic, { id: '24', nextId: '25', position: '4.0', previousId: '23', series: 'Batgirl', volume: '2018' }),
      Object.assign({}, this.comic, { id: '25', nextId: '26', position: '5.0', previousId: '24', series: 'Batgirl', volume: '2018' }),
      Object.assign({}, this.comic, { id: '26', nextId: '27', position: '6.0', previousId: '25', series: 'Batgirl', volume: '2018' }),
      Object.assign({}, this.comic, { id: '27', nextId: '28', position: '7.0', previousId: '26', series: 'Batgirl', volume: '2018' }),
      Object.assign({}, this.comic, { id: '28', position: '8.0', previousId: '27', series: 'Batgirl', volume: '2018' })
    ];
  }

  public static get volumeInProgress(): Comic[] {
    const volume: Comic[] = this.volume;
    volume[0].read = true;
    volume[1].read = true;

    return volume;
  }

  public static get volumesInProgress(): Comic[] {
    const volumeInProgress2: Comic[] = this.volume2;
    volumeInProgress2[0].read = true;

    return this.volumeInProgress.concat(volumeInProgress2);
  }

  public static get scannerIssueFixable(): ScannerIssue {
    return {
      date: new Date('2020-03-10T21:24:00'),
      fixable: true,
      message: 'Found directory entries in the archive.',
      severity: ScannerIssueSeverity.WARNING,
      type: ScannerIssueType.NOT_FLAT
    };
  }
}
