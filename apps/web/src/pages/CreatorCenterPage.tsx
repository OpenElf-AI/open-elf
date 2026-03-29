import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppStore, useUserStore } from '../store';
import { useToast } from '../components/Toast';

interface CreatorCenterPageProps {
  onBack: () => void;
}

const CreatorCenterPage: React.FC<CreatorCenterPageProps> = ({ onBack }) => {
  const { showToast } = useToast();
  const { setCurrentView } = useAppStore();
  const { user } = useUserStore();
  const queryClient = useQueryClient();

  return (
    <div className="bg-black min-h-screen pb-32">
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
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
            <h1 className="text-white font-semibold text-xl sm:text-2xl">创作者中心</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="text-[#888888] hover:text-white transition-colors"
              onClick={() => {
                queryClient.invalidateQueries();
                showToast('数据已刷新', 'success');
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
            <button
              className="text-[#888888] hover:text-white transition-colors"
              onClick={() => setCurrentView({ type: 'settings' })}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-[#121212] rounded-2xl p-5 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-6 h-6 text-[#888888]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <span className="text-[#888888] text-sm">已发行</span>
            </div>
            <div className="text-white text-3xl font-bold mb-1">0</div>
            <div className="text-[#666666] text-sm">个智能体</div>
          </div>
          <div className="bg-[#121212] rounded-2xl p-5 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-6 h-6 text-[#888888]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="text-[#888888] text-sm">总销量</span>
            </div>
            <div className="text-white text-3xl font-bold mb-1">0</div>
            <div className="text-[#666666] text-sm">份</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl p-5 border border-yellow-500/20 mb-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <svg
                  className="w-6 h-6 text-yellow-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-yellow-500 font-semibold text-lg">累计收益</span>
              </div>
              <div className="text-yellow-500 text-4xl font-bold">¥0.00</div>
            </div>
            <button
              className="bg-[#333333] hover:bg-[#444444] text-white px-6 py-3 rounded-xl font-medium transition-colors active:scale-95"
              onClick={() => setCurrentView({ type: 'withdraw' })}
            >
              提现
            </button>
          </div>
        </div>

        {user?.verificationStatus === 'pending' && (
          <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 rounded-2xl p-5 border border-orange-500/20 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-7 h-7 text-orange-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">认证审核中</h3>
                <p className="text-[#888888] text-sm">我们会尽快审核您的申请</p>
              </div>
            </div>
          </div>
        )}

        {user?.verificationStatus === 'unverified' && (
          <div className="bg-gradient-to-r from-primary/10 to-[#4096ff]/10 rounded-2xl p-5 border border-primary/20 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-7 h-7 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-1">成为创作者</h3>
                <p className="text-[#888888] text-sm mb-3">完成认证，开始发行您的智能体</p>
              </div>
              <button
                className="bg-gradient-to-r from-primary to-[#4096ff] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.97]"
                onClick={() => setCurrentView({ type: 'verification' })}
              >
                立即认证
              </button>
            </div>
          </div>
        )}

        {user?.verificationStatus === 'verified' && (
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-5 border border-green-500/20 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-7 h-7 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">已认证创作者</h3>
                <p className="text-[#888888] text-sm">欢迎开始您的创作之旅</p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-white font-semibold text-lg mb-4">快捷操作</h2>
          <div className="grid grid-cols-3 gap-4">
            <button
              className="bg-[#121212] rounded-2xl p-5 border border-white/5 flex flex-col items-center gap-3 hover:bg-[#1A1A1A] transition-colors active:scale-[0.98]"
              onClick={() => {
                if (user?.verificationStatus === 'verified') {
                  setCurrentView({ type: 'createAgent' });
                } else {
                  setCurrentView({ type: 'verification' });
                }
              }}
            >
              <div className={`w-14 h-14 rounded-full ${user?.verificationStatus === 'verified' ? 'bg-green-500/20' : 'bg-yellow-500/20'} flex items-center justify-center`}>
                <svg
                  className={`w-7 h-7 ${user?.verificationStatus === 'verified' ? 'text-green-500' : 'text-yellow-500'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <span className="text-white text-sm font-medium">创建智能体</span>
              {user?.verificationStatus !== 'verified' && (
                <span className="text-[#666666] text-xs">需认证</span>
              )}
            </button>
            <button
              className="bg-[#121212] rounded-2xl p-5 border border-white/5 flex flex-col items-center gap-3 hover:bg-[#1A1A1A] transition-colors active:scale-[0.98]"
              onClick={() => setCurrentView({ type: 'dataAnalytics' })}
            >
              <div className="w-14 h-14 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-yellow-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <span className="text-white text-sm font-medium">数据报表</span>
            </button>
            <button
              className="bg-[#121212] rounded-2xl p-5 border border-white/5 flex flex-col items-center gap-3 hover:bg-[#1A1A1A] transition-colors active:scale-[0.98]"
              onClick={() => setCurrentView({ type: 'mediaManager' })}
            >
              <div className="w-14 h-14 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-yellow-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <span className="text-white text-sm font-medium">素材管理</span>
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-lg">我发行的智能体</h2>
            <button
              className="text-yellow-500 hover:text-yellow-400 transition-colors flex items-center gap-1 text-sm font-medium"
              onClick={() => {
                if (user?.verificationStatus === 'verified') {
                  setCurrentView({ type: 'createAgent' });
                } else {
                  setCurrentView({ type: 'verification' });
                }
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              新建
            </button>
          </div>
          {user?.verificationStatus === 'verified' ? (
            <div className="bg-[#121212] rounded-2xl p-8 border border-white/5 text-center">
              <div className="w-16 h-16 rounded-xl bg-[#1A1A1A] flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-[#666666]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <p className="text-[#666666] text-base">您还没有发行智能体</p>
            </div>
          ) : (
            <div className="bg-[#121212] rounded-2xl p-8 border border-white/5 text-center">
              <div className="w-16 h-16 rounded-xl bg-[#1A1A1A] flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-[#666666]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <p className="text-[#666666] text-base">完成认证后，即可发行智能体</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorCenterPage;
