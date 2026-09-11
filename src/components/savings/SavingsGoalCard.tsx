'use client';
import React, { useState } from 'react';
import { Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { useDeleteSavingsGoal } from '@/hooks/useSavings';
import { EditSavingsGoalModal } from './EditSavingsGoalModal';
import { ContributeModal } from './ContributeModal';
import { toast } from 'sonner';
import { formatVND } from '@/lib/utils';
import { differenceInDays } from 'date-fns';

export function SavingsGoalCard({ item }: { item: any }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const deleteMutation = useDeleteSavingsGoal();

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xoá mục tiêu này?')) return;
    try {
      await deleteMutation.mutateAsync(item.id);
      toast.success('Đã xoá!');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const percentage = Math.min(100, Math.floor((item.current_amount / item.target_amount) * 100));
  const isCompleted = item.status === 'COMPLETED' || percentage >= 100;

  let daysLeftText = '';
  if (item.deadline && !isCompleted) {
    const days = differenceInDays(new Date(item.deadline), new Date());
    if (days < 0) daysLeftText = 'Đã quá hạn';
    else if (days === 0) daysLeftText = 'Hạn chót hôm nay';
    else daysLeftText = `Còn ${days} ngày`;
  }

  return (
    <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm border border-stone-100" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
              {item.icon}
            </div>
            <div>
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                {item.title}
                {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              </h3>
              {item.description && <p className="text-xs text-stone-500 line-clamp-1">{item.description}</p>}
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setIsEditOpen(true)} className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors cursor-pointer">
              <Edit2 className="h-4 w-4" />
            </button>
            <button onClick={handleDelete} className="p-1.5 rounded-lg text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-stone-500 mb-0.5">Đã tích luỹ</p>
              <p className="font-bold text-stone-900 dark:text-white text-lg">{formatVND(item.current_amount)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-stone-500 mb-0.5">Mục tiêu</p>
              <p className="font-semibold text-stone-600 dark:text-stone-300">{formatVND(item.target_amount)}</p>
            </div>
          </div>

          <div className="relative w-full h-3 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: item.color }}></div>
          </div>
          
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium" style={{ color: item.color }}>{percentage}%</span>
            {daysLeftText && (
              <span className={`px-2 py-0.5 rounded-full ${daysLeftText.includes('quá hạn') ? 'bg-rose-100 text-rose-700' : 'bg-stone-100 text-stone-600'}`}>
                {daysLeftText}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {!isCompleted && (
        <button 
          onClick={() => setIsContributeOpen(true)}
          className="w-full py-2.5 rounded-xl font-medium text-sm transition-colors border shadow-xs hover:shadow-sm flex items-center justify-center gap-2"
          style={{ backgroundColor: `${item.color}10`, color: item.color, borderColor: `${item.color}30` }}
        >
          <span className="text-base">+</span> Góp tiền
        </button>
      )}

      <EditSavingsGoalModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} item={item} />
      <ContributeModal isOpen={isContributeOpen} onClose={() => setIsContributeOpen(false)} goal={item} />
    </div>
  );
}
