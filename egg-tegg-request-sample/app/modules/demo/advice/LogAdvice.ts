import { Advice, IAdvice, AdviceContext, Crosscut, PointcutType } from '@eggjs/tegg/aop';
import { AccessLevel } from '@eggjs/tegg';

@Crosscut({ type: PointcutType.NAME, className: /Service$/, methodName: /^handle/ })
@Advice({ accessLevel: AccessLevel.PUBLIC })
export class LogAdvice implements IAdvice {
  async around(ctx: AdviceContext, next: () => Promise<any>) {
    const { that, method, args } = ctx;
    console.log('AOP');
    const logger = (args?.[0] as any)?.logger || (that as any)?.app?.coreLogger || console;
    logger.info('[AOP][before] %s.%s args=%j', that?.constructor?.name ?? 'Unknown', String(method), args);
    try {
      const res = await next();
      logger.info('[AOP][afterReturn] %s.%s result=%j', that?.constructor?.name ?? 'Unknown', String(method), res);
      return res;
    } catch (err) {
      logger.error('[AOP][afterThrow] %s.%s error=%s', that?.constructor?.name ?? 'Unknown', String(method), err instanceof Error ? err.stack : err);
      throw err;
    } finally {
      logger.info('[AOP][finally] %s.%s', that?.constructor?.name ?? 'Unknown', String(method));
    }
  }
}