import { SingletonProto, AccessLevel } from '@eggjs/tegg';
import { Product } from './model/Product';

export interface CreateProductData {
  title: string;
  subtitle?: string;
  price: number;
  quantity: number;
  images?: string[]; // 最多三张图片
  details?: string;
  merchant_id: number;
}

export interface UpdateProductData {
  title?: string;
  subtitle?: string;
  price?: number;
  quantity?: number;
  images?: string[]; // 最多三张图片
  details?: string;
}

export interface ProductFilters {
  merchant_id?: string;
  status?: string;
  search?: string;
}

@SingletonProto({ accessLevel: AccessLevel.PUBLIC })
export class ProductService {
  async createProduct(data: CreateProductData) {
    const { title, subtitle, price, quantity, images = [], details, merchant_id } = data;
    
    // 限制图片数量最多3张
    const limitedImages = images.slice(0, 3);
    
    const productId = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const product = await Product.create({
      id: productId,
      title,
      subtitle: subtitle || '',
      price,
      quantity,
      images: JSON.stringify(limitedImages),
      details: details || '',
      status: 1,
      merchant_id
    });

    return {
      id: product.id,
      title: product.title,
      subtitle: product.subtitle,
      quantity: product.quantity,
      images: product.images,
      details: product.details,
      status: product.status,
      merchant_id: product.merchant_id,
      created_at: product.created_at,
      updated_at: product.updated_at
    };
  }

  async getProductById(id: string) {
    const product = await Product.findOne({ id });
    if (!product) {
      return null;
    }

    return {
      id: product.id,
      title: product.title,
      subtitle: product.subtitle,
      quantity: product.quantity,
      images: product.images,
      details: product.details,
      status: product.status,
      merchant_id: product.merchant_id,
      created_at: product.created_at,
      updated_at: product.updated_at
    };
  }

  async getProductList(page: number = 1, pageSize: number = 10, filters: ProductFilters = {}) {
    const offset = (page - 1) * pageSize;
    const whereConditions: any = {};
    
    if (filters.merchant_id) {
      whereConditions.merchant_id = filters.merchant_id;
    }
    
    if (filters.status) {
      whereConditions.status = filters.status === 'active' ? 1 : 0;
    }

    const [totalRaw, products] = await Promise.all([
      Product.count(whereConditions as any),
      Product.find(whereConditions as any)
        .order('created_at', 'desc')
        .limit(pageSize)
        .offset(offset) as unknown as Promise<Product[]>
    ]);

    const total = Number(totalRaw);

    return {
        products: products.map(product => ({
          id: product.id,
          title: product.title,
          subtitle: product.subtitle,
          price: product.price,
          quantity: product.quantity,
          images: product.images,
          details: product.details,
          status: product.status,
          merchant_id: product.merchant_id,
          created_at: product.created_at,
          updated_at: product.updated_at
        })),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      };
  }

  async updateProduct(id: string, data: UpdateProductData) {
    const product = await Product.findOne({ id });
    if (!product) {
      throw new Error('商品不存在');
    }

    const updateData: any = {};
    
    if (data.title) {
      updateData.title = data.title;
    }

    if (data.subtitle !== undefined) {
      updateData.subtitle = data.subtitle;
    }

    if (data.quantity !== undefined) {
      updateData.quantity = data.quantity;
    }

    if (data.images) {
      // 限制图片数量最多3张
      updateData.images = data.images.slice(0, 3);
    }

    if (data.details !== undefined) {
      updateData.details = data.details;
    }

    await product.update(updateData);
    
    return {
      id: product.id,
      title: product.title,
      subtitle: product.subtitle,
      quantity: product.quantity,
      images: product.images,
      details: product.details,
      status: product.status,
      merchant_id: product.merchant_id,
      created_at: product.created_at,
      updated_at: product.updated_at
    };
  }

  async deleteProduct(id: string) {
    const product = await Product.findOne({ id });
    if (!product) {
      throw new Error('商品不存在');
    }

    await product.remove();
    return { message: '商品删除成功' };
  }

  async updateStock(id: string, quantity: number) {
    return this.updateProduct(id, { quantity });
  }

  async getMerchantProducts(merchantId: string, page: number = 1, pageSize: number = 10) {
    return this.getProductList(page, pageSize, { merchant_id: merchantId });
  }

  async toggleProductStatus(id: string) {
    const product = await Product.findOne({ id });
    if (!product) {
      throw new Error('商品不存在');
    }

    const newStatus = product.status === 1 ? 0 : 1;
    await product.update({ status: newStatus });
    
    return {
      id: product.id,
      status: newStatus,
      message: newStatus === 1 ? '商品已上架' : '商品已下架'
    };
  }
}