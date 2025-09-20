import { HTTPController, HTTPMethod, HTTPMethodEnum, HTTPBody, HTTPParam, HTTPQuery, Context, Inject } from '@eggjs/tegg';
import type { EggContext } from '@eggjs/tegg';
import { OrderService, CreateOrderData, OrderFilters } from '../modules/order/OrderService';
import { UserService } from '../modules/user/UserService';

@HTTPController({ path: '/api/orders' })
export class OrderController {
  @Inject()
  private orderService: OrderService;

  @Inject()
  private userService: UserService;

  // 验证用户权限的中间件方法
  private async verifyAuth(ctx: EggContext, requiredRoles: string[] = []): Promise<any> {
    const token = ctx.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      ctx.status = 401;
      return { error: '未提供认证令牌' };
    }

    try {
      const decoded: any = this.userService.verifyToken(token);
      if (requiredRoles.length > 0 && !requiredRoles.includes(decoded.role)) {
        ctx.status = 403;
        return { error: '权限不足' };
      }
      return decoded;
    } catch (error: any) {
      ctx.status = 401;
      return { error: '认证失败' };
    }
  }

  // POST /api/orders - 创建订单（支持购物车下单和直接下单）
  @HTTPMethod({ method: HTTPMethodEnum.POST, path: '' })
  async createOrder(@Context() ctx: EggContext, @HTTPBody() body: any) {
    const auth = await this.verifyAuth(ctx, ['consumer']);
    if (auth.error) {
      return { success: false, message: auth.error };
    }

    try {
      const { items, total } = body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        ctx.status = 400;
        return { success: false, message: '订单商品不能为空' };
      }

      if (!total || total <= 0) {
        ctx.status = 400;
        return { success: false, message: '订单总金额必须大于0' };
      }

      // 验证每个商品项
      for (const item of items) {
        if (!item.product_id || !item.quantity || item.quantity <= 0 || !item.price || item.price <= 0) {
          ctx.status = 400;
          return { success: false, message: '商品信息不完整或无效' };
        }
      }

      const orderData: CreateOrderData = {
        user_id: auth.id,
        items,
        total,
      };

      const order = await this.orderService.createOrder(orderData);
      return { success: true, message: '订单创建成功', data: { order } };
    } catch (error: any) {
      ctx.status = 400;
      return { success: false, message: '创建订单失败' };
    }
  }

  // GET /api/orders/my - 获取我的订单列表（消费者功能）
  @HTTPMethod({ method: HTTPMethodEnum.GET, path: '/my' })
  async getMyOrders(
    @Context() ctx: EggContext,
    @HTTPQuery() query: { page?: string; limit?: string }
  ) {
    const auth = await this.verifyAuth(ctx, ['consumer']);
    if (auth.error) {
      return { success: false, message: auth.error };
    }

    try {
      const page = parseInt(query.page || '1');
      const limit = parseInt(query.limit || '10');

      const result = await this.orderService.getUserOrders(auth.id, page, limit);
      return { 
        success: true, 
        data: { 
          orders: result.list,
          list: result.list, // 保持向后兼容
          total: result.total || result.list.length,
          page,
          limit
        } 
      };
    } catch (error: any) {
      ctx.status = 500;
      return { success: false, message: '获取订单列表失败' };
    }
  }

  // GET /api/orders - 获取所有订单列表（商家和管理员功能）
  @HTTPMethod({ method: HTTPMethodEnum.GET, path: '' })
  async getAllOrders(
    @Context() ctx: EggContext,
    @HTTPQuery() query: { 
      page?: string; 
      pageSize?: string; 
      status?: string; 
      user_id?: string;
      start_date?: string;
      end_date?: string;
    }
  ) {
    const auth = await this.verifyAuth(ctx, ['merchant', 'admin']);
    if (auth.error) {
      return { success: false, message: auth.error };
    }

    try {
      const page = parseInt(query.page || '1');
      const pageSize = parseInt(query.pageSize || '10');
      const filters: OrderFilters = {
        status: query.status,
        user_id: query.user_id,
      };

      const result = await this.orderService.getOrderList(page, pageSize, filters);
      return { success: true, data: result };
    } catch (error: any) {
      ctx.status = 500;
      return { success: false, message: error.message || '获取订单列表失败' };
    }
  }

  // GET /api/orders/:id - 获取订单详情
  @HTTPMethod({ method: HTTPMethodEnum.GET, path: '/:id' })
  async getOrder(@Context() ctx: EggContext, @HTTPParam() id: string) {
    const auth = await this.verifyAuth(ctx);
    if (auth.error) {
      return { success: false, message: auth.error };
    }

    try {
      const order: any = await this.orderService.getOrderById(id);
      if (!order) {
        ctx.status = 404;
        return { success: false, message: '订单不存在' };
      }

      // 消费者只能查看自己的订单
      if (auth.role === 'consumer' && order.user_id !== auth.id) {
        ctx.status = 403;
        return { success: false, message: '无权查看此订单' };
      }

      return { success: true, data: order };
    } catch (error: any) {
      ctx.status = 500;
      return { success: false, message: error.message || '获取订单详情失败' };
    }
  }

  // PUT /api/orders/:id/status - 更新订单状态（商家功能）
  @HTTPMethod({ method: HTTPMethodEnum.PUT, path: '/:id/status' })
  async updateOrderStatus(
    @Context() ctx: EggContext,
    @HTTPParam() id: string,
    @HTTPBody() body: { status: string }
  ) {
    const auth = await this.verifyAuth(ctx, ['merchant', 'admin']);
    if (auth.error) {
      return { success: false, message: auth.error };
    }

    try {
      const { status } = body;
      
      if (!status) {
        ctx.status = 400;
        return { success: false, message: '订单状态不能为空' };
      }

      // 验证状态值
      const validStatuses = ['pending', 'confirmed', 'shipped', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        ctx.status = 400;
        return { success: false, message: '无效的订单状态' };
      }

      const result = await this.orderService.updateOrder(id, { status });
      if (!result) {
        ctx.status = 404;
        return { success: false, message: '订单不存在' };
      }

      return { success: true, data: result, message: '订单状态更新成功' };
    } catch (error: any) {
      ctx.status = 400;
      return { success: false, message: error.message || '更新订单状态失败' };
    }
  }

  // PUT /api/orders/:id/cancel - 取消订单
  @HTTPMethod({ method: HTTPMethodEnum.PUT, path: '/:id/cancel' })
  async cancelOrder(@Context() ctx: EggContext, @HTTPParam() id: string) {
    const auth = await this.verifyAuth(ctx, ['consumer', 'admin']);
    if (auth.error) {
      return { success: false, message: auth.error };
    }

    try {
      const order = await this.orderService.updateOrder(id, { status: 'cancelled' });
      return { success: true, data: order, message: '订单取消成功' };
    } catch (error: any) {
      ctx.status = 400;
      return { success: false, message: error.message };
    }
  }

  // GET /api/orders/stats - 获取订单统计（商家销售大盘）
  @HTTPMethod({ method: HTTPMethodEnum.GET, path: '/stats' })
  async getOrderStats(@Context() ctx: EggContext) {
    const auth = await this.verifyAuth(ctx, ['merchant', 'admin']);
    if (auth.error) {
      return { success: false, message: auth.error };
    }

    try {
      // 如果是商家，只查看自己的订单统计
      const merchantId = auth.role === 'merchant' ? auth.id : undefined;
      const stats = await this.orderService.getSalesStats(merchantId || 0);
      return { success: true, data: stats };
    } catch (error: any) {
      ctx.status = 500;
      return { success: false, message: error.message || '获取订单统计失败' };
    }
  }

  // GET /api/orders/recent - 获取最近订单（管理员功能）
  @HTTPMethod({ method: HTTPMethodEnum.GET, path: '/recent' })
  async getRecentOrders(
    @Context() ctx: EggContext,
    @HTTPQuery() query: { limit?: string }
  ) {
    const auth = await this.verifyAuth(ctx, ['admin']);
    if (auth.error) {
      return { success: false, message: auth.error };
    }

    try {
      const limit = parseInt(query.limit || '10');
      const result = await this.orderService.getOrderList(1, limit);
      return { success: true, data: result };
    } catch (error: any) {
      ctx.status = 500;
      return { success: false, message: error.message || '获取最近订单失败' };
    }
  }
}