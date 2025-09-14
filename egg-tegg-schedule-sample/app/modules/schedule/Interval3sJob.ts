import { Inject } from '@eggjs/tegg';
import type { EggLogger } from 'egg';
import { Schedule, ScheduleType, type ScheduleSubscriber } from '@eggjs/tegg/schedule';

// 每 3 秒打印日志：worker 单实例执行，启动后立即跑一次
@Schedule({
  type: ScheduleType.WORKER,
  scheduleData: { interval: '3s' },
}, { immediate: true })
export class Interval3sJob implements ScheduleSubscriber {
  @Inject()
  private readonly logger: EggLogger;

  async subscribe() {
    this.logger.info('[Interval3sJob] tick at %s', new Date().toISOString());
  }
}