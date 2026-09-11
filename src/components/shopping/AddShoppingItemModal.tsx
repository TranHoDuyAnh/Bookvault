'use client';
import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateShoppingItem } from '@/hooks/useShopping';

export function AddShoppingItemModal({ isOpen, onClose, listId }: { isOpen: boolean; onClose: () => void; listId: string }) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('Khác');
  const [estimatedPrice, setEstimatedPrice] = useState<number | ''>('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const createMutation = useCreateShoppingItem();
  const categories = ['Rau củ', 'Thịt cá', 'Đồ khô', 'Đồ uống', 'Đông lạnh', 'Vệ sinh', 'Khác'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Vui lòng nhập tên mặt hàng.'); return; }
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync({ 
        list_id: listId,
        name: name.trim(),
        quantity: quantity.trim() || '1',
        unit: unit.trim() || null,
        category,
        estimated_price: estimatedPrice === '' ? null : Number(estimatedPrice),
        note: note.trim() || null
      });
      toast.success('Đã thêm mục!');
      setName('');
      setQuantity('1');
      setUnit('');
      setEstimatedPrice('');
      setNote('');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm Mặt Hàng" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Tên mặt hàng *" value={name} onChange={(e) => setName(e.target.value)} required />
        
        <div className="grid grid-cols-2 gap-4">
          <Input label="Số lượng" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          <Input label="Đơn vị (VD: kg, hộp...)" value={unit} onChange={(e) => setUnit(e.target.value)} />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Danh mục</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full flex h-10 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2 dark:border-stone-800 dark:bg-stone-950 dark:ring-offset-stone-950 dark:focus-visible:ring-stone-300">
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <Input label="Giá dự kiến (₫)" type="number" step="1000" value={estimatedPrice} onChange={(e) => setEstimatedPrice(e.target.value === '' ? '' : Number(e.target.value))} />
        <Input label="Ghi chú" value={note} onChange={(e) => setNote(e.target.value)} />

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
