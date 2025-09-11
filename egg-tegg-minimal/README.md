# Egg + Tegg 最小可运行示例（egg-tegg-minimal）

包含：Controller / Service / Inject / Lifecycle / Test

## 快速开始

```bash
# 进入示例目录
cd egg-tegg-minimal

# 安装依赖（使用工作区/本地链接更佳）
npm i

# 本地启动（默认端口 7001）
npm run dev
# 访问 http://127.0.0.1:7001/hello?name=tegg
# 访问 http://127.0.0.1:7001/hello/user?name=tegg

# 运行测试（egg-bin + mocha + egg-mock）
npm test
```

## 接口示例

- GET /hello?name=tegg
  - 返回示例：
    ```json
    { "message": "hello, tegg", "count": 1 }
    ```
  - 说明：count 为服务内计数，每次请求都会自增。

- GET /hello/user?name=u1
  - 返回示例：
    ```json
    { "user": "u1", "level": "basic" }
    ```
  - 当未传 name 时，默认返回：
    ```json
    { "user": "anonymous", "level": "basic" }
    ```

## 目录结构

```
app/
  controller/
    HelloController.ts   # 暴露 /hello 与 /hello/user 两个接口
  modules/
    hello/
      GreetService.ts    # 带 @LifecycleInit 计数的问候服务
    user/
      UserService.ts     # 用户信息服务（level 固定为 basic）
  public/
config/
  config.default.ts
  module.json            # 声明模块路径，生产环境可正确加载
  plugin.js              # 启用 @eggjs/tegg-plugin 与 @eggjs/tegg-controller-plugin
package.json
 test/
  hello.test.ts          # 验证 /hello 接口
  hello_user.test.ts     # 验证 /hello/user 接口
 tsconfig.json
 typings/
```

## 关键代码说明

- app/controller/HelloController.ts
  - 使用装饰器 @HTTPController/@HTTPMethod 暴露路由
  - 注入 GreetService 与 UserService
  - 方法：
    - index(name): 返回 `{ message, count }`
    - user(name): 返回 `{ user, level }`

- app/modules/hello/GreetService.ts
  - `@SingletonProto` + `@LifecycleInit`
  - 在 greet(name) 中维护自增计数，返回 `{ message, count }`

- app/modules/user/UserService.ts
  - 返回 `{ user: name || 'anonymous', level: 'basic' }`

- config/plugin.js
  - 启用 `@eggjs/tegg-plugin` 与 `@eggjs/tegg-controller-plugin`

- config/module.json
  - 声明 hello 与可选 user 模块，方便裁剪

## 脚本

- 开发：`npm run dev`
- 启动：`npm start`（与 dev 一致，用于本地便捷）
- 测试：`npm test`

## 测试

- 使用 egg-bin 运行 mocha 测试，结合 egg-mock 提供的 `app.httpRequest()` 进行接口验证
- 断言示例参见 `test/hello.test.ts` 与 `test/hello_user.test.ts`

## 许可证

本示例遵循仓库根目录的 MIT 许可证（参见根目录 `LICENSE`）。