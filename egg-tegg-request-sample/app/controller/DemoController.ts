import { HTTPController, HTTPMethod, HTTPMethodEnum, HTTPQuery, HTTPBody, HTTPParam, Middleware, Inject, Context } from '@eggjs/tegg';
import { DemoService } from '../modules/demo/DemoService';
import { addTimestampMiddleware } from '../modules/demo/middleware/addTimestampMiddleware';
import type { EggContext } from '@eggjs/tegg';
import { postLogMiddleware } from '../modules/demo/middleware/postLogMiddleware';

@Middleware(postLogMiddleware)
@HTTPController({ path: '/demo' })
export class DemoController {
   @Inject()
   private demoService: DemoService;

   // GET /demo?id=...&name=...&age=...
   @HTTPMethod({ method: HTTPMethodEnum.GET, path: '' })
   @Middleware(addTimestampMiddleware)
   async get(
     @Context() ctx: EggContext,
     @HTTPQuery() name: string,
     @HTTPQuery() age: string,
     @HTTPQuery() id: string,
   ) {
     return await this.demoService.handleParams(ctx, { source: 'get', id, name, age });
   }

   // POST /demo/:id  body: { name, age }
   @HTTPMethod({ method: HTTPMethodEnum.POST, path: '/:id' })
   @Middleware(addTimestampMiddleware)
   async post(
     @Context() ctx: EggContext,
     @HTTPParam() id: string,
     @HTTPBody() body: { name: string; age: string },
   ) {
     const { name, age } = body || ({} as any);
     return await this.demoService.handleParams(ctx, { source: 'post', id, name, age });
   }
 }