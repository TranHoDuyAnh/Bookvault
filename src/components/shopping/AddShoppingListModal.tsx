'use client';
import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateShoppingList } from '@/hooks/useShopping';

export function AddShoppingListModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🛒');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createMutation = useCreateShoppingList();

  const emojis = ['🛒', '🛍️', '🥦', '🧴', '🏪', '🍎', '🥩', '🍞', '🎉', '💊'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Vui lòng nhập tên danh sách.'); return; }
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync({ name: name.trim(), description: description.trim() || null, icon });
      toast.success('Đã thêm danh sách!');
      setName('');
      setDescription('');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm Danh Sách Mua Sắm" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Tên danh sách *" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Mô tả" value={description} onChange={(e) => setDescription(e.target.value)} />
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Biểu tượng</label>
          <div className="flex flex-wrap gap-2">
            {emojis.map(e => (
              <button key={e} type="button" onClick={() => setIcon(e)} className={`w-8 h-8 rounded text-lg flex items-center justify-center ${icon === e ? 'bg-stone-200 dark:bg-stone-700' : 'hover:bg-stone-100 dark:hover:bg-stone-800'}`}>{e}</button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Huỷ</Button>
          <Button type="submit" disabled={isSubmitting || !name.trim()} className="bg-[#1e3a2f] hover:bg-[#152a22] text-white gap-2">
            {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /><span>Đang lưu...</span></> : <><Check className="h-4 w-4" /><span>Lưu</span></>}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
