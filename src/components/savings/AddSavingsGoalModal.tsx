'use client';
import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateSavingsGoal } from '@/hooks/useSavings';

const COLORS = [
  '#1e3a2f', '#047857', '#0369a1', '#1d4ed8', '#4338ca', 
  '#6d28d9', '#a21caf', '#be123c', '#b91c1c', '#c2410c', '#b45309', '#f59e0b'
];

export function AddSavingsGoalModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [color, setColor] = useState(COLORS[0]);
  const [deadline, setDeadline] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createMutation = useCreateSavingsGoal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount) { toast.error('Vui lòng nhập tên và số tiền mục tiêu.'); return; }
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync({ 
        title: title.trim(), 
        description: description.trim(),
        target_amount: Number(targetAmount),
        icon: icon.trim() || '🎯',
        color,
        deadline: deadline ? new Date(deadline).toISOString() : undefined
      });
      toast.success('Đã thêm thành công!');
      setTitle(''); setDescription(''); setTargetAmount(''); setDeadline('');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm mục tiêu tiết kiệm" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Tên mục tiêu *" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input label="Số tiền mục tiêu (₫) *" type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} required min={1} />
        
        <Input label="Mô tả" value={description} onChange={(e) => setDescription(e.target.value)} />
        
        <div className="grid grid-cols-2 gap-4">
          <Input label="Biểu tượng (Emoji)" value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={2} />
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Màu sắc</label>
            <div className="flex flex-wrap gap-1.5 mt-2">
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

        <Input label="Ngày hoàn thành dự kiến (Tuỳ chọn)" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />

        <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Huỷ</Button>
          <Button type="submit" disabled={isSubmitting || !title.trim() || !targetAmount} className="bg-[#1e3a2f] hover:bg-[#152a22] text-white gap-2">
            {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /><span>Đang lưu...</span></> : <><Check className="h-4 w-4" /><span>Lưu</span></>}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
