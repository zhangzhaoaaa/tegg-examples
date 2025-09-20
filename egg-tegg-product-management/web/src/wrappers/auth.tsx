import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'umi';
import { Spin } from 'antd';
import { useAuthStore } from '@/stores/authStore';

interface AuthWrapperProps {
  children?: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
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

  return children ? <>{children}</> : <Outlet />;
};

export default AuthWrapper;