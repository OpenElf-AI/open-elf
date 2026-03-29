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

export interface AgentLevelInfo {
  level: number;
  exp: number;
  expToNextLevel: number;
  progressPercentage: number;
  levelTitle: string;
  levelBenefits: string[];
  achievements: AgentAchievement[];
}

export interface AgentAchievement {
  id: string;
  agentId: string;
  achievementId: string;
  title: string;
  description: string;
  iconUrl?: string;
  unlockedAt: string;
}

export interface AgentLevelConfig {
  id: number;
  level: number;
  expRequired: number;
  title: string;
  benefits: string[];
  createdAt: string;
}

export interface AgentFollow {
  id: string;
  userId: string;
  agentId: string;
  createdAt: string;
}

export interface AgentFollowStatus {
  isFollowing: boolean;
  followersCount: number;
}

export interface AgentReview {
  id: string;
  agentId: string;
  userId: string;
  rating: number;
  comment?: string;
  user?: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AgentReviewList {
  items: AgentReview[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  averageRating: number;
}

export interface CreateAgentReviewInput {
  agentId: string;
  rating: number;
  comment?: string;
}

export interface UpdateAgentReviewInput {
  rating?: number;
  comment?: string;
}

export interface AgentAchievementList {
  items: AgentAchievement[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UnlockAgentAchievementInput {
  agentId: string;
  achievementId: string;
  title: string;
  description: string;
  iconUrl?: string;
}

export interface AgentAchievementStatus {
  unlocked: boolean;
  achievement?: AgentAchievement;
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
  exclusiveId?: string;
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
  baseModel?: string;
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
  exclusiveId?: string;
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
  exclusiveId?: string;
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
  baseModel?: string;
  isChatPublic?: boolean;
}

export interface Order {
  id?: string;
  outTradeNo: string;
  orderId?: string;
  orderNo?: string;
  buyerId?: string;
  userId?: string;
  totalAmount: number;
  amount?: number;
  subject: string;
  status: 'pending' | 'paid' | 'failed' | 'timeout';
  createTime: string;
  createdAt?: string;
  payTime?: string;
  paidAt?: string;
  payType?: 'alipay';
  paymentMethod?: 'alipay';
  assetType?: 'agent' | 'capability';
  assetId?: string;
  assetName?: string;
  assetAvatar?: string;
  updatedAt?: string;
  sellerId?: string;
}

export interface PrepayResult {
  paymentUrl: string;
  outTradeNo: string;
  orderId?: string;
  amount?: number;
  params?: Record<string, string>;
  gatewayUrl?: string;
}

export interface OrderConfirmInput {
  assetType: 'agent' | 'capability';
  assetId: string;
}
