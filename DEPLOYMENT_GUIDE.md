# Open Elf 部署指南 - Vercel + Railway

## 概述

本指南将指导你使用 Vercel（前端）+ Railway（后端+数据库）快速部署 Open Elf 项目。

**域名**: openelfai.com

## 目录

1. [前期准备](#前期准备)
2. [数据库部署（Railway）](#数据库部署railway)
3. [后端部署（Railway）](#后端部署railway)
4. [前端部署（Vercel）](#前端部署vercel)
5. [域名配置](#域名配置)
6. [验证部署](#验证部署)

---

## 前期准备

### 1. 注册账号

- [Vercel 注册](https://vercel.com/signup)
- [Railway 注册](https://railway.app/)

### 2. 准备 GitHub 仓库

确保你的代码已经推送到 GitHub 仓库。

---

## 数据库部署（Railway）

### 步骤 1: 创建 Railway 项目

1. 登录 [Railway](https://railway.app/)
2. 点击 **"New Project"**
3. 选择 **"Empty Project"**
4. 项目名称：`open-elf`

### 步骤 2: 添加 PostgreSQL 数据库

1. 在项目页面，点击 **"+ New"** → **"Database"**
2. 选择 **"PostgreSQL"**
3. 等待数据库创建完成（约 1-2 分钟）

### 步骤 3: 获取数据库连接字符串

1. 点击 PostgreSQL 服务
2. 进入 **"Variables"** 标签页
3. 复制 `DATABASE_URL` 的值，格式类似：
   ```
   postgresql://postgres:xxxxx@xxx.railway.app:xxx/railway
   ```

**保存这个 DATABASE_URL，后面会用到！**

---

## 后端部署（Railway）

### 步骤 1: 准备后端配置

首先，让我查看一下是否需要调整配置文件。

### 步骤 2: 在 Railway 中添加后端服务

1. 回到 `open-elf` 项目
2. 点击 **"+ New"** → **"GitHub Repo"**
3. 授权 Railway 访问你的 GitHub 仓库
4. 选择你的 Open Elf 仓库

### 步骤 3: 配置后端服务

Railway 会自动检测，但我们需要手动配置：

#### 3.1 设置构建和启动命令

1. 点击刚创建的服务
2. 进入 **"Settings"** 标签页
3. 找到 **"Build"** 部分：
   - **Root Directory**: `apps/api`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`

#### 3.2 配置环境变量

进入 **"Variables"** 标签页，添加以下环境变量：

```env
# 基础配置
PORT=3000
NODE_ENV=production

# 数据库（从 Railway PostgreSQL 复制）
DATABASE_URL=postgresql://postgres:xxxxx@xxx.railway.app:xxx/railway

# JWT 密钥（生成强密码）
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-xxxxxx
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-xxxxxx
JWT_REFRESH_EXPIRES_IN=30d

# CORS（前端域名）
CORS_ORIGIN=https://openelfai.com,https://www.openelfai.com

# Redis（可选，先不配置）
# REDIS_HOST=
# REDIS_PORT=
# REDIS_PASSWORD=
# REDIS_DB=0
# CACHE_TTL=300

# 限流
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

**重要说明**：
- `DATABASE_URL`: 从 Railway PostgreSQL 复制
- `JWT_SECRET` 和 `JWT_REFRESH_SECRET`: 使用强随机字符串，可以用 `openssl rand -hex 32` 生成
- `CORS_ORIGIN`: 替换为你的实际域名

#### 3.3 生成 JWT 密钥（可选）

如果你有终端，可以运行：
```bash
openssl rand -hex 32
```

或者在线生成：[密码生成器](https://passwordsgenerator.net/)

### 步骤 4: 配置数据库迁移

Railway 部署后，我们需要运行数据库迁移。有两种方式：

#### 方式 A: 在 Railway 中运行（推荐）

1. 进入后端服务的 **"Settings"** → **"Deploy"**
2. 找到 **"Start Command"**，临时修改为：
   ```bash
   bash -c "cd ../../packages/shared && npx prisma migrate deploy && cd ../../apps/api && npm run start:prod"
   ```
3. 重新部署
4. 部署成功后，改回原来的启动命令：`npm run start:prod`

#### 方式 B: 本地连接远程数据库运行

在本地项目根目录创建 `.env.production`：
```env
DATABASE_URL=你的_railway_database_url
```

然后运行：
```bash
cd packages/shared
npx prisma migrate deploy
```

### 步骤 5: 部署并测试

1. 点击 **"Deploy"** 按钮
2. 等待部署完成（约 2-5 分钟）
3. 部署成功后，Railway 会给你一个域名，类似：
   ```
   https://open-elf-api-production.up.railway.app
   ```

**保存这个后端 URL，后面配置前端会用到！**

测试后端是否正常：
访问 `https://你的-backend-url/health` 或查看 Swagger 文档 `https://你的-backend-url/api`

---

## 前端部署（Vercel）

### 步骤 1: 导入项目到 Vercel

1. 登录 [Vercel](https://vercel.com/)
2. 点击 **"Add New..."** → **"Project"**
3. 选择你的 GitHub 仓库
4. 点击 **"Import"**

### 步骤 2: 配置项目设置

在 **"Configure Project"** 页面：

#### 2.1 基本设置

- **Project Name**: `open-elf-web`
- **Framework Preset**: `Vite`
- **Root Directory**: `apps/web`

#### 2.2 构建和输出设置

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### 2.3 环境变量配置

在 **"Environment Variables"** 部分，添加：

```env
# API 基础 URL（Railway 后端地址）
VITE_API_BASE_URL=https://open-elf-api-production.up.railway.app

# API 超时时间
VITE_API_TIMEOUT=10000

# 关闭 Mock API
VITE_ENABLE_MOCK=false
```

**重要**：
- `VITE_API_BASE_URL` 替换为你的 Railway 后端 URL
- 确保 `VITE_ENABLE_MOCK=false`

### 步骤 3: 部署

1. 点击 **"Deploy"** 按钮
2. 等待部署完成（约 1-3 分钟）
3. 部署成功后，Vercel 会给你一个临时域名，类似：
   ```
   https://open-elf-web.vercel.app
   ```

---

## 域名配置

### 步骤 1: 在 Vercel 中添加自定义域名

1. 进入 Vercel 项目的 **"Settings"** → **"Domains"**
2. 输入你的域名：`openelfai.com`
3. 点击 **"Add"**
4. Vercel 会提示你添加 `www` 重定向，选择 **"Yes, add www"**

### 步骤 2: 配置 DNS 解析

Vercel 会给你提供 DNS 记录，你需要在域名注册商处配置：

#### 记录 1: 主域名
```
类型: A
主机: @
值: 76.76.21.21
```

#### 记录 2: www 域名
```
类型: CNAME
主机: www
值: cname.vercel-dns.com
```

或者，Vercel 也可能提供 Nameservers 方式，按 Vercel 提示操作即可。

### 步骤 3: 等待 DNS 生效

DNS 生效通常需要几分钟到几小时不等。

你可以使用以下工具检查：
- [DNS Checker](https://dnschecker.org/)
- 终端命令：`dig openelfai.com`

### 步骤 4: 更新后端 CORS 配置

DNS 生效后，回到 Railway 后端服务的环境变量，更新 `CORS_ORIGIN`：

```env
CORS_ORIGIN=https://openelfai.com,https://www.openelfai.com
```

然后重新部署后端。

---

## 验证部署

### 1. 访问前端

打开浏览器访问：`https://openelfai.com`

### 2. 测试功能

- 注册/登录
- 创建智能体
- 对话功能
- 其他核心功能

### 3. 检查后端日志

在 Railway 中查看后端服务的日志，确保没有错误。

### 4. 检查前端日志

在浏览器开发者工具中查看 Console 和 Network，确保 API 请求正常。

---

## 常见问题

### Q: 部署失败怎么办？
A: 查看部署日志，根据错误信息排查。常见问题：
- 环境变量配置错误
- 数据库连接失败
- 依赖安装失败

### Q: API 请求 404？
A: 检查 `VITE_API_BASE_URL` 是否正确配置。

### Q: CORS 错误？
A: 检查后端 `CORS_ORIGIN` 环境变量是否包含前端域名。

### Q: 数据库迁移失败？
A: 确保 `DATABASE_URL` 正确，且数据库可访问。

### Q: 如何更新部署？
A: 推送到 GitHub 的 main 分支，Vercel 和 Railway 会自动重新部署。

---

## 后续优化建议

1. **HTTPS**: Vercel 和 Railway 都自动提供 HTTPS，无需额外配置
2. **CDN**: Vercel 已内置 CDN 加速
3. **监控**: 添加 Sentry 错误监控
4. **分析**: 添加 Google Analytics
5. **备份**: 配置数据库定期备份
6. **Redis**: 添加 Redis 缓存提升性能

---

## 技术支持

如遇问题，请查看：
- [Vercel 文档](https://vercel.com/docs)
- [Railway 文档](https://docs.railway.app/)
- 项目 README 和其他文档

祝你部署顺利！🚀
