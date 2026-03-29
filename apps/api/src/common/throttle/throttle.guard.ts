import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject } from '@nestjs/common';
import { ThrottleService } from './throttle.service';

@Injectable()
export class ThrottleGuard implements CanActivate {
  constructor(
    @Inject(ThrottleService) private throttleService: ThrottleService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // 获取客户端IP地址
    const ip = request.ip || 
              request.connection?.remoteAddress || 
              request.socket?.remoteAddress || 
              request.connection?.socket?.remoteAddress;
    
    if (!ip) {
      return true; // 如果无法获取IP，默认允许请求
    }

    // 为不同的API端点设置不同的限流规则
    const path = request.path;
    let limit = 100; // 默认限制：每分钟100个请求
    let windowMs = 60000; // 默认时间窗口：60秒

    // 为登录、注册等敏感接口设置更严格的限流
    if (path.includes('/auth/login') || path.includes('/auth/register')) {
      limit = 10; // 每分钟10个请求
      windowMs = 60000;
    }
    
    // 为API请求设置中等限流
    else if (path.startsWith('/api/')) {
      limit = 60; // 每分钟60个请求
      windowMs = 60000;
    }

    // 检查是否超过限流
    const allowed = await this.throttleService.check(ip, limit, windowMs);
    
    if (!allowed) {
      throw new ForbiddenException('请求过于频繁，请稍后再试');
    }

    return true;
  }
}
