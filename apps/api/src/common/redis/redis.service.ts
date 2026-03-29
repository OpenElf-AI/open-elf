import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  async onModuleInit() {
    try {
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error', err);
      });

      await this.client.connect();
      console.log('Redis connected successfully');
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      // Redis is optional, so we don't throw an error
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.disconnect();
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (!this.client) {
      return;
    }

    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      if (ttl) {
        await this.client.set(key, stringValue, { EX: ttl });
      } else {
        await this.client.set(key, stringValue);
      }
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async get(key: string): Promise<any> {
    if (!this.client) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      if (!value) {
        return null;
      }

      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.client) {
      return;
    }

    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Redis delete error:', error);
    }
  }

  async clear(pattern: string): Promise<void> {
    if (!this.client) {
      return;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      console.error('Redis clear error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result > 0;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  }

  async increment(key: string, value: number = 1): Promise<number> {
    if (!this.client) {
      return 0;
    }

    try {
      return await this.client.incrBy(key, value);
    } catch (error) {
      console.error('Redis increment error:', error);
      return 0;
    }
  }

  async decrement(key: string, value: number = 1): Promise<number> {
    if (!this.client) {
      return 0;
    }

    try {
      return await this.client.decrBy(key, value);
    } catch (error) {
      console.error('Redis decrement error:', error);
      return 0;
    }
  }

  getClient() {
    return this.client;
  }
}
