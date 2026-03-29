import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { LLMConfigService } from './llm-config.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';

@Controller('llm-configs')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
export class LLMConfigController {
  constructor(private llmConfigService: LLMConfigService) {}

  @Get()
  async getConfigs(@CurrentUser() user: any) {
    return this.llmConfigService.getConfigs(user.id);
  }

  @Get('default')
  async getDefaultConfig(@CurrentUser() user: any) {
    return this.llmConfigService.getDefaultConfig(user.id);
  }

  @Post()
  async createConfig(
    @CurrentUser() user: any,
    @Body() body: {
      provider: string;
      model: string;
      apiKey?: string;
      baseUrl?: string;
      temperature?: number;
      maxTokens?: number;
    },
  ) {
    return this.llmConfigService.createConfig(user.id, body);
  }

  @Put(':id')
  async updateConfig(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: {
      provider?: string;
      model?: string;
      apiKey?: string;
      baseUrl?: string;
      temperature?: number;
      maxTokens?: number;
    },
  ) {
    return this.llmConfigService.updateConfig(user.id, id, body);
  }

  @Delete(':id')
  async deleteConfig(@CurrentUser() user: any, @Param('id') id: string) {
    return this.llmConfigService.deleteConfig(user.id, id);
  }

  @Post(':id/default')
  async setDefaultConfig(@CurrentUser() user: any, @Param('id') id: string) {
    return this.llmConfigService.setDefaultConfig(user.id, id);
  }
}
