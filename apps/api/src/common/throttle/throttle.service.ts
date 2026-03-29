import { Injectable, Inject } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class ThrottleService {
  constructor(
    @Inject(RedisService) private redisService: RedisService,
  ) {}

  /**
   * 检查请求是否超过限流阈值
   * @param key 限流键（通常是IP地址或用户ID）
   * @param limit 时间窗口内的最大请求数
   * @param windowMs 时间窗口大小（毫秒）
   * @returns 是否允许请求
   */
  async check(key: string, limit: number = 100, windowMs: number = 60000): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - windowMs;
    const redisKey = `throttle:${key}`;

    try {
      // 使用Redis的sorted set来存储请求时间戳
      await this.redisService.getClient().zadd(redisKey, now, now.toString());
      
      // 移除时间窗口外的请求记录
      await this.redisService.getClient().zremrangebyscore(redisKey, 0, windowStart);
      
      // 设置键的过期时间，避免内存泄漏
      await this.redisService.getClient().expire(redisKey, Math.ceil(windowMs / 1000));
      
      // 计算当前时间窗口内的请求数
      const count = await this.redisService.getClient().zcard(redisKey);
      
      // 检查是否超过限制
      return count <= limit;
    } catch (error) {
      // 如果Redis出错，默认允许请求，避免影响正常服务
      console.error('Throttle check error:', error);
      return true;
    }
  }

  /**
   * 清除限流记录
   * @param key 限流键
   */
  async clear(key: string): Promise<void> {
    const redisKey = `throttle:${key}`;
    try {
      await this.redisService.delete(redisKey);
    } catch (error) {
      console.error('Throttle clear error:', error);
    }
  }

  /**
   * 获取当前限流状态
   * @param key 限流键
   * @param windowMs 时间窗口大小（毫秒）
   * @returns 当前请求数
   */
  async getStatus(key: string, windowMs: number = 60000): Promise<number> {
    const now = Date.now();
    const windowStart = now - windowMs;
    const redisKey = `throttle:${key}`;

    try {
      // 移除时间窗口外的请求记录
      await this.redisService.getClient().zremrangebyscore(redisKey, 0, windowStart);
      
      // 计算当前时间窗口内的请求数
      return await this.redisService.getClient().zcard(redisKey);
    } catch (error) {
      console.error('Throttle status error:', error);
      return 0;
    }
  }
}
