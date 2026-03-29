import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateWallet(userId: string) {
    let wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: { userId, balance: 0 },
      });
    }

    return {
      id: wallet.id,
      userId: wallet.userId,
      balance: wallet.balance,
      createdAt: wallet.createdAt.toISOString(),
      updatedAt: wallet.updatedAt.toISOString(),
    };
  }

  async getWallet(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('钱包不存在');
    }

    return {
      id: wallet.id,
      userId: wallet.userId,
      balance: wallet.balance,
      createdAt: wallet.createdAt.toISOString(),
      updatedAt: wallet.updatedAt.toISOString(),
    };
  }

  async getWalletRecords(
    userId: string,
    page: number = 1,
    limit: number = 20
  ) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('钱包不存在');
    }

    const [records, total] = await Promise.all([
      this.prisma.walletRecord.findMany({
        where: { walletId: wallet.id },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.walletRecord.count({
        where: { walletId: wallet.id },
      }),
    ]);

    return {
      items: records.map(record => ({
        id: record.id,
        amount: record.amount,
        type: record.type,
        description: record.description,
        createdAt: record.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async addBalance(userId: string, amount: number, type: string, description?: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('钱包不存在');
    }

    const updatedWallet = await this.prisma.wallet.update({
      where: { userId },
      data: { balance: wallet.balance + amount },
    });

    await this.prisma.walletRecord.create({
      data: {
        walletId: wallet.id,
        amount,
        type,
        description,
      },
    });

    return {
      id: updatedWallet.id,
      userId: updatedWallet.userId,
      balance: updatedWallet.balance,
      createdAt: updatedWallet.createdAt.toISOString(),
      updatedAt: updatedWallet.updatedAt.toISOString(),
    };
  }
}
