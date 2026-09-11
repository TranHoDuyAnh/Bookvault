'use client';
import React, { useState } from 'react';
import { Trash2, Edit2, Plus } from 'lucide-react';
import { useDeletePersonalGoal } from '@/hooks/useGoals';
import { EditGoalModal } from './EditGoalModal';
import { AddKeyResultModal } from './AddKeyResultModal';
import { KeyResultRow } from './KeyResultRow';
import type { PersonalGoal, KeyResult } from '@/types/database';
import { toast } from 'sonner';

type GoalWithKRs = PersonalGoal & { key_results: KeyResult[], overall_progress: number };

const statusLabels: Record<string, string> = {
  ACTIVE: 'Đang thực hiện',
  COMPLETED: 'Hoàn thành',
  PAUSED: 'Tạm dừng',
  ABANDONED: 'Từ bỏ'
};

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  PAUSED: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  ABANDONED: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
};

export function GoalCard({ goal }: { goal: GoalWithKRs }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddKROpen, setIsAddKROpen] = useState(false);
  const deleteMutation = useDeletePersonalGoal();

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xoá mục tiêu này?')) return;
    try {
      await deleteMutation.mutateAsync(goal.id);
      toast.success('Đã xoá mục tiêu!');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-2xs space-y-4 flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: goal.color || '#1e3a2f' }} />
      
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-stone-100 dark:bg-stone-800">
            {goal.icon}
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">{goal.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              {goal.period && <span className="text-xs px-2 py-0.5 rounded bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400">{goal.period}</span>}
              <span className={`text-xs px-2 py-0.5 rounded ${statusColors[goal.status]}`}>
                {statusLabels[goal.status]}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsEditOpen(true)} className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors cursor-pointer">
            <Edit2 className="h-4 w-4" />
          </button>
          <button onClick={handleDelete} className="p-1.5 rounded-lg text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {goal.description && <p className="text-sm text-stone-600 dark:text-stone-400">{goal.description}</p>}

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-medium text-stone-700 dark:text-stone-300">
          <span>Tiến độ tổng quan</span>
          <span>{Math.round(goal.overall_progress)}%</span>
        </div>
        <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2 overflow-hidden">
          <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${goal.overall_progress}%`, backgroundColor: goal.color || '#1e3a2f' }} />
        </div>
      </div>

      {/* KRs */}
      <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex-1">
        <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Key Results</h4>
        {goal.key_results.length === 0 ? (
          <p className="text-sm text-stone-400 italic py-2">Chưa có Key Result nào.</p>
        ) : (
          <div className="space-y-1">
            {goal.key_results.map(kr => (
              <KeyResultRow key={kr.id} kr={kr} />
            ))}
          </div>
        )}
      </div>

      {/* Add KR Button */}
      <button onClick={() => setIsAddKROpen(true)} className="flex items-center gap-1.5 text-sm text-emerald-700 hover:text-emerald-800 dark:text-emerald-500 dark:hover:text-emerald-400 font-medium py-1 w-full justify-center rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
        <Plus className="h-4 w-4" /> Thêm Key Result
      </button>

      <EditGoalModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} goal={goal} />
      <AddKeyResultModal isOpen={isAddKROpen} onClose={() => setIsAddKROpen(false)} goalId={goal.id} />
    </div>
  );
}
