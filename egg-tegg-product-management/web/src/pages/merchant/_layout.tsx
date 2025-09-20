import React from 'react';
import { Outlet } from 'umi';
import AppLayout from '@/components/Layout/AppLayout';

const MerchantLayout: React.FC = () => {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
};

export default MerchantLayout;