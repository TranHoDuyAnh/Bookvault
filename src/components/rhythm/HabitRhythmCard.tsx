'use client';

import React from 'react';
import { Check, Coffee, Edit3, Filter, Trash2 } from 'lucide-react';
import { RHYTHM_COLORS } from '@/lib/rhythm';
import type { RhythmHabit, RhythmLogStatus } from '@/types/database';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface HabitRhythmCardProps {
  habit: RhythmHabit;
  weekDoneCount: number;
  weekRestCount: number;
  selectedDateStatus: RhythmLogStatus | null;
  isFiltered: boolean;
  onToggleFilter: () => void;
  onSetStatus: (status: RhythmLogStatus | null) => void;
  onEdit: () => void;
  onDelete: () => void;
  isBusy?: boolean;
}

export function HabitRhythmCard({
  habit,
  weekDoneCount,
  weekRestCount,
  selectedDateStatus,
  isFiltered,
  onToggleFilter,
  onSetStatus,
  onEdit,
  onDelete,
  isBusy = false,
}: HabitRhythmCardProps) {
  const colorMeta = RHYTHM_COLORS[habit.color] ?? RHYTHM_COLORS.emerald;
  const adjustedTarget = Math.max(1, habit.weekly_target - weekRestCount);
  const progressPercent = Math.min(
    100,
    Math.round((weekDoneCount / adjustedTarget) * 100)
  );
  const isTargetMet = weekDoneCount >= adjustedTarget;

  return (
    <div
      className={cn(
        'rounded-2xl border bg-card backdrop-blur-xl p-4 sm:p-5 shadow-[var(--glass-shadow)] transition-all duration-150 space-y-3.5',
        isFiltered ? 'border-primary ring-1 ring-primary/30' : 'border-border'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={cn('h-3 w-3 rounded-full shrink-0', colorMeta.dot)} />
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold text-foreground truncate">
              {habit.title}
            </h3>
            <p className="text-xs text-text-muted">
              Mục tiêu: {habit.weekly_target} ngày/tuần
              {weekRestCount > 0 && ` • Đã nghỉ ${weekRestCount} ngày`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onToggleFilter}
            className={cn(
              'rounded-lg p-1.5 transition-colors cursor-pointer',
              isFiltered
                ? 'bg-primary text-primary-foreground'
                : 'text-text-muted hover:bg-accent hover:text-foreground'
            )}
            title="Lọc Heatmap theo mục này"
            aria-label="Lọc Heatmap theo mục này"
          >
            <Filter className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg p-1.5 text-text-muted hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
            title="Chỉnh sửa"
            aria-label="Chỉnh sửa"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg p-1.5 text-text-muted hover:bg-destructive-subtle hover:text-destructive transition-colors cursor-pointer"
            title="Xóa"
            aria-label="Xóa"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Weekly Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-muted">
            Tuần này:{' '}
            <strong className="text-foreground tabular-nums">
              {weekDoneCount}/{adjustedTarget}
            </strong>{' '}
            buổi
          </span>
          <span
            className={cn(
              'font-semibold tabular-nums',
              isTargetMet ? 'text-success' : 'text-text-secondary'
            )}
          >
            {isTargetMet ? 'Đạt mục tiêu tuần ✓' : `${progressPercent}%`}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300',
              isTargetMet ? 'bg-success' : colorMeta.bar
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Check-in buttons for selected date */}
      <div className="flex items-center gap-2 pt-1">
        <Button
          type="button"
          size="sm"
          variant={selectedDateStatus === 'DONE' ? 'default' : 'outline'}
          disabled={isBusy}
          onClick={() =>
            onSetStatus(selectedDateStatus === 'DONE' ? null : 'DONE')
          }
          className="flex-1 h-8 text-xs"
        >
          <Check className="h-3.5 w-3.5" />
          {selectedDateStatus === 'DONE' ? 'Đã hoàn thành' : 'Hoàn thành'}
        </Button>

        <Button
          type="button"
          size="sm"
          variant={selectedDateStatus === 'REST' ? 'secondary' : 'ghost'}
          disabled={isBusy}
          onClick={() =>
            onSetStatus(selectedDateStatus === 'REST' ? null : 'REST')
          }
          className={cn(
            'h-8 px-3 text-xs',
            selectedDateStatus === 'REST' &&
              'border-info/40 bg-info-subtle text-info'
          )}
          title="Đánh dấu ngày nghỉ có chủ đích (không bị trừ điểm nhịp tuần)"
        >
          <Coffee className="h-3.5 w-3.5" />
          Nghỉ
        </Button>
      </div>
    </div>
  );
}
