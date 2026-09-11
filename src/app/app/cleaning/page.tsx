'use client';

import React, { useState } from 'react';
import { Sparkles, Plus, AlertTriangle, Clock, CheckCircle2, RotateCw } from 'lucide-react';
import { useCleaningTasks, useCleaningStats } from '@/hooks/useCleaning';
import { CleaningTaskCard } from '@/components/cleaning/CleaningTaskCard';
import { AddCleaningTaskModal } from '@/components/cleaning/AddCleaningTaskModal';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';

export default function CleaningPlannerPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'overdue' | 'dueSoon'>('all');

  const { data: stats, isLoading: statsLoading } = useCleaningStats();
  const { data: tasks = [], isLoading } = useCleaningTasks();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredTasks = tasks.filter((t) => {
    if (filterMode === 'all') return true;
    const due = new Date(t.next_due_date);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (filterMode === 'overdue') return diffDays < 0;
    if (filterMode === 'dueSoon') return diffDays >= 0 && diffDays <= 3;
    return true;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-emerald-800 dark:text-emerald-400" />
            <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Cleaning Planner & Lịch Vệ Sinh Định Kỳ
            </h1>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
            Quản lý việc dọn dẹp theo chu kỳ: Máy lạnh (3 tháng), Chăn ga (2 tuần), Tủ lạnh (1 tháng), Máy giặt (3 tháng)...
          </p>
        </div>

        <Button onClick={() => setIsAddModalOpen(true)} className="gap-1.5 font-bold shadow-xs">
          <Plus className="h-4 w-4" />
          Thêm lịch vệ sinh mới
        </Button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Tổng số công việc</span>
          <p className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
            {statsLoading ? <Skeleton className="h-7 w-12" /> : stats?.totalTasks || 0}
          </p>
          <span className="text-[11px] text-stone-400">lịch định kỳ</span>
        </div>

        <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-stone-900 p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-800 dark:text-rose-400 flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" /> Quá hạn cần dọn
          </span>
          <p className="font-serif text-2xl font-bold text-rose-700 dark:text-rose-400">
            {statsLoading ? <Skeleton className="h-7 w-12" /> : stats?.overdueCount || 0}
          </p>
          <span className="text-[11px] text-rose-700/80">cần xử lý ngay!</span>
        </div>

        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-stone-900 p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> Sắp đến hạn
          </span>
          <p className="font-serif text-2xl font-bold text-amber-700 dark:text-amber-400">
            {statsLoading ? <Skeleton className="h-7 w-12" /> : stats?.dueSoonCount || 0}
          </p>
          <span className="text-[11px] text-amber-700/80">trong 3 ngày tới</span>
        </div>

        <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Đang sạch sẽ</span>
          <p className="font-serif text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            {statsLoading ? <Skeleton className="h-7 w-12" /> : stats?.healthyCount || 0}
          </p>
          <span className="text-[11px] text-stone-400">còn nhiều thời gian</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2">
        <button
          onClick={() => setFilterMode('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filterMode === 'all'
              ? 'bg-[#1e3a2f] text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          Tất cả lịch dọn ({tasks.length})
        </button>
        <button
          onClick={() => setFilterMode('overdue')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
            filterMode === 'overdue'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-rose-700 hover:bg-rose-50'
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5" /> Quá hạn ({stats?.overdueCount || 0})
        </button>
        <button
          onClick={() => setFilterMode('dueSoon')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
            filterMode === 'dueSoon'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-amber-800 hover:bg-amber-50'
          }`}
        >
          <Clock className="h-3.5 w-3.5" /> Sắp đến hạn ({stats?.dueSoonCount || 0})
        </button>
      </div>

      {/* Task Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-3xl" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="h-8 w-8 text-emerald-800" />}
          title="Không có công việc nào trong danh mục này"
          description="Tất cả các khu vực và thiết bị đều trong trạng thái sạch sẽ và ngăn nắp!"
          actionLabel="Thêm lịch vệ sinh mới"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {filteredTasks.map((task) => (
            <CleaningTaskCard key={task.id} task={task} />
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AddCleaningTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
