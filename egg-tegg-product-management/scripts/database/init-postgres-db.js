const { Client } = require('pg');
const bcrypt = require('bcryptjs');

// PostgreSQL 连接配置
const client = new Client({
  host: process.env.PGHOST || '127.0.0.1',
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || 'product',
  user: 'postgres',
  password: 'postgres',
});

console.log('开始初始化 PostgreSQL 数据库...');

// 创建用户表
const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'consumer',
    status INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

// 创建商品表
const createProductsTable = `
  CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    subtitle TEXT,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER DEFAULT 0,
    images TEXT,
    details TEXT,
    status INTEGER DEFAULT 1,
    merchant_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

// 创建订单表
const createOrdersTable = `
  CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    product_id VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  )
`;

// 创建购物车表
const createCartsTable = `
  CREATE TABLE IF NOT EXISTS carts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    product_id VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    UNIQUE(user_id, product_id)
  )
`;

// 插入示例数据
const insertSampleData = async () => {
  try {
    // 检查是否已有用户数据
    const userResult = await client.query('SELECT COUNT(*) as count FROM users');
    if (userResult.rows[0].count > 0) {
      console.log('用户数据已存在，跳过示例数据插入');
      return;
    }

    // 插入示例用户（包含演示账号）
    const hashedPassword = await bcrypt.hash('123456', 10);
    const sampleUsers = [
      ['admin', 'admin@example.com', hashedPassword, 'admin'],
      ['merchant1', 'merchant1@example.com', hashedPassword, 'merchant'],
      ['consumer1', 'consumer1@example.com', hashedPassword, 'consumer'],
      ['demo_admin', 'demo_admin@example.com', hashedPassword, 'admin'],
      ['demo_merchant', 'demo_merchant@example.com', hashedPassword, 'merchant'],
      ['demo_consumer', 'demo_consumer@example.com', hashedPassword, 'consumer']
    ];

    for (const user of sampleUsers) {
      await client.query(
        'INSERT INTO users (username, email, password, role, status, created_at, updated_at) VALUES ($1, $2, $3, $4, 1, NOW(), NOW())',
        user
      );
    }
    console.log('示例用户数据插入完成');

    // 插入示例商品
    const sampleProducts = [
      ['prod_1', 'iPhone 15', '最新款苹果手机', 7999.00, 50, '["iphone15.jpg"]', '苹果最新旗舰手机，配备A17芯片', 2],
      ['prod_2', 'MacBook Pro', '专业级笔记本电脑', 15999.00, 20, '["macbook.jpg"]', '专业级笔记本电脑，适合开发和设计', 2],
      ['prod_3', 'AirPods Pro', '无线降噪耳机', 1999.00, 100, '["airpods.jpg"]', '主动降噪无线耳机', 2],
      ['prod_4', 'iPad Air', '轻薄平板电脑', 4999.00, 30, '["ipad.jpg"]', '轻薄便携的平板电脑', 2],
      ['prod_5', 'Apple Watch', '智能手表', 2999.00, 40, '["watch.jpg"]', '健康监测智能手表', 2],
      ['prod_6', '小米手机', '性价比之选', 2999.00, 80, '["xiaomi.jpg"]', '高性价比智能手机', 2],
      ['prod_7', '华为笔记本', '国产精品笔记本', 6999.00, 25, '["huawei.jpg"]', '国产高端笔记本电脑', 2],
      ['prod_8', '戴尔显示器', '专业显示器', 1599.00, 60, '["dell.jpg"]', '专业级显示器，色彩准确', 2]
    ];

    for (const product of sampleProducts) {
      await client.query(
        'INSERT INTO products (id, title, subtitle, price, quantity, images, details, status, merchant_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, 1, $8, NOW(), NOW())',
        product
      );
    }
    console.log('示例商品数据插入完成');

  } catch (error) {
    console.error('插入示例数据失败:', error.message);
    throw error;
  }
};

// 执行数据库初始化
const initDatabase = async () => {
  try {
    await client.connect();
    console.log('已连接到 PostgreSQL 数据库');

    // 创建表
    await client.query(createUsersTable);
    console.log('用户表创建成功');

    await client.query(createProductsTable);
    console.log('商品表创建成功');

    await client.query(createOrdersTable);
    console.log('订单表创建成功');

    await client.query(createCartsTable);
    console.log('购物车表创建成功');

    // 插入示例数据
    await insertSampleData();

    console.log('数据库初始化完成！');
  } catch (error) {
    console.error('数据库初始化失败:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('数据库连接已关闭');
  }
};

// 运行初始化
initDatabase();