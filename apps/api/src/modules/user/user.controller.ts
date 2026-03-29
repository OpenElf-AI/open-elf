import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';

@Controller('users')
@UseInterceptors(TransformInterceptor)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: any) {
    return this.userService.getCurrentUser(user.id);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(@CurrentUser() user: any, @Body() data: { name?: string; avatar?: string }) {
    return this.userService.updateUser(user.id, data);
  }

  @Post('verification')
  @UseGuards(JwtAuthGuard)
  async submitVerification(
    @CurrentUser() user: any,
    @Body() data: { platform: string; username: string; followers: number; proofUrl: string }
  ) {
    return this.userService.submitVerification(user.id, data);
  }

  @Get('admin/all')
  // @UseGuards(JwtAuthGuard)
  async getAllUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('search') search?: string,
  ) {
    return this.userService.getAllUsers(parseInt(page), parseInt(limit), search);
  }

  @Get('admin/:id')
  // @UseGuards(JwtAuthGuard)
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Post('admin/:id/verify')
  // @UseGuards(JwtAuthGuard)
  async verifyUser(@Param('id') id: string, @Body() body: { status: 'verified' | 'rejected' }) {
    return this.userService.verifyUser(id, body.status);
  }

  // 以下端点已暂时禁用，因为数据库 schema 已更新
  // @Get('level')
  // @UseGuards(JwtAuthGuard)
  // async getUserLevel(@CurrentUser() user: any) {
  //   return this.userService.getUserLevelInfo(user.id);
  // }
  //
  // @Post('add-exp')
  // @UseGuards(JwtAuthGuard)
  // async addUserExp(
  //   @CurrentUser() user: any,
  //   @Body() body: { exp_amount: number; source?: string },
  // ) {
  //   return this.userService.addUserExp(user.id, body.exp_amount, body.source);
  // }
  //
  // @Get('level-configs')
  // async getLevelConfigs() {
  //   return this.userService.getLevelConfigs();
  // }
  //
  // @Post('admin/level-config')
  // @UseGuards(JwtAuthGuard)
  // async createLevelConfig(
  //   @Body() body: { level: number; expRequired: number; title: string; benefits: string[] },
  // ) {
  //   return this.userService.createLevelConfig(
  //     body.level,
  //     body.expRequired,
  //     body.title,
  //     body.benefits,
  //   );
  // }
  //
  // @Post(':id/follow')
  // @UseGuards(JwtAuthGuard)
  // async followUser(@CurrentUser() user: any, @Param('id') followingId: string) {
  //   return this.userService.followUser(user.id, followingId);
  // }
  //
  // @Post(':id/unfollow')
  // @UseGuards(JwtAuthGuard)
  // async unfollowUser(@CurrentUser() user: any, @Param('id') followingId: string) {
  //   return this.userService.unfollowUser(user.id, followingId);
  // }
  //
  // @Get(':id/followers')
  // async getFollowers(
  //   @Param('id') userId: string,
  //   @Query('page') page: string = '1',
  //   @Query('limit') limit: string = '20',
  // ) {
  //   return this.userService.getFollowers(userId, parseInt(page), parseInt(limit));
  // }
  //
  // @Get(':id/following')
  // async getFollowing(
  //   @Param('id') userId: string,
  //   @Query('page') page: string = '1',
  //   @Query('limit') limit: string = '20',
  // ) {
  //   return this.userService.getFollowing(userId, parseInt(page), parseInt(limit));
  // }
  //
  // @Get(':id/follow-status')
  // @UseGuards(JwtAuthGuard)
  // async checkFollowStatus(@CurrentUser() user: any, @Param('id') followingId: string) {
  //   return this.userService.checkFollowStatus(user.id, followingId);
  // }
}
