# Open Elf Backend API Specification
## 概述
本文档定义了 Open Elf 后端 API 的完整接口规范，用于前后端对接。
### Base URL: `https://api.openelf.com/v1`
### 认证
除了公开接口，所有API请求都需要在请求头中携带 JWT Token：
```
Authorization: Bearer {access_token}
```
---
## 1. 用户认证 (Auth)
### 1.1 发送验证码
**POST** `/auth/send-code`
**请求体：**
```json
{
  "phone": "13800138000",
  "type": "login|register|reset_password"
}
```
**响应：**
```json
{
  "success": true,
  "message": "验证码已发送"
}
```
### 1.2 验证码登录
**POST** `/auth/login-with-code`
**请求体：**
```json
{
  "phone": "13800138000",
  "code": "123456"
}
```
**响应：**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "dGhpcyBp...",
  "user": {
    "id": "uuid",
    "name": "用户名",
    "avatar": "https://...",
    "role": "user|creator",
    "verification_status": "unverified|pending|verified"
  }
}
```
### 1.3 刷新 Token
**POST** `/auth/refresh`
**请求体：**
```json
{
  "refresh_token": "dGhpcyBp..."
}
```
**响应：**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "new_refresh_token"
}
```
### 1.4 登出
**POST** `/auth/logout`
**请求体：**
```json
{
  "refresh_token": "dGhpcyBp..."
}
```
**响应：**
```json
{
  "success": true
}
```
---
## 2. 用户管理 (Users)
### 2.1 获取当前用户信息
**GET** `/users/me`
**响应：**
```json
{
  "id": "uuid",
  "name": "用户名",
  "avatar": "https://...",
  "email": "user@example.com",
  "role": "user|creator",
  "verification_status": "unverified|pending|verified",
  "verification_platform": "小红书",
  "verification_followers": 15000,
  "created_at": "2024-01-01T00:00:00Z"
}
```
### 2.2 更新用户信息
**PUT** `/users/me`
**请求体：**
```json
{
  "name": "新用户名",
  "avatar": "https://..."
}
```
**响应：**
```json
{
  "id": "uuid",
  "name": "新用户名",
  "avatar": "https://..."
}
```
### 2.3 提交创作者认证
**POST** `/users/verification`
**请求体：**
```json
{
  "platform": "小红书",
  "username": "username",
  "followers": 15000,
  "proof_url": "https://..."
}
```
**响应：**
```json
{
  "success": true,
  "verification_status": "pending"
}
```
---
## 3. 智能体 (Agents)
### 3.1 获取智能体列表
**GET** `/agents`
**查询参数：**
- `page`: 页码 (默认 1)
- `limit`: 每页数量 (默认 20)
- `category`: 分类筛选
- `search`: 搜索关键词
- `featured`: 是否只返回精选 (true/false)
**响应：**
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "豆包",
      "description": "描述",
      "avatar": "https://...",
      "category": "通用",
      "creator_id": "uuid",
      "creator_name": "创作者",
      "creator_avatar": "https://...",
      "price": 19.9,
      "total_supply": 500,
      "sold_count": 324,
      "is_featured": true,
      "conversation_count": 12543,
      "likes": 3421,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```
### 3.2 获取智能体详情
**GET** `/agents/{id}
**响应：**
```json
{
  "id": "uuid",
  "name": "豆包",
  "description": "描述",
  "avatar": "https://...",
  "prompt": "系统提示词",
  "category": "通用",
  "creator_id": "uuid",
  "creator_name": "创作者",
  "creator_avatar": "https://...",
  "price": 19.9,
  "total_supply": 500,
  "sold_count": 324,
  "is_featured": true,
  "conversation_count": 12543,
  "likes": 3421,
  "created_at": "2024-01-01T00:00:00Z",
  "is_owned": false,
  "is_favorited": false
}
```
### 3.3 购买智能体
**POST** `/agents/{id}/purchase`
**响应：**
```json
{
  "success": true,
  "agent": {
    "id": "uuid",
    "original_id": "uuid",
    "owner_id": "uuid",
    "level": 1,
    "exp": 0,
    "exp_to_next_level": 100
  }
}
```
### 3.4 创建智能体 (创作者)
**POST** `/agents`
**请求体：**
```json
{
  "name": "智能体名称",
  "description": "描述",
  "avatar": "https://...",
  "prompt": "系统提示词",
  "category": "通用",
  "price": 19.9,
  "total_supply": 500
}
```
**响应：**
```json
{
  "id": "uuid",
  "name": "智能体名称"
}
```
### 3.5 我的智能体
**GET** `/agents/my`
**响应：**
```json
{
  "items": [
    {
      "id": "uuid",
      "original_id": "uuid",
      "name": "豆包",
      "description": "描述",
      "avatar": "https://...",
      "level": 2,
      "exp": 75,
      "exp_to_next_level": 150,
      "fans": 12,
      "is_showcased": false,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```
### 3.6 收藏/取消收藏
**POST** `/agents/{id}/favorite`
**响应：**
```json
{
  "success": true,
  "is_favorited": true
}
```
### 3.7 展示/取消展示智能体
**POST** `/agents/{id}/toggle-showcase`
**响应：**
```json
{
  "success": true,
  "is_showcased": true
}
```
### 3.8 为智能体添加经验
**POST** `/agents/{id}/add-exp`
**请求体：**
```json
{
  "exp_amount": 5
}
```
**响应：**
```json
{
  "id": "uuid",
  "level": 2,
  "exp": 80,
  "exp_to_next_level": 150
}
```
---
## 4. 对话 (Conversations)
### 4.1 获取对话列表
**GET** `/conversations`
**查询参数：**
- `page`: 页码 (默认 1)
- `limit`: 每页数量 (默认 20)
**响应：**
```json
{
  "items": [
    {
      "id": "uuid",
      "agent_id": "uuid",
      "agent_name": "豆包",
      "agent_avatar": "https://...",
      "title": "对话标题",
      "last_message": "最后一条消息",
      "last_message_at": "2024-01-01T00:00:00Z",
      "message_count": 15,
      "created_at": "2024-01-01T00:00:00Z",
      "is_trial": true,
      "trial_messages_remaining": 3
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20
}
```
### 4.2 创建对话
**POST** `/conversations`
**请求体：**
```json
{
  "agent_id": "uuid"
}
```
**响应：**
```json
{
  "id": "uuid",
  "agent_id": "uuid",
  "agent_name": "豆包",
  "agent_avatar": "https://...",
  "is_trial": true,
  "trial_messages_remaining": 5
}
```
### 4.3 获取对话详情
**GET** `/conversations/{id}`
**响应：**
```json
{
  "id": "uuid",
  "agent_id": "uuid",
  "agent_name": "豆包",
  "agent_avatar": "https://...",
  "title": "对话标题",
  "message_count": 15,
  "created_at": "2024-01-01T00:00:00Z",
  "is_trial": true,
  "trial_messages_remaining": 3
}
```
### 4.4 删除对话
**DELETE** `/conversations/{id}`
**响应：**
```json
{
  "success": true
}
```
---
## 5. 消息 (Messages)
### 5.1 获取消息列表
**GET** `/conversations/{conversationId}/messages`
**查询参数：**
- `page`: 页码 (默认 1)
- `limit`: 每页数量 (默认 50)
**响应：**
```json
{
  "items": [
    {
      "id": "uuid",
      "role": "user|assistant",
      "content": "消息内容",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 50
}
```
### 5.2 发送消息
**POST** `/conversations/{conversationId}/messages`
**请求体：**
```json
{
  "content": "消息内容"
}
```
**响应：**
```json
{
  "id": "uuid",
  "role": "user",
  "content": "消息内容",
  "timestamp": "2024-01-01T00:00:00Z"
}
```
### 5.3 生成 AI 回复
**POST** `/conversations/{conversationId}/generate-reply`
**响应：**
```json
{
  "id": "uuid",
  "role": "assistant",
  "content": "AI 回复内容",
  "timestamp": "2024-01-01T00:00:00Z"
}
```
---
## 6. 能力包 (Capability Packages)
### 6.1 获取能力包列表
**GET** `/capability-packages`
**查询参数：**
- `page`: 页码 (默认 1)
- `limit`: 每页数量 (默认 20)
- `category`: 分类筛选
- `search`: 搜索关键词
**响应：**
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "代码大师能力包",
      "description": "描述",
      "category": "编程",
      "price": 29.9,
      "total_supply": 500,
      "sold_count": 234,
      "creator_id": "uuid",
      "creator_name": "官方",
      "creator_avatar": "https://...",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20
}
```
### 6.2 获取能力包详情
**GET** `/capability-packages/{id}
**响应：**
```json
{
  "id": "uuid",
  "name": "代码大师能力包",
  "description": "描述",
  "prompt": "系统提示词",
  "capabilities": ["Python", "JavaScript"],
  "category": "编程",
  "price": 29.9,
  "total_supply": 500,
  "sold_count": 234
}
```
### 6.3 购买能力包
**POST** `/capability-packages/{id}/purchase`
**响应：**
```json
{
  "success": true,
  "user_package": {
    "id": "uuid",
    "package_id": "uuid",
    "name": "代码大师能力包",
    "is_installed": false
  }
}
```
### 6.4 我的能力包
**GET** `/capability-packages/my`
**响应：**
```json
{
  "items": [
    {
      "id": "uuid",
      "package_id": "uuid",
      "name": "代码大师能力包",
      "description": "描述",
      "category": "编程",
      "is_installed": false,
      "installed_agent_id": null,
      "purchased_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```
### 6.5 安装能力包到智能体
**POST** `/capability-packages/{userPackageId}/install`
**请求体：**
```json
{
  "agent_id": "uuid"
}
```
**响应：**
```json
{
  "success": true,
  "is_installed": true,
  "installed_agent_id": "uuid"
}
```
### 6.6 卸载能力包
**POST** `/capability-packages/{userPackageId}/uninstall`
**响应：**
```json
{
  "success": true,
  "is_installed": false
}
```
---
## 7. 通知 (Notifications)
### 7.1 获取通知列表
**GET** `/notifications`
**查询参数：**
- `page`: 页码 (默认 1)
- `limit`: 每页数量 (默认 20)
- `type`: 类型筛选 (system|interaction)
- `unread_only`: 只返回未读 (true/false)
**响应：**
```json
{
  "items": [
    {
      "id": "uuid",
      "type": "system|interaction",
      "title": "标题",
      "content": "内容",
      "is_read": false,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20,
  "unread_count": 5
}
```
### 7.2 标记已读
**POST** `/notifications/{id}/read`
**响应：**
```json
{
  "success": true
}
```
### 7.3 全部标记已读
**POST** `/notifications/read-all`
**响应：**
```json
{
  "success": true
}
```
---
## 8. 交易 (Transactions)
### 8.1 获取交易记录
**GET** `/transactions`
**查询参数：**
- `page`: 页码 (默认 1)
- `limit`: 每页数量 (默认 20)
**响应：**
```json
{
  "items": [
    {
      "id": "uuid",
      "type": "purchase|service_fee",
      "asset_type": "agent|capability",
      "asset_id": "uuid",
      "asset_name": "豆包",
      "amount": 19.9,
      "service_fee": 1.99,
      "seller_received": 17.91,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20
}
```
---
## 错误响应
所有 API 在出错时返回统一格式：
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": {}
  }
}
```
常见错误码：
- `UNAUTHORIZED`: 未授权
- `FORBIDDEN`: 无权限
- `NOT_FOUND`: 资源不存在
- `VALIDATION_ERROR`: 参数验证失败
- `INTERNAL_ERROR`: 服务器内部错误
- `SOLD_OUT`: 已售罄
- `TRIAL_EXPIRED`: 体验次数已用完
- `PAYMENT_REQUIRED`: 需要购买
