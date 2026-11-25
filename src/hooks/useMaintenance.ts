'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  completeMaintenanceItem,
  createMaintenanceItem,
  createMaintenanceItemsBulk,
  deleteMaintenanceItem,
  getMaintenanceItems,
  getMaintenanceLogs,
  snoozeMaintenanceItem,
  updateMaintenanceItem,
  type CompleteMaintenanceInput,
  type CreateMaintenanceItemInput,
} from '@/services/maintenance';
import { useUser } from './useUser';
import type { MaintenanceItem } from '@/types/database';

export function useMaintenanceItems() {
  const { user } = useUser();
  return useQuery({
    queryKey: ['maintenance-items', user?.id],
    queryFn: () =>
      user?.id ? getMaintenanceItems(user.id) : Promise.resolve([]),
    enabled: !!user?.id,
  });
}

export function useMaintenanceLogs(itemId?: string) {
  const { user } = useUser();
  return useQuery({
    queryKey: ['maintenance-logs', user?.id, itemId ?? 'all'],
    queryFn: () =>
      user?.id ? getMaintenanceLogs(user.id, itemId) : Promise.resolve([]),
    enabled: !!user?.id,
  });
}

export function useCreateMaintenanceItem() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  return useMutation({
    mutationFn: async (
      data: Omit<CreateMaintenanceItemInput, 'user_id'>
    ) => {
      if (!user) throw new Error('Bạn cần đăng nhập.');
      return createMaintenanceItem({ ...data, user_id: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-items'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useCreateMaintenanceItemsBulk() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  return useMutation({
    mutationFn: async (
      items: Omit<CreateMaintenanceItemInput, 'user_id'>[]
    ) => {
      if (!user) throw new Error('Bạn cần đăng nhập.');
      return createMaintenanceItemsBulk(
        items.map((item) => ({ ...item, user_id: user.id }))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-items'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useUpdateMaintenanceItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<MaintenanceItem>;
    }) => updateMaintenanceItem(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-items'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDeleteMaintenanceItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => deleteMaintenanceItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-items'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-logs'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useCompleteMaintenanceItem() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  return useMutation({
    mutationFn: async (
      input: Omit<CompleteMaintenanceInput, 'userId'>
    ) => {
      if (!user) throw new Error('Bạn cần đăng nhập.');
      return completeMaintenanceItem({ ...input, userId: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-items'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-logs'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useSnoozeMaintenanceItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, days }: { id: string; days: number }) =>
      snoozeMaintenanceItem(id, days),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-items'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
