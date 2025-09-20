import React from 'react';
import { Card, Table, Button, Space, message, Modal, Tag, Descriptions } from 'antd';
import { EyeOutlined, EditOutlined } from '@ant-design/icons';

const Orders: React.FC = () => {
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [detailVisible, setDetailVisible] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState<API.Order | null>(null);

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: 'orange',
      processing: 'blue',
      shipped: 'cyan',
      delivered: 'green',
      cancelled: 'red',
    };
    return colorMap[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const textMap: Record<string, string> = {
      pending: '待处理',
      processing: '处理中',
      shipped: '已发货',
      delivered: '已送达',
      cancelled: '已取消',
    };
    return textMap[status] || status;
  };

  const columns = [
    {
      title: '订单ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
    },
    {
      title: '商品ID',
      dataIndex: 'productId',
      key: 'productId',
      width: 100,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
    },
    {
      title: '总金额',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (amount: number) => `¥${amount.toFixed(2)}`,
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleUpdateStatus(record)}
          >
            更新状态
          </Button>
        </Space>
      ),
      width: 150,
    },
  ];

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // TODO: 调用实际的 API
      const response = await fetch('/api/orders');
      const data = await response.json();
      if (data.success) {
        setOrders(data.data.list);
      }
    } catch (error) {
      message.error('获取订单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (order: any) => {
    setSelectedOrder(order);
    setDetailVisible(true);
  };

  const handleUpdateStatus = (order: any) => {
    Modal.confirm({
      title: '更新订单状态',
      content: '请选择新的订单状态',
      onOk: async () => {
        try {
          // TODO: 调用更新状态 API
          message.success('状态更新成功');
          fetchOrders();
        } catch (error) {
          message.error('状态更新失败');
        }
      },
    });
  };

  React.useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Table
          columns={columns}
          dataSource={orders}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title="订单详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={600}
      >
        {selectedOrder && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="订单ID">
              {selectedOrder.id}
            </Descriptions.Item>
            <Descriptions.Item label="用户ID">
              {selectedOrder.userId}
            </Descriptions.Item>
            <Descriptions.Item label="商品ID">
              {selectedOrder.productId}
            </Descriptions.Item>
            <Descriptions.Item label="数量">
              {selectedOrder.quantity}
            </Descriptions.Item>
            <Descriptions.Item label="总金额">
              ¥{selectedOrder.totalPrice?.toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={getStatusColor(selectedOrder.status)}>
                {getStatusText(selectedOrder.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(selectedOrder.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间" span={2}>
              {new Date(selectedOrder.updatedAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default Orders;