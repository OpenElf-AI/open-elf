import React from 'react';
import { useAppStore } from '../store';
import { useFavorites } from '../hooks/useAgents';

const FavoritesPage: React.FC = () => {
  const { setCurrentView, goBack } = useAppStore();

  const { data: favoritesData, isLoading } = useFavorites();
  const agents = favoritesData?.items || [];

  const handleAgentCardClick = (agentId: string) => {
    setCurrentView({ type: 'agentDetail', id: agentId });
  };

  if (isLoading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
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
    );
  }

  return (
    <div className="bg-black min-h-screen flex flex-col">
      <div className="sticky top-0 bg-black/80 backdrop-blur-sm z-10 border-b border-white/5">
        <div className="flex items-center p-4">
          <button
            onClick={goBack}
            className="text-[#888888] hover:text-white transition-colors mr-4 p-1"
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
          <h1 className="text-white font-semibold text-lg">我的收藏</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        {!agents || agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-20 h-20 bg-[#121212] rounded-2xl flex items-center justify-center mb-5">
              <svg
                className="w-10 h-10 text-[#666666]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <p className="text-[#888888] text-base mb-2 text-center">暂无收藏</p>
            <p className="text-[#666666] text-sm text-center leading-relaxed mb-8">
              去市集发现喜欢的智能体，点击收藏吧！
            </p>
            <button
              onClick={() => setCurrentView({ type: 'discover' })}
              className="mt-6 px-8 py-4 bg-primary text-black rounded-xl font-semibold text-base hover:bg-primary/90 transition-colors active:scale-95"
            >
              去市集
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {agents.slice(0, 4).map(agent => (
              <div
                key={agent.id}
                onClick={() => handleAgentCardClick(agent.id)}
                className="bg-[#121212] rounded-2xl p-4 cursor-pointer hover:bg-[#1A1A1A] transition-colors active:scale-[0.98]"
              >
                <img
                  src={agent.avatar}
                  alt={agent.name}
                  className="w-full aspect-square rounded-xl mb-3 object-cover"
                />
                <h3 className="text-white font-medium text-base mb-1 truncate">{agent.name}</h3>
                <p className="text-[#888888] text-sm mb-2 line-clamp-2 leading-relaxed">
                  {agent.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-primary font-semibold text-sm">
                    ¥{agent.price.toFixed(1)}
                  </span>
                  <span className="text-[#666666] text-xs">{agent.likes} 喜欢</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
