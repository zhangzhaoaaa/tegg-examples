import { HTTPController, HTTPMethod, HTTPMethodEnum, HTTPQuery, Inject } from '@eggjs/tegg';
import { GreetService } from '../modules/hello/GreetService';
import { UserService } from '../modules/user/UserService';

@HTTPController({
  path: '/hello',
})
export class HelloController {
  @Inject()
  private greetService: GreetService;

  @Inject()
  private userService: UserService;

  @HTTPMethod({
    method: HTTPMethodEnum.GET,
    path: '',
  })
  async index(@HTTPQuery() name: string) {
    return this.greetService.greet(name);
  }

  @HTTPMethod({
    method: HTTPMethodEnum.GET,
    path: '/user',
  })
  async user(@HTTPQuery() name: string) {
    return this.userService.profile(name);
  }
}