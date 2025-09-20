# 构建部署脚本说明

本目录包含了 `egg-tegg-product-management` 项目的所有构建、部署和运维脚本。脚本按功能分类组织，便于管理和使用。

## 目录结构

```
scripts/
├── README.md                    # 本说明文档
├── deploy.sh                    # 主部署脚本
├── build/                       # 构建相关脚本
│   ├── build-backend.sh         # 后端构建脚本
│   └── build-frontend.sh        # 前端构建脚本
├── egg-scripts/                 # Egg.js 原生启动方式
│   ├── start-with-egg-scripts.sh # 完整的 egg-scripts 启动脚本
│   ├── start-dev.sh             # 开发环境快速启动
│   └── start-prod.sh            # 生产环境启动
├── pm2/                         # PM2 进程管理方式
│   ├── ecosystem.config.js      # PM2 配置文件
│   └── start-pm2.sh             # PM2 启动脚本
├── database/                    # 数据库相关脚本
│   ├── init-db.js               # 数据库初始化脚本 (Node.js)
│   └── init-db.sql              # 数据库初始化脚本 (SQL)
├── nginx/                       # Nginx 配置
│   └── nginx.conf               # Nginx 反向代理配置
└── docker/                      # Docker 相关文件
    ├── Dockerfile.backend       # 后端 Docker 镜像
    ├── Dockerfile.frontend      # 前端 Docker 镜像
    └── docker-compose.yml       # Docker Compose 配置
```

## 1. Egg.js 原生启动方式 (egg-scripts)

### 特性
- 使用 Egg.js 官方推荐的 `egg-scripts` 启动器
- 支持开发、测试、生产三种环境
- 自动端口检测和冲突处理
- 完整的生命周期管理（启动、停止、重启、状态查看）
- 日志管理和监控

### 脚本说明

#### `egg-scripts/start-with-egg-scripts.sh` - 完整启动脚本
功能最全面的启动脚本，支持所有操作：

```bash
# 启动服务（默认生产环境）
./scripts/egg-scripts/start-with-egg-scripts.sh start

# 指定环境启动
./scripts/egg-scripts/start-with-egg-scripts.sh start development
./scripts/egg-scripts/start-with-egg-scripts.sh start production

# 停止服务
./scripts/egg-scripts/start-with-egg-scripts.sh stop

# 重启服务
./scripts/egg-scripts/start-with-egg-scripts.sh restart

# 查看状态
./scripts/egg-scripts/start-with-egg-scripts.sh status

# 查看日志
./scripts/egg-scripts/start-with-egg-scripts.sh logs
```

#### `egg-scripts/start-dev.sh` - 开发环境快速启动
专为开发环境优化的启动脚本：

```bash
# 快速启动开发环境
./scripts/egg-scripts/start-dev.sh

# 自动处理端口冲突（7001 -> 7002）
# 自动设置开发环境变量
```

#### `egg-scripts/start-prod.sh` - 生产环境启动
专为生产环境优化的启动脚本：

```bash
# 生产环境启动（默认端口 7001，2个工作进程）
./scripts/egg-scripts/start-prod.sh

# 自定义端口和进程数
./scripts/egg-scripts/start-prod.sh --port 8000 --workers 4

# 后台运行
./scripts/egg-scripts/start-prod.sh --daemon
```

## 2. PM2 进程管理方式

### 特性
- 使用 PM2 进行进程管理
- 支持集群模式和负载均衡
- 自动重启和故障恢复
- 内置监控和日志管理
- 支持零停机重载
- 内存和 CPU 使用限制

### 脚本说明

#### `pm2/start-pm2.sh` - PM2 启动脚本
使用 PM2 管理应用进程：

```bash
# 启动应用（默认生产环境）
./scripts/pm2/start-pm2.sh start

# 指定环境启动
./scripts/pm2/start-pm2.sh start development
./scripts/pm2/start-pm2.sh start production

# 停止应用
./scripts/pm2/start-pm2.sh stop

# 重启应用
./scripts/pm2/start-pm2.sh restart

# 零停机重载
./scripts/pm2/start-pm2.sh reload

# 删除应用
./scripts/pm2/start-pm2.sh delete

# 查看状态
./scripts/pm2/start-pm2.sh status

# 查看日志
./scripts/pm2/start-pm2.sh logs

# 监控面板
./scripts/pm2/start-pm2.sh monit
```

#### `pm2/ecosystem.config.js` - PM2 配置文件
包含完整的 PM2 配置：
- 应用配置（名称、脚本、实例数等）
- 环境变量配置
- 日志配置
- 监控配置
- 部署配置

### PM2 vs Egg-scripts 对比

| 特性 | egg-scripts | PM2 |
|------|-------------|-----|
| 官方支持 | ✅ Egg.js 官方 | ✅ Node.js 生态 |
| 进程管理 | 基础 | 高级 |
| 集群模式 | ✅ | ✅ |
| 自动重启 | ✅ | ✅ |
| 零停机重载 | ❌ | ✅ |
| 监控面板 | ❌ | ✅ |
| 日志管理 | 基础 | 高级 |
| 内存限制 | ❌ | ✅ |
| 部署支持 | ❌ | ✅ |

## 3. 构建脚本

### `build/build-backend.sh` - 后端构建
- TypeScript 编译
- 依赖安装和优化
- 构建产物验证

### `build/build-frontend.sh` - 前端构建
- React/Umi 应用构建
- 静态资源优化
- 构建产物验证

## 4. 数据库脚本

### `database/init-db.js` - Node.js 数据库初始化
- 使用 Node.js 和 ORM 初始化数据库
- 支持环境变量配置
- 包含错误处理和日志

### `database/init-db.sql` - SQL 数据库初始化
- 纯 SQL 初始化脚本
- 创建表结构和索引
- 插入初始数据

## 5. 部署流程

### 本地开发部署
```bash
# 1. 初始化数据库
./scripts/database/init-db.js

# 2. 启动开发环境
./scripts/egg-scripts/start-dev.sh
```

### Docker 部署
```bash
# 使用主部署脚本
./scripts/deploy.sh docker

# 或手动执行
cd scripts/docker
docker-compose up -d
```

### 生产环境部署
```bash
# 使用 egg-scripts
./scripts/deploy.sh production

# 或使用 PM2
./scripts/pm2/start-pm2.sh start production
```

## 6. 环境变量

### 必需的环境变量
```bash
# 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=product_management

# 应用配置
NODE_ENV=production
EGG_SERVER_ENV=prod
PORT=7001

# JWT 配置
JWT_SECRET=your-secret-key

# Redis 配置（可选）
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 7. 故障排除

### 常见问题

1. **端口被占用**
   - egg-scripts 脚本会自动检测并切换端口
   - 或手动指定端口：`PORT=8000 ./scripts/egg-scripts/start-prod.sh`

2. **数据库连接失败**
   - 检查数据库服务是否启动
   - 验证环境变量配置
   - 运行数据库初始化脚本

3. **PM2 进程异常**
   ```bash
   # 查看详细日志
   ./scripts/pm2/start-pm2.sh logs
   
   # 重启所有进程
   ./scripts/pm2/start-pm2.sh restart
   ```

4. **构建失败**
   - 检查 Node.js 版本（推荐 16+）
   - 清理依赖：`rm -rf node_modules && npm install`
   - 检查 TypeScript 配置

## 8. 性能优化

### 生产环境建议
1. 使用 PM2 集群模式
2. 配置适当的工作进程数（CPU 核心数）
3. 启用 gzip 压缩
4. 配置静态资源缓存
5. 使用 Redis 缓存
6. 配置数据库连接池

### 监控建议
1. 使用 PM2 监控面板
2. 配置日志轮转
3. 监控内存和 CPU 使用率
4. 设置告警阈值

## 9. 安全建议

1. **环境变量管理**
   - 使用 `.env` 文件管理敏感信息
   - 不要将敏感信息提交到版本控制

2. **权限控制**
   - 使用非 root 用户运行应用
   - 限制文件系统访问权限

3. **网络安全**
   - 配置防火墙规则
   - 使用 HTTPS
   - 配置 CORS 策略

## 10. 更新日志

- **v1.2.0**: 重新组织目录结构，分离 PM2 和 egg-scripts 启动方式
- **v1.1.0**: 添加 PM2 支持和完整的启动脚本
- **v1.0.0**: 初始版本，包含基础构建和部署脚本