# Egg + Tegg + ORM (PostgreSQL) 可运行示例

本示例基于 Egg 3 + @eggjs/tegg + @eggjs/tegg-orm-plugin（ORM 驱动 Leoric），演示：Controller / Service / Model 的基本用法，包含按条件分页查询，能够直接跑通接口与数据库。

## 目录结构（精简版）
- app/controller/PkgController.ts：对外 HTTP 接口（/pkg/...）
- app/modules/orm/PkgService.ts：业务逻辑与分页查询
- app/modules/orm/model/Pkg.ts：数据模型（表 userInfo）
- config/config.default.ts：ORM 数据源配置（PostgreSQL）
- config/module.json：仅加载 orm 模块

## 前置条件
- Node.js ≥ 18
- 本机或可访问的 PostgreSQL 实例
- 默认数据库配置（见 config/config.default.ts）：
  - PGHOST=127.0.0.1，PGPORT=5432
  - PGDATABASE=tegg（可通过环境变量覆盖 PGDATABASE/PGHOST/PGPORT）
  - 用户名/密码：postgres/postgres（如不同，请修改 config/config.default.ts 中 datasources[0] 的 user/password）

请在目标数据库中先创建示例表（名称区分大小写）：
```sql
CREATE TABLE IF NOT EXISTS "userInfo" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255)
);
```

## 安装与启动
```bash
# 进入示例目录
cd examples/egg-tegg-orm-pg

# 安装依赖
npm i

# 启动开发服务
npm run dev
# 正常情况下日志会显示：egg started on http://127.0.0.1:7001
```

## 接口说明（基于 /pkg 前缀）
- 创建：POST /pkg/create
  - Body(JSON)：{ "name": string, "email": string }
  - 返回：创建后的记录
- 查询单个：GET /pkg/get?name={name}
  - 返回：匹配到的单条记录或 null
- 删除：GET /pkg/delete?id={id}
  - 返回：受影响的行数（number）
- 条件分页：GET /pkg/page?page={page}&pageSize={pageSize}&name={name?}&email={email?}
  - 可选条件：name、email
  - 返回：{ total, page, pageSize, items }

## 快速验证（使用 curl）
```bash
# 1) 创建两条数据
curl -X POST http://127.0.0.1:7001/pkg/create \
  -H 'content-type: application/json' \
  -d '{"name":"Alice","email":"alice@example.com"}'

curl -X POST http://127.0.0.1:7001/pkg/create \
  -H 'content-type: application/json' \
  -d '{"name":"Bob","email":"bob@example.com"}'

# 2) 分页查询（可带条件）
curl "http://127.0.0.1:7001/pkg/page?page=1&pageSize=10"
curl "http://127.0.0.1:7001/pkg/page?page=1&pageSize=10&name=Alice"

# 3) 按 name 查询单个
curl "http://127.0.0.1:7001/pkg/get?name=Bob"

# 4) 按 id 删除
curl "http://127.0.0.1:7001/pkg/delete?id=1"
```

分页返回示例（结构）：
```json
{
  "total": 2,
  "page": 1,
  "pageSize": 10,
  "items": [
    { "id": 1, "name": "Alice", "email": "alice@example.com" },
    { "id": 2, "name": "Bob",   "email": "bob@example.com" }
  ]
}
```

## 常见问题
- 连接失败（ECONNREFUSED）：确认 PostgreSQL 正在运行，或调整 PGHOST/PGPORT/PGDATABASE 环境变量。
- 报错 relation "userInfo" does not exist：请先执行前文的建表 SQL。
- 使用非 postgres/postgres 账户：修改 config/config.default.ts 中 datasources[0] 的 user/password。

完成以上步骤，即可通过本示例打通“接口访问 + 数据库读写”。