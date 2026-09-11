'use client';
import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateKeyResult } from '@/hooks/useGoals';

export function AddKeyResultModal({ isOpen, onClose, goalId }: { isOpen: boolean; onClose: () => void; goalId: string }) {
  const [title, setTitle] = useState('');
  const [unit, setUnit] = useState('');
  const [targetValue, setTargetValue] = useState<number | ''>('');
  const [currentValue, setCurrentValue] = useState<number | ''>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createMutation = useCreateKeyResult();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || targetValue === '') { toast.error('Vui lòng điền tiêu đề và mục tiêu.'); return; }
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync({ 
        goal_id: goalId, 
        title: title.trim(), 
        unit: unit.trim() || null, 
        target_value: Number(targetValue), 
        current_value: Number(currentValue) || 0 
      });
      toast.success('Đã thêm Key Result!');
      setTitle('');
      setUnit('');
      setTargetValue('');
      setCurrentValue(0);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm Key Result" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Tiêu đề *" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input label="Đơn vị (VD: cuốn sách, km, ₫...)" value={unit} onChange={(e) => setUnit(e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Mục tiêu *" type="number" step="any" value={targetValue} onChange={(e) => setTargetValue(e.target.value === '' ? '' : Number(e.target.value))} required />
          <Input label="Hiện tại" type="number" step="any" value={currentValue} onChange={(e) => setCurrentValue(e.target.value === '' ? '' : Number(e.target.value))} />
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Huỷ</Button>
          <Button type="submit" disabled={isSubmitting || !title.trim() || targetValue === ''} className="bg-[#1e3a2f] hover:bg-[#152a22] text-white gap-2">
            {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /><span>Đang lưu...</span></> : <><Check className="h-4 w-4" /><span>Lưu</span></>}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
