import { HTTPController, HTTPMethod, HTTPMethodEnum } from '@eggjs/tegg';

@HTTPController({ path: '/api' })
export class HealthController {
  // GET /api/health - 健康检查接口
  @HTTPMethod({ method: HTTPMethodEnum.GET, path: '/health' })
  async health() {
    return { 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      message: 'Tegg API Server is running'
    };
  }
}