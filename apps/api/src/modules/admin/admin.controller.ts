import { Controller, Post, Get, Body, Query, Param, UseGuards, Request, UseInterceptors, SetMetadata, UploadedFile, Res } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminImportExportService } from './admin-import-export.service';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';
import { AuditInterceptor } from '../../common/interceptors/audit.interceptor';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { Response } from 'express';

@Controller('admin')
@UseInterceptors(TransformInterceptor, AuditInterceptor)
export class AdminController {
  constructor(
    private adminService: AdminService,
    private importExportService: AdminImportExportService,
  ) {
    // 确保导出目录存在
    this.importExportService.ensureExportDirectory();
  }

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

  // 数据导出 endpoints
  @Get('export/users')
  @SetMetadata('module', 'admin')
  @SetMetadata('action', 'export-users')
  async exportUsers(@Res() res: Response) {
    try {
      const filePath = await this.importExportService.exportUsersToCsv();
      res.download(filePath, path.basename(filePath), (err) => {
        if (err) {
          res.status(500).json({ code: 500, message: '导出失败', data: null });
        }
      });
    } catch (error) {
      res.status(500).json({ code: 500, message: error.message, data: null });
    }
  }

  @Get('export/agents')
  @SetMetadata('module', 'admin')
  @SetMetadata('action', 'export-agents')
  async exportAgents(@Res() res: Response) {
    try {
      const filePath = await this.importExportService.exportAgentsToCsv();
      res.download(filePath, path.basename(filePath), (err) => {
        if (err) {
          res.status(500).json({ code: 500, message: '导出失败', data: null });
        }
      });
    } catch (error) {
      res.status(500).json({ code: 500, message: error.message, data: null });
    }
  }

  @Get('export/orders')
  @SetMetadata('module', 'admin')
  @SetMetadata('action', 'export-orders')
  async exportOrders(@Res() res: Response) {
    try {
      const filePath = await this.importExportService.exportOrdersToCsv();
      res.download(filePath, path.basename(filePath), (err) => {
        if (err) {
          res.status(500).json({ code: 500, message: '导出失败', data: null });
        }
      });
    } catch (error) {
      res.status(500).json({ code: 500, message: error.message, data: null });
    }
  }

  // 数据导入 endpoints
  @Post('import/users')
  @SetMetadata('module', 'admin')
  @SetMetadata('action', 'import-users')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: path.join(__dirname, '..', '..', '..', 'uploads'),
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, `user-import-${uniqueSuffix}.csv`);
        },
      }),
    }),
  )
  async importUsers(@UploadedFile() file: any) {
    try {
      const result = await this.importExportService.importUsersFromCsv(file.path);
      return {
        code: 200,
        message: '导入完成',
        data: result,
      };
    } catch (error) {
      return {
        code: 500,
        message: error.message,
        data: null,
      };
    }
  }

  @Post('import/agents')
  @SetMetadata('module', 'admin')
  @SetMetadata('action', 'import-agents')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: path.join(__dirname, '..', '..', '..', 'uploads'),
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, `agent-import-${uniqueSuffix}.csv`);
        },
      }),
    }),
  )
  async importAgents(@UploadedFile() file: any) {
    try {
      const result = await this.importExportService.importAgentsFromCsv(file.path);
      return {
        code: 200,
        message: '导入完成',
        data: result,
      };
    } catch (error) {
      return {
        code: 500,
        message: error.message,
        data: null,
      };
    }
  }
}
