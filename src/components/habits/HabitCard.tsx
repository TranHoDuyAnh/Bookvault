'use client';
import React, { useState } from 'react';
import { Trash2, Edit2, Loader2, Check } from 'lucide-react';
import { useDeleteHabit, useCheckInHabit, useUncheckHabit, useHabitStreak } from '@/hooks/useHabits';
import { EditHabitModal } from './EditHabitModal';
import { toast } from 'sonner';

export function HabitCard({ habit }: { habit: any }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const deleteMutation = useDeleteHabit();
  const checkInMutation = useCheckInHabit();
  const uncheckMutation = useUncheckHabit();
  
  const { data: streak = 0 } = useHabitStreak(habit.id);

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xoá thói quen này?')) return;
    try {
      await deleteMutation.mutateAsync(habit.id);
      toast.success('Đã xoá!');
    } catch (err: any) {
      toast.error(err.message);
    }
  };
  
  const todayDateStr = new Date().toISOString().split('T')[0];
  const isCheckedToday = habit.recentLogs?.some((log: any) => log.completed_date === todayDateStr);
  
  const handleCheckIn = async () => {
    try {
      if (isCheckedToday) {
        await uncheckMutation.mutateAsync({ habitId: habit.id, date: todayDateStr });
      } else {
        await checkInMutation.mutateAsync({ habitId: habit.id, date: todayDateStr });
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };
  
  // Last 7 days circles
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
  
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500 text-emerald-900 border-emerald-500',
    blue: 'bg-blue-500 text-blue-900 border-blue-500',
    violet: 'bg-violet-500 text-violet-900 border-violet-500',
    amber: 'bg-amber-500 text-amber-900 border-amber-500',
    rose: 'bg-rose-500 text-rose-900 border-rose-500',
    teal: 'bg-teal-500 text-teal-900 border-teal-500'
  };
  
  const activeColor = colorMap[habit.color || 'emerald'] || colorMap.emerald;

  return (
    <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-sm flex flex-col justify-between space-y-4">
      <div>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{habit.icon || '🎯'}</span>
            <div>
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">{habit.title}</h3>
              <p className="text-xs text-stone-500">{habit.frequency === 'DAILY' ? 'Hàng ngày' : `${habit.target_per_week} lần/tuần`}</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 text-sm font-semibold text-orange-600 dark:text-orange-400">
              🔥 {streak}
            </div>
          </div>
        </div>
        
        {habit.description && (
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-2 line-clamp-2">{habit.description}</p>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 mt-4">
        <div className="flex gap-1.5">
          {last7Days.map(dateStr => {
            const checked = habit.recentLogs?.some((l: any) => l.completed_date === dateStr);
            return (
              <div 
                key={dateStr} 
                title={dateStr}
                className={`w-5 h-5 rounded-full border ${checked ? activeColor.split(' ')[0] : 'bg-stone-100 border-stone-200 dark:bg-stone-800 dark:border-stone-700'}`} 
              />
            );
          })}
        </div>
      </div>
      
      <button 
        onClick={handleCheckIn}
        disabled={checkInMutation.isPending || uncheckMutation.isPending}
        className={`w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
          isCheckedToday 
            ? 'bg-emerald-50 text-emerald-700 hover:bg-rose-50 hover:text-rose-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50' 
            : `${activeColor.split(' ')[0]} text-white hover:opacity-90`
        }`}
      >
        {checkInMutation.isPending || uncheckMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isCheckedToday ? (
          <>
            <Check className="h-4 w-4" />
            <span>Đã hoàn thành hôm nay ✓</span>
          </>
        ) : (
          <span>Check-in hôm nay</span>
        )}
      </button>

      <div className="flex items-center justify-end gap-1 pt-2 border-t border-stone-100 dark:border-stone-800">
        <button onClick={() => setIsEditOpen(true)} className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors cursor-pointer">
          <Edit2 className="h-3.5 w-3.5" />
        </button>
        <button onClick={handleDelete} className="p-1.5 rounded-lg text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <EditHabitModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} habit={habit} />
    </div>
  );
}
