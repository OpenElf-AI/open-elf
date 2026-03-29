import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CacheService } from '../../common/cache/cache.service';

interface UserActivity {
  userId: string;
  action: string;
  module: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(PrismaService) private prismaService: PrismaService,
    @Inject(CacheService) private cacheService: CacheService,
  ) {}

  /**
   * 记录用户行为
   * @param activity 用户行为数据
   */
  async trackActivity(activity: UserActivity): Promise<void> {
    try {
      // 这里可以添加逻辑将行为数据存储到数据库
      // 为了简单起见，我们暂时只记录到缓存中
      const cacheKey = `activity:${activity.userId}:${Date.now()}`;
      await this.cacheService.set(cacheKey, activity, 3600000); // 1小时过期

      // 同时更新用户活动统计
      await this.updateActivityStats(activity.userId, activity.action, activity.module);
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }

  /**
   * 更新用户活动统计
   * @param userId 用户ID
   * @param action 行为类型
   * @param module 模块名称
   */
  private async updateActivityStats(userId: string, action: string, module: string): Promise<void> {
    const statsKey = `user:${userId}:activity:stats`;
    const stats = await this.cacheService.get(statsKey) || {};

    // 更新统计数据
    if (!stats[module]) {
      stats[module] = {};
    }
    if (!stats[module][action]) {
      stats[module][action] = 0;
    }
    stats[module][action]++;

    await this.cacheService.set(statsKey, stats, 86400000); // 24小时过期
  }

  /**
   * 获取用户活动统计
   * @param userId 用户ID
   * @returns 用户活动统计数据
   */
  async getUserActivityStats(userId: string): Promise<any> {
    const statsKey = `user:${userId}:activity:stats`;
    return await this.cacheService.get(statsKey) || {};
  }

  /**
   * 获取系统整体活动统计
   * @param days 统计天数
   * @returns 系统活动统计数据
   */
  async getSystemActivityStats(days: number = 7): Promise<any> {
    const cacheKey = `system:activity:stats:${days}`;
    
    // 尝试从缓存获取
    const cachedStats = await this.cacheService.get(cacheKey);
    if (cachedStats) {
      return cachedStats;
    }

    // 计算时间范围
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 这里应该从数据库查询实际数据
    // 为了演示，我们返回模拟数据
    const stats = {
      totalUsers: await this.prismaService.user.count(),
      totalAgents: await this.prismaService.agent.count(),
      totalOrders: await this.prismaService.order.count(),
      dailyActiveUsers: Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - i - 1));
        return {
          date: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 100) + 50,
        };
      }),
      popularModules: [
        { module: 'agent', count: 1200 },
        { module: 'order', count: 800 },
        { module: 'user', count: 600 },
        { module: 'creator', count: 400 },
      ],
      commonActions: [
        { action: 'view', count: 2500 },
        { action: 'create', count: 800 },
        { action: 'update', count: 500 },
        { action: 'delete', count: 200 },
      ],
    };

    // 缓存结果
    await this.cacheService.set(cacheKey, stats, 3600000); // 1小时过期

    return stats;
  }

  /**
   * 获取用户增长趋势
   * @param days 统计天数
   * @returns 用户增长趋势数据
   */
  async getUserGrowthTrend(days: number = 30): Promise<any> {
    const cacheKey = `user:growth:trend:${days}`;
    
    // 尝试从缓存获取
    const cachedTrend = await this.cacheService.get(cacheKey);
    if (cachedTrend) {
      return cachedTrend;
    }

    // 计算时间范围
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 这里应该从数据库查询实际数据
    // 为了演示，我们返回模拟数据
    const trend = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      return {
        date: date.toISOString().split('T')[0],
        newUsers: Math.floor(Math.random() * 20) + 5,
        totalUsers: 1000 + i * 15,
      };
    });

    // 缓存结果
    await this.cacheService.set(cacheKey, trend, 86400000); // 24小时过期

    return trend;
  }

  /**
   * 获取代理销售趋势
   * @param days 统计天数
   * @returns 代理销售趋势数据
   */
  async getAgentSalesTrend(days: number = 30): Promise<any> {
    const cacheKey = `agent:sales:trend:${days}`;
    
    // 尝试从缓存获取
    const cachedTrend = await this.cacheService.get(cacheKey);
    if (cachedTrend) {
      return cachedTrend;
    }

    // 计算时间范围
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 这里应该从数据库查询实际数据
    // 为了演示，我们返回模拟数据
    const trend = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      return {
        date: date.toISOString().split('T')[0],
        sales: Math.floor(Math.random() * 50) + 10,
        revenue: Math.floor(Math.random() * 5000) + 1000,
      };
    });

    // 缓存结果
    await this.cacheService.set(cacheKey, trend, 86400000); // 24小时过期

    return trend;
  }

  /**
   * 获取热门代理
   * @param limit 数量限制
   * @returns 热门代理列表
   */
  async getPopularAgents(limit: number = 10): Promise<any> {
    const cacheKey = `agents:popular:${limit}`;
    
    // 尝试从缓存获取
    const cachedAgents = await this.cacheService.get(cacheKey);
    if (cachedAgents) {
      return cachedAgents;
    }

    // 从数据库查询
    const agents = await this.prismaService.agent.findMany({
      orderBy: [
        { soldCount: 'desc' },
        { conversationCount: 'desc' },
      ],
      take: limit,
    });

    // 缓存结果
    await this.cacheService.set(cacheKey, agents, 3600000); // 1小时过期

    return agents;
  }

  /**
   * 获取用户行为漏斗
   * @returns 用户行为漏斗数据
   */
  async getUserBehaviorFunnel(): Promise<any> {
    const cacheKey = 'user:behavior:funnel';
    
    // 尝试从缓存获取
    const cachedFunnel = await this.cacheService.get(cacheKey);
    if (cachedFunnel) {
      return cachedFunnel;
    }

    // 这里应该从数据库查询实际数据
    // 为了演示，我们返回模拟数据
    const funnel = [
      { stage: '访问', count: 1000 },
      { stage: '注册', count: 600 },
      { stage: '浏览代理', count: 400 },
      { stage: '购买代理', count: 150 },
      { stage: '使用代理', count: 120 },
      { stage: '复购', count: 50 },
    ];

    // 缓存结果
    await this.cacheService.set(cacheKey, funnel, 86400000); // 24小时过期

    return funnel;
  }
}
