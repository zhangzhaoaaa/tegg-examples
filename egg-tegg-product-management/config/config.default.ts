export default appInfo => {
  const config: any = {};

  // 必填：用于 cookie 签名
  config.keys = appInfo.name + '_egg_tegg_product_management';

  // 安全配置
  config.security = {
    csrf: {
      enable: false,
      ignoreJSON: false,
    },
  };


  // Enable JSON response by tegg-controller
  config.tegg = {
    controller: {
      response: {
        json: true,
      },
    },
  };

  // Leoric ORM 配置（PostgreSQL）
  config.orm = {
    datasources: [
      {
        name: 'product',
        client: 'pg',
        dialect: 'pg',
        database: process.env.PGDATABASE || 'product',
        host: process.env.PGHOST || '127.0.0.1',
        port: Number(process.env.PGPORT || 5432),
        user: 'postgres',
        password: 'postgres',
        define: { underscored: true },
        delegate: 'model',
        baseDir: 'model',
        migrations: 'database',
      },
    ],
  };

  // JWT 配置
  config.jwt = {
    secret: 'egg-tegg-product-management-jwt-secret',
    expiresIn: '7d',
  };

  // 静态文件配置
  config.static = {
    prefix: '/public/',
    dir: 'app/public',
  };

  // 文件上传配置
  config.multipart = {
    mode: 'file',
    fileSize: '5mb',
    fileExtensions: ['.jpg', '.jpeg', '.png', '.gif'],
  };

  return config;
};