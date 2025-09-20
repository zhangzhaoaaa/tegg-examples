import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'umi';
import { Spin } from 'antd';
import { useAuthStore } from '@/stores/authStore';

interface MerchantAuthWrapperProps {
  children?: React.ReactNode;
}

const MerchantAuthWrapper: React.FC<MerchantAuthWrapperProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user, getProfile } = useAuthStore();

  useEffect(() => {
    // 如果有token但没有用户信息，尝试获取用户资料
    if (!user && !isLoading) {
      getProfile();
    }
  }, [user, isLoading, getProfile]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (user.role !== 'merchant') {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default MerchantAuthWrapper;