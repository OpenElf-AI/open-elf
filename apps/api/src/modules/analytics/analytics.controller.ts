import { Controller, Get, Query, UseInterceptors, SetMetadata } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';

@Controller('analytics')
@UseInterceptors(TransformInterceptor, AuditInterceptor)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('system-stats')
  @SetMetadata('module', 'analytics')
  @SetMetadata('action', 'system-stats')
  async getSystemStats(
    @Query('days') days: string = '7',
  ) {
    return {
      code: 200,
      message: 'success',
      data: await this.analyticsService.getSystemActivityStats(parseInt(days)),
    };
  }

  @Get('user-growth')
  @SetMetadata('module', 'analytics')
  @SetMetadata('action', 'user-growth')
  async getUserGrowth(
    @Query('days') days: string = '30',
  ) {
    return {
      code: 200,
      message: 'success',
      data: await this.analyticsService.getUserGrowthTrend(parseInt(days)),
    };
  }

  @Get('agent-sales')
  @SetMetadata('module', 'analytics')
  @SetMetadata('action', 'agent-sales')
  async getAgentSales(
    @Query('days') days: string = '30',
  ) {
    return {
      code: 200,
      message: 'success',
      data: await this.analyticsService.getAgentSalesTrend(parseInt(days)),
    };
  }

  @Get('popular-agents')
  @SetMetadata('module', 'analytics')
  @SetMetadata('action', 'popular-agents')
  async getPopularAgents(
    @Query('limit') limit: string = '10',
  ) {
    return {
      code: 200,
      message: 'success',
      data: await this.analyticsService.getPopularAgents(parseInt(limit)),
    };
  }

  @Get('user-funnel')
  @SetMetadata('module', 'analytics')
  @SetMetadata('action', 'user-funnel')
  async getUserBehaviorFunnel() {
    return {
      code: 200,
      message: 'success',
      data: await this.analyticsService.getUserBehaviorFunnel(),
    };
  }

  @Get('user-stats')
  @SetMetadata('module', 'analytics')
  @SetMetadata('action', 'user-stats')
  async getUserStats(
    @Query('userId') userId: string,
  ) {
    return {
      code: 200,
      message: 'success',
      data: await this.analyticsService.getUserActivityStats(userId),
    };
  }
}
