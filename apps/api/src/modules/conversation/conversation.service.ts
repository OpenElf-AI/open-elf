import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ConversationService {
  constructor(private prisma: PrismaService) {}

  async getConversations(userId: string, page: number = 1, limit: number = 20) {
    const where = { userId };
    const [conversations, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { lastMessageAt: 'desc' },
      }),
      this.prisma.conversation.count({ where }),
    ]);

    return {
      items: conversations.map(conv => ({
        id: conv.id,
        userId: conv.userId,
        agentId: conv.agentId,
        agentName: conv.agentName,
        agentAvatar: conv.agentAvatar,
        title: conv.title,
        lastMessage: conv.lastMessage || '',
        lastMessageAt: conv.lastMessageAt?.toISOString() || '',
        messageCount: conv.messageCount,
        createdAt: conv.createdAt.toISOString(),
        isTrial: conv.isTrial,
        trialMessagesRemaining: conv.trialMessagesRemaining,
      })),
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createConversation(userId: string, agentId: string) {
    const agent = await this.prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent) {
      throw new NotFoundException('智能体不存在');
    }

    const conversation = await this.prisma.conversation.create({
      data: {
        userId,
        agentId,
        agentName: agent.name,
        agentAvatar: agent.avatar,
        title: `与${agent.name}的对话`,
      },
    });

    return {
      id: conversation.id,
      agentId: conversation.agentId,
      agentName: conversation.agentName,
      agentAvatar: conversation.agentAvatar,
      isTrial: conversation.isTrial,
      trialMessagesRemaining: conversation.trialMessagesRemaining,
    };
  }

  async getConversationById(userId: string, id: string) {
    const conversation = await this.prisma.conversation.findUnique({ where: { id } });
    if (!conversation || conversation.userId !== userId) {
      throw new ForbiddenException('无权访问此对话');
    }

    return {
      id: conversation.id,
      userId: conversation.userId,
      agentId: conversation.agentId,
      agentName: conversation.agentName,
      agentAvatar: conversation.agentAvatar,
      title: conversation.title,
      lastMessage: conversation.lastMessage || '',
      lastMessageAt: conversation.lastMessageAt?.toISOString() || '',
      messageCount: conversation.messageCount,
      createdAt: conversation.createdAt.toISOString(),
      isTrial: conversation.isTrial,
      trialMessagesRemaining: conversation.trialMessagesRemaining,
    };
  }

  async deleteConversation(userId: string, id: string) {
    const conversation = await this.prisma.conversation.findUnique({ where: { id } });
    if (!conversation || conversation.userId !== userId) {
      throw new ForbiddenException('无权删除此对话');
    }

    await this.prisma.conversation.delete({ where: { id } });
    return { success: true };
  }
}
