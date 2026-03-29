import { Controller, Get, Post } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  @Get()
  getMetrics() {
    return {
      code: 200,
      data: this.metricsService.getStats(),
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
