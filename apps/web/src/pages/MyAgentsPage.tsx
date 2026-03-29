import React, { useState } from 'react';
import { useAppStore, useUserStore } from '../store';
import { useMyAgents } from '../hooks/useAgents';
import { SkeletonList } from '../components/Skeleton';

interface MyAgentsPageProps {
  onBack?: () => void;
}

const MyAgentsPage: React.FC<MyAgentsPageProps> = ({ onBack }) => {
  const { goBack, setCurrentView } = useAppStore();
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState<'created' | 'purchased'>('created');

  const { data: myAgents, isLoading } = useMyAgents();
  const createdAgents = myAgents?.filter(agent => agent.creatorId === user?.id) || [];
  const purchasedAgents = myAgents?.filter(agent => agent.creatorId !== user?.id) || [];

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '审核中';
      case 'approved':
        return '已通过';
      case 'rejected':
        return '已拒绝';
      default:
        return '未知';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400';
      case 'approved':
        return 'text-green-400';
      case 'rejected':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="bg-black min-h-screen">
      <div className="sticky top-0 bg-black/80 backdrop-blur-sm z-10 border-b border-white/5">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={onBack || goBack}
            className="text-[#888888] hover:text-white transition-colors"
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

      <div className="flex gap-2 p-4">
        <button
          onClick={() => setActiveTab('created')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            activeTab === 'created'
              ? 'bg-[#1677FF] text-white'
              : 'bg-[#121212] text-[#888888] hover:text-white'
          }`}
        >
          我创建的
        </button>
        <button
          onClick={() => setActiveTab('purchased')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
            activeTab === 'purchased'
              ? 'bg-[#1677FF] text-white'
              : 'bg-[#121212] text-[#888888] hover:text-white'
          }`}
        >
          我购买的
        </button>
      </div>

      {isLoading ? (
        <SkeletonList count={4} />
      ) : activeTab === 'created' ? (
        <div className="p-4">
          {createdAgents.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-20">
              <div className="w-24 h-24 rounded-2xl bg-[#121212] flex items-center justify-center mb-5">
                <svg
                  className="w-12 h-12 text-[#666666]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2 text-center">
                还没有创建智能体
              </h3>
              <p className="text-[#666666] text-sm text-center mb-8 leading-relaxed">
                成为认证创作者后，您可以创建自己的智能体
              </p>
              <button
                onClick={() => setCurrentView({ type: 'createAgent' })}
                className="bg-primary text-black px-8 py-4 rounded-xl font-semibold text-base hover:bg-primary/90 transition-colors active:scale-95"
              >
                创建智能体
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {createdAgents.map(agent => (
                <div key={agent.id} className="bg-[#121212] rounded-2xl p-4 border border-white/5">
                  <div className="flex items-start gap-4">
                    <img
                      src={agent.avatar}
                      alt={agent.name}
                      className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-white font-medium truncate flex-1 text-base">
                          {agent.name}
                        </h3>
                        <span
                          className={`text-sm font-medium ${getStatusColor(agent.status || 'pending')}`}
                        >
                          {getStatusText(agent.status || 'pending')}
                        </span>
                      </div>
                      <p className="text-[#888888] text-sm mb-3 line-clamp-2 leading-relaxed">
                        {agent.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-[#666666] text-xs">¥{agent.price.toFixed(2)}</span>
                        {agent.status === 'listed' && (
                          <span className="text-[#666666] text-xs">
                            已售出 {agent.soldCount} 个
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="p-4">
          {purchasedAgents.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-20">
              <div className="w-24 h-24 rounded-2xl bg-[#121212] flex items-center justify-center mb-5">
                <svg
                  className="w-12 h-12 text-[#666666]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2 text-center">
                还没有购买智能体
              </h3>
              <p className="text-[#666666] text-sm text-center mb-8 leading-relaxed">
                去广场浏览并购买感兴趣的智能体
              </p>
              <button
                onClick={() => setCurrentView('discover')}
                className="bg-primary text-black px-8 py-4 rounded-xl font-semibold text-base hover:bg-primary/90 transition-colors active:scale-95"
              >
                去广场
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {purchasedAgents.map(agent => (
                <div
                  key={agent.id}
                  className="bg-[#121212] rounded-2xl p-4 border border-white/5 cursor-pointer hover:border-[#1677FF]/40 transition-all"
                  onClick={() => setCurrentView({ type: 'agent', id: agent.id })}
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={agent.avatar}
                      alt={agent.name}
                      className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-white font-medium truncate flex-1 text-base">
                          {agent.name}
                        </h3>
                        <span className="text-[#1677FF] font-bold text-lg">
                          ¥{agent.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[#888888] text-sm mb-3 line-clamp-2 leading-relaxed">
                        {agent.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-[#666666] text-xs">@{agent.creatorName}</span>
                        <span className="text-[#666666] text-xs">点击查看详情</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyAgentsPage;
