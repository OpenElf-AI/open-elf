# Open Elf 项目设置指南

## 项目结构

```
open-elf/
├── apps/
│   ├── web/          # 前端应用 (已存在)
│   ├── api/          # 后端 API (NestJS)
│   └── admin/        # 后台管理系统 (React + Ant Design)
├── packages/
│   ├── types/        # 共享类型定义
│   └── shared/       # 共享代码 (Prisma)
├── docs/             # 文档
└── package.json      # 根 package.json
```

## 技术栈

### 前端
- React 18 + TypeScript + Vite
- Zustand (状态管理)
- TanStack React Query
- Tailwind CSS
- Lucide React (图标)

### 后端 API
- NestJS
- Prisma ORM
- PostgreSQL
- JWT 认证
- Swagger API 文档

### 后台管理
- React 18 + TypeScript + Vite
- Ant Design
- React Router
- Zustand
- TanStack React Query
- Recharts (图表)

### Monorepo
- Turborepo

## 前置要求

- Node.js >= 18
- npm >= 10
- PostgreSQL >= 14
- (可选) Docker (用于运行 PostgreSQL)

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 设置数据库

#### 方式一：使用本地 PostgreSQL

确保 PostgreSQL 正在运行，然后创建数据库：

```sql
CREATE DATABASE open_elf;
```

更新 `apps/api/.env` 中的数据库连接字符串：

```env
DATABASE_URL="postgresql://user:password@localhost:5432/open_elf?schema=public"
```

#### 方式二：使用 Docker

```bash
docker run --name open-elf-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=open_elf -p 5432:5432 -d postgres:14
```

### 3. 初始化数据库

```bash
# 生成 Prisma Client
npm run db:generate

# 运行数据库迁移
npm run db:migrate
```

### 4. 启动开发服务器

#### 方式一：同时启动所有服务

```bash
npm run dev
```

#### 方式二：分别启动服务

**启动后端 API (端口 3000):**
```bash
cd apps/api
npm run dev
```

**启动前端应用 (端口 34284):**
```bash
cd apps/web
npm run dev
```

**启动后台管理系统 (端口 5173):**
```bash
cd apps/admin
npm run dev
```

## 访问应用

- **前端应用**: http://localhost:34284
- **后端 API**: http://localhost:3000
- **API 文档 (Swagger)**: http://localhost:3000/api
- **后台管理系统**: http://localhost:5173

## 后台管理系统登录

- 用户名: `admin`
- 密码: `admin123`

## API 接口

所有 API 接口都遵循统一的响应格式：

```typescript
{
  code: number;           // 0 表示成功
  message: string;        // 响应消息
  data: any;              // 响应数据
  timestamp: number;      // 时间戳
}
```

### 主要接口

#### 认证
- `POST /api/auth/send-code` - 发送验证码
- `POST /api/auth/login-with-code` - 验证码登录
- `POST /api/auth/refresh` - 刷新 Token
- `POST /api/auth/logout` - 登出

#### 用户
- `GET /api/users/me` - 获取当前用户信息
- `PUT /api/users/me` - 更新用户信息
- `POST /api/users/verification` - 提交创作者认证

#### 智能体
- `GET /api/agents` - 获取智能体列表
- `GET /api/agents/:id` - 获取智能体详情
- `POST /api/agents` - 创建智能体
- `GET /api/agents/my` - 我的智能体
- `POST /api/agents/:id/favorite` - 收藏/取消收藏
- `POST /api/agents/:id/toggle-showcase` - 展示/取消展示
- `POST /api/agents/:id/add-exp` - 添加经验值

#### 对话
- `GET /api/conversations` - 获取对话列表
- `POST /api/conversations` - 创建对话
- `GET /api/conversations/:id` - 获取对话详情
- `DELETE /api/conversations/:id` - 删除对话

#### 消息
- `GET /api/conversations/:conversationId/messages` - 获取消息列表
- `POST /api/conversations/:conversationId/messages` - 发送消息
- `POST /api/conversations/:conversationId/messages/generate-reply` - 生成 AI 回复

#### 能力包
- `GET /api/capability-packages` - 获取能力包列表
- `GET /api/capability-packages/:id` - 获取能力包详情
- `GET /api/capability-packages/my` - 我的能力包
- `POST /api/capability-packages/:id/purchase` - 购买能力包
- `POST /api/capability-packages/:userPackageId/install` - 安装能力包
- `POST /api/capability-packages/:userPackageId/uninstall` - 卸载能力包

#### 通知
- `GET /api/notifications` - 获取通知列表
- `POST /api/notifications/:id/read` - 标记已读
- `POST /api/notifications/read-all` - 全部标记已读

#### 交易
- `GET /api/transactions` - 获取交易记录

## 开发命令

```bash
# 安装所有依赖
npm install

# 启动所有开发服务器
npm run dev

# 构建所有应用
npm run build

# 代码检查
npm run lint

# 类型检查
npm run typecheck

# 代码格式化
npm run format

# 清理构建产物
npm run clean

# 数据库操作
npm run db:generate   # 生成 Prisma Client
npm run db:migrate    # 运行迁移
npm run db:studio     # 打开 Prisma Studio
```

## 项目配置

### 环境变量

#### apps/api/.env
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/open_elf?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"
JWT_REFRESH_EXPIRES_IN="30d"
CORS_ORIGIN=http://localhost:34284,http://localhost:5173
```

## 注意事项

1. **生产环境部署前，请务必更改所有的 secret 密钥**
2. 确保 PostgreSQL 服务正常运行
3. 首次运行前需要先运行数据库迁移
4. 前端已配置代理，会自动将 `/api` 请求转发到后端

## 常见问题

### Q: 数据库连接失败？
A: 检查 PostgreSQL 是否正在运行，以及 DATABASE_URL 配置是否正确。

### Q: Prisma 相关错误？
A: 运行 `npm run db:generate` 重新生成 Prisma Client。

### Q: 端口被占用？
A: 可以在各自的配置文件中更改端口号，或先停止占用端口的进程。

### Q: 前端无法调用后端 API？
A: 检查后端服务是否正常运行，以及前端 vite.config.ts 中的代理配置是否正确。
