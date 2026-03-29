import React, { useState } from 'react';
import { useAppStore } from '../store';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import { SkeletonList } from '../components/Skeleton';
import { useConversations, useDeleteConversation } from '../hooks/useConversations';

const ChatPage: React.FC = () => {
  const { setCurrentView } = useAppStore();
  const { showToast } = useToast();
  const { showConfirm } = useConfirm();
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditMode, setShowEditMode] = useState(false);
  const [selectedConversations, setSelectedConversations] = useState<string[]>([]);

  const { data: conversations = [], isLoading } = useConversations();
  const deleteConversationMutation = useDeleteConversation();

  const handleClearAll = () => {
    showConfirm({
      title: '清空所有对话',
      message: '确定要清空所有对话吗？此操作不可恢复。',
      confirmText: '确认清空',
      cancelText: '取消',
      onConfirm: async () => {
        try {
          for (const conversation of conversations) {
            await deleteConversationMutation.mutateAsync(conversation.id);
          }
          showToast('已清空所有对话', 'success');
        } catch (error) {
          showToast('清空失败，请稍后重试', 'error');
        }
      },
    });
  };

  const handleDeleteSelected = async () => {
    try {
      for (const id of selectedConversations) {
        await deleteConversationMutation.mutateAsync(id);
      }
      setSelectedConversations([]);
      setShowEditMode(false);
      showToast('已删除选中的对话', 'success');
    } catch (error) {
      showToast('删除失败，请稍后重试', 'error');
    }
  };

  const filteredConversations = searchQuery
    ? conversations.filter(
        c =>
          c.agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  const toggleConversationSelection = (id: string) => {
    setSelectedConversations(prev =>
      prev.includes(id) ? prev.filter(convId => convId !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedConversations.length === filteredConversations.length) {
      setSelectedConversations([]);
    } else {
      setSelectedConversations(filteredConversations.map(c => c.id));
    }
  };

  return (
    <div className="bg-black min-h-screen pb-24">
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-6">
          {showEditMode ? (
            <button
              className="text-white hover:text-[#888888] transition-colors"
              onClick={() => {
                setShowEditMode(false);
                setSelectedConversations([]);
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          ) : (
            <button
              className="text-white hover:text-[#888888] transition-colors"
              onClick={() => setShowMenu(!showMenu)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
          )}
          <h1 className="text-white font-semibold text-xl">
            {showEditMode ? `已选 ${selectedConversations.length}` : '对话'}
          </h1>
          <div className="flex items-center gap-3">
            {showEditMode ? (
              <>
                <button
                  className="text-white hover:text-[#888888] transition-colors"
                  onClick={selectAll}
                >
                  <span className="text-sm font-medium">
                    {selectedConversations.length === filteredConversations.length
                      ? '取消全选'
                      : '全选'}
                  </span>
                </button>
                {selectedConversations.length > 0 && (
                  <button
                    className="text-red-500 hover:text-red-400 transition-colors"
                    onClick={handleDeleteSelected}
                    disabled={deleteConversationMutation.isPending}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  className="text-white hover:text-[#888888] transition-colors"
                  onClick={() => {
                    setShowSearch(!showSearch);
                    if (showSearch) {
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
                  className="text-white hover:text-[#888888] transition-colors"
                  onClick={() => setShowEditMode(true)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {showSearch && (
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
                placeholder="搜索对话..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#121212] border border-white/5 rounded-2xl pl-11 pr-4 py-3.5 text-base text-white placeholder-[#666666] focus:outline-none focus:border-primary/50 transition-colors"
                autoFocus
              />
            </div>
          </div>
        )}

        {showMenu && (
          <div className="bg-[#121212] rounded-2xl p-4 mb-5 border border-white/5">
            <button
              className="w-full text-left py-3 hover:bg-[#1A1A1A] rounded-xl px-4 transition-colors"
              onClick={() => {
                setShowMenu(false);
                setCurrentView('discover');
              }}
            >
              <div className="flex items-center gap-3">
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span className="text-white">发现智能体</span>
              </div>
            </button>
            <button
              className="w-full text-left py-3 hover:bg-[#1A1A1A] rounded-xl px-4 transition-colors"
              onClick={() => {
                setShowMenu(false);
                handleClearAll();
              }}
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <span className="text-white">清空所有对话</span>
              </div>
            </button>
          </div>
        )}

        {isLoading ? (
          <SkeletonList count={4} />
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 px-4">
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-lg mb-2 text-center">开始一段新对话</h3>
            <p className="text-[#666666] text-sm text-center mb-8 leading-relaxed">
              探索各种智能体，开启你的AI之旅
            </p>
            <button
              onClick={() => setCurrentView('discover')}
              className="bg-primary text-black px-8 py-4 rounded-xl font-semibold text-base hover:bg-primary/90 transition-colors active:scale-95"
            >
              去发现智能体
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredConversations.map(conversation => (
              <div
                key={conversation.id}
                className={`w-full text-left rounded-2xl transition-colors ${
                  showEditMode
                    ? 'bg-[#121212] border border-white/5'
                    : 'hover:bg-[#121212] active:scale-[0.98]'
                }`}
              >
                <button
                  onClick={() => {
                    if (showEditMode) {
                      toggleConversationSelection(conversation.id);
                    } else {
                      setCurrentView({ type: 'conversation', id: conversation.id });
                    }
                  }}
                  className="w-full text-left p-4"
                >
                  <div className="flex items-start gap-4">
                    {showEditMode && (
                      <div className="flex items-center justify-center pt-1">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            selectedConversations.includes(conversation.id)
                              ? 'bg-primary border-primary'
                              : 'border-[#666666]'
                          }`}
                        >
                          {selectedConversations.includes(conversation.id) && (
                            <svg
                              className="w-4 h-4 text-black"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    )}
                    <img
                      src={conversation.agentAvatar}
                      alt={conversation.agentName}
                      className="w-16 h-16 sm:w-18 sm:h-18 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-white font-semibold text-lg truncate flex-1">
                          {conversation.agentName}
                        </h3>
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full flex-shrink-0">
                          doubao.com
                        </span>
                      </div>
                      <p className="text-[#888888] text-sm truncate leading-relaxed">
                        {conversation.lastMessage}
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
