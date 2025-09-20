import React, { useEffect, useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Upload, 
  message, 
  Image, 
  Popconfirm,
  Space,
  Typography,
  Tag
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UploadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile, UploadProps } from 'antd/es/upload';
import { Product, CreateProductData, UpdateProductData } from '../../types';
import { productApi } from '../../services/api';
import './ProductManagement.less';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productApi.getMerchantProducts();
      if (response.success && response.data) {
        // 处理不同的响应格式
        const productList = response.data.list || response.data.products || [];
        setProducts(productList);
      }
    } catch (error) {
      message.error('获取商品列表失败');
      console.error('Fetch products error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setModalVisible(true);
    form.resetFields();
    setFileList([]);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setModalVisible(true);
    form.setFieldsValue({
      title: product.title,
      subtitle: product.subtitle,
      quantity: product.quantity,
      details: product.details,
    });
    
    // 设置图片列表，添加空值检查
    const images = (product.images || []).map((url, index) => ({
      uid: `${index}`,
      name: `image-${index}`,
      status: 'done' as const,
      url: url,
    }));
    setFileList(images);
  };

  const handleDelete = async (productId: number) => {
    try {
      const response = await productApi.deleteProduct(productId);
      if (response.success) {
        message.success('商品删除成功');
        fetchProducts();
      }
    } catch (error) {
      message.error('删除商品失败');
      console.error('Delete product error:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // 获取图片URL列表
      const images = fileList
        .filter(file => file.status === 'done')
        .map(file => file.url || file.response?.url)
        .filter(Boolean);

      const productData = {
        ...values,
        images,
      };

      let response;
      if (editingProduct) {
        response = await productApi.updateProduct(editingProduct.id, productData as UpdateProductData);
      } else {
        response = await productApi.createProduct(productData as CreateProductData);
      }

      if (response.success) {
        message.success(editingProduct ? '商品更新成功' : '商品创建成功');
        setModalVisible(false);
        form.resetFields();
        setFileList([]);
        fetchProducts();
      }
    } catch (error) {
      message.error(editingProduct ? '更新商品失败' : '创建商品失败');
      console.error('Submit product error:', error);
    }
  };

  const handleUploadChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewVisible(true);
  };

  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });

  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/v1/upload',
    listType: 'picture-card',
    fileList,
    onChange: handleUploadChange,
    onPreview: handlePreview,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件!');
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('图片大小不能超过5MB!');
        return false;
      }
      return true;
    },
  };

  const columns: ColumnsType<Product> = [
    {
      title: '商品图片',
      dataIndex: 'images',
      key: 'images',
      width: 100,
      render: (images: string[]) => (
        <div className="product-images">
          {images && images.length > 0 ? (
            <Image
              src={images[0]}
              alt="商品图片"
              width={60}
              height={60}
              style={{ objectFit: 'cover', borderRadius: 4 }}
            />
          ) : (
            <div className="no-image">无图片</div>
          )}
        </div>
      ),
    },
    {
      title: '商品标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '副标题',
      dataIndex: 'subtitle',
      key: 'subtitle',
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
      title: '库存',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      render: (quantity: number) => (
        <Tag color={quantity > 0 ? 'green' : 'red'}>
          {quantity}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              Modal.info({
                title: '商品详情',
                width: 600,
                content: (
                  <div>
                    <p><strong>标题:</strong> {record.title}</p>
                    <p><strong>副标题:</strong> {record.subtitle || '无'}</p>
                    <p><strong>库存:</strong> {record.quantity}</p>
                    <p><strong>详细信息:</strong></p>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{record.details}</div>
                    {record.images && record.images.length > 0 && (
                      <div>
                        <p><strong>商品图片:</strong></p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {(record.images || []).map((url, index) => (
                            <Image
                              key={index}
                              src={url}
                              width={100}
                              height={100}
                              style={{ objectFit: 'cover' }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ),
              });
            }}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除这个商品吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="product-management-page">
      <div className="page-header">
        <Title level={2}>商品管理</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          添加商品
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title={editingProduct ? '编辑商品' : '添加商品'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确认"
        cancelText="取消"
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="title"
            label="商品标题"
            rules={[{ required: true, message: '请输入商品标题' }]}
          >
            <Input placeholder="请输入商品标题" />
          </Form.Item>

          <Form.Item
            name="subtitle"
            label="副标题"
          >
            <Input placeholder="请输入副标题（可选）" />
          </Form.Item>

          <Form.Item
            name="quantity"
            label="库存数量"
            rules={[{ required: true, message: '请输入库存数量' }]}
          >
            <InputNumber
              min={0}
              placeholder="请输入库存数量"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="商品图片"
            extra="最多上传3张图片，每张不超过5MB"
          >
            <Upload {...uploadProps}>
              {fileList.length >= 3 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传图片</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item
            name="details"
            label="详细信息"
            rules={[{ required: true, message: '请输入商品详细信息' }]}
          >
            <TextArea
              rows={4}
              placeholder="请输入商品详细信息"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={previewVisible}
        title="图片预览"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
};

export default ProductManagement;