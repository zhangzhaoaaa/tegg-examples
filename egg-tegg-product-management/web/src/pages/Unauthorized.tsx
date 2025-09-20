import React from 'react';
import { Button, Result } from 'antd';
import { history } from 'umi';
import { useAuthStore } from '@/stores/authStore';

const Unauthorized: React.FC = () => {
  const { user } = useAuthStore();

  const handleBackHome = () => {
    // 根据用户角色跳转到对应的首页
    switch (user?.role) {
      case 'admin':
        history.push('/admin/users');
        break;
      case 'merchant':
        history.push('/merchant/dashboard');
        break;
      case 'consumer':
      default:
        history.push('/consumer/products');
        break;
    }
  };

  return (
    <Result
      status="403"
      title="403"
      subTitle="抱歉，您没有权限访问此页面。"
      extra={
        <Button type="primary" onClick={handleBackHome}>
          返回首页
        </Button>
      }
    />
  );
};

export default Unauthorized;