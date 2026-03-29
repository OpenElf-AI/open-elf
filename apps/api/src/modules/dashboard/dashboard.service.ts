import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [totalUsers, totalAgents, totalConversations, totalTransactions, totalCreators, todayOrders, todayRevenue, totalRevenue] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.agent.count(),
      this.prisma.conversation.count(),
      this.prisma.transaction.count(),
      this.prisma.creatorUser.count(),
      this.prisma.order.count({ where: { createTime: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
      this.prisma.order.aggregate({ where: { createTime: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }, status: 'completed' }, _sum: { totalAmount: true } }),
      this.prisma.order.aggregate({ where: { status: 'completed' }, _sum: { totalAmount: true } }),
    ]);

    const recentUsers = await this.prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    const recentAgents = await this.prisma.agent.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    const pendingVerifications = await this.prisma.creatorAuth.findMany({
      where: { status: 'pending' },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });

    return {
      stats: {
        totalUsers,
        totalAgents,
        totalConversations,
        totalTransactions,
        totalCreators,
        todayOrders,
        todayRevenue: todayRevenue._sum.totalAmount || 0,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
      },
      recentUsers: recentUsers.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        createdAt: u.createdAt.toISOString(),
      })),
      recentAgents: recentAgents.map(a => ({
        id: a.id,
        name: a.name,
        creatorName: a.creatorName,
        createdAt: a.createdAt.toISOString(),
      })),
      pendingVerifications: pendingVerifications.map(auth => ({
        id: auth.id,
        name: auth.user?.name || '',
        platform: auth.platform,
        followers: auth.fansCount,
        submittedAt: auth.createdAt.toISOString(),
      })),
    };
  }

  async getUserGrowth(days: number = 7) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const users = await this.prisma.user.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
      select: { createdAt: true },
    });

    const growthData = [];
    for (let i = 0; i < days; i++) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - (days - i - 1));
      const dateStr = `${currentDate.getMonth() + 1}/${currentDate.getDate()}`;
      
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      const newUsers = users.filter(u => u.createdAt >= dayStart && u.createdAt <= dayEnd).length;
      
      growthData.push({
        date: dateStr,
        users: newUsers,
        new: newUsers,
      });
    }

    return growthData;
  }

  async getOrderTrend(days: number = 7) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await this.prisma.order.findMany({
      where: { createTime: { gte: startDate, lte: endDate }, status: 'completed' },
      select: { createTime: true, totalAmount: true },
    });

    const trendData = [];
    for (let i = 0; i < days; i++) {
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - (days - i - 1));
      const dateStr = `${currentDate.getMonth() + 1}/${currentDate.getDate()}`;
      
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayOrders = orders.filter(o => o.createTime >= dayStart && o.createTime <= dayEnd);
      const orderCount = dayOrders.length;
      const revenue = dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      
      trendData.push({
        date: dateStr,
        orders: orderCount,
        revenue: Math.round(revenue),
      });
    }

    return trendData;
  }

  async getAgentSales(top: number = 5) {
    const agents = await this.prisma.agent.findMany({
      take: top,
      orderBy: { soldCount: 'desc' },
      select: { name: true, soldCount: true },
    });

    return agents.map(agent => ({
      name: agent.name,
      sales: agent.soldCount,
      revenue: Math.round(agent.soldCount * 9.9), // 假设平均价格为9.9
    }));
  }
}
