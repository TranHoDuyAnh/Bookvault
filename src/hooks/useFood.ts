'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFoodEntries,
  createFoodEntry,
  updateFoodEntry,
  deleteFoodEntry,
  getFoodStats,
  type FoodFilters,
} from '@/services/food';
import { useUser } from './useUser';
import type { FoodEntry, MealType } from '@/types/database';

export function useFoodEntries(filters?: FoodFilters) {
  const { user } = useUser();
  const userId = user?.id;

  return useQuery({
    queryKey: ['food-entries', userId, filters],
    queryFn: () => (userId ? getFoodEntries(userId, filters) : Promise.resolve([])),
    enabled: !!userId,
  });
}

export function useFoodStats() {
  const { user } = useUser();
  const userId = user?.id;

  return useQuery({
    queryKey: ['food-stats', userId],
    queryFn: () => (userId ? getFoodStats(userId) : Promise.resolve(null)),
    enabled: !!userId,
  });
}

export function useCreateFoodEntry() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async (data: {
      dishName: string;
      mealType?: MealType;
      restaurantName?: string | null;
      locationAddress?: string | null;
      price?: number | null;
      rating?: number | null;
      entryDate?: string;
      reviewNotes?: string | null;
      isCookedAtHome?: boolean;
      isFavorite?: boolean;
      imageFile?: File | null;
    }) => {
      if (!user) throw new Error('Bạn cần đăng nhập để lưu món ăn.');
      return createFoodEntry({ ...data, userId: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-entries'] });
      queryClient.invalidateQueries({ queryKey: ['food-stats'] });
    },
  });
}

export function useUpdateFoodEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      entryId,
      updates,
    }: {
      entryId: string;
      updates: Partial<FoodEntry>;
    }) => {
      return updateFoodEntry(entryId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-entries'] });
      queryClient.invalidateQueries({ queryKey: ['food-stats'] });
    },
  });
}

export function useDeleteFoodEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: string) => {
      return deleteFoodEntry(entryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['food-entries'] });
      queryClient.invalidateQueries({ queryKey: ['food-stats'] });
    },
  });
}
