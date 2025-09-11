import type { EggContext } from '@eggjs/tegg';

// 类级中间件：仅在 DemoController 上生效，打印 POST 请求日志
export async function postLogMiddleware(ctx: EggContext, next: () => Promise<any>) {
  if (ctx.method === 'POST') {
    ctx.coreLogger.info('[demo-post] %s %s body=%j', ctx.method, ctx.path, ctx.request.body);
  }
  await next();
}