import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Image, 
  Typography, 
  InputNumber, 
  message, 
  Spin,
  Empty,
  Modal,
  Form,
  Input
} from 'antd';
import { ShoppingCartOutlined, ShopOutlined, PictureOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useNavigate } from 'umi';
import { Product, CreateOrderData } from '../../types';
import { productApi, orderApi } from '../../services/api';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';
import './ProductList.less';

const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;

const ProductList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productApi.getProducts();
      if (response.success && response.data) {
        // 后端返回的是 list 字段，不是 products 字段
        const productList = response.data.list || response.data.products || [];
        setProducts(productList);
        // 初始化数量为1
        const initialQuantities: Record<number, number> = {};
        productList.forEach((product: Product) => {
          initialQuantities[product.id] = 1;
        });
        setQuantities(initialQuantities);
      } else {
        // 如果没有数据，设置为空数组
        setProducts([]);
        setQuantities({});
      }
    } catch (error) {
      message.error('获取商品列表失败');
      console.error('Fetch products error:', error);
      // 出错时也要设置为空数组，避免undefined
      setProducts([]);
      setQuantities({});
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId: number, value: number | null) => {
    if (value && value > 0) {
      setQuantities(prev => ({
        ...prev,
        [productId]: value
      }));
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      const quantity = quantities[product.id] || 1;
      await addToCart(product.id, quantity);
      message.success('已添加到购物车');
    } catch (error) {
      message.error('添加到购物车失败');
      console.error('Add to cart error:', error);
    }
  };

  const handleDirectOrder = (product: Product) => {
    setSelectedProduct(product);
    setOrderModalVisible(true);
    form.setFieldsValue({
      quantity: quantities[product.id] || 1,
      address: '',
      phone: user?.email || ''
    });
  };

  const handleCreateOrder = async (values: any) => {
    try {
      if (!selectedProduct) return;

      const orderData: CreateOrderData = {
        items: [{
          productId: selectedProduct.id,
          quantity: values.quantity,
          price: selectedProduct.quantity // 这里应该是商品价格，暂时用quantity代替
        }],
        total: selectedProduct.quantity * values.quantity
      };

      const response = await orderApi.createOrder(orderData);
      if (response.success) {
        message.success('订单创建成功');
        setOrderModalVisible(false);
        form.resetFields();
        navigate('/orders');
      }
    } catch (error) {
      message.error('创建订单失败');
      console.error('Create order error:', error);
    }
  };

  const renderProductCard = (product: Product) => {
    const isOutOfStock = product.quantity <= 0;
    const currentQuantity = quantities[product.id] || 1;
    
    return (
      <Card
        className="product-card"
        cover={
          <div className="product-image-container">
            {product.images && product.images.length > 0 ? (
              <img
                alt={product.title}
                src={product.images[0]}
                className="product-image"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `
                    <div class="no-image">
                      <PictureOutlined />
                    </div>
                  `;
                }}
              />
            ) : (
              <div className="no-image">
                <PictureOutlined />
              </div>
            )}
            {isOutOfStock && (
              <div className="out-of-stock-overlay">
                暂时缺货
              </div>
            )}
            {product.quantity > 0 && product.quantity <= 5 && (
              <div className="product-badge">
                仅剩 {product.quantity} 件
              </div>
            )}
          </div>
        }
        actions={[
          <Button
            key="cart"
            icon={<ShoppingCartOutlined />}
            disabled={isOutOfStock}
            onClick={() => handleAddToCart(product)}
            loading={loading}
          >
            加入购物车
          </Button>,
          <Button
            key="buy"
            type="primary"
            icon={<ShoppingOutlined />}
            disabled={isOutOfStock}
            onClick={() => handleDirectOrder(product)}
            loading={loading}
          >
            立即购买
          </Button>,
        ]}
      >
        <div className="product-title">
          <Typography.Title level={5} ellipsis={{ rows: 2 }}>
            {product.title}
          </Typography.Title>
          {product.subtitle && (
            <Typography.Text className="product-subtitle" ellipsis>
              {product.subtitle}
            </Typography.Text>
          )}
        </div>
        
        <div className="product-info">
          <div className="product-details">
            <Typography.Paragraph 
              ellipsis={{ rows: 2 }} 
              style={{ marginBottom: 0 }}
            >
              {product.details || '暂无详细描述'}
            </Typography.Paragraph>
          </div>
          
          <div className="product-stock">
            <Typography.Text 
              type={isOutOfStock ? 'danger' : 'success'}
            >
              {isOutOfStock ? '暂时缺货' : `库存: ${product.quantity} 件`}
            </Typography.Text>
          </div>
          
          {!isOutOfStock && (
            <div className="quantity-selector">
              <Typography.Text>数量:</Typography.Text>
              <InputNumber
                min={1}
                max={product.quantity}
                value={currentQuantity}
                onChange={(value) => handleQuantityChange(product.id, value || 1)}
                size="small"
              />
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="product-list-page">
      <div className="page-header">
        <Typography.Title level={2}>
          商品列表
        </Typography.Title>
        <Typography.Text>
          发现优质商品，享受购物乐趣
        </Typography.Text>
      </div>

      {loading ? (
        <div className="loading-container">
          <Spin size="large" tip="正在加载商品..." />
        </div>
      ) : (
        <div className="products-grid">
          <Row gutter={[24, 24]}>
            {products.length > 0 ? (
              products.map((product) => (
                <Col 
                  key={product.id} 
                  xs={24} 
                  sm={12} 
                  md={8} 
                  lg={6} 
                  xl={6}
                >
                  {renderProductCard(product)}
                </Col>
              ))
            ) : (
              <Col span={24}>
                <div style={{ 
                  textAlign: 'center', 
                  padding: '60px 20px',
                  background: 'white',
                  borderRadius: '12px'
                }}>
                  <PictureOutlined style={{ fontSize: '64px', color: '#d1d5db', marginBottom: '16px' }} />
                  <Typography.Title level={4} style={{ color: '#6b7280' }}>
                    暂无商品
                  </Typography.Title>
                  <Typography.Text style={{ color: '#9ca3af' }}>
                    商家还没有上架商品，请稍后再来看看
                  </Typography.Text>
                </div>
              </Col>
            )}
          </Row>
        </div>
      )}

      <Modal
        title="确认订单"
        open={orderModalVisible}
        onCancel={() => setOrderModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setOrderModalVisible(false)}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={() => form.submit()}
          >
            确认下单
          </Button>,
        ]}
        width={500}
      >
        {selectedProduct && (
          <>
            <div className="order-product-info">
              <Typography.Title level={4}>
                {selectedProduct.title}
              </Typography.Title>
              <Typography.Text type="secondary">
                {selectedProduct.subtitle}
              </Typography.Text>
            </div>
            
            <Form
              form={form}
              layout="vertical"
              onFinish={handleCreateOrder}
              initialValues={{
                quantity: quantities[selectedProduct.id] || 1,
              }}
            >
              <Form.Item
                name="quantity"
                label="购买数量"
                rules={[
                  { required: true, message: '请输入购买数量' },
                  { type: 'number', min: 1, message: '数量不能小于1' },
                  { type: 'number', max: selectedProduct.quantity, message: `数量不能超过库存${selectedProduct.quantity}` },
                ]}
              >
                <InputNumber
                  min={1}
                  max={selectedProduct.quantity}
                  style={{ width: '100%' }}
                  placeholder="请输入购买数量"
                />
              </Form.Item>
              
              <Form.Item
                name="address"
                label="收货地址"
                rules={[
                  { required: true, message: '请输入收货地址' },
                  { min: 5, message: '地址长度不能少于5个字符' },
                ]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="请输入详细的收货地址"
                />
              </Form.Item>
              
              <Form.Item
                name="phone"
                label="联系电话"
                rules={[
                  { required: true, message: '请输入联系电话' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' },
                ]}
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ProductList;