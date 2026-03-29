import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class UserAgentService {
  constructor(private prisma: PrismaService) {}

  async getUserAgents(
    page: number = 1,
    limit: number = 20,
    search?: string,
  ) {
    const where: any = {};
    if (search) {
      where.OR = [
        { agentName: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    const [userAgents, total] = await Promise.all([
      this.prisma.userAgent.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          agent: {
            select: { id: true, name: true, avatar: true, category: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { purchaseTime: 'desc' },
      }),
      this.prisma.userAgent.count({ where }),
    ]);

    return {
      items: userAgents.map(ua => ({
        id: ua.id,
        userId: ua.userId,
        userName: ua.user?.name || '未知',
        userEmail: ua.user?.email || '',
        agentId: ua.agentId,
        agentName: ua.agentName,
        agentAvatar: ua.agentAvatar,
        agentCategory: ua.agent?.category || '',
        originalAgentId: ua.originalAgentId,
        purchaseTime: ua.purchaseTime.toISOString(),
        conversationCount: ua.conversationCount,
        lastUsedAt: ua.lastUsedAt?.toISOString(),
        createdAt: ua.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
