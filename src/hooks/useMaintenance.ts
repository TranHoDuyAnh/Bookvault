'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMaintenanceRecords,
  createMaintenanceRecord,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
  getMaintenanceStats,
  type MaintenanceFilters,
} from '@/services/maintenance';
import { useUser } from './useUser';
import type { HomeMaintenanceRecord, MaintenanceStatus } from '@/types/database';

export function useMaintenanceRecords(filters?: MaintenanceFilters) {
  const { user } = useUser();
  const userId = user?.id;

  return useQuery({
    queryKey: ['maintenance-records', userId, filters],
    queryFn: () => (userId ? getMaintenanceRecords(userId, filters) : Promise.resolve([])),
    enabled: !!userId,
  });
}

export function useMaintenanceStats() {
  const { user } = useUser();
  const userId = user?.id;

  return useQuery({
    queryKey: ['maintenance-stats', userId],
    queryFn: () => (userId ? getMaintenanceStats(userId) : Promise.resolve(null)),
    enabled: !!userId,
  });
}

export function useCreateMaintenanceRecord() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async (data: {
      category: string;
      title: string;
      description?: string | null;
      cost: number;
      performedDate?: string;
      contractorName?: string | null;
      contractorPhone?: string | null;
      warrantyUntil?: string | null;
      status?: MaintenanceStatus;
      notes?: string | null;
      beforeImageFile?: File | null;
      afterImageFile?: File | null;
    }) => {
      if (!user) throw new Error('Bạn cần đăng nhập để lưu bảo trì.');
      return createMaintenanceRecord({ ...data, userId: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-records'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-stats'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useUpdateMaintenanceRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recordId,
      updates,
    }: {
      recordId: string;
      updates: Partial<HomeMaintenanceRecord>;
    }) => {
      return updateMaintenanceRecord(recordId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-records'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-stats'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDeleteMaintenanceRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recordId: string) => {
      return deleteMaintenanceRecord(recordId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-records'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-stats'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
