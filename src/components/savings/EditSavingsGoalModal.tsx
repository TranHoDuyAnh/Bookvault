'use client';
import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateSavingsGoal } from '@/hooks/useSavings';
import { format } from 'date-fns';

const COLORS = [
  '#1e3a2f', '#047857', '#0369a1', '#1d4ed8', '#4338ca', 
  '#6d28d9', '#a21caf', '#be123c', '#b91c1c', '#c2410c', '#b45309', '#f59e0b'
];

export function EditSavingsGoalModal({ isOpen, onClose, item }: { isOpen: boolean; onClose: () => void, item: any }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('');
  const [deadline, setDeadline] = useState('');
  
  useEffect(() => {
    if (item && isOpen) {
      setTitle(item.title || '');
      setDescription(item.description || '');
      setTargetAmount(item.target_amount ? String(item.target_amount) : '');
      setIcon(item.icon || '🎯');
      setColor(item.color || COLORS[0]);
      setDeadline(item.deadline ? format(new Date(item.deadline), 'yyyy-MM-dd') : '');
    }
  }, [item, isOpen]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateMutation = useUpdateSavingsGoal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount) { toast.error('Vui lòng nhập tên và số tiền mục tiêu.'); return; }
    setIsSubmitting(true);
    try {
      await updateMutation.mutateAsync({ 
        id: item.id,
        updates: {
          title: title.trim(), 
          description: description.trim(),
          target_amount: Number(targetAmount),
          icon: icon.trim() || '🎯',
          color,
          deadline: deadline ? new Date(deadline).toISOString() : null
        }
      });
      toast.success('Đã cập nhật!');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sửa mục tiêu tiết kiệm" maxWidth="md">
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

        <Input label="Ngày hoàn thành dự kiến" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />

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
