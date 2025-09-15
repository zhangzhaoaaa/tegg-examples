import { AccessLevel, SingletonProto } from '@eggjs/tegg';
import type { Context as EggContext } from 'egg';

interface TopStoriesData {
  page: number;
  pageSize: number;
  total: number;
  ids: number[];
  items: Array<{ id: number; title: string; by: string; score: number; time: number; timeText: string; descendants?: number; url?: string; }>
}

@SingletonProto({ accessLevel: AccessLevel.PUBLIC })
export class NewsService {
  private getBaseUrl(ctx: EggContext) {
    return ctx.app.config.news?.baseUrl || 'https://hacker-news.firebaseio.com/v0';
  }
  private getPageSize(ctx: EggContext) {
    return ctx.app.config.news?.pageSize || 30;
  }
  private getTimeout(ctx: EggContext) {
    return ctx.app.config.news?.timeout || 5000;
  }

  async topStories(ctx: EggContext, page = 1): Promise<TopStoriesData> {
    const pageSize = this.getPageSize(ctx);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const idsResp = await ctx.curl(`${this.getBaseUrl(ctx)}/topstories.json`, { dataType: 'json', timeout: this.getTimeout(ctx) });
    const ids: number[] = idsResp.data || [];
    const pageIds = ids.slice(start, end);

    const items = await Promise.all(pageIds.map(async (id) => {
      const item = await this.item(ctx, id);
      return {
        id,
        title: item.title,
        by: item.by,
        score: item.score,
        time: item.time,
        timeText: new Date((item.time || 0) * 1000).toLocaleString(),
        descendants: item.descendants,
        url: item.url,
      };
    }));

    return { page, pageSize, total: ids.length, ids: pageIds, items };
  }

  async item(ctx: EggContext, id: number): Promise<any> {
    const res = await ctx.curl(`${this.getBaseUrl(ctx)}/item/${id}.json`, { dataType: 'json', timeout: this.getTimeout(ctx) });
    const data = res.data || {};
    return { ...data, timeText: new Date((data.time || 0) * 1000).toLocaleString() };
  }

  async user(ctx: EggContext, id: string): Promise<any> {
    const res = await ctx.curl(`${this.getBaseUrl(ctx)}/user/${id}.json`, { dataType: 'json', timeout: this.getTimeout(ctx) });
    const data = res.data || {};
    return { ...data, createdText: new Date((data.created || 0) * 1000).toLocaleString() };
  }
}