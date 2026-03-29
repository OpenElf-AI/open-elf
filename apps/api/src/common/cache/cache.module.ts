import { Module, Global } from '@nestjs/common';
import { LocalCacheService } from './local-cache.service';
import { CacheService } from './cache.service';

@Global()
@Module({
  providers: [
    LocalCacheService,
    CacheService,
  ],
  exports: [
    CacheService,
  ],
})
export class CacheModule {}