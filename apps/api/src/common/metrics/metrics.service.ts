import { Injectable, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

interface MetricData {
  timestamp: number;
  endpoint: string;
  method: string;
  duration: number;
  statusCode: number;
  success: boolean;
}

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);
  private metrics: MetricData[] = [];
  private readonly maxMetrics = 10000;
  private startTime: number = Date.now();

  constructor(
    @Inject(PrismaService) private prismaService: PrismaService,
    @Inject(RedisService) private redisService: RedisService,
  ) {}

  recordRequest(
    endpoint: string,
    method: string,
    duration: number,
    statusCode: number,
    success: boolean,
  ): void {
    const metric: MetricData = {
      timestamp: Date.now(),
      endpoint,
      method,
      duration,
      statusCode,
      success,
    };

    this.metrics.push(metric);

    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    if (statusCode >= 500) {
      this.logger.warn(
        `Request failed: ${method} ${endpoint} - ${statusCode} (${duration}ms)`,
      );
    }
  }

  async getStats() {
    const now = Date.now();
    const lastMinute = this.metrics.filter(m => now - m.timestamp < 60000);
    const lastHour = this.metrics.filter(m => now - m.timestamp < 3600000);

    const totalRequests = this.metrics.length;
    const successfulRequests = this.metrics.filter(m => m.success).length;
    const errorRate = totalRequests > 0 
      ? ((totalRequests - successfulRequests) / totalRequests * 100).toFixed(2) 
      : '0.00';

    const durations = this.metrics.map(m => m.duration);
    const avgDuration = durations.length > 0 
      ? (durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(2)
      : '0';

    const p95Duration = this.getPercentile(durations, 95);
    const p99Duration = this.getPercentile(durations, 99);

    // 检查数据库连接状态
    let dbStatus = 'unknown';
    try {
      await this.prismaService.$queryRaw`SELECT 1`;
      dbStatus = 'healthy';
    } catch (error) {
      dbStatus = 'unhealthy';
      this.logger.error('Database connection check failed:', error);
    }

    // 检查Redis连接状态
    let redisStatus = 'unknown';
    try {
      await this.redisService.getClient().ping();
      redisStatus = 'healthy';
    } catch (error) {
      redisStatus = 'unhealthy';
      this.logger.error('Redis connection check failed:', error);
    }

    return {
      uptime: now - this.startTime,
      totalRequests,
      requestsPerMinute: lastMinute.length,
      requestsPerHour: lastHour.length,
      errorRate: `${errorRate}%`,
      avgDuration: `${avgDuration}ms`,
      p95Duration: `${p95Duration}ms`,
      p99Duration: `${p99Duration}ms`,
      database: {
        status: dbStatus,
      },
      redis: {
        status: redisStatus,
      },
    };
  }

  private getPercentile(arr: number[], percentile: number): number {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  reset(): void {
    this.metrics = [];
    this.startTime = Date.now();
    this.logger.log('Metrics reset');
  }
}
