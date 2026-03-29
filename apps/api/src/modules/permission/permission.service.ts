import { Injectable } from '@nestjs/common';

// 定义角色权限映射
const ROLE_PERMISSIONS = {
  admin: [
    'user:manage',
    'agent:manage',
    'order:manage',
    'creator:manage',
    'verification:manage',
    'log:view',
    'dashboard:view',
  ],
  creator: [
    'agent:create',
    'agent:edit',
    'agent:view',
    'order:view',
  ],
  user: [
    'agent:view',
    'order:create',
    'order:view',
  ],
};

@Injectable()
export class PermissionService {
  async checkPermissions(user: any, requiredPermissions: string[]): Promise<boolean> {
    if (!user || !user.role) {
      return false;
    }

    // 管理员拥有所有权限
    if (user.role === 'admin') {
      return true;
    }

    // 获取用户角色的权限列表
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];

    // 检查是否拥有所有需要的权限
    return requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );
  }

  // 获取用户权限列表
  getUserPermissions(user: any): string[] {
    if (!user || !user.role) {
      return [];
    }

    if (user.role === 'admin') {
      return Object.values(ROLE_PERMISSIONS).flat();
    }

    return ROLE_PERMISSIONS[user.role] || [];
  }

  // 检查用户是否有特定角色
  hasRole(user: any, role: string): boolean {
    if (!user || !user.role) {
      return false;
    }

    if (user.role === 'admin') {
      return true;
    }

    return user.role === role;
  }
}
