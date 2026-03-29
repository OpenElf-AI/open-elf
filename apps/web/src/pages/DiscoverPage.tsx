import React, { useState } from 'react';
import { useAppStore } from '../store';
import { useAgents } from '../hooks/useAgents';
import type { Agent } from '../api/types';

import { SkeletonList } from '../components/Skeleton';

interface AgentCardProps {
  agent: Agent;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  const { setCurrentView } = useAppStore();

  return (
    <div 
      className="w-full bg-[#121212] rounded-2xl p-4 sm:p-4 border border-[#1677FF]/20 hover:border-[#1677FF]/40 transition-all duration-200 hover:shadow-[0_0_20px_rgba(22,119,255,0.1)] cursor-pointer active:scale-[0.98]"
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
            <span className="text-[#1677FF] font-bold text-lg">¥{agent.price.toFixed(2)}</span>
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
  );
};


const DiscoverPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'agents' | 'capabilities'>('agents');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price-high' | 'price-low'>('newest');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const { setCurrentView } = useAppStore();

  const { data: agentsData, isLoading: agentsLoading } = useAgents();
  const agents = agentsData?.items || [];

  const isLoading = agentsLoading;

  const filteredAndSortedAgents = React.useMemo(() => {
    let result = [...agents];
    
    if (searchQuery) {
      result = result.filter(
        a =>
          a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
    }

    return result;
  }, [agents, searchQuery, sortBy]);

  if (isLoading) {
    return (
      <div className="bg-black min-h-screen pb-24">
        <div className="p-4 sm:p-5">
          <SkeletonList count={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen pb-24">
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-white font-semibold text-xl">广场</h1>
          <div className="flex items-center gap-3">
            <button
              className="text-[#888888] hover:text-white transition-colors"
              onClick={() => {
                setShowSearchInput(!showSearchInput);
                if (!showSearchInput) {
                  setSearchQuery('');
                }
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            <button
              onClick={() => setCurrentView({ type: 'createAgent' })}
              className="bg-primary text-black px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors active:scale-95 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              发布
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('agents')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === 'agents'
                ? 'bg-[#1677FF] text-white'
                : 'bg-[#121212] text-[#888888] hover:text-white'
            }`}
          >
            智能体
          </button>
          <button
            onClick={() => setActiveTab('capabilities')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              activeTab === 'capabilities'
                ? 'bg-[#9254DE] text-white'
                : 'bg-[#121212] text-[#888888] hover:text-white'
            }`}
          >
            能力包
          </button>
        </div>

        {showSearchInput && (
          <div className="mb-5">
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder={activeTab === 'agents' ? '搜索智能体...' : '搜索能力包...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#121212] border border-white/5 rounded-2xl pl-11 pr-4 py-3.5 text-base text-white placeholder-[#666666] focus:outline-none focus:border-[#1677FF]/50 transition-colors"
                autoFocus
              />
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setSortBy('newest')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              sortBy === 'newest'
                ? (activeTab === 'agents' ? 'bg-[#1677FF]' : 'bg-[#9254DE]') + ' text-white'
                : 'bg-[#121212] text-[#888888] hover:text-white'
            }`}
          >
            最新上架
          </button>
          <button
            onClick={() => setSortBy('price-high')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              sortBy === 'price-high'
                ? (activeTab === 'agents' ? 'bg-[#1677FF]' : 'bg-[#9254DE]') + ' text-white'
                : 'bg-[#121212] text-[#888888] hover:text-white'
            }`}
          >
            价格从高到低
          </button>
          <button
            onClick={() => setSortBy('price-low')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              sortBy === 'price-low'
                ? (activeTab === 'agents' ? 'bg-[#1677FF]' : 'bg-[#9254DE]') + ' text-white'
                : 'bg-[#121212] text-[#888888] hover:text-white'
            }`}
          >
            价格从低到高
          </button>
        </div>

        {activeTab === 'agents' && (
          <>
            {filteredAndSortedAgents.length === 0 ? (
              <div className="flex flex-col items-center justify-center pt-24 px-4">
                <div className="w-24 h-24 rounded-2xl bg-[#121212] flex items-center justify-center mb-5">
                  <svg className="w-12 h-12 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-white font-semibold text-lg mb-2 text-center">
                  {searchQuery ? '没有找到相关智能体' : '暂无上架的智能体'}
                </h3>
                <p className="text-[#666666] text-sm text-center leading-relaxed mb-6">
                  {searchQuery ? '试试其他关键词' : '稍后再来看看吧'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAndSortedAgents.map(agent => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'capabilities' && (
          <div className="flex flex-col items-center justify-center pt-24 px-4">
            <div className="w-24 h-24 rounded-2xl bg-[#121212] flex items-center justify-center mb-5">
              <svg className="w-12 h-12 text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-lg mb-2 text-center">
              能力包功能开发中
            </h3>
            <p className="text-[#666666] text-sm text-center leading-relaxed">
              敬请期待
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverPage;
