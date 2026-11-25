'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { EnvelopeWithSpent } from '@/types/database';
import { formatVND } from '@/lib/utils';

const QUICK_AMOUNTS = [15_000, 25_000, 35_000, 50_000, 100_000, 200_000];

interface QuickExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  envelopes: EnvelopeWithSpent[];
  initialEnvelopeId?: string | null;
  onSubmit: (payload: {
    envelope_id: string;
    amount: number;
    note: string | null;
    spent_at: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export function QuickExpenseModal({
  isOpen,
  onClose,
  envelopes,
  initialEnvelopeId,
  onSubmit,
  isSubmitting,
}: QuickExpenseModalProps) {
  const [envelopeId, setEnvelopeId] = useState(initialEnvelopeId || envelopes[0]?.id || '');
  const [amountStr, setAmountStr] = useState('');
  const [note, setNote] = useState('');
  const [spentAt, setSpentAt] = useState(() => new Date().toISOString().split('T')[0]);

  const selectedEnv = envelopes.find((e) => e.id === envelopeId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(amountStr.replace(/\D/g, ''), 10);
    if (!envelopeId || !amount || amount <= 0) return;

    await onSubmit({
      envelope_id: envelopeId,
      amount,
      note: note.trim() || null,
      spent_at: spentAt,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ghi nhanh chi tiêu"
      description={
        selectedEnv
          ? `Hũ "${selectedEnv.name}" hiện còn ${formatVND(selectedEnv.remaining_amount)}`
          : 'Chọn hũ ngân sách và nhập số tiền đã chi.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-text-secondary block mb-1">
            Hũ ngân sách
          </label>
          <select
            value={envelopeId}
            onChange={(e) => setEnvelopeId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {envelopes.map((env) => (
              <option key={env.id} value={env.id}>
                {env.name} (còn {formatVND(env.remaining_amount)})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-text-secondary block mb-1.5">
            Số tiền (VNĐ)
          </label>
          <Input
            type="number"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            placeholder="Ví dụ: 35000"
            autoFocus
            required
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {QUICK_AMOUNTS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmountStr(String(val))}
                className="rounded-md border border-border bg-secondary/70 hover:bg-accent px-2.5 py-1 text-xs font-medium text-foreground transition-colors cursor-pointer tabular-nums"
              >
                {val / 1000}k
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1">
              Ghi chú (tuỳ chọn)
            </label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Bánh mì, đổ xăng..."
            />
          </div>
          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1">
              Ngày chi
            </label>
            <Input
              type="date"
              value={spentAt}
              onChange={(e) => setSpentAt(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : 'Lưu chi tiêu'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
