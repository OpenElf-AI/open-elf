# 部署指南

本文档介绍 Open Elf 项目的部署流程和配置方法。

## 目录

- [环境要求](#环境要求)
- [构建项目](#构建项目)
- [部署到 GitHub Pages](#部署到-github-pages)
- [部署到静态托管](#部署到静态托管)
- [环境变量](#环境变量)
- [性能优化](#性能优化)

## 环境要求

- Node.js 18+ 
- npm 9+ 或 yarn 1.22+ 或 pnpm 8+

## 构建项目

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173 查看应用。

### 生产构建

```bash
npm run build
```

构建产物将输出到 `dist/` 目录。

### 预览构建

```bash
npm run preview
```

## 部署到 GitHub Pages

### 1. 配置仓库

在仓库设置中启用 GitHub Pages：

1. 进入仓库 Settings
2. 找到 Pages 部分
3. 在 Build and deployment 下：
   - Source: Deploy from a branch
   - Branch: gh-pages / (root)

### 2. 使用 GitHub Actions 自动部署

项目已配置 GitHub Actions 工作流（`.github/workflows/deploy.yml`），会在推送到 main 分支时自动构建和部署。

### 3. 手动部署

```bash
npm run build

# 使用 gh-pages 工具
npm install -g gh-pages
gh-pages -d dist
```

## 部署到静态托管

### Vercel

1. 访问 [Vercel](https://vercel.com)
2. 导入 Git 仓库
3. 配置构建命令：`npm run build`
4. 配置输出目录：`dist`
5. 点击部署

### Netlify

1. 访问 [Netlify](https://netlify.com)
2. 导入 Git 仓库
3. 配置构建命令：`npm run build`
4. 配置发布目录：`dist`
5. 点击部署

### 阿里云 OSS / 腾讯云 COS

1. 构建项目：`npm run build`
2. 将 `dist/` 目录内容上传到 OSS/COS
3. 配置静态网站托管
4. 配置 CDN 加速

### Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/css application/javascript application/json;
}
```

## 环境变量

创建 `.env` 文件配置环境变量：

```env
# API 基础 URL
VITE_API_BASE_URL=https://api.your-domain.com

# 应用名称
VITE_APP_NAME=Open Elf

# 其他配置...
```

注意：环境变量必须以 `VITE_` 开头才能在客户端代码中访问。

## 性能优化

### 1. 代码分割

Vite 已自动配置代码分割，按需加载路由和组件。

### 2. 图片优化

- 使用 WebP 格式
- 配置响应式图片
- 使用 CDN 加速

### 3. 缓存策略

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location ~* \.html$ {
    expires -1;
    add_header Cache-Control "no-cache";
}
```

### 4. 构建分析

```bash
npm run build -- --report
```

## 安全建议

1. 使用 HTTPS
2. 配置 Content Security Policy (CSP)
3. 启用 XSS 防护
4. 定期更新依赖

## 监控和日志

- 使用 Sentry 进行错误监控
- 使用 Google Analytics / 百度统计进行数据分析
- 配置性能监控

## 常见问题

### 路由刷新 404

确保服务器配置了 SPA 回退路由，所有请求都返回 `index.html`。

### 环境变量不生效

- 确保变量以 `VITE_` 开头
- 重启开发服务器
- 重新构建生产版本

### 构建体积过大

- 分析依赖树
- 移除未使用的代码
- 使用动态导入
