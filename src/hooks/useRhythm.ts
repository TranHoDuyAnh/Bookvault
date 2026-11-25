'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createRhythmHabit,
  createRhythmHabitsBulk,
  deleteRhythmHabit,
  getRhythmHabits,
  getRhythmLogs,
  setRhythmLogStatus,
  updateRhythmHabit,
} from '@/services/rhythm';
import { useUser } from './useUser';
import type { RhythmColor, RhythmHabit, RhythmLogStatus } from '@/types/database';

export function useRhythmHabits() {
  const { user } = useUser();
  return useQuery({
    queryKey: ['rhythm-habits', user?.id],
    queryFn: () => (user?.id ? getRhythmHabits(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });
}

export function useRhythmLogs() {
  const { user } = useUser();
  return useQuery({
    queryKey: ['rhythm-logs', user?.id],
    queryFn: () => (user?.id ? getRhythmLogs(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });
}

export function useCreateRhythmHabit() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      weekly_target: number;
      color: RhythmColor;
    }) => {
      if (!user) throw new Error('Bạn cần đăng nhập.');
      return createRhythmHabit({ ...input, user_id: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rhythm-habits'] });
    },
  });
}

export function useCreateRhythmHabitsBulk() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  return useMutation({
    mutationFn: async (
      items: Array<{ title: string; weekly_target: number; color: RhythmColor }>
    ) => {
      if (!user) throw new Error('Bạn cần đăng nhập.');
      return createRhythmHabitsBulk(
        items.map((item, idx) => ({
          ...item,
          user_id: user.id,
          sort_order: idx,
        }))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rhythm-habits'] });
    },
  });
}

export function useUpdateRhythmHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<RhythmHabit>;
    }) => updateRhythmHabit(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rhythm-habits'] });
    },
  });
}

export function useDeleteRhythmHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => deleteRhythmHabit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rhythm-habits'] });
      queryClient.invalidateQueries({ queryKey: ['rhythm-logs'] });
    },
  });
}

export function useSetRhythmLogStatus() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  return useMutation({
    mutationFn: async (input: {
      habitId: string;
      logDate: string;
      status: RhythmLogStatus | null;
    }) => {
      if (!user) throw new Error('Bạn cần đăng nhập.');
      return setRhythmLogStatus({ ...input, userId: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rhythm-logs'] });
    },
  });
}
