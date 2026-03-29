import { Module } from '@nestjs/common';
import { AgentFollowService } from './agent-follow.service';
import { AgentFollowController } from './agent-follow.controller';

@Module({
  providers: [AgentFollowService],
  controllers: [AgentFollowController],
  exports: [AgentFollowService],
})
export class AgentFollowModule {}
