import { Module, Global } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionGuard } from './permission.guard';
import { PermissionDecorator } from './permission.decorator';

@Global()
@Module({
  providers: [
    PermissionService,
    PermissionGuard,
  ],
  exports: [
    PermissionService,
    PermissionGuard,
    PermissionDecorator,
  ],
})
export class PermissionModule {}
