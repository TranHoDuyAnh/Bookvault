'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getSavingsGoals, createSavingsGoal, updateSavingsGoal, deleteSavingsGoal,
  addContribution, deleteContribution
} from '@/services/savings';
import { useUser } from './useUser';

export function useSavingsGoals() {
  const { user } = useUser();
  return useQuery({
    queryKey: ['savings-goals', user?.id],
    queryFn: () => (user?.id ? getSavingsGoals(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });
}

export function useCreateSavingsGoal() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  return useMutation({
    mutationFn: async (data: any) => {
      if (!user) throw new Error('Bạn cần đăng nhập.');
      return createSavingsGoal({ ...data, userId: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
    },
  });
}

export function useUpdateSavingsGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: any }) => updateSavingsGoal(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
    },
  });
}

export function useDeleteSavingsGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => deleteSavingsGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
    },
  });
}

export function useAddContribution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => addContribution(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
    },
  });
}

export function useDeleteContribution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, goalId }: { id: string, goalId: string }) => deleteContribution(id, goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
    },
  });
}
