'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCleaningTasks,
  createCleaningTask,
  completeCleaningTask,
  updateCleaningTask,
  deleteCleaningTask,
  getCleaningStats,
} from '@/services/cleaning';
import { useUser } from './useUser';
import type { CleaningTask } from '@/types/database';

export function useCleaningTasks() {
  const { user } = useUser();
  const userId = user?.id;

  return useQuery({
    queryKey: ['cleaning-tasks', userId],
    queryFn: () => (userId ? getCleaningTasks(userId) : Promise.resolve([])),
    enabled: !!userId,
  });
}

export function useCleaningStats() {
  const { user } = useUser();
  const userId = user?.id;

  return useQuery({
    queryKey: ['cleaning-stats', userId],
    queryFn: () => (userId ? getCleaningStats(userId) : Promise.resolve(null)),
    enabled: !!userId,
  });
}

export function useCreateCleaningTask() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      category?: string;
      frequencyDays: number;
      lastCompletedAt?: string | null;
      notes?: string | null;
    }) => {
      if (!user) throw new Error('Bạn cần đăng nhập để thêm lịch vệ sinh.');
      return createCleaningTask({ ...data, userId: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['cleaning-stats'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useCompleteCleaningTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      taskId: string;
      notes?: string;
      frequencyDays: number;
    }) => {
      return completeCleaningTask(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['cleaning-stats'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useUpdateCleaningTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      updates,
    }: {
      taskId: string;
      updates: Partial<CleaningTask>;
    }) => {
      return updateCleaningTask(taskId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['cleaning-stats'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDeleteCleaningTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      return deleteCleaningTask(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cleaning-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['cleaning-stats'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
