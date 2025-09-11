import type { EggContext } from '@eggjs/tegg';

export async function addTimestampMiddleware(ctx: EggContext, next: () => Promise<any>) {
  // 为请求地址添加时间戳参数 t，如果已经存在则跳过
  try {
    const url = new URL(ctx.href);
    if (!url.searchParams.has('t')) {
      url.searchParams.set('t', String(Date.now()));
      ctx.request.url = url.pathname + url.search + url.hash;
    }
  } catch {
    // ignore parse error
  }
  await next();
}