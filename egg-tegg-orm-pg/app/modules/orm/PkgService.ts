import { Inject, SingletonProto, AccessLevel } from '@eggjs/tegg';
import { Pkg } from './model/Pkg';

@SingletonProto({
  accessLevel: AccessLevel.PUBLIC,
})
export class PkgService {
  @Inject()
  Pkg: typeof Pkg;

  async create(data: { name: string; email: string }) {
    const bone = await this.Pkg.create(data as any);
    return bone as Pkg;
  }

  async find(name: string) {
    const item = await this.Pkg.findOne({ name });
    return item as Pkg | null;
  }

  // 按 id 删除，返回受影响的行数
  async deleteById(id: number): Promise<number> {
    const affected = await this.Pkg.remove({ id } as any);
    return affected as unknown as number;
  }

  // 条件分页查询：支持按 name/email 过滤，按 id 升序
  async paginate(
    page = 1,
    pageSize = 10,
    filter?: { name?: string; email?: string },
  ): Promise<{ total: number; page: number; pageSize: number; items: Pkg[] }> {
    const safePage = Math.max(1, Math.floor(page));
    const safeSize = Math.max(1, Math.min(100, Math.floor(pageSize)));
    const offset = (safePage - 1) * safeSize;

    const where: Record<string, any> = {};
    if (filter?.name) where.name = filter.name;
    if (filter?.email) where.email = filter.email;

    const [ totalRaw, items ] = await Promise.all([
      // 不能直接 Bone.count(where)，应使用 find(where).count()
      this.Pkg.find(where as any).count(),
      this.Pkg
        .find(where as any)
        .order('id', 'asc')
        .limit(safeSize)
        .offset(offset) as unknown as Promise<Pkg[]>,
    ]);

    const total = Array.isArray(totalRaw)
      ? Number((totalRaw as any)[0]?.count ?? 0)
      : Number(totalRaw);

    return { total, page: safePage, pageSize: safeSize, items };
  }
}