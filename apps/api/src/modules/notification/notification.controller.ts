import { Controller, Get, Post, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  async getNotifications(
    @CurrentUser() user: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('type') type?: string,
    @Query('unread_only') unreadOnly?: string,
  ) {
    return this.notificationService.getNotifications(
      user.id,
      parseInt(page),
      parseInt(limit),
      type,
      unreadOnly === 'true',
    );
  }

  @Post(':id/read')
  async markAsRead(@CurrentUser() user: any, @Param('id') id: string) {
    return this.notificationService.markAsRead(user.id, id);
  }

  @Post('read-all')
  async markAllAsRead(@CurrentUser() user: any) {
    return this.notificationService.markAllAsRead(user.id);
  }
}
