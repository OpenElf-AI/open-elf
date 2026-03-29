import { Controller, Get, Post, Body, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get()
  async getWallet(@CurrentUser() user: any) {
    return this.walletService.getOrCreateWallet(user.id);
  }

  @Get('records')
  async getWalletRecords(
    @CurrentUser() user: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.walletService.getWalletRecords(user.id, parseInt(page), parseInt(limit));
  }

  @Post('deposit')
  async deposit(
    @CurrentUser() user: any,
    @Body() body: { amount: number; description?: string },
  ) {
    return this.walletService.addBalance(
      user.id,
      body.amount,
      'deposit',
      body.description || '充值'
    );
  }
}
