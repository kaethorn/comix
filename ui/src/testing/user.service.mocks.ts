import { BehaviorSubject, of } from 'rxjs';

import { UserService } from 'src/app/user.service';
import { UserFixtures } from 'src/testing/user.fixtures';

export class UserServiceMocks {

  public static get userService(): jasmine.SpyObj<UserService> {
    const userService = jasmine.createSpyObj('UserService', {
      logout: of(null),
      setupGoogleSignIn: null
    });
    userService.user = new BehaviorSubject(UserFixtures.user);
    return userService;
  }
}
