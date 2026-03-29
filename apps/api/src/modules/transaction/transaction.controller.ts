import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
export class TransactionController {
  constructor(private transactionService: TransactionService) {}

  @Get()
  async getTransactions(
    @CurrentUser() user: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.transactionService.getTransactions(user.id, parseInt(page), parseInt(limit));
  }
}
