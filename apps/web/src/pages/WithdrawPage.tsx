import React, { useState } from 'react';
import { useAppStore } from '../store';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';

const WithdrawPage: React.FC = () => {
  const { goBack } = useAppStore();
  const { showToast } = useToast();
  const { showConfirm } = useConfirm();
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const balance = 1260.50;
  const minWithdraw = 50;

  const handleWithdraw = () => {
    const numAmount = parseFloat(amount);
    
    if (!amount || isNaN(numAmount)) {
      showToast('请输入提现金额', 'error');
      return;
    }
    
    if (numAmount < minWithdraw) {
      showToast(`最低提现金额 ¥${minWithdraw}`, 'error');
      return;
    }
    
    if (numAmount > balance) {
      showToast('余额不足', 'error');
      return;
    }

    showConfirm({
      title: '确认提现',
      message: `确定要提现 ¥${numAmount.toFixed(2)} 吗？`,
      confirmText: '确认提现',
      cancelText: '再想想',
      onConfirm: () => {
        setIsSubmitting(true);
        setTimeout(() => {
          setIsSubmitting(false);
          setAmount('');
          showToast('提现申请已提交，预计1-3个工作日到账', 'success');
          goBack();
        }, 1500);
      }
    });
  };

  return (
    <div className="bg-black min-h-screen pb-24">
      <div className="sticky top-0 bg-black/80 backdrop-blur-sm z-10 border-b border-white/5">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={goBack}
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
          <h1 className="text-white font-semibold text-xl">提现</h1>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-6">
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl p-6 border border-yellow-500/20">
          <div className="text-[#888888] text-sm mb-2">可提现余额</div>
          <div className="text-yellow-500 text-4xl font-bold mb-4">¥{balance.toFixed(2)}</div>
          <div className="flex items-center justify-between text-[#666666] text-sm">
            <span>最低提现 ¥{minWithdraw}</span>
            <button
              onClick={() => setAmount(balance.toString())}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              全部提现
            </button>
          </div>
        </div>

        <div className="bg-[#121212] rounded-2xl p-5 border border-white/5">
          <h2 className="text-white font-semibold text-lg mb-4">提现金额</h2>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-2xl font-bold">¥</span>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="请输入金额"
              className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white text-2xl font-bold placeholder-[#666666] focus:outline-none focus:border-primary/50 transition-colors"
              step="0.01"
              min={minWithdraw}
              max={balance}
            />
          </div>
        </div>

        <div className="bg-[#121212] rounded-2xl p-5 border border-white/5">
          <h2 className="text-white font-semibold text-lg mb-4">到账账户</h2>
          <div className="flex items-center gap-4 p-4 bg-[#1A1A1A] rounded-xl">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-white font-medium">支付宝</div>
              <div className="text-[#666666] text-sm">***@example.com</div>
            </div>
            <div className="text-[#666666]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-[#121212] rounded-2xl p-5 border border-white/5">
          <h2 className="text-white font-semibold text-lg mb-4">提现记录</h2>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-xl">
                <div>
                  <div className="text-white font-medium">提现</div>
                  <div className="text-[#666666] text-xs">2024-01-{15 - i}</div>
                </div>
                <div className="text-right">
                  <div className="text-yellow-500 font-semibold">-¥{(100 * i).toFixed(2)}</div>
                  <div className="text-green-500 text-xs">已到账</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleWithdraw}
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black py-4 rounded-xl font-semibold text-lg hover:from-yellow-600 hover:to-orange-600 transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '处理中...' : '确认提现'}
        </button>

        <div className="text-[#666666] text-xs text-center leading-relaxed">
          提现申请提交后，预计1-3个工作日内到账<br/>
          如有问题，请联系客服
        </div>
      </div>
    </div>
  );
};

export default WithdrawPage;
