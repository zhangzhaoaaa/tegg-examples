# Nginx 反向代理配置说明

本文档详细说明了 `egg-tegg-product-management` 项目的 Nginx 反向代理配置。

## 配置文件

### `nginx.conf`
位于 `scripts/nginx/nginx.conf`，这是一个完整的 Nginx 配置文件，专为本项目优化。

## 配置详解

### 1. 基础配置

```nginx
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}
```

**说明：**
- `worker_processes auto`: 自动根据 CPU 核心数设置工作进程数
- `worker_connections 1024`: 每个工作进程的最大连接数
- `use epoll`: 使用高效的 epoll 事件模型（Linux）
- `multi_accept on`: 允许一次接受多个连接

### 2. HTTP 配置

```nginx
http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    
    # 性能优化
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
}
```

**关键特性：**
- **Gzip 压缩**: 减少传输数据量，提高加载速度
- **Sendfile**: 高效的文件传输
- **Keep-alive**: 复用连接，减少握手开销

### 3. 上游服务器配置

```nginx
upstream backend {
    server backend:7001;
    # 如果有多个后端实例，可以添加更多服务器
    # server backend2:7001;
    # server backend3:7001;
    
    # 负载均衡策略
    # least_conn;  # 最少连接数
    # ip_hash;     # IP 哈希
}
```

**负载均衡策略：**
- **默认 (round-robin)**: 轮询分发请求
- **least_conn**: 将请求分发到连接数最少的服务器
- **ip_hash**: 根据客户端 IP 哈希分发，保证同一客户端请求到同一服务器

### 4. 服务器配置

#### 主服务器块

```nginx
server {
    listen 80;
    server_name localhost;
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # 客户端上传限制
    client_max_body_size 100M;
    
    # 前端静态文件
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
        
        # 缓存策略
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        location ~* \.(html)$ {
            expires 1h;
            add_header Cache-Control "public";
        }
    }
    
    # API 代理
    location /api/ {
        proxy_pass http://backend/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 健康检查
    location /health {
        proxy_pass http://backend/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        access_log off;
    }
}
```

**关键配置说明：**

1. **安全头设置**
   - `X-Frame-Options`: 防止点击劫持
   - `X-XSS-Protection`: XSS 保护
   - `X-Content-Type-Options`: 防止 MIME 类型嗅探
   - `Content-Security-Policy`: 内容安全策略

2. **静态文件处理**
   - `try_files`: SPA 路由支持
   - 静态资源缓存策略（JS/CSS 缓存 1 年，HTML 缓存 1 小时）

3. **API 代理配置**
   - 完整的代理头设置
   - WebSocket 支持
   - 超时配置

## 部署方式

### 1. Docker 部署（推荐）

配置文件已集成到 Docker 镜像中，无需额外配置。

```bash
# 使用 docker-compose 启动
cd scripts/docker
docker-compose up -d
```

### 2. 系统 Nginx 部署

#### 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
# 或
sudo dnf install nginx

# macOS
brew install nginx
```

#### 配置部署

```bash
# 1. 复制配置文件
sudo cp scripts/nginx/nginx.conf /etc/nginx/nginx.conf

# 2. 测试配置
sudo nginx -t

# 3. 重启 Nginx
sudo systemctl restart nginx

# 4. 设置开机自启
sudo systemctl enable nginx
```

### 3. 自定义配置

如果需要自定义配置，可以修改以下部分：

#### 修改端口

```nginx
server {
    listen 8080;  # 修改为你需要的端口
    # ...
}
```

#### 修改后端地址

```nginx
upstream backend {
    server your-backend-host:7001;  # 修改为实际的后端地址
}
```

#### 添加 HTTPS 支持

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;
    
    # 其他配置...
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## 性能优化

### 1. 缓存配置

```nginx
# 在 http 块中添加
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m use_temp_path=off;

# 在 location /api/ 中添加
proxy_cache api_cache;
proxy_cache_valid 200 302 10m;
proxy_cache_valid 404 1m;
proxy_cache_use_stale error timeout invalid_header updating http_500 http_502 http_503 http_504;
```

### 2. 连接优化

```nginx
# 在 http 块中添加
upstream backend {
    server backend:7001;
    keepalive 32;  # 保持连接池
}

# 在 location /api/ 中添加
proxy_http_version 1.1;
proxy_set_header Connection "";
```

### 3. 压缩优化

```nginx
# 增加更多压缩类型
gzip_types
    text/plain
    text/css
    text/xml
    text/javascript
    text/x-component
    application/json
    application/javascript
    application/x-javascript
    application/xml
    application/xml+rss
    application/xhtml+xml
    application/x-font-ttf
    application/vnd.ms-fontobject
    font/opentype
    image/svg+xml
    image/x-icon;
```

## 监控和日志

### 1. 访问日志分析

```bash
# 查看访问日志
tail -f /var/log/nginx/access.log

# 分析最常访问的页面
awk '{print $7}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -10

# 分析状态码分布
awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -nr
```

### 2. 错误日志监控

```bash
# 查看错误日志
tail -f /var/log/nginx/error.log

# 统计错误类型
grep "error" /var/log/nginx/error.log | awk '{print $3}' | sort | uniq -c
```

### 3. 性能监控

```nginx
# 启用状态页面
location /nginx_status {
    stub_status on;
    access_log off;
    allow 127.0.0.1;
    deny all;
}
```

## 故障排除

### 常见问题

1. **502 Bad Gateway**
   - 检查后端服务是否运行
   - 验证 upstream 配置
   - 检查防火墙设置

2. **504 Gateway Timeout**
   - 增加 proxy_read_timeout
   - 检查后端服务响应时间
   - 优化后端性能

3. **413 Request Entity Too Large**
   - 增加 client_max_body_size
   - 检查上传文件大小限制

4. **配置测试失败**
   ```bash
   # 测试配置语法
   sudo nginx -t
   
   # 查看详细错误信息
   sudo nginx -t -c /etc/nginx/nginx.conf
   ```

### 调试技巧

1. **启用调试日志**
   ```nginx
   error_log /var/log/nginx/debug.log debug;
   ```

2. **检查进程状态**
   ```bash
   # 查看 Nginx 进程
   ps aux | grep nginx
   
   # 查看端口占用
   netstat -tlnp | grep :80
   ```

3. **重载配置**
   ```bash
   # 重载配置（不中断服务）
   sudo nginx -s reload
   
   # 重启服务
   sudo systemctl restart nginx
   ```

## 安全建议

### 1. 基础安全

- 隐藏 Nginx 版本信息
- 限制请求方法
- 防止目录遍历
- 设置适当的超时时间

### 2. DDoS 防护

```nginx
# 限制连接数
limit_conn_zone $binary_remote_addr zone=conn_limit_per_ip:10m;
limit_conn conn_limit_per_ip 20;

# 限制请求频率
limit_req_zone $binary_remote_addr zone=req_limit_per_ip:10m rate=5r/s;
limit_req zone=req_limit_per_ip burst=10 nodelay;
```

### 3. 访问控制

```nginx
# 限制特定路径访问
location /admin {
    allow 192.168.1.0/24;
    deny all;
}

# 基于 User-Agent 过滤
if ($http_user_agent ~* (bot|crawler|spider)) {
    return 403;
}
```

## 更新日志

- **v1.2.0**: 重新组织配置文件位置，添加详细说明文档
- **v1.1.0**: 增加安全头配置和性能优化
- **v1.0.0**: 初始版本，基础反向代理配置