import { Controller, Post, Get, Body, Query, Param, UseGuards, Request, UseInterceptors, SetMetadata } from '@nestjs/common';
import { AdminService } from './admin.service';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';

@Controller('admin')
@UseInterceptors(TransformInterceptor, AuditInterceptor)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('login')
  @SetMetadata('module', 'admin')
  @SetMetadata('action', 'login')
  async login(
    @Body() body: { username: string; password: string },
    @Request() req: any,
  ) {
    const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'];
    return this.adminService.login(body.username, body.password, ipAddress, userAgent);
  }

  @Post('create')
  @SetMetadata('module', 'admin')
  @SetMetadata('action', 'create')
  async createAdmin(@Body() body: {
    username: string;
    email?: string;
    password: string;
    name?: string;
    role?: string;
  }) {
    return this.adminService.createAdmin(body);
  }

  @Get('list')
  @SetMetadata('module', 'admin')
  @SetMetadata('action', 'list')
  async getAdmins(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.adminService.getAdmins(parseInt(page), parseInt(limit));
  }

  @Post(':id/toggle-active')
  @SetMetadata('module', 'admin')
  @SetMetadata('action', 'toggle-active')
  async toggleAdminActive(
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.adminService.toggleAdminActive(id, body.isActive);
  }

  @Get('audit-logs')
  @SetMetadata('module', 'admin')
  @SetMetadata('action', 'audit-logs')
  async getAuditLogs(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('adminId') adminId?: string,
    @Query('module') module?: string,
    @Query('action') action?: string,
  ) {
    return this.adminService.getAuditLogs(
      parseInt(page),
      parseInt(limit),
      adminId,
      module,
      action,
    );
  }
}
