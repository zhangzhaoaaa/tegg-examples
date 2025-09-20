# 商品管理系统

一个基于 Egg.js + Tegg + PostgreSQL 的全栈商品管理系统，支持多角色用户管理、商品管理、订单管理等功能。

## 功能特性

- 🔐 **用户认证与授权**：支持管理员、商家、消费者三种角色
- 📦 **商品管理**：商品的增删改查、分类管理、库存管理
- 🛒 **购物车功能**：添加商品到购物车、数量调整、结算
- 📋 **订单管理**：订单创建、状态跟踪、订单历史
- 👥 **用户管理**：用户注册、登录、个人信息管理
- 📊 **数据统计**：销售数据、用户统计等

## 技术栈

### 后端
- **框架**：Egg.js + Tegg
- **数据库**：PostgreSQL (支持 SQLite)
- **ORM**：Leoric
- **认证**：JWT
- **密码加密**：bcryptjs

### 前端
- **框架**：React 18 + TypeScript
- **构建工具**：Umi 4
- **UI 组件**：Ant Design 5
- **状态管理**：Zustand
- **HTTP 客户端**：Axios
- **样式**：Less

## 项目结构

```
egg-tegg-product-management/
├── app/                    # 后端应用代码
│   ├── controller/         # 控制器层
│   │   ├── AuthController.ts      # 认证控制器
│   │   ├── CartController.ts      # 购物车控制器
│   │   ├── OrderController.ts     # 订单控制器
│   │   ├── ProductController.ts   # 商品控制器
│   │   └── UserController.ts      # 用户控制器
│   ├── modules/           # 业务模块
│   │   ├── user/          # 用户模块
│   │   ├── product/       # 商品模块
│   │   ├── order/         # 订单模块
│   │   └── cart/          # 购物车模块
│   └── public/            # 静态资源
├── config/                # 配置文件
│   ├── config.default.ts  # 默认配置
│   ├── module.json        # 模块配置
│   └── plugin.js          # 插件配置
├── scripts/               # 脚本和部署文件
│   ├── build/             # 构建脚本
│   │   ├── build-backend.sh       # 后端构建脚本
│   │   └── build-frontend.sh      # 前端构建脚本
│   ├── database/          # 数据库相关脚本
│   │   ├── init-db.js             # Node.js 数据库初始化
│   │   ├── init-db.sql            # SQL 数据库初始化
│   │   ├── init-postgres-db.js    # PostgreSQL 初始化
│   │   └── drop-tables.js         # 删除表结构
│   ├── docker/            # Docker 配置
│   │   ├── Dockerfile.backend     # 后端 Docker 镜像
│   │   ├── Dockerfile.frontend    # 前端 Docker 镜像
│   │   ├── docker-compose.yml     # Docker Compose 配置
│   │   └── README.md              # Docker 部署说明
│   ├── egg-scripts/       # Egg.js 原生启动方式
│   │   ├── start-with-egg-scripts.sh  # 完整启动脚本
│   │   ├── start-dev.sh               # 开发环境启动
│   │   └── start-prod.sh              # 生产环境启动
│   ├── nginx/             # Nginx 配置
│   │   ├── nginx.conf             # 反向代理配置
│   │   └── README.md              # Nginx 配置说明
│   ├── pm2/               # PM2 进程管理
│   │   ├── ecosystem.config.js    # PM2 配置文件
│   │   └── start-pm2.sh           # PM2 启动脚本
│   ├── deploy.sh          # 部署脚本
│   └── README.md          # 脚本使用说明
├── test/                  # 测试和调试文件
│   ├── check-user-passwords.js    # 用户密码检查
│   ├── check-users-simple.js      # 简单用户检查
│   ├── debug-product-controller.js # 商品控制器调试
│   ├── test-orm-connection.js     # ORM 连接测试
│   └── test-product-service.js    # 商品服务测试
├── typings/               # 类型声明
├── web/                   # 前端应用
│   ├── src/
│   │   ├── pages/         # 页面组件
│   │   │   ├── auth/      # 认证页面
│   │   │   ├── admin/     # 管理员页面
│   │   │   ├── merchant/  # 商家页面
│   │   │   └── consumer/  # 消费者页面
│   │   ├── components/    # 公共组件
│   │   ├── services/      # API 服务
│   │   ├── stores/        # 状态管理
│   │   ├── types/         # 类型定义
│   │   └── wrappers/      # 权限包装器
│   ├── .umirc.ts          # Umi 配置
│   └── package.json       # 前端依赖
├── docker-compose.yml     # Docker Compose 配置
├── package.json           # 后端依赖
└── tsconfig.json          # TypeScript 配置
```

## 快速开始

### 1. 安装依赖

```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd web && npm install
```

### 2. 初始化数据库

```bash
# 运行数据库初始化脚本
node scripts/database/init-postgres-db.js
```

### 3. 启动开发服务

#### 方式一：使用 Egg.js 原生启动（推荐开发环境）

```bash
# 启动后端服务 (端口: 7001)
npm run dev

# 启动前端服务 (端口: 8000)
cd web && npm run dev
```

#### 方式二：使用 PM2 进程管理（推荐生产环境）

```bash
# 使用 PM2 启动后端服务
./scripts/pm2/start-pm2.sh start

# 启动前端服务
cd web && npm run dev
```

#### 方式三：使用 Docker（推荐容器化部署）

```bash
# 使用 Docker Compose 启动所有服务
docker-compose up -d
```

### 4. 访问应用

- 前端地址: http://localhost:8000
- 后端 API: http://localhost:7001

## 默认账户

系统预置了以下演示账户，可直接登录使用：

| 角色 | 邮箱 | 密码 | 说明 |
|------|------|------|------|
| 管理员 | admin@example.com | 123456 | 系统管理员，拥有所有权限 |
| 商家 | merchant1@example.com | 123456 | 商家账户，可管理商品和订单 |
| 消费者 | consumer1@example.com | 123456 | 普通用户，可浏览商品和下单 |

## 测试和调试

项目提供了多个测试和调试工具，位于 `test/` 目录：

### 测试脚本

```bash
# 测试 ORM 数据库连接
node test/test-orm-connection.js

# 测试商品服务功能
node test/test-product-service.js

# 调试商品控制器
node test/debug-product-controller.js
```

### 用户验证工具

```bash
# 检查用户密码（详细版本）
node test/check-user-passwords.js

# 简单用户检查
node test/check-users-simple.js
```

### 测试文件说明

- **`test-orm-connection.js`** - 验证数据库 ORM 连接是否正常
- **`test-product-service.js`** - 测试商品相关业务逻辑
- **`debug-product-controller.js`** - 调试商品控制器的各种操作
- **`check-user-passwords.js`** - 检查系统中用户的密码加密情况
- **`check-users-simple.js`** - 快速检查用户数据的基本信息

## 脚本和部署

项目提供了完整的脚本工具集，详细说明请参考 [scripts/README.md](scripts/README.md)。

### 主要脚本目录

- **`scripts/egg-scripts/`** - Egg.js 原生启动方式，适合开发环境
- **`scripts/pm2/`** - PM2 进程管理方式，适合生产环境
- **`scripts/docker/`** - Docker 容器化部署，适合云环境
- **`scripts/database/`** - 数据库初始化和管理脚本
- **`scripts/build/`** - 前后端构建脚本
- **`scripts/nginx/`** - Nginx 反向代理配置

### 快速部署

```bash
# 开发环境快速启动
./scripts/egg-scripts/start-dev.sh

# 生产环境 PM2 启动
./scripts/pm2/start-pm2.sh start

# Docker 容器化部署
docker-compose up -d
```

## API 接口

### 认证接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/logout` - 用户登出

### 用户管理
- `GET /api/users` - 获取用户列表（管理员）
- `GET /api/users/:id` - 获取用户详情
- `POST /api/users` - 创建用户（管理员）
- `PUT /api/users/:id` - 更新用户信息
- `DELETE /api/users/:id` - 删除用户（管理员）
- `PUT /api/users/:id/ban` - 封禁用户（管理员）

### 商品管理
- `GET /api/products` - 获取商品列表
- `GET /api/products/:id` - 获取商品详情
- `POST /api/products` - 创建商品（商家/管理员）
- `PUT /api/products/:id` - 更新商品信息（商家/管理员）
- `DELETE /api/products/:id` - 删除商品（商家/管理员）
- `PUT /api/products/:id/status` - 切换商品状态（商家/管理员）

### 订单管理
- `GET /api/orders` - 获取订单列表
- `GET /api/orders/:id` - 获取订单详情
- `POST /api/orders` - 创建订单（购买商品）
- `PUT /api/orders/:id/status` - 更新订单状态（商家/管理员）

### 购物车管理
- `GET /api/cart` - 获取购物车
- `POST /api/cart/add` - 添加商品到购物车
- `PUT /api/cart/update` - 更新购物车商品数量
- `DELETE /api/cart/remove` - 从购物车移除商品
- `DELETE /api/cart/clear` - 清空购物车

### 系统接口
- `GET /` - 系统信息
- `GET /api/health` - 健康检查

## 功能截图

### 登录页面
系统支持三种角色登录：管理员、商家、消费者。提供快速登录功能，方便演示使用。

### 管理员功能
- **用户管理**：查看所有用户信息，管理用户状态
- **商品管理**：审核商家提交的商品，管理商品状态
- **订单管理**：查看所有订单，处理订单状态

### 商家功能
- **商品管理**：添加、编辑、删除自己的商品
- **订单管理**：查看和处理自己商品的订单
- **库存管理**：管理商品库存和状态

### 消费者功能
- **商品浏览**：浏览所有可用商品
- **购物车**：添加商品到购物车，管理购物车
- **订单管理**：下单、查看订单状态

## 使用说明

### 1. 环境准备
确保已安装 Node.js (>= 16) 和 pnpm

### 2. 启动后端服务
```bash
# 安装依赖
pnpm install

# 初始化数据库
node scripts/database/init-postgres-db.js

# 启动后端服务
pnpm run dev
```

### 3. 启动前端服务
```bash
# 进入前端目录
cd web

# 安装依赖
pnpm install

# 启动前端服务
pnpm run dev
```

### 4. 访问应用
- 前端地址：http://localhost:8000
- 后端地址：http://localhost:7001

### 5. 功能演示流程
1. **管理员登录**：使用 admin@example.com / 123456 登录
2. **商家注册/登录**：注册新商家或使用 merchant1@example.com / 123456
3. **添加商品**：商家登录后添加商品信息
4. **管理员审核**：管理员审核商家提交的商品
5. **消费者购买**：使用 consumer1@example.com / 123456 登录购买商品
6. **订单处理**：商家处理订单，消费者查看订单状态

### 数据库模型

系统包含三个主要数据模型：

1. **User（用户）**
   - 支持管理员和普通用户角色
   - 包含用户名、邮箱、密码等基本信息

2. **Product（商品）**
   - 商品名称、描述、价格、库存等信息
   - 支持分类管理

3. **Order（订单）**
   - 关联用户和商品
   - 包含数量、总价、订单状态等信息

### 权限控制

- **管理员**: 拥有所有权限，可以管理用户、商品和订单
- **普通用户**: 可以浏览商品、创建订单、查看自己的订单

## 部署

### 开发环境部署

#### 使用 Egg.js 原生启动
```bash
# 快速开发启动
./scripts/egg-scripts/start-dev.sh

# 完整启动（包含前后端）
./scripts/egg-scripts/start-with-egg-scripts.sh
```

#### 使用 PM2 进程管理
```bash
# 启动服务
./scripts/pm2/start-pm2.sh start

# 停止服务
./scripts/pm2/start-pm2.sh stop

# 重启服务
./scripts/pm2/start-pm2.sh restart

# 查看状态
./scripts/pm2/start-pm2.sh status
```

### 生产环境部署

#### 1. 构建前端应用
```bash
# 使用构建脚本
./scripts/build/build-frontend.sh

# 或手动构建
cd web && npm run build
```

#### 2. 启动生产服务
```bash
# 使用 PM2 启动生产服务
./scripts/pm2/start-pm2.sh start

# 或使用 Egg.js 原生启动
./scripts/egg-scripts/start-prod.sh
```

### Docker 部署

#### 使用 Docker Compose（推荐）
```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 停止服务
docker-compose down
```

#### 手动 Docker 部署
```bash
# 构建后端镜像
docker build -f scripts/docker/Dockerfile.backend -t product-management-backend .

# 构建前端镜像
docker build -f scripts/docker/Dockerfile.frontend -t product-management-frontend ./web

# 运行容器
docker run -p 7001:7001 product-management-backend
docker run -p 8000:8000 product-management-frontend
```

### Nginx 反向代理

如需使用 Nginx 作为反向代理，请参考 [scripts/nginx/README.md](scripts/nginx/README.md)：

```bash
# 复制 Nginx 配置
cp scripts/nginx/nginx.conf /etc/nginx/sites-available/product-management

# 启用站点
ln -s /etc/nginx/sites-available/product-management /etc/nginx/sites-enabled/

# 重载 Nginx
nginx -s reload
```

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 许可证

MIT License