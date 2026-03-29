import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { useToast } from '../components/Toast';
import { useAgent } from '../hooks/useAgents';
import { usePrepay } from '../hooks/useOrders';
import { Agent } from '../api/types';
import { getApi } from '../api';

interface OrderConfirmPageProps {
  assetType: 'agent';
  assetId: string;
  onBack: () => void;
}

const OrderConfirmPage: React.FC<OrderConfirmPageProps> = ({ assetType, assetId, onBack }) => {
  const { setCurrentView } = useAppStore();
  const { showToast } = useToast();

  const { data: agent, isLoading } = useAgent(assetId);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [outTradeNo, setOutTradeNo] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const prepayMutation = usePrepay();

  const handleCreateOrder = () => {
    console.log('【支付】点击「创建订单」按钮');
    prepayMutation.mutate({ assetType, assetId }, {
      onSuccess: (result) => {
        console.log('【支付】接口调用成功');
        console.log('【支付】返回数据:', result);
        
        if (result.paymentUrl) {
          setPaymentUrl(result.paymentUrl);
          setOrderId(result.outTradeNo || null);
          setOutTradeNo(result.outTradeNo || null);
          showToast('✅ 订单创建成功，请前往支付宝完成支付', 'success');
        } else {
          console.error('【支付】❌ paymentUrl 不存在！');
          showToast('支付链接获取失败，请重试', 'error');
        }
      },
      onError: (error: any) => {
        console.log('【支付】❌ 接口调用失败');
        console.log('【支付】错误信息:', error);
        showToast(error.message || '创建订单失败，请稍后重试', 'error');
      },
    });
  };

  const handleGoToAlipay = () => {
    if (!paymentUrl) return;
    
    setIsRedirecting(true);
    showToast('正在跳转到支付宝收银台，请稍候...', 'info');
    
    try {
      window.location.href = paymentUrl;
    } catch (error) {
      console.error('跳转失败:', error);
      showToast('跳转失败，请点击重试', 'error');
      setIsRedirecting(false);
    }
  };

  const price = agent?.price || 0;

  if (isLoading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-[#666666] text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#888888] mb-4">商品不存在</p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-primary text-black rounded-lg font-medium"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen flex flex-col">
      <div className="p-4 flex items-center gap-4 border-b border-white/10">
        <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-white font-semibold text-lg">订单确认</h1>
      </div>

      <div className="flex-1 p-4">
        <div className="bg-[#1A1A1A] rounded-2xl p-4 mb-4">
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
              <img
                src={agent.avatar}
                alt={agent.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-white font-semibold text-lg mb-1">{agent.name}</h2>
              <p className="text-[#888888] text-sm mb-2 line-clamp-2">{agent.description}</p>
              <div className="text-primary font-bold text-xl">¥{price.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-2xl p-4">
          <div className="flex justify-between items-center py-3 border-b border-white/10">
            <span className="text-[#888888]">商品类型</span>
            <span className="text-white">智能体</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-[#888888]">支付方式</span>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.5 3h-15C3.12 3 2 4.12 2 5.5v13C2 19.88 3.12 21 4.5 21h15c1.38 0 2.5-1.12 2.5-2.5v-13C22 4.12 20.88 3 19.5 3zm-7.5 7.5h-3v-1.5h3v1.5zm0 3h-3v1.5h3v-1.5z" />
              </svg>
              <span className="text-white">支付宝</span>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1A1A] rounded-2xl p-4 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-white font-medium">合计</span>
            <span className="text-primary font-bold text-2xl">¥{price.toFixed(2)}</span>
          </div>
        </div>

        {paymentUrl && (
          <div className="bg-green-900/30 border border-green-500/50 rounded-2xl p-4 mt-4">
            <h3 className="text-green-400 font-semibold mb-3">✅ 订单创建成功，请前往支付宝完成支付</h3>
            <p className="text-[#888888] text-sm mb-4">点击下方按钮跳转至支付宝收银台</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleGoToAlipay}
                disabled={isRedirecting}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors disabled:bg-[#333333] disabled:text-[#666666] disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isRedirecting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    正在跳转至支付宝...
                  </>
                ) : (
                  '🔗 前往支付宝支付'
                )}
              </button>
              <button
                onClick={() => {
                  if (outTradeNo || orderId) {
                    setCurrentView({ type: 'paymentResult', orderId: orderId || outTradeNo || '', outTradeNo: outTradeNo || orderId || '' });
                  }
                }}
                className="w-full bg-[#333333] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#444444] transition-colors"
              >
                已完成支付，查看结果
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/10">
        {!paymentUrl ? (
          <button
            onClick={handleCreateOrder}
            disabled={prepayMutation.isPending}
            className="w-full bg-primary text-black py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-colors disabled:bg-[#333333] disabled:text-[#666666] disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {prepayMutation.isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                创建订单中...
              </>
            ) : (
              '创建订单'
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default OrderConfirmPage;
