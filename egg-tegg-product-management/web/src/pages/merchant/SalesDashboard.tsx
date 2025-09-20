import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Typography, 
  Spin,
  Empty,
  Tag,
  List,
  Avatar,
  message
} from 'antd';
import { 
  ShoppingOutlined, 
  DollarOutlined, 
  ShopOutlined,
  TrophyOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { SalesStats, Order, Product } from '../../types';
import { productApi, orderApi, statsApi } from '../../services/api';
import './SalesDashboard.less';

const { Title, Text } = Typography;

const SalesDashboard: React.FC = () => {
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [topProducts, setTopProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchSalesStats();
    fetchTopProducts();
  }, []);

  const fetchSalesStats = async () => {
    setLoading(true);
    try {
      const response = await statsApi.getSalesStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Fetch sales stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopProducts = async () => {
    try {
      const response = await productApi.getMerchantProducts(1, 10);
      if (response.success && response.data) {
        setTopProducts(response.data.products || []);
      }
    } catch (error) {
      message.error('获取热销商品失败');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'orange',
      confirmed: 'blue',
      shipped: 'cyan',
      delivered: 'green',
      cancelled: 'red',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: '待确认',
      confirmed: '已确认',
      shipped: '已发货',
      delivered: '已送达',
      cancelled: '已取消',
    };
    return texts[status] || status;
  };

  const recentOrderColumns: ColumnsType<Order> = [
    {
      title: '订单ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id) => `#${id}`,
    },
    {
      title: '商品数量',
      dataIndex: 'items',
      key: 'items',
      width: 100,
      render: (items: any[]) => `${items?.length || 0} 件`,
    },
    {
      title: '订单金额',
      dataIndex: 'total',
      key: 'total',
      width: 120,
      render: (total: number) => `¥${total.toFixed(2)}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="sales-dashboard-page">
      <div className="page-header">
        <Title level={2}>销售大盘</Title>
        <Text type="secondary">查看您的销售数据和业务概况</Text>
      </div>

      {stats ? (
        <>
          {/* 统计卡片 */}
          <Row gutter={[16, 16]} className="stats-cards">
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="总订单数"
                  value={stats.totalOrders}
                  prefix={<ShoppingOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="总收入"
                  value={stats.totalRevenue}
                  prefix={<DollarOutlined />}
                  precision={2}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="商品总数"
                  value={stats.totalProducts}
                  prefix={<ShopOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="平均订单金额"
                  value={stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0}
                  prefix={<TrophyOutlined />}
                  precision={2}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
            {/* 最近订单 */}
            <Col xs={24} lg={16}>
              <Card 
                title="最近订单" 
                extra={
                  <Text type="secondary">
                    <ClockCircleOutlined /> 最新 {stats.recentOrders?.length || 0} 条
                  </Text>
                }
              >
                {stats.recentOrders && stats.recentOrders.length > 0 ? (
                  <Table
                    columns={recentOrderColumns}
                    dataSource={stats.recentOrders}
                    rowKey="id"
                    pagination={false}
                    size="small"
                  />
                ) : (
                  <Empty description="暂无订单数据" />
                )}
              </Card>
            </Col>

            {/* 热销商品 */}
            <Col xs={24} lg={8}>
              <Card 
                title="热销商品" 
                extra={
                  <Text type="secondary">
                    <TrophyOutlined /> Top {topProducts.length}
                  </Text>
                }
              >
                {topProducts.length > 0 ? (
                  <List
                    size="small"
                    dataSource={topProducts}
                    renderItem={(product, index) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Avatar 
                              shape="square" 
                              size={40}
                              src={product.images?.[0]}
                              icon={<ShopOutlined />}
                            />
                          }
                          title={
                            <div className="product-title">
                              <span className="rank">#{index + 1}</span>
                              <span className="title">{product.title}</span>
                            </div>
                          }
                          description={
                            <div className="product-info">
                              <Text type="secondary">库存: {product.quantity}</Text>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="暂无商品数据" />
                )}
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        <Empty description="暂无数据" />
      )}
    </div>
  );
};

export default SalesDashboard;