'use client';
import React, { useState } from 'react';
import { ShoppingCart, Plus, CheckSquare } from 'lucide-react';
import { useShoppingLists } from '@/hooks/useShopping';
import { ShoppingListCard } from '@/components/shopping/ShoppingListCard';
import { ShoppingListDetail } from '@/components/shopping/ShoppingListDetail';
import { AddShoppingListModal } from '@/components/shopping/AddShoppingListModal';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { formatVND } from '@/lib/utils';
import type { ShoppingList } from '@/types/database';

export default function ShoppingPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<ShoppingList | null>(null);
  
  const { data: lists = [], isLoading } = useShoppingLists();

  // If selected list was deleted, clear selection
  React.useEffect(() => {
    if (selectedList && !lists.find(l => l.id === selectedList.id) && !isLoading) {
      setSelectedList(null);
    }
  }, [lists, selectedList, isLoading]);

  const totalLists = lists.length;
  const totalUnchecked = lists.reduce((acc, list) => acc + list.items.filter(i => !i.is_checked).length, 0);
  const totalEstSpend = lists.reduce((acc, list) => 
    acc + list.items.filter(i => !i.is_checked && i.estimated_price).reduce((sum, i) => sum + (i.estimated_price || 0), 0)
  , 0);

  if (selectedList) {
    // Pass the fresh list data if available to keep header stats updated
    const freshList = lists.find(l => l.id === selectedList.id) || selectedList;
    return (
      <div className="max-w-4xl mx-auto py-4">
        <ShoppingListDetail list={freshList} onBack={() => setSelectedList(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-7 w-7 text-[#1e3a2f] dark:text-emerald-500" />
            <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Danh Sách Mua Sắm
            </h1>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">Không bao giờ quên mua gì khi ra chợ hay siêu thị.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-1.5 font-bold shadow-xs bg-[#1e3a2f] hover:bg-[#152a22] text-white">
          <Plus className="h-4 w-4" />
          Tạo danh sách
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-stone-100 dark:bg-stone-800 rounded-lg text-stone-500"><ShoppingCart className="h-6 w-6" /></div>
          <div>
            <div className="text-xs text-stone-500 font-medium">Danh sách</div>
            <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">{totalLists}</div>
          </div>
        </div>
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 rounded-lg"><CheckSquare className="h-6 w-6" /></div>
          <div>
            <div className="text-xs text-stone-500 font-medium">Cần mua</div>
            <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">{totalUnchecked}</div>
          </div>
        </div>
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-lg"><span className="text-xl font-bold">₫</span></div>
          <div>
            <div className="text-xs text-stone-500 font-medium">Dự kiến chi tiêu</div>
            <div className="text-xl font-bold text-stone-900 dark:text-stone-100">{formatVND(totalEstSpend)}</div>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
        </div>
      ) : lists.length === 0 ? (
        <EmptyState 
          icon={<ShoppingCart className="h-10 w-10 text-stone-300" />} 
          title="Chưa có danh sách" 
          description="Tạo danh sách mua sắm đầu tiên để chuẩn bị cho lần đi siêu thị tới." 
          actionLabel="Tạo danh sách" 
          onAction={() => setIsAddOpen(true)} 
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {lists.map(list => <ShoppingListCard key={list.id} list={list} onClick={() => setSelectedList(list)} />)}
        </div>
      )}

      <AddShoppingListModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
}
