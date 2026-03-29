import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useUserStore } from '../store';
import {
  useConversation,
  useMessages,
  useSendMessage,
  useGenerateReply,
} from '../hooks/useConversations';
import { useAgent, useMyAgents, useAddAgentExp } from '../hooks/useAgents';

interface ConversationDetailPageProps {
  conversationId: string;
  onBack: () => void;
}

const ConversationDetailPage: React.FC<ConversationDetailPageProps> = ({
  conversationId,
  onBack,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useUserStore();

  const { data: conversation } = useConversation(conversationId);
  const { data: agent } = useAgent(conversation?.agentId || '');
  const { data: myAgents = [] } = useMyAgents();
  const { data: messages = [] } = useMessages(conversationId);
  const addExpMutation = useAddAgentExp();
  const sendMessageMutation = useSendMessage();
  const generateReplyMutation = useGenerateReply();

  const myAgent = myAgents.find(a => a.id === conversation?.agentId);

  const isListed = agent?.status === 'listed';
  const isChatPublic = agent?.isChatPublic || false;
  const isOwner = agent?.ownerId === user?.id;
  const hasPermission = !isListed && (isOwner || isChatPublic);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || sendMessageMutation.isPending || generateReplyMutation.isPending)
      return;

    const text = inputText;
    setInputText('');

    await sendMessageMutation.mutateAsync({
      conversationId,
      content: text,
    });

    await generateReplyMutation.mutateAsync(conversationId);

    if (myAgent && conversation?.agentId) {
      addExpMutation.mutate({ agentId: conversation.agentId, expAmount: 5 });
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return format(date, 'HH:mm');
    return format(date, 'MM-dd HH:mm', { locale: zhCN });
  };

  return (
    <div className="bg-black min-h-screen flex flex-col">
      <div className="sticky top-0 bg-black/80 backdrop-blur-sm z-10 border-b border-white/5">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={onBack}
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
          {conversation && (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <img
                src={myAgent?.avatar || agent?.avatar || conversation.agentAvatar}
                alt={myAgent?.name || agent?.name || conversation.agentName}
                className="w-10 h-10 rounded-full flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-white font-medium text-base truncate">
                  {myAgent?.name || agent?.name || conversation.agentName}
                </h1>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {myAgent && (
                    <>
                      <span className="text-primary text-xs font-semibold">Lv.{myAgent.level}</span>
                      <span className="text-[#666666] text-xs">•</span>
                      <span className="text-[#666666] text-xs">
                        {myAgent.fans.toLocaleString()} 粉丝
                      </span>
                      <span className="text-[#666666] text-xs">•</span>
                    </>
                  )}
                  {agent && !myAgent && (
                    <>
                      <span className="text-[#666666] text-xs">Lv.{agent.level}</span>
                      <span className="text-[#666666] text-xs">•</span>
                      <span className="text-[#666666] text-xs">
                        {agent.fans.toLocaleString()} 粉丝
                      </span>
                      <span className="text-[#666666] text-xs">•</span>
                    </>
                  )}
                  <span className="text-[#666666] text-xs">{conversation.messageCount} 条消息</span>
                </div>
                {myAgent && (
                  <div className="w-full bg-[#1A1A1A] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${(myAgent.exp / myAgent.expToNextLevel) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {message.role === 'assistant' && conversation && (
              <img
                src={conversation.agentAvatar}
                alt={conversation.agentName}
                className="w-9 h-9 rounded-full flex-shrink-0"
              />
            )}
            {message.role === 'user' && (
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            )}
            <div
              className={`max-w-[80%] sm:max-w-[75%] ${message.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}
            >
              <div
                className={`px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-primary text-black rounded-tr-sm'
                    : 'bg-[#1A1A1A] text-white rounded-tl-sm'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
              </div>
              <span className="text-[#666666] text-xs mt-1 px-1">
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        ))}

        {(sendMessageMutation.isPending || generateReplyMutation.isPending) && (
          <div className="flex gap-3">
            {conversation && (
              <div className="relative">
                <img
                  src={conversation.agentAvatar}
                  alt={conversation.agentName}
                  className="w-9 h-9 rounded-full flex-shrink-0"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-primary rounded-full border-2 border-black flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                </div>
              </div>
            )}
            <div className="bg-[#1A1A1A] px-4 py-3.5 rounded-2xl rounded-tl-sm shadow-sm">
              <div className="flex gap-2 items-end">
                <div
                  className="w-2.5 h-2.5 bg-gradient-to-r from-primary to-amber-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <div
                  className="w-2.5 h-2.5 bg-gradient-to-r from-primary to-amber-400 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <div
                  className="w-2.5 h-2.5 bg-gradient-to-r from-primary to-amber-400 rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {!hasPermission && (
        <div className="p-4 bg-[#121212] border-t border-white/10">
          <div className="text-center text-[#888888] text-sm">
            {isListed ? '该智能体未成交，暂不开放对话' : '该智能体未开放公开对话'}
          </div>
        </div>
      )}
      {hasPermission && (
        <div className="sticky bottom-0 bg-black/95 backdrop-blur-xl border-t border-white/10 p-4">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="输入消息..."
                className="w-full bg-[#1A1A1A] rounded-2xl px-4 py-3 pr-12 text-white placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none max-h-32 min-h-[52px] text-sm transition-all"
                rows={1}
                style={{
                  height: Math.min(52, Math.max(52, inputText.split('\n').length * 24 + 20)),
                }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={
                !inputText.trim() ||
                sendMessageMutation.isPending ||
                generateReplyMutation.isPending
              }
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                inputText.trim() &&
                !sendMessageMutation.isPending &&
                !generateReplyMutation.isPending
                  ? 'bg-primary text-black hover:bg-primary/90 hover:scale-105 shadow-lg shadow-primary/25'
                  : 'bg-[#1A1A1A] text-[#666666]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationDetailPage;
