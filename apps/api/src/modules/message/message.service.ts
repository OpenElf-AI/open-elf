import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async getMessages(userId: string, conversationId: string, page: number = 1, limit: number = 50) {
    const conversation = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation || conversation.userId !== userId) {
      throw new ForbiddenException('无权访问此对话');
    }

    const where = { conversationId };
    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { timestamp: 'asc' },
      }),
      this.prisma.message.count({ where }),
    ]);

    return {
      items: messages.map(msg => ({
        id: msg.id,
        conversationId: msg.conversationId,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
        isError: msg.isError,
      })),
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async sendMessage(userId: string, conversationId: string, content: string) {
    const conversation = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation || conversation.userId !== userId) {
      throw new ForbiddenException('无权访问此对话');
    }

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        role: 'user',
        content,
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: content,
        lastMessageAt: new Date(),
        messageCount: { increment: 1 },
      },
    });

    return {
      id: message.id,
      conversationId: message.conversationId,
      role: message.role as 'user' | 'assistant',
      content: message.content,
      timestamp: message.timestamp.toISOString(),
      isError: message.isError,
    };
  }

  async generateReply(userId: string, conversationId: string) {
    const conversation = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation || conversation.userId !== userId) {
      throw new ForbiddenException('无权访问此对话');
    }

    const replyContent = '这是一个模拟的AI回复。在实际项目中，这里会调用真实的LLM接口。';

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        role: 'assistant',
        content: replyContent,
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: replyContent,
        lastMessageAt: new Date(),
        messageCount: { increment: 1 },
      },
    });

    return {
      id: message.id,
      conversationId: message.conversationId,
      role: message.role as 'user' | 'assistant',
      content: message.content,
      timestamp: message.timestamp.toISOString(),
      isError: message.isError,
    };
  }
}
