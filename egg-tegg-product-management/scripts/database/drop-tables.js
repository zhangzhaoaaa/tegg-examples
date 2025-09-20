const { Client } = require('pg');

// 数据库连接配置
const client = new Client({
  host: process.env.PGHOST || '127.0.0.1',
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || 'product',
  user: 'postgres',
  password: 'postgres',
});

const dropTables = async () => {
  try {
    await client.connect();
    console.log('连接到 PostgreSQL 数据库');

    // 删除表（注意顺序，先删除有外键依赖的表）
    await client.query('DROP TABLE IF EXISTS carts CASCADE');
    console.log('删除 carts 表');

    await client.query('DROP TABLE IF EXISTS orders CASCADE');
    console.log('删除 orders 表');

    await client.query('DROP TABLE IF EXISTS products CASCADE');
    console.log('删除 products 表');

    await client.query('DROP TABLE IF EXISTS users CASCADE');
    console.log('删除 users 表');

    console.log('所有表删除完成');
  } catch (error) {
    console.error('删除表失败:', error.message);
  } finally {
    await client.end();
    console.log('数据库连接已关闭');
  }
};

dropTables();