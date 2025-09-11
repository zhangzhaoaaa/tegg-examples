import { SingletonProto, AccessLevel, LifecycleInit } from '@eggjs/tegg';

@SingletonProto({
  accessLevel: AccessLevel.PUBLIC,
})
export class GreetService {
  private count = 0;

  @LifecycleInit()
  async init() {
    this.count = 0;
  }

  async greet(name: string) {
    this.count += 1;
    return { message: `hello, ${name || 'world'}`, count: this.count };
  }
}