import React, { useState } from 'react';
import { useAppStore, useUserStore } from '../store';
import { useToast } from '../components/Toast';

const RealNameVerificationPage: React.FC<{ onBack?: () => void; onSuccess?: () => void }> = ({
  onBack,
  onSuccess,
}) => {
  const { goBack, setCurrentView } = useAppStore();
  const { user, setUser } = useUserStore();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 模拟第三方实名认证接口调用
    setTimeout(() => {
      setIsSubmitting(false);
      showToast('实名认证成功', 'success');

      // 假设认证成功后更新用户状态
      if (user) {
        setUser({
          ...user,

        });
      }

      if (onSuccess) {
        onSuccess();
      } else {
        setCurrentView({ type: 'verification' });
      }
    }, 1000);
  };

  const isFormValid = name && idNumber.length === 18;

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
          <h1 className="text-white font-semibold text-xl">实名认证</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 pb-40">
        <div className="space-y-6">
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-medium text-base">身份认证</h3>
                <p className="text-[#666666] text-sm">请输入真实身份信息</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">姓名</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="请输入真实姓名"
              className="w-full bg-[#1A1A1A] rounded-xl px-4 py-3 text-white placeholder-[#666666] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">身份证号</label>
            <input
              type="text"
              value={idNumber}
              onChange={e => setIdNumber(e.target.value)}
              placeholder="请输入身份证号码"
              maxLength={18}
              className="w-full bg-[#1A1A1A] rounded-xl px-4 py-3 text-white placeholder-[#666666] focus:outline-none"
            />
            {idNumber.length > 0 && idNumber.length !== 18 && (
              <p className="text-red-500 text-xs mt-2">身份证号长度不正确</p>
            )}
          </div>

          <div className="bg-[#121212] rounded-2xl p-4 border border-white/5">
            <p className="text-[#666666] text-sm">
              我们将使用第三方认证服务验证您的身份信息，信息仅用于身份验证，不会被用于其他用途
            </p>
          </div>
        </div>
      </form>

      <div className="fixed bottom-0 left-0 right-0 bg-black/98 backdrop-blur-2xl border-t border-white/10 pt-4 pb-[max(2rem,env(safe-area-inset-bottom))] px-4 sm:px-5 z-[9999]">
        <button
          type="submit"
          form="verification-form"
          disabled={!isFormValid || isSubmitting}
          onClick={handleSubmit}
          className={`w-full min-h-[56px] sm:min-h-[60px] px-6 py-4 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl transition-all duration-200 shadow-2xl touch-manipulation select-none ${
            isFormValid && !isSubmitting
              ? 'bg-gradient-to-r from-primary to-[#4096ff] text-black hover:from-[#0958d9] hover:to-primary active:scale-[0.97] shadow-primary/40 cursor-pointer'
              : 'bg-[#1A1A1A] text-[#666666] cursor-not-allowed opacity-60'
          }`}
          style={{
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
          }}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin" />
              <span className="tracking-wide">认证中...</span>
            </div>
          ) : (
            <span className="tracking-wide flex items-center justify-center gap-2">
              提交认证
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 12h14M12 5l7 7-7 7"
                />
              </svg>
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default RealNameVerificationPage;
