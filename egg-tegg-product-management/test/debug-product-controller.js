const { Client } = require('pg');

// 模拟 ProductService 的 getProductList 方法
async function getProductList(page = 1, pageSize = 10, filters = {}) {
  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    database: 'product',
    user: 'postgres',
    password: 'postgres',
  });

  try {
    await client.connect();
    
    const offset = (page - 1) * pageSize;
    let whereClause = '';
    const params = [];
    let paramIndex = 1;
    
    if (filters.merchant_id) {
      whereClause += ` WHERE merchant_id = $${paramIndex}`;
      params.push(filters.merchant_id);
      paramIndex++;
    }
    
    if (filters.status) {
      const statusValue = filters.status === 'active' ? 1 : 0;
      whereClause += whereClause ? ` AND status = $${paramIndex}` : ` WHERE status = $${paramIndex}`;
      params.push(statusValue);
      paramIndex++;
    }
    
    // 获取总数
    const countQuery = `SELECT COUNT(*) as count FROM products${whereClause}`;
    const countResult = await client.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);
    
    // 获取商品列表
    const listQuery = `SELECT * FROM products${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(pageSize, offset);
    const listResult = await client.query(listQuery, params);
    
    const products = listResult.rows.map(product => ({
      id: product.id,
      title: product.title,
      subtitle: product.subtitle,
      price: product.price,
      quantity: product.quantity,
      images: product.images,
      details: product.details,
      status: product.status,
      merchant_id: product.merchant_id,
      created_at: product.created_at,
      updated_at: product.updated_at
    }));

    return {
      products,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
    
  } finally {
    await client.end();
  }
}

// 模拟 ProductController 的 getProducts 方法
async function getProducts(query = {}) {
  try {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '10');
    
    const result = await getProductList(page, limit, {
      merchant_id: query.merchant_id,
      status: query.status,
      search: query.search,
    });

    // 格式化返回数据以匹配 simple-api-server.js 的格式
    const formattedProducts = result.products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : []
    }));

    return { products: formattedProducts };
  } catch (error) {
    console.error('获取商品列表失败:', error);
    return { error: '获取商品列表失败' };
  }
}

// 测试
async function testProductController() {
  console.log('测试 ProductController...');
  
  const result = await getProducts();
  console.log('结果:', JSON.stringify(result, null, 2));
}

testProductController();