'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { SavingsGoal, WeeklyBudget } from '@/types/database';
import { formatVND } from '@/lib/utils';

interface CloseWeekModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: WeeklyBudget;
  surplusAmount: number;
  savingsGoals: SavingsGoal[];
  onConfirm: (payload: {
    toNextWeek: number;
    toSavings: number;
    savingsGoalId?: string | null;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export function CloseWeekModal({
  isOpen,
  onClose,
  budget,
  surplusAmount,
  savingsGoals,
  onConfirm,
  isSubmitting,
}: CloseWeekModalProps) {
  const safeSurplus = Math.max(0, surplusAmount);
  const [toNextWeek, setToNextWeek] = useState(0);
  const [toSavings, setToSavings] = useState(safeSurplus);
  const [selectedGoalId, setSelectedGoalId] = useState(savingsGoals[0]?.id || '');

  const handleNextWeekChange = (val: number) => {
    const clamped = Math.max(0, Math.min(safeSurplus, val));
    setToNextWeek(clamped);
    setToSavings(safeSurplus - clamped);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm({
      toNextWeek,
      toSavings,
      savingsGoalId: selectedGoalId || null,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chốt tuần & Xử lý tiền dư"
      description={`Tuần ${budget.week_start} → ${budget.week_end}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg border border-border bg-secondary/50 p-4 text-center">
          <span className="text-xs text-text-muted block">Phần tiền dư chưa chi tới</span>
          <p className="text-2xl font-semibold text-success tabular-nums mt-0.5">
            {formatVND(safeSurplus)}
          </p>
          {surplusAmount < 0 && (
            <p className="text-xs text-destructive mt-1">
              Tuần này đã chi vượt trần {formatVND(Math.abs(surplusAmount))}.
            </p>
          )}
        </div>

        {safeSurplus > 0 && (
          <>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleNextWeekChange(0)}
              >
                100% vào Tiết kiệm
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleNextWeekChange(safeSurplus)}
              >
                100% sang Tuần sau
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleNextWeekChange(Math.round(safeSurplus / 2))}
              >
                Chia đôi 50/50
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">
                  Đưa sang tuần sau
                </label>
                <Input
                  type="number"
                  value={toNextWeek}
                  onChange={(e) =>
                    handleNextWeekChange(parseInt(e.target.value || '0', 10) || 0)
                  }
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">
                  Đưa vào quỹ tiết kiệm
                </label>
                <Input
                  type="number"
                  value={toSavings}
                  onChange={(e) => {
                    const v = Math.max(
                      0,
                      Math.min(safeSurplus, parseInt(e.target.value || '0', 10) || 0)
                    );
                    setToSavings(v);
                    setToNextWeek(safeSurplus - v);
                  }}
                />
              </div>
            </div>

            {toSavings > 0 && (
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">
                  Quỹ tiết kiệm nhận tiền
                </label>
                {savingsGoals.length > 0 ? (
                  <select
                    value={selectedGoalId}
                    onChange={(e) => setSelectedGoalId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground"
                  >
                    {savingsGoals.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} (hiện có {formatVND(g.current_amount)})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-text-muted">
                    Hệ thống sẽ tự tạo quỹ mặc định &ldquo;Quỹ tiết kiệm tuần&rdquo; cho bạn.
                  </p>
                )}
              </div>
            )}
          </>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang chốt...' : 'Xác nhận chốt tuần'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
