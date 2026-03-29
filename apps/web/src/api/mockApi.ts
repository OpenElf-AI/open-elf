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
  CapabilityPackage,
  UserCapabilityPackage,
  Order,
} from './types';
import {
  mockAgents,
  mockConversations,
  mockMessages,
  mockNotifications,
  mockCreator,
  myAgents as initialMyAgents,
  getExpToNextLevel,
  mockFavorites,
  mockCapabilityPackages,
} from './mockData';
import { llmService, ChatMessage } from '../services/llmService';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let currentUser = { ...mockCreator };
let conversations = [...mockConversations];
const messages = { ...mockMessages };
const notifications = [...mockNotifications];
let agents = [...mockAgents];
let myAgents: Agent[] = [...initialMyAgents];
let favorites: Favorite[] = [...mockFavorites];
let transactions: Transaction[] = [];
const capabilityPackages: CapabilityPackage[] = [...mockCapabilityPackages];
let myCapabilityPackages: CapabilityPackage[] = [];
let userCapabilityPackages: UserCapabilityPackage[] = [];
let orders: Order[] = [];

export const mockApi = {
  auth: {
    login: async (): Promise<User> => {
      await delay(500);
      localStorage.setItem('auth_token', 'mock-token');
      return currentUser;
    },
    logout: async (): Promise<void> => {
      await delay(300);
      localStorage.removeItem('auth_token');
    },
    getCurrentUser: async (): Promise<User> => {
      await delay(200);
      return currentUser;
    },
    switchToCreator: async (): Promise<User> => {
      await delay(300);
      currentUser = { ...mockCreator };
      return currentUser;
    },
    sendCode: async (phone: string, type: string, captchaToken: string): Promise<void> => {
      await delay(500);
      console.log('[Mock API] sendCode called with:', { phone, type, captchaToken });
    },
    loginWithCode: async (
      phone: string,
      code: string
    ): Promise<{ access_token: string; refresh_token: string; user: User }> => {
      await delay(500);
      console.log('[Mock API] loginWithCode called with:', { phone, code });
      localStorage.setItem('auth_token', 'mock-token');
      localStorage.setItem('refresh_token', 'mock-refresh-token');
      return {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token',
        user: currentUser,
      };
    },
    loginQuick: async (
      accessToken: string
    ): Promise<{ access_token: string; refresh_token: string; user: User }> => {
      await delay(500);
      console.log('[Mock API] loginQuick called with:', { accessToken });
      localStorage.setItem('auth_token', 'mock-token');
      localStorage.setItem('refresh_token', 'mock-refresh-token');
      return {
        access_token: 'mock-token',
        refresh_token: 'mock-refresh-token',
        user: currentUser,
      };
    },
  },

  agents: {
    getAll: async (): Promise<Agent[]> => {
      await delay(300);
      return agents.filter(a => a.isListed);
    },
    getById: async (id: string): Promise<Agent | null> => {
      await delay(200);
      return agents.find(a => a.id === id) || myAgents.find(a => a.id === id) || null;
    },
    search: async (query: string): Promise<Agent[]> => {
      await delay(200);
      return agents.filter(
        a =>
          a.isListed &&
          (a.name.toLowerCase().includes(query.toLowerCase()) ||
            a.description.toLowerCase().includes(query.toLowerCase()))
      );
    },
    getFeatured: async (): Promise<Agent[]> => {
      await delay(300);
      return agents.filter(a => a.isFeatured && a.isListed);
    },
    getMyAgents: async (): Promise<Agent[]> => {
      await delay(300);
      return myAgents;
    },
    create: async (data: CreateAgentInput): Promise<Agent> => {
      await delay(500);
      const { modelRecommendation, ...restData } = data;

      const newAgent: Agent = {
        id: `agent-${Date.now()}`,
        ...restData,
        avatar: '',
        creatorId: currentUser.id,
        creatorName: currentUser.name,
        creatorAvatar: currentUser.avatar,
        isPublic: true,
        isFeatured: false,
        conversationCount: 0,
        likes: 0,
        soldCount: 0,
        isListed: true,
        status: 'listed',
        level: 1,
        fans: 0,
        exp: 0,
        expToNextLevel: getExpToNextLevel(1),
        isShowcased: false,
        modelRecommendation,
        installedCapabilityPackageIds: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      agents = [newAgent, ...agents];
      return newAgent;
    },
    addExp: async (agentId: string, expAmount: number): Promise<Agent> => {
      await delay(200);
      const agent = myAgents.find(a => a.id === agentId);
      if (!agent) throw new Error('Agent not found');

      agent.exp += expAmount;

      while (agent.exp >= agent.expToNextLevel) {
        agent.exp -= agent.expToNextLevel;
        agent.level++;
        agent.expToNextLevel = getExpToNextLevel(agent.level);
      }

      return { ...agent };
    },
    purchase: async (id: string): Promise<Agent> => {
      await delay(500);
      const agent = agents.find(a => a.id === id);
      if (!agent) throw new Error('Agent not found');
      if (agent.soldCount >= agent.totalSupply) throw new Error('Sold out');

      agent.soldCount++;

      const serviceFee = agent.price * 0.1;
      const sellerReceived = agent.price - serviceFee;

      const transaction: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'purchase',
        assetType: 'agent',
        assetId: agent.id,
        assetName: agent.name,
        buyerId: currentUser.id,
        sellerId: agent.creatorId,
        amount: agent.price,
        serviceFee: serviceFee,
        sellerReceived: sellerReceived,
        createdAt: new Date().toISOString(),
      };
      transactions = [transaction, ...transactions];

      const exclusiveId = `A${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      const purchasedAgent: Agent = {
        ...agent,
        id: `agent-${Date.now()}`,
        originalId: agent.id,
        exclusiveId,
        ownerId: currentUser.id,
        isListed: false,
        status: 'sold',
        isChatPublic: false,
      };
      myAgents = [purchasedAgent, ...myAgents];
      return purchasedAgent;
    },
    addFavorite: async (agentId: string): Promise<Favorite> => {
      await delay(200);
      const existing = favorites.find(f => f.userId === currentUser.id && f.agentId === agentId);
      if (existing) throw new Error('Already favorited');

      const newFavorite: Favorite = {
        id: `fav-${Date.now()}`,
        userId: currentUser.id,
        agentId,
        createdAt: new Date().toISOString(),
      };
      favorites = [newFavorite, ...favorites];
      return newFavorite;
    },
    removeFavorite: async (agentId: string): Promise<void> => {
      await delay(200);
      favorites = favorites.filter(f => !(f.userId === currentUser.id && f.agentId === agentId));
    },
    getShowcasedAgents: async (): Promise<Agent[]> => {
      await delay(300);
      const allAgents = [...agents, ...myAgents];
      return allAgents.filter(a => a.isShowcased);
    },
    toggleShowcase: async (agentId: string): Promise<Agent> => {
      await delay(200);
      const agent = myAgents.find(a => a.id === agentId);
      if (!agent) throw new Error('Agent not found');

      agent.isShowcased = !agent.isShowcased;
      agent.showcasedAt = agent.isShowcased ? new Date().toISOString() : undefined;

      return { ...agent };
    },
    updateChatPublic: async (agentId: string, isPublic: boolean): Promise<Agent> => {
      await delay(200);
      const agent = myAgents.find(a => a.id === agentId);
      if (!agent) throw new Error('Agent not found');

      agent.isChatPublic = isPublic;
      agent.updatedAt = new Date().toISOString();

      return { ...agent };
    },
  },

  capabilityPackages: {
    getAll: async (): Promise<CapabilityPackage[]> => {
      await delay(300);
      return capabilityPackages.filter(m => m.isListed);
    },
    getById: async (id: string): Promise<CapabilityPackage | null> => {
      await delay(200);
      return capabilityPackages.find(m => m.id === id) || null;
    },
    getMyPackages: async (): Promise<CapabilityPackage[]> => {
      await delay(300);
      return myCapabilityPackages;
    },
    getUserCapabilityPackages: async (): Promise<UserCapabilityPackage[]> => {
      await delay(300);
      return userCapabilityPackages;
    },
    purchase: async (id: string): Promise<UserCapabilityPackage> => {
      await delay(500);
      const pkg = capabilityPackages.find(m => m.id === id);
      if (!pkg) throw new Error('Capability package not found');
      if (pkg.soldCount >= pkg.totalSupply) throw new Error('Sold out');

      pkg.soldCount++;

      const serviceFee = pkg.price * 0.1;
      const sellerReceived = pkg.price - serviceFee;

      const transaction: Transaction = {
        id: `tx-${Date.now()}`,
        type: 'purchase',
        assetType: 'capability',
        assetId: pkg.id,
        assetName: pkg.name,
        buyerId: currentUser.id,
        sellerId: pkg.creatorId,
        amount: pkg.price,
        serviceFee: serviceFee,
        sellerReceived: sellerReceived,
        createdAt: new Date().toISOString(),
      };
      transactions = [transaction, ...transactions];

      const exclusiveId = `C${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      const purchasedPackage: CapabilityPackage = {
        ...pkg,
        id: `capability-${Date.now()}`,
        exclusiveId,
        isListed: false,
      };
      myCapabilityPackages = [purchasedPackage, ...myCapabilityPackages];

      const userPkg: UserCapabilityPackage = {
        id: `user-capability-${Date.now()}`,
        packageId: purchasedPackage.id,
        exclusiveId,
        userId: currentUser.id,
        name: pkg.name,
        description: pkg.description,
        prompt: pkg.prompt,
        capabilities: pkg.capabilities,
        category: pkg.category,
        isInstalled: false,
        originalPackageId: id,
        canTransfer: true,
        purchasedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      userCapabilityPackages = [userPkg, ...userCapabilityPackages];

      return userPkg;
    },
    installToAgent: async (userPkgId: string, agentId: string): Promise<UserCapabilityPackage> => {
      await delay(300);

      const userPkg = userCapabilityPackages.find(p => p.id === userPkgId);
      if (!userPkg) throw new Error('User capability package not found');
      if (userPkg.isInstalled) throw new Error('Capability package already installed');

      const agent = myAgents.find(a => a.id === agentId);
      if (!agent) throw new Error('Agent not found');

      userPkg.isInstalled = true;
      userPkg.installedAgentId = agentId;
      userPkg.updatedAt = new Date().toISOString();

      if (!agent.installedCapabilityPackageIds) {
        agent.installedCapabilityPackageIds = [];
      }
      agent.installedCapabilityPackageIds.push(userPkgId);

      return userPkg;
    },
    uninstallFromAgent: async (userPkgId: string): Promise<UserCapabilityPackage> => {
      await delay(300);

      const userPkg = userCapabilityPackages.find(p => p.id === userPkgId);
      if (!userPkg) throw new Error('User capability package not found');
      if (!userPkg.isInstalled) throw new Error('Capability package not installed');

      const agentId = userPkg.installedAgentId;
      if (agentId) {
        const agent = myAgents.find(a => a.id === agentId);
        if (agent && agent.installedCapabilityPackageIds) {
          agent.installedCapabilityPackageIds = agent.installedCapabilityPackageIds.filter(
            id => id !== userPkgId
          );
        }
      }

      userPkg.isInstalled = false;
      userPkg.installedAgentId = undefined;
      userPkg.updatedAt = new Date().toISOString();

      return userPkg;
    },
  },

  conversations: {
    getAll: async (): Promise<Conversation[]> => {
      await delay(300);
      return conversations.sort(
        (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
    },
    getById: async (id: string): Promise<Conversation | null> => {
      await delay(200);
      return conversations.find(c => c.id === id) || null;
    },
    create: async (agentId: string): Promise<Conversation> => {
      await delay(300);
      let agent = agents.find(a => a.id === agentId);
      if (!agent) agent = myAgents.find(a => a.id === agentId);
      if (!agent) throw new Error('Agent not found');

      const newConversation: Conversation = {
        id: `conv-${Date.now()}`,
        userId: currentUser.id,
        agentId,
        agentName: agent.name,
        agentAvatar: agent.avatar,
        title: agent.name,
        lastMessage: '开始聊天吧',
        lastMessageAt: new Date().toISOString(),
        messageCount: 0,
        createdAt: new Date().toISOString(),
      };
      conversations = [newConversation, ...conversations];
      messages[newConversation.id] = [];
      return newConversation;
    },
    delete: async (id: string): Promise<void> => {
      await delay(300);
      conversations = conversations.filter(c => c.id !== id);
      delete messages[id];
    },
  },

  messages: {
    getByConversationId: async (conversationId: string): Promise<Message[]> => {
      await delay(200);
      return messages[conversationId] || [];
    },
    send: async (data: {
      conversationId?: string;
      agentId?: string;
      content: string;
    }): Promise<Message> => {
      await delay(500);

      let conversationId = data.conversationId;
      if (!conversationId && data.agentId) {
        const conv = await mockApi.conversations.create(data.agentId);
        conversationId = conv.id;
      }
      if (!conversationId) throw new Error('No conversation');

      const conv = conversations.find(c => c.id === conversationId);
      if (!conv) throw new Error('Conversation not found');

      let agent = agents.find(a => a.id === conv.agentId);
      if (!agent) agent = myAgents.find(a => a.id === conv.agentId);
      if (!agent) throw new Error('Agent not found');

      if (agent.status === 'listed') {
        throw new Error('该智能体未成交，暂不开放对话');
      }

      const isOwner = agent.ownerId === currentUser.id;
      if (!isOwner && !agent.isChatPublic) {
        throw new Error('该智能体未开放公开对话');
      }

      const userMessage: Message = {
        id: `msg-${Date.now()}-1`,
        conversationId,
        role: 'user',
        content: data.content,
        timestamp: new Date().toISOString(),
      };

      if (!messages[conversationId]) {
        messages[conversationId] = [];
      }
      messages[conversationId].push(userMessage);

      conv.lastMessage = data.content;
      conv.lastMessageAt = new Date().toISOString();
      conv.messageCount++;

      return userMessage;
    },
    generateReply: async (conversationId: string): Promise<Message> => {
      const conv = conversations.find(c => c.id === conversationId);
      if (!conv) throw new Error('Conversation not found');

      let agent = agents.find(a => a.id === conv.agentId);
      if (!agent) agent = myAgents.find(a => a.id === conv.agentId);

      const historyMessages = messages[conversationId] || [];

      const chatMessages: ChatMessage[] = [];

      let systemPrompt = '';

      if (agent?.prompt) {
        systemPrompt += agent.prompt + '\n\n';
      }

      if (agent?.installedCapabilityPackageIds && agent.installedCapabilityPackageIds.length > 0) {
        for (const pkgId of agent.installedCapabilityPackageIds) {
          const userPkg = userCapabilityPackages.find(p => p.id === pkgId);
          if (userPkg) {
            systemPrompt += `\n【${userPkg.name}】\n${userPkg.prompt}\n`;
          }
        }
      }

      if (systemPrompt) {
        chatMessages.push({ role: 'system', content: systemPrompt });
      }

      for (const msg of historyMessages) {
        chatMessages.push({
          role: msg.role,
          content: msg.content,
        });
      }

      let response;
      try {
        let llmConfig;

        const userLLMConfigStr = localStorage.getItem('user_llm_config');
        if (userLLMConfigStr) {
          llmConfig = JSON.parse(userLLMConfigStr);
        }

        response = await llmService.generate(chatMessages, llmConfig);
      } catch (error) {
        console.error('LLM generation failed:', error);
        response = {
          content: '抱歉，暂时无法连接到AI服务，请稍后再试。请确保你已在个人中心配置好API Key。',
        };
      }

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-2`,
        conversationId,
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
      };

      if (!messages[conversationId]) {
        messages[conversationId] = [];
      }
      messages[conversationId].push(assistantMessage);
      conv.lastMessage = assistantMessage.content;
      conv.lastMessageAt = new Date().toISOString();
      conv.messageCount++;

      return assistantMessage;
    },
  },

  transactions: {
    getAll: async (): Promise<Transaction[]> => {
      await delay(300);
      return transactions.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
  },

  notifications: {
    getAll: async (): Promise<Notification[]> => {
      await delay(300);
      return notifications.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    markAsRead: async (id: string): Promise<Notification> => {
      await delay(200);
      const notif = notifications.find(n => n.id === id);
      if (!notif) throw new Error('Notification not found');
      notif.isRead = true;
      return notif;
    },
    markAllAsRead: async (): Promise<void> => {
      await delay(300);
      notifications.forEach(n => (n.isRead = true));
    },
    getUnreadCount: async (): Promise<number> => {
      await delay(100);
      return notifications.filter(n => !n.isRead).length;
    },
  },

  verification: {
    submit: async (data: VerificationInput): Promise<User> => {
      await delay(1000);
      currentUser.verificationStatus = 'pending';
      currentUser.verificationPlatform = data.platform;
      currentUser.verificationFollowers = data.followers;
      currentUser.verificationSubmitTime = new Date().toISOString();
      return { ...currentUser };
    },
    getStatus: async (): Promise<any> => {
      await delay(300);
      return {
        status:
          currentUser.verificationStatus === 'unverified' ? 'none' : currentUser.verificationStatus,
        rejectReason: null,
        auditTime: null,
      };
    },
  },

  order: {
    create: async (data: {
      outTradeNo: string;
      totalAmount: number;
      subject: string;
      assetType?: 'agent' | 'capability';
      assetId?: string;
      assetName?: string;
      sellerId?: string;
      payType?: 'alipay';
    }): Promise<Order> => {
      await delay(300);
      const newOrder: Order = {
        outTradeNo: data.outTradeNo,
        totalAmount: data.totalAmount,
        subject: data.subject,
        status: 'pending',
        createTime: new Date().toISOString(),
        payType: data.payType || 'alipay',
        assetType: data.assetType,
        assetId: data.assetId,
        assetName: data.assetName,
        userId: currentUser.id,
        sellerId: data.sellerId,
      };
      orders = [newOrder, ...orders];
      return newOrder;
    },
    getList: async (): Promise<{ items: Order[] }> => {
      await delay(300);
      return { items: orders.filter(o => o.userId === currentUser.id) };
    },
    getStatus: async (outTradeNo: string): Promise<Order | null> => {
      await delay(200);
      return orders.find(o => o.outTradeNo === outTradeNo) || null;
    },
  },

  pay: {
    prepay: async (data: {
      assetType: string;
      assetId: string;
      userId?: string;
    }): Promise<{ paymentUrl: string; outTradeNo: string; amount: number }> => {
      await delay(500);

      let totalAmount = 0.01;
      let subject = 'Test Product';
      let assetName = 'Test Product';

      if (data.assetType === 'agent') {
        const agent = agents.find(a => a.id === data.assetId);
        if (agent) {
          totalAmount = agent.price;
          subject = agent.name;
          assetName = agent.name;
        }
      } else if (data.assetType === 'capability') {
        const pkg = capabilityPackages.find(p => p.id === data.assetId);
        if (pkg) {
          totalAmount = pkg.price;
          subject = pkg.name;
          assetName = pkg.name;
        }
      }

      const outTradeNo = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newOrder: Order = {
        outTradeNo,
        totalAmount,
        subject,
        status: 'paid',
        createTime: new Date().toISOString(),
        payTime: new Date().toISOString(),
        payType: 'alipay',
        assetType: data.assetType as any,
        assetId: data.assetId,
        assetName,
        userId: data.userId || currentUser.id,
      };
      orders = [newOrder, ...orders];

      return {
        paymentUrl: '#/paymentResult?out_trade_no=' + outTradeNo,
        outTradeNo,
        amount: totalAmount,
      };
    },
  },
};
