import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(username: string, password: string, ipAddress: string, userAgent?: string) {
    const admin = await this.prisma.admin.findUnique({ where: { username } });

    await this.prisma.adminLoginAttempt.create({
      data: {
        username,
        ipAddress,
        userAgent,
        success: false,
      },
    });

    if (!admin) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    if (!admin.isActive) {
      throw new ForbiddenException('账号已被禁用');
    }

    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      throw new ForbiddenException('账号已被锁定，请稍后再试');
    }

    const passwordValid = await bcrypt.compare(password, admin.password);
    if (!passwordValid) {
      const newFailureCount = admin.loginFailureCount + 1;
      
      let lockedUntil = null;
      if (newFailureCount >= 5) {
        lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
      }

      await this.prisma.admin.update({
        where: { id: admin.id },
        data: {
          loginFailureCount: newFailureCount,
          lockedUntil,
        },
      });

      throw new UnauthorizedException('用户名或密码错误');
    }

    await this.prisma.admin.update({
      where: { id: admin.id },
      data: {
        loginFailureCount: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
      },
    });

    await this.prisma.adminLoginAttempt.create({
      data: {
        adminId: admin.id,
        username,
        ipAddress,
        userAgent,
        success: true,
      },
    });

    const payload = { sub: admin.id, username: admin.username, role: admin.role };
    const token = this.jwtService.sign(payload, { expiresIn: '24h' });

    return {
      access_token: token,
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        avatar: admin.avatar,
      },
    };
  }

  async createAdmin(data: {
    username: string;
    email?: string;
    password: string;
    name?: string;
    role?: string;
  }) {
    const existingAdmin = await this.prisma.admin.findUnique({
      where: { username: data.username },
    });

    if (existingAdmin) {
      throw new BadRequestException('用户名已存在');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const admin = await this.prisma.admin.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role || 'admin',
      },
    });

    return {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };
  }

  async getAdmins(page: number = 1, limit: number = 20) {
    const [admins, total] = await Promise.all([
      this.prisma.admin.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          lastLoginIp: true,
          createdAt: true,
        },
      }),
      this.prisma.admin.count(),
    ]);

    return {
      items: admins,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async toggleAdminActive(adminId: string, isActive: boolean) {
    const admin = await this.prisma.admin.update({
      where: { id: adminId },
      data: { isActive },
    });

    return { success: true, admin: { id: admin.id, isActive: admin.isActive } };
  }

  async getAuditLogs(
    page: number = 1,
    limit: number = 20,
    adminId?: string,
    module?: string,
    action?: string,
  ) {
    const where: any = {};
    if (adminId) where.adminId = adminId;
    if (module) where.module = module;
    if (action) where.action = action;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items: logs,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async logAudit(data: {
    adminId?: string;
    adminName?: string;
    action: string;
    module: string;
    details?: string;
    ipAddress?: string;
    userAgent?: string;
    requestMethod?: string;
    requestUrl?: string;
    status?: string;
  }) {
    return this.prisma.auditLog.create({
      data,
    });
  }
}
