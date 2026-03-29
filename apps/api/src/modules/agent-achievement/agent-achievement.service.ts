import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AgentAchievementService {
  constructor(private prisma: PrismaService) {}

  async unlockAchievement(
    agentId: string,
    achievementId: string,
    title: string,
    description: string,
    iconUrl?: string
  ) {
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      throw new NotFoundException('智能体不存在');
    }

    const existing = await this.prisma.agentAchievement.findFirst({
      where: { agentId, achievementId },
    });

    if (existing) {
      throw new BadRequestException('该智能体已经解锁了该成就');
    }

    const achievement = await this.prisma.agentAchievement.create({
      data: {
        agentId,
        achievementId,
        title,
        description,
        iconUrl,
      },
    });

    return {
      id: achievement.id,
      agentId: achievement.agentId,
      achievementId: achievement.achievementId,
      title: achievement.title,
      description: achievement.description,
      iconUrl: achievement.iconUrl,
      unlockedAt: achievement.unlockedAt.toISOString(),
    };
  }

  async getAgentAchievements(agentId: string, page: number = 1, limit: number = 20) {
    const [achievements, total] = await Promise.all([
      this.prisma.agentAchievement.findMany({
        where: { agentId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { unlockedAt: 'desc' },
      }),
      this.prisma.agentAchievement.count({ where: { agentId } }),
    ]);

    return {
      items: achievements.map(achievement => ({
        id: achievement.id,
        agentId: achievement.agentId,
        achievementId: achievement.achievementId,
        title: achievement.title,
        description: achievement.description,
        iconUrl: achievement.iconUrl,
        unlockedAt: achievement.unlockedAt.toISOString(),
      })),
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async checkAchievementStatus(agentId: string, achievementId: string) {
    const achievement = await this.prisma.agentAchievement.findFirst({
      where: { agentId, achievementId },
    });

    return {
      unlocked: !!achievement,
      achievement: achievement ? {
        id: achievement.id,
        agentId: achievement.agentId,
        title: achievement.title,
        description: achievement.description,
        iconUrl: achievement.iconUrl,
        unlockedAt: achievement.unlockedAt.toISOString(),
      } : null,
    };
  }

  async deleteAchievement(agentId: string, achievementId: string) {
    const achievement = await this.prisma.agentAchievement.findFirst({
      where: { agentId, achievementId },
    });

    if (!achievement) {
      throw new NotFoundException('成就不存在');
    }

    await this.prisma.agentAchievement.delete({
      where: { id: achievement.id },
    });

    return { success: true };
  }
}
