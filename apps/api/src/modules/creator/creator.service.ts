import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class CreatorService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async apply(
    userId: string,
    platform: string,
    accountName: string,
    fansCount: number,
    proofUrl: string,
  ) {
    if (fansCount < 10000) {
      throw new BadRequestException('粉丝数必须大于等于10000');
    }

    const existing = await this.prisma.creatorAuth.findFirst({
      where: {
        userId,
        status: 'pending',
      },
    });

    if (existing) {
      throw new BadRequestException('您有待审核的申请，请勿重复提交');
    }

    const auth = await this.prisma.creatorAuth.create({
      data: {
        userId,
        platform,
        accountName,
        fansCount,
        proofUrl,
        status: 'pending',
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        verificationStatus: 'pending',
        verificationPlatform: platform,
        verificationUsername: accountName,
        verificationFollowers: fansCount,
        verificationProofUrl: proofUrl,
        verificationSubmitTime: new Date(),
      },
    });

    await this.notificationService.createNotification(
      userId,
      'verification',
      '创作者认证申请已提交',
      `您的${platform}账号${accountName}认证申请已提交，我们将尽快审核，请耐心等待。`,
      '/verification',
    );

    return {
      success: true,
      message: '提交成功',
      data: auth,
    };
  }

  async getStatus(userId: string) {
    const auth = await this.prisma.creatorAuth.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!auth) {
      return {
        status: 'none',
        message: '暂无认证申请',
      };
    }

    return {
      status: auth.status,
      rejectReason: auth.rejectReason,
      auditTime: auth.auditTime,
    };
  }

  async getInfo(userId: string) {
    const auth = await this.prisma.creatorAuth.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!auth) {
      return null;
    }

    return auth;
  }

  async audit(authId: string, status: string, rejectReason: string, auditorId: string) {
    if (status === 'reject' && !rejectReason) {
      throw new BadRequestException('驳回申请必须填写原因');
    }

    const auth = await this.prisma.creatorAuth.findUnique({
      where: { id: authId },
    });

    if (!auth) {
      throw new BadRequestException('申请不存在');
    }

    if (status !== 'pending' && status !== 'pass' && status !== 'reject') {
      throw new BadRequestException('无效的审核状态');
    }

    const updated = await this.prisma.creatorAuth.update({
      where: { id: authId },
      data: {
        status,
        rejectReason: status === 'reject' ? rejectReason : null,
        auditTime: new Date(),
        auditorId,
      },
    });

    if (status === 'pass') {
      const existingCreator = await this.prisma.creatorUser.findUnique({
        where: { userId: auth.userId },
      });

      if (!existingCreator) {
        await this.prisma.creatorUser.create({
          data: {
            userId: auth.userId,
            isCreator: true,
          },
        });
      }

      await this.prisma.user.update({
        where: { id: auth.userId },
        data: {
          verificationStatus: 'verified',
        },
      });

      await this.notificationService.createNotification(
        auth.userId,
        'verification',
        '恭喜！创作者认证已通过',
        `您的${auth.platform}账号${auth.accountName}认证申请已通过审核，现在可以开始创作和发布智能体了！`,
        '/creator-center',
      );
    } else if (status === 'reject') {
      await this.prisma.user.update({
        where: { id: auth.userId },
        data: {
          verificationStatus: 'rejected',
        },
      });

      await this.notificationService.createNotification(
        auth.userId,
        'verification',
        '创作者认证申请未通过',
        `您的${auth.platform}账号${auth.accountName}认证申请未通过审核。原因：${rejectReason}。您可以修改后重新提交申请。`,
        '/verification',
      );
    }

    return {
      success: true,
      message: '审核成功',
      data: updated,
    };
  }

  async getList(status?: string) {
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    const list = await this.prisma.creatorAuth.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return list;
  }
}
