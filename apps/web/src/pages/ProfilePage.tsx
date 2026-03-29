import React, { useState } from 'react';
import { useUserStore } from '../store';
import { useAppStore } from '../store';
import { useToast } from '../components/Toast';
import { useMyAgents, useMyFollowingAgents } from '../hooks/useAgents';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useUserStore();
  const { setCurrentView } = useAppStore();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'agents' | 'favorites'>('agents');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [tabTransitionKey, setTabTransitionKey] = useState(0);

  const { data: userAgents = [], isLoading: agentsLoading } = useMyAgents();
  const { data: followingData, isLoading: favoritesLoading } = useMyFollowingAgents();
  const favoriteAgents = followingData?.items || [];

  const handleEditProfile = () => {
    if (user) {
      setEditName(user.name);
      setShowEditModal(true);
    }
  };

  const handleSaveProfile = () => {
    if (editName.trim()) {
      updateUser({ name: editName.trim() });
      setShowEditModal(false);
      showToast('个人资料已更新', 'success');
    } else {
      showToast('昵称不能为空', 'error');
    }
  };

  const handleTabChange = (newTab: 'agents' | 'favorites') => {
    if (newTab !== activeTab) {
      setTabTransitionKey(prev => prev + 1);
      setActiveTab(newTab);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'agents':
        if (agentsLoading) {
          return (
            <div className="flex flex-col items-center justify-center pt-16 animate-fadeIn">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-[#666666] text-sm">加载中...</p>
            </div>
          );
        }
        if (userAgents.length === 0) {
          return (
            <div className="flex flex-col items-center justify-center pt-16 animate-fadeIn">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-[#9254DE]/20 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-primary/20">
                <div className="text-5xl">🤖</div>
              </div>
              <h3 className="text-white font-semibold text-xl mb-3">还没有智能体</h3>
              <p className="text-[#666666] text-base text-center mb-8 max-w-xs leading-relaxed">
                去广场发现喜欢的智能体，开始你的智能之旅
              </p>
              <button
                onClick={() => setCurrentView('discover')}
                className="bg-gradient-to-r from-primary to-[#4096ff] text-white px-10 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:from-[#0958d9] hover:to-primary active:scale-[0.97] shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
              >
                去广场
              </button>
            </div>
          );
        }
        return (
          <div className="space-y-3 animate-fadeIn">
            {userAgents.map((agent, index) => (
              <button
                key={agent.id}
                onClick={() => setCurrentView({ type: 'agent', id: agent.id })}
                className="w-full text-left bg-[#121212] rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-all duration-300 hover:bg-[#151515] active:scale-[0.99] shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0">
                    <img
                      src={agent.avatar}
                      alt={agent.name}
                      className="w-14 h-14 rounded-xl shadow-lg shadow-black/30"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center border-2 border-[#121212]">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium text-base mb-1 truncate flex items-center gap-2">
                      {agent.name}
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                        Lv.{agent.level}
                      </span>
                    </h3>
                    <p className="text-[#888888] text-sm mb-3 line-clamp-2 leading-relaxed">
                      {agent.description}
                    </p>
                    <div className="flex items-center gap-3 text-[#666666] text-xs">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {agent.fans} 粉丝
                      </span>
                      <span className="w-1 h-1 bg-[#333333] rounded-full"></span>
                      <span className="text-[#666666]">ID: {agent.id.slice(-6)}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        );
      case 'favorites':
        if (favoritesLoading) {
          return (
            <div className="flex flex-col items-center justify-center pt-16 animate-fadeIn">
              <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-[#666666] text-sm">加载中...</p>
            </div>
          );
        }
        if (favoriteAgents.length === 0) {
          return (
            <div className="flex flex-col items-center justify-center pt-16 animate-fadeIn">
              <div className="w-24 h-24 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-red-500/10">
                <div className="text-5xl">❤️</div>
              </div>
              <h3 className="text-white font-semibold text-xl mb-3">还没有收藏</h3>
              <p className="text-[#666666] text-base text-center mb-8 max-w-xs leading-relaxed">
                去广场发现喜欢的智能体，收藏它们吧
              </p>
              <button
                onClick={() => setCurrentView('discover')}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-10 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:from-red-600 hover:to-pink-600 active:scale-[0.97] shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30"
              >
                去发现
              </button>
            </div>
          );
        }
        return (
          <div className="space-y-3 animate-fadeIn">
            {favoriteAgents.map((agent, index) => (
              <button
                key={agent.id}
                onClick={() => setCurrentView({ type: 'agent', id: agent.id })}
                className="w-full text-left bg-[#121212] rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-all duration-300 hover:bg-[#151515] active:scale-[0.99] shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0">
                    <img
                      src={agent.avatar}
                      alt={agent.name}
                      className="w-14 h-14 rounded-xl shadow-lg shadow-black/30"
                    />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center border-2 border-[#121212]">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium text-base mb-1 truncate">{agent.name}</h3>
                    <p className="text-[#888888] text-sm mb-3 line-clamp-2 leading-relaxed">
                      {agent.description}
                    </p>
                    <div className="flex items-center gap-3 text-[#666666] text-xs">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {agent.conversationCount || 0} 人聊过
                      </span>
                      <span className="w-1 h-1 bg-[#333333] rounded-full"></span>
                      <span className="flex items-center gap-1">
                        {agent.creatorAvatar && (
                          <img src={agent.creatorAvatar} alt="" className="w-4 h-4 rounded-full" />
                        )}
                        @{agent.creatorName || '未知创作者'}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-black min-h-screen pb-24">
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-end mb-8">
          <button
            onClick={() => setCurrentView({ type: 'settings' })}
            className="text-white hover:text-[#888888] transition-colors"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31-.826 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4 group">
            <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-[#1A1A1A] to-[#252525] flex items-center justify-center overflow-hidden border-2 border-white/5 group-hover:border-primary/30 transition-all duration-300 shadow-xl shadow-black/30">
              <img src={user?.avatar} alt={user?.name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-gradient-to-br from-primary to-[#0958d9] rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812-1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-white font-semibold text-2xl sm:text-3xl mb-2 bg-gradient-to-r from-white to-[#888888] bg-clip-text text-transparent">
            {user?.name}
          </h1>
          <p className="text-[#666666] text-sm mb-3 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            OpenElf 号: {user?.id.slice(-8)}
          </p>

          <div className="flex gap-3 flex-wrap justify-center mb-6">
            <button
              className="bg-[#1A1A1A] hover:bg-[#252525] text-white px-6 py-3 rounded-xl font-medium text-base transition-all duration-300 active:scale-[0.97] border border-white/5 hover:border-white/10 shadow-lg shadow-black/20 hover:shadow-xl"
              onClick={handleEditProfile}
            >
              编辑个人资料
            </button>
            <button
              className="bg-[#1A1A1A] hover:bg-[#252525] text-white px-6 py-3 rounded-xl font-medium text-base transition-all duration-300 active:scale-[0.97] border border-white/5 hover:border-white/10 shadow-lg shadow-black/20 hover:shadow-xl"
              onClick={() => setCurrentView({ type: 'verification', showFormInitially: true })}
            >
              创作者认证
            </button>
            {user?.verificationStatus === 'verified' && (
              <button
                className="bg-[#1A1A1A] hover:bg-[#252525] text-white px-6 py-3 rounded-xl font-medium text-base transition-all duration-300 active:scale-[0.97] border border-white/5 hover:border-white/10 shadow-lg shadow-black/20 hover:shadow-xl"
                onClick={() => setCurrentView({ type: 'createAgent' })}
              >
                创建智能体
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-around mb-8 border-b border-white/10 pb-4 relative">
          {[
            { key: 'agents', label: '智能体' },
            { key: 'favorites', label: '收藏' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key as 'agents' | 'favorites')}
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

        <div key={tabTransitionKey} className="animate-fadeIn">
          {renderTabContent()}
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fadeIn"
            onClick={() => setShowEditModal(false)}
          />
          <div className="absolute inset-0 flex items-end sm:items-center justify-center">
            <div className="bg-[#121212] w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 sm:p-8 animate-slideUp shadow-2xl shadow-black/50 border-t border-white/5">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-semibold text-xl">编辑个人资料</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-[#888888] hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <label className="text-[#888888] text-sm block mb-2 font-medium">昵称</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleSaveProfile();
                    }
                  }}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="请输入昵称"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-[#1A1A1A] text-white py-3 rounded-xl font-medium hover:bg-[#252525] transition-all active:scale-[0.97] border border-white/5"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={!editName.trim()}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all active:scale-[0.97] ${
                    editName.trim()
                      ? 'bg-primary text-black hover:bg-primary/90 shadow-lg shadow-primary/20'
                      : 'bg-[#333333] text-[#666666] cursor-not-allowed'
                  }`}
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
