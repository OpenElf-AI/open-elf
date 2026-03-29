import { Controller, Get, Post, Delete, Param, Query, Body, UseGuards, UseInterceptors } from '@nestjs/common';
import { AgentAchievementService } from './agent-achievement.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';

@Controller('agent-achievements')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
export class AgentAchievementController {
  constructor(private agentAchievementService: AgentAchievementService) {}

  @Post()
  async unlockAchievement(
    @Body() body: { agentId: string; achievementId: string; title: string; description: string; iconUrl?: string }
  ) {
    return this.agentAchievementService.unlockAchievement(body.agentId, body.achievementId, body.title, body.description, body.iconUrl);
  }

  @Get('agent/:agentId')
  async getAgentAchievements(
    @Param('agentId') agentId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.agentAchievementService.getAgentAchievements(agentId, parseInt(page), parseInt(limit));
  }

  @Get('status/:agentId/:achievementId')
  async checkAchievementStatus(
    @Param('agentId') agentId: string,
    @Param('achievementId') achievementId: string
  ) {
    return this.agentAchievementService.checkAchievementStatus(agentId, achievementId);
  }

  @Delete(':agentId/:achievementId')
  async deleteAchievement(
    @Param('agentId') agentId: string,
    @Param('achievementId') achievementId: string
  ) {
    return this.agentAchievementService.deleteAchievement(agentId, achievementId);
  }
}
