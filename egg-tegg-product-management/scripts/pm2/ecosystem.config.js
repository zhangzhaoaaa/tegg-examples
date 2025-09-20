// PM2 配置文件
// 用于生产环境进程管理

module.exports = {
  apps: [
    {
      name: 'product-management-backend',
      script: './dist/app.js',
      cwd: './dist',
      instances: 'max', // 使用所有CPU核心
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        EGG_SERVER_ENV: 'local',
        PORT: 7001
      },
      env_production: {
        NODE_ENV: 'production',
        EGG_SERVER_ENV: 'prod',
        PORT: 7001
      },
      // 日志配置
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // 进程管理
      min_uptime: '10s',
      max_restarts: 10,
      autorestart: true,
      
      // 监控配置
      watch: false,
      ignore_watch: [
        'node_modules',
        'logs',
        'test'
      ],
      
      // 内存和CPU限制
      max_memory_restart: '1G',
      
      // 健康检查
      health_check_grace_period: 3000,
      
      // 其他配置
      merge_logs: true,
      time: true
    }
  ],
  
  // 部署配置
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-server.com'],
      ref: 'origin/main',
      repo: 'git@github.com:your-username/your-repo.git',
      path: '/var/www/product-management',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production'
    }
  }
};