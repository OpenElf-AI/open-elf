import { Controller, Get, Post, Body, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { MessageService } from './message.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';

@Controller('conversations/:conversationId/messages')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Get()
  async getMessages(
    @CurrentUser() user: any,
    @Param('conversationId') conversationId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    return this.messageService.getMessages(user.id, conversationId, parseInt(page), parseInt(limit));
  }

  @Post()
  async sendMessage(
    @CurrentUser() user: any,
    @Param('conversationId') conversationId: string,
    @Body() body: { content: string },
  ) {
    return this.messageService.sendMessage(user.id, conversationId, body.content);
  }

  @Post('/generate-reply')
  async generateReply(
    @CurrentUser() user: any,
    @Param('conversationId') conversationId: string,
  ) {
    return this.messageService.generateReply(user.id, conversationId);
  }
}
