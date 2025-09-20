# Docker 配置说明

本文档详细说明了 `egg-tegg-product-management` 项目的 Docker 配置和容器化部署方案。

## 文件结构

```
scripts/docker/
├── README.md              # 本说明文档
├── Dockerfile.backend     # 后端 Docker 镜像配置
├── Dockerfile.frontend    # 前端 Docker 镜像配置
└── docker-compose.yml     # Docker Compose 编排配置
```

## 1. 后端 Dockerfile (`Dockerfile.backend`)

### 镜像构建策略

采用多阶段构建，优化镜像大小和构建效率：

```dockerfile
# 第一阶段：构建阶段
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 安装 pnpm 和依赖
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN pnpm run build

# 第二阶段：运行阶段
FROM node:18-alpine AS runner

# 安装必要的系统依赖
RUN apk add --no-cache dumb-init

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 eggjs

# 设置工作目录
WORKDIR /app

# 从构建阶段复制文件
COPY --from=builder --chown=eggjs:nodejs /app/dist ./dist
COPY --from=builder --chown=eggjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=eggjs:nodejs /app/package.json ./package.json

# 切换到非 root 用户
USER eggjs

# 暴露端口
EXPOSE 7001

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:7001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# 启动应用
CMD ["dumb-init", "node", "dist/app.js"]
```

### 关键特性

1. **多阶段构建**
   - 构建阶段：安装依赖、编译 TypeScript
   - 运行阶段：只包含运行时必需的文件

2. **安全性**
   - 使用非 root 用户运行
   - 最小化系统依赖
   - 使用 `dumb-init` 处理信号

3. **性能优化**
   - 使用 Alpine Linux 减小镜像大小
   - 利用 Docker 层缓存
   - 冻结依赖版本

4. **健康检查**
   - 内置健康检查端点
   - 自动重启不健康的容器

### 构建命令

```bash
# 构建后端镜像
docker build -f scripts/docker/Dockerfile.backend -t egg-tegg-backend:latest .

# 指定构建参数
docker build -f scripts/docker/Dockerfile.backend \
  --build-arg NODE_ENV=production \
  -t egg-tegg-backend:v1.0.0 .
```

## 2. 前端 Dockerfile (`Dockerfile.frontend`)

### 镜像构建策略

同样采用多阶段构建，集成 Nginx 服务器：

```dockerfile
# 第一阶段：构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY web/package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY web/ .

# 构建前端应用
RUN npm run build

# 第二阶段：Nginx 服务阶段
FROM nginx:alpine AS runner

# 复制自定义 Nginx 配置
COPY scripts/nginx/nginx.conf /etc/nginx/nginx.conf

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 创建日志目录
RUN mkdir -p /var/log/nginx

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
```

### 关键特性

1. **静态文件服务**
   - 使用 Nginx 提供高性能静态文件服务
   - 集成反向代理配置

2. **SPA 支持**
   - 配置前端路由支持
   - 处理 404 重定向到 index.html

3. **性能优化**
   - Gzip 压缩
   - 静态资源缓存
   - 并发连接优化

### 构建命令

```bash
# 构建前端镜像
docker build -f scripts/docker/Dockerfile.frontend -t egg-tegg-frontend:latest .

# 指定版本标签
docker build -f scripts/docker/Dockerfile.frontend -t egg-tegg-frontend:v1.0.0 .
```

## 3. Docker Compose 配置 (`docker-compose.yml`)

### 服务编排

完整的多服务编排配置：

```yaml
version: '3.8'

services:
  # PostgreSQL 数据库
  database:
    image: postgres:15-alpine
    container_name: egg-tegg-db
    environment:
      POSTGRES_DB: product_management
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/database/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    ports:
      - "5432:5432"
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis 缓存
  redis:
    image: redis:7-alpine
    container_name: egg-tegg-redis
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  # 后端服务
  backend:
    build:
      context: ../..
      dockerfile: scripts/docker/Dockerfile.backend
    container_name: egg-tegg-backend
    environment:
      NODE_ENV: production
      EGG_SERVER_ENV: prod
      DB_HOST: database
      DB_PORT: 5432
      DB_USER: postgres
      DB_PASSWORD: postgres123
      DB_NAME: product_management
      REDIS_HOST: redis
      REDIS_PORT: 6379
      JWT_SECRET: your-jwt-secret-key
    ports:
      - "7001:7001"
    depends_on:
      database:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - app-network
    volumes:
      - backend_logs:/app/logs
    restart: unless-stopped

  # 前端服务
  frontend:
    build:
      context: ../..
      dockerfile: scripts/docker/Dockerfile.frontend
    container_name: egg-tegg-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - app-network
    restart: unless-stopped

# 网络配置
networks:
  app-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

# 数据卷
volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  backend_logs:
    driver: local
```

### 关键配置说明

1. **服务依赖**
   - 使用 `depends_on` 和健康检查确保启动顺序
   - 后端等待数据库和 Redis 就绪

2. **网络配置**
   - 自定义网络隔离服务
   - 服务间通过服务名通信

3. **数据持久化**
   - 数据库数据持久化
   - Redis 数据持久化
   - 应用日志持久化

4. **环境变量**
   - 集中管理配置
   - 支持不同环境配置

## 4. 部署指南

### 快速启动

```bash
# 进入 docker 目录
cd scripts/docker

# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 生产环境部署

```bash
# 1. 设置环境变量
export JWT_SECRET="your-production-jwt-secret"
export DB_PASSWORD="your-production-db-password"

# 2. 使用生产配置启动
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 3. 初始化数据库（如果需要）
docker-compose exec backend npm run db:init

# 4. 验证服务
curl http://localhost/health
```

### 开发环境部署

```bash
# 使用开发配置
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# 启用热重载
docker-compose exec backend npm run dev
```

## 5. 镜像优化

### 减小镜像大小

1. **使用 Alpine 基础镜像**
   ```dockerfile
   FROM node:18-alpine
   ```

2. **多阶段构建**
   ```dockerfile
   FROM node:18-alpine AS builder
   # 构建阶段
   FROM node:18-alpine AS runner
   # 运行阶段
   ```

3. **清理缓存**
   ```dockerfile
   RUN npm install && npm cache clean --force
   ```

4. **使用 .dockerignore**
   ```
   node_modules
   npm-debug.log
   .git
   .gitignore
   README.md
   .env
   coverage
   .nyc_output
   ```

### 构建缓存优化

1. **分层复制**
   ```dockerfile
   # 先复制 package.json
   COPY package*.json ./
   RUN npm install
   
   # 再复制源代码
   COPY . .
   ```

2. **使用构建缓存**
   ```bash
   # 启用 BuildKit
   export DOCKER_BUILDKIT=1
   docker build --cache-from egg-tegg-backend:latest .
   ```

## 6. 监控和日志

### 容器监控

```bash
# 查看容器资源使用情况
docker stats

# 查看特定容器状态
docker inspect egg-tegg-backend

# 查看容器日志
docker logs -f egg-tegg-backend
```

### 日志管理

```yaml
# 在 docker-compose.yml 中配置日志
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 健康检查

```bash
# 查看健康检查状态
docker inspect --format='{{.State.Health.Status}}' egg-tegg-backend

# 手动执行健康检查
docker exec egg-tegg-backend curl -f http://localhost:7001/health
```

## 7. 故障排除

### 常见问题

1. **容器启动失败**
   ```bash
   # 查看详细错误信息
   docker-compose logs backend
   
   # 进入容器调试
   docker exec -it egg-tegg-backend sh
   ```

2. **数据库连接失败**
   ```bash
   # 检查数据库容器状态
   docker-compose ps database
   
   # 测试数据库连接
   docker exec -it egg-tegg-db psql -U postgres -d product_management
   ```

3. **端口冲突**
   ```bash
   # 查看端口占用
   netstat -tlnp | grep :80
   
   # 修改端口映射
   ports:
     - "8080:80"  # 修改外部端口
   ```

4. **镜像构建失败**
   ```bash
   # 清理构建缓存
   docker builder prune
   
   # 强制重新构建
   docker-compose build --no-cache
   ```

### 调试技巧

1. **进入容器调试**
   ```bash
   # 进入运行中的容器
   docker exec -it egg-tegg-backend sh
   
   # 以 root 用户进入
   docker exec -it --user root egg-tegg-backend sh
   ```

2. **查看容器文件系统**
   ```bash
   # 复制文件到宿主机
   docker cp egg-tegg-backend:/app/logs ./logs
   
   # 查看容器内文件
   docker exec egg-tegg-backend ls -la /app
   ```

3. **网络调试**
   ```bash
   # 查看网络配置
   docker network ls
   docker network inspect egg-tegg-product-management_app-network
   
   # 测试服务间连接
   docker exec egg-tegg-backend ping database
   ```

## 8. 安全最佳实践

### 容器安全

1. **使用非 root 用户**
   ```dockerfile
   RUN adduser --system --uid 1001 eggjs
   USER eggjs
   ```

2. **最小化权限**
   ```dockerfile
   RUN apk add --no-cache --virtual .build-deps \
       python3 make g++ \
   && npm install \
   && apk del .build-deps
   ```

3. **扫描漏洞**
   ```bash
   # 使用 Docker Scout 扫描
   docker scout cves egg-tegg-backend:latest
   
   # 使用 Trivy 扫描
   trivy image egg-tegg-backend:latest
   ```

### 网络安全

1. **网络隔离**
   ```yaml
   networks:
     frontend:
       driver: bridge
     backend:
       driver: bridge
       internal: true  # 内部网络
   ```

2. **端口限制**
   ```yaml
   # 只暴露必要端口
   ports:
     - "127.0.0.1:5432:5432"  # 只绑定本地
   ```

### 数据安全

1. **敏感信息管理**
   ```yaml
   # 使用 Docker Secrets
   secrets:
     db_password:
       file: ./secrets/db_password.txt
   ```

2. **数据加密**
   ```yaml
   # 数据卷加密
   volumes:
     postgres_data:
       driver: local
       driver_opts:
         type: none
         o: bind,encryption=aes256
   ```

## 9. 性能优化

### 资源限制

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### 并发优化

```yaml
services:
  backend:
    environment:
      EGG_WORKERS: 4  # 工作进程数
    deploy:
      replicas: 2     # 服务副本数
```

## 10. CI/CD 集成

### GitHub Actions 示例

```yaml
name: Docker Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Backend Image
        run: |
          docker build -f scripts/docker/Dockerfile.backend \
            -t ${{ secrets.REGISTRY }}/egg-tegg-backend:${{ github.sha }} .
      
      - name: Build Frontend Image
        run: |
          docker build -f scripts/docker/Dockerfile.frontend \
            -t ${{ secrets.REGISTRY }}/egg-tegg-frontend:${{ github.sha }} .
      
      - name: Push Images
        run: |
          docker push ${{ secrets.REGISTRY }}/egg-tegg-backend:${{ github.sha }}
          docker push ${{ secrets.REGISTRY }}/egg-tegg-frontend:${{ github.sha }}
```

## 11. 更新日志

- **v1.2.0**: 重新组织 Docker 文件结构，添加详细说明文档
- **v1.1.0**: 增加多阶段构建和安全配置
- **v1.0.0**: 初始版本，基础 Docker 配置