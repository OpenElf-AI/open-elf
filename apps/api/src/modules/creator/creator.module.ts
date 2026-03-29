import { Module } from '@nestjs/common';
import { CreatorService } from './creator.service';
import { CreatorController } from './creator.controller';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  providers: [CreatorService],
  controllers: [CreatorController],
  exports: [CreatorService],
})
export class CreatorModule {}
