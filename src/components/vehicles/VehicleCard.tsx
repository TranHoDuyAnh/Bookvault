'use client';

import React, { useState } from 'react';
import {
  Car,
  Fuel,
  Wrench,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Gauge,
  Plus,
  Trash2,
  FileCheck,
} from 'lucide-react';
import type { Vehicle, VehicleType } from '@/types/database';
import { formatVND, formatDateVN } from '@/lib/utils';
import { useDeleteVehicle } from '@/hooks/useVehicles';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export const VEHICLE_TYPES: Record<VehicleType, { label: string; icon: string }> = {
  MOTORBIKE: { label: 'Xe máy', icon: '🛵' },
  CAR: { label: 'Ô tô', icon: '🚗' },
  ELECTRIC: { label: 'Xe điện', icon: '⚡' },
  OTHER: { label: 'Phương tiện khác', icon: '🚲' },
};

export function VehicleCard({
  vehicle,
  onOpenFuelModal,
  onOpenServiceModal,
}: {
  vehicle: Vehicle;
  onOpenFuelModal: (v: Vehicle) => void;
  onOpenServiceModal: (v: Vehicle) => void;
}) {
  const deleteMutation = useDeleteVehicle();
  const today = new Date();
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(today.getDate() + 30);

  const typeInfo = VEHICLE_TYPES[vehicle.type] || VEHICLE_TYPES.MOTORBIKE;

  // Registration Expiry check
  const getRegExpiryStatus = () => {
    if (!vehicle.registration_expiry_date) return null;
    const regDate = new Date(vehicle.registration_expiry_date);
    const diffDays = Math.ceil((regDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `Hết hạn đăng kiểm (${Math.abs(diffDays)} ngày trước)`, urgent: true };
    }
    if (diffDays <= 30) {
      return { label: `Sắp hết đăng kiểm (còn ${diffDays} ngày)`, warning: true };
    }
    return { label: `Đăng kiểm: ${formatDateVN(vehicle.registration_expiry_date)}`, safe: true };
  };

  // Insurance Expiry check
  const getInsExpiryStatus = () => {
    if (!vehicle.insurance_expiry_date) return null;
    const insDate = new Date(vehicle.insurance_expiry_date);
    const diffDays = Math.ceil((insDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `Hết hạn bảo hiểm (${Math.abs(diffDays)} ngày trước)`, urgent: true };
    }
    if (diffDays <= 30) {
      return { label: `Sắp hết bảo hiểm (còn ${diffDays} ngày)`, warning: true };
    }
    return { label: `Bảo hiểm: ${formatDateVN(vehicle.insurance_expiry_date)}`, safe: true };
  };

  const regStatus = getRegExpiryStatus();
  const insStatus = getInsExpiryStatus();

  // Total fuel & service spent
  const totalFuel = vehicle.fuel_logs?.reduce((acc, f) => acc + (f.total_cost || 0), 0) || 0;
  const totalService = vehicle.service_logs?.reduce((acc, s) => acc + (s.cost || 0), 0) || 0;

  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc muốn xoá phương tiện "${vehicle.name}"?`)) return;
    try {
      await deleteMutation.mutateAsync(vehicle.id);
      toast.success('Đã xoá phương tiện.');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xoá.');
    }
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden shadow-2xs hover:shadow-md hover:border-[#1e3a2f]/40 transition-all">
      {/* Photo / Header visual */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#f7f4ee] dark:bg-stone-800 flex items-center justify-center">
        {vehicle.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={vehicle.image_url}
            alt={vehicle.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-stone-400 space-y-1">
            <span className="text-4xl">{typeInfo.icon}</span>
            <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">{vehicle.name}</span>
          </div>
        )}

        <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-900/80 text-white backdrop-blur-xs">
            {typeInfo.label}
          </span>
          {vehicle.license_plate && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400 text-stone-900 shadow-2xs">
              {vehicle.license_plate}
            </span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 line-clamp-1">
                {vehicle.name}
              </h4>
              <p className="text-xs text-stone-500 font-medium">
                {vehicle.brand || 'Chưa rõ hãng'} {vehicle.model_year ? `• Đời ${vehicle.model_year}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-mono font-bold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-lg">
              <Gauge className="h-3.5 w-3.5 text-stone-500" />
              <span>{vehicle.current_odo.toLocaleString('vi-VN')} km</span>
            </div>
          </div>

          {/* Registration & Insurance Expiry Badges */}
          <div className="space-y-1 pt-1">
            {regStatus && (
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${
                  regStatus.urgent
                    ? 'border-rose-300 bg-rose-50 text-rose-800'
                    : regStatus.warning
                    ? 'border-amber-300 bg-amber-50 text-amber-800'
                    : 'border-stone-200 bg-stone-50 text-stone-600'
                }`}
              >
                <FileCheck className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{regStatus.label}</span>
              </div>
            )}

            {insStatus && (
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${
                  insStatus.urgent
                    ? 'border-rose-300 bg-rose-50 text-rose-800'
                    : insStatus.warning
                    ? 'border-amber-300 bg-amber-50 text-amber-800'
                    : 'border-stone-200 bg-stone-50 text-stone-600'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{insStatus.label}</span>
              </div>
            )}
          </div>

          {/* Cost stats */}
          <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#f7f4ee]/70 dark:bg-stone-800/40 text-xs">
            <div>
              <span className="text-[10px] text-stone-500 block">Tiền xăng ({vehicle.fuel_logs?.length || 0} lần)</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">{formatVND(totalFuel)}</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 block">Bảo dưỡng & Phí</span>
              <span className="font-bold text-emerald-800 dark:text-emerald-400">{formatVND(totalService)}</span>
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenFuelModal(vehicle)}
              className="text-xs gap-1 h-7 px-2"
            >
              <Fuel className="h-3 w-3 text-amber-600" />
              Đổ xăng
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpenServiceModal(vehicle)}
              className="text-xs gap-1 h-7 px-2"
            >
              <Wrench className="h-3 w-3 text-[#1e3a2f]" />
              Bảo dưỡng
            </Button>
          </div>

          <button
            onClick={handleDelete}
            className="rounded p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Xoá xe"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
