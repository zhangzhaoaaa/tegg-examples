import { HTTPController, HTTPMethod, HTTPMethodEnum, Context } from '@eggjs/tegg';
import type { EggContext } from '@eggjs/tegg';

@HTTPController({ path: '/' })
export class HomeController {
  @HTTPMethod({ method: HTTPMethodEnum.GET, path: '' })
  async index(@Context() ctx: EggContext) {
    // 重定向到 index.html
    ctx.redirect('/index.html');
  }
}