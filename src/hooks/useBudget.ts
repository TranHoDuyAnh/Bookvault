'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from './useUser';
import {
  addBudgetExpense,
  closeWeekAndDistribute,
  createEnvelope,
  createSavingsGoal,
  deleteBudgetExpense,
  deleteEnvelope,
  deleteWeeklyBudget,
  depositToSavingsGoal,
  getSavingsData,
  getWeekBudgetDetails,
  getWeeklyReports,
  updateEnvelope,
  updateWeeklyCap,
} from '@/services/budget';
import type { WeeklyBudget } from '@/types/database';

export function useWeekBudget(weekStart: string, weekEnd: string) {
  const { user } = useUser();
  return useQuery({
    queryKey: ['weekly-budget', user?.id, weekStart],
    queryFn: () =>
      user?.id ? getWeekBudgetDetails(user.id, weekStart, weekEnd) : Promise.resolve(null),
    enabled: !!user?.id,
  });
}

export function useWeeklyReports() {
  const { user } = useUser();
  return useQuery({
    queryKey: ['weekly-reports', user?.id],
    queryFn: () => (user?.id ? getWeeklyReports(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });
}

export function useSavingsData() {
  const { user } = useUser();
  return useQuery({
    queryKey: ['savings-data', user?.id],
    queryFn: () =>
      user?.id ? getSavingsData(user.id) : Promise.resolve({ goals: [], transactions: [] }),
    enabled: !!user?.id,
  });
}

export function useBudgetMutations() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['weekly-budget'] });
    queryClient.invalidateQueries({ queryKey: ['weekly-reports'] });
    queryClient.invalidateQueries({ queryKey: ['savings-data'] });
  };

  const updateCap = useMutation({
    mutationFn: ({ budgetId, totalCap }: { budgetId: string; totalCap: number }) =>
      updateWeeklyCap(budgetId, totalCap),
    onSuccess: invalidateAll,
  });

  const addEnvelope = useMutation({
    mutationFn: (payload: {
      weekly_budget_id: string;
      name: string;
      allocated_amount: number;
      sort_order: number;
    }) => {
      if (!user) throw new Error('Bạn cần đăng nhập.');
      return createEnvelope({ ...payload, user_id: user.id });
    },
    onSuccess: invalidateAll,
  });

  const editEnvelope = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: { name?: string; allocated_amount?: number };
    }) => updateEnvelope(id, updates),
    onSuccess: invalidateAll,
  });

  const removeEnvelope = useMutation({
    mutationFn: (id: string) => deleteEnvelope(id),
    onSuccess: invalidateAll,
  });

  const addExpense = useMutation({
    mutationFn: (payload: {
      weekly_budget_id: string;
      envelope_id: string;
      amount: number;
      note?: string | null;
      spent_at: string;
    }) => {
      if (!user) throw new Error('Bạn cần đăng nhập.');
      return addBudgetExpense({ ...payload, user_id: user.id });
    },
    onSuccess: invalidateAll,
  });

  const removeExpense = useMutation({
    mutationFn: (id: string) => deleteBudgetExpense(id),
    onSuccess: invalidateAll,
  });

  const removeWeek = useMutation({
    mutationFn: (id: string) => deleteWeeklyBudget(id),
    onSuccess: invalidateAll,
  });

  const addSavingsGoal = useMutation({
    mutationFn: (payload: { name: string; target_amount?: number | null }) => {
      if (!user) throw new Error('Bạn cần đăng nhập.');
      return createSavingsGoal({ ...payload, user_id: user.id });
    },
    onSuccess: invalidateAll,
  });

  const depositSavings = useMutation({
    mutationFn: (payload: { goalId: string; amount: number; note?: string | null }) => {
      if (!user) throw new Error('Bạn cần đăng nhập.');
      return depositToSavingsGoal({ ...payload, userId: user.id });
    },
    onSuccess: invalidateAll,
  });

  const closeWeek = useMutation({
    mutationFn: (payload: {
      budget: WeeklyBudget;
      toNextWeek: number;
      toSavings: number;
      savingsGoalId?: string | null;
    }) => {
      if (!user) throw new Error('Bạn cần đăng nhập.');
      return closeWeekAndDistribute({ ...payload, userId: user.id });
    },
    onSuccess: invalidateAll,
  });

  return {
    updateCap,
    addEnvelope,
    editEnvelope,
    removeEnvelope,
    addExpense,
    removeExpense,
    removeWeek,
    addSavingsGoal,
    depositSavings,
    closeWeek,
  };
}
