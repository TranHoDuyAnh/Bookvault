'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTodayQuest,
  completeTodayQuest,
  getQuestHistory,
  getQuestStats,
} from '@/services/mystery';
import { useUser } from './useUser';

export function useTodayQuest() {
  const { user } = useUser();
  const userId = user?.id;

  return useQuery({
    queryKey: ['today-quest', userId],
    queryFn: () => (userId ? getTodayQuest(userId) : Promise.resolve(null)),
    enabled: !!userId,
  });
}

export function useQuestHistory() {
  const { user } = useUser();
  const userId = user?.id;

  return useQuery({
    queryKey: ['quest-history', userId],
    queryFn: () => (userId ? getQuestHistory(userId) : Promise.resolve([])),
    enabled: !!userId,
  });
}

export function useQuestStats() {
  const { user } = useUser();
  const userId = user?.id;

  return useQuery({
    queryKey: ['quest-stats', userId],
    queryFn: () => (userId ? getQuestStats(userId) : Promise.resolve(null)),
    enabled: !!userId,
  });
}

export function useCompleteQuest() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async (data: {
      dailyQuestId: string;
      proofNote?: string;
      proofImageFile?: File | null;
    }) => {
      if (!user) throw new Error('Bạn cần đăng nhập để hoàn thành nhiệm vụ.');
      return completeTodayQuest({ ...data, userId: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-quest'] });
      queryClient.invalidateQueries({ queryKey: ['quest-history'] });
      queryClient.invalidateQueries({ queryKey: ['quest-stats'] });
    },
  });
}
