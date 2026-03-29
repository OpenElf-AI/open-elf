import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';

@Controller('dashboard')
@UseInterceptors(TransformInterceptor)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  async getStats() {
    return this.dashboardService.getStats();
  }

  @Get('user-growth')
  async getUserGrowth(@Query('days') days: number = 7) {
    return this.dashboardService.getUserGrowth(days);
  }

  @Get('order-trend')
  async getOrderTrend(@Query('days') days: number = 7) {
    return this.dashboardService.getOrderTrend(days);
  }

  @Get('agent-sales')
  async getAgentSales(@Query('top') top: number = 5) {
    return this.dashboardService.getAgentSales(top);
  }
}
