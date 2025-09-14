import { Inject } from '@eggjs/tegg';
import type { EggLogger } from 'egg';
import { Schedule, ScheduleType, type ScheduleSubscriber } from '@eggjs/tegg/schedule';

// Cron 示例：每分钟第 0、30 秒执行，所有 worker 都执行
@Schedule({
  type: ScheduleType.ALL,
  scheduleData: { cron: '0,30 * * * * *' },
})
export class CronEvery0And30SecJob implements ScheduleSubscriber {
  @Inject()
  private readonly logger: EggLogger;

  async subscribe() {
    this.logger.info('[CronEvery0And30SecJob] cron tick at %s', new Date().toISOString());
  }
}