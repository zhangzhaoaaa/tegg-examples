import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Space, Divider, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, UserAddOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { RegisterData } from '../../types';
import './Auth.less';

const { Title, Text } = Typography;
const { Option } = Select;

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { register } = useAuthStore();

  const handleSubmit = async (values: RegisterData) => {
    setLoading(true);
    try {
      await register(values);
      message.success('注册成功，欢迎使用！');
      // 注册成功后，App组件会自动重定向到对应的默认页面
    } catch (error: any) {
      message.error(error.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <Card className="auth-card">
          <div className="auth-header">
            <Title level={2}>创建账户</Title>
            <Text type="secondary">加入我们的商品管理系统</Text>
          </div>

          <Form
            form={form}
            name="register"
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            size="large"
            className="auth-form"
          >
            <Form.Item
              name="name"
              label="用户名"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 2, message: '用户名至少2位' },
                { max: 20, message: '用户名最多20位' },
                { pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, message: '用户名只能包含字母、数字、下划线和中文' },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="请输入用户名"
                autoComplete="name"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="请输入邮箱"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6位' },
                { pattern: /^(?=.*[a-zA-Z])(?=.*\d)/, message: '密码必须包含字母和数字' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码（至少6位，包含字母和数字）"
                autoComplete="new-password"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="确认密码"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请再次输入密码"
                autoComplete="new-password"
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            <Form.Item
              name="role"
              label="用户类型"
              rules={[{ required: true, message: '请选择用户类型' }]}
              initialValue="consumer"
            >
              <Select placeholder="请选择用户类型" size="large">
                <Option value="consumer">
                  <Space>
                    <span>🛒</span>
                    <span>消费者</span>
                    <Text type="secondary" style={{ fontSize: '12px' }}>（浏览商品、购买商品）</Text>
                  </Space>
                </Option>
                <Option value="merchant">
                  <Space>
                    <span>🏪</span>
                    <span>商家</span>
                    <Text type="secondary" style={{ fontSize: '12px' }}>（管理商品、查看销售数据）</Text>
                  </Space>
                </Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                icon={<UserAddOutlined />}
              >
                注册
              </Button>
            </Form.Item>
          </Form>

          <Divider>或</Divider>

          <div className="auth-footer">
            <div className="auth-links">
              <Text>已有账户？</Text>
              <Link to="/login">立即登录</Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;