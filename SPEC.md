# 智能体平台技术规范 (SPEC.md)

## 项目概述

本项目是一个专注于智能体发展的平台，诞生于智能体初时代。核心愿景是让用户可以通过能力包"养"自己的智能体，实现个性化定制、自主进化和多智能体协作。

---

## 1. 业务逻辑规范

### 1.1 智能体所有权与流转

#### 1.1.1 转赠功能
- **模式**: 简单转赠
- **触发条件**: 单方操作即可转赠，无需接收方确认，无冷却期
- **约束**: 平台只提供转赠功能，线下交易与平台无关
- **数据处理**: 
  - 转赠后智能体的等级、经验、粉丝数等数据完整转移
  - 转赠历史记录需要展示给用户
  - 对话历史是否转移待定（建议不转移，保护用户隐私）

#### 1.1.2 能力包绑定机制
- **绑定效果**: 混合机制
  - Prompt增强：通过system prompt修改智能体行为
  - 功能扩展：给智能体增加新的功能接口和能力
- **绑定规则**:
  - 能力包一旦绑定某个智能体，便不可再转赠交易
  - 直接融入智能体内，相当于智能体永久拥有此项能力
  - 能力包消耗，总量减少，创造稀缺性
- **绑定数量**: 待确认（建议3-5个起步，根据等级解锁更多）
- **有效期**: 永久生效，无使用期限

### 1.2 智能体"养起来"机制

#### 1.2.1 等级与经验值
- **用途**: 双向成长
  - 解锁功能：达到特定等级解锁新功能
  - 提升能力：等级提升让智能体的回答质量更好
- **经验获取**:
  - 对话时长
  - 对话质量
  - 用户反馈（点赞、评分）
- **可见性**: 可见的属性面板和成长轨迹
- **进化路径**: 个性化的进化路径，不同智能体可以有不同的专长

#### 1.2.2 数据持久化
- **对话历史**: 有限保存
  - 保存一定时间或数量的对话历史
  - 超出部分自动归档或删除
- **用户删除账号**:
  - 其拥有的智能体的处理策略待定
  - 建议选项：销毁、转为公共、允许指定继承人

### 1.3 多智能体协作

#### 1.3.1 协作模式
- **分工协作**: 根据智能体专长分工完成任务
- **接力对话**: 智能体按顺序接力完成对话任务
- **配置方式**: 待确认（手动选择、智能推荐或两者结合）
- **上下文共享**: 待确认（全量共享、部分共享或隔离）
- **计费与权益**: 待确认

### 1.4 经济模型

#### 1.4.1 定价机制
- **智能体定价**: 混合定价
  - 基础品类有指导价
  - 特殊品类自由定价
- **能力包定价**: 待确认（建议类似混合定价）
- **平台收入**: 交易服务费（比例待确认），其他收入来源待定
- **创作者结算**: 待确认（实时、周期或有门槛）

#### 1.4.2 市场机制
- **稀缺性**: 能力包总量减少创造稀缺性
- **价格波动**: 由市场供需决定
- **售罄处理**: 灵活处理，友好引导用户

---

## 2. 用户交互规范

### 2.1 对话体验

#### 2.1.1 流式响应
- **优先级**: 流式响应优先
- **UI方案**: 混合方案
  - 打字机效果：逐字显示
  - 分段显示：收到完整段落再显示
  - 根据内容类型灵活切换
- **中断恢复**: 待确认
- **降级策略**: 网络差时自动降级为非流式
- **错误处理**: 超时、网络中断等场景的友好提示

#### 2.1.2 消息加载
- **策略**: 混合方案
  - 分页加载
  - 无限滚动
  - 根据场景灵活选择
- **长对话**: 虚拟滚动或懒加载优化性能

#### 2.1.3 错误处理
- **发送失败**: 重试机制和友好的错误提示
- **网络状态**: 断开/恢复时的用户体验设计
- **边界情况**: 严格边界检查，灵活处理，友好引导

### 2.2 内容审核与安全

#### 2.2.1 审核机制
- **智能体上架**: 严格审核
- **智能体回答**: 待确认（实时审核或事后监管）
- **能力包内容**: 严格审核
- **违规处理**:
  - 警告
  - 限制功能
  - 封禁
  - 完整的处理流程

---

## 3. 前端技术规范

### 3.1 技术栈

#### 3.1.1 核心框架
- **React 18+**: 前端框架
- **TypeScript**: 类型安全
- **Vite**: 构建工具
- **Tailwind CSS**: 样式框架

#### 3.1.2 状态管理
- **Zustand**: 全局状态管理
  - 适用：用户信息、UI状态、配置等
- **React Query (TanStack Query)**: 服务端状态管理
  - 适用：API数据、缓存、乐观更新等
- **现有配置**:
  ```typescript
  staleTime: 5 * 60 * 1000,  // 5分钟
  gcTime: 10 * 60 * 1000,    // 10分钟
  ```
- **优化方向**: 适度优化，不同数据可以有不同的staleTime/gcTime

#### 3.1.3 路由与导航
- **现有方案**: Zustand + 自定义View类型
- **View类型定义**:
  ```typescript
  type MainPage = 'chat' | 'discover' | 'notifications' | 'profile' | 'create';
  type View = MainPage | { type: 'conversation'; id: string } | { type: 'agent'; id: string } | ...;
  ```

### 3.2 API交互规范

#### 3.2.1 API现状
- **状态**: 部分API实现中
- **优先策略**: 优先替换核心功能页面的mockApi
- **文档**: OpenAPI文档
- **版本管理**: 待确认

#### 3.2.2 核心Hooks
**useAgents.ts** - 智能体相关
```typescript
export const useAgents = (options?) => {...}
export const useAgent = (agentId: string) => {...}
export const useMyAgents = () => {...}
export const useFeaturedAgents = () => {...}
export const useSearchAgents = (query: string) => {...}
export const useFollowAgent = () => {...}
export const useUnfollowAgent = () => {...}
export const usePurchaseAgent = () => {...}
export const useAddAgentExp = () => {...}
export const useToggleShowcase = () => {...}
```

**useConversations.ts** - 对话相关
```typescript
export const useConversations = () => {...}
export const useConversation = (conversationId: string) => {...}
export const useCreateConversation = () => {...}
export const useDeleteConversation = () => {...}
export const useMessages = (conversationId: string) => {...}
export const useSendMessage = () => {...}
export const useGenerateReply = () => {...}
```

**useUser.ts** - 用户相关
```typescript
export const useCurrentUser = () => {...}
export const useUpdateUser = () => {...}
export const useSubmitVerification = () => {...}
export const useLogout = () => {...}
```

#### 3.2.3 Token管理
- **自动刷新**: 已实现
- **并发处理**: isRefreshing状态 + refreshSubscribers队列
- **存储**: localStorage存储access_token和refresh_token

### 3.3 页面组件规范

#### 3.3.1 核心页面
- **ChatPage**: 对话列表页 ✓ 使用真实API
- **DiscoverPage**: 广场页 ✓ 使用真实API + 发布按钮
- **ProfilePage**: 个人中心页 ✓ 使用真实API
- **AgentChatPage**: 智能体聊天页 ✓ 使用真实API
- **ConversationDetailPage**: 对话详情页 ✓ 使用真实API
- **AgentDetailPage**: 智能体详情页
- **CreateAgentPage**: 创建智能体页
- **其他页面**: 待逐步替换mockApi

#### 3.3.2 组件规范
- **智能体头像**: 使用agent.avatar，而非占位组件
- **加载状态**: SkeletonList组件
- **错误处理**: Toast组件 + ConfirmDialog组件

### 3.4 文件上传

#### 3.4.1 存储方案
- **待确认**: 阿里云OSS、腾讯云COS、AWS S3或其他
- **CDN**: 建议使用CDN加速静态资源

### 3.5 实时通信

#### 3.5.1 技术选型
- **待确认**: WebSocket、SSE或其他
- **用途**: 流式响应、实时通知等

---

## 4. 测试与质量保障

### 4.1 测试策略
- **优先级**: 全面测试
- **单元测试**: 覆盖范围待确认
- **E2E测试**: Cypress或Playwright，待确认
- **测试目标**: 核心功能测试优先

### 4.2 监控
- **错误监控**: Sentry或LogRocket，待确认
- **性能监控**: 待确认
- **用户行为分析**: 待确认

### 4.3 移动端适配
- **优先级**: 待确认
- **现有方案**: 响应式设计 + Tailwind CSS

---

## 5. 开发与发布

### 5.1 迭代周期
- **模式**: 稳健迭代
- **周期**: 每两周
- **里程碑**: 按功能里程碑发布

### 5.2 MVP功能清单
**核心功能（必须实现）**:
- ✓ 用户注册/登录
- ✓ 智能体浏览与搜索
- ✓ 智能体购买
- ✓ 智能体对话（流式响应优先）
- ✓ 我的智能体管理
- ✓ 创建智能体
- ☐ 能力包市场（简化版本）
- ☐ 能力包绑定
- ☐ 智能体转赠

**增强功能（后续迭代）**:
- 多智能体协作
- 智能体等级与经验展示
- 高级审核机制
- 完整的数据分析

### 5.3 技术债务
- **优先级最高的3个**: 待确认
- **建议**:
  1. 替换剩余页面的mockApi
  2. 实现流式响应
  3. 完善错误边界处理

### 5.4 发布策略
- **灰度发布**: 待确认
- **A/B测试**: 待确认
- **回滚机制**: 待确认

---

## 6. 架构与扩展性

### 6.1 前端架构
```
src/
├── api/              # API层
│   ├── client.ts     # API客户端（含token刷新）
│   ├── realApi.ts    # 真实API实现
│   ├── mockApi.ts    # Mock API实现
│   ├── types.ts      # 类型定义
│   └── index.ts      # API选择器
├── hooks/            # 自定义Hooks
│   ├── useAgents.ts
│   ├── useConversations.ts
│   └── useUser.ts
├── pages/            # 页面组件
├── components/       # 通用组件
├── store/            # 状态管理
│   ├── useAppStore.ts
│   └── useUserStore.ts
└── services/         # 业务服务
```

### 6.2 扩展性考虑
- **智能体进化**: 数据结构已预留level、exp、expToNextLevel等字段
- **能力包**: 已设计installedCapabilityPackageIds字段
- **多智能体协作**: 架构上支持扩展
- **个性化定制**: 类型定义已支持灵活扩展

---

## 7. 边界情况处理

### 7.1 关键边界场景
1. **智能体售罄**: 灵活处理，友好引导（推荐类似、等待通知等）
2. **重复购买**: 阻止购买，提示已拥有
3. **余额不足**: 引导充值
4. **网络断开**: 提示用户，恢复后自动重连
5. **支付中断**: 订单恢复机制
6. **违规内容**: 过滤、警告、中断对话
7. **用户封禁/注销**: 数据处理策略待定

---

## 8. 未来规划

### 8.1 短期（3个月）
1. 完善核心功能，替换所有mockApi
2. 实现流式响应
3. 能力包基础功能
4. 智能体等级经验系统
5. 完善的错误处理和用户反馈

### 8.2 中期（6个月）
1. 多智能体协作
2. 高级个性化定制
3. 完整的数据分析
4. 社区功能
5. 移动端优化

### 8.3 长期（1年）
1. 智能体自主进化
2. 完善的经济系统
3. 开发者生态
4. 核心竞争力确立
5. 平台规模化

---

## 附录

### A. 核心数据类型
```typescript
interface Agent {
  id: string;
  name: string;
  description: string;
  avatar: string;
  prompt: string;
  category: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  price: number;
  totalSupply: number;
  soldCount: number;
  level: number;
  exp: number;
  expToNextLevel: number;
  fans: number;
  installedCapabilityPackageIds?: string[];
  // ... 更多字段
}

interface CapabilityPackage {
  id: string;
  name: string;
  description: string;
  prompt: string;
  capabilities: string[];
  category: string;
  price: number;
  totalSupply: number;
  soldCount: number;
  // ... 更多字段
}

interface Conversation {
  id: string;
  agentId: string;
  agentName: string;
  agentAvatar: string;
  lastMessage: string;
  lastMessageAt: string;
  // ... 更多字段
}
```

### B. 参考文件
- `/apps/web/src/hooks/useAgents.ts` - 智能体Hooks
- `/apps/web/src/hooks/useConversations.ts` - 对话Hooks
- `/apps/web/src/api/client.ts` - API客户端（含Token刷新）
- `/apps/web/src/providers/QueryProvider.tsx` - React Query配置
- `/apps/web/src/store/useAppStore.ts` - 应用状态管理

---

*最后更新: 2026-03-29*
*文档版本: v1.0*
