import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAppStore } from '../store';
import { useUserStore } from '../store';
import { useToast } from '../components/Toast';
import { realApi } from '../api';
import { Order } from '../api/types';

type FilterType = 'all' | 'pending' | 'paid' | 'failed';
type SortType = 'time-desc' | 'time-asc' | 'amount-desc' | 'amount-asc';

interface MyOrdersPageProps {
  onBack: () => void;
}

const MyOrdersPage: React.FC<MyOrdersPageProps> = ({ onBack }) => {
  const { showToast } = useToast();
  const { user } = useUserStore();
  const { setCurrentView } = useAppStore();
  const [isRedirecting, setIsRedirecting] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('time-desc');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const {
    data: ordersData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['myOrders', user?.id],
    queryFn: () => realApi.order.getList(),
    refetchInterval: 5000,
  });

  const orders = ordersData?.items || [];

  const filteredAndSortedOrders = useMemo(() => {
    let result = [...orders];

    if (filter !== 'all') {
      result = result.filter(order => {
        if (filter === 'pending' && order.status === 'pending') return true;
        if (filter === 'paid' && order.status === 'paid') return true;
        if (filter === 'failed' && (order.status === 'failed' || order.status === 'timeout'))
          return true;
        return false;
      });
    }

    result.sort((a, b) => {
      switch (sort) {
        case 'time-desc':
          return new Date(b.createTime).getTime() - new Date(a.createTime).getTime();
        case 'time-asc':
          return new Date(a.createTime).getTime() - new Date(b.createTime).getTime();
        case 'amount-desc':
          return (b.totalAmount || b.amount || 0) - (a.totalAmount || a.amount || 0);
        case 'amount-asc':
          return (a.totalAmount || a.amount || 0) - (b.totalAmount || b.amount || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [orders, filter, sort]);

  const prepayMutation = useMutation({
    mutationFn: (data: { assetType: 'agent' | 'capability'; assetId: string; userId?: string }) =>
      realApi.pay.prepay(data),
    onSuccess: result => {
      console.log('[Payment] Prepay successful, redirecting to:', result.paymentUrl);
      setIsRedirecting(null);
      window.location.href = result.paymentUrl;
    },
    onError: error => {
      setIsRedirecting(null);
      showToast(error instanceof Error ? error.message : '创建订单失败，请重试', 'error');
    },
  });

  const handlePay = (order: Order) => {
    if (!order.assetType || !order.assetId) {
      showToast('订单信息不完整', 'error');
      return;
    }
    setIsRedirecting(order.outTradeNo);
    prepayMutation.mutate({
      assetType: order.assetType as 'agent' | 'capability',
      assetId: order.assetId,
      userId: user?.id,
    });
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return '待支付';
      case 'paid':
        return '已支付';
      case 'failed':
        return '支付失败';
      case 'timeout':
        return '超时';
      default:
        return status;
    }
  };

  const getStatusStyle = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-500/20 text-orange-500';
      case 'paid':
        return 'bg-green-500/20 text-green-500';
      case 'failed':
      case 'timeout':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (error) {
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
          <h1 className="text-white font-semibold text-lg">我的订单</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-[#888888] mb-4">加载订单失败</p>
            <button
              onClick={() => refetch()}
              className="px-6 py-2 bg-primary text-black rounded-lg font-medium"
            >
              重试
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
        <h1 className="text-white font-semibold text-lg">我的订单</h1>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-[150px]">
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as FilterType)}
              className="w-full bg-[#1A1A1A] text-white px-4 py-2 rounded-xl text-sm border border-white/10 focus:outline-none focus:border-primary/50"
            >
              <option value="all">全部</option>
              <option value="pending">待支付</option>
              <option value="paid">已支付</option>
              <option value="failed">已取消</option>
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortType)}
              className="w-full bg-[#1A1A1A] text-white px-4 py-2 rounded-xl text-sm border border-white/10 focus:outline-none focus:border-primary/50"
            >
              <option value="time-desc">最新优先</option>
              <option value="time-asc">最早优先</option>
              <option value="amount-desc">金额从高到低</option>
              <option value="amount-asc">金额从低到高</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-[#666666] text-sm">加载中...</p>
            </div>
          </div>
        ) : filteredAndSortedOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <svg
              className="w-16 h-16 text-[#444444] mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-[#888888] text-lg mb-4">暂无订单，快去选购吧</p>
            <button
              onClick={() => setCurrentView('discover')}
              className="px-6 py-2 bg-primary text-black rounded-lg font-medium"
            >
              去发现
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedOrders.map(order => (
              <div key={order.outTradeNo} className="bg-[#1A1A1A] rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleExpand(order.outTradeNo)}
                  className="w-full text-left p-4 hover:bg-[#222222] transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-white font-semibold text-base">
                        {order.assetName || order.subject}
                      </div>
                      <div className="text-[#666666] text-xs mt-1">订单号：{order.outTradeNo}</div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}
                    >
                      {getStatusText(order.status)}
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-3 border-t border-white/10">
                    <div className="text-[#888888] text-sm">
                      {order.assetType === 'agent'
                        ? '智能体'
                        : order.assetType === 'capability'
                          ? '能力包'
                          : '商品'}
                    </div>
                    <div className="text-primary font-bold text-xl">
                      ¥{(order.totalAmount || order.amount || 0).toFixed(2)}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-white/10">
                    <div className="text-[#666666] text-sm">
                      {formatDate(order.createTime || order.createdAt || '')}
                    </div>

                    <div className="flex items-center gap-2">
                      {expandedOrderId === order.outTradeNo ? (
                        <svg
                          className="w-4 h-4 text-[#888888]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4 text-[#888888]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>

                {expandedOrderId === order.outTradeNo && (
                  <div className="border-t border-white/10 p-4 bg-[#151515]">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[#888888] text-sm">支付方式</span>
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4 text-blue-400"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M19.5 3h-15C3.12 3 2 4.12 2 5.5v13C2 19.88 3.12 21 4.5 21h15c1.38 0 2.5-1.12 2.5-2.5v-13C22 4.12 20.88 3 19.5 3zm-7.5 7.5h-3v-1.5h3v1.5zm0 3h-3v1.5h3v-1.5z" />
                          </svg>
                          <span className="text-white text-sm">{order.payType || '支付宝'}</span>
                        </div>
                      </div>

                      {order.payTime && (
                        <div className="flex justify-between items-center">
                          <span className="text-[#888888] text-sm">支付时间</span>
                          <span className="text-white text-sm">{formatDate(order.payTime)}</span>
                        </div>
                      )}

                      {order.sellerId && (
                        <div className="flex justify-between items-center">
                          <span className="text-[#888888] text-sm">卖家ID</span>
                          <span className="text-white font-mono text-xs">{order.sellerId}</span>
                        </div>
                      )}
                    </div>

                    {order.status === 'pending' && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handlePay(order);
                          }}
                          disabled={isRedirecting === order.outTradeNo || prepayMutation.isPending}
                          className="w-full py-3 bg-orange-500 text-black rounded-lg text-sm font-medium hover:bg-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isRedirecting === order.outTradeNo || prepayMutation.isPending
                            ? '跳转中...'
                            : '去支付'}
                        </button>
                      </div>
                    )}

                    {(order.status === 'failed' || order.status === 'timeout') && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handlePay(order);
                          }}
                          disabled={isRedirecting === order.outTradeNo || prepayMutation.isPending}
                          className="w-full py-3 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isRedirecting === order.outTradeNo || prepayMutation.isPending
                            ? '跳转中...'
                            : '重新支付'}
                        </button>
                      </div>
                    )}

                    {order.status === 'paid' && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex items-center justify-center gap-1 text-green-500 text-sm">
                          <svg
                            className="w-4 h-4"
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
                          已完成
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;
