import type { Context } from 'egg';

// 全局中间件：统计请求耗时并输出日志、设置响应头 x-readtime（毫秒）
export default function requestTime() {
  return async function requestTimeMiddleware(ctx: Context, next: () => Promise<any>) {
    const start = Date.now();
    try {
      await next();
    } finally {
      const cost = Date.now() - start;
      // 以响应头形式暴露耗时
      ctx.set('x-readtime', String(cost));
      // 统一日志输出（使用 coreLogger 避免被业务日志等级影响）
      ctx.coreLogger.info('[request-time] %s %s -> %dms %s', ctx.method, ctx.path, cost, ctx.status);
    }
  }
}