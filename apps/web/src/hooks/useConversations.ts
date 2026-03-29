import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApi } from '../api';

export const useConversations = () => {
  const api = getApi();
  return useQuery({
    queryKey: ['conversations'],
    queryFn: api.conversations.getAll,
  });
};

export const useConversation = (conversationId: string) => {
  const api = getApi();
  return useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => api.conversations.getById(conversationId),
    enabled: !!conversationId,
  });
};

export const useCreateConversation = () => {
  const api = getApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agentId: string) => api.conversations.create(agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useDeleteConversation = () => {
  const api = getApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.conversations.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

export const useMessages = (conversationId: string) => {
  const api = getApi();
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => api.messages.getByConversationId(conversationId),
    enabled: !!conversationId,
  });
};

export const useSendMessage = () => {
  const api = getApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      conversationId?: string;
      agentId?: string;
      content: string;
    }) => api.messages.send(data),
    onSuccess: (_, variables) => {
      if (variables.conversationId) {
        queryClient.invalidateQueries({
          queryKey: ['messages', variables.conversationId],
        });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    },
  });
};

export const useGenerateReply = () => {
  const api = getApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => api.messages.generateReply(conversationId),
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({
        queryKey: ['messages', conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};
