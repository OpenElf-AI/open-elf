import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApi } from '../api';

export const useOrder = (outTradeNo: string) => {
  const api = getApi();
  return useQuery({
    queryKey: ['order', outTradeNo],
    queryFn: () => api.order.getStatus(outTradeNo),
    enabled: !!outTradeNo,
  });
};

export const useMyOrders = () => {
  const api = getApi();
  return useQuery({
    queryKey: ['myOrders'],
    queryFn: () => api.order.getList(),
  });
};

export const usePrepay = () => {
  const api = getApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => api.pay.prepay(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
    },
  });
};
