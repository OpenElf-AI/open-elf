import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async createNotification(
    userId: string,
    type: string,
    title: string,
    content: string,
    link?: string,
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        type,
        title,
        content,
        link,
      },
    });

    await this.prisma.userNotification.create({
      data: {
        userId,
        notificationId: notification.id,
      },
    });

    return notification;
  }

  async createNotificationForUsers(
    userIds: string[],
    type: string,
    title: string,
    content: string,
    link?: string,
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        type,
        title,
        content,
        link,
      },
    });

    await this.prisma.userNotification.createMany({
      data: userIds.map(userId => ({
        userId,
        notificationId: notification.id,
      })),
    });

    return notification;
  }

  async getNotifications(userId: string, page: number = 1, limit: number = 20, type?: string, unreadOnly?: boolean) {
    const where: any = { userId };
    if (unreadOnly) where.isRead = false;

    const [userNotifications, total, unreadCount] = await Promise.all([
      this.prisma.userNotification.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.userNotification.count({ where }),
      this.prisma.userNotification.count({ where: { userId, isRead: false } }),
    ]);

    const notifications = await this.prisma.notification.findMany({
      where: { id: { in: userNotifications.map(un => un.notificationId) } },
    });
    const notificationMap = new Map(notifications.map(n => [n.id, n]));

    return {
      items: userNotifications.map((un: any) => {
        const notification = notificationMap.get(un.notificationId);
        return {
          id: un.id,
          userId: un.userId,
          type: notification?.type || 'system',
          title: notification?.title || '',
          content: notification?.content || '',
          isRead: un.isRead,
          createdAt: notification?.createdAt?.toISOString() || '',
          link: notification?.link || undefined,
        };
      }),
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
      unread_count: unreadCount,
    };
  }

  async markAsRead(userId: string, id: string) {
    await this.prisma.userNotification.updateMany({
      where: { id, userId },
      data: { isRead: true, readAt: new Date() },
    });
    return { success: true };
  }

  async markAllAsRead(userId: string) {
    await this.prisma.userNotification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { success: true };
  }
}
