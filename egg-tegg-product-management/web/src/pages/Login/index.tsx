import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { login } from '../../services/auth';
import './index.less';

const Login: React.FC = () => {
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values: API.LoginParams) => {
    setLoading(true);
    try {
      const response = await login(values);
      if (response.success && response.data) {
        localStorage.setItem('token', response.data.token);
        message.success('登录成功');
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('登录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card title="商品管理系统" className="login-card">
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱!' },
              { type: 'email', message: '请输入有效的邮箱地址!' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="邮箱"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              登录
            </Button>
          </Form.Item>

          <div className="login-footer">
            还没有账号？
            <a onClick={() => window.location.href = '/register'}>立即注册</a>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;