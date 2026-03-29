import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '../store';
import { useAppStore } from '../store';
import { useToast } from '../components/Toast';
import { getApi } from '../api';

interface SettingsPageProps {
  onBack: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
  const { user, logout } = useUserStore();
  const { setCurrentView } = useAppStore();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const api = getApi();

  const logoutMutation = useMutation({
    mutationFn: api.auth.logout,
    onSuccess: () => {
      logout();
      queryClient.setQueryData(['currentUser'], null);
      showToast('已退出登录', 'info');
    },
    onError: () => {
      showToast('退出失败，请稍后重试', 'error');
    },
  });

  const settingsItems = [
    {
      id: 'creatorCenter',
      show: user?.verificationStatus === 'verified',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      title: '创作者中心',
      subtitle: '管理你的智能体',
      view: { type: 'creatorCenter' } as const,
    },
    {
      id: 'myAgents',
      show: true,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      title: '我的智能体',
      subtitle: '查看和管理我的智能体',
      view: { type: 'myAgents' } as const,
    },
    {
      id: 'myCapabilityPackages',
      show: true,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
      ),
      title: '我的能力包',
      subtitle: '管理我的能力包',
      view: { type: 'myCapabilityPackages' } as const,
    },
    {
      id: 'llmConfig',
      show: true,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      title: 'LLM配置',
      subtitle: '配置你的AI模型API',
      view: { type: 'llmConfig' } as const,
    },
    {
      id: 'myOrders',
      show: true,
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      ),
      title: '我的订单',
      subtitle: '查看你的所有订单',
      view: { type: 'myOrders' } as const,
    },
  ];

  return (
    <div className="bg-black min-h-screen pb-24">
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="text-[#888888] hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-white font-semibold text-xl">设置</h1>
        </div>

        <button
          className="w-full text-left bg-[#121212] rounded-2xl p-4 sm:p-5 mb-6 border border-white/5 active:scale-[0.99] transition-transform"
          onClick={() => setCurrentView('discover')}
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-white font-medium text-sm sm:text-base">开启新话题</h3>
            </div>
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-[#666666] flex-shrink-0 ml-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        <div className="bg-[#121212] rounded-2xl p-4 sm:p-5 mb-6 border border-white/5">
          <div className="space-y-4">
            <button
              className="w-full text-left flex items-center gap-4 active:scale-[0.99] transition-transform"
              onClick={() => {
                showToast('记忆功能已开启，将自动保存对话记忆', 'info');
              }}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10h2"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-white font-medium text-sm sm:text-base">记忆</h3>
              </div>
              <span className="text-[#666666] text-xs sm:text-sm flex-shrink-0">已开启</span>
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-[#666666] flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {settingsItems
            .filter(item => item.show)
            .map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.view)}
                className="w-full text-left bg-[#121212] rounded-2xl p-4 flex items-center justify-between border border-white/5 active:scale-[0.99] transition-transform"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#1A1A1A] flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-medium text-sm sm:text-base">{item.title}</h3>
                    <p className="text-[#666666] text-xs sm:text-sm">{item.subtitle}</p>
                  </div>
                </div>
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-[#666666] flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            ))}
        </div>

        <div className="mt-8">
          <button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="w-full bg-[#121212] hover:bg-[#1A1A1A] text-red-500 rounded-2xl p-4 border border-white/5 active:scale-[0.99] transition-transform flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 0 01-3 3H6a3 0 01-3-3V7a3 0 013-3h4a3 0 013 3v1"
              />
            </svg>
            <span className="font-medium">
              {logoutMutation.isPending ? '退出中...' : '退出登录'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
