import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface CreateOrderInput {
  outTradeNo: string;
  userId: string;
  totalAmount: number;
  subject: string;
  assetType?: string;
  assetId?: string;
  assetName?: string;
  sellerId?: string;
  payType?: string;
}

export interface OrderStatus {
  id?: string;
  outTradeNo: string;
  userId: string;
  status: 'pending' | 'paid' | 'failed' | 'timeout';
  totalAmount: number;
  subject: string;
  createTime: Date;
  payTime?: Date;
  payType?: string;
  assetType?: string;
  assetId?: string;
  assetName?: string;
  sellerId?: string;
}

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async createOrder(input: CreateOrderInput): Promise<OrderStatus> {
    const order = await this.prisma.order.create({
      data: {
        outTradeNo: input.outTradeNo,
        userId: input.userId,
        totalAmount: input.totalAmount,
        subject: input.subject,
        status: 'pending',
        assetType: input.assetType,
        assetId: input.assetId,
        assetName: input.assetName,
        sellerId: input.sellerId,
        payType: input.payType || 'alipay',
      },
    });

    return this.toOrderStatus(order);
  }

  async getOrder(outTradeNo: string): Promise<OrderStatus | null> {
    const order = await this.prisma.order.findUnique({
      where: { outTradeNo },
    });

    if (!order) {
      return null;
    }

    return this.toOrderStatus(order);
  }

  async getOrderList(userId: string): Promise<{ items: OrderStatus[] }> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      orderBy: { createTime: 'desc' },
    });

    return {
      items: orders.map(order => this.toOrderStatus(order)),
    };
  }

  async getAdminOrderList(
    params: {
      page?: number;
      limit?: number;
      status?: string;
      userId?: string;
    } = {}
  ): Promise<{
    items: OrderStatus[];
    page: number;
    limit: number;
    total: number;
  }> {
    const { page = 1, limit = 20, status, userId } = params;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        orderBy: { createTime: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      items: orders.map(order => this.toOrderStatus(order)),
      page,
      limit,
      total,
    };
  }

  async updateOrderStatus(
    outTradeNo: string,
    status: 'pending' | 'paid' | 'failed' | 'timeout'
  ): Promise<OrderStatus | null> {
    const updateData: any = { status };

    if (status === 'paid') {
      updateData.payTime = new Date();
    }

    const order = await this.prisma.order.update({
      where: { outTradeNo },
      data: updateData,
    });

    return this.toOrderStatus(order);
  }

  private toOrderStatus(order: any): OrderStatus {
    return {
      id: order.id,
      outTradeNo: order.outTradeNo,
      userId: order.userId,
      status: order.status as any,
      totalAmount: order.totalAmount,
      subject: order.subject,
      createTime: order.createTime,
      payTime: order.payTime,
      payType: order.payType,
      assetType: order.assetType,
      assetId: order.assetId,
      assetName: order.assetName,
      sellerId: order.sellerId,
    };
  }
}
