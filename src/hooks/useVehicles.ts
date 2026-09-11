'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  addFuelLog,
  addVehicleServiceLog,
  getVehicleStats,
} from '@/services/vehicles';
import { useUser } from './useUser';
import type { Vehicle, VehicleType } from '@/types/database';

export function useVehicles() {
  const { user } = useUser();
  const userId = user?.id;

  return useQuery({
    queryKey: ['vehicles', userId],
    queryFn: () => (userId ? getVehicles(userId) : Promise.resolve([])),
    enabled: !!userId,
  });
}

export function useVehicleStats() {
  const { user } = useUser();
  const userId = user?.id;

  return useQuery({
    queryKey: ['vehicle-stats', userId],
    queryFn: () => (userId ? getVehicleStats(userId) : Promise.resolve(null)),
    enabled: !!userId,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      type?: VehicleType;
      licensePlate?: string | null;
      brand?: string | null;
      modelYear?: number | null;
      currentOdo?: number;
      insuranceExpiryDate?: string | null;
      registrationExpiryDate?: string | null;
      notes?: string | null;
      imageFile?: File | null;
    }) => {
      if (!user) throw new Error('Bạn cần đăng nhập để thêm phương tiện.');
      return createVehicle({ ...data, userId: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-stats'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      vehicleId,
      updates,
    }: {
      vehicleId: string;
      updates: Partial<Vehicle>;
    }) => {
      return updateVehicle(vehicleId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-stats'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vehicleId: string) => {
      return deleteVehicle(vehicleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-stats'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useAddFuelLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      vehicleId: string;
      logDate?: string;
      odoKm?: number | null;
      liters?: number | null;
      pricePerLiter?: number | null;
      totalCost: number;
      gasStation?: string | null;
      notes?: string | null;
    }) => {
      return addFuelLog(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-stats'] });
    },
  });
}

export function useAddVehicleServiceLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      vehicleId: string;
      logDate?: string;
      odoKm?: number | null;
      serviceType: string;
      cost: number;
      performedAt?: string | null;
      nextServiceOdo?: number | null;
      nextServiceDate?: string | null;
      notes?: string | null;
    }) => {
      return addVehicleServiceLog(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-stats'] });
    },
  });
}
