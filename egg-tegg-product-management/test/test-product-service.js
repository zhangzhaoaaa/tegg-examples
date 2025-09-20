const { Client } = require('pg');

// 模拟 Leoric Bone 类
class MockBone {
  static async find(conditions = {}) {
    const client = new Client({
      host: '127.0.0.1',
      port: 5432,
      database: 'product',
      user: 'postgres',
      password: 'postgres',
    });

    try {
      await client.connect();
      
      let query = 'SELECT * FROM products';
      const params = [];
      
      if (Object.keys(conditions).length > 0) {
        const whereClause = Object.keys(conditions).map((key, index) => {
          params.push(conditions[key]);
          return `${key} = $${index + 1}`;
        }).join(' AND ');
        query += ` WHERE ${whereClause}`;
      }
      
      query += ' ORDER BY created_at DESC';
      
      const result = await client.query(query, params);
      return result.rows.map(row => new MockProduct(row));
    } finally {
      await client.end();
    }
  }

  static async count() {
    const client = new Client({
      host: '127.0.0.1',
      port: 5432,
      database: 'product',
      user: 'postgres',
      password: 'postgres',
    });

    try {
      await client.connect();
      const result = await client.query('SELECT COUNT(*) as count FROM products');
      return parseInt(result.rows[0].count);
    } finally {
      await client.end();
    }
  }

  order() { return this; }
  limit() { return this; }
  offset() { return this; }
}

class MockProduct extends MockBone {
  constructor(data) {
    super();
    Object.assign(this, data);
  }
}

// 测试商品列表查询
async function testProductList() {
  try {
    console.log('测试商品列表查询...');
    
    const products = await MockProduct.find();
    console.log('商品数量:', products.length);
    console.log('前3个商品:', products.slice(0, 3).map(p => ({
      id: p.id,
      title: p.title,
      price: p.price
    })));

    const total = await MockProduct.count();
    console.log('总商品数:', total);

  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

testProductList();