'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getBudgetCategories, createBudgetCategory, updateBudgetCategory, deleteBudgetCategory,
  getExpenses, createExpense, updateExpense, deleteExpense,
  getIncomes, createIncome, deleteIncome, getMonthlyBudgetSummary
} from '@/services/budget';
import { useUser } from './useUser';

export function useBudgetCategories() {
  const { user } = useUser();
  return useQuery({
    queryKey: ['budget_categories', user?.id],
    queryFn: () => (user?.id ? getBudgetCategories(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });
}

export function useCreateBudgetCategory() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  return useMutation({
    mutationFn: async (data: any) => {
      if (!user) throw new Error('Bạn cần đăng nhập.');
      return createBudgetCategory({ ...data, userId: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget_categories'] });
      queryClient.invalidateQueries({ queryKey: ['monthly_budget_summary'] });
    },
  });
}

export function useUpdateBudgetCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: any }) => updateBudgetCategory(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget_categories'] });
      queryClient.invalidateQueries({ queryKey: ['monthly_budget_summary'] });
    },
  });
}

export function useDeleteBudgetCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => deleteBudgetCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget_categories'] });
      queryClient.invalidateQueries({ queryKey: ['monthly_budget_summary'] });
    },
  });
}

export function useExpenses(month?: number, year?: number) {
  const { user } = useUser();
  const currentMonth = month || new Date().getMonth() + 1;
  const currentYear = year || new Date().getFullYear();
  return useQuery({
    queryKey: ['expenses', user?.id, currentMonth, currentYear],
    queryFn: () => (user?.id ? getExpenses(user.id, { month: currentMonth, year: currentYear }) : Promise.resolve([])),
    enabled: !!user?.id,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  return useMutation({
    mutationFn: async (data: any) => {
      if (!user) throw new Error('Bạn cần đăng nhập.');
      return createExpense({ ...data, userId: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['monthly_budget_summary'] });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: any }) => updateExpense(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['monthly_budget_summary'] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['monthly_budget_summary'] });
    },
  });
}

export function useIncomes(month?: number, year?: number) {
  const { user } = useUser();
  const currentMonth = month || new Date().getMonth() + 1;
  const currentYear = year || new Date().getFullYear();
  return useQuery({
    queryKey: ['incomes', user?.id, currentMonth, currentYear],
    queryFn: () => (user?.id ? getIncomes(user.id, { month: currentMonth, year: currentYear }) : Promise.resolve([])),
    enabled: !!user?.id,
  });
}

export function useCreateIncome() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  return useMutation({
    mutationFn: async (data: any) => {
      if (!user) throw new Error('Bạn cần đăng nhập.');
      return createIncome({ ...data, userId: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['monthly_budget_summary'] });
    },
  });
}

export function useDeleteIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => deleteIncome(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['monthly_budget_summary'] });
    },
  });
}

export function useMonthlyBudgetSummary(month: number, year: number) {
  const { user } = useUser();
  return useQuery({
    queryKey: ['monthly_budget_summary', user?.id, month, year],
    queryFn: () => (user?.id ? getMonthlyBudgetSummary(user.id, month, year) : Promise.resolve({ totalIncome: 0, totalExpense: 0, netBalance: 0, byCategory: [] })),
    enabled: !!user?.id,
  });
}
