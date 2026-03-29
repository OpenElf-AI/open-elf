import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { AgentModule } from './modules/agent/agent.module';
import { UserAgentModule } from './modules/user-agent/user-agent.module';
import { AdminModule } from './modules/admin/admin.module';
import { ConversationModule } from './modules/conversation/conversation.module';
import { MessageModule } from './modules/message/message.module';
import { CapabilityModule } from './modules/capability/capability.module';
import { NotificationModule } from './modules/notification/notification.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AlipayModule } from './modules/alipay/alipay.module';
import { OrderModule } from './modules/order/order.module';
import { CreatorModule } from './modules/creator/creator.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { LLMConfigModule } from './modules/llm-config/llm-config.module';
import { AgentFollowModule } from './modules/agent-follow/agent-follow.module';
import { AgentReviewModule } from './modules/agent-review/agent-review.module';
import { AgentAchievementModule } from './modules/agent-achievement/agent-achievement.module';
import { PermissionModule } from './modules/permission/permission.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { CacheModule } from './common/cache/cache.module';
import { ThrottleModule } from './common/throttle/throttle.module';
import { CryptoModule } from './common/crypto/crypto.module';
import { MetricsModule } from './common/metrics/metrics.module';
import { RedisModule } from './common/redis/redis.module';
import { BlockchainModule } from './common/blockchain/blockchain.module';
import { HealthController } from './common/health/health.controller';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV || 'development'}`,
        '.env',
      ],
    }),
    PrismaModule,
    RedisModule,
    CacheModule,
    ThrottleModule,
    CryptoModule,
    BlockchainModule,
    MetricsModule,
    AnalyticsModule,
    PermissionModule,
    AuthModule,
    UserModule,
    AgentModule,
    UserAgentModule,
    AdminModule,
    ConversationModule,
    MessageModule,
    CapabilityModule,
    NotificationModule,
    TransactionModule,
    DashboardModule,
    AlipayModule,
    OrderModule,
    CreatorModule,
    WalletModule,
    LLMConfigModule,
    AgentFollowModule,
    AgentReviewModule,
    AgentAchievementModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
