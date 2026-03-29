import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAppStore } from '../store';
import { useUserStore } from '../store';
import { realApi, mockApi } from '../api';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import { CapabilityPackageAvatar } from '../components';
import type { CapabilityPackage } from '../api/types';

const CapabilityPackageMarketplacePage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { goBack } = useAppStore();
  const { user } = useUserStore();

  const { showToast } = useToast();
  const { showConfirm } = useConfirm();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { data: capabilityPackages = [], isLoading } = useQuery({
    queryKey: ['capabilityPackages'],
    queryFn: mockApi.capabilityPackages.getAll,
  });

  const prepayMutation = useMutation({
    mutationFn: (pkgId: string) => realApi.pay.prepay({ 
      assetType: 'capability', 
      assetId: pkgId,
      userId: user?.id 
    }),
    onSuccess: (result) => {
      console.log('[Payment] Prepay successful, redirecting to:', result.paymentUrl);
      setIsRedirecting(false);
      window.location.href = result.paymentUrl;
    },
    onError: error => {
      setIsRedirecting(false);
      showToast(error instanceof Error ? error.message : '创建订单失败，请重试', 'error');
    },
  });

  const handlePurchase = (pkg: CapabilityPackage) => {
    if (pkg.soldCount >= pkg.totalSupply) {
      showToast('已售罄', 'error');
      return;
    }
    showConfirm({
      title: '确认购买',
      message: `确定要花费 ¥${pkg.price.toFixed(1)} 购买「${pkg.name}」吗？`,
      confirmText: '立即支付',
      cancelText: '再想想',
      onConfirm: () => {
        setIsRedirecting(true);
        prepayMutation.mutate(pkg.id);
      },
    });
  };

  return (
    <div className="bg-black min-h-screen flex flex-col">
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
          <h1 className="text-white font-semibold text-xl">能力包市集</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {isLoading ? (
          <div className="flex items-center justify-center pt-20">
            <div className="flex gap-2">
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
        ) : capabilityPackages.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-32">
            <div className="text-6xl mb-4">⚡</div>
            <h3 className="text-white font-medium text-lg mb-2">暂无能力包</h3>
            <p className="text-[#666666] text-sm text-center">敬请期待更多精彩的开源AI能力包</p>
          </div>
        ) : (
          <div className="space-y-4">
            {capabilityPackages.map(pkg => {
              const isSoldOut = pkg.soldCount >= pkg.totalSupply;
              return (
                <div
                  key={pkg.id}
                  className="w-full bg-[#121212] rounded-2xl p-4 hover:bg-[#1A1A1A] transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <CapabilityPackageAvatar size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-medium text-base truncate">
                              {pkg.name}
                            </h3>
                            <span className="px-2 py-0.5 bg-[#1A1A1A] text-[#888888] text-xs rounded-full">
                              {pkg.category}
                            </span>
                            {pkg.openSourceModel && (
                              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                                {pkg.openSourceModel}
                              </span>
                            )}
                          </div>
                          <p className="text-[#888888] text-sm mt-1 line-clamp-2">
                            {pkg.description}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-primary font-semibold">
                            ¥{pkg.price.toFixed(1)}
                          </span>
                          <button
                            onClick={() => handlePurchase(pkg)}
                            disabled={isSoldOut || isRedirecting || prepayMutation.isPending}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                              isSoldOut
                                ? 'bg-[#333333] text-[#666666] cursor-not-allowed'
                                : 'bg-primary text-black hover:bg-primary/90'
                            }`}
                          >
                            {isSoldOut ? (
                              '已售罄'
                            ) : isRedirecting || prepayMutation.isPending ? (
                              '正在跳转...'
                            ) : (
                              '购买'
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {pkg.capabilities.map((cap, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-[#1A1A1A] text-[#888888] text-xs rounded-full"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <img
                            src={pkg.creatorAvatar}
                            alt={pkg.creatorName}
                            className="w-4 h-4 rounded-full"
                          />
                          <span className="text-[#666666] text-xs">{pkg.creatorName}</span>
                        </div>
                        <span className="text-[#666666] text-xs">•</span>
                        <span className="text-[#666666] text-xs">
                          {pkg.soldCount} / {pkg.totalSupply} 份
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CapabilityPackageMarketplacePage;
