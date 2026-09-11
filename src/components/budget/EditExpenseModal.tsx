'use client';
import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateExpense, useBudgetCategories } from '@/hooks/useBudget';
import { format } from 'date-fns';

export function EditExpenseModal({ isOpen, onClose, expense }: { isOpen: boolean; onClose: () => void, expense: any }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [transactionDate, setTransactionDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  
  useEffect(() => {
    if (expense && isOpen) {
      setTitle(expense.title || '');
      setAmount(expense.amount ? String(expense.amount) : '');
      setCategoryId(expense.category_id || '');
      setTransactionDate(expense.transaction_date ? format(new Date(expense.transaction_date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
      setPaymentMethod(expense.payment_method || 'CASH');
      setNotes(expense.notes || '');
    }
  }, [expense, isOpen]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateMutation = useUpdateExpense();
  const { data: categories = [] } = useBudgetCategories();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) { toast.error('Vui lòng nhập tên và số tiền.'); return; }
    setIsSubmitting(true);
    try {
      await updateMutation.mutateAsync({ 
        id: expense.id,
        updates: {
          title: title.trim(), 
          amount: Number(amount),
          category_id: categoryId || null,
          transaction_date: new Date(transactionDate).toISOString(),
          payment_method: paymentMethod,
          notes: notes.trim()
        }
      });
      toast.success('Đã cập nhật thành công!');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sửa chi tiêu" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Tiêu đề *" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input label="Số tiền (₫) *" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required min={0} />
        
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Danh mục</label>
          <select 
            value={categoryId} 
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
            ))}
          </select>
        </div>

        <Input label="Ngày giao dịch" type="date" value={transactionDate} onChange={(e) => setTransactionDate(e.target.value)} required />
        
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Phương thức thanh toán</label>
          <select 
            value={paymentMethod} 
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="CASH">Tiền mặt</option>
            <option value="CARD">Thẻ ngân hàng</option>
            <option value="TRANSFER">Chuyển khoản</option>
            <option value="EWALLET">Ví điện tử</option>
            <option value="OTHER">Khác</option>
          </select>
        </div>

        <Input label="Ghi chú" value={notes} onChange={(e) => setNotes(e.target.value)} />

        <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Huỷ</Button>
          <Button type="submit" disabled={isSubmitting || !title.trim() || !amount} className="bg-[#1e3a2f] hover:bg-[#152a22] text-white gap-2">
            {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /><span>Đang lưu...</span></> : <><Check className="h-4 w-4" /><span>Lưu</span></>}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
