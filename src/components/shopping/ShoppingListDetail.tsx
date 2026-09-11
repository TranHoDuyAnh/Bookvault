'use client';
import React, { useState } from 'react';
import { Plus, CheckSquare, Trash2, ArrowLeft } from 'lucide-react';
import { useShoppingItems, useCreateShoppingItem, useClearCheckedItems } from '@/hooks/useShopping';
import { ShoppingItemRow } from './ShoppingItemRow';
import { AddShoppingItemModal } from './AddShoppingItemModal';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import type { ShoppingList } from '@/types/database';
import { toast } from 'sonner';

export function ShoppingListDetail({ list, onBack }: { list: ShoppingList; onBack: () => void }) {
  const [quickAddName, setQuickAddName] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const { data: items = [], isLoading } = useShoppingItems(list.id);
  const createMutation = useCreateShoppingItem();
  const clearMutation = useClearCheckedItems();

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddName.trim()) return;
    try {
      await createMutation.mutateAsync({ 
        list_id: list.id,
        name: quickAddName.trim(),
        quantity: '1',
        category: 'Khác'
      });
      setQuickAddName('');
    } catch (err: any) {
      toast.error('Lỗi khi thêm nhanh');
    }
  };

  const handleClearChecked = async () => {
    if (!confirm('Xoá tất cả các mục đã đánh dấu hoàn thành?')) return;
    try {
      await clearMutation.mutateAsync(list.id);
      toast.success('Đã dọn dẹp danh sách!');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const uncheckedItems = items.filter(i => !i.is_checked);
  const checkedItems = items.filter(i => i.is_checked);

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col min-h-[60vh]">
      {/* Header */}
      <div className="bg-stone-50 dark:bg-stone-900/50 px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-lg text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{list.icon}</span>
            <div>
              <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">{list.name}</h2>
              <div className="text-xs text-stone-500">{checkedItems.length} / {items.length} mục đã mua</div>
            </div>
          </div>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-[#1e3a2f] hover:bg-[#152a22] text-white gap-2 shadow-xs hidden sm:flex">
          <Plus className="h-4 w-4" /> Chi tiết
        </Button>
        <button onClick={() => setIsAddModalOpen(true)} className="sm:hidden p-2 rounded-lg bg-[#1e3a2f] text-white">
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Quick Add */}
      <div className="p-4 border-b border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900">
        <form onSubmit={handleQuickAdd} className="relative">
          <input
            type="text"
            placeholder="Thêm nhanh (nhập tên và Enter)..."
            value={quickAddName}
            onChange={e => setQuickAddName(e.target.value)}
            className="w-full pl-4 pr-12 py-3 bg-stone-50 dark:bg-stone-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a2f] dark:focus:ring-emerald-500 transition-shadow"
          />
          <button type="submit" disabled={!quickAddName.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-[#1e3a2f] dark:hover:text-emerald-400 disabled:opacity-50">
            <Plus className="h-5 w-5" />
          </button>
        </form>
      </div>

      {/* List */}
      <div className="flex-1 p-6 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-stone-400">
            <CheckSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>Danh sách trống</p>
          </div>
        ) : (
          <div className="space-y-6">
            {uncheckedItems.length > 0 && (
              <div>
                <div className="space-y-1">
                  {uncheckedItems.map(item => <ShoppingItemRow key={item.id} item={item} />)}
                </div>
              </div>
            )}
            
            {checkedItems.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Đã mua ({checkedItems.length})</span>
                  <button onClick={handleClearChecked} className="text-rose-500 hover:text-rose-600 flex items-center gap-1 normal-case font-medium">
                    <Trash2 className="h-3 w-3" /> Dọn dẹp
                  </button>
                </h4>
                <div className="space-y-1">
                  {checkedItems.map(item => <ShoppingItemRow key={item.id} item={item} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <AddShoppingItemModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} listId={list.id} />
    </div>
  );
}
