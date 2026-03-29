# Open Elf 快速部署指南

## 📋 前置检查清单

在开始之前，请确保你已准备好：

- [ ] GitHub 仓库（代码已推送）
- [ ] Vercel 账号
- [ ] Railway 账号
- [ ] 域名 `openelfai.com`

---

## 🚀 第 1 步：部署数据库（Railway）

### 1.1 创建项目
1. 访问 [Railway](https://railway.app/) 并登录
2. 点击 **"New Project"** → **"Empty Project"**
3. 命名为 `open-elf`

### 1.2 添加 PostgreSQL
1. 点击 **"+ New"** → **"Database"** → **"PostgreSQL"**
2. 等待 1-2 分钟，数据库创建完成
3. 点击 PostgreSQL 服务 → **"Variables"**
4. **复制 `DATABASE_URL` 的值并保存**

---

## 🚀 第 2 步：部署后端（Railway）

### 2.1 添加后端服务
1. 回到 `open-elf` 项目
2. 点击 **"+ New"** → **"GitHub Repo"**
3. 授权并选择你的 Open Elf 仓库

### 2.2 配置服务
点击刚创建的服务，进入 **"Settings"**：

#### Build 设置
- **Root Directory**: `apps/api`
- **Build Command**: `cd ../.. && npm ci && cd apps/api && npm run build`
- **Start Command**: `cd apps/api && npm run start:prod`

#### 环境变量（Variables）
点击 **"Variables"**，添加：

```env
PORT=3000
NODE_ENV=production
DATABASE_URL=（从 PostgreSQL 复制）
JWT_SECRET=（生成强密码，见下方）
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=（生成另一个强密码）
JWT_REFRESH_EXPIRES_IN=30d
CORS_ORIGIN=https://openelfai.com,https://www.openelfai.com
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

**生成 JWT 密钥**：
- 在线生成：[密码生成器](https://passwordsgenerator.net/)
- 或本地运行：`node generate-keys.js`

### 2.3 运行数据库迁移
有两种方式：

**方式 A（推荐）**：
1. 临时修改 **Start Command** 为：
   ```bash
   bash -c "cd ../../packages/shared && npx prisma migrate deploy && cd ../../apps/api && npm run start:prod"
   ```
2. 点击 **"Deploy"** 重新部署
3. 成功后改回原来的启动命令

**方式 B**：
- 本地连接远程数据库运行迁移（详见完整指南）

### 2.4 获取后端 URL
部署成功后，Railway 会给你一个 URL，类似：
```
https://open-elf-api-production.up.railway.app
```
**保存这个 URL！**

---

## 🚀 第 3 步：部署前端（Vercel）

### 3.1 导入项目
1. 访问 [Vercel](https://vercel.com/) 并登录
2. 点击 **"Add New..."** → **"Project"**
3. 选择你的 GitHub 仓库 → **"Import"**

### 3.2 配置项目
- **Project Name**: `open-elf-web`
- **Framework Preset**: `Vite`
- **Root Directory**: `apps/web`

### 3.3 环境变量
在 **Environment Variables** 部分添加：

```env
VITE_API_BASE_URL=https://open-elf-api-production.up.railway.app
VITE_API_TIMEOUT=10000
VITE_ENABLE_MOCK=false
```

**注意**：`VITE_API_BASE_URL` 替换为你的 Railway 后端 URL

### 3.4 部署
点击 **"Deploy"**，等待 1-3 分钟

---

## 🌐 第 4 步：配置域名

### 4.1 在 Vercel 中添加域名
1. 进入 Vercel 项目 → **"Settings"** → **"Domains"**
2. 输入 `openelfai.com` → **"Add"**
3. 选择添加 `www` 重定向

### 4.2 配置 DNS
Vercel 会告诉你需要配置的 DNS 记录：
- **A 记录**：`@` → `76.76.21.21`
- **CNAME 记录**：`www` → `cname.vercel-dns.com`

在你的域名注册商（如阿里云、腾讯云、Namecheap 等）处添加这些记录。

### 4.3 等待生效
DNS 生效需要几分钟到几小时，可以用 [DNS Checker](https://dnschecker.org/) 检查。

### 4.4 更新后端 CORS
DNS 生效后，回到 Railway 后端的环境变量，确保：
```env
CORS_ORIGIN=https://openelfai.com,https://www.openelfai.com
```
然后重新部署后端。

---

## ✅ 验证部署

1. **访问**：`https://openelfai.com`
2. **测试功能**：注册、登录、创建智能体、对话
3. **检查日志**：Railway 后端日志、浏览器开发者工具

---

## 📚 详细文档

遇到问题？查看完整部署指南：
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## 🎉 完成！

恭喜！你的 Open Elf 应用已成功部署到 `openelfai.com`！

---

## 💡 提示

- **更新代码**：推送到 GitHub main 分支，Vercel 和 Railway 会自动重新部署
- **查看日志**：Railway 和 Vercel 都有详细的部署日志
- **环境变量**：修改环境变量后需要重新部署才会生效
