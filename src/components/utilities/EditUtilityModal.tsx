'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Zap, Camera, X, Loader2, Check, DollarSign, Calendar, FileText, Edit } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useUpdateUtilityBill } from '@/hooks/useUtilities';
import { UTILITY_TYPES_CONFIG } from './UtilityBillCard';
import type { UtilityBill, UtilityType } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';

export function EditUtilityModal({
  isOpen,
  onClose,
  bill,
}: {
  isOpen: boolean;
  onClose: () => void;
  bill: UtilityBill;
}) {
  const updateMutation = useUpdateUtilityBill();
  const { user } = useUser();
  const receiptFileRef = useRef<HTMLInputElement>(null);

  const [utilityType, setUtilityType] = useState<UtilityType>(bill.utility_type || 'ELECTRICITY');
  const [title, setTitle] = useState(bill.title || '');
  const [billingPeriod, setBillingPeriod] = useState(bill.billing_period || '');
  const [dueDate, setDueDate] = useState(bill.due_date || '');
  const [amount, setAmount] = useState(bill.amount !== null && bill.amount !== undefined ? String(bill.amount) : '');
  const [meterReading, setMeterReading] = useState(bill.meter_reading || '');
  const [isPaid, setIsPaid] = useState(bill.is_paid || false);
  const [paidAt, setPaidAt] = useState(bill.paid_at || '');
  const [notes, setNotes] = useState(bill.notes || '');

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(bill.receipt_url || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && bill) {
      setUtilityType(bill.utility_type || 'ELECTRICITY');
      setTitle(bill.title || '');
      setBillingPeriod(bill.billing_period || '');
      setDueDate(bill.due_date || '');
      setAmount(bill.amount !== null && bill.amount !== undefined ? String(bill.amount) : '');
      setMeterReading(bill.meter_reading || '');
      setIsPaid(bill.is_paid || false);
      setPaidAt(bill.paid_at || '');
      setNotes(bill.notes || '');
      setReceiptFile(null);
      setReceiptPreview(bill.receipt_url || null);
    }
  }, [isOpen, bill]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) {
      toast.error('Vui lòng nhập tên hoá đơn và số tiền.');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalReceiptUrl = bill.receipt_url;

      if (receiptFile && user) {
        const supabase = createClient();
        const fileExt = receiptFile.name.split('.').pop() || 'jpg';
        const filePath = `${user.id}/utilities/${Date.now()}_receipt.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('book-images')
          .upload(filePath, receiptFile, { cacheControl: '3600', upsert: false });

        if (!uploadError) {
          const { data: signed } = await supabase.storage
            .from('book-images')
            .createSignedUrl(filePath, 60 * 60 * 24 * 30);
          finalReceiptUrl = signed?.signedUrl || filePath;
        }
      }

      await updateMutation.mutateAsync({
        billId: bill.id,
        updates: {
          utility_type: utilityType,
          title: title.trim(),
          billing_period: billingPeriod.trim(),
          due_date: dueDate,
          amount: Number(amount) || 0,
          meter_reading: meterReading.trim() || null,
          is_paid: isPaid,
          paid_at: isPaid ? (paidAt || new Date().toISOString()) : null,
          notes: notes.trim() || null,
          receipt_url: finalReceiptUrl,
        },
      });

      toast.success('Đã cập nhật hoá đơn! 💡');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi cập nhật hoá đơn.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <Edit className="h-5 w-5 text-amber-600" />
          <span>Chỉnh sửa hoá đơn định kỳ</span>
        </div>
      }
      description="Cập nhật số tiền, kỳ thanh toán và chỉ số công tơ."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
            Loại dịch vụ
          </label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(UTILITY_TYPES_CONFIG).map(([typeKey, cfg]) => {
              const isSelected = utilityType === typeKey;
              return (
                <button
                  key={typeKey}
                  type="button"
                  onClick={() => {
                    setUtilityType(typeKey as UtilityType);
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-2xs'
                      : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-600'
                  }`}
                >
                  <span className="text-base mb-0.5">{cfg.icon}</span>
                  <span className="text-[11px] truncate">{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <Input
          label="Tên hoá đơn *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* Billing period & Due date */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Kỳ hoá đơn (VD: Tháng 09/2026)"
            value={billingPeriod}
            onChange={(e) => setBillingPeriod(e.target.value)}
            required
          />

          <Input
            label="Hạn nộp tiền *"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>

        {/* Amount & Meter */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Số tiền cần nộp (₫) *"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <Input
            label="Chỉ số công tơ / Số khối"
            placeholder="VD: 142 kWh hoặc 18 m³"
            value={meterReading}
            onChange={(e) => setMeterReading(e.target.value)}
          />
        </div>

        {/* Payment toggle */}
        <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
              Trạng thái thanh toán
            </span>
            <span className="text-[11px] text-stone-500">
              {isPaid ? 'Đã thanh toán khoản này' : 'Chưa nộp tiền'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsPaid(!isPaid)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              isPaid ? 'bg-emerald-600' : 'bg-stone-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                isPaid ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Notes */}
        <Textarea
          label="Ghi chú (Mã khách hàng, hướng dẫn nộp...)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />

        {/* Receipt photo */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
            Biên lai / Bill chuyển khoản
          </label>
          <input
            ref={receiptFileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setReceiptFile(e.target.files[0]);
                setReceiptPreview(URL.createObjectURL(e.target.files[0]));
              }
            }}
          />
          <div
            onClick={() => receiptFileRef.current?.click()}
            className="group relative flex h-20 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#e7e2d9] dark:border-stone-700 bg-[#f7f4ee] dark:bg-stone-800 hover:border-amber-600 transition-colors"
          >
            {receiptPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={receiptPreview} alt="Receipt" className="h-full w-full object-cover" />
            ) : (
              <div className="flex items-center gap-1.5 text-stone-400 group-hover:text-amber-600 text-xs">
                <Camera className="h-4 w-4" />
                <span>Đổi ảnh hoá đơn / biên nhận</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Huỷ
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !title.trim() || !amount}
            className="bg-[#1e3a2f] hover:bg-[#152a22] text-white gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Lưu thay đổi</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
