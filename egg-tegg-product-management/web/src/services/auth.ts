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

// 登录
export async function login(params: API.LoginParams): Promise<API.ApiResponse<{ token: string; user: API.CurrentUser }>> {
  return api.post('/api/auth/login', params);
}

// 注册
export async function register(params: API.RegisterParams): Promise<API.ApiResponse<API.CurrentUser>> {
  return api.post('/api/auth/register', params);
}

// 获取当前用户信息
export async function getCurrentUser(): Promise<API.CurrentUser> {
  const response = await api.get('/api/auth/me');
  return response.data;
}

// 登出
export async function logout(): Promise<API.ApiResponse> {
  return api.post('/api/auth/logout');
}