'use client';

import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Clock, AlertTriangle, Calendar, Trash2, RotateCw, History } from 'lucide-react';
import type { CleaningTask } from '@/types/database';
import { formatDateVN } from '@/lib/utils';
import { useCompleteCleaningTask, useDeleteCleaningTask } from '@/hooks/useCleaning';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

export function CleaningTaskCard({ task }: { task: CleaningTask }) {
  const completeMutation = useCompleteCleaningTask();
  const deleteMutation = useDeleteCleaningTask();
  const [isCheckInLoading, setIsCheckInLoading] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(task.next_due_date);
  dueDate.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Determine Urgency & Badge
  const getStatusConfig = () => {
    if (diffDays < 0) {
      return {
        label: `ĐÃ QUÁ HẠN ${Math.abs(diffDays)} NGÀY!`,
        bg: 'border-rose-300 bg-rose-50/80 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300',
        badge: 'bg-rose-600 text-white',
        icon: AlertTriangle,
        isOverdue: true,
      };
    }
    if (diffDays === 0) {
      return {
        label: 'ĐẾN HẠN HÔM NAY!',
        bg: 'border-amber-300 bg-amber-50/80 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300',
        badge: 'bg-amber-600 text-white',
        icon: Clock,
        isToday: true,
      };
    }
    if (diffDays <= 3) {
      return {
        label: `Sắp đến hạn (còn ${diffDays} ngày)`,
        bg: 'border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300',
        badge: 'bg-amber-500 text-white',
        icon: Clock,
      };
    }
    return {
      label: `Còn ${diffDays} ngày`,
      bg: 'border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300',
      badge: 'bg-emerald-600 text-white',
      icon: CheckCircle2,
    };
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const handleCheckIn = async () => {
    setIsCheckInLoading(true);
    try {
      await completeMutation.mutateAsync({
        taskId: task.id,
        frequencyDays: task.frequency_days,
        notes: `Đã hoàn thành vào ${new Date().toLocaleDateString('vi-VN')}`,
      });
      toast.success(`Tuyệt vời! Đã hoàn thành "${task.title}" ✨`);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xác nhận.');
    } finally {
      setIsCheckInLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc muốn xoá lịch vệ sinh "${task.title}"?`)) return;
    try {
      await deleteMutation.mutateAsync(task.id);
      toast.success('Đã xoá lịch vệ sinh.');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xoá.');
    }
  };

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-3xl border p-5 shadow-2xs transition-all hover:shadow-md ${
        statusConfig.isOverdue
          ? 'border-rose-300 bg-rose-50/20 dark:bg-stone-900'
          : statusConfig.isToday
          ? 'border-amber-300 bg-amber-50/20 dark:bg-stone-900'
          : 'border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900'
      }`}
    >
      <div className="space-y-3">
        {/* Top badges: Category & Frequency */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full">
            {task.category}
          </span>
          <span className="text-xs font-semibold text-stone-600 dark:text-stone-400 flex items-center gap-1">
            <RotateCw className="h-3 w-3 text-[#1e3a2f]" />
            Mỗi {task.frequency_days} ngày
          </span>
        </div>

        {/* Title */}
        <div>
          <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
            {task.title}
          </h4>
          {task.notes && (
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 line-clamp-2">
              {task.notes}
            </p>
          )}
        </div>

        {/* Status countdown box */}
        <div className={`flex items-center justify-between p-3 rounded-2xl border ${statusConfig.bg}`}>
          <div className="flex items-center gap-2">
            <StatusIcon className="h-4 w-4 flex-shrink-0" />
            <span className="text-xs font-bold">{statusConfig.label}</span>
          </div>
          <span className="text-[11px] font-medium text-stone-500">
            Hạn: {formatDateVN(task.next_due_date)}
          </span>
        </div>

        {/* Last completed date */}
        <div className="text-[11px] text-stone-400 flex items-center gap-1 pt-1">
          <Calendar className="h-3 w-3" />
          <span>
            Lần làm gần nhất: {task.last_completed_at ? formatDateVN(task.last_completed_at) : 'Chưa ghi nhận'}
          </span>
          {task.logs && task.logs.length > 0 && (
            <span className="ml-auto font-medium text-stone-500">
              ({task.logs.length} lần đã dọn)
            </span>
          )}
        </div>
      </div>

      {/* Action CTA */}
      <div className="pt-4 mt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
        <Button
          size="sm"
          onClick={handleCheckIn}
          disabled={isCheckInLoading}
          className={`text-xs gap-1.5 font-bold h-8 flex-1 ${
            statusConfig.isOverdue
              ? 'bg-rose-600 hover:bg-rose-700 text-white'
              : 'bg-[#1e3a2f] hover:bg-[#284f40] text-white'
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          {isCheckInLoading ? 'Đang cập nhật...' : 'Đã vệ sinh hôm nay ✨'}
        </Button>

        <button
          onClick={handleDelete}
          className="rounded p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          title="Xoá lịch"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
