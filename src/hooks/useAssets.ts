'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPersonalAssets,
  createPersonalAsset,
  updatePersonalAsset,
  deletePersonalAsset,
  getAssetStats,
  type AssetFilters,
} from '@/services/assets';
import { useUser } from './useUser';
import type { PersonalAsset, AssetCategory, AssetStatus } from '@/types/database';

export function usePersonalAssets(filters?: AssetFilters) {
  const { user } = useUser();
  const userId = user?.id;

  return useQuery({
    queryKey: ['personal-assets', userId, filters],
    queryFn: () => (userId ? getPersonalAssets(userId, filters) : Promise.resolve([])),
    enabled: !!userId,
  });
}

export function useAssetStats() {
  const { user } = useUser();
  const userId = user?.id;

  return useQuery({
    queryKey: ['asset-stats', userId],
    queryFn: () => (userId ? getAssetStats(userId) : Promise.resolve(null)),
    enabled: !!userId,
  });
}

export function useCreatePersonalAsset() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      category?: AssetCategory;
      purchaseDate?: string | null;
      purchasePrice?: number | null;
      estimatedCurrentValue?: number | null;
      location?: string | null;
      status?: AssetStatus;
      serialNumber?: string | null;
      notes?: string | null;
      imageFile?: File | null;
    }) => {
      if (!user) throw new Error('Bạn cần đăng nhập để thêm tài sản.');
      return createPersonalAsset({ ...data, userId: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset-stats'] });
    },
  });
}

export function useUpdatePersonalAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      assetId,
      updates,
    }: {
      assetId: string;
      updates: Partial<PersonalAsset>;
    }) => {
      return updatePersonalAsset(assetId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset-stats'] });
    },
  });
}

export function useDeletePersonalAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assetId: string) => {
      return deletePersonalAsset(assetId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal-assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset-stats'] });
    },
  });
}
