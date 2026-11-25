'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Check,
  X,
  Lock,
  Sparkles,
} from 'lucide-react';
import type { WeeklyBudget } from '@/types/database';
import { formatDateVN, formatVND, cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface WeeklySummaryHeaderProps {
  budget: WeeklyBudget;
  totalAllocated: number;
  totalSpent: number;
  weekOffset: number;
  onChangeWeekOffset: (offset: number) => void;
  onUpdateCap: (newCap: number) => Promise<void>;
  onOpenCloseWeek: () => void;
  isUpdatingCap: boolean;
}

export function WeeklySummaryHeader({
  budget,
  totalAllocated,
  totalSpent,
  weekOffset,
  onChangeWeekOffset,
  onUpdateCap,
  onOpenCloseWeek,
  isUpdatingCap,
}: WeeklySummaryHeaderProps) {
  const [editingCap, setEditingCap] = useState(false);
  const [capInput, setCapInput] = useState(String(budget.total_cap));

  const effectiveCap = budget.total_cap + budget.rollover_in;
  const remaining = effectiveCap - totalSpent;
  const unallocated = effectiveCap - totalAllocated;
  const spentPct = effectiveCap > 0 ? Math.min(100, Math.round((totalSpent / effectiveCap) * 100)) : 0;
  const isClosed = budget.status === 'CLOSED';

  const handleSaveCap = async () => {
    const parsed = parseInt(capInput.replace(/\D/g, ''), 10);
    if (!parsed || parsed <= 0) return;
    await onUpdateCap(parsed);
    setEditingCap(false);
  };

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-2xs space-y-4">
      {/* Top Row: Week Switcher + Close Week Action */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChangeWeekOffset(weekOffset - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background hover:bg-accent transition-colors cursor-pointer"
            title="Tuần trước"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="px-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {weekOffset === 0
                  ? 'Tuần này'
                  : weekOffset === -1
                    ? 'Tuần trước'
                    : weekOffset === 1
                      ? 'Tuần sau'
                      : `Tuần (${weekOffset > 0 ? `+${weekOffset}` : weekOffset})`}
              </span>
              {isClosed && (
                <span className="inline-flex items-center gap-1 rounded-full bg-success-subtle text-success border border-success/25 px-2 py-0.5 text-[11px] font-medium">
                  <Lock className="h-3 w-3" />
                  Đã chốt tuần
                </span>
              )}
            </div>
            <p className="text-xs text-text-muted tabular-nums">
              {formatDateVN(budget.week_start)} — {formatDateVN(budget.week_end)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onChangeWeekOffset(weekOffset + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background hover:bg-accent transition-colors cursor-pointer"
            title="Tuần sau"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {weekOffset !== 0 && (
            <Button variant="outline" size="sm" onClick={() => onChangeWeekOffset(0)}>
              Về tuần này
            </Button>
          )}
        </div>

        {!isClosed && (
          <Button variant="secondary" size="sm" onClick={onOpenCloseWeek}>
            <Sparkles className="h-3.5 w-3.5" />
            Chốt tuần & Xử lý dư
          </Button>
        )}
      </div>

      {/* 4 Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-lg border border-border bg-background/60 p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">Trần chi tiêu tuần</span>
            {!isClosed && !editingCap && (
              <button
                type="button"
                onClick={() => {
                  setCapInput(String(budget.total_cap));
                  setEditingCap(true);
                }}
                className="text-text-muted hover:text-foreground cursor-pointer"
                title="Sửa tổng trần tuần"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {editingCap ? (
            <div className="flex items-center gap-1.5 pt-1">
              <Input
                value={capInput}
                onChange={(e) => setCapInput(e.target.value)}
                type="number"
                className="h-8 text-xs"
              />
              <button
                type="button"
                disabled={isUpdatingCap}
                onClick={handleSaveCap}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground cursor-pointer"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setEditingCap(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <>
              <p className="text-lg font-semibold text-foreground tabular-nums">
                {formatVND(effectiveCap)}
              </p>
              {budget.rollover_in > 0 && (
                <p className="text-[11px] text-success">
                  Gồm +{formatVND(budget.rollover_in)} dư tuần trước
                </p>
              )}
            </>
          )}
        </div>

        <div className="rounded-lg border border-border bg-background/60 p-3.5 space-y-1">
          <span className="text-xs text-text-muted block">Đã chia vào các hũ</span>
          <p className="text-lg font-semibold text-foreground tabular-nums">
            {formatVND(totalAllocated)}
          </p>
          <p
            className={cn(
              'text-[11px]',
              unallocated < 0 ? 'text-destructive' : 'text-text-muted'
            )}
          >
            {unallocated >= 0
              ? `Còn ${formatVND(unallocated)} chưa chia`
              : `Vượt trần ${formatVND(Math.abs(unallocated))}`}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-background/60 p-3.5 space-y-1">
          <span className="text-xs text-text-muted block">Đã chi tiêu</span>
          <p className="text-lg font-semibold text-foreground tabular-nums">
            {formatVND(totalSpent)}
          </p>
          <p className="text-[11px] text-text-muted tabular-nums">
            {spentPct}% tổng ngân sách tuần
          </p>
        </div>

        <div className="rounded-lg border border-border bg-background/60 p-3.5 space-y-1">
          <span className="text-xs text-text-muted block">Còn lại trong tuần</span>
          <p
            className={cn(
              'text-lg font-semibold tabular-nums',
              remaining >= 0 ? 'text-success' : 'text-destructive'
            )}
          >
            {formatVND(remaining)}
          </p>
          <p className="text-[11px] text-text-muted">
            {isClosed
              ? `Tiết kiệm: ${formatVND(budget.surplus_to_savings)} • Tuần sau: ${formatVND(budget.surplus_to_next_week)}`
              : remaining > 0
                ? 'Có thể chuyển sang tuần sau / tiết kiệm'
                : 'Đã chạm trần chi tiêu'}
          </p>
        </div>
      </div>

      {/* Overall Weekly Progress Bar */}
      <div className="space-y-1.5">
        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300',
              remaining < 0
                ? 'bg-destructive'
                : spentPct >= 85
                  ? 'bg-warning'
                  : 'bg-success'
            )}
            style={{ width: `${spentPct}%` }}
          />
        </div>
      </div>
    </section>
  );
}
