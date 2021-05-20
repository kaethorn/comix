import { Thumbnail } from 'src/app/thumbnail';

export class ThumbnailFixtures {

  public static get thumbnail(): Thumbnail {
    const thumbnail: Thumbnail = {} as Thumbnail;
    thumbnail.id = '142';
    thumbnail.comicId = '923';
    thumbnail.image = 'abcedf1234';
    thumbnail.path = '/1.png';
    thumbnail.url = {
      changingThisBreaksApplicationSecurity: 'data:image/jpeg;base64,9312321'
    };

    return thumbnail;
  }
}
