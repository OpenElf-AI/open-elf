import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApi } from '../api';
import { useUserStore } from '../store';

export const useCurrentUser = () => {
  const api = getApi();
  const { setUser } = useUserStore();

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const user = await api.auth.getCurrentUser();
      setUser(user);
      return user;
    },
    staleTime: Infinity,
  });
};

export const useUpdateUser = () => {
  const api = getApi();
  const queryClient = useQueryClient();
  const { setUser } = useUserStore();

  return useMutation({
    mutationFn: (data: { name?: string; avatar?: string }) => api.users.updateUser(data),
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(['currentUser'], user);
    },
  });
};

export const useSubmitVerification = () => {
  const api = getApi();
  const queryClient = useQueryClient();
  const { setUser } = useUserStore();

  return useMutation({
    mutationFn: api.verification.submit,
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(['currentUser'], user);
    },
  });
};

export const useGetVerificationStatus = () => {
  const api = getApi();
  return useQuery({
    queryKey: ['verificationStatus'],
    queryFn: api.verification.getStatus,
  });
};

export const useLogout = () => {
  const api = getApi();
  const queryClient = useQueryClient();
  const { logout } = useUserStore();

  return useMutation({
    mutationFn: api.auth.logout,
    onSuccess: () => {
      logout();
      queryClient.clear();
    },
  });
};
