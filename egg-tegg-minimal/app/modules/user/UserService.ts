import { SingletonProto, AccessLevel } from '@eggjs/tegg';

@SingletonProto({
  accessLevel: AccessLevel.PUBLIC,
})
export class UserService {
  async profile(name?: string) {
    return { user: name || 'anonymous', level: 'basic' };
  }
}