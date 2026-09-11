'use client';
import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateIncome } from '@/hooks/useBudget';
import { format } from 'date-fns';

export function AddIncomeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [incomeDate, setIncomeDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [source, setSource] = useState('');
  const [notes, setNotes] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createMutation = useCreateIncome();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) { toast.error('Vui lòng nhập tên và số tiền.'); return; }
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync({ 
        title: title.trim(), 
        amount: Number(amount),
        income_date: new Date(incomeDate).toISOString(),
        source: source.trim(),
        notes: notes.trim()
      });
      toast.success('Đã thêm thành công!');
      setTitle(''); setAmount(''); setSource(''); setNotes('');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm thu nhập mới" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Tiêu đề *" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input label="Số tiền (₫) *" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required min={0} />
        <Input label="Ngày nhận" type="date" value={incomeDate} onChange={(e) => setIncomeDate(e.target.value)} required />
        <Input label="Nguồn (Ví dụ: Lương, Thưởng...)" value={source} onChange={(e) => setSource(e.target.value)} />
        <Input label="Ghi chú" value={notes} onChange={(e) => setNotes(e.target.value)} />

        <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Huỷ</Button>
          <Button type="submit" disabled={isSubmitting || !title.trim() || !amount} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
            {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /><span>Đang lưu...</span></> : <><Check className="h-4 w-4" /><span>Lưu</span></>}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
