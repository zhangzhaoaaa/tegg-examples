import { HTTPController, HTTPMethod, HTTPMethodEnum, HTTPBody, HTTPParam, HTTPQuery, Context, Inject } from '@eggjs/tegg';
import type { EggContext } from '@eggjs/tegg';
import { ProductService, CreateProductData, UpdateProductData } from '../modules/product/ProductService';
import { UserService } from '../modules/user/UserService';

@HTTPController({ path: '/api/products' })
export class ProductController {
  @Inject()
  private productService: ProductService;

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

  // GET /api/products - 获取商品列表（消费者浏览商品）
  @HTTPMethod({ method: HTTPMethodEnum.GET, path: '' })
  async getProducts(
    @Context() ctx: EggContext,
    @HTTPQuery() query: { page?: string; limit?: string; merchant_id?: string; status?: string; search?: string }
  ) {
    try {
      const page = parseInt(query.page || '1');
      const limit = parseInt(query.limit || '10');
      
      const result = await this.productService.getProductList(page, limit, {
        merchant_id: query.merchant_id,
        status: query.status,
        search: query.search,
      });

      // 格式化返回数据以匹配 simple-api-server.js 的格式
      const formattedProducts = result.products.map(product => ({
        ...product,
        images: product.images ? JSON.parse(product.images as string) : []
      }));

      return { 
        success: true, 
        data: { 
          list: formattedProducts,
          products: formattedProducts, // 保持向后兼容
          total: result.total || formattedProducts.length,
          page,
          limit
        } 
      };
    } catch (error: any) {
      ctx.status = 500;
      return { success: false, message: '获取商品列表失败' };
    }
  }

  // GET /api/products/:id - 获取商品详情
  @HTTPMethod({ method: HTTPMethodEnum.GET, path: '/:id' })
  async getProduct(@Context() ctx: EggContext, @HTTPParam() id: string) {
    try {
      const product = await this.productService.getProductById(id);
      if (!product) {
        ctx.status = 404;
        return { success: false, message: '商品不存在' };
      }
      return { success: true, data: product };
    } catch (error: any) {
      ctx.status = 500;
      return { success: false, message: error.message };
    }
  }

  // POST /api/products - 创建商品（商家功能）
  @HTTPMethod({ method: HTTPMethodEnum.POST, path: '' })
  async createProduct(@Context() ctx: EggContext, @HTTPBody() body: any) {
    const auth = await this.verifyAuth(ctx, ['merchant', 'admin']);
    if (auth.error) {
      return { error: auth.error };
    }

    try {
      const { title, subtitle, price, quantity, images, details } = body;
      
      if (!title || !price) {
        ctx.status = 400;
        return { error: '商品标题和价格不能为空' };
      }

      // 验证图片数量不超过3张
      if (images && images.length > 3) {
        ctx.status = 400;
        return { error: '封面图片最多只能上传3张' };
      }

      const productData: CreateProductData = {
        title,
        subtitle,
        price,
        quantity: quantity || 0,
        images,
        details,
        merchant_id: auth.id
      };

      const product = await this.productService.createProduct(productData);
      
      return {
        message: '商品创建成功',
        product: {
          id: product.id,
          title,
          subtitle,
          price,
          quantity: quantity || 0,
          images: images || [],
          details,
          merchant_id: auth.id
        }
      };
    } catch (error: any) {
      ctx.status = 500;
      return { error: '创建商品失败' };
    }
  }

  // PUT /api/products/:id - 更新商品信息（商家功能）
  @HTTPMethod({ method: HTTPMethodEnum.PUT, path: '/:id' })
  async updateProduct(
    @Context() ctx: EggContext,
    @HTTPParam() id: string,
    @HTTPBody() body: UpdateProductData
  ) {
    const auth = await this.verifyAuth(ctx, ['merchant', 'admin']);
    if (auth.error) {
      return { success: false, message: auth.error };
    }

    try {
      const { images } = body;
      
      // 验证图片数量不超过3张
      if (images && images.length > 3) {
        ctx.status = 400;
        return { success: false, message: '封面图片最多只能上传3张' };
      }

      const result = await this.productService.updateProduct(id, body);
      return { success: true, data: result, message: '商品更新成功' };
    } catch (error: any) {
      ctx.status = 400;
      return { success: false, message: error.message };
    }
  }

  // DELETE /api/products/:id - 删除商品（商家功能）
  @HTTPMethod({ method: HTTPMethodEnum.DELETE, path: '/:id' })
  async deleteProduct(@Context() ctx: EggContext, @HTTPParam() id: string) {
    const auth = await this.verifyAuth(ctx, ['merchant', 'admin']);
    if (auth.error) {
      return { success: false, message: auth.error };
    }

    try {
      const result = await this.productService.deleteProduct(id);
      return { success: true, data: result, message: '商品删除成功' };
    } catch (error: any) {
      ctx.status = 400;
      return { success: false, message: error.message };
    }
  }

  // GET /api/products/categories - 获取商品分类列表
  @HTTPMethod({ method: HTTPMethodEnum.GET, path: '/categories' })
  async getCategories(@Context() ctx: EggContext) {
    try {
      // 根据TRADE项目需求，商品只有标题、副标题、数量、封面图片、详细信息字段
      // 不需要分类功能，返回空数组
      return { success: true, data: [] };
    } catch (error: any) {
      ctx.status = 500;
      return { success: false, message: error.message };
    }
  }
}