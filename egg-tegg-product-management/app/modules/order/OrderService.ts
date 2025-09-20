import { SingletonProto, AccessLevel } from '@eggjs/tegg';
import { Order } from './model/Order';
import { Product } from '../product/model/Product';

export interface CreateOrderData {
  user_id: number;
  items: OrderItem[];
  total: number;
  status?: string;
}

export interface OrderItem {
  product_id: number;
  title: string;
  quantity: number;
  price: number;
}

export interface UpdateOrderData {
  status?: string;
  items?: OrderItem[];
  total?: number;
}

export interface OrderFilters {
  user_id?: string;
  status?: string;
  merchant_id?: string;
}

@SingletonProto({ accessLevel: AccessLevel.PUBLIC })
export class OrderService {

  // 创建订单
  async createOrder(orderData: CreateOrderData): Promise<Order> {
    // 验证商品库存
    for (const item of orderData.items) {
      const product = await Product.findOne({ id: item.product_id });
      if (!product) {
        throw new Error(`商品 ${item.product_id} 不存在`);
      }
      if (product.quantity < item.quantity) {
        throw new Error(`商品 ${product.title} 库存不足`);
      }
    }

    // 创建订单
    const order = await Order.create({
      user_id: orderData.user_id,
      items: JSON.stringify(orderData.items) as any,
      total: orderData.total,
      status: orderData.status || 'pending' as any,
      created_at: new Date()
    });

    // 更新商品库存
    for (const item of orderData.items) {
      await Product.update(
        { quantity: (Product as any).raw('quantity - ?', [item.quantity]) },
        { id: item.product_id.toString() }
      );
    }

    return order;
  }

  // 根据ID获取订单
  async getOrderById(id: string): Promise<Order | null> {
    const order = await Order.findOne({ id: parseInt(id) });
    if (order && order.items) {
      // 解析items JSON字符串
      try {
        (order as any).items = JSON.parse(order.items as unknown as string);
      } catch (e) {
        (order as any).items = [];
      }
    }
    return order;
  }

  // 获取订单列表（支持分页和过滤）
  async getOrderList(page: number = 1, pageSize: number = 10, filters: OrderFilters = {}) {
    const whereConditions: any = {};

    if (filters.user_id) {
      whereConditions.user_id = Number(filters.user_id);
    }

    if (filters.status) {
      whereConditions.status = filters.status;
    }

    // 如果是商家查询，需要通过订单项中的商品来过滤
    let orders;
    let total;

    if (filters.merchant_id) {
      // 获取该商家的所有商品ID
      const merchantProducts = await Product.find({ merchant_id: Number(filters.merchant_id) });
      const productIds = merchantProducts.map(p => p.id);

      // 查询包含这些商品的订单
      const allOrders = await Order.find(whereConditions);
      const filteredOrders = allOrders.filter(order => {
        try {
          const items = JSON.parse(order.items as unknown as string);
          return items.some((item: OrderItem) => productIds.includes(item.product_id.toString()));
        } catch (e) {
          return false;
        }
      });

      total = filteredOrders.length;
      orders = filteredOrders
        .slice((page - 1) * pageSize, page * pageSize)
        .map(order => {
          try {
            order.items = JSON.parse(order.items as unknown as string);
          } catch (e) {
            order.items = [];
          }
          return order;
        });
    } else {
      const totalCount = await Order.find(whereConditions).count();
      total = Number(totalCount);
      orders = await Order.find(whereConditions)
        .order('created_at', 'desc')
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      // 解析每个订单的items
      orders = orders.map(order => {
        try {
          order.items = JSON.parse(order.items as string);
        } catch (e) {
          order.items = [];
        }
        return order;
      });
    }

    return {
      list: orders,
      total: Number(total),
      page,
      pageSize,
      totalPages: Math.ceil(Number(total) / pageSize)
    };
  }

  // 更新订单
  async updateOrder(id: string, updateData: UpdateOrderData): Promise<Order> {
    const orderId = parseInt(id);
    const existingOrder = await Order.findOne({ id: orderId });
    
    if (!existingOrder) {
      throw new Error('订单不存在');
    }

    const updateFields: any = {};
    
    if (updateData.status !== undefined) {
      updateFields.status = updateData.status;
    }
    
    if (updateData.items !== undefined) {
      updateFields.items = JSON.stringify(updateData.items);
    }
    
    if (updateData.total !== undefined) {
      updateFields.total = updateData.total;
    }

    await Order.update(updateFields, { id: orderId });
    
    const updatedOrder = await Order.findOne({ id: orderId });
    if (updatedOrder && updatedOrder.items) {
      try {
        updatedOrder.items = JSON.parse(updatedOrder.items as unknown as string);
      } catch (e) {
        updatedOrder.items = [];
      }
    }
    
    return updatedOrder!;
  }

  // 删除订单
  async deleteOrder(id: string): Promise<boolean> {
    const orderId = parseInt(id);
    const order = await Order.findOne({ id: orderId });
    
    if (!order) {
      throw new Error('订单不存在');
    }

    // 如果订单状态为pending，需要恢复商品库存
    if (order.status === 'pending') {
      try {
        const items = JSON.parse(order.items as unknown as string);
        for (const item of items) {
          const product = await Product.findOne({ id: item.product_id });
          if (product) {
            await Product.update(
              { quantity: product.quantity + item.quantity },
              { id: item.product_id }
            );
          }
        }
      } catch (e) {
        // 忽略JSON解析错误
      }
    }

    await Order.remove({ id: orderId });
    return true;
  }

  // 获取用户的订单
  async getUserOrders(userId: number, page: number = 1, pageSize: number = 10) {
    return this.getOrderList(page, pageSize, { user_id: userId.toString() });
  }

  // 获取商家的订单
  async getMerchantOrders(merchantId: number, page: number = 1, pageSize: number = 10) {
    return this.getOrderList(page, pageSize, { merchant_id: merchantId.toString() });
  }

  // 获取销售统计（商家功能）
  async getSalesStats(merchantId: number) {
    const merchantProducts = await Product.find({ merchant_id: merchantId });
    const productIds = merchantProducts.map(p => p.id);

    const allOrders = await Order.find({ status: 'completed' });
    
    let totalSales = 0;
    let totalOrders = 0;
    let totalQuantity = 0;

    for (const order of allOrders) {
      try {
        const items = JSON.parse(order.items as unknown as string);
        const merchantItems = items.filter((item: OrderItem) => productIds.includes(item.product_id.toString()));
        
        if (merchantItems.length > 0) {
          totalOrders++;
          for (const item of merchantItems) {
            totalSales += item.price * item.quantity;
            totalQuantity += item.quantity;
          }
        }
      } catch (e) {
        // 忽略JSON解析错误
      }
    }

    return {
      totalSales,
      totalOrders,
      totalQuantity,
      averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0
    };
  }
}