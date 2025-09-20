const { Bone, DataTypes, connect } = require('leoric');

// 测试连接和查询
async function testOrmConnection() {
  try {
    console.log('测试 ORM 连接...');
    
    // 连接数据库
    const Product = await connect({
      dialect: 'postgres',
      host: '127.0.0.1',
      port: 5432,
      database: 'product',
      user: 'postgres',
      password: 'postgres',
      models: ['./app/modules/product/model']
    });
    
    console.log('数据库连接成功');
    
    // 测试查询
    const products = await Product.find();
    console.log('查询到商品数量:', products.length);
    
    if (products.length > 0) {
      console.log('第一个商品:', {
        id: products[0].id,
        title: products[0].title,
        price: products[0].price
      });
    }
    
    // 测试 count
    const count = await Product.count();
    console.log('商品总数:', count);
    
  } catch (error) {
    console.error('测试失败:', error.message);
    console.error('错误详情:', error);
  }
}

testOrmConnection();