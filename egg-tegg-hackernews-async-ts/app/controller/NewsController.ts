import { Context as EggContext } from 'egg';
import { Context, HTTPController, HTTPMethod, HTTPMethodEnum, HTTPParam, HTTPQuery, Inject } from '@eggjs/tegg';
import { NewsService } from '../modules/news/NewsService';

@HTTPController({ path: '/' })
export class NewsController {
  @Inject()
  private newsService: NewsService;

  // GET /
  @HTTPMethod({ method: HTTPMethodEnum.GET, path: '' })
  async home(@Context() ctx: EggContext, @HTTPQuery() page: string) {
    const pageNum = Math.max(1, Number(page) || 1);
    const data = await this.newsService.topStories(ctx, pageNum);
    await ctx.render('news/list.tpl', data);
  }

  // GET /item/:id
  @HTTPMethod({ method: HTTPMethodEnum.GET, path: 'item/:id' })
  async item(@Context() ctx: EggContext, @HTTPParam() id: string) {
    const data = await this.newsService.item(ctx, Number(id));
    await ctx.render('news/detail.tpl', data);
  }

  // GET /user/:id
  @HTTPMethod({ method: HTTPMethodEnum.GET, path: 'user/:id' })
  async user(@Context() ctx: EggContext, @HTTPParam() id: string) {
    const data = await this.newsService.user(ctx, id);
    await ctx.render('user.tpl', data);
  }
}