import { useMutation } from '@tanstack/react-query';
import { useToast } from '../components/Toast';
import { mockApi } from '../api/mockApi';

export const useDirectPurchase = () => {
  const { showToast } = useToast();

  const purchaseMutation = useMutation({
    mutationFn: async ({ assetType, assetId }: { assetType: 'agent' | 'capability'; assetId: string }) => {
      console.log('【直接购买】开始创建订单');
      console.log('【直接购买】商品类型:', assetType);
      console.log('【直接购买】商品ID:', assetId);
      
      return mockApi.pay.prepay({ assetType, assetId });
    },
    onSuccess: (result) => {
      console.log('【直接购买】订单创建成功');
      console.log('【直接购买】返回数据:', result);
      
      if (result.paymentUrl) {
        showToast('✅ 订单创建成功，请前往支付宝完成支付', 'success');
        
        setTimeout(() => {
          window.location.href = result.paymentUrl;
        }, 500);
      } else {
        console.error('【直接购买】❌ paymentUrl 不存在！');
        showToast('支付链接获取失败，请重试', 'error');
      }
    },
    onError: (error: any) => {
      console.log('【直接购买】❌ 订单创建失败');
      console.log('【直接购买】错误信息:', error);
      showToast(error.message || '创建订单失败，请稍后重试', 'error');
    },
  });

  const handlePurchase = (assetType: 'agent' | 'capability', assetId: string) => {
    purchaseMutation.mutate({ assetType, assetId });
  };

  return {
    handlePurchase,
    isPending: purchaseMutation.isPending,
  };
};
