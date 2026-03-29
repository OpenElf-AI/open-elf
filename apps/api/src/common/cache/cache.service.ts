import { Injectable, Inject } from '@nestjs/common';
import { LocalCacheService } from './local-cache.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CacheService {
  constructor(
    @Inject(LocalCacheService) private localCache: LocalCacheService,
    @Inject(RedisService) private redisCache: RedisService,
  ) {}

  /**
   * 设置缓存
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 过期时间（毫秒）
   * @param useRedis 是否使用Redis（默认使用）
   */
  async set(
    key: string, 
    value: any, 
    ttl: number = 300000, 
    useRedis: boolean = true
  ): Promise<void> {
    // 先设置本地缓存
    this.localCache.set(key, value, ttl);
    
    // 如果需要使用Redis，再设置Redis缓存
    if (useRedis) {
      await this.redisCache.set(key, value, Math.floor(ttl / 1000));
    }
  }

  /**
   * 获取缓存
   * @param key 缓存键
   * @param useRedis 是否使用Redis（默认使用）
   * @returns 缓存值，不存在或已过期返回null
   */
  async get(key: string, useRedis: boolean = true): Promise<any> {
    // 先从本地缓存获取
    let value = this.localCache.get(key);
    if (value !== null) {
      return value;
    }
    
    // 如果本地缓存不存在且需要使用Redis，从Redis获取
    if (useRedis) {
      value = await this.redisCache.get(key);
      if (value !== null) {
        // 将Redis中的值同步到本地缓存
        this.localCache.set(key, value);
      }
    }
    
    return value;
  }

  /**
   * 删除缓存
   * @param key 缓存键
   * @param useRedis 是否使用Redis（默认使用）
   */
  async delete(key: string, useRedis: boolean = true): Promise<void> {
    // 删除本地缓存
    this.localCache.delete(key);
    
    // 如果需要使用Redis，也删除Redis缓存
    if (useRedis) {
      await this.redisCache.delete(key);
    }
  }

  /**
   * 清除匹配模式的缓存
   * @param pattern 缓存键模式
   * @param useRedis 是否使用Redis（默认使用）
   */
  async clearPattern(pattern: string, useRedis: boolean = true): Promise<void> {
    // 清除本地缓存
    this.localCache.clearPattern(pattern);
    
    // 如果需要使用Redis，也清除Redis缓存
    if (useRedis) {
      await this.redisCache.clear(pattern);
    }
  }

  /**
   * 检查缓存是否存在
   * @param key 缓存键
   * @param useRedis 是否使用Redis（默认使用）
   * @returns 是否存在且未过期
   */
  async exists(key: string, useRedis: boolean = true): Promise<boolean> {
    // 先检查本地缓存
    if (this.localCache.exists(key)) {
      return true;
    }
    
    // 如果本地缓存不存在且需要使用Redis，检查Redis缓存
    if (useRedis) {
      return await this.redisCache.exists(key);
    }
    
    return false;
  }

  /**
   * 清除所有缓存
   * @param useRedis 是否使用Redis（默认使用）
   */
  async clearAll(useRedis: boolean = true): Promise<void> {
    // 清除本地缓存
    this.localCache.clear();
    
    // 如果需要使用Redis，也清除Redis缓存
    if (useRedis) {
      await this.redisCache.clear('*');
    }
  }
}
