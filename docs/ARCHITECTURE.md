# Open Elf 多端架构规划

## 项目概述

Open Elf 是一个 AI 智能体创作和交易平台，支持多端部署（网页、小程序、移动端）。

## 技术栈选型

| 端类型 | 技术方案 | 复用程度 |
|--------|----------|----------|
| 网页端 | React + TypeScript + Vite | 核心业务逻辑、组件 |
| 小程序 | Taro / UniApp | 复用 React 语法和业务逻辑 |
| 移动端 (Android/iOS) | React Native / Expo | 复用 80%+ 业务代码和 UI 组件 |
| 后端服务 | Node.js + Express/NestJS | 统一 API 接口 |

## 目录结构

```
open-elf/
├── public/                  # 静态资源
├── docs/                    # 文档
│   ├── ARCHITECTURE.md     # 架构文档
│   └── DEPLOYMENT.md       # 部署文档
├── src/
│   ├── api/                 # API 请求封装
│   │   ├── index.ts         # API 客户端
│   │   ├── agents.ts        # 智能体相关 API
│   │   ├── auth.ts          # 认证相关 API
│   │   └── user.ts          # 用户相关 API
│   ├── assets/              # 图片、图标、样式文件
│   │   ├── images/
│   │   ├── icons/
│   │   └── styles/
│   ├── components/          # 公共 UI 组件
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Modal/
│   │   ├── Input/
│   │   └── index.ts
│   ├── features/            # 业务模块
│   │   ├── chat/            # 对话模块
│   │   ├── creator/         # 创作者中心
│   │   ├── discovery/       # 发现模块
│   │   ├── notifications/   # 通知模块
│   │   └── profile/         # 个人中心
│   ├── hooks/               # 自定义 React Hooks
│   │   ├── useAuth.ts
│   │   ├── useAgents.ts
│   │   └── index.ts
│   ├── pages/               # 页面级组件
│   │   ├── ChatPage.tsx
│   │   ├── DiscoverPage.tsx
│   │   ├── NotificationsPage.tsx
│   │   └── ProfilePage.tsx
│   ├── store/               # 状态管理 (Context/Zustand)
│   │   ├── AppContext.tsx
│   │   └── index.ts
│   ├── types/               # TypeScript 类型定义
│   │   ├── agent.ts
│   │   ├── user.ts
│   │   ├── notification.ts
│   │   └── index.ts
│   ├── utils/               # 工具函数
│   │   ├── mockData.ts
│   │   ├── format.ts
│   │   ├── storage.ts
│   │   └── index.ts
│   ├── App.tsx              # 根组件
│   └── main.tsx             # 入口文件
├── .eslintrc.cjs            # ESLint 配置
├── .prettierrc              # Prettier 配置
├── commitlint.config.cjs    # Commitlint 配置
├── tsconfig.json            # TypeScript 配置
├── vite.config.ts           # Vite 配置
└── package.json
```

## Git 分支管理策略

### 分支类型

| 分支名 | 用途 | 说明 |
|--------|------|------|
| `main` | 生产环境 | 只接受合并，不直接提交 |
| `develop` | 开发环境 | 开发主分支，功能开发完成后合并到这里 |
| `feature/*` | 功能开发 | 从 `develop` 分支创建，开发完成后合并回 `develop` |
| `hotfix/*` | 线上紧急修复 | 从 `main` 分支创建，修复后同时合并到 `main` 和 `develop` |
| `release/*` | 发布准备 | 从 `develop` 分支创建，用于发布前的测试和修复 |

### 提交信息规范 (Conventional Commits)

格式：`<type>(<scope>): <subject>`

**Type 类型：**

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关
- `revert`: 回滚提交
- `build`: 构建系统相关
- `ci`: CI/CD 相关

**示例：**

```bash
feat(chat): 添加智能体搜索功能
fix(auth): 修复登录态丢失问题
refactor(creator): 重构智能体创建流程
docs: 更新架构文档
```

## 多端适配规划

### 1. 网页端 (Web)

**技术栈：** React + TypeScript + Vite + Tailwind CSS

**部署平台：** Vercel / Netlify / 阿里云 / 腾讯云

**构建命令：**
```bash
npm run build
```

**输出目录：** `dist/`

### 2. 小程序端 (Mini Program)

**技术方案：** Taro 3.x

**支持平台：** 微信小程序、支付宝小程序、抖音小程序、百度小程序

**迁移步骤：**
1. 安装 Taro CLI
2. 创建 Taro 项目
3. 迁移 React 组件到 Taro 组件
4. 适配小程序 API
5. 配置各平台编译

**代码复用：** 业务逻辑、类型定义、工具函数可 100% 复用

### 3. 移动端 (Mobile)

**技术方案：** React Native / Expo

**支持平台：** Android、iOS

**迁移步骤：**
1. 初始化 Expo 项目
2. 复用业务逻辑和类型定义
3. 使用 React Native 组件替代 Web 组件
4. 配置原生模块（如需要）
5. 打包发布

**代码复用：** 约 80%+ 的业务代码可复用

### 4. 后端服务 (Backend)

**技术方案：** Node.js + NestJS / Express

**API 设计原则：**
- RESTful API 设计
- 统一响应格式
- JWT 认证
- 接口版本管理

**响应格式：**
```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

## 上线运营准备

### 1. 埋点统计

| 工具 | 用途 |
|------|------|
| 百度统计 | 页面访问统计 |
| 神策数据 | 用户行为分析 |
| 友盟 | 多端数据统计 |

### 2. 错误监控

| 工具 | 用途 |
|------|------|
| Sentry | 错误捕获和追踪 |
| LogRocket | 会话回放 |

### 3. 性能优化

- 使用 Lighthouse 分析性能
- 代码分割和懒加载
- 图片优化和 CDN
- 缓存策略

### 4. 安全加固

- HTTPS 加密
- XSS 防护
- CSRF 防护
- SQL 注入防护
- 敏感数据加密

## 部署流程

### 网页端部署

1. 执行 `npm run build` 生成构建产物
2. 上传 `dist/` 目录到服务器
3. 配置 Nginx / CDN
4. 配置域名和 HTTPS

### 小程序发布

1. 使用 Taro 编译对应平台代码
2. 在开发者工具中预览和测试
3. 提交平台审核
4. 审核通过后发布

### 移动端发布

**Android:**
1. 生成签名 APK/AAB
2. 上传到 Google Play / 应用宝 / 华为应用市场
3. 填写应用信息
4. 提交审核

**iOS:**
1. 配置开发者账号和证书
2. 打包生成 IPA
3. 上传到 App Store Connect
4. 填写应用信息
5. 提交审核

## 后续扩展规划

- [ ] PWA 支持
- [ ] 国际化 (i18n)
- [ ] 暗黑模式完善
- [ ] 单元测试和 E2E 测试
- [ ] CI/CD 自动化流水线
- [ ] 微前端架构
- [ ] 离线支持
