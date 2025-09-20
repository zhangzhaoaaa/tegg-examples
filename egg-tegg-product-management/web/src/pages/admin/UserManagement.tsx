import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  message,
  Popconfirm,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Avatar,
  Typography,
  Drawer,
  DatePicker,
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  StopOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  ShopOutlined,
  CrownOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { User, CreateUserData, UpdateUserData, UserListResponse } from '../../types';
import { userApi } from '../../services/api';
import './UserManagement.less';

const { Option } = Select;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  merchants: number;
  consumers: number;
  admins: number;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    bannedUsers: 0,
    merchants: 0,
    consumers: 0,
    admins: 0,
  });
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [pagination.current, pagination.pageSize, searchText, filterRole, filterStatus]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userApi.getUsers(pagination.current, pagination.pageSize);
      if (response.success && response.data) {
        setUsers(response.data.users || []);
        setPagination(prev => ({
          ...prev,
          total: response.data?.total || 0,
        }));
      }
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // 这里应该调用统计API，暂时用模拟数据
      setStats({
        totalUsers: users.length,
        activeUsers: users.filter(u => u.status === 'active').length,
        bannedUsers: users.filter(u => u.status === 'banned').length,
        merchants: users.filter(u => u.role === 'merchant').length,
        consumers: users.filter(u => u.role === 'consumer').length,
        admins: users.filter(u => u.role === 'admin').length,
      });
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    });
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingUser) {
        // 更新用户
        const updateData: UpdateUserData = {
          name: values.name,
          email: values.email,
          role: values.role,
          status: values.status,
        };
        await userApi.updateUser(editingUser.id, updateData);
        message.success('用户更新成功');
      } else {
        // 创建用户
        const createData: CreateUserData = {
          name: values.name,
          email: values.email,
          password: values.password,
          role: values.role,
        };
        await userApi.createUser(createData);
        message.success('用户创建成功');
      }
      setModalVisible(false);
      fetchUsers();
      fetchStats();
    } catch (error) {
      message.error(editingUser ? '用户更新失败' : '用户创建失败');
    }
  };

  const handleBanUser = async (userId: number) => {
    try {
      await userApi.banUser(userId);
      message.success('用户已封禁');
      fetchUsers();
      fetchStats();
    } catch (error) {
      message.error('封禁用户失败');
    }
  };

  const handleUnbanUser = async (userId: number) => {
    try {
      await userApi.unbanUser(userId);
      message.success('用户已解封');
      fetchUsers();
      fetchStats();
    } catch (error) {
      message.error('解封用户失败');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      await userApi.deleteUser(userId);
      message.success('用户已删除');
      fetchUsers();
      fetchStats();
    } catch (error) {
      message.error('删除用户失败');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <CrownOutlined style={{ color: '#f50' }} />;
      case 'merchant':
        return <ShopOutlined style={{ color: '#1890ff' }} />;
      case 'consumer':
        return <UserOutlined style={{ color: '#52c41a' }} />;
      default:
        return <UserOutlined />;
    }
  };

  const getRoleTag = (role: string) => {
    const roleConfig = {
      admin: { color: 'red', text: '管理员' },
      merchant: { color: 'blue', text: '商家' },
      consumer: { color: 'green', text: '消费者' },
    };
    const config = roleConfig[role as keyof typeof roleConfig] || { color: 'default', text: role };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getStatusTag = (status: string) => {
    const statusConfig = {
      active: { color: 'success', text: '正常' },
      banned: { color: 'error', text: '已封禁' },
      inactive: { color: 'warning', text: '未激活' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns: ColumnsType<User> = [
    {
      title: '用户信息',
      key: 'userInfo',
      render: (_, record) => (
        <Space>
          <Avatar size={40} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.name}</div>
            <div style={{ color: '#8c8c8c', fontSize: '12px' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Space>
          {getRoleIcon(role)}
          {getRoleTag(role)}
        </Space>
      ),
      filters: [
        { text: '管理员', value: 'admin' },
        { text: '商家', value: 'merchant' },
        { text: '消费者', value: 'consumer' },
      ],
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
      filters: [
        { text: '正常', value: 'active' },
        { text: '已封禁', value: 'banned' },
        { text: '未激活', value: 'inactive' },
      ],
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: true,
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
          >
            编辑
          </Button>
          {record.status === 'active' ? (
            <Popconfirm
              title="确定要封禁此用户吗？"
              onConfirm={() => handleBanUser(record.id)}
            >
              <Button type="link" danger icon={<StopOutlined />}>
                封禁
              </Button>
            </Popconfirm>
          ) : (
            <Button
              type="link"
              icon={<CheckCircleOutlined />}
              onClick={() => handleUnbanUser(record.id)}
            >
              解封
            </Button>
          )}
          <Popconfirm
            title="确定要删除此用户吗？此操作不可恢复！"
            onConfirm={() => handleDeleteUser(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="user-management">
      <div className="management-header">
        <Title level={2}>用户管理</Title>
        <Text type="secondary">管理系统中的所有用户账户</Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="stats-cards">
        <Col xs={12} sm={8} md={4}>
          <Card>
            <Statistic
              title="总用户数"
              value={stats.totalUsers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card>
            <Statistic
              title="正常用户"
              value={stats.activeUsers}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card>
            <Statistic
              title="已封禁"
              value={stats.bannedUsers}
              prefix={<StopOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card>
            <Statistic
              title="商家"
              value={stats.merchants}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card>
            <Statistic
              title="消费者"
              value={stats.consumers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card>
            <Statistic
              title="管理员"
              value={stats.admins}
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#f50' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 操作栏 */}
      <Card className="operation-bar">
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Space>
              <Input
                placeholder="搜索用户名或邮箱"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 200 }}
              />
              <Select
                placeholder="筛选角色"
                value={filterRole}
                onChange={setFilterRole}
                style={{ width: 120 }}
                allowClear
              >
                <Option value="admin">管理员</Option>
                <Option value="merchant">商家</Option>
                <Option value="consumer">消费者</Option>
              </Select>
              <Select
                placeholder="筛选状态"
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: 120 }}
                allowClear
              >
                <Option value="active">正常</Option>
                <Option value="banned">已封禁</Option>
                <Option value="inactive">未激活</Option>
              </Select>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateUser}
            >
              新增用户
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 用户表格 */}
      <Card>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
          onChange={(paginationConfig, filters, sorter) => {
            setPagination({
              current: paginationConfig.current || 1,
              pageSize: paginationConfig.pageSize || 10,
              total: pagination.total,
            });
          }}
        />
      </Card>

      {/* 用户编辑/创建弹窗 */}
      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6位' },
              ]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Option value="consumer">消费者</Option>
              <Option value="merchant">商家</Option>
              <Option value="admin">管理员</Option>
            </Select>
          </Form.Item>

          {editingUser && (
            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Select placeholder="请选择状态">
                <Option value="active">正常</Option>
                <Option value="banned">已封禁</Option>
                <Option value="inactive">未激活</Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingUser ? '更新' : '创建'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;