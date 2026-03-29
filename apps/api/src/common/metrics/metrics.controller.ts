import { Controller, Get, Post } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  @Get()
  async getMetrics() {
    const stats = await this.metricsService.getStats();
    return {
      code: 200,
      data: stats,
      message: 'success',
    };
  }

  @Post('reset')
  resetMetrics() {
    this.metricsService.reset();
    return {
      code: 200,
      data: null,
      message: 'Metrics reset successfully',
    };
  }
}
