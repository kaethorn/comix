import { User } from 'src/app/user';

export class UserFixtures {

  public static get user(): User {
    const user: User = {} as User;
    user.email = 'foo@bar.com';
    user.name = 'Foo Bar';
    user.picture = 'https://bar.com/foo.png';

    return user;
  }
}
