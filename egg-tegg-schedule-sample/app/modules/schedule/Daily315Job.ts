import { Inject } from '@eggjs/tegg';
import type { EggLogger } from 'egg';
import { Schedule, ScheduleType, type ScheduleSubscriber } from '@eggjs/tegg/schedule';

// Cron 示例：每天 3:15 运行，仅在 prod 环境启用（本地默认不跑）
@Schedule({
  type: ScheduleType.WORKER,
  scheduleData: { cron: '0 15 3 * * *' },
}, { env: [ 'prod' ] })
export class Daily315Job implements ScheduleSubscriber {
  @Inject()
  private readonly logger: EggLogger;

  async subscribe() {
    this.logger.info('[Daily315Job] run at %s', new Date().toISOString());
  }
}