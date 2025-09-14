import { HTTPController, HTTPMethod, HTTPMethodEnum, HTTPBody, Inject, HTTPQuery } from '@eggjs/tegg';
import { PkgService } from '../modules/orm/PkgService';

@HTTPController({ path: '/pkg' })
export class PkgController {
  @Inject()
  private svc: PkgService;

  @HTTPMethod({ method: HTTPMethodEnum.POST, path: '/create' })
  async create(@HTTPBody() body: { name: string; email: string }) {
    return await this.svc.create(body);
  }

  @HTTPMethod({ method: HTTPMethodEnum.GET, path: '/get' })
  async get(@HTTPQuery({ name: 'name' }) name: string) {
    return await this.svc.find(name);
  }

  @HTTPMethod({ method: HTTPMethodEnum.GET, path: '/delete' })
  async delete(@HTTPQuery({ name: 'id' }) id: number) {
    return await this.svc.deleteById(id);
  }

  // 分页查询接口：/pkg/page?page=1&pageSize=10
  @HTTPMethod({ method: HTTPMethodEnum.GET, path: '/page' })
  async page(
    @HTTPQuery({ name: 'page' }) page = 1,
    @HTTPQuery({ name: 'pageSize' }) pageSize = 10,
    @HTTPQuery({ name: 'name' }) name?: string,
    @HTTPQuery({ name: 'email' }) email?: string,
  ) {
    return await this.svc.paginate(Number(page), Number(pageSize), { name, email });
  }
}
