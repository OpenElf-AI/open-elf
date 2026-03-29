import { Module } from '@nestjs/common';
import { LLMConfigService } from './llm-config.service';
import { LLMConfigController } from './llm-config.controller';

@Module({
  providers: [LLMConfigService],
  controllers: [LLMConfigController],
  exports: [LLMConfigService],
})
export class LLMConfigModule {}
