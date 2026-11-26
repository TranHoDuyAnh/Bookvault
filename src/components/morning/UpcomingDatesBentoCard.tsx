'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarHeart } from 'lucide-react';
import { useUpcomingDates } from '@/hooks/useImportantDates';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

function getDaysUntilOccurrence(eventDateStr: string, isRecurring: boolean): number {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const raw = new Date(eventDateStr);

  let target = isRecurring
    ? new Date(now.getFullYear(), raw.getMonth(), raw.getDate())
    : new Date(raw.getFullYear(), raw.getMonth(), raw.getDate());

  if (isRecurring && target < todayStart) {
    target = new Date(now.getFullYear() + 1, raw.getMonth(), raw.getDate());
  }

  return Math.round((target.getTime() - todayStart.getTime()) / 86_400_000);
}

function formatCountdownLabel(days: number): string {
  if (days <= 0) return 'Hôm nay';
  if (days === 1) return 'Ngày mai';
  return `Còn ${days} ngày`;
}

export function UpcomingDatesBentoCard({ className }: { className?: string }) {
  const { data: upcoming = [], isLoading } = useUpcomingDates(60);

  const items = useMemo(
    () =>
      upcoming.slice(0, 3).map((d) => {
        const daysLeft = getDaysUntilOccurrence(d.event_date, d.is_recurring);
        const dateObj = new Date(d.event_date);
        const shortDate = `${String(dateObj.getDate()).padStart(2, '0')}/${String(
          dateObj.getMonth() + 1
        ).padStart(2, '0')}`;
        return { ...d, daysLeft, shortDate };
      }),
    [upcoming]
  );

  return (
    <section
      className={cn(
        'rounded-2xl border border-border bg-card p-5 shadow-2xs flex flex-col justify-between gap-3.5 h-full',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <CalendarHeart className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Ngày sắp tới</h2>
            <p className="text-[11px] text-text-muted">Đếm ngược sự kiện quan trọng</p>
          </div>
        </div>
        <Link
          href="/app/dates"
          className="text-xs font-medium text-text-muted hover:text-foreground transition-colors"
          title="Xem tất cả ngày quan trọng"
        >
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-background/40 p-4 text-center space-y-2 my-auto">
          <p className="text-xs text-text-muted">
            Không có ngày quan trọng nào trong 60 ngày tới.
          </p>
          <Link
            href="/app/dates"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Thêm ngày kỷ niệm
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Link
              key={item.id}
              href="/app/dates"
              className="flex items-center justify-between gap-2.5 rounded-xl border border-border bg-background/60 hover:bg-secondary/70 px-3 py-2.5 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{item.title}</p>
                <p className="text-[11px] text-text-muted tabular-nums">{item.shortDate}</p>
              </div>
              <span
                className={cn(
                  'shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tabular-nums',
                  item.daysLeft <= 1
                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                    : item.daysLeft <= 7
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                    : 'bg-secondary text-text-secondary'
                )}
              >
                {formatCountdownLabel(item.daysLeft)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
