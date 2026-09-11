'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getJournalEntries, createJournalEntry, updateJournalEntry, deleteJournalEntry } from '@/services/journal';
import { useUser } from './useUser';
import type { JournalEntry } from '@/types/database';

export function useJournalEntries(limit?: number) {
  const { user } = useUser();
  return useQuery({
    queryKey: ['journal-entries', user?.id, limit],
    queryFn: () => (user?.id ? getJournalEntries(user.id, { limit }) : Promise.resolve([])),
    enabled: !!user?.id,
  });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  return useMutation({
    mutationFn: async (data: Partial<JournalEntry>) => {
      if (!user) throw new Error('Bạn cần đăng nhập.');
      return createJournalEntry({ ...data, user_id: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
    },
  });
}

export function useUpdateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<JournalEntry> }) => {
      return updateJournalEntry(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
    },
  });
}

export function useDeleteJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => deleteJournalEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
    },
  });
}
