'use client';

import React, { useMemo, useState } from 'react';
import { Coffee, Check, Calendar } from 'lucide-react';
import {
  buildGithubHeatmapGrid,
  type HeatmapDayCell,
} from '@/lib/rhythm';
import type { RhythmHabit, RhythmLog } from '@/types/database';
import { cn } from '@/lib/utils';

interface GithubHeatmapProps {
  habits: RhythmHabit[];
  logs: RhythmLog[];
  selectedHabitId: string | null;
  onClearHabitFilter: () => void;
  selectedDate: string;
  onSelectDate: (isoDate: string) => void;
}

const DAY_LABELS = ['T2', '', 'T4', '', 'T6', '', 'CN'];

const PALETTES = {
  github: {
    label: 'GitHub Green',
    0: 'bg-zinc-200/75 dark:bg-white/[0.07]',
    1: 'bg-[#9be9a8] dark:bg-[#0e4429]',
    2: 'bg-[#40c463] dark:bg-[#006d32]',
    3: 'bg-[#30a14e] dark:bg-[#26a641]',
    4: 'bg-[#216e39] dark:bg-[#39d353]',
    rest: 'bg-sky-400/35 dark:bg-sky-400/25 ring-1 ring-sky-500/40',
  },
  apple: {
    label: 'Apple Blue',
    0: 'bg-zinc-200/75 dark:bg-white/[0.07]',
    1: 'bg-sky-200 dark:bg-sky-950',
    2: 'bg-sky-400 dark:bg-sky-700',
    3: 'bg-blue-500 dark:bg-blue-500',
    4: 'bg-blue-700 dark:bg-sky-400',
    rest: 'bg-amber-400/35 dark:bg-amber-400/25 ring-1 ring-amber-500/40',
  },
};

export function GithubHeatmap({
  habits,
  logs,
  selectedHabitId,
  onClearHabitFilter,
  selectedDate,
  onSelectDate,
}: GithubHeatmapProps) {
  const [paletteKey, setPaletteKey] = useState<'github' | 'apple'>('github');
  const [hoveredCell, setHoveredCell] = useState<HeatmapDayCell | null>(null);

  const { columns, totalDoneInRange, activeDaysCount } = useMemo(
    () =>
      buildGithubHeatmapGrid({
        habits,
        logs,
        selectedHabitId,
        weeksCount: 52,
      }),
    [habits, logs, selectedHabitId]
  );

  const selectedHabit = useMemo(
    () => habits.find((h) => h.id === selectedHabitId) || null,
    [habits, selectedHabitId]
  );

  const activeCell = useMemo(() => {
    if (hoveredCell) return hoveredCell;
    for (const col of columns) {
      const found = col.days.find((d) => d.date === selectedDate);
      if (found) return found;
    }
    return null;
  }, [hoveredCell, columns, selectedDate]);

  const palette = PALETTES[paletteKey];

  return (
    <div className="rounded-2xl border border-border bg-card backdrop-blur-xl p-5 sm:p-6 shadow-[var(--glass-shadow)] space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">
              {selectedHabit
                ? `Biểu đồ nhịp: ${selectedHabit.title}`
                : 'Biểu đồ đóng góp nhịp sống (52 tuần)'}
            </h2>
            {selectedHabit && (
              <button
                type="button"
                onClick={onClearHabitFilter}
                className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-text-secondary hover:bg-accent hover:text-foreground cursor-pointer"
              >
                Xem tất cả
              </button>
            )}
          </div>
          <p className="text-xs text-text-muted">
            <strong className="font-semibold text-foreground">
              {totalDoneInRange}
            </strong>{' '}
            lượt hoàn thành trên{' '}
            <strong className="font-semibold text-foreground">
              {activeDaysCount}
            </strong>{' '}
            ngày hoạt động
          </p>
        </div>

        {/* Palette switcher */}
        <div className="inline-flex rounded-xl border border-border bg-secondary/60 p-0.5 text-[11px]">
          <button
            type="button"
            onClick={() => setPaletteKey('github')}
            className={cn(
              'rounded-lg px-2.5 py-1 font-medium transition-colors cursor-pointer',
              paletteKey === 'github'
                ? 'bg-card text-foreground shadow-2xs'
                : 'text-text-muted hover:text-foreground'
            )}
          >
            GitHub Green
          </button>
          <button
            type="button"
            onClick={() => setPaletteKey('apple')}
            className={cn(
              'rounded-lg px-2.5 py-1 font-medium transition-colors cursor-pointer',
              paletteKey === 'apple'
                ? 'bg-card text-foreground shadow-2xs'
                : 'text-text-muted hover:text-foreground'
            )}
          >
            Apple Blue
          </button>
        </div>
      </div>

      {/* Heatmap Matrix */}
      <div className="overflow-x-auto pb-1">
        <div className="inline-flex flex-col min-w-max">
          {/* Month labels row */}
          <div className="flex items-center mb-1.5 pl-7">
            {columns.map((col) => (
              <div
                key={col.weekStart}
                className="w-[15px] sm:w-[16px] shrink-0 text-[10px] text-text-muted capitalize whitespace-nowrap"
              >
                {col.monthLabel || ''}
              </div>
            ))}
          </div>

          {/* Grid rows */}
          <div className="flex gap-1.5">
            {/* Weekday labels */}
            <div className="flex flex-col justify-between py-0.5 pr-1 text-[10px] text-text-muted select-none">
              {DAY_LABELS.map((lbl, idx) => (
                <span key={idx} className="h-[12px] sm:h-[13px] leading-none">
                  {lbl}
                </span>
              ))}
            </div>

            {/* 52 week columns */}
            <div className="flex gap-[3px]">
              {columns.map((col) => (
                <div key={col.weekStart} className="flex flex-col gap-[3px]">
                  {col.days.map((cell) => {
                    const isSelected = cell.date === selectedDate;
                    const colorClass = cell.isFuture
                      ? 'bg-transparent border border-dashed border-border/40 opacity-30'
                      : cell.isRestOnly
                      ? palette.rest
                      : palette[cell.level];

                    return (
                      <button
                        key={cell.date}
                        type="button"
                        disabled={cell.isFuture}
                        onMouseEnter={() => setHoveredCell(cell)}
                        onMouseLeave={() => setHoveredCell(null)}
                        onClick={() => !cell.isFuture && onSelectDate(cell.date)}
                        title={`${cell.dateLabel}: ${cell.doneCount} hoàn thành`}
                        aria-label={`${cell.dateLabel}: ${cell.doneCount} hoàn thành`}
                        className={cn(
                          'h-[12px] w-[12px] sm:h-[13px] sm:w-[13px] rounded-[3px] transition-transform duration-100',
                          !cell.isFuture && 'hover:scale-125 cursor-pointer',
                          colorClass,
                          isSelected &&
                            !cell.isFuture &&
                            'ring-2 ring-primary ring-offset-1 ring-offset-background'
                        )}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Selected day info + Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/70 text-xs">
        <div className="flex items-center gap-2 text-text-secondary">
          <Calendar className="h-3.5 w-3.5 text-text-muted shrink-0" />
          {activeCell ? (
            <span>
              <strong className="font-medium text-foreground capitalize">
                {activeCell.dateLabel}
              </strong>
              {' • '}
              {activeCell.isRestOnly ? (
                <span className="inline-flex items-center gap-1 text-info font-medium">
                  <Coffee className="h-3 w-3" /> Ngày nghỉ có chủ đích
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <Check className="h-3 w-3 text-success" />
                  {activeCell.doneCount}/{activeCell.totalHabits} mục tiêu
                </span>
              )}
            </span>
          ) : (
            <span>Chạm vào một ô ngày để xem chi tiết hoặc check bổ sung</span>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[11px] text-text-muted select-none">
          <span className="mr-1 inline-flex items-center gap-1">
            <span className={cn('inline-block h-2.5 w-2.5 rounded-[2px]', palette.rest)} />
            Nghỉ
          </span>
          <span>Ít</span>
          {([0, 1, 2, 3, 4] as const).map((lvl) => (
            <span
              key={lvl}
              className={cn('inline-block h-2.5 w-2.5 rounded-[2px]', palette[lvl])}
            />
          ))}
          <span>Nhiều</span>
        </div>
      </div>
    </div>
  );
}
