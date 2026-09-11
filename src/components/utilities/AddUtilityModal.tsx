'use client';

import React, { useState, useRef } from 'react';
import { Zap, Camera, X, Loader2, Check, DollarSign, Calendar, FileText } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useCreateUtilityBill } from '@/hooks/useUtilities';
import { UTILITY_TYPES_CONFIG } from './UtilityBillCard';
import type { UtilityType } from '@/types/database';
import { toast } from 'sonner';

export function AddUtilityModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const createMutation = useCreateUtilityBill();
  const receiptFileRef = useRef<HTMLInputElement>(null);

  const currentMonthStr = `Tháng ${String(new Date().getMonth() + 1).padStart(2, '0')}/${new Date().getFullYear()}`;

  const [utilityType, setUtilityType] = useState<UtilityType>('ELECTRICITY');
  const [title, setTitle] = useState('Tiền điện sinh hoạt');
  const [billingPeriod, setBillingPeriod] = useState(currentMonthStr);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [meterReading, setMeterReading] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [notes, setNotes] = useState('');

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  const handleSelectType = (type: UtilityType) => {
    setUtilityType(type);
    const config = UTILITY_TYPES_CONFIG[type];
    setTitle(config.label);
  };

  const handleReset = () => {
    setUtilityType('ELECTRICITY');
    setTitle('Tiền điện sinh hoạt');
    setBillingPeriod(currentMonthStr);
    setDueDate(new Date().toISOString().split('T')[0]);
    setAmount('');
    setMeterReading('');
    setIsPaid(false);
    setNotes('');
    setReceiptFile(null);
    setReceiptPreview(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) {
      toast.error('Vui lòng nhập tên hoá đơn và số tiền.');
      return;
    }

    try {
      await createMutation.mutateAsync({
        utilityType,
        title,
        billingPeriod,
        dueDate,
        amount: Number(amount),
        meterReading: meterReading || null,
        isPaid,
        notes,
        receiptFile,
      });

      toast.success('Đã lưu hoá đơn định kỳ! 💡');
      handleReset();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu hoá đơn.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-600" />
          <span>Thêm hoá đơn định kỳ</span>
        </div>
      }
      description="Theo dõi tiền điện, nước, internet, điện thoại và phí quản lý chung cư."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Quick select utility type */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
            Loại dịch vụ
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {(Object.keys(UTILITY_TYPES_CONFIG) as UtilityType[]).map((type) => {
              const isSelected = utilityType === type;
              const config = UTILITY_TYPES_CONFIG[type];
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleSelectType(type)}
                  className={`p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                    isSelected
                      ? 'border-[#1e3a2f] bg-emerald-50 text-[#1e3a2f] ring-2 ring-[#1e3a2f]/20 font-bold'
                      : 'border-stone-200 bg-white hover:border-stone-300 text-stone-600'
                  }`}
                >
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>

        <Input
          label="Tên hoá đơn *"
          placeholder="Tiền điện tháng 09, Internet VNPT..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Số tiền (VNĐ) *"
            type="number"
            min="0"
            placeholder="850000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            leftIcon={<DollarSign className="h-4 w-4" />}
            required
          />

          <Input
            label="Kỳ hoá đơn *"
            placeholder="Tháng 09/2026"
            value={billingPeriod}
            onChange={(e) => setBillingPeriod(e.target.value)}
            required
          />

          <Input
            label="Hạn thanh toán *"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            leftIcon={<Calendar className="h-4 w-4" />}
            required
          />

          <Input
            label="Chỉ số công tơ / Tiêu thụ"
            placeholder="315 kWh hoặc 18 m³"
            value={meterReading}
            onChange={(e) => setMeterReading(e.target.value)}
          />
        </div>

        <label className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 dark:bg-stone-800 text-xs font-semibold cursor-pointer">
          <input
            type="checkbox"
            checked={isPaid}
            onChange={(e) => setIsPaid(e.target.checked)}
            className="h-4 w-4 rounded text-emerald-700 focus:ring-emerald-700"
          />
          <span>Hoá đơn này đã được thanh toán rồi</span>
        </label>

        <Textarea
          label="Ghi chú thêm"
          placeholder="Mã khách hàng PE01..., chuyển khoản qua app ngân hàng..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />

        <div className="flex justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
          <Button type="button" variant="outline" size="sm" onClick={handleReset} disabled={createMutation.isPending}>
            Huỷ
          </Button>
          <Button type="submit" size="sm" disabled={createMutation.isPending} className="gap-1.5 font-semibold">
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                Lưu hoá đơn
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
