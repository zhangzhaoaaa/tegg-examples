import { HTTPController, HTTPMethod, HTTPMethodEnum, HTTPBody, Context, Inject } from '@eggjs/tegg';
import type { EggContext } from '@eggjs/tegg';
import { UserService } from '../modules/user/UserService';

@HTTPController({ path: '/api/auth' })
export class AuthController {
  @Inject()
  userService: UserService;

  // POST /api/auth/register - 用户注册
  @HTTPMethod({ method: HTTPMethodEnum.POST, path: '/register' })
  async register(@Context() ctx: EggContext, @HTTPBody() body: any) {
    try {
      const { email, password, role = 'consumer' } = body;
      
      if (!email || !password) {
        ctx.status = 400;
        return { success: false, message: '邮箱和密码不能为空' };
      }

      // 验证角色
      const validRoles = ['consumer', 'merchant', 'admin'];
      if (role && !validRoles.includes(role)) {
        ctx.status = 400;
        return { success: false, message: '无效的用户角色' };
      }

      const result = await this.userService.register({ username: email, email, password, role });
      ctx.status = 201;
      return {
        success: true,
        message: '注册成功',
        data: {
          user: { id: result.id, email: result.email, role: result.role },
          token: result.token
        }
      };
    } catch (error: any) {
      if (error.message.includes('已存在') || error.message.includes('UNIQUE')) {
        ctx.status = 400;
        return { success: false, message: '邮箱已存在' };
      }
      ctx.status = 500;
      return { success: false, message: '注册失败' };
    }
  }

  // POST /api/auth/login - 用户登录
  @HTTPMethod({ method: HTTPMethodEnum.POST, path: '/login' })
  async login(@Context() ctx: EggContext, @HTTPBody() body: any) {
    try {
      const { email, password } = body;
      
      if (!email || !password) {
        ctx.status = 400;
        return { success: false, message: '邮箱和密码不能为空' };
      }

      const result = await this.userService.loginByEmail({ email, password });
      return {
        success: true,
        message: '登录成功',
        data: {
          user: { id: result.user.id, email: result.user.email, role: result.user.role },
          token: result.token
        }
      };
    } catch (error: any) {
      if (error.message.includes('不存在')) {
        ctx.status = 401;
        return { success: false, message: '用户不存在' };
      }
      if (error.message.includes('密码')) {
        ctx.status = 401;
        return { success: false, message: '密码错误' };
      }
      ctx.status = 500;
      return { success: false, message: '登录失败' };
    }
  }

  // GET /api/auth/profile - 获取当前用户信息
  @HTTPMethod({ method: HTTPMethodEnum.GET, path: '/profile' })
  async getProfile(@Context() ctx: EggContext) {
    const token = ctx.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      ctx.status = 401;
      return { success: false, message: '未提供认证令牌' };
    }

    try {
      const decoded: any = this.userService.verifyToken(token);
      const user = await this.userService.getUserById(decoded.id);
      
      if (!user) {
        ctx.status = 404;
        return { success: false, message: '用户不存在' };
      }

      return { success: true, data: user };
    } catch (error: any) {
      ctx.status = 401;
      return { success: false, message: error.message || '获取用户信息失败' };
    }
  }

  // POST /api/auth/logout - 用户登出（可选实现）
  @HTTPMethod({ method: HTTPMethodEnum.POST, path: '/logout' })
  async logout() {
    // 由于使用JWT，登出主要在前端处理（删除token）
    // 这里可以实现token黑名单等高级功能
    return { success: true, message: '登出成功' };
  }
}