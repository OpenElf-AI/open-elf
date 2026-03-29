import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    // 构建带有连接池参数的数据库URL
    let databaseUrl = process.env.DATABASE_URL || '';
    
    // 添加连接池参数
    if (databaseUrl.includes('?')) {
      databaseUrl += '&';
    } else {
      databaseUrl += '?';
    }
    
    databaseUrl += `pool_max=${process.env.DATABASE_POOL_MAX || 20}`;
    databaseUrl += `&pool_min=${process.env.DATABASE_POOL_MIN || 5}`;
    databaseUrl += `&pool_timeout=${process.env.DATABASE_POOL_TIMEOUT || 30000}`;
    
    super({
      log: process.env.NODE_ENV === 'production' 
        ? ['error'] 
        : ['query', 'info', 'warn', 'error'],
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Database disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting from database', error);
    }
  }
}
