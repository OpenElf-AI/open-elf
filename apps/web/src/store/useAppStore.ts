import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type MainPage = 'chat' | 'discover' | 'notifications' | 'profile' | 'create';
type View =
  | MainPage
  | { type: 'conversation'; id: string }
  | { type: 'agent'; id: string }
  | { type: 'agentDetail'; id: string }
  | { type: 'agentChat'; agentId: string }
  | { type: 'createAgent' }
  | { type: 'verification'; showFormInitially?: boolean }
  | { type: 'realNameVerification' }
  | { type: 'creatorCenter' }
  | { type: 'myAgents' }
  | { type: 'favorites' }
  | { type: 'marketplace' }
  | { type: 'capabilityPackageMarketplace' }
  | { type: 'myCapabilityPackages' }
  | { type: 'llmConfig' }
  | { type: 'settings' }
  | { type: 'orderConfirm'; assetType: 'agent' | 'capability'; assetId: string }
  | { type: 'paymentResult'; orderId?: string; outTradeNo?: string }
  | { type: 'myOrders' }
  | { type: 'createWork' }
  | { type: 'privateContent' }
  | { type: 'dataAnalytics' }
  | { type: 'mediaManager' }
  | { type: 'withdraw' };

interface AppState {
  currentView: View;
  lastMainPage: MainPage;
  setCurrentView: (view: View) => void;
  goBack: () => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

function isMainPage(view: View): view is MainPage {
  return typeof view === 'string';
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentView: 'chat',
      lastMainPage: 'chat',
      setCurrentView: view => {
        const { currentView } = get();
        if (isMainPage(currentView)) {
          set({ lastMainPage: currentView });
        }
        set({ currentView: view });
      },
      goBack: () => {
        const { currentView, lastMainPage } = get();
        if (!isMainPage(currentView)) {
          set({ currentView: lastMainPage });
        }
      },
      showLoginModal: false,
      setShowLoginModal: show => set({ showLoginModal: show }),
      isLoading: false,
      setIsLoading: loading => set({ isLoading: loading }),
      error: null,
      setError: error => set({ error }),
    }),
    {
      name: 'open-elf-app-storage',
      partialize: state => ({
        currentView: isMainPage(state.currentView) ? state.currentView : 'chat',
        lastMainPage: state.lastMainPage,
      }),
    }
  )
);
