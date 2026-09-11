'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getImportantDates, getUpcomingDates, createImportantDate, updateImportantDate, deleteImportantDate } from '@/services/importantDates';
import { useUser } from './useUser';
import type { ImportantDate } from '@/types/database';

export function useImportantDates() {
  const { user } = useUser();
  return useQuery({
    queryKey: ['important-dates', user?.id],
    queryFn: () => (user?.id ? getImportantDates(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });
}

export function useUpcomingDates(days: number = 30) {
  const { user } = useUser();
  return useQuery({
    queryKey: ['important-dates-upcoming', user?.id, days],
    queryFn: () => (user?.id ? getUpcomingDates(user.id, days) : Promise.resolve([])),
    enabled: !!user?.id,
  });
}

export function useCreateImportantDate() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  return useMutation({
    mutationFn: async (data: Partial<ImportantDate>) => {
      if (!user) throw new Error('Bạn cần đăng nhập.');
      return createImportantDate({ ...data, user_id: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['important-dates'] });
      queryClient.invalidateQueries({ queryKey: ['important-dates-upcoming'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useUpdateImportantDate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ImportantDate> }) => {
      return updateImportantDate(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['important-dates'] });
      queryClient.invalidateQueries({ queryKey: ['important-dates-upcoming'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDeleteImportantDate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return deleteImportantDate(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['important-dates'] });
      queryClient.invalidateQueries({ queryKey: ['important-dates-upcoming'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
