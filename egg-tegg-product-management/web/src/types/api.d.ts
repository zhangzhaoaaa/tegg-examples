declare namespace API {
  interface CurrentUser {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'consumer' | 'merchant';
    status: string;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
  }

  interface LoginParams {
    email: string;
    password: string;
  }

  interface RegisterParams {
    username: string;
    email: string;
    password: string;
    role?: 'admin' | 'consumer' | 'merchant';
  }

  interface Product {
    id: string;
    title: string;
    subtitle: string;
    quantity: number;
    images: string[];
    details: string;
    merchant_id: string;
    createdAt: string;
    updatedAt: string;
  }

  interface Order {
    id: string;
    userId: string;
    productId: string;
    quantity: number;
    totalPrice: number;
    status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
    createdAt: string;
    updatedAt: string;
    user?: CurrentUser;
    product?: Product;
  }

  interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
  }

  interface PaginationParams {
    page?: number;
    pageSize?: number;
  }

  interface PaginationResult<T> {
    list: T[];
    total: number;
    page: number;
    pageSize: number;
  }
}