import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:7001',
  timeout: 10000,
});

// 请求拦截器
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// 获取商品列表
export async function getProducts(params?: {
  page?: number;
  pageSize?: number;
  category?: string;
  keyword?: string;
}): Promise<API.ApiResponse<{
  list: API.Product[];
  total: number;
  page: number;
  pageSize: number;
}>> {
  return api.get('/api/products', { params });
}

// 获取商品详情
export async function getProduct(id: string): Promise<API.ApiResponse<API.Product>> {
  return api.get(`/api/products/${id}`);
}

// 创建商品
export async function createProduct(data: Omit<API.Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<API.ApiResponse<API.Product>> {
  return api.post('/api/products', data);
}

// 更新商品
export async function updateProduct(id: string, data: Partial<API.Product>): Promise<API.ApiResponse<API.Product>> {
  return api.put(`/api/products/${id}`, data);
}

// 删除商品
export async function deleteProduct(id: string): Promise<API.ApiResponse> {
  return api.delete(`/api/products/${id}`);
}