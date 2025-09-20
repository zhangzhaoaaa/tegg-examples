import { HTTPController, HTTPMethod, HTTPMethodEnum, HTTPBody, HTTPParam, Context, Inject } from '@eggjs/tegg';
import type { EggContext } from '@eggjs/tegg';
import { CartService, UpdateCartData } from '../modules/cart/CartService';
import { UserService } from '../modules/user/UserService';

@HTTPController({ path: '/api/cart' })
export class CartController {
  @Inject()
  private cartService: CartService;

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
    } catch (error) {
      ctx.status = 401;
      return { error: '认证失败' };
    }
  }

  // POST /api/cart/add - 添加商品到购物车
  @HTTPMethod({ method: HTTPMethodEnum.POST, path: '/add' })
  async addToCart(@Context() ctx: EggContext, @HTTPBody() body: any) {
    const auth = await this.verifyAuth(ctx, ['consumer']);
    if (auth.error) {
      return { success: false, message: auth.error };
    }

    try {
      const { product_id, quantity } = body;
      
      if (!product_id || !quantity || quantity <= 0) {
        ctx.status = 400;
        return { success: false, message: '商品ID和数量不能为空，且数量必须大于0' };
      }

      const cartItem = await this.cartService.addToCart(auth.id, {
        product_id: product_id,
        quantity: quantity
      });
      
      return { success: true, message: '商品已添加到购物车', data: { cart_item: cartItem } };
    } catch (error: any) {
      ctx.status = 400;
      return { success: false, message: '添加到购物车失败' };
    }
  }

  // GET /api/cart - 获取购物车列表
  @HTTPMethod({ method: HTTPMethodEnum.GET, path: '' })
  async getCart(@Context() ctx: EggContext) {
    const auth = await this.verifyAuth(ctx, ['consumer']);
    if (auth.error) {
      return { success: false, message: auth.error };
    }

    try {
      const cartItems = await this.cartService.getCartItems(auth.id);
      return { success: true, data: { cart_items: cartItems } };
    } catch (error: any) {
      ctx.status = 500;
      return { success: false, message: '获取购物车失败' };
    }
  }

  // PUT /api/cart/:productId - 更新购物车商品数量
  @HTTPMethod({ method: HTTPMethodEnum.PUT, path: '/:productId' })
  async updateCartItem(
    @Context() ctx: EggContext,
    @HTTPParam() productId: string,
    @HTTPBody() body: UpdateCartData
  ) {
    const auth = await this.verifyAuth(ctx, ['consumer']);
    if (auth.error) {
      return { success: false, message: auth.error };
    }

    try {
      const { quantity } = body;
      
      if (!quantity || quantity <= 0) {
        ctx.status = 400;
        return { success: false, message: '数量必须大于0' };
      }

      const result = await this.cartService.updateCartItem(auth.userId, parseInt(productId), body);
      if (!result) {
        ctx.status = 404;
        return { success: false, message: '购物车中未找到该商品' };
      }

      return { success: true, data: result, message: '购物车更新成功' };
    } catch (error: any) {
      ctx.status = 400;
      return { success: false, message: error.message || '更新购物车失败' };
    }
  }

  // DELETE /api/cart/:productId - 从购物车删除商品
  @HTTPMethod({ method: HTTPMethodEnum.DELETE, path: '/:productId' })
  async removeFromCart(@Context() ctx: EggContext, @HTTPParam() productId: string) {
    const auth = await this.verifyAuth(ctx, ['consumer']);
    if (auth.error) {
      return { success: false, message: auth.error };
    }

    try {
      const result = await this.cartService.removeFromCart(auth.userId, parseInt(productId));
      if (!result) {
        ctx.status = 404;
        return { success: false, message: '购物车中未找到该商品' };
      }

      return { success: true, message: '商品已从购物车删除' };
    } catch (error: any) {
      ctx.status = 400;
      return { success: false, message: error.message || '删除商品失败' };
    }
  }

  // DELETE /api/cart - 清空购物车
  @HTTPMethod({ method: HTTPMethodEnum.DELETE, path: '' })
  async clearCart(@Context() ctx: EggContext) {
    const auth = await this.verifyAuth(ctx, ['consumer']);
    if (auth.error) {
      return { success: false, message: auth.error };
    }

    try {
      await this.cartService.clearCart(auth.userId);
      return { success: true, message: '购物车已清空' };
    } catch (error: any) {
      ctx.status = 500;
      return { success: false, message: error.message || '清空购物车失败' };
    }
  }

  // GET /api/cart/count - 获取购物车商品数量
  @HTTPMethod({ method: HTTPMethodEnum.GET, path: '/count' })
  async getCartCount(@Context() ctx: EggContext) {
    const auth = await this.verifyAuth(ctx, ['consumer']);
    if (auth.error) {
      return { success: false, message: auth.error };
    }

    try {
      const count = await this.cartService.getCartCount(auth.id);
      return { success: true, data: { count } };
    } catch (error: any) {
      ctx.status = 500;
      return { success: false, message: error.message || '获取购物车数量失败' };
    }
  }
}