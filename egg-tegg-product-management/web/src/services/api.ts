import { 
  User, 
  LoginCredentials, 
  RegisterData, 
  AuthResult,
  CreateUserData,
  UpdateUserData,
  Product,
  CreateProductData,
  UpdateProductData,
  ProductListResponse,
  ProductQueryParams,
  Order,
  CreateOrderData,
  OrderListResponse,
  OrderQueryParams,
  Cart,
  ApiResponse,
  UserListResponse,
  SalesStats
} from '../types';

const API_BASE = '/api';

// 通用请求方法
async function request<T>(
  url: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  // 从 Zustand store 或 localStorage 获取 token
  const getToken = () => {
    // 首先尝试从 localStorage 获取
    const token = localStorage.getItem('token');
    if (token) return token;
    
    // 如果 localStorage 没有，尝试从 Zustand store 获取
    try {
      const authStore = JSON.parse(localStorage.getItem('auth-storage') || '{}');
      return authStore.state?.token || null;
    } catch {
      return null;
    }
  };

  const token = getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  // 如果有 token，添加 Authorization 头
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    credentials: 'include', // 包含cookies
    headers,
    ...options,
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || '请求失败');
  }
  
  return data;
}

// 用户相关 API
export const userApi = {
  login: (credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: credentials.email, // 后端使用email字段
        password: credentials.password,
      }),
    }),

  register: (data: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: data.name, // 后端使用username字段
        email: data.email,
        password: data.password,
        role: data.role,
        status: 1, // 添加status字段，1表示active
      }),
    }),

  getCurrentUser: (): Promise<ApiResponse<User>> =>
    request('/auth/current'),

  // 添加缺失的 logout 方法
  logout: (): Promise<ApiResponse<void>> =>
    request('/auth/logout', {
      method: 'POST',
    }),

  // 添加缺失的 getProfile 方法
  getProfile: (): Promise<ApiResponse<User>> =>
    request('/auth/profile'),

  getUsers: (page: number = 1, pageSize: number = 10): Promise<ApiResponse<UserListResponse>> =>
    request(`/users?page=${page}&pageSize=${pageSize}`),

  createUser: (data: CreateUserData): Promise<ApiResponse<User>> =>
    request('/users', {
      method: 'POST',
      body: JSON.stringify({
        username: data.name, // 后端使用username字段
        email: data.email,
        password: data.password,
        role: data.role,
      }),
    }),

  updateUser: (id: number, data: UpdateUserData): Promise<ApiResponse<User>> =>
    request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        username: data.name, // 后端使用username字段
        email: data.email,
        role: data.role,
        status: data.status,
      }),
    }),

  banUser: (id: number): Promise<ApiResponse<void>> =>
    request(`/users/${id}/ban`, {
      method: 'PUT',
    }),

  unbanUser: (id: number): Promise<ApiResponse<void>> =>
    request(`/users/${id}/unban`, {
      method: 'PUT',
    }),

  deleteUser: (id: number): Promise<ApiResponse<void>> =>
    request(`/users/${id}`, {
      method: 'DELETE',
    }),
};

// 商品相关API
export const productApi = {
  // 获取商品列表
  getProducts: (params: ProductQueryParams = {}): Promise<ApiResponse<ProductListResponse>> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    return request(`/products?${searchParams.toString()}`);
  },

  // 获取商品详情
  getProduct: (id: number): Promise<ApiResponse<Product>> =>
    request(`/products/${id}`),

  // 创建商品（商家）
  createProduct: (data: CreateProductData): Promise<ApiResponse<Product>> =>
    request('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 更新商品（商家）
  updateProduct: (id: number, data: UpdateProductData): Promise<ApiResponse<Product>> =>
    request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 删除商品（商家）
  deleteProduct: (id: number): Promise<ApiResponse> =>
    request(`/products/${id}`, {
      method: 'DELETE',
    }),

  // 获取商家自己的商品
  getMerchantProducts: (page = 1, limit = 10): Promise<ApiResponse<ProductListResponse>> =>
    request(`/products/merchant/my?page=${page}&limit=${limit}`),
};

// 订单相关API
export const orderApi = {
  // 创建订单
  createOrder: (data: CreateOrderData): Promise<ApiResponse<Order>> =>
    request('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 获取用户订单列表
  getUserOrders: (params: OrderQueryParams = {}): Promise<ApiResponse<OrderListResponse>> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    return request(`/orders/my?${searchParams.toString()}`);
  },

  // 获取订单详情
  getOrder: (id: number): Promise<ApiResponse<Order>> =>
    request(`/orders/${id}`),

  // 更新订单状态
  updateOrderStatus: (id: number, status: string): Promise<ApiResponse<Order>> =>
    request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // 取消订单
  cancelOrder: (id: number): Promise<ApiResponse> =>
    request(`/orders/${id}`, {
      method: 'DELETE',
    }),

  // 商家获取相关订单
  getMerchantOrders: (params: OrderQueryParams = {}): Promise<ApiResponse<OrderListResponse>> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    return request(`/orders/merchant/orders?${searchParams.toString()}`);
  },
};

// 购物车相关API
export const cartApi = {
  // 获取购物车
  getCart: (): Promise<ApiResponse<Cart>> =>
    request('/cart'),

  // 添加到购物车
  addToCart: (productId: number, quantity: number): Promise<ApiResponse> =>
    request('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),

  // 更新购物车商品数量
  updateCartItem: (productId: number, quantity: number): Promise<ApiResponse> =>
    request('/cart/update', {
      method: 'PUT',
      body: JSON.stringify({ productId, quantity }),
    }),

  // 从购物车移除商品
  removeFromCart: (productId: number): Promise<ApiResponse> =>
    request(`/cart/remove/${productId}`, {
      method: 'DELETE',
    }),

  // 清空购物车
  clearCart: (): Promise<ApiResponse> =>
    request('/cart/clear', {
      method: 'DELETE',
    }),
};

// 文件上传API
export const uploadApi = {
  // 上传图片
  uploadImage: (file: File): Promise<ApiResponse<{ url: string }>> => {
    const formData = new FormData();
    formData.append('file', file);
    
    return fetch(`${API_BASE}/upload/image`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    }).then(res => res.json());
  },
};

// 统计相关API（商家功能）
export const statsApi = {
  // 获取销售统计
  getSalesStats: (): Promise<ApiResponse<SalesStats>> =>
    request('/stats/sales'),
};