# Open Elf 双前端项目架构指南

## 📋 项目概览

### 项目结构
```
Open/
├── apps/
│   ├── web/          # 用户端应用（C端）
│   ├── admin/        # 管理端应用（B端）
│   └── api/          # 后端API服务
├── packages/
│   ├── types/        # 共享类型定义
│   └── shared/       # 共享代码（Prisma等）
└── turbo.json        # Turborepo 配置
```

## 🏗️ 架构设计原则

### 1. **API路由隔离**

#### 后端路由结构
```
/api/v1/
├── web/              # 用户端专属API
│   ├── auth/         # 用户认证
│   ├── agents/       # 智能体（用户视角）
│   ├── conversations/# 对话
│   ├── orders/       # 订单
│   └── verification/ # 创作者认证申请
│
├── admin/            # 管理端专属API
│   ├── auth/         # 管理员认证
│   ├── users/        # 用户管理
│   ├── agents/       # 智能体管理
│   ├── creators/     # 创作者管理
│   ├── audits/       # 审核管理
│   └── dashboard/    # 数据看板
│
└── health/           # 健康检查（共用）
```

### 2. **分离的认证体系**

#### 用户端认证
- **路由**: `/api/v1/web/auth/*`
- **Token**: `user_token` (localStorage)
- **方式**: 手机号验证码登录
- **权限**: 用户权限

#### 管理端认证
- **路由**: `/api/v1/admin/auth/*`
- **Token**: `admin_token` (localStorage)
- **方式**: 用户名/密码登录
- **权限**: 管理员角色权限
- **安全**: IP白名单、操作日志

### 3. **环境配置隔离**

#### Web应用环境变量
```env
# .env.development
VITE_API_BASE_URL=http://localhost:3000/api/v1/web
VITE_API_TIMEOUT=10000
VITE_ENABLE_MOCK=true

# .env.production
VITE_API_BASE_URL=https://api.openelf.com/api/v1/web
VITE_API_TIMEOUT=15000
VITE_ENABLE_MOCK=false
```

#### Admin应用环境变量
```env
# .env.development
VITE_API_BASE_URL=http://localhost:3000/api/v1/admin
VITE_API_TIMEOUT=10000

# .env.production
VITE_API_BASE_URL=https://api.openelf.com/api/v1/admin
VITE_API_TIMEOUT=15000
```

## 🚀 开发工作流

### 启动开发环境

#### 方式1: 同时启动所有项目
```bash
# 在项目根目录
npm run dev
```

#### 方式2: 单独启动项目
```bash
# 启动用户端
cd apps/web && npm run dev

# 启动管理端
cd apps/admin && npm run dev

# 启动后端
cd apps/api && npm run dev
```

### 端口分配

| 项目 | 开发端口 | 说明 |
|------|----------|------|
| web | 34284 | 用户端应用 |
| admin | 5173 | 管理端应用 |
| api | 3000 | 后端API服务 |

## 🔐 安全最佳实践

### 1. **Token隔离**
- 用户端和管理端使用不同的localStorage键
- Token过期时间不同
- 刷新Token机制独立

### 2. **API权限检查**
- 每个API端点明确权限要求
- 用户端API禁止管理员访问
- 管理端API禁止普通用户访问

### 3. **CORS配置**
```typescript
// 后端CORS配置
const corsOptions = {
  origin: [
    'http://localhost:34284',  // web dev
    'http://localhost:5173',   // admin dev
    'https://app.openelf.com',  // web prod
    'https://admin.openelf.com'  // admin prod
  ],
  credentials: true
}
```

## 📦 部署策略

### 独立部署
- **Web应用**: `https://app.openelf.com`
- **Admin应用**: `https://admin.openelf.com`
- **API服务**: `https://api.openelf.com`

### Docker部署示例
```yaml
# docker-compose.yml
version: '3.8'
services:
  web:
    build: ./apps/web
    ports:
      - "80:80"
    environment:
      - VITE_API_BASE_URL=https://api.openelf.com/api/v1/web

  admin:
    build: ./apps/admin
    ports:
      - "81:80"
    environment:
      - VITE_API_BASE_URL=https://api.openelf.com/api/v1/admin

  api:
    build: ./apps/api
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://...
```

## 🧪 测试策略

### 端到端测试隔离
- Web端测试: 使用用户API
- Admin端测试: 使用管理员API
- 共享测试: 使用健康检查API

### Mock数据分离
- Web端: `apps/web/src/api/mockApi.ts`
- Admin端: 可独立创建admin mock API

## 📝 开发注意事项

### 1. **代码共享原则**
- ✅ 共享: 类型定义、通用工具函数
- ❌ 不共享: 业务逻辑、API调用、状态管理

### 2. **提交规范**
- Web端提交: `[web] feat: xxx`
- Admin端提交: `[admin] feat: xxx`
- 共享代码提交: `[shared] refactor: xxx`

### 3. **版本发布**
- 两个前端独立版本号
- 独立的发布周期
- 共享依赖统一管理

## 🔧 工具链配置

### Turborepo任务
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "typecheck": {}
  }
}
```

## 📊 监控和日志

### 独立监控
- Web端: 用户行为分析、错误追踪
- Admin端: 操作审计、系统监控
- API端: 请求日志、性能监控

### 日志分级
```typescript
// 用户端日志
console.log('[Web] 用户操作');

// 管理端日志
console.log('[Admin] 管理员操作');

// API日志
console.log('[API] [Web] 请求处理');
console.log('[API] [Admin] 请求处理');
```

---

**总结**: 通过明确的API路由隔离、独立的认证体系、分离的环境配置，两个前端项目可以完全独立开发和部署，互不干扰。
