import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApi } from '../api';

export const useNotifications = () => {
  const api = getApi();
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.notifications.getAll(),
  });
};

export const useUnreadCount = () => {
  const api = getApi();
  return useQuery({
    queryKey: ['unreadCount'],
    queryFn: () => api.notifications.getUnreadCount(),
  });
};

export const useMarkAsRead = () => {
  const api = getApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.notifications.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const api = getApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.notifications.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });
};
