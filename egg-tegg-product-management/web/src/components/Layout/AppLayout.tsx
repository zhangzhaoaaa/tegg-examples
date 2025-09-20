import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Space } from 'antd';
import { UserOutlined, LogoutOutlined, MenuOutlined } from '@ant-design/icons';
import { history, useLocation } from 'umi';
import { useAuthStore } from '@/stores/authStore';
import './AppLayout.less';

const { Header, Content, Sider } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [collapsed, setCollapsed] = React.useState(false);

  // 根据用户角色生成菜单项
  const getMenuItems = () => {
    const role = user?.role;
    
    switch (role) {
      case 'admin':
        return [
          {
            key: '/admin/users',
            label: '用户管理',
            onClick: () => history.push('/admin/users'),
          },
        ];
      case 'merchant':
        return [
          {
            key: '/merchant/dashboard',
            label: '销售大盘',
            onClick: () => history.push('/merchant/dashboard'),
          },
          {
            key: '/merchant/products',
            label: '商品管理',
            onClick: () => history.push('/merchant/products'),
          },
        ];
      case 'consumer':
      default:
        return [
          {
            key: '/consumer/products',
            label: '商品列表',
            onClick: () => history.push('/consumer/products'),
          },
          {
            key: '/consumer/cart',
            label: '购物车',
            onClick: () => history.push('/consumer/cart'),
          },
        ];
    }
  };

  const handleLogout = () => {
    logout();
    history.push('/auth/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: '个人信息',
      icon: <UserOutlined />,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case 'admin':
        return '管理员';
      case 'merchant':
        return '商家';
      case 'consumer':
        return '消费者';
      default:
        return '用户';
    }
  };

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <div className="header-left">
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="menu-trigger"
          />
          <div className="logo">
            TRADE 电商系统
          </div>
        </div>
        <div className="header-right">
          <Space>
            <span className="user-role">{getRoleDisplayName(user?.role)}</span>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space className="user-info">
                <Avatar icon={<UserOutlined />} />
                <span className="username">{user?.name || user?.email}</span>
              </Space>
            </Dropdown>
          </Space>
        </div>
      </Header>
      
      <Layout>
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed}
          className="app-sider"
          breakpoint="lg"
          onBreakpoint={(broken) => {
            setCollapsed(broken);
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={getMenuItems()}
            className="app-menu"
          />
        </Sider>
        
        <Layout className="site-layout">
          <Content className="app-content">
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AppLayout;