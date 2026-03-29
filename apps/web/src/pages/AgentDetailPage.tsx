import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useToast } from '../components/Toast';
import { initApi, getApi } from '../api';
import { useDirectPurchase } from '../hooks/useDirectPurchase';

interface AgentDetailPageProps {
  agentId: string;
  onBack: () => void;
}

const AgentDetailPage: React.FC<AgentDetailPageProps> = ({ agentId, onBack }) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [apiInitialized, setApiInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState<'reviews' | 'achievements'>('reviews');
  const { handlePurchase, isPending } = useDirectPurchase();

  useEffect(() => {
    const initializeApi = async () => {
      await initApi();
      setApiInitialized(true);
    };
    initializeApi();
  }, []);

  const api = getApi();

  const { data: agent, isLoading: agentLoading } = useQuery({
    queryKey: ['agent', agentId],
    queryFn: async () => {
      if (!apiInitialized) return null;
      try {
        return await api.agents.getById(agentId);
      } catch (error) {
        console.error('Failed to fetch agent:', error);
        return null;
      }
    },
    enabled: apiInitialized && !!agentId,
  });

  const { data: followCounts, isLoading: followCountsLoading } = useQuery({
    queryKey: ['agentFollowCounts', agentId],
    queryFn: async () => {
      if (!apiInitialized || !api.agentFollows) return null;
      try {
        return await api.agentFollows.getAgentFollowCounts(agentId);
      } catch (error) {
        console.error('Failed to fetch follow counts:', error);
        return null;
      }
    },
    enabled: apiInitialized && !!agentId && !!api.agentFollows,
  });

  const { data: achievements = { items: [] }, isLoading: achievementsLoading } = useQuery({
    queryKey: ['agentAchievements', agentId],
    queryFn: async () => {
      if (!apiInitialized || !api.agentAchievements) return { items: [] };
      try {
        return await api.agentAchievements.getAgentAchievements(agentId);
      } catch (error) {
        console.error('Failed to fetch achievements:', error);
        return { items: [] };
      }
    },
    enabled: apiInitialized && !!agentId && !!api.agentAchievements,
  });

  const { data: followStatus, isLoading: followStatusLoading } = useQuery({
    queryKey: ['agentFollowStatus', agentId],
    queryFn: async () => {
      if (!apiInitialized || !api.agentFollows) return { isFollowing: false };
      try {
        return await api.agentFollows.checkFollowStatus(agentId);
      } catch (error) {
        console.error('Failed to check follow status:', error);
        return { isFollowing: false };
      }
    },
    enabled: apiInitialized && !!agentId && !!api.agentFollows,
  });

  const followMutation = useMutation({
    mutationFn: () => api.agentFollows!.followAgent(agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agentFollowStatus', agentId] });
      queryClient.invalidateQueries({ queryKey: ['agentFollowCounts', agentId] });
      showToast('已关注该智能体', 'success');
    },
    onError: () => {
      showToast('关注失败，请稍后重试', 'error');
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => api.agentFollows!.unfollowAgent(agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agentFollowStatus', agentId] });
      queryClient.invalidateQueries({ queryKey: ['agentFollowCounts', agentId] });
      showToast('已取消关注', 'info');
    },
    onError: () => {
      showToast('取消关注失败，请稍后重试', 'error');
    },
  });

  const handleFollowToggle = () => {
    if (followStatus?.isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'reviews':
        return (
          <div className="flex flex-col items-center justify-center pt-16 animate-fadeIn">
            <div className="w-24 h-24 bg-gradient-to-br from-[#1A1A1A] to-[#252525] rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-black/30">
              <div className="text-5xl">📝</div>
            </div>
            <h3 className="text-white font-semibold text-xl mb-3">暂无评价</h3>
            <p className="text-[#666666] text-base text-center mb-8 max-w-xs leading-relaxed">
              成为第一个评价该智能体的人吧
            </p>
          </div>
        );
      case 'achievements':
        if (achievementsLoading) {
          return (
            <div className="flex flex-col items-center justify-center pt-16 animate-fadeIn">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-[#666666] text-sm">加载中...</p>
            </div>
          );
        }
        if (!achievements.items || achievements.items.length === 0) {
          return (
            <div className="flex flex-col items-center justify-center pt-16 animate-fadeIn">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-yellow-500/10">
                <div className="text-5xl">🏆</div>
              </div>
              <h3 className="text-white font-semibold text-xl mb-3">还没有成就</h3>
              <p className="text-[#666666] text-base text-center mb-8 max-w-xs leading-relaxed">
                继续使用，解锁更多成就吧
              </p>
            </div>
          );
        }
        return (
          <div className="space-y-3 animate-fadeIn">
            {achievements.items.map((achievement, index) => (
              <div
                key={achievement.id}
                className="w-full bg-[#121212] rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-all duration-300 hover:bg-[#151515] shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center shadow-lg shadow-black/30">
                      {achievement.iconUrl ? (
                        <img src={achievement.iconUrl} alt={achievement.title} className="w-8 h-8" />
                      ) : (
                        <div className="text-2xl">🏅</div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium text-base mb-1 truncate">{achievement.title}</h3>
                    <p className="text-[#888888] text-sm mb-3 line-clamp-2 leading-relaxed">{achievement.description}</p>
                    <div className="text-[#666666] text-xs">
                      解锁于 {new Date(achievement.unlockedAt).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  if (agentLoading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="bg-black min-h-screen flex flex-col items-center justify-center p-4">
        <h3 className="text-white font-semibold text-xl mb-3">智能体不存在</h3>
        <button
          onClick={onBack}
          className="bg-gradient-to-r from-primary to-[#4096ff] text-white px-8 py-3 rounded-xl font-semibold"
        >
          返回
        </button>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen pb-24">
      <div className="p-4 sm:p-5">
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="text-white hover:text-[#888888] transition-colors mr-4"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4 group">
            <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-[#1A1A1A] to-[#252525] flex items-center justify-center overflow-hidden border-2 border-white/5 group-hover:border-primary/30 transition-all duration-300 shadow-xl shadow-black/30">
              <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
            </div>
          </div>

          <h1 className="text-white font-semibold text-2xl sm:text-3xl mb-2 bg-gradient-to-r from-white to-[#888888] bg-clip-text text-transparent">{agent.name}</h1>
          <p className="text-[#666666] text-sm mb-3 text-center max-w-md leading-relaxed">{agent.description}</p>

          <div className="w-full mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-gradient-to-r from-primary to-[#9254DE] text-white text-sm font-bold rounded-full">
                  Lv.{agent.level}
                </span>
              </div>
              <span className="text-[#666666] text-sm">
                {agent.exp} / {agent.expToNextLevel}
              </span>
            </div>
            <div className="w-full h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary via-[#9254DE] to-primary rounded-full transition-all duration-500"
                style={{ width: `${Math.min((agent.exp / agent.expToNextLevel) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="flex gap-3 flex-wrap justify-center mb-6">
            <button
              onClick={handleFollowToggle}
              disabled={followStatusLoading || followMutation.isPending || unfollowMutation.isPending}
              className={`px-8 py-3 rounded-xl font-medium text-base transition-all duration-300 active:scale-[0.97] border border-white/5 hover:border-white/10 shadow-lg shadow-black/20 hover:shadow-xl ${
                followStatus?.isFollowing
                  ? 'bg-[#1A1A1A] text-white hover:bg-[#252525]'
                  : 'bg-gradient-to-r from-primary to-[#4096ff] text-white hover:from-[#0958d9] hover:to-primary'
              }`}
            >
              {followStatus?.isFollowing ? '已关注' : '关注'}
            </button>
            <button
              onClick={() => handlePurchase('agent', agentId)}
              disabled={isPending}
              className="bg-[#1677FF] text-white px-8 py-3 rounded-xl font-medium text-base hover:bg-[#0958d9] transition-colors active:scale-[0.97] disabled:bg-[#333333] disabled:text-[#666666] disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-black/20 hover:shadow-xl"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  创建订单中...
                </>
              ) : (
                <>
                  <span>¥{agent.price.toFixed(2)}</span>
                  <span>立即购买</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-around w-full mb-8">
            <div className="flex flex-col items-center">
              <span className="text-white font-bold text-xl">
                {followCountsLoading ? '...' : followCounts?.followersCount || agent.fans || 0}
              </span>
              <span className="text-[#666666] text-sm">粉丝</span>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="flex flex-col items-center">
              <span className="text-white font-bold text-xl">{agent.soldCount}</span>
              <span className="text-[#666666] text-sm">售出</span>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="flex flex-col items-center">
              <span className="text-white font-bold text-xl">
                {achievementsLoading ? '...' : achievements.items?.length || 0}
              </span>
              <span className="text-[#666666] text-sm">成就</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-around mb-8 border-b border-white/10 pb-4 relative">
          {[
            { key: 'reviews', label: '评价' },
            { key: 'achievements', label: '成就' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'reviews' | 'achievements')}
              className={`pb-2 transition-all duration-300 relative z-10 touch-manipulation ${
                activeTab === tab.key
                  ? 'text-white font-semibold'
                  : 'text-[#666666] hover:text-[#888888] active:scale-[0.95]'
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <span className="relative">
                {tab.label}
                {activeTab === tab.key && (
                  <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-[#9254DE] to-primary rounded-full" />
                )}
              </span>
            </button>
          ))}
        </div>

        <div className="animate-fadeIn">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default AgentDetailPage;
