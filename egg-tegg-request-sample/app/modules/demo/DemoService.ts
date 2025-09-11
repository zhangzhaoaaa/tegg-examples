import { SingletonProto, AccessLevel } from '@eggjs/tegg';
import type { EggContext } from '@eggjs/tegg';

interface Params {
  source: 'get' | 'post';
  id?: string;
  name?: string;
  age?: string;
}

@SingletonProto({ accessLevel: AccessLevel.PUBLIC })
export class DemoService {
  async handleParams(ctx: EggContext, params: Params) {
    const t = (ctx.request?.query as any)?.t || (ctx.query as any)?.t;
    // 在 service 层记录三个参数与时间戳
    ctx.logger.info('[DemoService] source=%s id=%s name=%s age=%s t=%s', params.source, params.id, params.name, params.age, t);
    return {
      ok: true,
      source: params.source,
      id: params.id,
      name: params.name,
      age: params.age,
      t,
    };
  }
}