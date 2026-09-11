'use client';
import React, { useState } from 'react';
import { Target, Plus } from 'lucide-react';
import { usePersonalGoals } from '@/hooks/useGoals';
import { GoalCard } from '@/components/goals/GoalCard';
import { AddGoalModal } from '@/components/goals/AddGoalModal';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';

export default function GoalsPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'PAUSED'>('ALL');
  const { data: goals = [], isLoading } = usePersonalGoals();

  const filteredGoals = goals.filter(g => filter === 'ALL' || g.status === filter);
  const total = goals.length;
  const active = goals.filter(g => g.status === 'ACTIVE').length;
  const completed = goals.filter(g => g.status === 'COMPLETED').length;
  const avgProgress = total > 0 ? Math.round(goals.reduce((acc, g) => acc + g.overall_progress, 0) / total) : 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Target className="h-7 w-7 text-[#1e3a2f] dark:text-emerald-500" />
            <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Mục Tiêu Cá Nhân & OKR
            </h1>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">Theo dõi và quản lý các mục tiêu quan trọng trong cuộc sống.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-1.5 font-bold shadow-xs bg-[#1e3a2f] hover:bg-[#152a22] text-white">
          <Plus className="h-4 w-4" />
          Thêm Mục Tiêu
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="text-xs text-stone-500 font-medium">Tổng số</div>
          <div className="text-2xl font-bold mt-1">{total}</div>
        </div>
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="text-xs text-stone-500 font-medium">Đang thực hiện</div>
          <div className="text-2xl font-bold mt-1 text-emerald-600">{active}</div>
        </div>
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="text-xs text-stone-500 font-medium">Hoàn thành</div>
          <div className="text-2xl font-bold mt-1 text-blue-600">{completed}</div>
        </div>
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="text-xs text-stone-500 font-medium">Tiến độ TB</div>
          <div className="text-2xl font-bold mt-1 text-[#1e3a2f] dark:text-emerald-400">{avgProgress}%</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 border-b border-stone-200 dark:border-stone-800 pb-px">
        {[
          { id: 'ALL', label: 'Tất cả' },
          { id: 'ACTIVE', label: 'Đang thực hiện' },
          { id: 'COMPLETED', label: 'Hoàn thành' },
          { id: 'PAUSED', label: 'Tạm dừng' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              filter === tab.id
                ? 'border-[#1e3a2f] text-[#1e3a2f] dark:border-emerald-500 dark:text-emerald-400'
                : 'border-transparent text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
        </div>
      ) : filteredGoals.length === 0 ? (
        <EmptyState 
          icon={<Target className="h-10 w-10 text-stone-300" />} 
          title="Chưa có mục tiêu nào" 
          description={filter === 'ALL' ? "Hãy bắt đầu đặt mục tiêu và theo dõi tiến độ của bạn." : `Không có mục tiêu nào trong trạng thái này.`} 
          actionLabel={filter === 'ALL' ? "Tạo mục tiêu đầu tiên" : undefined} 
          onAction={filter === 'ALL' ? () => setIsAddOpen(true) : undefined} 
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {filteredGoals.map(goal => <GoalCard key={goal.id} goal={goal} />)}
        </div>
      )}

      <AddGoalModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
}
