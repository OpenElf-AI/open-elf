import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { useOrder } from '../hooks/useOrders';
import { usePurchaseAgent } from '../hooks/useAgents';

interface PaymentResultPageProps {
  orderId?: string;
  outTradeNo?: string;
  onBack: () => void;
}

const PaymentResultPage: React.FC<PaymentResultPageProps> = ({ orderId, outTradeNo, onBack }) => {
  const { setCurrentView } = useAppStore();
  const [isTimeout, setIsTimeout] = useState(false);
  const [assetPurchased, setAssetPurchased] = useState(false);
  const tradeNo = outTradeNo || orderId || '';

  const { data: order, isLoading, refetch } = useOrder(tradeNo);
  const purchaseMutation = usePurchaseAgent();

  const [pollingCount, setPollingCount] = useState(0);
  const maxPollingCount = 15;

  useEffect(() => {
    if (isTimeout) return;

    if (order && order.status === 'pending' && pollingCount < maxPollingCount) {
      const timer = setTimeout(() => {
        setPollingCount(prev => prev + 1);
        refetch();
      }, 2000);
      return () => clearTimeout(timer);
    } else if (order && order.status === 'pending' && pollingCount >= maxPollingCount) {
      setIsTimeout(true);
    }
  }, [order, pollingCount, refetch, isTimeout]);

  useEffect(() => {
    if (
      order?.status === 'paid' &&
      !assetPurchased &&
      !purchaseMutation.isPending &&
      order.assetType === 'agent' &&
      order.assetId
    ) {
      purchaseMutation.mutate(order.assetId, {
        onSuccess: () => {
          setAssetPurchased(true);
          console.log('【支付成功】商品已同步');
        },
        onError: error => {
          console.error('【支付成功】商品同步失败:', error);
        },
      });
    }
  }, [order?.status, assetPurchased, purchaseMutation, order?.assetType, order?.assetId]);

  const isSuccess = order?.status === 'paid';
  const isFailed = order?.status === 'failed' || order?.status === 'timeout';
  const isTimeoutState = isTimeout && order?.status === 'pending';

  const orderNo = order?.outTradeNo || order?.orderNo || order?.orderId || tradeNo;
  const assetName = order?.assetName || order?.subject;
  const amount = order?.totalAmount || order?.amount || 0;

  const handleGoHome = () => {
    setCurrentView('chat');
  };

  const handleViewOrders = () => {
    setCurrentView({ type: 'myOrders' });
  };

  const handleViewMyAgents = () => {
    setCurrentView({ type: 'myAgents' });
  };

  const handleRetry = () => {
    setPollingCount(0);
    setIsTimeout(false);
    refetch();
  };

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
        <h1 className="text-white font-semibold text-lg">支付结果</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {isLoading && !order ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-[#888888]">查询订单状态中...</p>
          </div>
        ) : isSuccess ? (
          <div className="text-center">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 mx-auto">
              <svg
                className="w-12 h-12 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-white font-bold text-2xl mb-2">支付成功</h2>
            <p className="text-[#888888] mb-6">您已成功购买商品</p>

            {order && (
              <div className="bg-[#1A1A1A] rounded-2xl p-4 mb-6 text-left">
                <div className="flex justify-between items-center py-2">
                  <span className="text-[#888888]">订单号</span>
                  <span className="text-white font-mono text-sm">{orderNo}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[#888888]">商品名称</span>
                  <span className="text-white">{assetName}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-white/10 mt-2 pt-2">
                  <span className="text-[#888888]">支付金额</span>
                  <span className="text-primary font-bold text-xl">¥{amount.toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleViewMyAgents}
                className="w-full bg-[#1677FF] text-white py-4 rounded-xl font-semibold hover:bg-[#0958d9] transition-colors active:scale-[0.98]"
              >
                查看我的智能体
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleViewMyAgents}
                  className="bg-[#1A1A1A] text-white py-3 rounded-xl font-medium hover:bg-[#2A2A2A] transition-colors"
                >
                  查看我的智能体
                </button>
                <button
                  onClick={handleViewOrders}
                  className="bg-[#1A1A1A] text-white py-3 rounded-xl font-medium hover:bg-[#2A2A2A] transition-colors"
                >
                  查看订单
                </button>
              </div>
              <button
                onClick={handleGoHome}
                className="w-full border border-white/10 text-white py-3 rounded-xl font-medium hover:bg-[#1A1A1A] transition-colors"
              >
                回到首页
              </button>
            </div>
          </div>
        ) : isFailed ? (
          <div className="text-center">
            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-6 mx-auto">
              <svg
                className="w-12 h-12 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-white font-bold text-2xl mb-2">支付失败</h2>
            <p className="text-[#888888] mb-6">订单已取消或支付失败</p>

            {order && (
              <div className="bg-[#1A1A1A] rounded-2xl p-4 mb-6 text-left">
                <div className="flex justify-between items-center py-2">
                  <span className="text-[#888888]">订单号</span>
                  <span className="text-white font-mono text-sm">{orderNo}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[#888888]">商品名称</span>
                  <span className="text-white">{assetName}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-white/10 mt-2 pt-2">
                  <span className="text-[#888888]">订单金额</span>
                  <span className="text-[#888888] font-bold text-xl">¥{amount.toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={onBack}
                className="flex-1 bg-[#1A1A1A] text-white py-3 rounded-xl font-medium hover:bg-[#2A2A2A] transition-colors"
              >
                返回
              </button>
              <button
                onClick={handleViewOrders}
                className="flex-1 bg-primary text-black py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                查看订单
              </button>
            </div>
          </div>
        ) : isTimeoutState ? (
          <div className="text-center">
            <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mb-6 mx-auto">
              <svg
                className="w-12 h-12 text-yellow-500"
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
            <h2 className="text-white font-bold text-2xl mb-2">支付超时</h2>
            <p className="text-[#888888] mb-6">等待支付结果超时，请稍后在订单列表中查看</p>

            <div className="flex gap-4">
              <button
                onClick={onBack}
                className="flex-1 bg-[#1A1A1A] text-white py-3 rounded-xl font-medium hover:bg-[#2A2A2A] transition-colors"
              >
                返回
              </button>
              <button
                onClick={handleRetry}
                className="flex-1 bg-primary text-black py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                重新查询
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mb-6 mx-auto">
              <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <h2 className="text-white font-bold text-2xl mb-2">等待支付</h2>
            <p className="text-[#888888] mb-2">正在查询支付状态...</p>
            <p className="text-[#666666] text-sm mb-6">
              已查询 {pollingCount}/{maxPollingCount} 次
            </p>

            <div className="flex gap-4">
              <button
                onClick={onBack}
                className="flex-1 bg-[#1A1A1A] text-white py-3 rounded-xl font-medium hover:bg-[#2A2A2A] transition-colors"
              >
                返回
              </button>
              <button
                onClick={() => refetch()}
                className="flex-1 bg-primary text-black py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                刷新状态
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentResultPage;
