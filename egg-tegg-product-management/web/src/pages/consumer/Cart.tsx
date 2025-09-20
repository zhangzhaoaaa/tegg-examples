import React, { useEffect, useState } from 'react';
import { 
  Card, 
  List, 
  Button, 
  InputNumber, 
  Typography, 
  Image, 
  Empty, 
  Spin, 
  message,
  Modal,
  Form,
  Input,
  Checkbox,
  Row,
  Col,
  Divider,
  Badge,
  Tooltip,
  Space
} from 'antd';
import { 
  DeleteOutlined, 
  ShopOutlined, 
  ShoppingOutlined, 
  PictureOutlined,
  MinusOutlined,
  PlusOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'umi';
import { CartItem, CreateOrderData } from '../../types';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';
import { orderApi } from '../../services/api';
import './Cart.less';

const { Title, Text } = Typography;

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    cart, 
    isLoading, 
    getCart, 
    updateCartItem, 
    removeFromCart, 
    clearCart 
  } = useCartStore();
  
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [orderForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCart();
  }, [getCart]);

  const handleQuantityChange = async (productId: number, quantity: number) => {
    if (quantity <= 0) return;
    
    try {
      await updateCartItem(productId, quantity);
      message.success('数量已更新');
    } catch (error) {
      message.error('更新数量失败');
      console.error('Update quantity error:', error);
    }
  };

  const handleRemoveItem = async (productId: number) => {
    Modal.confirm({
      title: '确认移除商品',
      content: '确定要从购物车中移除这件商品吗？',
      icon: <ExclamationCircleOutlined />,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await removeFromCart(productId);
          message.success('商品已移除');
          // 从选中列表中移除
          setSelectedItems(prev => prev.filter(id => id !== productId));
        } catch (error) {
          message.error('移除商品失败');
          console.error('Remove item error:', error);
        }
      }
    });
  };

  const handleClearCart = () => {
    Modal.confirm({
      title: '确认清空购物车',
      content: '此操作将清空购物车中的所有商品，确认继续吗？',
      icon: <ExclamationCircleOutlined />,
      okText: '确认',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await clearCart();
          message.success('购物车已清空');
          setSelectedItems([]);
        } catch (error) {
          message.error('清空购物车失败');
          console.error('Clear cart error:', error);
        }
      }
    });
  };

  const handleSelectItem = (productId: number, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, productId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== productId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && cart?.items) {
      setSelectedItems(cart.items.map(item => item.product_id));
    } else {
      setSelectedItems([]);
    }
  };

  const getSelectedItems = () => {
    if (!cart?.items) return [];
    return cart.items.filter(item => selectedItems.includes(item.product_id));
  };

  const getTotalPrice = () => {
    const selected = getSelectedItems();
    return selected.reduce((total, item) => {
      const price = item.product?.quantity || 0; // 这里应该是商品价格，暂时用quantity代替
      return total + (price * item.quantity);
    }, 0);
  };

  const handleCheckout = () => {
    const selected = getSelectedItems();
    if (selected.length === 0) {
      message.warning('请选择要结算的商品');
      return;
    }
    
    setOrderModalVisible(true);
    orderForm.setFieldsValue({
      address: '',
      phone: user?.email || ''
    });
  };

  const handleOrderSubmit = async () => {
    try {
      setSubmitting(true);
      const values = await orderForm.validateFields();
      const selected = getSelectedItems();
      
      const orderData: CreateOrderData = {
        items: selected.map(item => ({
          productId: item.product_id,
          quantity: item.quantity,
          price: item.product?.quantity || 0 // 这里应该是商品价格，暂时用quantity代替
        })),
        total: getTotalPrice()
      };

      const response = await orderApi.createOrder(orderData);
      if (response.success) {
        message.success('订单创建成功！');
        setOrderModalVisible(false);
        orderForm.resetFields();
        
        // 从购物车中移除已下单的商品
        for (const item of selected) {
          await removeFromCart(item.product_id);
        }
        
        setSelectedItems([]);
        navigate('/orders');
      }
    } catch (error) {
      message.error('创建订单失败，请重试');
      console.error('Create order error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderCartItem = (item: CartItem) => {
    const isSelected = selectedItems.includes(item.product_id);
    const product = item.product;
    
    if (!product) {
      return null;
    }

    const maxQuantity = product.quantity;
    const price = product.quantity; // 这里应该是商品价格，暂时用quantity代替
    const isOutOfStock = maxQuantity <= 0;

    return (
      <List.Item key={item.product_id} className="cart-item">
        <Row align="middle" style={{ width: '100%' }} gutter={16}>
          <Col flex="none">
            <Checkbox
              checked={isSelected}
              disabled={isOutOfStock}
              onChange={(e) => handleSelectItem(item.product_id, e.target.checked)}
            />
          </Col>
          
          <Col flex="none">
            <div className="product-image">
              {product.images && product.images.length > 0 ? (
                <Badge.Ribbon 
                  text="缺货" 
                  color="red" 
                  style={{ display: isOutOfStock ? 'block' : 'none' }}
                >
                  <Image
                    src={product.images[0]}
                    alt={product.title}
                    width={80}
                    height={80}
                    preview={false}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                  />
                </Badge.Ribbon>
              ) : (
                <div className="no-image">
                  <PictureOutlined />
                </div>
              )}
            </div>
          </Col>
          
          <Col flex="auto">
            <div className="product-info">
              <Title level={5} ellipsis={{ rows: 1 }}>
                {product.title}
                {isOutOfStock && (
                  <Text type="danger" style={{ marginLeft: 8, fontSize: 12 }}>
                    (缺货)
                  </Text>
                )}
              </Title>
              {product.subtitle && (
                <Text type="secondary" className="product-subtitle">
                  {product.subtitle}
                </Text>
              )}
              <div className="product-price">
                <Text strong>¥{price}</Text>
                <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                  库存: {maxQuantity}
                </Text>
              </div>
            </div>
          </Col>
          
          <Col flex="none">
            <div className="quantity-controls">
              <Space.Compact>
                <Button
                  size="small"
                  icon={<MinusOutlined />}
                  disabled={item.quantity <= 1 || isOutOfStock}
                  onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                />
                <InputNumber
                  min={1}
                  max={maxQuantity}
                  value={item.quantity}
                  disabled={isOutOfStock}
                  onChange={(value) => {
                    if (value && value !== item.quantity) {
                      handleQuantityChange(item.product_id, value);
                    }
                  }}
                  size="small"
                  style={{ width: 60, textAlign: 'center' }}
                  controls={false}
                />
                <Button
                  size="small"
                  icon={<PlusOutlined />}
                  disabled={item.quantity >= maxQuantity || isOutOfStock}
                  onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                />
              </Space.Compact>
            </div>
          </Col>
          
          <Col flex="none">
            <div className="item-total">
              <Typography.Text strong style={{ color: isOutOfStock ? '#999' : '#ef4444' }}>
                ¥{(price * item.quantity).toFixed(2)}
              </Typography.Text>
            </div>
          </Col>
          
          <Col flex="none">
            <Tooltip title="移除商品">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleRemoveItem(item.product_id)}
              />
            </Tooltip>
          </Col>
        </Row>
      </List.Item>
    );
  };

  if (isLoading) {
    return (
      <div className="cart-page">
        <div className="loading-container">
          <Spin size="large" tip="加载购物车中..." />
        </div>
      </div>
    );
  }

  const cartItems = cart?.items || [];
  const selectedCount = selectedItems.length;
  const totalPrice = getTotalPrice();
  const availableItems = cartItems.filter(item => item.product && item.product.quantity > 0);

  return (
    <div className="cart-page">
      <div className="page-header">
        <Title level={2}>
          <ShoppingOutlined style={{ marginRight: 12 }} />
          购物车
        </Title>
        <Text type="secondary">管理您的购物车商品，选择商品进行结算</Text>
      </div>

      {cartItems.length === 0 ? (
        <Empty 
          description="购物车为空，快去选购商品吧！"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" size="large" onClick={() => navigate('/products')}>
            <ShopOutlined />
            去购物
          </Button>
        </Empty>
      ) : (
        <Card className="cart-content">
          <div className="cart-header">
            <Checkbox
              checked={selectedCount === availableItems.length && availableItems.length > 0}
              indeterminate={selectedCount > 0 && selectedCount < availableItems.length}
              onChange={(e) => handleSelectAll(e.target.checked)}
            >
              全选 ({cartItems.length}件商品)
            </Checkbox>
            
            <Button 
              type="link" 
              danger 
              onClick={handleClearCart}
              disabled={cartItems.length === 0}
            >
              清空购物车
            </Button>
          </div>

          <List
            className="cart-list"
            dataSource={cartItems}
            renderItem={renderCartItem}
            split={false}
          />

          <div className="cart-footer">
            <div className="selected-info">
              <Text>已选择 {selectedCount} 件商品</Text>
            </div>
            
            <div className="total-info">
              <Typography.Text>合计: </Typography.Text>
              <Typography.Text strong style={{ fontSize: 20, color: '#ef4444' }}>
                ¥{totalPrice.toFixed(2)}
              </Typography.Text>
            </div>
            
            <Button
              type="primary"
              size="large"
              icon={<ShoppingOutlined />}
              onClick={handleCheckout}
              disabled={selectedCount === 0}
            >
              结算 ({selectedCount})
            </Button>
          </div>
        </Card>
      )}

      <Modal
        title={
          <Space>
            <ShoppingOutlined />
            确认订单
          </Space>
        }
        open={orderModalVisible}
        onOk={handleOrderSubmit}
        onCancel={() => {
          setOrderModalVisible(false);
          orderForm.resetFields();
        }}
        okText="确认下单"
        cancelText="取消"
        width={600}
        confirmLoading={submitting}
        maskClosable={false}
      >
        <div className="order-summary">
          <Title level={4}>订单商品</Title>
          <List
            size="small"
            dataSource={getSelectedItems()}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    item.product?.images?.[0] ? (
                      <Image
                        src={item.product.images[0]}
                        width={40}
                        height={40}
                        preview={false}
                        style={{ borderRadius: 4 }}
                      />
                    ) : (
                      <div style={{ 
                        width: 40, 
                        height: 40, 
                        background: '#f5f5f5', 
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <PictureOutlined style={{ color: '#ccc' }} />
                      </div>
                    )
                  }
                  title={item.product?.title}
                  description={`数量: ${item.quantity} | 单价: ¥${item.product?.quantity || 0}`}
                />
                <Text strong>¥{((item.product?.quantity || 0) * item.quantity).toFixed(2)}</Text>
              </List.Item>
            )}
          />
          <Divider />
          <div style={{ textAlign: 'right' }}>
            <Text strong style={{ fontSize: 16 }}>
              总计: <span style={{ color: '#ef4444', fontSize: 18 }}>¥{totalPrice.toFixed(2)}</span>
            </Text>
          </div>
        </div>
        
        <Form
          form={orderForm}
          layout="vertical"
          style={{ marginTop: 24 }}
        >
          <Form.Item
            name="address"
            label="收货地址"
            rules={[
              { required: true, message: '请输入收货地址' },
              { min: 10, message: '请输入详细的收货地址' }
            ]}
          >
            <Input.TextArea 
              rows={3} 
              placeholder="请输入详细收货地址，包括省市区街道门牌号等信息"
              showCount
              maxLength={200}
            />
          </Form.Item>
          
          <Form.Item
            name="phone"
            label="联系电话"
            rules={[
              { required: true, message: '请输入联系电话' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' }
            ]}
          >
            <Input placeholder="请输入11位手机号码" maxLength={11} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Cart;