const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// 确保run目录存在
const runDir = path.join(__dirname, '../run');
if (!fs.existsSync(runDir)) {
  fs.mkdirSync(runDir, { recursive: true });
}

// 数据库文件路径
const dbPath = path.join(runDir, 'product_management.sqlite');

// 如果数据库文件已存在，删除它
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('已删除旧的数据库文件');
}

// 创建数据库连接
const db = new sqlite3.Database(dbPath);

console.log('开始初始化数据库...');

// 创建用户表
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'consumer' CHECK (role IN ('consumer', 'merchant', 'admin')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'banned')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error('创建用户表失败:', err);
  } else {
    console.log('用户表创建成功');
  }
});

// 创建商品表
db.run(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subtitle TEXT,
    quantity INTEGER NOT NULL DEFAULT 0,
    images TEXT, -- JSON array of image URLs (max 3)
    details TEXT,
    merchant_id INTEGER,
    status INTEGER NOT NULL DEFAULT 1 CHECK (status IN (0, 1)), -- 0: inactive, 1: active
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (merchant_id) REFERENCES users(id)
  )
`, (err) => {
  if (err) {
    console.error('创建商品表失败:', err);
  } else {
    console.log('商品表创建成功');
  }
});

// 创建订单表
db.run(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    items TEXT NOT NULL, -- JSON array of order items
    total DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'completed', 'cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`, (err) => {
  if (err) {
    console.error('创建订单表失败:', err);
  } else {
    console.log('订单表创建成功');
  }
});

// 创建购物车表
db.run(`
  CREATE TABLE IF NOT EXISTS carts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  )
`, (err) => {
  if (err) {
    console.error('创建购物车表失败:', err);
  } else {
    console.log('购物车表创建成功');
  }
});

// 使用 serialize 确保操作顺序
db.serialize(() => {
  // 插入默认管理员用户
  const bcrypt = require('bcryptjs');
  const adminPassword = bcrypt.hashSync('admin123', 10);

  db.run(`
    INSERT OR IGNORE INTO users (username, email, password, role, status) 
    VALUES ('admin', 'admin@example.com', ?, 'admin', 'active')
  `, [adminPassword], (err) => {
    if (err) {
      console.error('插入管理员用户失败:', err);
    } else {
      console.log('默认管理员用户创建成功 (用户名: admin, 密码: admin123)');
    }
  });

  // 插入测试商家用户
  const merchantPassword = bcrypt.hashSync('merchant123', 10);

  db.run(`
    INSERT OR IGNORE INTO users (username, email, password, role, status) 
    VALUES ('merchant', 'merchant@example.com', ?, 'merchant', 'active')
  `, [merchantPassword], (err) => {
    if (err) {
      console.error('插入商家用户失败:', err);
    } else {
      console.log('测试商家用户创建成功 (用户名: merchant, 密码: merchant123)');
    }
  });

  // 插入测试消费者用户
  const consumerPassword = bcrypt.hashSync('consumer123', 10);

  db.run(`
    INSERT OR IGNORE INTO users (username, email, password, role, status) 
    VALUES ('consumer', 'consumer@example.com', ?, 'consumer', 'active')
  `, [consumerPassword], (err) => {
    if (err) {
      console.error('插入消费者用户失败:', err);
    } else {
      console.log('测试消费者用户创建成功 (用户名: consumer, 密码: consumer123)');
    }
  });

  // 插入测试商品数据
  db.run(`
    INSERT OR IGNORE INTO products (title, subtitle, quantity, images, details, merchant_id) 
    VALUES (
      '测试商品1', 
      '这是一个测试商品的副标题', 
      100, 
      '["https://via.placeholder.com/300x300?text=Product1"]', 
      '这是测试商品1的详细信息，包含了商品的各种特性和使用说明。', 
      2
    )
  `, (err) => {
    if (err) {
      console.error('插入测试商品1失败:', err);
    } else {
      console.log('测试商品1创建成功');
    }
  });

  db.run(`
    INSERT OR IGNORE INTO products (title, subtitle, quantity, images, details, merchant_id) 
    VALUES (
      '测试商品2', 
      '另一个测试商品的副标题', 
      50, 
      '["https://via.placeholder.com/300x300?text=Product2", "https://via.placeholder.com/300x300?text=Product2-2"]', 
      '这是测试商品2的详细信息，具有更多的功能和特色。', 
      2
    )
  `, (err) => {
    if (err) {
      console.error('插入测试商品2失败:', err);
    } else {
      console.log('测试商品2创建成功');
    }
  });

  // 关闭数据库连接
  db.close((err) => {
    if (err) {
      console.error('关闭数据库连接失败:', err);
    } else {
      console.log('数据库初始化完成！');
      console.log('数据库文件位置:', dbPath);
      console.log('\n默认用户账号:');
      console.log('管理员 - 用户名: admin, 密码: admin123');
      console.log('商家 - 用户名: merchant, 密码: merchant123');
      console.log('消费者 - 用户名: consumer, 密码: consumer123');
    }
  });
});