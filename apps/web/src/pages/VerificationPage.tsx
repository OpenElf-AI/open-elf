import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore, useUserStore } from '../store';
import { getApi, initApi } from '../api';
import { useToast } from '../components/Toast';
import { parseError, logError } from '../utils/errorHandler';

interface VerificationPageProps {
  showFormInitially?: boolean;
}

const VerificationPage: React.FC<VerificationPageProps> = ({ showFormInitially = false }) => {
  const { goBack, setCurrentView } = useAppStore();
  const { user, setUser } = useUserStore();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [showForm, setShowForm] = useState(showFormInitially);
  const [platform, setPlatform] = useState('');
  const [username, setUsername] = useState('');
  const [followers, setFollowers] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [api, setApi] = useState<any>(null);

  const platforms = ['小红书', '抖音', 'B站', '微博', '其他'];

  useEffect(() => {
    const initializeApi = async () => {
      await initApi();
      setApi(getApi());
    };
    initializeApi();
  }, []);

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!api) throw new Error('API not initialized');
      return api.verification.submit({
        platform,
        username,
        followers: parseInt(followers),
        proofUrl,
      });
    },
    onSuccess: updatedUser => {
      setUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      showToast('认证申请已提交，请等待审核', 'success');
    },
    onError: (error) => {
      logError(error, 'VerificationPage.submit');
      const errorInfo = parseError(error);
      showToast(errorInfo.message, 'error');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate();
  };

  const isFormValid = platform && username && followers && parseInt(followers) >= 10000 && proofUrl;

  if (user?.verificationStatus === 'pending') {
    return (
      <div className="bg-black min-h-screen flex flex-col">
        <div className="sticky top-0 bg-black/80 backdrop-blur-sm z-10 border-b border-white/5">
          <div className="flex items-center gap-4 p-4">
            <button onClick={goBack} className="text-[#888888] hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-white font-semibold text-xl">创作者认证</h1>
          </div>
        </div>

        <div className="flex-1 p-5">
          <div className="flex flex-col items-center justify-center pt-20">
            <div className="w-20 h-20 rounded-full bg-[#121212] flex items-center justify-center mb-6">
              <svg
                className="w-10 h-10 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-white font-semibold text-xl mb-2">审核中</h2>
            <p className="text-[#888888] text-sm text-center mb-4">
              您的认证资料已提交，我们将在 1-3 个工作日内完成审核
            </p>
            <div className="bg-[#121212] rounded-2xl p-4 w-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#666666] text-sm">平台</span>
                <span className="text-white text-sm">{user.verificationPlatform}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#666666] text-sm">粉丝数</span>
                <span className="text-white text-sm">
                  {user.verificationFollowers?.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#666666] text-sm">提交时间</span>
                <span className="text-white text-sm">
                  {user.verificationSubmitTime
                    ? new Date(user.verificationSubmitTime).toLocaleDateString('zh-CN')
                    : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user?.verificationStatus === 'verified') {
    return (
      <div className="bg-black min-h-screen flex flex-col">
        <div className="sticky top-0 bg-black/80 backdrop-blur-sm z-10 border-b border-white/5">
          <div className="flex items-center gap-4 p-4">
            <button onClick={goBack} className="text-[#888888] hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-white font-semibold text-xl">创作者认证</h1>
          </div>
        </div>

        <div className="flex-1 p-5">
          <div className="flex flex-col items-center justify-center pt-20">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6">
              <svg
                className="w-10 h-10 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-white font-semibold text-xl mb-2">认证已通过</h2>
            <p className="text-[#888888] text-sm text-center mb-6">
              恭喜！您已成为认证创作者，现在可以发行您的智能体了
            </p>
            <button
              onClick={() => setCurrentView({ type: 'createAgent' })}
              className="w-full bg-primary text-black py-4 rounded-2xl font-medium text-base"
            >
              发行智能体
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!showForm && user?.verificationStatus === 'unverified') {
    return (
      <div className="bg-black min-h-screen flex flex-col">
        <div className="sticky top-0 bg-black/80 backdrop-blur-sm z-10 border-b border-white/5">
          <div className="flex items-center gap-4 p-4">
            <button onClick={goBack} className="text-[#888888] hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-white font-semibold text-xl">创作者认证</h1>
          </div>
        </div>

        <div className="flex-1 p-5 flex flex-col items-center justify-center">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/20 to-[#4096ff]/20 flex items-center justify-center mb-8 shadow-xl shadow-primary/20">
            <svg
              className="w-14 h-14 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>

          <h2 className="text-white font-bold text-2xl mb-3 text-center">成为认证创作者</h2>
          <p className="text-[#888888] text-base text-center mb-8 max-w-xs leading-relaxed">
            认证通过后，您可以发行智能体，设置价格和发行量，开启创作之旅
          </p>

          <div className="w-full space-y-4 mb-10">
            <div className="bg-[#121212] rounded-2xl p-4 border border-white/5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-medium text-sm">外站粉丝数 ≥ 10,000</h3>
                <p className="text-[#666666] text-xs">需提供社交媒体账号证明</p>
              </div>
            </div>

            <div className="bg-[#121212] rounded-2xl p-4 border border-white/5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-green-500"
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
                <h3 className="text-white font-medium text-sm">1-3 个工作日审核</h3>
                <p className="text-[#666666] text-xs">提交后耐心等待即可</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="w-full min-h-[56px] sm:min-h-[60px] px-6 py-4 sm:py-5 bg-gradient-to-r from-primary to-[#4096ff] text-black rounded-2xl font-bold text-lg sm:text-xl transition-all duration-200 shadow-2xl shadow-primary/40 hover:from-[#0958d9] hover:to-primary active:scale-[0.97] cursor-pointer touch-manipulation select-none"
            style={{ 
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
          >
            <span className="tracking-wide flex items-center justify-center gap-2">
              申请创作者认证
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      <div className="sticky top-0 bg-black/80 backdrop-blur-sm z-10 border-b border-white/5">
        <div className="flex items-center gap-4 p-4">
          <button onClick={showForm && !showFormInitially ? () => setShowForm(false) : goBack} className="text-[#888888] hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-white font-semibold text-xl">创作者认证</h1>
        </div>
      </div>

      <form id="verification-form" onSubmit={handleSubmit} className="p-5 pb-40">
        <div className="space-y-5">
          <div className="bg-[#121212] rounded-2xl p-4 border border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-medium text-base">认证要求</h3>
                <p className="text-[#666666] text-sm">外站粉丝数 ≥ 10,000</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">社交平台</label>
            <div className="grid grid-cols-3 gap-2">
              {platforms.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={`py-3 rounded-xl text-sm font-medium transition-colors ${
                    platform === p
                      ? 'bg-primary text-black'
                      : 'bg-[#1A1A1A] text-[#888888] hover:bg-[#242424]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">账号名称</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="请输入您的账号名称"
              className="w-full bg-[#1A1A1A] rounded-xl px-4 py-3 text-white placeholder-[#666666] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">粉丝数量</label>
            <input
              type="number"
              value={followers}
              onChange={e => setFollowers(e.target.value)}
              placeholder="请输入粉丝数量"
              min="10000"
              className="w-full bg-[#1A1A1A] rounded-xl px-4 py-3 text-white placeholder-[#666666] focus:outline-none"
            />
            {followers && parseInt(followers) < 10000 && (
              <p className="text-red-500 text-xs mt-2">粉丝数需达到 10,000 及以上</p>
            )}
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">证明链接</label>
            <input
              type="url"
              value={proofUrl}
              onChange={e => setProofUrl(e.target.value)}
              placeholder="请输入主页链接或证明截图链接"
              className="w-full bg-[#1A1A1A] rounded-xl px-4 py-3 text-white placeholder-[#666666] focus:outline-none"
            />
          </div>

          <div className="bg-[#121212] rounded-2xl p-4 border border-white/5">
            <p className="text-[#666666] text-sm">
              提交认证后，我们将在 1-3
              个工作日内完成审核。认证通过后，您可以发行智能体，设置价格和发行量。
            </p>
          </div>
        </div>
      </form>

      <div className="fixed bottom-0 left-0 right-0 bg-black/98 backdrop-blur-2xl border-t border-white/10 pt-4 pb-[max(2rem,env(safe-area-inset-bottom))] px-4 sm:px-5 z-[9999]">
        <button
          type="submit"
          form="verification-form"
          disabled={!isFormValid || submitMutation.isPending}
          className={`w-full min-h-[56px] sm:min-h-[60px] px-6 py-4 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl transition-all duration-200 shadow-2xl touch-manipulation select-none ${
            isFormValid && !submitMutation.isPending
              ? 'bg-gradient-to-r from-primary to-[#4096ff] text-black hover:from-[#0958d9] hover:to-primary active:scale-[0.97] shadow-primary/40 cursor-pointer'
              : 'bg-[#1A1A1A] text-[#666666] cursor-not-allowed opacity-60'
          }`}
          style={{ 
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
        >
          {submitMutation.isPending ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin" />
              <span className="tracking-wide">提交中...</span>
            </div>
          ) : (
            <span className="tracking-wide flex items-center justify-center gap-2">
              立即提交认证
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default VerificationPage;
