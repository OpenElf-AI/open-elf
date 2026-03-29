import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CapabilityService {
  constructor(private prisma: PrismaService) {}

  async getPackages(page: number = 1, limit: number = 20, category?: string, search?: string) {
    const where: any = { isListed: true };
    if (category) where.category = category;
    if (search) where.OR = [{ name: { contains: search } }, { description: { contains: search } }];

    const [packages, total] = await Promise.all([
      this.prisma.capabilityPackage.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.capabilityPackage.count({ where }),
    ]);

    return {
      items: packages.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        prompt: pkg.prompt,
        capabilities: pkg.capabilities,
        category: pkg.category,
        creatorId: pkg.creatorId,
        creatorName: pkg.creatorName,
        creatorAvatar: pkg.creatorAvatar,
        price: pkg.price,
        totalSupply: pkg.totalSupply,
        soldCount: pkg.soldCount,
        isListed: pkg.isListed,
        createdAt: pkg.createdAt.toISOString(),
        updatedAt: pkg.updatedAt.toISOString(),
      })),
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPackageById(id: string) {
    const pkg = await this.prisma.capabilityPackage.findUnique({ where: { id } });
    if (!pkg) {
      throw new NotFoundException('能力包不存在');
    }

    return {
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      prompt: pkg.prompt,
      capabilities: pkg.capabilities,
      category: pkg.category,
      creatorId: pkg.creatorId,
      creatorName: pkg.creatorName,
      creatorAvatar: pkg.creatorAvatar,
      price: pkg.price,
      totalSupply: pkg.totalSupply,
      soldCount: pkg.soldCount,
      isListed: pkg.isListed,
      createdAt: pkg.createdAt.toISOString(),
      updatedAt: pkg.updatedAt.toISOString(),
    };
  }

  async getMyPackages(userId: string) {
    const userPackages = await this.prisma.userCapabilityPackage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      items: userPackages.map(up => ({
        id: up.id,
        packageId: up.packageId,
        userId: up.userId,
        name: up.name,
        description: up.description,
        prompt: up.prompt,
        capabilities: up.capabilities,
        category: up.category,
        isInstalled: up.isInstalled,
        installedAgentId: up.installedAgentId || undefined,
        originalPackageId: up.originalPackageId,
        canTransfer: up.canTransfer,
        purchasedAt: up.purchasedAt.toISOString(),
        createdAt: up.createdAt.toISOString(),
        updatedAt: up.updatedAt.toISOString(),
      })),
    };
  }

  async purchasePackage(userId: string, packageId: string) {
    const pkg = await this.prisma.capabilityPackage.findUnique({ where: { id: packageId } });
    if (!pkg) {
      throw new NotFoundException('能力包不存在');
    }

    const userPackage = await this.prisma.userCapabilityPackage.create({
      data: {
        packageId,
        userId,
        name: pkg.name,
        description: pkg.description,
        prompt: pkg.prompt,
        capabilities: pkg.capabilities,
        category: pkg.category,
        originalPackageId: packageId,
      },
    });

    await this.prisma.capabilityPackage.update({
      where: { id: packageId },
      data: { soldCount: { increment: 1 } },
    });

    return {
      success: true,
      user_package: {
        id: userPackage.id,
        packageId: userPackage.packageId,
        name: userPackage.name,
        isInstalled: userPackage.isInstalled,
      },
    };
  }

  async installPackage(userId: string, userPackageId: string, agentId: string) {
    const userPackage = await this.prisma.userCapabilityPackage.findUnique({
      where: { id: userPackageId },
    });
    if (!userPackage || userPackage.userId !== userId) {
      throw new ForbiddenException('无权操作此能力包');
    }

    const updated = await this.prisma.userCapabilityPackage.update({
      where: { id: userPackageId },
      data: {
        isInstalled: true,
        installedAgentId: agentId,
      },
    });

    return {
      success: true,
      isInstalled: updated.isInstalled,
      installed_agent_id: updated.installedAgentId,
    };
  }

  async uninstallPackage(userId: string, userPackageId: string) {
    const userPackage = await this.prisma.userCapabilityPackage.findUnique({
      where: { id: userPackageId },
    });
    if (!userPackage || userPackage.userId !== userId) {
      throw new ForbiddenException('无权操作此能力包');
    }

    const updated = await this.prisma.userCapabilityPackage.update({
      where: { id: userPackageId },
      data: {
        isInstalled: false,
        installedAgentId: null,
      },
    });

    return {
      success: true,
      isInstalled: updated.isInstalled,
    };
  }
}
