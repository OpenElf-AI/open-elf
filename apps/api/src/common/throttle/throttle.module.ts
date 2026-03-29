import { Module, Global } from '@nestjs/common';
import { ThrottleService } from './throttle.service';
import { ThrottleGuard } from './throttle.guard';

@Global()
@Module({
  providers: [
    ThrottleService,
    ThrottleGuard,
  ],
  exports: [
    ThrottleService,
    ThrottleGuard,
  ],
})
export class ThrottleModule {}