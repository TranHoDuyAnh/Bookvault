'use client';
import React from 'react';
import { Trash2, ChevronRight } from 'lucide-react';
import { useDeleteShoppingList } from '@/hooks/useShopping';
import type { ShoppingList, ShoppingItem } from '@/types/database';
import { toast } from 'sonner';
import { formatVND } from '@/lib/utils';

export function ShoppingListCard({ list, onClick }: { list: ShoppingList & { items: ShoppingItem[] }, onClick: () => void }) {
  const deleteMutation = useDeleteShoppingList();

  const totalItems = list.items.length;
  const checkedItems = list.items.filter(i => i.is_checked).length;
  const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;
  
  const estTotal = list.items.filter(i => !i.is_checked && i.estimated_price).reduce((acc, i) => acc + (i.estimated_price || 0), 0);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Bạn có chắc muốn xoá danh sách này?')) return;
    try {
      await deleteMutation.mutateAsync(list.id);
      toast.success('Đã xoá danh sách!');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div 
      onClick={onClick}
      className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-5 shadow-2xs hover:shadow-md hover:border-[#1e3a2f]/30 dark:hover:border-emerald-500/30 transition-all cursor-pointer group flex flex-col"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-stone-100 dark:bg-stone-800 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-colors">
            {list.icon}
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 group-hover:text-[#1e3a2f] dark:group-hover:text-emerald-400 transition-colors">{list.name}</h3>
            {list.description && <p className="text-xs text-stone-500 truncate max-w-[200px]">{list.description}</p>}
          </div>
        </div>
        <button onClick={handleDelete} className="p-1.5 rounded-lg text-stone-300 hover:bg-rose-50 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 mb-2">
        <div className="flex justify-between text-xs text-stone-600 dark:text-stone-400 mb-1.5">
          <span>{checkedItems} / {totalItems} mục đã mua</span>
          {estTotal > 0 && <span className="font-medium text-amber-600 dark:text-amber-500">~{formatVND(estTotal)}</span>}
        </div>
        <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-1.5 overflow-hidden">
          <div className={`h-1.5 rounded-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : 'bg-[#1e3a2f] dark:bg-emerald-600'}`} style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-auto pt-3 border-t border-stone-50 dark:border-stone-800/50 flex items-center justify-between text-sm text-[#1e3a2f] dark:text-emerald-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        <span>Mở danh sách</span>
        <ChevronRight className="h-4 w-4" />
      </div>
    </div>
  );
}
