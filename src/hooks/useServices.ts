'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getServiceRecords,
  createServiceRecord,
  deleteServiceRecord,
  getServiceStats,
} from '@/services/services';
import { useUser } from './useUser';

export function useServiceRecords(category?: string) {
  const { user } = useUser();
  const userId = user?.id;

  return useQuery({
    queryKey: ['service-records', userId, category],
    queryFn: () => (userId ? getServiceRecords(userId, category) : Promise.resolve([])),
    enabled: !!userId,
  });
}

export function useServiceStats() {
  const { user } = useUser();
  const userId = user?.id;

  return useQuery({
    queryKey: ['service-stats', userId],
    queryFn: () => (userId ? getServiceStats(userId) : Promise.resolve(null)),
    enabled: !!userId,
  });
}

export function useCreateServiceRecord() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async (data: {
      serviceCategory: string;
      title: string;
      serviceDate?: string;
      cost: number;
      providerName?: string | null;
      providerPhone?: string | null;
      providerAddress?: string | null;
      rating?: number | null;
      nextServiceRecommendedDate?: string | null;
      notes?: string | null;
      receiptFile?: File | null;
    }) => {
      if (!user) throw new Error('Bạn cần đăng nhập để lưu lịch sử dịch vụ.');
      return createServiceRecord({ ...data, userId: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-records'] });
      queryClient.invalidateQueries({ queryKey: ['service-stats'] });
    },
  });
}

export function useDeleteServiceRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recordId: string) => {
      return deleteServiceRecord(recordId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-records'] });
      queryClient.invalidateQueries({ queryKey: ['service-stats'] });
    },
  });
}
