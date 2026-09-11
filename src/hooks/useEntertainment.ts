'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMediaEntries, createMediaEntry, updateMediaEntry, deleteMediaEntry, getMediaStats } from '@/services/entertainment';
import { useUser } from './useUser';
import type { MediaEntry, MediaType, MediaStatus } from '@/types/database';

export function useMediaEntries(filters?: { type?: MediaType | 'ALL'; status?: MediaStatus | 'ALL' }) {
  const { user } = useUser();
  return useQuery({
    queryKey: ['media-entries', user?.id, filters],
    queryFn: () => (user?.id ? getMediaEntries(user.id, filters) : Promise.resolve([])),
    enabled: !!user?.id,
  });
}

export function useMediaStats() {
  const { user } = useUser();
  return useQuery({
    queryKey: ['media-stats', user?.id],
    queryFn: () => (user?.id ? getMediaStats(user.id) : Promise.resolve(null)),
    enabled: !!user?.id,
  });
}

export function useCreateMediaEntry() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  return useMutation({
    mutationFn: async (data: Partial<MediaEntry>) => {
      if (!user) throw new Error('Bạn cần đăng nhập.');
      return createMediaEntry({ ...data, user_id: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-entries'] });
      queryClient.invalidateQueries({ queryKey: ['media-stats'] });
    },
  });
}

export function useUpdateMediaEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MediaEntry> }) => {
      return updateMediaEntry(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-entries'] });
      queryClient.invalidateQueries({ queryKey: ['media-stats'] });
    },
  });
}

export function useDeleteMediaEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return deleteMediaEntry(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-entries'] });
      queryClient.invalidateQueries({ queryKey: ['media-stats'] });
    },
  });
}
