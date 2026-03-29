import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AgentReviewService {
  constructor(private prisma: PrismaService) {}

  async createReview(
    userId: string,
    agentId: string,
    rating: number,
    comment?: string
  ) {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('评分必须在1到5之间');
    }

    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      throw new NotFoundException('智能体不存在');
    }

    const existingReview = await this.prisma.agentReview.findFirst({
      where: { agentId, userId },
    });

    if (existingReview) {
      throw new BadRequestException('您已经评价过该智能体');
    }

    const review = await this.prisma.agentReview.create({
      data: {
        agentId,
        userId,
        rating,
        comment,
      },
    });

    return {
      id: review.id,
      agentId: review.agentId,
      userId: review.userId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
    };
  }

  async updateReview(
    userId: string,
    reviewId: string,
    rating?: number,
    comment?: string
  ) {
    const review = await this.prisma.agentReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('评价不存在');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('无权修改此评价');
    }

    const updateData: any = {};
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        throw new BadRequestException('评分必须在1到5之间');
      }
      updateData.rating = rating;
    }
    if (comment !== undefined) {
      updateData.comment = comment;
    }

    const updatedReview = await this.prisma.agentReview.update({
      where: { id: reviewId },
      data: updateData,
    });

    return {
      id: updatedReview.id,
      agentId: updatedReview.agentId,
      userId: updatedReview.userId,
      rating: updatedReview.rating,
      comment: updatedReview.comment,
      createdAt: updatedReview.createdAt.toISOString(),
      updatedAt: updatedReview.updatedAt.toISOString(),
    };
  }

  async deleteReview(userId: string, reviewId: string) {
    const review = await this.prisma.agentReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('评价不存在');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('无权删除此评价');
    }

    await this.prisma.agentReview.delete({
      where: { id: reviewId },
    });

    return { success: true };
  }

  async getAgentReviews(agentId: string, page: number = 1, limit: number = 20) {
    const [reviews, total] = await Promise.all([
      this.prisma.agentReview.findMany({
        where: { agentId },
        include: { user: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.agentReview.count({ where: { agentId } }),
    ]);

    const avgRating = await this.prisma.agentReview.aggregate({
      where: { agentId },
      _avg: { rating: true },
    });

    return {
      items: reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        user: {
          id: review.user.id,
          name: review.user.name,
          avatar: review.user.avatar,
        },
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
      })),
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
      averageRating: avgRating._avg.rating || 0,
    };
  }

  async getUserReviews(userId: string, page: number = 1, limit: number = 20) {
    const [reviews, total] = await Promise.all([
      this.prisma.agentReview.findMany({
        where: { userId },
        include: { user: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.agentReview.count({ where: { userId } }),
    ]);

    return {
      items: reviews.map(review => ({
        id: review.id,
        agentId: review.agentId,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
      })),
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getMyReview(userId: string, agentId: string) {
    const review = await this.prisma.agentReview.findFirst({
      where: { agentId, userId },
    });

    if (!review) {
      return null;
    }

    return {
      id: review.id,
      agentId: review.agentId,
      userId: review.userId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
    };
  }
}
