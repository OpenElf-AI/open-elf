import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApi } from '../api';

export const useAgents = (options?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  featured?: boolean;
}) => {
  const api = getApi();
  return useQuery({
    queryKey: ['agents', options],
    queryFn: () => api.agents.getAll(options),
  });
};

export const useAgent = (agentId: string) => {
  const api = getApi();
  return useQuery({
    queryKey: ['agent', agentId],
    queryFn: () => api.agents.getById(agentId),
    enabled: !!agentId,
  });
};

export const useMyAgents = () => {
  const api = getApi();
  return useQuery({
    queryKey: ['myAgents'],
    queryFn: () => api.agents.getMyAgents(),
  });
};

export const useFeaturedAgents = () => {
  const api = getApi();
  return useQuery({
    queryKey: ['featuredAgents'],
    queryFn: () => api.agents.getFeatured(),
  });
};

export const useSearchAgents = (query: string) => {
  const api = getApi();
  return useQuery({
    queryKey: ['searchAgents', query],
    queryFn: () => api.agents.search(query),
    enabled: query.length > 0,
  });
};

export const useFollowAgent = () => {
  const api = getApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agentId: string) => api.agentFollows.followAgent(agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agent'] });
      queryClient.invalidateQueries({ queryKey: ['myFollowingAgents'] });
    },
  });
};

export const useUnfollowAgent = () => {
  const api = getApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agentId: string) => api.agentFollows.unfollowAgent(agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agent'] });
      queryClient.invalidateQueries({ queryKey: ['myFollowingAgents'] });
    },
  });
};

export const useCheckFollowStatus = (agentId: string) => {
  const api = getApi();
  return useQuery({
    queryKey: ['followStatus', agentId],
    queryFn: () => api.agentFollows.checkFollowStatus(agentId),
    enabled: !!agentId,
  });
};

export const useMyFollowingAgents = (page?: number, limit?: number) => {
  const api = getApi();
  return useQuery({
    queryKey: ['myFollowingAgents', page, limit],
    queryFn: () => api.agentFollows.getMyFollowingAgents(page, limit),
  });
};

export const usePurchaseAgent = () => {
  const api = getApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agentId: string) => api.agents.purchase(agentId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['myAgents'] });
      const previousAgents = queryClient.getQueryData(['myAgents']);

      return { previousAgents };
    },
    onError: (_err, _agentId, context) => {
      if (context?.previousAgents) {
        queryClient.setQueryData(['myAgents'], context.previousAgents);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['myAgents'] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
};

export const useAddAgentExp = () => {
  const api = getApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ agentId, expAmount }: { agentId: string; expAmount: number }) =>
      api.agents.addExp(agentId, expAmount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent'] });
      queryClient.invalidateQueries({ queryKey: ['myAgents'] });
    },
  });
};

export const useToggleShowcase = () => {
  const api = getApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agentId: string) => api.agents.toggleShowcase(agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent'] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
};

export const useFavorites = () => {
  const api = getApi();
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => api.agents.getFavorites(),
  });
};

export const useAddFavorite = () => {
  const api = getApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agentId: string) => api.agents.addFavorite(agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agent'] });
    },
  });
};

export const useRemoveFavorite = () => {
  const api = getApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agentId: string) => api.agents.removeFavorite(agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agent'] });
    },
  });
};

export const useCreateAgent = () => {
  const api = getApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => api.agents.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['myAgents'] });
    },
  });
};
