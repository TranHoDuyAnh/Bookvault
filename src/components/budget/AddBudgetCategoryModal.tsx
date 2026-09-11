'use client';
import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateBudgetCategory } from '@/hooks/useBudget';

const COLORS = [
  '#1e3a2f', '#047857', '#0369a1', '#1d4ed8', '#4338ca', 
  '#6d28d9', '#a21caf', '#be123c', '#b91c1c', '#c2410c', '#b45309'
];

export function AddBudgetCategoryModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('💰');
  const [color, setColor] = useState(COLORS[0]);
  const [monthlyBudget, setMonthlyBudget] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createMutation = useCreateBudgetCategory();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Vui lòng nhập tên danh mục.'); return; }
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync({ 
        name: name.trim(), 
        icon: icon.trim() || '💰',
        color,
        monthly_budget: Number(monthlyBudget) || 0
      });
      toast.success('Đã thêm thành công!');
      setName(''); setMonthlyBudget('');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm danh mục ngân sách" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Tên danh mục *" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Ngân sách hàng tháng (₫)" type="number" value={monthlyBudget} onChange={(e) => setMonthlyBudget(e.target.value)} min={0} />
        
        <div className="grid grid-cols-2 gap-4">
          <Input label="Biểu tượng (Emoji)" value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={2} />
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Màu sắc</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-stone-900 dark:border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
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
