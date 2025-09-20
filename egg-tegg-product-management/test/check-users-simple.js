const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

async function checkUsers() {
  const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'product',
  });

  try {
    console.log('连接数据库...');
    
    // 查询用户数据
    const result = await pool.query('SELECT id, username, email, password FROM users LIMIT 5');
    
    console.log('用户数据:');
    result.rows.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`用户名: ${user.username}`);
      console.log(`邮箱: ${user.email}`);
      console.log(`密码哈希: ${user.password}`);
      console.log(`密码长度: ${user.password ? user.password.length : 'null'}`);
      console.log(`是否以$2b$开头 (bcrypt): ${user.password ? user.password.startsWith('$2b$') : false}`);
      console.log('---');
    });
    
    // 测试密码验证
    if (result.rows.length > 0) {
      const testUser = result.rows[0];
      console.log(`\n测试用户 ${testUser.username} 的密码验证:`);
      
      // 尝试常见的测试密码
      const testPasswords = ['123456', 'password', 'admin', 'test', '111111'];
      
      for (const testPassword of testPasswords) {
        try {
          const isMatch = await bcrypt.compare(testPassword, testUser.password);
          console.log(`密码 "${testPassword}": ${isMatch ? '匹配' : '不匹配'}`);
        } catch (error) {
          console.log(`密码 "${testPassword}": 验证出错 - ${error.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('检查用户时出错:', error);
  } finally {
    await pool.end();
  }
}

checkUsers();