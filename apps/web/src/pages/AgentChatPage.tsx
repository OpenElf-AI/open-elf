import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { useToast } from '../components/Toast';
import { useAgent } from '../hooks/useAgents';
import {
  useCreateConversation,
  useMessages,
  useSendMessage,
  useGenerateReply,
} from '../hooks/useConversations';

interface AgentChatPageProps {
  agentId: string;
  onBack: () => void;
}

const AgentChatPage: React.FC<AgentChatPageProps> = ({ agentId, onBack }) => {
  const { setCurrentView } = useAppStore();
  const { showToast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);

  const { data: agent } = useAgent(agentId);
  const { data: messages = [], isLoading: messagesLoading } = useMessages(conversationId || '');
  const createConversationMutation = useCreateConversation();
  const sendMessageMutation = useSendMessage();
  const generateReplyMutation = useGenerateReply();

  useEffect(() => {
    if (agent && !conversationId) {
      createConversationMutation.mutate(agentId, {
        onSuccess: conversation => {
          setConversationId(conversation.id);
        },
        onError: error => {
          showToast(error instanceof Error ? error.message : '创建对话失败', 'error');
        },
      });
    }
  }, [agent, conversationId, agentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !conversationId) return;

    const content = inputValue.trim();
    setInputValue('');

    sendMessageMutation.mutate(
      {
        conversationId,
        agentId,
        content,
      },
      {
        onSuccess: async () => {
          setTimeout(async () => {
            if (conversationId) {
              await generateReplyMutation.mutateAsync(conversationId);
            }
          }, 800);
        },
        onError: error => {
          showToast(error instanceof Error ? error.message : '发送失败', 'error');
        },
      }
    );
  };

  const isThinking =
    sendMessageMutation.isPending ||
    (messages.length > 0 && messages[messages.length - 1].role === 'user' && !messagesLoading);

  const isOwned = agent && (agent.status === 'active' || agent.ownerId);

  if (!agent) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#888888]">加载中...</p>
        </div>
      </div>
    );
  }

  if (!isOwned) {
    return (
      <div className="bg-black min-h-screen flex flex-col">
        <div className="p-4 flex items-center gap-4 border-b border-white/10">
          <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-lg">
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-white font-semibold text-lg">智能体</h1>
        </div>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="w-24 h-24 rounded-2xl bg-[#121212] flex items-center justify-center mb-6 mx-auto">
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">请先购买此智能体</h3>
            <p className="text-[#888888] text-sm mb-6">购买后即可使用智能体进行对话</p>
            <button
              onClick={() =>
                setCurrentView({ type: 'orderConfirm', assetType: 'agent', assetId: agentId })
              }
              className="bg-[#1677FF] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#0958d9] transition-colors"
            >
              立即购买
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen flex flex-col">
      <div className="p-4 flex items-center gap-4 border-b border-white/10">
        <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div className="flex items-center gap-3 flex-1">
          <img
            src={agent.avatar}
            alt={agent.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-semibold text-base truncate">{agent.name}</h1>
            {agent.exclusiveId && (
              <p className="text-[#666666] text-xs font-mono">{agent.exclusiveId}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => setCurrentView({ type: 'myAgents' })}
          className="p-2 hover:bg-white/5 rounded-lg text-[#888888] hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messagesLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#1677FF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <img
              src={agent.avatar}
              alt={agent.name}
              className="w-20 h-20 rounded-full object-cover"
            />
            <p className="text-white text-center mt-4">
              你好，我是你的专属智能体，有什么可以帮你？
            </p>
          </div>
        ) : (
          <>
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user' ? 'bg-[#1677FF] text-white' : 'bg-[#1A1A1A] text-white'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex justify-start">
                <div className="bg-[#1A1A1A] rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-1">
                    <div
                      className="w-2 h-2 bg-[#666666] rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <div
                      className="w-2 h-2 bg-[#666666] rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <div
                      className="w-2 h-2 bg-[#666666] rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            placeholder="输入消息..."
            className="flex-1 bg-[#1A1A1A] text-white px-4 py-3 rounded-xl text-sm border border-white/10 focus:outline-none focus:border-[#1677FF]/50"
            disabled={sendMessageMutation.isPending}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || sendMessageMutation.isPending}
            className="bg-[#1677FF] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#0958d9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendMessageMutation.isPending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentChatPage;
