# Open Elf - AI智能对话助手

类似 Open Elf 的 AI 智能体创作和交易平台，支持多端部署。

## 📋 功能特性

### 1. 对话页面
- 展示多个 AI 智能体卡片
- 智能体搜索功能
- 点击智能体开始对话

### 2. 发现页面
- 探索更多智能体（预留功能）

### 3. 通知页面
- 全部、系统、互动通知分类
- 未读消息标识
- 全部已读功能

### 4. 我的页面
#### 未登录状态
- 登录入口
- 功能入口预览

#### 已登录状态（创作者中心）
- 数据看板：已发行智能体数量、总销量、累计收益
- 快捷操作：创建智能体、数据报表、素材管理
- 我发行的智能体管理
- 创作者提示信息

### 5. 登录系统
- 手机号+验证码登录
- 用户协议和隐私政策

## 🛠️ 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **React Context API** - 状态管理
- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **Commitlint** - 提交信息规范
- **Husky** - Git hooks

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

### 代码检查和格式化

```bash
# 运行 ESLint 检查
npm run lint

# 自动修复 ESLint 问题
npm run lint:fix

# 格式化代码
npm run format

# 检查格式
npm run format:check

# TypeScript 类型检查
npm run typecheck
```

## 📁 项目结构

```
open-elf/
├── public/                  # 静态资源
├── docs/                    # 文档
│   └── ARCHITECTURE.md     # 多端架构规划
├── src/
│   ├── api/                 # API 请求封装
│   ├── assets/              # 图片、图标、样式文件
│   ├── components/          # 公共 UI 组件
│   │   ├── BottomNav.tsx    # 底部导航栏
│   │   └── LoginModal.tsx   # 登录弹窗
│   ├── features/            # 业务模块
│   │   ├── chat/
│   │   ├── creator/
│   │   ├── discovery/
│   │   ├── notifications/
│   │   └── profile/
│   ├── hooks/               # 自定义 React Hooks
│   ├── pages/               # 页面级组件
│   │   ├── ChatPage.tsx
│   │   ├── DiscoverPage.tsx
│   │   ├── NotificationsPage.tsx
│   │   └── ProfilePage.tsx
│   ├── store/               # 状态管理
│   │   └── AppContext.tsx
│   ├── types/               # TypeScript 类型定义
│   │   ├── agent.ts
│   │   ├── notification.ts
│   │   ├── user.ts
│   │   └── index.ts
│   ├── utils/               # 工具函数
│   │   ├── mockData.ts
│   │   └── index.ts
│   ├── App.tsx              # 根组件
│   ├── main.tsx             # 入口文件
│   └── index.css            # 全局样式
├── .eslintrc.cjs            # ESLint 配置
├── .prettierrc              # Prettier 配置
├── commitlint.config.cjs    # Commitlint 配置
├── .gitignore               # Git 忽略文件
├── tsconfig.json            # TypeScript 配置
├── vite.config.ts           # Vite 配置
└── package.json
```

## 📝 Git 规范

### 分支管理

- `main`: 生产环境代码（只接受合并，不直接提交）
- `develop`: 开发环境主分支
- `feature/*`: 功能开发分支
- `hotfix/*`: 线上紧急修复分支

### 提交信息规范

使用 Conventional Commits 规范：

```bash
feat(chat): 添加智能体搜索功能
fix(auth): 修复登录态丢失问题
refactor(creator): 重构智能体创建流程
docs: 更新架构文档
```

## 🌐 多端规划

详细的多端架构规划请参考 [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)。

| 端类型 | 技术方案 | 复用程度 |
|--------|----------|----------|
| 网页端 | React + TypeScript + Vite | 核心业务逻辑、组件 |
| 小程序 | Taro / UniApp | 复用 React 语法和业务逻辑 |
| 移动端 (Android/iOS) | React Native / Expo | 复用 80%+ 业务代码和 UI 组件 |
| 后端服务 | Node.js + Express/NestJS | 统一 API 接口 |

## 🎨 设计特点

- 移动端优先设计
- 深色主题
- 响应式布局
- 流畅的交互体验

## 📄 许可证

MIT
