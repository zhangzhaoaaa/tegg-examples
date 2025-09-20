import { HTTPController, HTTPMethod, HTTPMethodEnum } from '@eggjs/tegg';

@HTTPController({ path: '/' })
export class HomeController {
  @HTTPMethod({ method: HTTPMethodEnum.GET, path: '' })
  async index() {
    return {
      message: '欢迎使用商品管理系统',
      version: '1.0.0',
      apis: {
        auth: '/api/auth',
        users: '/api/users',
        products: '/api/products',
        orders: '/api/orders',
      },
    };
  }

  @HTTPMethod({ method: HTTPMethodEnum.GET, path: '/health' })
  async health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}