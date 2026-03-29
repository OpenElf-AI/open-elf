import { Module } from '@nestjs/common';
import { UserAgentService } from './user-agent.service';
import { UserAgentController } from './user-agent.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [UserAgentService],
  controllers: [UserAgentController],
  exports: [UserAgentService],
})
export class UserAgentModule {}
