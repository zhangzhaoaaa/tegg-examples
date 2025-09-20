import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Space, Divider, Tag } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Link, history } from 'umi';
import { useAuthStore } from '../../stores/authStore';
import { LoginCredentials } from '../../types';
import './Auth.less';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { login } = useAuthStore();

  const handleSubmit = async (values: LoginCredentials) => {
    setLoading(true);
    try {
      await login(values);
      // message.success('登录成功');
      
      // 等待一小段时间确保状态更新完成
      setTimeout(() => {
        console.log('登录后的用户信息:', useAuthStore.getState().user); // 调试日志 
        // 登录成功后，用户信息已经被设置到 store 中
        // 获取最新的用户信息并根据角色跳转到对应页面
        const { user } = useAuthStore.getState();
        console.log('登录后的用户信息:', user); // 调试日志
        
        if (user && user.role) {
          switch (user.role) {
            case 'admin':
              console.log('跳转到管理员页面');
              history.push('/admin/users');
              break;
            case 'merchant':
              console.log('跳转到商家页面');
              history.push('/merchant/dashboard');
              break;
            case 'consumer':
              console.log('跳转到消费者页面');
              history.push('/consumer/products');
              break;
            default:
              console.log('默认跳转到消费者页面');
              history.push('/consumer/products');
              break;
          }
        } else {
          // 如果没有用户信息或角色信息，默认跳转到消费者页面
          console.log('没有用户信息，默认跳转到消费者页面');
          history.push('/consumer/products');
        }
      }, 100); // 等待100ms确保状态更新
    } catch (error: any) {
      console.error('登录失败:', error); // 调试日志
      message.error(error.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  // 快速登录功能
  const quickLogin = (email: string, password: string) => {
    form.setFieldsValue({ email, password });
    handleSubmit({ email, password });
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <Card className="auth-card">
          <div className="auth-header">
            <Title level={2}>欢迎回来</Title>
            <Text type="secondary">登录您的商品管理系统账户</Text>
          </div>

          <Form
            form={form}
            name="login"
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            size="large"
            className="auth-form"
          >
            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="请输入邮箱"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
                autoComplete="current-password"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                icon={<LoginOutlined />}
              >
                登录
              </Button>
            </Form.Item>
          </Form>

          <Divider>或</Divider>

          <div className="auth-footer">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div className="auth-links">
                <Text>还没有账户？</Text>
                <Link to="/register">立即注册</Link>
              </div>
              
              <div className="demo-accounts">
                <Text type="secondary" style={{ fontSize: '12px', marginBottom: '8px', display: 'block' }}>
                  演示账户（点击快速登录）：
                </Text>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div className="demo-account-item">
                    <Tag 
                      color="blue" 
                      style={{ cursor: 'pointer', width: '100%', textAlign: 'center', padding: '4px 8px' }}
                      onClick={() => quickLogin('consumer1@example.com', '123456')}
                    >
                      消费者: consumer1@example.com
                    </Tag>
                  </div>
                  <div className="demo-account-item">
                    <Tag 
                      color="green" 
                      style={{ cursor: 'pointer', width: '100%', textAlign: 'center', padding: '4px 8px' }}
                      onClick={() => quickLogin('merchant1@example.com', '123456')}
                    >
                      商家: merchant1@example.com
                    </Tag>
                  </div>
                  <div className="demo-account-item">
                    <Tag 
                      color="red" 
                      style={{ cursor: 'pointer', width: '100%', textAlign: 'center', padding: '4px 8px' }}
                      onClick={() => quickLogin('admin@example.com', '123456')}
                    >
                      管理员: admin@example.com
                    </Tag>
                  </div>
                </Space>
              </div>
            </Space>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;