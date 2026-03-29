import { Module } from '@nestjs/common';
import { AgentReviewService } from './agent-review.service';
import { AgentReviewController } from './agent-review.controller';

@Module({
  providers: [AgentReviewService],
  controllers: [AgentReviewController],
  exports: [AgentReviewService],
})
export class AgentReviewModule {}
