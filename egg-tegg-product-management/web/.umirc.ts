import { defineConfig } from '@umijs/max';

export default defineConfig({
  routes: [
    {
      path: '/',
      redirect: '/consumer/products',
    },
    // 认证相关路由（无需权限）
    {
      name: '登录',
      path: '/auth/login',
      component: './auth/Login',
      layout: false,
    },
    {
      name: '注册',
      path: '/auth/register',
      component: './auth/Register',
      layout: false,
    },
    // 未授权页面
    {
      path: '/unauthorized',
      component: './Unauthorized',
      layout: false,
    },
    // 消费者路由（需要登录）
    {
      path: '/consumer',
      component: './consumer/_layout',
      wrappers: ['@/wrappers/consumerAuth'],
      routes: [
        {
          path: 'products',
          component: './consumer/ProductList',
        },
        {
          path: 'cart',
          component: './consumer/Cart',
        },
        {
          index: true,
          redirect: '/consumer/products',
        },
      ],
    },
    // 商家路由（需要商家权限）
    {
      path: '/merchant',
      component: './merchant/_layout',
      wrappers: ['@/wrappers/merchantAuth'],
      routes: [
        {
          path: 'dashboard',
          component: './merchant/SalesDashboard',
        },
        {
          path: 'products',
          component: './merchant/ProductManagement',
        },
        {
          index: true,
          redirect: '/merchant/dashboard',
        },
      ],
    },
    // 管理员路由（需要管理员权限）
    {
      path: '/admin',
      component: './admin/_layout',
      wrappers: ['@/wrappers/adminAuth'],
      routes: [
        {
          path: 'users',
          component: './admin/UserManagement',
        },
        {
          index: true,
          redirect: '/admin/users',
        },
      ],
    },
    // 兼容旧路由
    {
      path: '/dashboard',
      redirect: '/consumer/products',
    },
    {
      path: '/products',
      redirect: '/consumer/products',
    },
    {
      path: '/orders',
      redirect: '/consumer/cart',
    },
  ],
  npmClient: 'npm',
  proxy: {
    '/api': {
      target: 'http://localhost:7001',
      changeOrigin: true,
    },
  },
});