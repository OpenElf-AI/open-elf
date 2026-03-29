import { Module } from '@nestjs/common';
import { AgentAchievementService } from './agent-achievement.service';
import { AgentAchievementController } from './agent-achievement.controller';

@Module({
  providers: [AgentAchievementService],
  controllers: [AgentAchievementController],
  exports: [AgentAchievementService],
})
export class AgentAchievementModule {}
