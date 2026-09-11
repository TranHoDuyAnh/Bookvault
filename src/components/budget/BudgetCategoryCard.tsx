'use client';
import React from 'react';
import { Trash2 } from 'lucide-react';
import { useDeleteBudgetCategory } from '@/hooks/useBudget';
import { toast } from 'sonner';
import { formatVND } from '@/lib/utils';

export function BudgetCategoryCard({ item, spent = 0 }: { item: any, spent?: number }) {
  const deleteMutation = useDeleteBudgetCategory();

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xoá danh mục này?')) return;
    try {
      await deleteMutation.mutateAsync(item.id);
      toast.success('Đã xoá!');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const budget = item.monthly_budget || 0;
  const percentage = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  
  let progressColor = 'bg-emerald-500';
  if (percentage >= 90) progressColor = 'bg-rose-500';
  else if (percentage >= 70) progressColor = 'bg-amber-500';

  return (
    <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-2xs space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
            {item.icon}
          </div>
          <h3 className="font-bold text-stone-900 dark:text-stone-100">{item.name}</h3>
        </div>
        <button onClick={handleDelete} className="p-1.5 rounded-lg text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-stone-500">Đã tiêu: <span className="font-semibold text-stone-900 dark:text-stone-100">{formatVND(spent)}</span></span>
          {budget > 0 && <span className="text-stone-500">/{formatVND(budget)}</span>}
        </div>
        {budget > 0 && (
          <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2">
            <div className={`h-2 rounded-full ${progressColor}`} style={{ width: `${percentage}%` }}></div>
          </div>
        )}
      </div>
    </div>
  );
}
