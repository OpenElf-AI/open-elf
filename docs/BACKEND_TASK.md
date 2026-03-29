# 后端 + 后台管理系统开发任务

## 项目概述

为 Open Elf 项目开发后端 API 服务和后台管理系统，采用 Monorepo 架构，使用 Trae IDE 进行开发。

## 技术栈选型

### 后端 API
- **框架**: NestJS (推荐) 或 Express + TypeScript
- **数据库**: PostgreSQL
- **ORM**: Prisma (推荐) 或 TypeORM
- **认证**: JWT + Passport
- **API 文档**: Swagger / OpenAPI
- **缓存**: Redis (可选)
- **任务队列**: BullMQ (可选，用于异步任务)

### 后台管理系统
- **框架**: React 18 + TypeScript + Vite (与前端保持一致)
- **UI 组件库**: Ant Design (推荐) 或 shadcn/ui
- **状态管理**: Zustand
- **数据获取**: TanStack React Query
- **路由**: React Router
- **样式**: Tailwind CSS

### Monorepo 管理
- **工具**: Turborepo (推荐) 或 Nx

## 项目结构

```
open-elf-backend/
├── apps/
│   ├── api/                    # 后端 API 服务
│   │   ├── src/
│   │   │   ├── modules/        # 业务模块
│   │   │   │   ├── auth/       # 认证模块
│   │   │   │   ├── user/       # 用户模块
│   │   │   │   ├── agent/      # 智能体模块
│   │   │   │   ├── conversation/ # 对话模块
│   │   │   │   ├── message/    # 消息模块
│   │   │   │   ├── capability/ # 能力包模块
│   │   │   │   ├── notification/ # 通知模块
│   │   │   │   └── transaction/ # 交易模块
│   │   │   ├── common/         # 公共模块
│   │   │   ├── config/         # 配置
│   │   │   └── main.ts
│   │   └── package.json
│   │
│   └── admin/                  # 后台管理系统
│       ├── src/
│       │   ├── pages/          # 页面
│       │   ├── components/     # 组件
│       │   ├── api/            # API 调用
│       │   ├── store/          # 状态管理
│       │   └── main.tsx
│       └── package.json
│
├── packages/
│   ├── shared/                 # 共享代码
│   │   ├── database/           # 数据库相关
│   │   │   ├── schema.prisma   # Prisma Schema
│   │   │   └── migrations/     # 数据库迁移
│   │   ├── auth/               # 认证相关
│   │   └── utils/              # 工具函数
│   │
│   └── types/                  # TypeScript 类型定义
│       └── index.ts            # 前后端共享类型
│
├── docs/
│   ├── API.md                  # API 文档
│   └── DATABASE.md             # 数据库设计文档
│
├── package.json
├── turbo.json                  # Turborepo 配置
└── README.md
```

## 核心任务清单

### 阶段一：项目初始化

#### 1.1 初始化 Monorepo
- [ ] 创建 Turborepo 项目结构
- [ ] 配置工作区 (workspaces)
- [ ] 配置 TypeScript
- [ ] 配置 ESLint 和 Prettier
- [ ] 配置 Git hooks (Husky + lint-staged)

#### 1.2 配置共享包
- [ ] 创建 `packages/types` - 共享类型定义
- [ ] 创建 `packages/shared` - 共享工具函数
- [ ] 配置包之间的依赖关系

### 阶段二：数据库设计

#### 2.1 设计数据库 Schema
参考前端已有的 `docs/API.md`，设计以下数据表：

**用户相关表**
- `users` - 用户表
- `user_profiles` - 用户资料表
- `user_verifications` - 用户认证表

**智能体相关表**
- `agents` - 智能体表
- `agent_categories` - 智能体分类表
- `agent_tags` - 智能体标签表
- `agent_tag_relations` - 智能体标签关系表

**对话相关表**
- `conversations` - 对话表
- `messages` - 消息表

**能力包相关表**
- `capability_packages` - 能力包表
- `user_capability_packages` - 用户能力包关联表

**交易相关表**
- `transactions` - 交易表
- `wallets` - 钱包表
- `wallet_records` - 钱包流水表

**通知相关表**
- `notifications` - 通知表
- `user_notifications` - 用户通知关联表

**其他表**
- `favorites` - 收藏表
- `llm_configs` - LLM 配置表

#### 2.2 实现 Prisma Schema
- [ ] 编写完整的 `schema.prisma`
- [ ] 配置数据库连接
- [ ] 创建初始迁移
- [ ] 生成 Prisma Client

### 阶段三：后端 API 开发

#### 3.1 基础框架搭建
- [ ] 创建 NestJS 应用
- [ ] 配置中间件 (CORS, 日志, 压缩等)
- [ ] 配置全局异常过滤器
- [ ] 配置响应拦截器 (统一响应格式)
- [ ] 配置 Swagger API 文档

#### 3.2 认证授权模块
- [ ] JWT 认证实现
- [ ] 用户登录/注册接口
- [ ] 刷新 Token 接口
- [ ] 权限守卫 (Guards)
- [ ] 角色权限控制

#### 3.3 用户管理模块
- [ ] 获取用户信息
- [ ] 更新用户信息
- [ ] 用户列表 (后台)
- [ ] 用户状态管理

#### 3.4 智能体模块
- [ ] 智能体 CRUD 接口
- [ ] 智能体搜索/筛选
- [ ] 智能体分类管理
- [ ] 智能体标签管理
- [ ] 智能体验值/等级系统
- [ ] 智能体展示/下架

#### 3.5 对话模块
- [ ] 创建对话
- [ ] 获取对话列表
- [ ] 获取对话详情
- [ ] 删除对话
- [ ] 发送消息
- [ ] 获取消息列表
- [ ] LLM 流式响应 (SSE)

#### 3.6 能力包模块
- [ ] 能力包列表
- [ ] 能力包详情
- [ ] 购买能力包
- [ ] 用户能力包管理

#### 3.7 交易模块
- [ ] 创建交易订单
- [ ] 交易记录查询
- [ ] 钱包余额查询
- [ ] 充值/提现接口

#### 3.8 通知模块
- [ ] 获取通知列表
- [ ] 标记已读
- [ ] 批量已读
- [ ] 删除通知

#### 3.9 收藏模块
- [ ] 添加收藏
- [ ] 取消收藏
- [ ] 收藏列表

#### 3.10 LLM 配置模块
- [ ] 获取可用模型列表
- [ ] 用户 LLM 配置
- [ ] 模型调用计费

### 阶段四：后台管理系统开发

#### 4.1 基础框架
- [ ] 创建 React + Vite 项目
- [ ] 配置路由 (React Router)
- [ ] 配置状态管理 (Zustand)
- [ ] 配置 React Query
- [ ] 配置 Ant Design 或其他 UI 库
- [ ] 配置 Tailwind CSS

#### 4.2 认证页面
- [ ] 登录页面
- [ ] 权限控制路由守卫

#### 4.3 仪表盘
- [ ] 数据统计卡片
- [ ] 用户增长趋势
- [ ] 对话量统计
- [ ] 交易额统计

#### 4.4 用户管理
- [ ] 用户列表页
- [ ] 用户详情页
- [ ] 用户编辑/禁用/启用
- [ ] 用户搜索筛选

#### 4.5 智能体管理
- [ ] 智能体列表页
- [ ] 智能体详情页
- [ ] 智能体审核
- [ ] 智能体上下架
- [ ] 智能体分类管理
- [ ] 智能体标签管理

#### 4.6 内容管理
- [ ] 能力包管理
- [ ] 公告管理
- [ ] 帮助文档管理

#### 4.7 交易管理
- [ ] 交易记录列表
- [ ] 交易详情
- [ ] 订单审核
- [ ] 退款处理

#### 4.8 系统管理
- [ ] 管理员管理
- [ ] 角色权限管理
- [ ] 操作日志
- [ ] 系统配置

### 阶段五：测试和部署

#### 5.1 测试
- [ ] 后端单元测试
- [ ] 后端集成测试
- [ ] API 接口测试
- [ ] 后台管理 E2E 测试

#### 5.2 CI/CD
- [ ] 配置 GitHub Actions
- [ ] 自动化测试
- [ ] 自动化部署
- [ ] Docker 容器化

#### 5.3 文档
- [ ] API 文档 (Swagger)
- [ ] 数据库设计文档
- [ ] 部署文档
- [ ] 后台管理使用手册

## 接口规范

### 统一响应格式

```typescript
interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}
```

### 错误码定义

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 分页格式

```typescript
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

## 与前端联调要点

### 1. API 接口对齐
- 严格按照 `docs/API.md` 中的接口定义开发
- 保持请求和响应格式一致
- 及时沟通接口变更

### 2. 类型定义共享
- 前后端共用 `packages/types` 中的类型定义
- 使用 TypeScript 确保类型安全
- 类型变更同步更新

### 3. 开发环境
- 后端运行在 `http://localhost:3000`
- 前端运行在 `http://localhost:34284`
- 配置 CORS 允许跨域请求

### 4. 联调流程
1. 后端先完成 API 开发并提供 Swagger 文档
2. 前端根据 API 文档进行对接
3. 发现问题及时沟通修复
4. 完成功能测试

## 重要注意事项

### 1. 安全性
- 密码加密存储 (bcrypt)
- JWT Token 安全配置
- SQL 注入防护
- XSS 防护
- CSRF 防护
- 敏感数据脱敏

### 2. 性能优化
- 数据库索引优化
- 查询优化
- 缓存策略 (Redis)
- API 响应压缩
- 分页查询

### 3. 数据一致性
- 使用数据库事务
- 软删除机制
- 数据备份策略
- 审计日志

### 4. 可扩展性
- 模块化设计
- 微服务预备
- 消息队列支持
- 水平扩展能力

## 交付物清单

### 代码交付
- [ ] 完整的 Monorepo 项目代码
- [ ] 数据库迁移文件
- [ ] Docker 配置文件
- [ ] CI/CD 配置文件

### 文档交付
- [ ] API 文档 (Swagger)
- [ ] 数据库设计文档
- [ ] 部署文档
- [ ] 后台管理使用手册
- [ ] 开发文档

### 测试交付
- [ ] 单元测试报告
- [ ] 集成测试报告
- [ ] 性能测试报告

## 开发时间规划（建议）

| 阶段 | 预计时间 | 里程碑 |
|------|----------|--------|
| 项目初始化 | 1-2 天 | 项目结构搭建完成 |
| 数据库设计 | 2-3 天 | 数据库 Schema 完成 |
| 后端 API 开发 | 7-10 天 | 核心 API 完成 |
| 后台管理开发 | 7-10 天 | 管理系统完成 |
| 测试和联调 | 3-5 天 | 联调完成 |
| 部署和优化 | 2-3 天 | 正式上线 |

**总计：约 3-4 周**

## 联系和沟通

- 前端项目：`/Users/jinglingclaw/Documents/Open`
- API 文档参考：`docs/API.md`
- 类型定义参考：前端 `src/api/types.ts`
- 联调时保持及时沟通

---

**开始开发前请确认：**
1. ✅ 理解所有需求
2. ✅ 技术栈确认
3. ✅ 项目结构确认
4. ✅ 时间规划确认
5. ✅ 沟通方式确认
