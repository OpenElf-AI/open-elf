type EventType =
  | 'page_view'
  | 'agent_create_start'
  | 'agent_create_submit'
  | 'agent_purchase'
  | 'agent_gift'
  | 'login'
  | 'logout';

interface EventData {
  page?: string;
  agentId?: string;
  agentName?: string;
  price?: number;
  toUserId?: string;
  [key: string]: unknown;
}

export const analytics = {
  track: (event: EventType, data?: EventData): void => {
    console.log(`[Analytics] ${event}`, data);
  },

  pageView: (page: string): void => {
    analytics.track('page_view', { page });
  },

  agentCreateStart: (): void => {
    analytics.track('agent_create_start');
  },

  agentCreateSubmit: (agentId: string, agentName: string): void => {
    analytics.track('agent_create_submit', { agentId, agentName });
  },

  agentPurchase: (agentId: string, agentName: string, price: number): void => {
    analytics.track('agent_purchase', { agentId, agentName, price });
  },

  agentGift: (agentId: string, agentName: string, toUserId: string): void => {
    analytics.track('agent_gift', { agentId, agentName, toUserId });
  },

  login: (): void => {
    analytics.track('login');
  },

  logout: (): void => {
    analytics.track('logout');
  },
};

export const errorCapture = {
  capture: (error: Error, context?: Record<string, unknown>): void => {
    console.error('[ErrorCapture]', error, context);
  },
};
