# Egg + Tegg HackerNews 异步示例（egg-tegg-hackernews-async-ts）

本示例基于 Egg 3 + @eggjs/tegg + TypeScript，重写 HackerNews async 示例：
- 使用 Nunjucks 进行服务端模板渲染
- 提供首页列表、新闻详情和用户信息三类页面
- 通过 ctx.curl 调用 Hacker News 官方 API，并做分页与数据格式化

## 目录结构（精简版）
- app/controller/NewsController.ts：路由与参数声明（/、/item/:id、/user/:id），渲染模板
- app/modules/news/NewsService.ts：调用 HN API，分页、字段加工（timeText/createdText）
- app/view/layout.tpl：页面公共布局
- app/view/news/list.tpl、app/view/news/detail.tpl、app/view/user.tpl：页面模板
- config/plugin.js：启用 @eggjs/tegg-* 与 egg-view-nunjucks
- config/config.default.ts：视图映射（.tpl -> nunjucks）、news 基础配置（baseUrl、pageSize、timeout）
- package.json、tsconfig.json

## 快速开始
```bash
# 进入目录
cd egg-tegg-hackernews-async-ts

# 安装依赖
npm i

# 启动开发服务（默认 7001 端口）
npm run dev
# 打开 http://127.0.0.1:7001 或 http://127.0.0.1:7001/?page=2
```

## 路由与页面
- GET /?page=N
  - 调用 NewsService.topStories 分页获取 topstories，渲染 news/list.tpl
- GET /item/:id
  - 调用 NewsService.item 获取新闻详情，渲染 news/detail.tpl
- GET /user/:id
  - 调用 NewsService.user 获取用户信息，渲染 user.tpl

## 使用到的装饰器
- 控制器与路由：@HTTPController、@HTTPMethod、@HTTPQuery、@HTTPParam、@Context、@Inject
- Service：@SingletonProto（accessLevel: PUBLIC）

## 关键点
- 通过 ctx.curl 访问 HN API，结合 config.news.baseUrl/pageSize/timeout
- 为返回数据补充可读时间：timeText（item.time）、createdText（user.created）
- 模板引擎：egg-view-nunjucks，.tpl 后缀与 nunjucks 映射

## 脚本
- 开发：npm run dev
- 启动：npm start（与 dev 一致，用于本地便捷）
- 测试：npm test（如存在测试用例时执行）

## 许可证
本示例遵循仓库根目录的 MIT 许可证（参见根目录 LICENSE）。