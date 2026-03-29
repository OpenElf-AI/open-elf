import {
  User,
  Agent,
  Conversation,
  Message,
  Notification,
  CreateAgentInput,
  VerificationInput,
  Favorite,
  Transaction,
  Order,
  PrepayResult,
  OrderConfirmInput,

  AgentReview,
  AgentReviewList,
  CreateAgentReviewInput,
  UpdateAgentReviewInput,
  AgentAchievementList,
  UnlockAgentAchievementInput,
  AgentAchievementStatus,
} from './types';
import { apiRequest } from './client';

export const realApi = {
  auth: {
    sendCode: async (
      phone: string,
      type: 'login' | 'register' | 'reset_password',
      captchaToken?: string
    ): Promise<void> => {
      return apiRequest({
        method: 'POST',
        url: '/auth/send-code',
        data: { phone, type, captchaToken },
      });
    },
    loginWithCode: async (
      phoneOrEmail: string,
      code: string
    ): Promise<{ access_token: string; refresh_token: string; user: User }> => {
      const isPhone = /^1[3-9]\d{9}$/.test(phoneOrEmail);
      const url = isPhone ? '/auth/login/phone' : '/auth/login-with-code';
      const data = isPhone ? { phone: phoneOrEmail, code } : { phoneOrEmail, code };

      const result = await apiRequest({
        method: 'POST',
        url,
        data,
      });
      if (result.access_token) {
        localStorage.setItem('auth_token', result.access_token);
        localStorage.setItem('refresh_token', result.refresh_token);
      }
      return result;
    },
    loginQuick: async (
      accessToken: string
    ): Promise<{ access_token: string; refresh_token: string; user: User }> => {
      const result = await apiRequest({
        method: 'POST',
        url: '/auth/login/quick',
        data: { accessToken },
      });
      if (result.access_token) {
        localStorage.setItem('auth_token', result.access_token);
        localStorage.setItem('refresh_token', result.refresh_token);
      }
      return result;
    },
    refresh: async (
      refreshToken: string
    ): Promise<{ access_token: string; refresh_token: string }> => {
      const result = await apiRequest({
        method: 'POST',
        url: '/auth/refresh',
        data: { refresh_token: refreshToken },
      });
      if (result.access_token) {
        localStorage.setItem('auth_token', result.access_token);
        localStorage.setItem('refresh_token', result.refresh_token);
      }
      return result;
    },
    logout: async (): Promise<void> => {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await apiRequest({
          method: 'POST',
          url: '/auth/logout',
          data: { refresh_token: refreshToken },
        });
      }
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    },
    getCurrentUser: async (): Promise<User> => {
      return apiRequest({
        method: 'GET',
        url: '/users/me',
      });
    },
  },

  users: {
    getCurrentUser: async (): Promise<User> => {
      return apiRequest({
        method: 'GET',
        url: '/users/me',
      });
    },
    updateUser: async (data: { name?: string; avatar?: string }): Promise<User> => {
      return apiRequest({
        method: 'PUT',
        url: '/users/me',
        data,
      });
    },
    submitVerification: async (data: VerificationInput): Promise<User> => {
      return apiRequest({
        method: 'POST',
        url: '/users/verification',
        data,
      });
    },
  },

  agents: {
    getAll: async (options?: {
      page?: number;
      limit?: number;
      category?: string;
      search?: string;
      featured?: boolean;
    }): Promise<{ items: Agent[]; total: number; page: number; limit: number }> => {
      return apiRequest({
        method: 'GET',
        url: '/agents',
        params: options,
      });
    },
    getById: async (id: string): Promise<Agent | null> => {
      return apiRequest({
        method: 'GET',
        url: `/agents/${id}`,
      });
    },
    search: async (query: string): Promise<Agent[]> => {
      const result = await apiRequest({
        method: 'GET',
        url: '/agents',
        params: { search: query },
      });
      return result.items;
    },
    getFeatured: async (): Promise<Agent[]> => {
      const result = await apiRequest({
        method: 'GET',
        url: '/agents',
        params: { featured: true },
      });
      return result.items;
    },
    getMyAgents: async (): Promise<Agent[]> => {
      const result = await apiRequest({
        method: 'GET',
        url: '/agents/my',
      });
      return result.items;
    },
    create: async (data: CreateAgentInput): Promise<Agent> => {
      return apiRequest({
        method: 'POST',
        url: '/agents',
        data,
      });
    },
    addExp: async (agentId: string, expAmount: number): Promise<Agent> => {
      return apiRequest({
        method: 'POST',
        url: `/agents/${agentId}/add-exp`,
        data: { exp_amount: expAmount },
      });
    },
    purchase: async (id: string): Promise<Agent> => {
      const result = await apiRequest({
        method: 'POST',
        url: `/agents/${id}/purchase`,
      });
      return result.agent;
    },
    addFavorite: async (agentId: string): Promise<Favorite> => {
      const result = await apiRequest({
        method: 'POST',
        url: `/agents/${agentId}/favorite`,
      });
      return result;
    },
    removeFavorite: async (agentId: string): Promise<void> => {
      await apiRequest({
        method: 'DELETE',
        url: `/agents/${agentId}/favorite`,
      });
    },
    getFavorites: async (): Promise<{ items: Agent[]; total: number }> => {
      const result = await apiRequest({
        method: 'GET',
        url: '/favorites',
      });
      return result;
    },
    toggleShowcase: async (agentId: string): Promise<Agent> => {
      const result = await apiRequest({
        method: 'POST',
        url: `/agents/${agentId}/toggle-showcase`,
      });
      return result;
    },
    testAgent: async (agentId: string, message: string): Promise<any> => {
      return apiRequest({
        method: 'POST',
        url: `/agents/${agentId}/test`,
        data: { message },
      });
    },
    previewAgent: async (agentId: string): Promise<any> => {
      return apiRequest({
        method: 'GET',
        url: `/agents/${agentId}/preview`,
      });
    },
  },

  conversations: {
    getAll: async (): Promise<Conversation[]> => {
      const result = await apiRequest({
        method: 'GET',
        url: '/conversations',
      });
      return result.items;
    },
    getById: async (id: string): Promise<Conversation | null> => {
      return apiRequest({
        method: 'GET',
        url: `/conversations/${id}`,
      });
    },
    create: async (agentId: string): Promise<Conversation> => {
      return apiRequest({
        method: 'POST',
        url: '/conversations',
        data: { agent_id: agentId },
      });
    },
    delete: async (id: string): Promise<void> => {
      return apiRequest({
        method: 'DELETE',
        url: `/conversations/${id}`,
      });
    },
  },

  messages: {
    getByConversationId: async (conversationId: string): Promise<Message[]> => {
      const result = await apiRequest({
        method: 'GET',
        url: `/conversations/${conversationId}/messages`,
      });
      return result.items;
    },
    send: async (data: {
      conversationId?: string;
      agentId?: string;
      content: string;
    }): Promise<Message> => {
      if (data.conversationId) {
        return apiRequest({
          method: 'POST',
          url: `/conversations/${data.conversationId}/messages`,
          data: { content: data.content },
        });
      } else if (data.agentId) {
        const conversation = await realApi.conversations.create(data.agentId);
        return apiRequest({
          method: 'POST',
          url: `/conversations/${conversation.id}/messages`,
          data: { content: data.content },
        });
      }
      throw new Error('Either conversationId or agentId is required');
    },
    generateReply: async (conversationId: string): Promise<Message> => {
      return apiRequest({
        method: 'POST',
        url: `/conversations/${conversationId}/generate-reply`,
      });
    },
  },

  notifications: {
    getAll: async (): Promise<Notification[]> => {
      const result = await apiRequest({
        method: 'GET',
        url: '/notifications',
      });
      return result.items;
    },
    markAsRead: async (id: string): Promise<Notification> => {
      return apiRequest({
        method: 'POST',
        url: `/notifications/${id}/read`,
      });
    },
    markAllAsRead: async (): Promise<void> => {
      return apiRequest({
        method: 'POST',
        url: '/notifications/read-all',
      });
    },
    getUnreadCount: async (): Promise<number> => {
      const result = await apiRequest({
        method: 'GET',
        url: '/notifications',
        params: { unread_only: true },
      });
      return result.unread_count || 0;
    },
  },

  transactions: {
    getAll: async (): Promise<Transaction[]> => {
      const result = await apiRequest({
        method: 'GET',
        url: '/transactions',
      });
      return result.items;
    },
  },

  verification: {
    submit: async (data: VerificationInput): Promise<User> => {
      return apiRequest({
        method: 'POST',
        url: '/creator/apply',
        data: {
          platform: data.platform,
          accountName: data.username,
          fansCount: data.followers,
          proofUrl: data.proofUrl,
        },
      }).then(() => realApi.users.getCurrentUser());
    },
    getStatus: async (): Promise<any> => {
      return apiRequest({
        method: 'GET',
        url: '/creator/status',
      });
    },
  },

  order: {
    create: async (data: {
      outTradeNo: string;
      totalAmount: number;
      subject: string;
      assetType?: string;
      assetId?: string;
      assetName?: string;
      sellerId?: string;
      payType?: string;
    }): Promise<Order> => {
      return apiRequest({
        method: 'POST',
        url: '/api/order/create',
        data,
      });
    },
    getList: async (): Promise<{ items: Order[] }> => {
      return apiRequest({
        method: 'GET',
        url: '/api/order/list',
      });
    },
    getStatus: async (outTradeNo: string): Promise<Order | null> => {
      return apiRequest({
        method: 'GET',
        url: `/api/order/status/${outTradeNo}`,
      });
    },
  },

  pay: {
    prepay: async (data: OrderConfirmInput & { userId?: string }): Promise<PrepayResult> => {
      return apiRequest({
        method: 'POST',
        url: '/pay/alipay/prepayByAsset',
        data,
      });
    },
  },

  agentFollows: {
    followAgent: async (agentId: string): Promise<any> => {
      return apiRequest({
        method: 'POST',
        url: `/agent-follows/${agentId}`,
      });
    },
    unfollowAgent: async (agentId: string): Promise<any> => {
      return apiRequest({
        method: 'DELETE',
        url: `/agent-follows/${agentId}`,
      });
    },
    checkFollowStatus: async (agentId: string): Promise<{ isFollowing: boolean }> => {
      return apiRequest({
        method: 'GET',
        url: `/agent-follows/status/${agentId}`,
      });
    },
    getAgentFollowers: async (
      agentId: string,
      page?: number,
      limit?: number
    ): Promise<{
      items: any[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }> => {
      return apiRequest({
        method: 'GET',
        url: `/agent-follows/followers/${agentId}`,
        params: { page, limit },
      });
    },
    getUserFollowingAgents: async (
      userId: string,
      page?: number,
      limit?: number
    ): Promise<{
      items: any[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }> => {
      return apiRequest({
        method: 'GET',
        url: `/agent-follows/following/${userId}`,
        params: { page, limit },
      });
    },
    getAgentFollowCounts: async (agentId: string): Promise<{ followersCount: number }> => {
      return apiRequest({
        method: 'GET',
        url: `/agent-follows/counts/agent/${agentId}`,
      });
    },
    getUserFollowCounts: async (userId: string): Promise<{ followingCount: number }> => {
      return apiRequest({
        method: 'GET',
        url: `/agent-follows/counts/user/${userId}`,
      });
    },
    getMyFollowingAgents: async (
      page?: number,
      limit?: number
    ): Promise<{
      items: any[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }> => {
      return apiRequest({
        method: 'GET',
        url: '/agent-follows/my/following',
        params: { page, limit },
      });
    },
    getMyFollowCounts: async (): Promise<{ followingCount: number }> => {
      return apiRequest({
        method: 'GET',
        url: '/agent-follows/my/counts',
      });
    },
  },

  agentReviews: {
    createReview: async (data: CreateAgentReviewInput): Promise<AgentReview> => {
      return apiRequest({
        method: 'POST',
        url: '/agent-reviews',
        data,
      });
    },
    updateReview: async (reviewId: string, data: UpdateAgentReviewInput): Promise<AgentReview> => {
      return apiRequest({
        method: 'PUT',
        url: `/agent-reviews/${reviewId}`,
        data,
      });
    },
    deleteReview: async (reviewId: string): Promise<{ success: boolean }> => {
      return apiRequest({
        method: 'DELETE',
        url: `/agent-reviews/${reviewId}`,
      });
    },
    getAgentReviews: async (
      agentId: string,
      page?: number,
      limit?: number
    ): Promise<AgentReviewList> => {
      return apiRequest({
        method: 'GET',
        url: `/agent-reviews/agent/${agentId}`,
        params: { page, limit },
      });
    },
    getUserReviews: async (
      userId: string,
      page?: number,
      limit?: number
    ): Promise<{
      items: AgentReview[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }> => {
      return apiRequest({
        method: 'GET',
        url: `/agent-reviews/user/${userId}`,
        params: { page, limit },
      });
    },
    getMyReview: async (agentId: string): Promise<AgentReview | null> => {
      return apiRequest({
        method: 'GET',
        url: `/agent-reviews/my/${agentId}`,
      });
    },
    getMyReviews: async (
      page?: number,
      limit?: number
    ): Promise<{
      items: AgentReview[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }> => {
      return apiRequest({
        method: 'GET',
        url: '/agent-reviews/my',
        params: { page, limit },
      });
    },
  },

  agentAchievements: {
    unlockAchievement: async (data: UnlockAgentAchievementInput): Promise<any> => {
      return apiRequest({
        method: 'POST',
        url: '/agent-achievements',
        data,
      });
    },
    getAgentAchievements: async (
      agentId: string,
      page?: number,
      limit?: number
    ): Promise<AgentAchievementList> => {
      return apiRequest({
        method: 'GET',
        url: `/agent-achievements/agent/${agentId}`,
        params: { page, limit },
      });
    },
    checkAchievementStatus: async (
      agentId: string,
      achievementId: string
    ): Promise<AgentAchievementStatus> => {
      return apiRequest({
        method: 'GET',
        url: `/agent-achievements/status/${agentId}/${achievementId}`,
      });
    },
    deleteAchievement: async (
      agentId: string,
      achievementId: string
    ): Promise<{ success: boolean }> => {
      return apiRequest({
        method: 'DELETE',
        url: `/agent-achievements/${agentId}/${achievementId}`,
      });
    },
  },
};

export default realApi;
