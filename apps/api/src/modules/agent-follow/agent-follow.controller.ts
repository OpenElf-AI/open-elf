import { Controller, Get, Post, Delete, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { AgentFollowService } from './agent-follow.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';

@Controller('agent-follows')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
export class AgentFollowController {
  constructor(private agentFollowService: AgentFollowService) {}

  @Post(':agentId')
  async followAgent(@CurrentUser() user: any, @Param('agentId') agentId: string) {
    return this.agentFollowService.followAgent(user.id, agentId);
  }

  @Delete(':agentId')
  async unfollowAgent(@CurrentUser() user: any, @Param('agentId') agentId: string) {
    return this.agentFollowService.unfollowAgent(user.id, agentId);
  }

  @Get('status/:agentId')
  async checkFollowStatus(@CurrentUser() user: any, @Param('agentId') agentId: string) {
    return this.agentFollowService.checkFollowStatus(user.id, agentId);
  }

  @Get('followers/:agentId')
  async getAgentFollowers(
    @Param('agentId') agentId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.agentFollowService.getAgentFollowers(agentId, parseInt(page), parseInt(limit));
  }

  @Get('following/:userId')
  async getUserFollowingAgents(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.agentFollowService.getUserFollowingAgents(userId, parseInt(page), parseInt(limit));
  }

  @Get('counts/agent/:agentId')
  async getAgentFollowCounts(@Param('agentId') agentId: string) {
    return this.agentFollowService.getAgentFollowCounts(agentId);
  }

  @Get('counts/user/:userId')
  async getUserFollowCounts(@Param('userId') userId: string) {
    return this.agentFollowService.getUserFollowCounts(userId);
  }

  @Get('my/following')
  async getMyFollowingAgents(
    @CurrentUser() user: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.agentFollowService.getUserFollowingAgents(user.id, parseInt(page), parseInt(limit));
  }

  @Get('my/counts')
  async getMyFollowCounts(@CurrentUser() user: any) {
    return this.agentFollowService.getUserFollowCounts(user.id);
  }
}
