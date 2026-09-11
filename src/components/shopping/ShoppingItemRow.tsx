'use client';
import React from 'react';
import { Trash2 } from 'lucide-react';
import { useCheckShoppingItem, useDeleteShoppingItem } from '@/hooks/useShopping';
import type { ShoppingItem } from '@/types/database';
import { formatVND } from '@/lib/utils';
import { toast } from 'sonner';

export function ShoppingItemRow({ item }: { item: ShoppingItem }) {
  const checkMutation = useCheckShoppingItem();
  const deleteMutation = useDeleteShoppingItem();

  const handleToggle = async () => {
    try {
      await checkMutation.mutateAsync({ id: item.id, checked: !item.is_checked });
    } catch (err: any) {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(item.id);
    } catch (err: any) {
      toast.error('Lỗi khi xoá mục');
    }
  };

  return (
    <div className={`flex items-start gap-3 py-3 border-b border-stone-100 dark:border-stone-800 last:border-0 group transition-opacity ${item.is_checked ? 'opacity-50' : 'opacity-100'}`}>
      <button 
        onClick={handleToggle}
        className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          item.is_checked 
            ? 'bg-emerald-500 border-emerald-500 text-white' 
            : 'border-stone-300 hover:border-emerald-400 dark:border-stone-600'
        }`}
      >
        {item.is_checked && <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`font-medium text-stone-900 dark:text-stone-100 ${item.is_checked ? 'line-through' : ''}`}>
            {item.name}
          </span>
          {item.quantity && <span className="text-xs text-stone-500 font-mono bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded">{item.quantity} {item.unit}</span>}
          {item.category && <span className="text-[10px] uppercase tracking-wider text-stone-400 border border-stone-200 dark:border-stone-700 px-1.5 py-0.5 rounded">{item.category}</span>}
        </div>
        
        {(item.estimated_price || item.note) && (
          <div className="flex items-center gap-3 mt-1 text-xs">
            {item.estimated_price && <span className="text-emerald-600 font-medium">{formatVND(item.estimated_price)}</span>}
            {item.note && <span className="text-stone-500 italic">{item.note}</span>}
          </div>
        )}
      </div>

      <button onClick={handleDelete} className="p-1.5 text-stone-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
