'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Flame, Sparkles } from 'lucide-react';
import {
  useRhythmHabits,
  useRhythmLogs,
  useSetRhythmLogStatus,
} from '@/hooks/useRhythm';
import { RHYTHM_COLORS } from '@/lib/rhythm';
import { Skeleton } from '@/components/ui/Skeleton';
import type { RhythmLogStatus } from '@/types/database';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

function getTodayHcmcIso(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function HabitCheckinBentoCard({ className }: { className?: string }) {
  const { data: habits = [], isLoading: habitsLoading } = useRhythmHabits();
  const { data: logs = [], isLoading: logsLoading } = useRhythmLogs();
  const setStatus = useSetRhythmLogStatus();

  const todayIso = useMemo(() => getTodayHcmcIso(), []);
  const activeHabits = useMemo(
    () => habits.filter((h) => h.is_active).slice(0, 5),
    [habits]
  );

  const todayLogMap = useMemo(() => {
    const map = new Map<string, RhythmLogStatus>();
    for (const log of logs) {
      if (log.log_date === todayIso) {
        map.set(log.habit_id, log.status);
      }
    }
    return map;
  }, [logs, todayIso]);

  const doneCount = activeHabits.filter((h) => todayLogMap.get(h.id) === 'DONE').length;
  const totalCount = activeHabits.length;
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const handleToggle = async (habitId: string) => {
    const current = todayLogMap.get(habitId);
    const nextStatus: RhythmLogStatus | null = current === 'DONE' ? null : 'DONE';
    try {
      await setStatus.mutateAsync({
        habitId,
        logDate: todayIso,
        status: nextStatus,
      });
    } catch {
      toast.error('Không thể cập nhật thói quen lúc này.');
    }
  };

  const isLoading = habitsLoading || logsLoading;

  return (
    <section
      className={cn(
        'rounded-2xl border border-border bg-card p-5 shadow-2xs flex flex-col justify-between gap-3.5',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Flame className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Nhịp sống hôm nay</h2>
            <p className="text-[11px] text-text-muted">Chạm để check-in nhanh</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {totalCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-foreground tabular-nums">
              {doneCount === totalCount && <Sparkles className="h-3 w-3 text-emerald-500" />}
              {doneCount}/{totalCount}
            </span>
          )}
          <Link
            href="/app/rhythm"
            className="text-xs font-medium text-text-muted hover:text-foreground transition-colors"
            title="Mở trang Nhịp sống"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : activeHabits.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-background/40 p-4 text-center space-y-2">
          <p className="text-xs text-text-muted">
            Chưa có thói quen nào để check-in mỗi sáng.
          </p>
          <Link
            href="/app/rhythm"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Thiết lập nhịp sống
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Thin progress bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="space-y-1.5 pt-0.5">
            {activeHabits.map((habit) => {
              const isDone = todayLogMap.get(habit.id) === 'DONE';
              const colorMeta = RHYTHM_COLORS[habit.color] || RHYTHM_COLORS.emerald;
              return (
                <button
                  key={habit.id}
                  type="button"
                  onClick={() => handleToggle(habit.id)}
                  disabled={setStatus.isPending}
                  className={cn(
                    'w-full flex items-center justify-between gap-2.5 rounded-xl border px-3 py-2 text-left text-xs transition-all cursor-pointer',
                    isDone
                      ? 'border-emerald-500/35 bg-emerald-500/10 text-foreground'
                      : 'border-border bg-background/60 hover:bg-secondary/70 text-foreground'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                        isDone
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-border bg-card'
                      )}
                    >
                      {isDone ? (
                        <Check className="h-3 w-3 stroke-[2.5]" />
                      ) : (
                        <span className={cn('h-2 w-2 rounded-full', colorMeta.dot)} />
                      )}
                    </span>
                    <span
                      className={cn(
                        'truncate font-medium',
                        isDone && 'line-through text-text-muted'
                      )}
                    >
                      {habit.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-text-muted shrink-0">
                    {isDone ? 'Xong' : 'Check-in'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
