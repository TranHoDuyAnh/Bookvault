'use client';
import React, { useState } from 'react';
import { Target, Plus } from 'lucide-react';
import { useSavingsGoals } from '@/hooks/useSavings';
import { SavingsGoalCard } from '@/components/savings/SavingsGoalCard';
import { AddSavingsGoalModal } from '@/components/savings/AddSavingsGoalModal';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { formatVND } from '@/lib/utils';

export default function SavingsPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { data: goals = [], isLoading } = useSavingsGoals();

  const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
  const completedCount = goals.filter(g => g.is_completed || g.current_amount >= g.target_amount).length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-emerald-800" />
            <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Mục tiêu tiết kiệm
            </h1>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">Lập kế hoạch và theo dõi quỹ tiết kiệm của bạn</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-1.5 font-bold shadow-xs">
          <Plus className="h-4 w-4" />
          Thêm mục tiêu
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800">
          <p className="text-sm text-stone-500 mb-1">Tổng mục tiêu</p>
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{goals.length}</p>
        </div>
        <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800">
          <p className="text-sm text-stone-500 mb-1">Đã tích luỹ</p>
          <p className="text-2xl font-bold text-emerald-600">{formatVND(totalSaved)}</p>
        </div>
        <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800">
          <p className="text-sm text-stone-500 mb-1">Tổng dự kiến</p>
          <p className="text-2xl font-bold text-blue-600">{formatVND(totalTarget)}</p>
        </div>
        <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800">
          <p className="text-sm text-stone-500 mb-1">Đã hoàn thành</p>
          <p className="text-2xl font-bold text-amber-600">{completedCount}</p>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
        </div>
      ) : goals.length === 0 ? (
        <EmptyState icon={<Target className="h-8 w-8" />} title="Chưa có mục tiêu nào" description="Hãy bắt đầu tích luỹ cho tương lai bằng cách tạo mục tiêu đầu tiên" actionLabel="Thêm mục tiêu" onAction={() => setIsAddOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => <SavingsGoalCard key={goal.id} item={goal} />)}
        </div>
      )}

      <AddSavingsGoalModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
}
