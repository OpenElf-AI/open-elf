# 🚀 性能优化配置指南

本文档详细说明如何配置应用以支持10万级并发。

---

## 📋 已完成的开发

### 1. ✅ Redis 缓存层
**文件位置**: `apps/api/src/common/cache/`
- `cache.module.ts` - 缓存模块
- `cache.service.ts` - 缓存服务（包含CacheKeys常量）

### 2. ✅ Prisma 连接池优化
**文件位置**: `apps/api/src/common/prisma/prisma.service.ts`
- 添加了日志配置
- 生产环境只记录错误日志
- 开发环境记录所有查询

### 3. ✅ 限流保护模块
**文件位置**: `apps/api/src/common/throttle/`
- `throttle.module.ts` - 限流模块
- 默认配置：每分钟100次请求

### 4. ✅ 性能监控模块
**文件位置**: `apps/api/src/common/metrics/`
- `metrics.service.ts` - 指标服务
- `metrics.interceptor.ts` - 指标拦截器
- `metrics.controller.ts` - 指标API控制器
- `metrics.module.ts` - 指标模块

### 5. ✅ 前端 React Query 优化
**文件位置**: `apps/web/src/main.tsx`
- 优化了查询配置
- 添加了重试机制
- 优化了缓存时间

### 6. ✅ 环境变量配置
**文件位置**: `apps/api/.env.example`
- 添加了Redis配置
- 添加了限流配置

---

## 🔧 需要您配置的内容

### 一、Redis 服务配置 ⭐⭐⭐

#### 1. 安装 Redis

**macOS (使用 Homebrew)**:
```bash
# 安装 Redis
brew install redis

# 启动 Redis 服务
brew services start redis

# 验证安装
redis-cli ping
# 应该返回: PONG
```

**Linux (Ubuntu/Debian)**:
```bash
# 安装 Redis
sudo apt update
sudo apt install redis-server

# 启动 Redis
sudo systemctl start redis
sudo systemctl enable redis

# 验证安装
redis-cli ping
```

**Docker (推荐)**:
```bash
# 拉取 Redis 镜像
docker pull redis:7-alpine

# 运行 Redis 容器
docker run -d \
  --name open-elf-redis \
  -p 6379:6379 \
  --restart unless-stopped \
  redis:7-alpine

# 验证容器运行
docker ps
```

#### 2. 配置 .env 文件

复制环境变量示例文件并配置：

```bash
cd apps/api
cp .env.example .env
```

编辑 `.env` 文件，配置以下内容：

```env
# Redis Cache
REDIS_HOST=localhost          # Redis 主机地址
REDIS_PORT=6379             # Redis 端口
REDIS_PASSWORD=              # Redis 密码（如果有）
REDIS_DB=0                   # Redis 数据库编号
CACHE_TTL=300                # 默认缓存时间（秒）

# Rate Limiting
THROTTLE_TTL=60000          # 限流时间窗口（毫秒）
THROTTLE_LIMIT=100           # 限流请求数
```

#### 3. 测试 Redis 连接

启动应用后，访问健康检查端点验证：

```bash
curl http://localhost:3000/health
```

---

### 二、PostgreSQL 数据库优化 ⭐⭐⭐

#### 1. PostgreSQL 配置优化

编辑 PostgreSQL 配置文件（`postgresql.conf`）：

```conf
# 连接池配置
max_connections = 200

# 内存配置（根据服务器内存调整）
shared_buffers = 4GB              # 系统内存的 25%
effective_cache_size = 12GB        # 系统内存的 75%
maintenance_work_mem = 1GB
work_mem = 64MB

# WAL 配置
min_wal_size = 1GB
max_wal_size = 4GB
wal_buffers = 16MB

# 查询优化
random_page_cost = 1.1
effective_io_concurrency = 200
checkpoint_completion_target = 0.9
default_statistics_target = 100
```

重启 PostgreSQL 使配置生效：

```bash
# macOS
brew services restart postgresql

# Linux
sudo systemctl restart postgresql

# Docker
docker restart <postgres-container-name>
```

#### 2. 数据库索引检查

当前 schema 已包含必要索引，但可以根据查询模式添加更多索引。

查看现有索引：
```sql
-- 连接到数据库
psql -U postgres -d open_elf

-- 查看所有索引
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

---

### 三、应用配置

#### 1. 安装新依赖

我已经为您安装了依赖，如果需要重新安装：

```bash
cd apps/api
npm install
```

新安装的依赖：
- `@nestjs/cache-manager` - NestJS 缓存模块
- `cache-manager` - 缓存管理器
- `cache-manager-redis-yet` - Redis 存储适配器
- `@nestjs/throttler` - 限流模块

#### 2. 启动应用

**开发环境**:
```bash
# 确保 Redis 和 PostgreSQL 正在运行

# 启动后端
cd apps/api
npm run dev

# 启动前端（新终端）
cd apps/web
npm run dev
```

**生产环境**:
```bash
# 构建应用
cd /Users/jinglingclaw/Documents/Open
npm run build

# 启动后端
cd apps/api
npm run start:prod
```

---

### 四、监控和调试

#### 1. 查看性能指标

应用启动后，可以访问以下端点：

```bash
# 查看性能指标
curl http://localhost:3000/metrics

# 重置指标
curl -X POST http://localhost:3000/metrics/reset

# 健康检查
curl http://localhost:3000/health
```

指标数据包含：
- `uptime` - 服务运行时间
- `totalRequests` - 总请求数
- `requestsPerMinute` - 每分钟请求数
- `requestsPerHour` - 每小时请求数
- `errorRate` - 错误率
- `avgDuration` - 平均响应时间
- `p95Duration` - P95 响应时间
- `p99Duration` - P99 响应时间

#### 2. Redis 监控

```bash
# 连接 Redis CLI
redis-cli

# 查看信息
INFO

# 查看慢查询
SLOWLOG GET 10

# 查看内存使用
INFO memory

# 清空所有缓存（谨慎使用）
FLUSHDB
```

---

## 🎯 性能目标

| 指标 | 目标值 | 当前状态 |
|------|--------|----------|
| QPS | 100,000+ | 需要压力测试 |
| P99 响应时间 | < 200ms | 需要压力测试 |
| 错误率 | < 0.1% | 需要压力测试 |
| Redis 命中率 | > 95% | 需要监控 |
| 可用性 | 99.99% | 需要架构升级 |

---

## 📊 下一步建议

### 短期优化（1-2周）
1. ✅ 已完成 - 基础缓存和限流
2. 压力测试（使用 k6 或 Artillery）
3. 数据库查询优化
4. 图片 CDN 配置

### 中期优化（2-4周）
1. 消息队列（BullMQ 或 RabbitMQ）
2. 读写分离
3. 容器化部署（Docker）
4. 负载均衡（Nginx）

### 长期优化（1-3月）
1. Kubernetes 集群
2. 微服务架构
3. 异地多活
4. 自动化扩缩容

---

## 🔍 常见问题

### Q: Redis 连接失败怎么办？
A: 
1. 确认 Redis 服务正在运行：`redis-cli ping`
2. 检查端口是否正确：默认 6379
3. 检查防火墙设置
4. 查看应用日志获取详细错误信息

### Q: 如何查看缓存是否生效？
A:
1. 查看应用日志（开发环境会记录缓存操作）
2. 使用 `redis-cli monitor` 实时查看 Redis 操作
3. 对比查询响应时间

### Q: 限流太严格怎么办？
A:
修改 `.env` 文件中的限流配置：
```env
THROTTLE_TTL=60000    # 时间窗口（毫秒）
THROTTLE_LIMIT=200     # 请求数（增加此值）
```

### Q: 如何清空所有缓存？
A:
```bash
# 方法1: 使用 Redis CLI
redis-cli FLUSHDB

# 方法2: 使用 API
curl -X POST http://localhost:3000/metrics/reset
```

---

## 📞 需要帮助？

如果您在配置过程中遇到问题，请检查：
1. 所有依赖是否正确安装
2. 环境变量是否正确配置
3. Redis 和 PostgreSQL 服务是否正常运行
4. 应用日志中的错误信息

祝您配置顺利！🚀
