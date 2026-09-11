'use client';

import React, { useState } from 'react';
import { Car, Plus, Fuel, Wrench, ShieldAlert, AlertTriangle, Gauge, FileCheck } from 'lucide-react';
import { useVehicles, useVehicleStats } from '@/hooks/useVehicles';
import { VehicleCard } from '@/components/vehicles/VehicleCard';
import { AddVehicleModal } from '@/components/vehicles/AddVehicleModal';
import { AddFuelModal } from '@/components/vehicles/AddFuelModal';
import { AddVehicleServiceModal } from '@/components/vehicles/AddVehicleServiceModal';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { formatVND } from '@/lib/utils';
import type { Vehicle } from '@/types/database';

export default function VehicleManagerPage() {
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [selectedVehicleForFuel, setSelectedVehicleForFuel] = useState<Vehicle | null>(null);
  const [selectedVehicleForService, setSelectedVehicleForService] = useState<Vehicle | null>(null);

  const { data: stats, isLoading: statsLoading } = useVehicleStats();
  const { data: vehicles = [], isLoading } = useVehicles();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Car className="h-6 w-6 text-emerald-800 dark:text-emerald-400" />
            <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Vehicle Manager & Quản Lý Phương Tiện
            </h1>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
            Theo dõi chi phí xăng xe, lịch bảo dưỡng định kỳ và cảnh báo hạn đăng kiểm / bảo hiểm bắt buộc.
          </p>
        </div>

        <Button onClick={() => setIsAddVehicleOpen(true)} className="gap-1.5 font-bold shadow-xs">
          <Plus className="h-4 w-4" />
          Thêm phương tiện mới
        </Button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Số phương tiện</span>
          <p className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
            {statsLoading ? <Skeleton className="h-7 w-12" /> : stats?.totalVehicles || 0}
          </p>
          <span className="text-[11px] text-stone-400">xe máy & ô tô</span>
        </div>

        <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Tổng tiền xăng</span>
          <p className="font-serif text-xl sm:text-2xl font-bold text-amber-700 dark:text-amber-400 truncate">
            {statsLoading ? <Skeleton className="h-7 w-20" /> : formatVND(stats?.totalFuelSpent || 0)}
          </p>
          <span className="text-[11px] text-stone-400">đã ghi nhận</span>
        </div>

        <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Bảo dưỡng & Phí</span>
          <p className="font-serif text-xl sm:text-2xl font-bold text-emerald-800 dark:text-emerald-400 truncate">
            {statsLoading ? <Skeleton className="h-7 w-20" /> : formatVND(stats?.totalServiceSpent || 0)}
          </p>
          <span className="text-[11px] text-stone-400">sửa chữa & phụ tùng</span>
        </div>

        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-stone-900 p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" /> Sắp hết hạn
          </span>
          <p className="font-serif text-2xl font-bold text-amber-700 dark:text-amber-400">
            {statsLoading
              ? <Skeleton className="h-7 w-12" />
              : (stats?.expiringRegistrationCount || 0) + (stats?.expiringInsuranceCount || 0)}
          </p>
          <span className="text-[11px] text-amber-700/80">đăng kiểm & bảo hiểm (30d)</span>
        </div>
      </div>

      {/* Vehicles Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full rounded-3xl" />
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <EmptyState
          icon={<Car className="h-8 w-8 text-emerald-800" />}
          title="Chưa có phương tiện nào trong hệ thống"
          description="Thêm xe máy hoặc ô tô của bạn để bắt đầu theo dõi nhật ký xăng, số km Odo và không bao giờ quên hạn đăng kiểm."
          actionLabel="Thêm xe đầu tiên"
          onAction={() => setIsAddVehicleOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((v) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              onOpenFuelModal={(veh) => setSelectedVehicleForFuel(veh)}
              onOpenServiceModal={(veh) => setSelectedVehicleForService(veh)}
            />
          ))}
        </div>
      )}

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        isOpen={isAddVehicleOpen}
        onClose={() => setIsAddVehicleOpen(false)}
      />

      {/* Add Fuel Modal */}
      <AddFuelModal
        isOpen={!!selectedVehicleForFuel}
        onClose={() => setSelectedVehicleForFuel(null)}
        vehicle={selectedVehicleForFuel}
      />

      {/* Add Service Modal */}
      <AddVehicleServiceModal
        isOpen={!!selectedVehicleForService}
        onClose={() => setSelectedVehicleForService(null)}
        vehicle={selectedVehicleForService}
      />
    </div>
  );
}
