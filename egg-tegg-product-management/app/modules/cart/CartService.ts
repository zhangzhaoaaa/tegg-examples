import { SingletonProto, AccessLevel } from '@eggjs/tegg';
import { Product } from '../product/model/Product';

export interface CartItem {
  product_id: number;
  quantity: number;
  price: number;
  title?: string;
  subtitle?: string;
  images?: string[];
}

export interface CartData {
  user_id: string;
  items: CartItem[];
  total: number;
  updated_at: Date;
}

export interface AddToCartData {
  product_id: number;
  quantity: number;
}

export interface UpdateCartData {
  quantity: number;
}

@SingletonProto({ accessLevel: AccessLevel.PUBLIC })
export class CartService {
  private carts: Map<string, CartData> = new Map();

  // 获取用户购物车
  async getCart(userId: string): Promise<CartData> {
    let cart = this.carts.get(userId);
    if (!cart) {
      cart = {
        user_id: userId,
        items: [],
        total: 0,
        updated_at: new Date(),
      };
      this.carts.set(userId, cart);
    }
    return cart;
  }

  // 添加商品到购物车
  async addToCart(userId: string, data: AddToCartData): Promise<CartItem> {
    // 验证商品是否存在
    const product = await Product.findOne({ id: data.product_id });
    if (!product) {
      throw new Error('商品不存在');
    }

    if (product.quantity < data.quantity) {
      throw new Error('商品库存不足');
    }

    const cart = await this.getCart(userId);
    
    // 查找是否已存在该商品
    const existingItemIndex = cart.items.findIndex(item => item.product_id === data.product_id);
    
    let cartItem: CartItem;
    
    if (existingItemIndex >= 0) {
      // 更新数量
      const newQuantity = cart.items[existingItemIndex].quantity + data.quantity;
      if (product.quantity < newQuantity) {
        throw new Error('商品库存不足');
      }
      cart.items[existingItemIndex].quantity = newQuantity;
      cartItem = cart.items[existingItemIndex];
    } else {
      // 添加新商品
      cartItem = {
        product_id: data.product_id,
        quantity: data.quantity,
        price: parseFloat(product.price?.toString() || '0'),
        title: product.title,
        subtitle: product.subtitle,
        images: product.images ? JSON.parse(product.images) : [],
      };
      cart.items.push(cartItem);
    }

    // 重新计算总价
    cart.total = this.calculateTotal(cart.items);
    cart.updated_at = new Date();
    
    this.carts.set(userId, cart);
    return cartItem;
  }

  // 获取购物车商品列表
  async getCartItems(userId: string): Promise<CartItem[]> {
    const cart = await this.getCart(userId);
    return cart.items;
  }

  // 更新购物车商品数量
  async updateCartItem(userId: string, productId: number, data: UpdateCartData): Promise<CartItem | null> {
    const cart = await this.getCart(userId);
    const itemIndex = cart.items.findIndex(item => item.product_id === productId);
    
    if (itemIndex === -1) {
      return null;
    }

    // 验证商品库存
    const product = await Product.findOne({ id: productId });
    if (!product) {
      throw new Error('商品不存在');
    }

    if (product.quantity < data.quantity) {
      throw new Error('商品库存不足');
    }

    if (data.quantity <= 0) {
      // 如果数量为0或负数，删除商品
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = data.quantity;
    }

    // 重新计算总价
    cart.total = this.calculateTotal(cart.items);
    cart.updated_at = new Date();
    
    this.carts.set(userId, cart);
    return itemIndex < cart.items.length ? cart.items[itemIndex] : null;
  }

  // 从购物车删除商品
  async removeFromCart(userId: string, productId: number): Promise<boolean> {
    const cart = await this.getCart(userId);
    const itemIndex = cart.items.findIndex(item => item.product_id === productId);
    
    if (itemIndex === -1) {
      return false;
    }

    cart.items.splice(itemIndex, 1);
    cart.total = this.calculateTotal(cart.items);
    cart.updated_at = new Date();
    
    this.carts.set(userId, cart);
    return true;
  }

  // 清空购物车
  async clearCart(userId: string): Promise<boolean> {
    const cart = await this.getCart(userId);
    cart.items = [];
    cart.total = 0;
    cart.updated_at = new Date();
    
    this.carts.set(userId, cart);
    return true;
  }

  // 获取购物车商品数量
  async getCartCount(userId: string): Promise<number> {
    const cart = await this.getCart(userId);
    return cart.items.reduce((count, item) => count + item.quantity, 0);
  }

  // 验证购物车库存
  async validateCartStock(userId: string): Promise<{ valid: boolean; errors: string[] }> {
    const cart = await this.getCart(userId);
    const errors: string[] = [];
    
    for (const item of cart.items) {
      const product = await Product.findOne({ id: item.product_id });
      if (!product) {
        errors.push(`商品 ${item.title} 不存在`);
        continue;
      }
      
      if (product.quantity < item.quantity) {
        errors.push(`商品 ${item.title} 库存不足，当前库存：${product.quantity}，需要：${item.quantity}`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // 计算总价
  private calculateTotal(items: CartItem[]): number {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  // 获取购物车总价
  async getCartTotal(userId: string): Promise<number> {
    const cart = await this.getCart(userId);
    return cart.total;
  }

  // 批量添加商品到购物车
  async addMultipleToCart(userId: string, items: { productId: number; quantity: number }[]): Promise<CartData> {
    for (const item of items) {
      await this.addToCart(userId, {
        product_id: item.productId,
        quantity: item.quantity,
      });
    }
    
    return await this.getCart(userId);
  }
}