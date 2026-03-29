import { Controller, Get, Post, Body, Param, UseGuards, UseInterceptors, Query } from '@nestjs/common';
import { OrderService, CreateOrderInput } from './order.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';

@Controller('order')
@UseInterceptors(TransformInterceptor)
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createOrder(@CurrentUser() user: any, @Body() data: CreateOrderInput) {
    return this.orderService.createOrder({
      ...data,
      userId: user.id,
    });
  }

  @Get('list')
  @UseGuards(JwtAuthGuard)
  async getOrderList(@CurrentUser() user: any) {
    return this.orderService.getOrderList(user.id);
  }

  @Get('status/:outTradeNo')
  @UseGuards(JwtAuthGuard)
  async getOrderStatus(@Param('outTradeNo') outTradeNo: string) {
    return this.orderService.getOrder(outTradeNo);
  }

  @Get('admin/list')
  // @UseGuards(JwtAuthGuard)
  async getAdminOrderList(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('userId') userId?: string,
  ) {
    return this.orderService.getAdminOrderList({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      status,
      userId,
    });
  }

  @Get('admin/:outTradeNo')
  // @UseGuards(JwtAuthGuard)
  async getAdminOrderDetail(@Param('outTradeNo') outTradeNo: string) {
    return this.orderService.getOrder(outTradeNo);
  }
}
