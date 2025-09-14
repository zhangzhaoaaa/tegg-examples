import { Inject } from '@eggjs/tegg';
import type { EggLogger } from 'egg';
import { Schedule, ScheduleType, type ScheduleSubscriber } from '@eggjs/tegg/schedule';

// Cron 示例（含时区设置）：每分钟第 10 秒执行，使用 Asia/Shanghai 时区
@Schedule({
  type: ScheduleType.WORKER,
  scheduleData: { cron: '10 * * * * *', cronOptions: { timezone: 'Asia/Shanghai' } },
})
export class CronWithTimezoneJob implements ScheduleSubscriber {
  @Inject()
  private readonly logger: EggLogger;

  async subscribe() {
    this.logger.info('[CronWithTimezoneJob] tick at %s (Asia/Shanghai)', new Date().toISOString());
  }
}