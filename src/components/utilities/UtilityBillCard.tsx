'use client';

import React, { useState } from 'react';
import {
  Zap,
  Droplet,
  Wifi,
  Phone,
  Building,
  Trash,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  FileText,
  Trash2,
  Edit2,
} from 'lucide-react';
import type { UtilityBill, UtilityType } from '@/types/database';
import { formatVND, formatDateVN } from '@/lib/utils';
import { useToggleUtilityPaid, useDeleteUtilityBill } from '@/hooks/useUtilities';
import { EditUtilityModal } from './EditUtilityModal';
import { toast } from 'sonner';

export const UTILITY_TYPES_CONFIG: Record<
  UtilityType,
  { label: string; icon: any; color: string; bg: string }
> = {
  ELECTRICITY: { label: 'Tiền điện', icon: Zap, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40' },
  WATER: { label: 'Tiền nước', icon: Droplet, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40' },
  INTERNET: { label: 'Internet / Wifi', icon: Wifi, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/40' },
  PHONE: { label: 'Điện thoại / 4G', icon: Phone, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40' },
  APARTMENT_FEE: { label: 'Phí dịch vụ / Quản lý', icon: Building, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
  TRASH: { label: 'Tiền rác & Vệ sinh', icon: Trash, color: 'text-stone-600 dark:text-stone-400', bg: 'bg-stone-100 dark:bg-stone-800' },
  OTHER: { label: 'Khoản chi khác', icon: FileText, color: 'text-stone-600 dark:text-stone-400', bg: 'bg-stone-100 dark:bg-stone-800' },
};

export function UtilityBillCard({ bill }: { bill: UtilityBill }) {
  const toggleMutation = useToggleUtilityPaid();
  const deleteMutation = useDeleteUtilityBill();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const typeConfig = UTILITY_TYPES_CONFIG[bill.utility_type] || UTILITY_TYPES_CONFIG.ELECTRICITY;
  const TypeIcon = typeConfig.icon;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(bill.due_date);
  dueDate.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const isOverdue = !bill.is_paid && diffDays < 0;
  const isDueSoon = !bill.is_paid && diffDays >= 0 && diffDays <= 5;

  const handleToggle = async () => {
    try {
      await toggleMutation.mutateAsync({ billId: bill.id, isPaid: !bill.is_paid });
      toast.success(
        !bill.is_paid ? 'Đã đánh dấu: ĐÃ THANH TOÁN ✅' : 'Đã chuyển thành: CHƯA THANH TOÁN'
      );
    } catch (err: any) {
      toast.error(err.message || 'Lỗi cập nhật.');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc muốn xoá hoá đơn "${bill.title}"?`)) return;
    try {
      await deleteMutation.mutateAsync(bill.id);
      toast.success('Đã xoá hoá đơn.');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xoá.');
    }
  };

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border p-4 sm:p-5 shadow-2xs transition-all ${
        bill.is_paid
          ? 'border-emerald-200/80 bg-emerald-50/20 dark:bg-stone-900 dark:border-stone-800 opacity-90'
          : isOverdue
          ? 'border-rose-300 bg-rose-50/30 dark:bg-stone-900 ring-1 ring-rose-200'
          : isDueSoon
          ? 'border-amber-300 bg-amber-50/30 dark:bg-stone-900 ring-1 ring-amber-200'
          : 'border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900'
      }`}
    >
      <div className="space-y-3">
        {/* Top: Icon, Category & Period */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${typeConfig.bg} ${typeConfig.color} flex-shrink-0`}>
              <TypeIcon className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                {typeConfig.label}
              </span>
              <span className="text-[11px] text-stone-500 font-medium">
                Kỳ: {bill.billing_period}
              </span>
            </div>
          </div>

          {/* Paid status badge */}
          {bill.is_paid ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="h-3 w-3" /> Đã đóng tiền
            </span>
          ) : isOverdue ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100/70 dark:bg-rose-950 px-2 py-0.5 rounded-full">
              <AlertTriangle className="h-3 w-3" /> Quá hạn đóng
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100/70 dark:bg-amber-950 px-2 py-0.5 rounded-full">
              <Clock className="h-3 w-3" /> Chưa thanh toán
            </span>
          )}
        </div>

        {/* Title & Amount */}
        <div className="pt-1">
          <h4 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 line-clamp-1">
            {bill.title}
          </h4>

          <div className="flex items-baseline justify-between mt-1">
            <span className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
              {formatVND(bill.amount)}
            </span>
            {bill.meter_reading && (
              <span className="text-xs font-mono font-semibold text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded">
                Chỉ số: {bill.meter_reading}
              </span>
            )}
          </div>
        </div>

        {/* Dates row */}
        <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-100 dark:border-stone-800">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Hạn: <strong>{formatDateVN(bill.due_date)}</strong>
          </span>

          {bill.paid_at && (
            <span className="text-emerald-700 font-medium">
              Đã trả: {formatDateVN(bill.paid_at)}
            </span>
          )}
        </div>

        {bill.notes && (
          <p className="text-xs text-stone-500 italic line-clamp-1">
            {bill.notes}
          </p>
        )}
      </div>

      {/* Action Footer: Paid Toggle & Delete */}
      <div className="pt-3 mt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={bill.is_paid}
            onChange={handleToggle}
            className="h-4 w-4 rounded text-emerald-700 focus:ring-emerald-700 cursor-pointer"
          />
          <span>{bill.is_paid ? 'Đã hoàn tất thanh toán' : 'Đánh dấu đã thanh toán'}</span>
        </label>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsEditOpen(true)}
            className="rounded p-1 text-stone-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors cursor-pointer"
            title="Chỉnh sửa hoá đơn"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className="rounded p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Xoá hoá đơn"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <EditUtilityModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        bill={bill}
      />
    </div>
  );
}
