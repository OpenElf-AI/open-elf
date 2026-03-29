import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AdminService } from '../../modules/admin/admin.service';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private adminService: AdminService,
    private reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    const module = this.reflector.get<string>('module', context.getHandler()) || 'unknown';
    const action = this.reflector.get<string>('action', context.getHandler()) || request.method;
    
    const ipAddress = request.ip || request.connection?.remoteAddress || 'unknown';
    const userAgent = request.headers['user-agent'];
    const requestMethod = request.method;
    const requestUrl = request.url;
    
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: async (data) => {
          const responseTime = Date.now() - startTime;
          const statusCode = response.statusCode;
          
          const user = request.user;
          let adminId: string | undefined;
          let adminName: string | undefined;
          
          if (user) {
            adminId = user.sub;
            adminName = user.username;
          }

          try {
            await this.adminService.logAudit({
              adminId,
              adminName,
              action,
              module,
              details: JSON.stringify({
                requestBody: request.body,
                queryParams: request.query,
                responseTime,
              }),
              ipAddress,
              userAgent,
              requestMethod,
              requestUrl,
              status: statusCode.toString(),
            });
          } catch (error) {
            console.error('Failed to log audit:', error);
          }
        },
        error: async (error) => {
          const responseTime = Date.now() - startTime;
          
          const user = request.user;
          let adminId: string | undefined;
          let adminName: string | undefined;
          
          if (user) {
            adminId = user.sub;
            adminName = user.username;
          }

          try {
            await this.adminService.logAudit({
              adminId,
              adminName,
              action,
              module,
              details: JSON.stringify({
                error: error.message,
                requestBody: request.body,
                queryParams: request.query,
                responseTime,
              }),
              ipAddress,
              userAgent,
              requestMethod,
              requestUrl,
              status: error.status?.toString() || '500',
            });
          } catch (logError) {
            console.error('Failed to log audit:', logError);
          }
        },
      }),
    );
  }
}
