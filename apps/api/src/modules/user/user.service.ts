import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      role: user.role || 'user',
      email: user.email || undefined,
      phone: user.phone || undefined,
      createdAt: user.createdAt.toISOString(),
      verificationStatus: user.verificationStatus || 'unverified',
      verificationPlatform: user.verificationPlatform || undefined,
      verificationUsername: user.verificationUsername || undefined,
      verificationFollowers: user.verificationFollowers || undefined,
      verificationProofUrl: user.verificationProofUrl || undefined,
      verificationSubmitTime: user.verificationSubmitTime?.toISOString(),
    };
  }

  async updateUser(userId: string, data: { name?: string; avatar?: string }) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
    };
  }

  async submitVerification(userId: string, data: { platform: string; username: string; followers: number; proofUrl: string }) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        verificationStatus: 'pending',
        verificationPlatform: data.platform,
        verificationUsername: data.username,
        verificationFollowers: data.followers,
        verificationProofUrl: data.proofUrl,
        verificationSubmitTime: new Date(),
      },
    });

    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      role: user.role || 'user',
      email: user.email || undefined,
      phone: user.phone || undefined,
      createdAt: user.createdAt.toISOString(),
      verificationStatus: user.verificationStatus || 'unverified',
      verificationPlatform: user.verificationPlatform || undefined,
      verificationUsername: user.verificationUsername || undefined,
      verificationFollowers: user.verificationFollowers || undefined,
      verificationProofUrl: user.verificationProofUrl || undefined,
      verificationSubmitTime: user.verificationSubmitTime?.toISOString(),
    };
  }

  async getAllUsers(page: number = 1, limit: number = 20, search?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: users.map(u => ({
        id: u.id,
        name: u.name,
        avatar: u.avatar,
        email: u.email,
        role: 'user',
        verificationStatus: u.verificationStatus || 'unverified',
        createdAt: u.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      email: user.email,
      role: 'user',
      verificationStatus: user.verificationStatus || 'unverified',
      verificationPlatform: user.verificationPlatform,
      verificationFollowers: user.verificationFollowers,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async updateUserRole(userId: string, role: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { verificationStatus: role === 'creator' ? 'verified' : 'unverified' },
    });
    return { id: user.id, role: user.verificationStatus };
  }

  async verifyUser(userId: string, status: 'verified' | 'rejected') {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { verificationStatus: status },
    });
    return { success: true, verificationStatus: user.verificationStatus };
  }

  // 以下函数已暂时禁用，因为数据库 schema 已更新
  // async getUserLevelInfo(userId: string) {
  //   const user = await this.prisma.user.findUnique({ where: { id: userId } });
  //   if (!user) {
  //     throw new NotFoundException('用户不存在');
  //   }
  //
  //   const levelConfig = await this.prisma.userLevelConfig.findFirst({
  //     where: { level: user.level },
  //   });
  //
  //   const achievements = await this.prisma.userAchievement.findMany({
  //     where: { userId },
  //     orderBy: { unlockedAt: 'desc' },
  //   });
  //
  //   return {
  //     level: user.level,
  //     exp: user.exp,
  //     expToNextLevel: user.expToNextLevel,
  //     progressPercentage: Math.round((user.exp / user.expToNextLevel) * 100),
  //     levelTitle: levelConfig?.title || `Lv.${user.level}`,
  //     levelBenefits: levelConfig?.benefits || [],
  //     achievements: achievements.map(a => ({
  //       id: a.id,
  //       achievementId: a.achievementId,
  //       title: a.title,
  //       description: a.description,
  //       iconUrl: a.iconUrl,
  //       unlockedAt: a.unlockedAt.toISOString(),
  //     })),
  //   };
  // }
  //
  // async addUserExp(userId: string, expAmount: number, source?: string) {
  //   const user = await this.prisma.user.findUnique({ where: { id: userId } });
  //   if (!user) {
  //     throw new NotFoundException('用户不存在');
  //   }
  //
  //   let newExp = user.exp + expAmount;
  //   let newLevel = user.level;
  //   let newExpToNext = user.expToNextLevel;
  //   let levelUps = 0;
  //
  //   while (newExp >= newExpToNext) {
  //     newExp -= newExpToNext;
  //     newLevel++;
  //     levelUps++;
  //     newExpToNext = Math.floor(100 * Math.pow(1.5, newLevel - 1));
  //   }
  //
  //   const updatedUser = await this.prisma.user.update({
  //     where: { id: userId },
  //     data: {
  //       exp: newExp,
  //       level: newLevel,
  //       expToNextLevel: newExpToNext,
  //     },
  //   });
  //
  //   if (levelUps > 0) {
  //     await this.notificationService.createNotification(
  //       userId,
  //       'level_up',
  //       '恭喜！等级提升',
  //       `您已升级到 Lv.${newLevel}！解锁更多精彩功能！`,
  //       '/profile',
  //     );
  //
  //     const achievement = await this.prisma.userAchievement.create({
  //       data: {
  //         userId,
  //         achievementId: `level_${newLevel}`,
  //         title: `达到 Lv.${newLevel}`,
  //         description: `恭喜您成功升级到 Lv.${newLevel}！`,
  //       },
  //     });
  //
  //     return {
  //       success: true,
  //       levelUp: true,
  //       newLevel,
  //       newExp,
  //       expToNextLevel: newExpToNext,
  //       achievement,
  //     };
  //   }
  //
  //   return {
  //     success: true,
  //     levelUp: false,
  //     newLevel,
  //     newExp,
  //     expToNextLevel: newExpToNext,
  //   };
  // }
  //
  // async getLevelConfigs() {
  //   const configs = await this.prisma.userLevelConfig.findMany({
  //     orderBy: { level: 'asc' },
  //   });
  //   return configs;
  // }
  //
  // async createLevelConfig(
  //   level: number,
  //   expRequired: number,
  //   title: string,
  //   benefits: string[],
  // ) {
  //   const config = await this.prisma.userLevelConfig.create({
  //     data: {
  //       level,
  //       expRequired,
  //       title,
  //       benefits,
  //     },
  //   });
  //   return config;
  // }
  //
  // async followUser(followerId: string, followingId: string) {
  //   if (followerId === followingId) {
  //     throw new BadRequestException('不能关注自己');
  //   }
  //
  //   const followingUser = await this.prisma.user.findUnique({ where: { id: followingId } });
  //   if (!followingUser) {
  //     throw new NotFoundException('要关注的用户不存在');
  //   }
  //
  //   const existingFollow = await this.prisma.follow.findFirst({
  //     where: { followerId, followingId },
  //   });
  //
  //   if (existingFollow) {
  //     throw new BadRequestException('已经关注了该用户');
  //   }
  //
  //   const follow = await this.prisma.follow.create({
  //     data: {
  //       followerId,
  //       followingId,
  //     },
  //   });
  //
  //   await this.notificationService.createNotification(
  //     followingId,
  //     'new_follower',
  //     '您有了新粉丝',
  //     `用户${followingUser.name}关注了您！`,
  //     '/profile',
  //   );
  //
  //   return { success: true, follow };
  // }
  //
  // async unfollowUser(followerId: string, followingId: string) {
  //   const follow = await this.prisma.follow.findFirst({
  //     where: { followerId, followingId },
  //   });
  //
  //   if (!follow) {
  //     throw new NotFoundException('未关注该用户');
  //   }
  //
  //   await this.prisma.follow.delete({ where: { id: follow.id } });
  //
  //   return { success: true };
  // }
  //
  // async getFollowers(userId: string, page: number = 1, limit: number = 20) {
  //   const where = { followingId: userId };
  //
  //   const [follows, total] = await Promise.all([
  //     this.prisma.follow.findMany({
  //       where,
  //       skip: (page - 1) * limit,
  //       take: limit,
  //       orderBy: { createdAt: 'desc' },
  //       include: { follower: true },
  //     }),
  //     this.prisma.follow.count({ where }),
  //   ]);
  //
  //   return {
  //     items: follows.map(f => ({
  //       id: f.follower.id,
  //       name: f.follower.name,
  //       avatar: f.follower.avatar,
  //       level: f.follower.level,
  //       followedAt: f.createdAt.toISOString(),
  //     })),
  //     total,
  //     page,
  //     pageSize: limit,
  //     totalPages: Math.ceil(total / limit),
  //   };
  // }
  //
  // async getFollowing(userId: string, page: number = 1, limit: number = 20) {
  //   const where = { followerId: userId };
  //
  //   const [follows, total] = await Promise.all([
  //     this.prisma.follow.findMany({
  //       where,
  //       skip: (page - 1) * limit,
  //       take: limit,
  //       orderBy: { createdAt: 'desc' },
  //       include: { following: true },
  //     }),
  //     this.prisma.follow.count({ where }),
  //   ]);
  //
  //   return {
  //     items: follows.map(f => ({
  //       id: f.following.id,
  //       name: f.following.name,
  //       avatar: f.following.avatar,
  //       level: f.following.level,
  //       followedAt: f.createdAt.toISOString(),
  //     })),
  //     total,
  //     page,
  //     pageSize: limit,
  //     totalPages: Math.ceil(total / limit),
  //   };
  // }
  //
  // async checkFollowStatus(followerId: string, followingId: string) {
  //   const follow = await this.prisma.follow.findFirst({
  //     where: { followerId, followingId },
  //   });
  //
  //   const [followersCount, followingCount] = await Promise.all([
  //     this.prisma.follow.count({ where: { followingId } }),
  //     this.prisma.follow.count({ where: { followerId } }),
  //   ]);
  //
  //   return {
  //     isFollowing: !!follow,
  //     followersCount,
  //     followingCount,
  //   };
  // }
}
