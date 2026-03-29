export interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'user' | 'creator' | 'admin';
  email?: string;
  createdAt: string;
  verificationStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  verificationPlatform?: string;
  verificationFollowers?: number;
  verificationSubmitTime?: string;
}

export interface UserLLMConfig {
  provider: 'openai' | 'anthropic' | 'baidu' | 'alibaba' | 'tencent' | 'local';
  model: string;
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ModelRecommendation {
  provider: 'openai' | 'anthropic' | 'baidu' | 'alibaba' | 'tencent' | 'local';
  model: string;
  reason?: string;
}

export interface UserCapabilityPackage {
  id: string;
  packageId: string;
  userId: string;
  name: string;
  description: string;
  prompt: string;
  capabilities: string[];
  category: string;
  isInstalled: boolean;
  installedAgentId?: string;
  originalPackageId: string;
  canTransfer: boolean;
  purchasedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  agentId: string;
  agentName: string;
  agentAvatar: string;
  title: string;
  lastMessage: string;
  lastMessageAt: string;
  messageCount: number;
  createdAt: string;
  isTrial?: boolean;
  trialMessagesRemaining?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isError?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'system' | 'interaction';
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface CreateAgentInput {
  name: string;
  description: string;
  avatar: string;
  prompt: string;
  category: string;
  price: number;
  totalSupply: number;
  modelRecommendation?: ModelRecommendation;
}

export interface SendMessageInput {
  conversationId?: string;
  agentId?: string;
  content: string;
}

export interface VerificationInput {
  platform: string;
  username: string;
  followers: number;
  proofUrl: string;
}

export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'baidu' | 'alibaba' | 'tencent' | 'local';
  model: string;
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface CapabilityPackage {
  id: string;
  name: string;
  description: string;
  prompt: string;
  capabilities: string[];
  category: string;
  modelType?: string;
  openSourceModel?: string;
  llmConfig?: LLMConfig;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  price: number;
  totalSupply: number;
  soldCount: number;
  isListed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserAsset {
  id: string;
  userId: string;
  assetType: 'capability' | 'agent';
  assetId: string;
  name: string;
  description: string;
  avatar?: string;
  prompt?: string;
  capabilities?: string[];
  category?: string;
  creatorName?: string;
  creatorAvatar?: string;
  level: number;
  exp: number;
  expToNextLevel: number;
  fans: number;
  isShowcased: boolean;
  showcasedAt?: string;
  createdAt: string;
  updatedAt: string;
  canTransfer: boolean;
}

export interface Favorite {
  id: string;
  userId: string;
  agentId?: string;
  capabilityId?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'purchase' | 'service_fee';
  assetType: 'agent' | 'capability';
  assetId: string;
  assetName: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  serviceFee: number;
  sellerReceived: number;
  createdAt: string;
}

export interface Agent {
  id: string;
  originalId?: string;
  name: string;
  description: string;
  avatar: string;
  prompt: string;
  category: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  isPublic: boolean;
  isFeatured: boolean;
  conversationCount: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
  price: number;
  totalSupply: number;
  soldCount: number;
  isListed: boolean;
  status: 'listed' | 'sold' | 'active';
  ownerId?: string;
  level: number;
  fans: number;
  exp: number;
  expToNextLevel: number;
  isShowcased: boolean;
  showcasedAt?: string;
  installedCapabilityPackageIds?: string[];
  modelRecommendation?: ModelRecommendation;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
