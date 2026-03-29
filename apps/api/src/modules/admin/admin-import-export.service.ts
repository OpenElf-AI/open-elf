import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CryptoService } from '../../common/crypto/crypto.service';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';

@Injectable()
export class AdminImportExportService {
  constructor(
    @Inject(PrismaService) private prismaService: PrismaService,
    @Inject(CryptoService) private cryptoService: CryptoService,
  ) {}

  /**
   * 导出用户数据为CSV
   * @returns CSV文件路径
   */
  async exportUsersToCsv(): Promise<string> {
    const users = await this.prismaService.user.findMany({
      include: {
        wallet: true,
      },
    });

    const csvWriter = createObjectCsvWriter({
      path: path.join(__dirname, '..', '..', '..', 'exports', `users_${Date.now()}.csv`),
      header: [
        { id: 'id', title: 'ID' },
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'phone', title: 'Phone' },
        { id: 'role', title: 'Role' },
        { id: 'verificationStatus', title: 'Verification Status' },
        { id: 'balance', title: 'Balance' },
        { id: 'createdAt', title: 'Created At' },
      ],
    });

    const records = users.map(user => ({
      id: user.id,
      name: user.name || '',
      email: user.email ? this.cryptoService.decrypt(user.email) : '',
      phone: user.phone ? this.cryptoService.decrypt(user.phone) : '',
      role: user.role || 'user',
      verificationStatus: user.verificationStatus || 'unverified',
      balance: user.wallet?.balance || 0,
      createdAt: user.createdAt.toISOString(),
    }));

    await csvWriter.writeRecords(records);
    return csvWriter.getPath();
  }

  /**
   * 导出代理数据为CSV
   * @returns CSV文件路径
   */
  async exportAgentsToCsv(): Promise<string> {
    const agents = await this.prismaService.agent.findMany();

    const csvWriter = createObjectCsvWriter({
      path: path.join(__dirname, '..', '..', '..', 'exports', `agents_${Date.now()}.csv`),
      header: [
        { id: 'id', title: 'ID' },
        { id: 'name', title: 'Name' },
        { id: 'description', title: 'Description' },
        { id: 'creatorId', title: 'Creator ID' },
        { id: 'creatorName', title: 'Creator Name' },
        { id: 'price', title: 'Price' },
        { id: 'totalSupply', title: 'Total Supply' },
        { id: 'soldCount', title: 'Sold Count' },
        { id: 'isFeatured', title: 'Is Featured' },
        { id: 'isListed', title: 'Is Listed' },
        { id: 'conversationCount', title: 'Conversation Count' },
        { id: 'likes', title: 'Likes' },
        { id: 'level', title: 'Level' },
        { id: 'createdAt', title: 'Created At' },
      ],
    });

    const records = agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      creatorId: agent.creatorId,
      creatorName: agent.creatorName,
      price: agent.price,
      totalSupply: agent.totalSupply,
      soldCount: agent.soldCount,
      isFeatured: agent.isFeatured,
      isListed: agent.isListed,
      conversationCount: agent.conversationCount,
      likes: agent.likes,
      level: agent.level,
      createdAt: agent.createdAt.toISOString(),
    }));

    await csvWriter.writeRecords(records);
    return csvWriter.getPath();
  }

  /**
   * 导出订单数据为CSV
   * @returns CSV文件路径
   */
  async exportOrdersToCsv(): Promise<string> {
    const orders = await this.prismaService.order.findMany({
      include: {
        user: true,
      },
    });

    const csvWriter = createObjectCsvWriter({
      path: path.join(__dirname, '..', '..', '..', 'exports', `orders_${Date.now()}.csv`),
      header: [
        { id: 'id', title: 'ID' },
        { id: 'outTradeNo', title: 'Out Trade No' },
        { id: 'userId', title: 'User ID' },
        { id: 'userPhone', title: 'User Phone' },
        { id: 'totalAmount', title: 'Total Amount' },
        { id: 'subject', title: 'Subject' },
        { id: 'status', title: 'Status' },
        { id: 'payType', title: 'Pay Type' },
        { id: 'assetType', title: 'Asset Type' },
        { id: 'assetId', title: 'Asset ID' },
        { id: 'assetName', title: 'Asset Name' },
        { id: 'createTime', title: 'Create Time' },
        { id: 'payTime', title: 'Pay Time' },
      ],
    });

    const records = orders.map(order => ({
      id: order.id,
      outTradeNo: order.outTradeNo,
      userId: order.userId,
      userPhone: order.user.phone ? this.cryptoService.decrypt(order.user.phone) : '',
      totalAmount: order.totalAmount,
      subject: order.subject,
      status: order.status,
      payType: order.payType || '',
      assetType: order.assetType || '',
      assetId: order.assetId || '',
      assetName: order.assetName || '',
      createTime: order.createTime.toISOString(),
      payTime: order.payTime?.toISOString() || '',
    }));

    await csvWriter.writeRecords(records);
    return csvWriter.getPath();
  }

  /**
   * 导入用户数据从CSV
   * @param file_path CSV文件路径
   * @returns 导入结果
   */
  async importUsersFromCsv(file_path: string): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = { success: 0, failed: 0, errors: [] };

    return new Promise((resolve, reject) => {
      const users: any[] = [];

      fs.createReadStream(file_path)
        .pipe(csv())
        .on('data', (data) => users.push(data))
        .on('end', async () => {
          for (const userData of users) {
            try {
              // 加密敏感数据
              const encryptedEmail = userData.email ? this.cryptoService.encrypt(userData.email) : null;
              const encryptedPhone = userData.phone ? this.cryptoService.encrypt(userData.phone) : null;

              await this.prismaService.user.create({
                data: {
                  id: userData.id,
                  name: userData.name,
                  email: encryptedEmail,
                  phone: encryptedPhone,
                  role: userData.role || 'user',
                  verificationStatus: userData.verificationStatus || 'unverified',
                },
              });

              // 创建钱包
              await this.prismaService.wallet.create({
                data: {
                  userId: userData.id,
                  balance: parseFloat(userData.balance) || 0,
                },
              });

              results.success++;
            } catch (error) {
              results.failed++;
              results.errors.push(`Error importing user ${userData.id}: ${error.message}`);
            }
          }
          resolve(results);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  /**
   * 导入代理数据从CSV
   * @param file_path CSV文件路径
   * @returns 导入结果
   */
  async importAgentsFromCsv(file_path: string): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = { success: 0, failed: 0, errors: [] };

    return new Promise((resolve, reject) => {
      const agents: any[] = [];

      fs.createReadStream(file_path)
        .pipe(csv())
        .on('data', (data) => agents.push(data))
        .on('end', async () => {
          for (const agentData of agents) {
            try {
              await this.prismaService.agent.create({
                data: {
                  id: agentData.id,
                  name: agentData.name,
                  description: agentData.description,
                  avatar: agentData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${agentData.id}`,
                  prompt: agentData.prompt || '',
                  category: agentData.category || 'general',
                  creatorId: agentData.creatorId,
                  creatorName: agentData.creatorName,
                  creatorAvatar: agentData.creatorAvatar || '',
                  price: parseFloat(agentData.price) || 0,
                  totalSupply: parseInt(agentData.totalSupply) || 100,
                  soldCount: parseInt(agentData.soldCount) || 0,
                  isFeatured: agentData.isFeatured === 'true',
                  isListed: agentData.isListed === 'true',
                  conversationCount: parseInt(agentData.conversationCount) || 0,
                  likes: parseInt(agentData.likes) || 0,
                  level: parseInt(agentData.level) || 1,
                  exp: parseInt(agentData.exp) || 0,
                  expToNextLevel: parseInt(agentData.expToNextLevel) || 100,
                  fans: parseInt(agentData.fans) || 0,
                },
              });

              results.success++;
            } catch (error) {
              results.failed++;
              results.errors.push(`Error importing agent ${agentData.id}: ${error.message}`);
            }
          }
          resolve(results);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  /**
   * 创建导出目录
   */
  ensureExportDirectory(): void {
    const exportDir = path.join(__dirname, '..', '..', '..', 'exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
  }
}
