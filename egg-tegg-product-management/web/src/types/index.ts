// 用户相关类型
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'consumer' | 'merchant' | 'admin';
  status: 'active' | 'banned' | 'inactive';
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  role?: 'consumer' | 'merchant';
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'consumer' | 'merchant' | 'admin';
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: 'consumer' | 'merchant' | 'admin';
  status?: 'active' | 'banned' | 'inactive';
}

export interface AuthResult {
  user: User;
  token: string;
}

// 商品相关类型
export interface Product {
  id: number;
  title: string;
  subtitle: string;
  quantity: number;
  images: string[];
  details: string;
  merchant_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProductData {
  title: string;
  subtitle: string;
  quantity: number;
  images: string[];
  details: string;
}

export interface UpdateProductData {
  title?: string;
  subtitle?: string;
  quantity?: number;
  images?: string[];
  details?: string;
}

export interface ProductListResponse {
  products: Product[];
  list?: Product[];
  total: number;
  page: number;
  limit?: number;
  pageSize?: number;
}

// 订单相关类型
export interface OrderItem {
  product_id: number;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Order {
  id: number;
  user_id: number;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface CreateOrderData {
  items: Array<{
    productId: number;
    quantity: number;
    price: number;
  }>;
  total: number;
}

export interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}

// 购物车相关类型
export interface CartItem {
  product_id: number;
  quantity: number;
  product?: Product;
}

export interface Cart {
  id: number;
  user_id: number;
  items: CartItem[];
  total: number;
  updated_at: string;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

// 分页参数
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// 商品查询参数
export interface ProductQueryParams extends PaginationParams {
  category?: string;
  title?: string;
}

// 订单查询参数
export interface OrderQueryParams extends PaginationParams {
  status?: string;
}

// 用户管理相关类型（管理员功能）
export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

// 销售统计类型（商家功能）
export interface SalesStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  recentOrders: Order[];
}

// 上传文件类型
export interface UploadFile {
  uid: string;
  name: string;
  status: 'uploading' | 'done' | 'error';
  url?: string;
  response?: any;
}