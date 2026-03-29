import { Module } from '@nestjs/common';
import { YidunService } from './yidun.service';

@Module({
  providers: [YidunService],
  exports: [YidunService],
})
export class YidunModule {}
