import React, { useState } from 'react';
import { useAppStore } from '../store';
import { useMyAgents } from '../hooks/useAgents';
import { useCreateConversation } from '../hooks/useConversations';
import { useToast } from '../components/Toast';

const MyAgentsPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { setCurrentView, goBack } = useAppStore();
  const [activeTab, setActiveTab] = useState<'purchased' | 'created'>('purchased');
  const { showToast } = useToast();

  const { data: myAgents = [], isLoading } = useMyAgents();
  const createConversationMutation = useCreateConversation();

  const purchasedAgents = myAgents.filter(a => a.status === 'active' || a.ownerId);

  const handleStartChat = (agentId: string) => {
    createConversationMutation.mutate(agentId, {
      onSuccess: () => {
        setCurrentView({ type: 'agentChat', agentId });
      },
      onError: (error) => {
        showToast(error instanceof Error ? error.message : '创建对话失败，请重试', 'error');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="bg-black min-h-screen flex flex-col">
        <div className="sticky top-0 bg-black/80 backdrop-blur-sm z-10 border-b border-white/5">
          <div className="flex items-center gap-4 p-4">
            <button
              onClick={onBack || goBack}
              className="text-[#888888] hover:text-white transition-colors p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-white font-semibold text-xl">我的智能体</h1>
          </div>
        </div>
        <div className="flex items-center justify-center pt-24">
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-2">
              <div
                className="w-2.5 h-2.5 bg-[#666666] rounded-full animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <div
                className="w-2.5 h-2.5 bg-[#666666] rounded-full animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <div
                className="w-2.5 h-2.5 bg-[#666666] rounded-full animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </div>
            <p className="text-[#666666] text-base">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen flex flex-col">
      <div className="sticky top-0 bg-black/80 backdrop-blur-sm z-10 border-b border-white/5">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={onBack || goBack}
            className="text-[#888888] hover:text-white transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-white font-semibold text-xl">我的智能体</h1>
        </div>
      </div>

      <div className="p-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('purchased')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'purchased'
                ? 'bg-[#1677FF] text-white'
                : 'bg-[#121212] text-[#888888] hover:text-white'
            }`}
          >
            我购买的
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {activeTab === 'purchased' ? (
          purchasedAgents.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-24">
              <div className="w-24 h-24 rounded-2xl bg-[#121212] flex items-center justify-center mb-5">
                <svg className="w-12 h-12 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2 text-center">
                还没有购买的智能体
              </h3>
              <p className="text-[#666666] text-sm text-center mb-8 leading-relaxed">
                去广场选购吧
              </p>
              <button
                onClick={() => setCurrentView('discover')}
                className="bg-[#1677FF] text-white px-8 py-4 rounded-xl font-semibold text-base active:scale-[0.95] transition-colors"
              >
                去广场
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {purchasedAgents.map(agent => (
                <div
                  key={agent.id}
                  className="w-full text-left bg-[#121212] rounded-2xl p-4 border border-white/5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium text-base truncate">{agent.name}</h3>
                          {agent.exclusiveId && (
                            <p className="text-[#666666] text-xs font-mono mt-1">{agent.exclusiveId}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="px-2.5 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-semibold">
                            已激活
                          </span>
                        </div>
                      </div>
                      <p className="text-[#888888] text-sm mb-3 line-clamp-2 leading-relaxed">
                        {agent.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-[#666666] text-sm">
                          <span>Lv.{agent.level}</span>
                          <span>•</span>
                          <span>{agent.fans.toLocaleString()} 粉丝</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-end mt-3 pt-2 border-t border-white/5">
                        <button
                          onClick={() => handleStartChat(agent.id)}
                          disabled={createConversationMutation.isPending}
                          className="bg-[#1677FF] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#0958d9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.95]"
                        >
                          {createConversationMutation.isPending ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            '进入对话'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : null}
      </div>
    </div>
  );
};

export default MyAgentsPage;
