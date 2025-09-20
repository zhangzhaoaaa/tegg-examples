import React from 'react';
import { Outlet } from 'umi';
import AppLayout from '@/components/Layout/AppLayout';

const AdminLayout: React.FC = () => {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
};

export default AdminLayout;