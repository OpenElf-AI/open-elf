import React, { Suspense, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from './store';
import BottomNav from './components/BottomNav';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NetworkStatus } from './components/NetworkStatus';
import { useUserStore } from './store';
import { initApi, getApi, isMockMode } from './api';
import { useLLMInit } from './hooks/useLLMInit';
import { GlobalLoading } from './components/GlobalLoading';

const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const ChatPage = React.lazy(() => import('./pages/ChatPage'));
const DiscoverPage = React.lazy(() => import('./pages/DiscoverPage'));
const NotificationsPage = React.lazy(() => import('./pages/NotificationsPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const ConversationDetailPage = React.lazy(() => import('./pages/ConversationDetailPage'));
const AgentDetailPage = React.lazy(() => import('./pages/AgentDetailPage'));
const VerificationPage = React.lazy(() => import('./pages/VerificationPage'));
const CreateAgentPage = React.lazy(() => import('./pages/CreateAgentPage'));
const MyAgentsPage = React.lazy(() => import('./pages/MyAgentsPage'));
const FavoritesPage = React.lazy(() => import('./pages/FavoritesPage'));
const CapabilityPackageMarketplacePage = React.lazy(
  () => import('./pages/CapabilityPackageMarketplacePage')
);
const MyCapabilityPackagesPage = React.lazy(() => import('./pages/MyCapabilityPackagesPage'));
const LLMConfigPage = React.lazy(() => import('./pages/LLMConfigPage'));
const OrderConfirmPage = React.lazy(() => import('./pages/OrderConfirmPage'));
const PaymentResultPage = React.lazy(() => import('./pages/PaymentResultPage'));
const MyOrdersPage = React.lazy(() => import('./pages/MyOrdersPage'));
const AgentChatPage = React.lazy(() => import('./pages/AgentChatPage'));
const CreateWorkPage = React.lazy(() => import('./pages/CreateWorkPage'));
const PrivateContentPage = React.lazy(() => import('./pages/PrivateContentPage'));
const DataAnalyticsPage = React.lazy(() => import('./pages/DataAnalyticsPage'));
const MediaManagerPage = React.lazy(() => import('./pages/MediaManagerPage'));
const WithdrawPage = React.lazy(() => import('./pages/WithdrawPage'));

const PageLoading: React.FC = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-[#666666] text-sm">加载中...</p>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  useLLMInit();
  const { currentView, goBack, setCurrentView } = useAppStore();
  const { isLoggedIn, setUser, user } = useUserStore();
  const authToken = localStorage.getItem('auth_token');
  const [apiInitialized, setApiInitialized] = useState(false);
  const [usingMock, setUsingMock] = useState(false);
  const [showServiceNotice, setShowServiceNotice] = useState(false);

  useEffect(() => {
    const initializeApi = async () => {
      await initApi();
      setApiInitialized(true);
      const mockMode = isMockMode();
      setUsingMock(mockMode);
      setShowServiceNotice(mockMode);
    };
    initializeApi();
  }, []);

  const api = getApi();

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => api.auth.getCurrentUser(),
    staleTime: Infinity,
    enabled: !!authToken && apiInitialized,
  });

  React.useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    }
  }, [currentUser, setUser]);

  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      
      if (hash.startsWith('#/paymentResult')) {
        const urlParams = new URLSearchParams(hash.split('?')[1] || '');
        const outTradeNo = urlParams.get('out_trade_no');
        
        if (outTradeNo) {
          setCurrentView({ type: 'paymentResult', outTradeNo, orderId: outTradeNo });
          window.location.hash = '';
        }
      } else if (hash.startsWith('#paymentResult/')) {
        const outTradeNo = hash.replace('#paymentResult/', '');
        if (outTradeNo) {
          setCurrentView({ type: 'paymentResult', outTradeNo, orderId: outTradeNo });
          window.location.hash = '';
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [setCurrentView]);

  if (!authToken || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-black">
        <Suspense fallback={<PageLoading />}>
          <LoginPage />
        </Suspense>
      </div>
    );
  }

  if (isLoading) {
    return <PageLoading />;
  }

  const renderPage = () => {
    const wrapWithErrorBoundary = (page: React.ReactNode) => <ErrorBoundary>{page}</ErrorBoundary>;

    if (typeof currentView === 'object' && 'type' in currentView) {
      switch (currentView.type) {
        case 'conversation':
          return wrapWithErrorBoundary(
            <ConversationDetailPage conversationId={currentView.id} onBack={goBack} />
          );
        case 'agent':
        case 'agentDetail':
          return wrapWithErrorBoundary(
            <AgentDetailPage agentId={currentView.id} onBack={goBack} />
          );
        case 'verification':
          return wrapWithErrorBoundary(
            <VerificationPage showFormInitially={currentView.showFormInitially} />
          );
        case 'createAgent':
          return wrapWithErrorBoundary(<CreateAgentPage onBack={goBack} />);
        case 'myAgents':
          return wrapWithErrorBoundary(<MyAgentsPage onBack={goBack} />);
        case 'favorites':
          return wrapWithErrorBoundary(<FavoritesPage />);
        case 'marketplace':
          return wrapWithErrorBoundary(<DiscoverPage />);
        case 'capabilityPackageMarketplace':
          return wrapWithErrorBoundary(<CapabilityPackageMarketplacePage onBack={goBack} />);
        case 'myCapabilityPackages':
          return wrapWithErrorBoundary(<MyCapabilityPackagesPage onBack={goBack} />);
        case 'llmConfig':
          return wrapWithErrorBoundary(<LLMConfigPage onBack={goBack} />);

        case 'settings':
          return wrapWithErrorBoundary(<SettingsPage onBack={goBack} />);
        case 'orderConfirm':
          return wrapWithErrorBoundary(
            <OrderConfirmPage 
              assetType={currentView.assetType} 
              assetId={currentView.assetId} 
              onBack={goBack} 
            />
          );
        case 'paymentResult':
          return wrapWithErrorBoundary(
            <PaymentResultPage 
              orderId={currentView.orderId} 
              outTradeNo={currentView.outTradeNo || currentView.orderId}
              onBack={goBack} 
            />
          );
        case 'myOrders':
          return wrapWithErrorBoundary(<MyOrdersPage onBack={goBack} />);
        case 'agentChat':
          return wrapWithErrorBoundary(<AgentChatPage agentId={currentView.agentId} onBack={goBack} />);
        case 'createWork':
          return wrapWithErrorBoundary(<CreateWorkPage />);
        case 'privateContent':
          return wrapWithErrorBoundary(<PrivateContentPage />);
        case 'dataAnalytics':
          return wrapWithErrorBoundary(<DataAnalyticsPage />);
        case 'mediaManager':
          return wrapWithErrorBoundary(<MediaManagerPage />);
        case 'withdraw':
          return wrapWithErrorBoundary(<WithdrawPage />);
      }
    }

    switch (currentView) {
      case 'chat':
        return wrapWithErrorBoundary(<ChatPage />);
      case 'discover':
        return wrapWithErrorBoundary(<DiscoverPage />);
      case 'create':
        return wrapWithErrorBoundary(<DiscoverPage />);
      case 'notifications':
        return wrapWithErrorBoundary(<NotificationsPage />);
      case 'profile':
        return wrapWithErrorBoundary(<ProfilePage />);
      default:
        return wrapWithErrorBoundary(<ChatPage />);
    }
  };

  const showBottomNav = typeof currentView === 'string';

  const ServiceNotice = () => {
    if (!showServiceNotice) return null;
    
    return (
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-yellow-500/95 backdrop-blur-sm border-b border-yellow-400/30">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-900 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="text-yellow-900 text-sm font-medium">演示模式</p>
              <p className="text-yellow-900/80 text-xs mt-0.5">后端服务暂时不可用，当前使用模拟数据</p>
            </div>
            <button
              onClick={() => setShowServiceNotice(false)}
              className="text-yellow-900/60 hover:text-yellow-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background dark">
      <NetworkStatus />
      <ServiceNotice />
      <main className={`max-w-md mx-auto min-h-screen ${showServiceNotice ? 'pt-16' : ''}`}>
        <Suspense fallback={<PageLoading />}>
          <div className="page-transition">{renderPage()}</div>
        </Suspense>
      </main>
      {showBottomNav && <BottomNav />}
      <GlobalLoading />
    </div>
  );
};

const App: React.FC = () => {
  return <AppContent />;
};

export default App;
