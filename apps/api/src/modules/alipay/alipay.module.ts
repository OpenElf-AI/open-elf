import { Module } from '@nestjs/common';
import { AlipayService } from './alipay.service';
import { AlipayController } from './alipay.controller';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [OrderModule],
  providers: [AlipayService],
  controllers: [AlipayController],
  exports: [AlipayService],
})
export class AlipayModule {}
