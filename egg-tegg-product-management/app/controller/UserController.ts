import { HTTPController, HTTPMethod, HTTPMethodEnum, HTTPParam, HTTPQuery, HTTPBody, Context,Inject } from '@eggjs/tegg';
import { EggContext } from '@eggjs/tegg';
import { UserService, RegisterData, LoginData, UserFilters } from '../modules/user/UserService';

@HTTPController({
  path: '/api/users',
})
export class UserController {
    @Inject()
    private userService: UserService;

  // 验证权限的辅助方法
  private async verifyAuth(ctx: EggContext, requiredRoles?: string[]) {
    const token = ctx.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      ctx.status = 401;
      return { error: '未提供认证令牌' };
    }

    try {
      const decoded: any = this.userService.verifyToken(token);
      if (requiredRoles && !requiredRoles.includes(decoded.role)) {
        ctx.status = 403;
        return { error: '权限不足' };
      }
      return decoded;
    } catch (error) {
      ctx.status = 401;
      return { error: '无效的认证令牌' };
    }
  }

  // POST /api/users/register - 用户注册
  @HTTPMethod({ method: HTTPMethodEnum.POST, path: '/register' })
  async register(@Context() ctx: EggContext, @HTTPBody() body: RegisterData) {
    try {
      const { username, email, password, role } = body;

      if (!username || !email || !password) {
        ctx.status = 400;
        return { success: false, message: '用户名、邮箱和密码不能为空' };
      }

      // 验证角色
      const validRoles = ['consumer', 'merchant', 'admin'];
      if (role && !validRoles.includes(role)) {
        ctx.status = 400;
        return { success: false, message: '无效的用户角色' };
      }

      const user = await this.userService.register(body);
      ctx.status = 201;
      return { success: true, data: user, message: '注册成功' };
    } catch (error: any) {
      ctx.status = 400;
      return { success: false, message: error.message || '注册失败' };
    }
  }

  // POST /api/users/login - 用户登录
  @HTTPMethod({ method: HTTPMethodEnum.POST, path: '/login' })
  async login(@Context() ctx: EggContext, @HTTPBody() body: LoginData) {
    try {
      const { username, password } = body;

      if (!username || !password) {
        ctx.status = 400;
        return { success: false, message: '用户名和密码不能为空' };
      }

      const result = await this.userService.login(body);
      return { success: true, data: result, message: '登录成功' };
    } catch (error: any) {
      ctx.status = 401;
      return { success: false, message: error.message || '登录失败' };
    }
  }

  // GET /api/users/profile - 获取当前用户信息
  @HTTPMethod({ method: HTTPMethodEnum.GET, path: '/profile' })
  async getProfile(@Context() ctx: EggContext) {
    const auth = await this.verifyAuth(ctx);
    if (auth.error) {
      return { success: false, message: auth.error };
    }

    try {
      const user = await this.userService.getUserById(auth.id);
      if (!user) {
        ctx.status = 404;
        return { success: false, message: '用户不存在' };
      }

      return { success: true, data: user };
    } catch (error: any) {
      ctx.status = 500;
      return { success: false, message: error.message || '获取用户信息失败' };
    }
  }

  // GET /api/users - 获取用户列表（管理员功能）
  @HTTPMethod({ method: HTTPMethodEnum.GET, path: '' })
  async getUserList(
    @Context() ctx: EggContext,
    @HTTPQuery() query: {
      page?: string;
      pageSize?: string;
      role?: string;
      status?: string;
      search?: string;
    }
  ) {
    const auth = await this.verifyAuth(ctx, ['admin']);
    if (auth.error) {
      return { success: false, message: auth.error };
    }

    try {
      const page = parseInt(query.page || '1');
      const pageSize = parseInt(query.pageSize || '10');
      const filters: UserFilters = {
        role: query.role,
        status: query.status,
        search: query.search,
      };

      const result = await this.userService.getUserList(page, pageSize, filters);
      return { success: true, data: result };
    } catch (error: any) {
      ctx.status = 500;
      return { success: false, message: error.message || '获取用户列表失败' };
    }
  }

  // GET /api/users/:id - 获取指定用户信息（管理员功能）
  @HTTPMethod({ method: HTTPMethodEnum.GET, path: '/:id' })
  async getUser(@Context() ctx: EggContext, @HTTPParam() id: string) {
    const auth = await this.verifyAuth(ctx, ['admin']);
    if (auth.error) {
      return { success: false, message: auth.error };
    }

    try {
      const user = await this.userService.getUserById(id);
      if (!user) {
        ctx.status = 404;
        return { success: false, message: '用户不存在' };
      }

      return { success: true, data: user };
    } catch (error: any) {
      ctx.status = 500;
      return { success: false, message: error.message || '获取用户信息失败' };
    }
  }

  // PUT /api/users/:id - 更新用户信息（管理员功能）
  @HTTPMethod({ method: HTTPMethodEnum.PUT, path: '/:id' })
  async updateUser(
    @Context() ctx: EggContext,
    @HTTPParam() id: string,
    @HTTPBody() body: Partial<RegisterData & { status: string }>
  ) {
    const auth = await this.verifyAuth(ctx, ['admin']);
    if (auth.error) {
      return { success: false, message: auth.error };
    }

    try {
      // 验证角色
      if (body.role) {
        const validRoles = ['consumer', 'merchant', 'admin'];
        if (!validRoles.includes(body.role)) {
          ctx.status = 400;
          return { success: false, message: '无效的用户角色' };
        }
      }

      // 验证状态
      if (body.status) {
        const validStatuses = ['active', 'banned'];
        if (!validStatuses.includes(body.status)) {
          ctx.status = 400;
          return { success: false, message: '无效的用户状态' };
        }
      }

      const result = await this.userService.updateUser(id, body);
      if (!result) {
        ctx.status = 404;
        return { success: false, message: '用户不存在' };
      }

      return { success: true, data: result, message: '用户信息更新成功' };
    } catch (error: any) {
      ctx.status = 400;
      return { success: false, message: error.message || '更新用户信息失败' };
    }
  }

  // DELETE /api/users/:id - 删除用户（管理员功能）
  @HTTPMethod({ method: HTTPMethodEnum.DELETE, path: '/:id' })
  async deleteUser(@Context() ctx: EggContext, @HTTPParam() id: string) {
    const auth = await this.verifyAuth(ctx, ['admin']);
    if (auth.error) {
      return { success: false, message: auth.error };
    }

    try {
      const result = await this.userService.deleteUser(id);
      if (!result) {
        ctx.status = 404;
        return { success: false, message: '用户不存在' };
      }

      return { success: true, message: '用户删除成功' };
    } catch (error: any) {
      ctx.status = 400;
      return { success: false, message: error.message || '删除用户失败' };
    }
  }

  // PUT /api/users/:id/ban - 封禁用户（管理员功能）
  @HTTPMethod({ method: HTTPMethodEnum.PUT, path: '/:id/ban' })
  async banUser(@Context() ctx: EggContext, @HTTPParam() id: string) {
    const auth = await this.verifyAuth(ctx, ['admin']);
    if (auth.error) {
      return { success: false, message: auth.error };
    }

    try {
      const result = await this.userService.banUser(id);
      if (!result) {
        ctx.status = 404;
        return { success: false, message: '用户不存在' };
      }

      return { success: true, data: result, message: '用户封禁成功' };
    } catch (error: any) {
      ctx.status = 400;
      return { success: false, message: error.message || '封禁用户失败' };
    }
  }

  // PUT /api/users/:id/unban - 解封用户（管理员功能）
  @HTTPMethod({ method: HTTPMethodEnum.PUT, path: '/:id/unban' })
  async unbanUser(@Context() ctx: EggContext, @HTTPParam() id: string) {
    const auth = await this.verifyAuth(ctx, ['admin']);
    if (auth.error) {
      return { success: false, message: auth.error };
    }

    try {
      const result = await this.userService.unbanUser(id);
      if (!result) {
        ctx.status = 404;
        return { success: false, message: '用户不存在' };
      }

      return { success: true, data: result, message: '用户解封成功' };
    } catch (error: any) {
      ctx.status = 400;
      return { success: false, message: error.message || '解封用户失败' };
    }
  }
}