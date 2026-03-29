import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';

export interface AgentWithRelations {
  id: string;
  originalId?: string;
  name: string;
  description: string;
  avatar: string;
  prompt: string;
  category: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  isPublic: boolean;
  isFeatured: boolean;
  conversationCount: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
  price: number;
  totalSupply: number;
  soldCount: number;
  isListed: boolean;
  status: string;
  ownerId?: string;
  level: number;
  fans: number;
  exp: number;
  expToNextLevel: number;
  isShowcased: boolean;
  showcasedAt?: string;
  isOwned?: boolean;
  isFavorited?: boolean;
}

@Injectable()
export class AgentService {
  constructor(private prisma: PrismaService, private redisService: RedisService) {}

  async getAgents(
    page: number = 1,
    limit: number = 20,
    category?: string,
    search?: string,
    featured?: boolean,
  ) {
    // 生成缓存键
    const cacheKey = `agents:${page}:${limit}:${category || 'all'}:${search || 'none'}:${featured || 'false'}`;
    
    // 尝试从缓存获取
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const where: any = { isListed: true };
    if (category) where.category = category;
    if (search) where.OR = [{ name: { contains: search } }, { description: { contains: search } }];
    if (featured) where.isFeatured = true;

    const [agents, total] = await Promise.all([
      this.prisma.agent.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.agent.count({ where }),
    ]);

    const result = {
      items: agents.map(this.transformAgent),
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };

    // 缓存结果，设置5分钟过期
    await this.redisService.set(cacheKey, result, 300);

    return result;
  }

  async getAgentsAdmin(
    page: number = 1,
    limit: number = 20,
    category?: string,
    search?: string,
    featured?: boolean,
    isListed?: boolean,
  ) {
    const where: any = {};
    if (category) where.category = category;
    if (search) where.OR = [{ name: { contains: search } }, { description: { contains: search } }];
    if (featured !== undefined) where.isFeatured = featured;
    if (isListed !== undefined) where.isListed = isListed;

    const [agents, total] = await Promise.all([
      this.prisma.agent.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.agent.count({ where }),
    ]);

    return {
      items: agents.map(this.transformAgent),
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async toggleListing(agentId: string, isListed: boolean) {
    const agent = await this.prisma.agent.update({
      where: { id: agentId },
      data: { isListed },
    });

    // 清除相关缓存
    await this.redisService.delete(`agent:${agentId}`);
    await this.redisService.clear('agents:*');

    return { success: true, agent: this.transformAgent(agent) };
  }

  async toggleFeatured(agentId: string, isFeatured: boolean) {
    const agent = await this.prisma.agent.update({
      where: { id: agentId },
      data: { isFeatured },
    });

    // 清除相关缓存
    await this.redisService.delete(`agent:${agentId}`);
    await this.redisService.clear('agents:*');

    return { success: true, agent: this.transformAgent(agent) };
  }

  async getAgentById(id: string, userId?: string): Promise<AgentWithRelations> {
    // 生成缓存键
    const cacheKey = `agent:${id}`;
    
    // 尝试从缓存获取
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      // 如果有userId，需要检查收藏状态
      if (userId) {
        const favorited = await this.prisma.favorite.findFirst({ where: { agentId: id, userId } });
        (cachedData as any).isFavorited = !!favorited;
      }
      return cachedData;
    }

    const agent = await this.prisma.agent.findUnique({ where: { id } });
    if (!agent) {
      throw new NotFoundException('智能体不存在');
    }

    const agentData = this.transformAgent(agent);

    if (userId) {
      const favorited = await this.prisma.favorite.findFirst({ where: { agentId: id, userId } });
      (agentData as any).isOwned = false;
      (agentData as any).isFavorited = !!favorited;
    }

    // 缓存结果，设置10分钟过期
    await this.redisService.set(cacheKey, agentData, 600);

    return agentData;
  }

  async createAgent(userId: string, data: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    const agent = await this.prisma.agent.create({
      data: {
        name: data.name,
        description: data.description,
        avatar: data.avatar,
        prompt: data.prompt,
        category: data.category,
        price: data.price || 0,
        totalSupply: data.totalSupply || 100,
        creatorId: userId,
        creatorName: user?.name || '未知',
        creatorAvatar: user?.avatar || '',
        isListed: true,
      },
    });

    // 清除相关缓存
    await this.redisService.clear('agents:*');

    return this.transformAgent(agent);
  }

  async getMyAgents(userId: string) {
    const agents = await this.prisma.agent.findMany({
      where: { creatorId: userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      items: agents.map(agent => ({
        id: agent.id,
        originalId: agent.id,
        name: agent.name,
        description: agent.description,
        avatar: agent.avatar,
        level: agent.level,
        exp: agent.exp,
        expToNextLevel: agent.expToNextLevel,
        fans: agent.fans,
        isShowcased: agent.isShowcased,
        createdAt: agent.createdAt.toISOString(),
      })),
    };
  }

  async toggleFavorite(userId: string, agentId: string) {
    const existing = await this.prisma.favorite.findFirst({
      where: { userId, agentId },
    });

    let isFavorited: boolean;
    if (existing) {
      await this.prisma.favorite.delete({ where: { id: existing.id } });
      isFavorited = false;
    } else {
      await this.prisma.favorite.create({
        data: { userId, agentId },
      });
      isFavorited = true;
    }

    return { success: true, isFavorited };
  }

  async toggleShowcase(userId: string, agentId: string) {
    const agent = await this.prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent || agent.creatorId !== userId) {
      throw new ForbiddenException('无权操作此智能体');
    }

    const updated = await this.prisma.agent.update({
      where: { id: agentId },
      data: {
        isShowcased: !agent.isShowcased,
        showcasedAt: !agent.isShowcased ? new Date() : null,
      },
    });

    return { success: true, isShowcased: updated.isShowcased };
  }

  async addExp(userId: string, agentId: string, expAmount: number) {
    const agent = await this.prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent || agent.creatorId !== userId) {
      throw new ForbiddenException('无权操作此智能体');
    }

    let newExp = agent.exp + expAmount;
    let newLevel = agent.level;
    let newExpToNext = agent.expToNextLevel;

    while (newExp >= newExpToNext) {
      newExp -= newExpToNext;
      newLevel++;
      newExpToNext = Math.floor(100 * Math.pow(1.5, newLevel - 1));
    }

    const updated = await this.prisma.agent.update({
      where: { id: agentId },
      data: {
        exp: newExp,
        level: newLevel,
        expToNextLevel: newExpToNext,
      },
    });

    return {
      id: updated.id,
      level: updated.level,
      exp: updated.exp,
      expToNextLevel: updated.expToNextLevel,
    };
  }

  async testAgent(userId: string, agentId: string, message: string) {
    const agent = await this.prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent) {
      throw new NotFoundException('智能体不存在');
    }

    if (agent.creatorId !== userId) {
      throw new ForbiddenException('只有创建者可以测试此智能体');
    }

    return {
      success: true,
      message: '测试请求已发送',
      agent: {
        id: agent.id,
        name: agent.name,
        prompt: agent.prompt,
      },
      userMessage: message,
      mockResponse: `这是${agent.name}的模拟回复，实际部署后将根据您的prompt生成真实回复。`,
    };
  }

  async previewAgent(agentId: string, userId?: string) {
    const agent = await this.prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent) {
      throw new NotFoundException('智能体不存在');
    }

    const previewData = this.transformAgent(agent);
    
    if (userId) {
      const favorited = await this.prisma.favorite.findFirst({ where: { agentId, userId } });
      (previewData as any).isFavorited = !!favorited;
    }

    return {
      success: true,
      agent: previewData,
      previewFeatures: {
        canChat: agent.isListed,
        canPurchase: agent.isListed && agent.soldCount < agent.totalSupply,
        remainingSupply: agent.totalSupply - agent.soldCount,
      },
    };
  }

  private transformAgent(agent: any): AgentWithRelations {
    return {
      id: agent.id,
      originalId: agent.originalId || undefined,
      name: agent.name,
      description: agent.description,
      avatar: agent.avatar,
      prompt: agent.prompt,
      category: agent.category,
      creatorId: agent.creatorId,
      creatorName: agent.creatorName,
      creatorAvatar: agent.creatorAvatar,
      isPublic: true,
      isFeatured: agent.isFeatured,
      conversationCount: agent.conversationCount,
      likes: agent.likes,
      createdAt: agent.createdAt.toISOString(),
      updatedAt: agent.updatedAt.toISOString(),
      price: agent.price,
      totalSupply: agent.totalSupply,
      soldCount: agent.soldCount,
      isListed: agent.isListed,
      status: agent.isListed ? 'listed' : 'active',
      ownerId: agent.ownerId || undefined,
      level: agent.level,
      fans: agent.fans,
      exp: agent.exp,
      expToNextLevel: agent.expToNextLevel,
      isShowcased: agent.isShowcased,
      showcasedAt: agent.showcasedAt?.toISOString(),
    };
  }
}
