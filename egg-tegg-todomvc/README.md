# Egg + Tegg TodoMVC 示例（egg-tegg-todomvc）

一个可直接运行的 TodoMVC 示例，基于 Egg 3 + @eggjs/tegg + @eggjs/tegg-orm-plugin（Leoric ORM，SQLite）。前端为纯静态页面，后端提供 REST API，并通过 ORM 将数据持久化到本地 SQLite 文件。

## 演示能力
- Controller + Service 分层，依赖注入
- ORM 模型声明与持久化（SQLite，无需安装外部数据库）
- 静态资源托管（前端页面与样式、脚本）
- 全量 TodoMVC 功能：新增、编辑、完成/未完成、全选/全不选、清除已完成、删除

## 目录结构（精简版）
```
app/
  controller/
    HomeController.ts     # 根路径重定向到 /index.html
    TodoController.ts     # REST API：/api/todos...
  modules/
    todo/
      model/Todo.ts       # ORM 模型（id/title/completed）
      TodoService.ts      # 业务逻辑：增删改查、清理
  public/
    index.html            # 前端页面
    app.js                # 前端逻辑（直接调用后端 API）
    style.css             # 样式
config/
  config.default.ts       # ORM（SQLite）与静态资源配置
  module.json             # 模块声明（仅加载 todo 模块）
  plugin.js               # 启用 tegg 相关插件与 orm 插件
package.json              # 脚本与依赖
scripts/
  smoke-api.js            # 本地接口快速验证脚本
  init-db.js              # 初始化数据库表结构脚本
```

## 快速开始
```bash
# 进入示例目录
cd egg-tegg-todomvc

# 安装依赖（使用工作区/本地链接更佳）
npm i

# 初始化数据库（创建 SQLite 文件与表结构）
npm run init:db

# 本地启动（默认端口 7001）
npm run dev
# 日志正常情况下会显示：egg started on http://127.0.0.1:7001
```

## 访问方式
- 打开前端页面（推荐）：
  - 浏览器访问 http://127.0.0.1:7001/index.html
  - 直接使用页面完成新增、编辑、切换完成状态、全选、清除已完成、删除等操作
- 调用后端 API（cURL 示例）：
  - 列表
    ```bash
    curl http://127.0.0.1:7001/api/todos
    ```
  - 新增
    ```bash
    curl -X POST http://127.0.0.1:7001/api/todos \
      -H 'content-type: application/json' \
      -d '{"title":"First Task"}'
    ```
  - 更新（按 id；可选字段：title、completed，completed 取值 0/1）
    ```bash
    curl -X PUT http://127.0.0.1:7001/api/todos/<id> \
      -H 'content-type: application/json' \
      -d '{"title":"Updated Title","completed":1}'
    ```
  - 删除
    ```bash
    curl -X DELETE http://127.0.0.1:7001/api/todos/<id>
    ```
  - 全部切换完成/未完成
    ```bash
    curl -X POST http://127.0.0.1:7001/api/todos/toggle-all \
      -H 'content-type: application/json' \
      -d '{"completed":1}'
    ```
  - 清除已完成
    ```bash
    curl -X DELETE http://127.0.0.1:7001/api/todos/completed
    ```

## 一键接口验证脚本（可选）
- 确保服务已在本地 7001 端口启动后运行：
  ```bash
  node scripts/smoke-api.js
  ```
  该脚本会依次执行列表/新增/更新/删除等接口并打印结果，便于快速验证后端 API 是否工作正常。

## 配置与依赖
- ORM：默认使用 SQLite（无需外部数据库），数据库文件位于 `./run/todos.sqlite`，相关配置见 <mcfile name="config.default.ts" path="/Users/zeromike/gitcode/tegg-examples/egg-tegg-todomvc/config/config.default.ts"></mcfile>。
- 已启用插件：
  - `@eggjs/tegg-plugin`
  - `@eggjs/tegg-controller-plugin`
  - `@eggjs/tegg-config`
  - `@eggjs/tegg-orm-plugin`

## 使用到的装饰器
- 控制器：`@HTTPController`、`@HTTPMethod`、`@HTTPBody`、`@HTTPParam`、`@Context`
- 依赖注入：`@Inject`
- 服务：`@SingletonProto`
- ORM：`@Model`、`@Attribute`

## 脚本
- 开发：`npm run dev`
- 启动：`npm start`（与 dev 一致，便于本地）
- 测试：`npm test`（如存在测试用例时执行）
- 初始化数据库：`npm run init:db`

## 许可证
本示例遵循仓库根目录的 MIT 许可证（参见根目录 `LICENSE`）。