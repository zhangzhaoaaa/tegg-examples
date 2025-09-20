export default function access(initialState: { currentUser?: API.CurrentUser } | undefined) {
  const { currentUser } = initialState ?? {};

  return {
    // 基础权限
    canUser: !!currentUser,
    canAdmin: currentUser?.role === 'admin',
    canMerchant: currentUser?.role === 'merchant',
    canConsumer: currentUser?.role === 'consumer',
    
    // 组合权限
    canManageUsers: currentUser?.role === 'admin',
    canManageProducts: currentUser?.role === 'merchant' || currentUser?.role === 'admin',
    canViewSales: currentUser?.role === 'merchant' || currentUser?.role === 'admin',
    canShop: currentUser?.role === 'consumer',
  };
}