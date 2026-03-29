import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminImportExportService } from './admin-import-export.service';
import { AdminController } from './admin.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [AdminService, AdminImportExportService],
  controllers: [AdminController],
  exports: [AdminService, AdminImportExportService],
})
export class AdminModule {}
