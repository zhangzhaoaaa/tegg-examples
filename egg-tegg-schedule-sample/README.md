# egg-tegg-schedule-sample

一个基于 Egg + Tegg 的定时任务示例项目，演示如何使用 `@eggjs/tegg/schedule` 装饰器编写多种类型的定时任务（interval 与 cron），以及常见的实战配置（立即执行、仅特定环境运行、时区设置等）。

## 特性
- Interval 间隔任务：
  - 每 3 秒执行一次（worker 单实例，启动后立即执行一次）
  - 每 10 秒执行一次（worker 单实例）
- Cron 计划任务：
  - 每分钟第 0、30 秒执行（所有 worker）
  - 每分钟第 10 秒执行，含时区设置 Asia/Shanghai（worker 单实例）
  - 每天 3:15 执行，仅在 prod 环境启用（worker 单实例）

## 项目结构（与定时任务相关）
```
examples/egg-tegg-schedule-sample/
├── app/
│   └── modules/
│       └── schedule/
│           ├── Interval3sJob.ts              # 每 3 秒一次（immediate: true）
│           ├── Interval10sJob.ts             # 每 10 秒一次
│           ├── CronEvery0And30SecJob.ts      # 每分钟第 0、30 秒（ALL）
│           ├── CronWithTimezoneJob.ts        # 每分钟第 10 秒（Asia/Shanghai）
│           └── Daily315Job.ts                # 每天 03:15，仅 prod 环境
├── config/
│   ├── config.default.ts
│   └── plugin.js
├── package.json
└── tsconfig.json
```

## 快速开始
- 环境要求：已安装 Node.js（本地验证使用 v22.17.1）与 npm
- 安装依赖：
  ```bash
  npm i
  ```
- 启动开发服务：
  ```bash
  npm run dev
  ```
- 观察日志：
  - 应用日志与 schedule 日志位于 `logs/egg-tegg-schedule-sample/`
  - 常见文件：`egg-web.log*`、`egg-schedule.log*`、`egg-agent.log*`

启动后你应能在日志中看到：
- Interval3sJob 在启动后立即打印一次，然后每 3 秒打印一次
- 其他任务按各自的时间计划打印日志

## 编写一个新的定时任务（步骤）
1. 在 `app/modules/schedule/` 下新建一个 `*.ts` 文件，并导出一个类实现 `ScheduleSubscriber`
2. 使用 `@Schedule()` 装饰器描述任务：
   - `type`: 运行在哪些进程上（如 `ScheduleType.WORKER` 或 `ScheduleType.ALL`）
   - `scheduleData`: 
     - interval 写法：`{ interval: '3s' }` 或 `{ interval: 3000 }`
     - cron 写法：`{ cron: '0,30 * * * * *' }`
     - 时区：`{ cronOptions: { timezone: 'Asia/Shanghai' } }`
   - 可选项：
     - `immediate`: 启动后是否立即执行一次
     - `env`: 仅在指定环境生效（如 `['prod']`）
3. 在 `subscribe()` 中编写你的任务逻辑（可以通过注入 `EggLogger` 记录日志）

## 关键点与常见问题
- 每个文件仅定义一个 `@Schedule` 任务
  - 插件以“文件路径”为注册键，如果同一文件中定义多个任务，后定义的会覆盖先前的，导致你只能看到最后一个任务在跑
  - 本示例已将任务拆分为 5 个独立文件，避免冲突
- 立即执行（immediate）
  - 将 `@Schedule(..., { immediate: true })` 配上后，任务会在服务启动时先跑一次
- 仅特定环境运行
  - 通过 `@Schedule(..., { env: ['prod'] })` 实现，例如 `Daily315Job` 仅在 prod 环境生效
- 时区设置
  - 对 cron 任务可通过 `cronOptions.timezone` 指定，例如 `Asia/Shanghai`
- 关于 tsconfig 继承
  - 本项目 `tsconfig.json` 的 `extends` 明确指向 `@eggjs/tsconfig/tsconfig.json`，确保在不同编辑器/环境下稳定工作
- 启动时的 WARN：schedule 插件重复启用
  - Egg 已内置 `schedule`，如果在 `config/plugin.js` 中再次手动启用，会出现重复定义的 WARN
  - 这不会影响任务运行，但如需消除 WARN，可移除本项目 `config/plugin.js` 中对 `schedule` 的重复定义（仅保留 `teggSchedule` 即可）

## 验证与示例日志
- 当 `npm run dev` 启动成功后，可在日志中看到如下类似输出：
  - 注册：`register schedule .../Interval3sJob.ts` 等 5 条注册日志
  - 执行：`[Interval3sJob] tick at ...` 每 3 秒一次，启动后立即执行一次

## 反馈与学习建议
- 建议先阅读每个 `*.ts` 任务文件中的注释，理解 `@Schedule` 的参数与选项
- 修改间隔或 cron 表达式，观察日志变化，加深对调度行为的认识

---
本示例仅用于学习和演示如何在 Egg + Tegg 中编写定时任务。欢迎基于此继续扩展你的业务任务。