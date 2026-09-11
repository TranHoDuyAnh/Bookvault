'use client';
import React, { useState } from 'react';
import { Trash2, Edit2 } from 'lucide-react';
import { useDeleteExpense } from '@/hooks/useBudget';
import { EditExpenseModal } from './EditExpenseModal';
import { toast } from 'sonner';
import { formatVND } from '@/lib/utils';
import { format } from 'date-fns';

const PAYMENT_METHODS: Record<string, string> = {
  CASH: 'Tiền mặt',
  CARD: 'Thẻ NH',
  TRANSFER: 'Chuyển khoản',
  EWALLET: 'Ví điện tử',
  OTHER: 'Khác'
};

export function ExpenseCard({ item }: { item: any }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const deleteMutation = useDeleteExpense();

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xoá khoản chi này?')) return;
    try {
      await deleteMutation.mutateAsync(item.id);
      toast.success('Đã xoá!');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const category = item.budget_categories;

  return (
    <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-2xs space-y-2 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-semibold text-stone-900 dark:text-stone-100 truncate pr-2">{item.title}</h3>
          <span className="font-bold text-rose-600 whitespace-nowrap">-{formatVND(item.amount)}</span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs mb-2">
          {category && (
            <span className="px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
              {category.icon} {category.name}
            </span>
          )}
          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
            {PAYMENT_METHODS[item.payment_method] || item.payment_method}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500">
            {format(new Date(item.transaction_date), 'dd/MM/yyyy')}
          </span>
        </div>
        {item.notes && <p className="text-sm text-stone-500 line-clamp-2">{item.notes}</p>}
      </div>
      
      <div className="flex items-center justify-end gap-1 pt-2 border-t border-stone-100 dark:border-stone-800 mt-2">
        <button onClick={() => setIsEditOpen(true)} className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors cursor-pointer">
          <Edit2 className="h-3.5 w-3.5" />
        </button>
        <button onClick={handleDelete} className="p-1.5 rounded-lg text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      
      <EditExpenseModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} expense={item} />
    </div>
  );
}
