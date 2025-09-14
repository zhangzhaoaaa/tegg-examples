import { Inject } from '@eggjs/tegg';
import type { EggLogger } from 'egg';
import { Schedule, ScheduleType, type ScheduleSubscriber } from '@eggjs/tegg/schedule';

// Interval 数值写法：每 10 秒，worker 单实例
@Schedule({
  type: ScheduleType.WORKER,
  scheduleData: { interval: 10000 },
})
export class Interval10sJob implements ScheduleSubscriber {
  @Inject()
  private readonly logger: EggLogger;

  async subscribe() {
    this.logger.info('[Interval10sJob] tick at %s', new Date().toISOString());
  }
}