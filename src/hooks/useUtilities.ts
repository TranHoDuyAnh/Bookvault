'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUtilityBills,
  createUtilityBill,
  toggleUtilityPaid,
  deleteUtilityBill,
  getUtilityStats,
  type UtilityFilters,
} from '@/services/utilities';
import { useUser } from './useUser';
import type { UtilityType } from '@/types/database';

export function useUtilityBills(filters?: UtilityFilters) {
  const { user } = useUser();
  const userId = user?.id;

  return useQuery({
    queryKey: ['utility-bills', userId, filters],
    queryFn: () => (userId ? getUtilityBills(userId, filters) : Promise.resolve([])),
    enabled: !!userId,
  });
}

export function useUtilityStats() {
  const { user } = useUser();
  const userId = user?.id;

  return useQuery({
    queryKey: ['utility-stats', userId],
    queryFn: () => (userId ? getUtilityStats(userId) : Promise.resolve(null)),
    enabled: !!userId,
  });
}

export function useCreateUtilityBill() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async (data: {
      utilityType?: UtilityType;
      title: string;
      billingPeriod: string;
      dueDate: string;
      amount: number;
      meterReading?: string | null;
      isPaid?: boolean;
      paidAt?: string | null;
      notes?: string | null;
      receiptFile?: File | null;
    }) => {
      if (!user) throw new Error('Bạn cần đăng nhập để lưu hoá đơn.');
      return createUtilityBill({ ...data, userId: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utility-bills'] });
      queryClient.invalidateQueries({ queryKey: ['utility-stats'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useToggleUtilityPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ billId, isPaid }: { billId: string; isPaid: boolean }) => {
      return toggleUtilityPaid(billId, isPaid);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utility-bills'] });
      queryClient.invalidateQueries({ queryKey: ['utility-stats'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDeleteUtilityBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (billId: string) => {
      return deleteUtilityBill(billId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utility-bills'] });
      queryClient.invalidateQueries({ queryKey: ['utility-stats'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
