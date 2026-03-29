import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AgentFollowService {
  constructor(private prisma: PrismaService) {}

  async followAgent(userId: string, agentId: string) {
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      throw new NotFoundException('智能体不存在');
    }

    const existing = await this.prisma.agentFollow.findFirst({
      where: { userId, agentId },
    });

    if (existing) {
      throw new BadRequestException('已经关注该智能体');
    }

    const follow = await this.prisma.agentFollow.create({
      data: { userId, agentId },
    });

    await this.prisma.agent.update({
      where: { id: agentId },
      data: { fans: { increment: 1 } },
    });

    return {
      id: follow.id,
      userId: follow.userId,
      agentId: follow.agentId,
      createdAt: follow.createdAt.toISOString(),
    };
  }

  async unfollowAgent(userId: string, agentId: string) {
    const follow = await this.prisma.agentFollow.findFirst({
      where: { userId, agentId },
    });

    if (!follow) {
      throw new NotFoundException('未关注该智能体');
    }

    await this.prisma.agentFollow.delete({
      where: { id: follow.id },
    });

    await this.prisma.agent.update({
      where: { id: agentId },
      data: { fans: { decrement: 1 } },
    });

    return { success: true };
  }

  async checkFollowStatus(userId: string, agentId: string) {
    const follow = await this.prisma.agentFollow.findFirst({
      where: { userId, agentId },
    });

    return { isFollowing: !!follow };
  }

  async getAgentFollowers(agentId: string, page: number = 1, limit: number = 20) {
    const [follows, total] = await Promise.all([
      this.prisma.agentFollow.findMany({
        where: { agentId },
        include: { user: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.agentFollow.count({
        where: { agentId },
      }),
    ]);

    return {
      items: follows.map(follow => ({
        id: follow.id,
        user: {
          id: follow.user.id,
          name: follow.user.name,
          avatar: follow.user.avatar,
        },
        createdAt: follow.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserFollowingAgents(userId: string, page: number = 1, limit: number = 20) {
    const [follows, total] = await Promise.all([
      this.prisma.agentFollow.findMany({
        where: { userId },
        include: { agent: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.agentFollow.count({
        where: { userId },
      }),
    ]);

    return {
      items: follows.map(follow => ({
        id: follow.id,
        agent: {
          id: follow.agent.id,
          name: follow.agent.name,
          avatar: follow.agent.avatar,
          description: follow.agent.description,
        },
        createdAt: follow.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAgentFollowCounts(agentId: string) {
    const followersCount = await this.prisma.agentFollow.count({
      where: { agentId },
    });

    return {
      followersCount,
    };
  }

  async getUserFollowCounts(userId: string) {
    const followingCount = await this.prisma.agentFollow.count({
      where: { userId },
    });

    return {
      followingCount,
    };
  }
}
