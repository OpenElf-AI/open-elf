import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
export class ConversationController {
  constructor(private conversationService: ConversationService) {}

  @Get()
  async getConversations(
    @CurrentUser() user: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.conversationService.getConversations(user.id, parseInt(page), parseInt(limit));
  }

  @Post()
  async createConversation(@CurrentUser() user: any, @Body() body: { agent_id: string }) {
    return this.conversationService.createConversation(user.id, body.agent_id);
  }

  @Get(':id')
  async getConversationById(@CurrentUser() user: any, @Param('id') id: string) {
    return this.conversationService.getConversationById(user.id, id);
  }

  @Delete(':id')
  async deleteConversation(@CurrentUser() user: any, @Param('id') id: string) {
    return this.conversationService.deleteConversation(user.id, id);
  }
}
