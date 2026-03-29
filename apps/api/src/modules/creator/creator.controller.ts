import { Controller, Post, Get, Body, Query, UseGuards, Request, UseInterceptors, SetMetadata } from '@nestjs/common';
import { CreatorService } from './creator.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';

@Controller('creator')
@UseInterceptors(AuditInterceptor)
export class CreatorController {
  constructor(private creatorService: CreatorService) {}

  @Post('apply')
  @SetMetadata('module', 'creator')
  @SetMetadata('action', 'apply')
  // @UseGuards(JwtAuthGuard)
  async apply(
    @Body() body: {
      platform: string;
      accountName: string;
      fansCount: number;
      proofUrl: string;
      userId?: string;
    },
    @Request() req: any,
  ) {
    const userId = body.userId || req.user?.sub || req.user?.id;
    if (!userId) {
      return { success: false, message: '请先登录' };
    }

    return this.creatorService.apply(
      userId,
      body.platform,
      body.accountName,
      body.fansCount,
      body.proofUrl,
    );
  }

  @Get('status')
  @SetMetadata('module', 'creator')
  @SetMetadata('action', 'status')
  async getStatus(@Query('userId') userId: string) {
    return this.creatorService.getStatus(userId);
  }

  @Get('info')
  @SetMetadata('module', 'creator')
  @SetMetadata('action', 'info')
  async getInfo(@Query('userId') userId: string) {
    return this.creatorService.getInfo(userId);
  }

  @Post('audit')
  @SetMetadata('module', 'creator')
  @SetMetadata('action', 'audit')
  // @UseGuards(JwtAuthGuard)
  async audit(
    @Body() body: { id: string; status: string; rejectReason?: string },
    @Request() req: any,
  ) {
    const auditorId = req.user?.sub || req.user?.id || 'admin';
    return this.creatorService.audit(body.id, body.status, body.rejectReason || '', auditorId);
  }

  @Get('list')
  @SetMetadata('module', 'creator')
  @SetMetadata('action', 'list')
  // @UseGuards(JwtAuthGuard)
  async getList(@Query('status') status: string) {
    return this.creatorService.getList(status);
  }
}
