'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getPersonalGoalsWithKeyResults, 
  createPersonalGoal, 
  updatePersonalGoal, 
  deletePersonalGoal,
  createKeyResult,
  updateKeyResult,
  deleteKeyResult
} from '@/services/goals';
import { useUser } from './useUser';
import type { PersonalGoal, KeyResult } from '@/types/database';

export function usePersonalGoals() {
  const { user } = useUser();
  return useQuery({
    queryKey: ['personal-goals', user?.id],
    queryFn: () => (user?.id ? getPersonalGoalsWithKeyResults(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });
}

export function useCreatePersonalGoal() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  return useMutation({
    mutationFn: async (data: Partial<PersonalGoal>) => {
      if (!user) throw new Error('Bạn cần đăng nhập.');
      return createPersonalGoal({ ...data, user_id: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-goals'] });
    },
  });
}

export function useUpdatePersonalGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PersonalGoal> }) => {
      return updatePersonalGoal(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-goals'] });
    },
  });
}

export function useDeletePersonalGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return deletePersonalGoal(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-goals'] });
    },
  });
}

export function useCreateKeyResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<KeyResult>) => {
      return createKeyResult(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-goals'] });
    },
  });
}

export function useUpdateKeyResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<KeyResult> }) => {
      return updateKeyResult(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-goals'] });
    },
  });
}

export function useDeleteKeyResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return deleteKeyResult(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-goals'] });
    },
  });
}
