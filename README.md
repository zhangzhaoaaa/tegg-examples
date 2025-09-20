# tegg-examples

tegg 的使用例子。下面列出当前目录中的每个示例项目，包含功能简介与所用装饰器（点击标题可进入对应目录）。

## [egg-tegg-minimal](./egg-tegg-minimal/)
- 功能：最小可运行示例，提供 /hello 与 /hello/user 两个接口，演示 Controller / Service 注入、生命周期与单元测试。
- 使用到的装饰器：
  - @HTTPController、@HTTPMethod（声明路由）
  - @Inject（注入 Service）
  - @SingletonProto、@LifecycleInit（单例与生命周期初始化）

## [egg-tegg-request-sample](./egg-tegg-request-sample/)
- 功能：GET/POST 三参数请求示例；方法级/类级/全局中间件；AOP 统一日志；全局响应头 x-readtime。
- 使用到的装饰器：
  - @HTTPController、@HTTPMethod、@HTTPQuery、@HTTPBody、@HTTPParam、@Context（声明路由与入参）
  - @Middleware（方法/类级中间件）
  - @Advice、@Crosscut（AOP 切面与环绕）

## [egg-tegg-orm-pg](./egg-tegg-orm-pg/)
- 功能：基于 @eggjs/tegg-orm-plugin + Leoric 的 PostgreSQL 示例，提供创建/查询/删除/分页等接口。
- 使用到的装饰器：
  - @HTTPController、@HTTPMethod、@Inject、@SingletonProto（业务层）
  - @Model、@Attribute（ORM 模型与字段声明）

## [egg-tegg-schedule-sample](./egg-tegg-schedule-sample/)
- 功能：定时任务示例，涵盖 interval 与 cron，支持立即执行、仅特定环境启用及时区设置等。
- 使用到的装饰器：
  - @Schedule（声明任务）、ScheduleType（任务运行维度）
  - @Inject（注入 logger 等）

## [egg-tegg-hackernews-async-ts](./egg-tegg-hackernews-async-ts/)
- 功能：HackerNews 异步示例，服务端模板渲染（Nunjucks），包含首页列表、新闻详情、用户信息页面；通过 ctx.curl 调用 HN API 并分页。
- 使用到的装饰器：
  - @HTTPController、@HTTPMethod、@HTTPQuery、@HTTPParam、@Context、@Inject（控制器）
  - @SingletonProto（Service 单例，accessLevel: PUBLIC）

## [egg-tegg-todomvc](./egg-tegg-todomvc/)
- 功能：前后端一体的 TodoMVC 示例。前端静态页面（index.html + app.js），后端提供 REST API（/api/todos...），并通过 ORM（SQLite）持久化数据。
- 使用到的装饰器：
  - @HTTPController、@HTTPMethod、@HTTPBody、@HTTPParam、@Context（控制器与入参）
  - @Inject、@SingletonProto（依赖注入与服务）
  - @Model、@Attribute（ORM 模型）

## [egg-tegg-product-management](./egg-tegg-product-management/)
- 功能：全栈商品管理系统，支持多角色用户管理（管理员/商家/消费者）、商品管理、购物车、订单管理等完整电商功能。前端使用 React + Umi + Ant Design，后端基于 Egg.js + Tegg + PostgreSQL/SQLite。
- 使用到的装饰器：
  - @HTTPController、@HTTPMethod、@HTTPBody、@HTTPParam、@HTTPQuery、@Context（RESTful API 控制器）
  - @Inject、@SingletonProto（依赖注入与服务层）
  - @Model、@Attribute（ORM 模型与字段定义，支持用户、商品、订单、购物车等实体）
