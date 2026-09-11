'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getHomeRooms,
  createHomeRoom,
  deleteHomeRoom,
  getHomeItems,
  createHomeItem,
  updateHomeItem,
  deleteHomeItem,
  addMaintenanceLog,
  getHomeStats,
  type HomeItemFilters,
} from '@/services/home';
import { useUser } from './useUser';
import type { HomeItem } from '@/types/database';

export function useHomeRooms() {
  const { user } = useUser();
  const userId = user?.id;

  return useQuery({
    queryKey: ['home-rooms', userId],
    queryFn: () => (userId ? getHomeRooms(userId) : Promise.resolve([])),
    enabled: !!userId,
  });
}

export function useCreateHomeRoom() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async ({ name, icon }: { name: string; icon?: string }) => {
      if (!user) throw new Error('Bạn cần đăng nhập để tạo phòng.');
      return createHomeRoom(user.id, name, icon);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-rooms'] });
    },
  });
}

export function useDeleteHomeRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: string) => {
      return deleteHomeRoom(roomId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['home-items'] });
    },
  });
}

export function useHomeItems(filters?: HomeItemFilters) {
  const { user } = useUser();
  const userId = user?.id;

  return useQuery({
    queryKey: ['home-items', userId, filters],
    queryFn: () => (userId ? getHomeItems(userId, filters) : Promise.resolve([])),
    enabled: !!userId,
  });
}

export function useHomeStats() {
  const { user } = useUser();
  const userId = user?.id;

  return useQuery({
    queryKey: ['home-stats', userId],
    queryFn: () => (userId ? getHomeStats(userId) : Promise.resolve(null)),
    enabled: !!userId,
  });
}

export function useCreateHomeItem() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async (data: {
      roomId?: string | null;
      name: string;
      category?: string | null;
      purchaseDate?: string | null;
      purchasePrice?: number | null;
      purchaseStore?: string | null;
      warrantyEndDate?: string | null;
      serialNumber?: string | null;
      status?: string;
      manualUrl?: string | null;
      notes?: string | null;
      imageFile?: File | null;
      receiptFile?: File | null;
    }) => {
      if (!user) throw new Error('Bạn cần đăng nhập để thêm đồ.');
      return createHomeItem({ ...data, userId: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-items'] });
      queryClient.invalidateQueries({ queryKey: ['home-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['home-stats'] });
    },
  });
}

export function useUpdateHomeItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      updates,
    }: {
      itemId: string;
      updates: Partial<HomeItem>;
    }) => {
      return updateHomeItem(itemId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-items'] });
      queryClient.invalidateQueries({ queryKey: ['home-stats'] });
    },
  });
}

export function useDeleteHomeItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      return deleteHomeItem(itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-items'] });
      queryClient.invalidateQueries({ queryKey: ['home-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['home-stats'] });
    },
  });
}

export function useAddMaintenanceLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      itemId: string;
      maintenanceDate?: string;
      cost?: number;
      description: string;
      performedBy?: string | null;
    }) => {
      return addMaintenanceLog(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-items'] });
      queryClient.invalidateQueries({ queryKey: ['home-stats'] });
    },
  });
}
