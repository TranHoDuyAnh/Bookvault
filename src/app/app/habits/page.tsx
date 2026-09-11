'use client';
import React, { useState } from 'react';
import { Target, Plus } from 'lucide-react';
import { useHabits } from '@/hooks/useHabits';
import { HabitCard } from '@/components/habits/HabitCard';
import { AddHabitModal } from '@/components/habits/AddHabitModal';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';

export default function HabitsPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { data: habits = [], isLoading } = useHabits();

  const todayStr = new Date().toISOString().split('T')[0];
  const completedToday = habits.filter(h => h.recentLogs?.some((l: any) => l.completed_date === todayStr)).length;
  const totalCheckInsWeek = habits.reduce((acc, h) => acc + (h.recentLogs?.length || 0), 0);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Target className="h-8 w-8 text-emerald-700" />
            <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Habit Tracker
            </h1>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">Xây dựng thói quen tốt — không phá vỡ chuỗi!</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-1.5 font-bold shadow-sm bg-[#1e3a2f] text-white">
          <Plus className="h-4 w-4" />
          Thêm thói quen
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm text-center">
          <div className="text-3xl font-bold text-stone-800 dark:text-stone-200">{habits.length}</div>
          <div className="text-xs text-stone-500 uppercase font-semibold mt-1">Tổng thói quen</div>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900 shadow-sm text-center">
          <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{completedToday}</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-500 uppercase font-semibold mt-1">Hoàn thành hôm nay</div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-2xl border border-orange-100 dark:border-orange-900 shadow-sm text-center">
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'short' })}
          </div>
          <div className="text-xs text-orange-600 dark:text-orange-500 uppercase font-semibold mt-1">Hôm nay</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-2xl border border-blue-100 dark:border-blue-900 shadow-sm text-center">
          <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">{totalCheckInsWeek}</div>
          <div className="text-xs text-blue-600 dark:text-blue-500 uppercase font-semibold mt-1">Check-in tuần này</div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
        </div>
      ) : habits.length === 0 ? (
        <EmptyState 
          icon={<Target className="h-12 w-12 text-stone-300" />} 
          title="Chưa có thói quen nào" 
          description="Bắt đầu theo dõi và xây dựng các thói quen tốt mỗi ngày." 
          actionLabel="Thêm thói quen đầu tiên" 
          onAction={() => setIsAddOpen(true)} 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </div>
      )}

      <AddHabitModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
}
