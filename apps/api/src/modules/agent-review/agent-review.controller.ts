import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards, UseInterceptors } from '@nestjs/common';
import { AgentReviewService } from './agent-review.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';

@Controller('agent-reviews')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
export class AgentReviewController {
  constructor(private agentReviewService: AgentReviewService) {}

  @Post()
  async createReview(
    @CurrentUser() user: any,
    @Body() body: { agentId: string; rating: number; comment?: string }
  ) {
    return this.agentReviewService.createReview(user.id, body.agentId, body.rating, body.comment);
  }

  @Put(':reviewId')
  async updateReview(
    @CurrentUser() user: any,
    @Param('reviewId') reviewId: string,
    @Body() body: { rating?: number; comment?: string }
  ) {
    return this.agentReviewService.updateReview(user.id, reviewId, body.rating, body.comment);
  }

  @Delete(':reviewId')
  async deleteReview(@CurrentUser() user: any, @Param('reviewId') reviewId: string) {
    return this.agentReviewService.deleteReview(user.id, reviewId);
  }

  @Get('agent/:agentId')
  async getAgentReviews(
    @Param('agentId') agentId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.agentReviewService.getAgentReviews(agentId, parseInt(page), parseInt(limit));
  }

  @Get('user/:userId')
  async getUserReviews(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.agentReviewService.getUserReviews(userId, parseInt(page), parseInt(limit));
  }

  @Get('my/:agentId')
  async getMyReview(@CurrentUser() user: any, @Param('agentId') agentId: string) {
    return this.agentReviewService.getMyReview(user.id, agentId);
  }

  @Get('my')
  async getMyReviews(
    @CurrentUser() user: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.agentReviewService.getUserReviews(user.id, parseInt(page), parseInt(limit));
  }
}
