# Egg + Tegg 请求示例（egg-tegg-request-sample）

一个使用 TypeScript + Egg 3 + Tegg 的最小可运行示例，演示：
- GET/POST 三个参数的请求与返回
- Service 层记录请求参数
- 中间件在请求上添加时间戳 t 参数
- AOP 统一打印调用日志

## 目录结构

```
app/
  controller/
    DemoController.ts          # 路由与入参声明
  middleware/
    requestTime.ts             # 全局中间件：统计耗时并输出日志、设置响应头 x-readtime
  modules/
    demo/
      DemoService.ts           # 业务逻辑：聚合参数、记录日志并返回
      advice/LogAdvice.ts      # AOP：对 Service.handle* 进行环绕日志
      middleware/
        addTimestampMiddleware.ts  # 为请求 URL 添加 t 时间戳参数
        postLogMiddleware.ts       # 类级中间件：仅在 DemoController 上生效，打印 POST 请求日志
  public/
config/
  config.default.ts
  config.local.ts
  module.json
  plugin.js
package.json
 tsconfig.json
 typings/
```

## 快速开始

1. 安装依赖
   ```bash
   cd egg-tegg-request-sample
   npm i
   ```

2. 本地开发启动
   ```bash
   npm run dev
   # Dev 默认监听 7001 端口
   ```

3. 访问接口
   - GET 示例
     ```bash
     curl 'http://127.0.0.1:7001/demo?id=1001&name=alice&age=18'
     ```
     预期返回（字段示例）：
     ```json
     {
       "ok": true,
       "source": "get",
       "id": "1001",
       "name": "alice",
       "age": "18",
       "t": "<由中间件添加的时间戳>"
     }
     ```

   - POST 示例
     ```bash
     curl -X POST 'http://127.0.0.1:7001/demo/2002' \
       -H 'content-type: application/json' \
       -d '{"name":"bob","age":"20"}'
     ```
     预期返回（字段示例）：
     ```json
     {
       "ok": true,
       "source": "post",
       "id": "2002",
       "name": "bob",
       "age": "20",
       "t": "<由中间件添加的时间戳>"
     }
     ```

4. 响应头
   - 全局中间件会为所有请求设置 `x-readtime` 响应头（单位：毫秒），用于表示本次请求的处理耗时。

## 关键能力说明

- 控制器 DemoController
  - 路由前缀 `/demo`
  - GET `/demo` 读取 query：`id`、`name`、`age`
  - POST `/demo/:id` 读取 path param：`id` 和 body：`{ name, age }`

- 中间件
  - addTimestampMiddleware（方法级）：为请求 URL 添加时间戳参数 `t`
  - postLogMiddleware（类级）：在 DemoController 上打印所有 POST 请求日志
  - requestTime（全局）：统计请求耗时并输出日志，同时设置响应头 `x-readtime`

- AOP LogAdvice
  - 对 Service 的 `handle*` 方法进行环绕日志，统一记录入参、返回值与异常

- Service DemoService
  - 聚合控制器入参并返回 `{ ok, source, id, name, age, t }`
  - 使用 `ctx.logger` 记录结构化日志

## 脚本

- 开发：`npm run dev`
- 启动：`npm start`（与 dev 一致，用于本地便捷）
- 测试：`npm test`（如存在测试用例时执行）

## 开发提示

- 修改配置后建议重启本地服务以确保生效
- 运行期日志位于项目内 `logs/` 目录
- TypeScript 编译输出目录为 `dist/`（由 `tsconfig.json` 指定）

## 许可证

本示例遵循仓库根目录的 MIT 许可证（参见根目录 `LICENSE`）。