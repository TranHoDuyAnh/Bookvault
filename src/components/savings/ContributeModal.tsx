'use client';
import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAddContribution } from '@/hooks/useSavings';
import { format } from 'date-fns';

export function ContributeModal({ isOpen, onClose, goal }: { isOpen: boolean; onClose: () => void, goal: any }) {
  const [amount, setAmount] = useState('');
  const [contributionDate, setContributionDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const contributeMutation = useAddContribution();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) { toast.error('Vui lòng nhập số tiền.'); return; }
    setIsSubmitting(true);
    try {
      await contributeMutation.mutateAsync({ 
        goalId: goal.id,
        amount: Number(amount),
        contribution_date: new Date(contributionDate).toISOString(),
        note: note.trim()
      });
      toast.success('Đã nạp tiền thành công!');
      setAmount(''); setNote('');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Góp tiền: ${goal?.title}`} maxWidth="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Số tiền góp (₫) *" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required min={1} autoFocus />
        <Input label="Ngày góp" type="date" value={contributionDate} onChange={(e) => setContributionDate(e.target.value)} required />
        <Input label="Ghi chú" value={note} onChange={(e) => setNote(e.target.value)} />

        <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Huỷ</Button>
          <Button type="submit" disabled={isSubmitting || !amount} style={{ backgroundColor: goal?.color }} className="text-white hover:brightness-90 gap-2">
            {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /><span>Đang lưu...</span></> : <><Check className="h-4 w-4" /><span>Góp tiền</span></>}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
