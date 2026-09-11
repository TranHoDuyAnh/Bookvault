'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getHabitsWithLogs, createHabit, updateHabit, deleteHabit, checkInHabit, uncheckHabit, getHabitStreak } from '@/services/habits';
import { useUser } from './useUser';
import type { Habit } from '@/types/database';

export function useHabits() {
  const { user } = useUser();
  return useQuery({
    queryKey: ['habits', user?.id],
    queryFn: () => (user?.id ? getHabitsWithLogs(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  return useMutation({
    mutationFn: async (data: Partial<Habit>) => {
      if (!user) throw new Error('Bạn cần đăng nhập.');
      return createHabit({ ...data, user_id: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}

export function useUpdateHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<Habit> }) => {
      return updateHabit(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => deleteHabit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}

export function useCheckInHabit() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  return useMutation({
    mutationFn: async ({ habitId, date, note }: { habitId: string, date: string, note?: string }) => {
      if (!user) throw new Error('Bạn cần đăng nhập.');
      return checkInHabit({ habit_id: habitId, user_id: user.id, completed_date: date, note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}

export function useUncheckHabit() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  return useMutation({
    mutationFn: async ({ habitId, date }: { habitId: string, date: string }) => {
      if (!user) throw new Error('Bạn cần đăng nhập.');
      return uncheckHabit(habitId, user.id, date);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}

export function useHabitStreak(habitId: string) {
  const { user } = useUser();
  return useQuery({
    queryKey: ['habit-streak', habitId, user?.id],
    queryFn: () => (user?.id ? getHabitStreak(habitId, user.id) : Promise.resolve(0)),
    enabled: !!user?.id && !!habitId,
  });
}
