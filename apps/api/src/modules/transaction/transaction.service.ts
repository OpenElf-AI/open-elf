import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  async getTransactions(userId: string, page: number = 1, limit: number = 20) {
    const where = { OR: [{ buyerId: userId }, { sellerId: userId }] };
    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      items: transactions.map(tx => ({
        id: tx.id,
        type: tx.type as 'purchase' | 'service_fee',
        assetType: tx.assetType as 'agent' | 'capability',
        assetId: tx.assetId,
        assetName: tx.assetName,
        buyerId: tx.buyerId,
        sellerId: tx.sellerId,
        amount: tx.amount,
        serviceFee: tx.serviceFee,
        sellerReceived: tx.sellerReceived,
        createdAt: tx.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
