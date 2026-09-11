'use client';

import React, { useState } from 'react';
import { Wrench, Calendar, DollarSign, User, Phone, MapPin, Star, Trash2, Tag, Edit2 } from 'lucide-react';
import type { ServiceRecord } from '@/types/database';
import { formatVND, formatDateVN } from '@/lib/utils';
import { useDeleteServiceRecord } from '@/hooks/useServices';
import { EditServiceModal } from './EditServiceModal';
import { toast } from 'sonner';

export function ServiceRecordCard({ record }: { record: ServiceRecord }) {
  const deleteMutation = useDeleteServiceRecord();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc muốn xoá lịch sử dịch vụ "${record.title}"?`)) return;
    try {
      await deleteMutation.mutateAsync(record.id);
      toast.success('Đã xoá lịch sử dịch vụ.');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xoá.');
    }
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-2xs hover:shadow-md hover:border-[#1e3a2f]/40 transition-all space-y-3">
      <div className="space-y-2">
        {/* Top badges */}
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
            {record.service_category}
          </span>

          {record.rating && record.rating > 0 ? (
            <div className="flex items-center gap-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
              <span>{record.rating} / 5</span>
            </div>
          ) : null}
        </div>

        {/* Title */}
        <h4 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 line-clamp-1">
          {record.title}
        </h4>

        {/* Provider info */}
        {record.provider_name && (
          <div className="space-y-1 text-xs text-stone-600 dark:text-stone-400">
            <p className="flex items-center gap-1.5 font-semibold text-stone-800 dark:text-stone-200">
              <User className="h-3.5 w-3.5 text-stone-400" />
              <span>{record.provider_name}</span>
            </p>
            {record.provider_phone && (
              <p className="flex items-center gap-1.5 text-[11px] text-stone-500">
                <Phone className="h-3 w-3 text-stone-400" />
                <span>{record.provider_phone}</span>
              </p>
            )}
            {record.provider_address && (
              <p className="flex items-center gap-1.5 text-[11px] text-stone-500 truncate">
                <MapPin className="h-3 w-3 text-stone-400 flex-shrink-0" />
                <span className="truncate">{record.provider_address}</span>
              </p>
            )}
          </div>
        )}

        {/* Notes */}
        {record.notes && (
          <p className="text-xs text-stone-500 line-clamp-2 pt-1">
            {record.notes}
          </p>
        )}
      </div>

      {/* Cost & Date Row */}
      <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] text-stone-400 uppercase font-semibold block">Chi phí</span>
          <span className="font-serif text-base font-bold text-emerald-800 dark:text-emerald-400">
            {formatVND(record.cost)}
          </span>
        </div>

        <div className="flex items-center gap-3 text-stone-500">
          <div className="text-right">
            <span className="text-[10px] text-stone-400 uppercase font-semibold block">Ngày dùng</span>
            <span className="font-medium text-stone-700 dark:text-stone-300">{formatDateVN(record.service_date)}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsEditOpen(true)}
              className="rounded p-1 text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer"
              title="Chỉnh sửa dịch vụ"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className="rounded p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Xoá lịch sử"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <EditServiceModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        record={record}
      />
    </div>
  );
}
