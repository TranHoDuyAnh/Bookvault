'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarHeart, Tv, ArrowRight } from 'lucide-react';
import type { ImportantDate, MediaEntry } from '@/types/database';
import { Button } from '@/components/ui/Button';

interface HomeBaseContextRowProps {
  upcomingDates: ImportantDate[];
  inProgressMedia: MediaEntry[];
}

export function HomeBaseContextRow({
  upcomingDates,
  inProgressMedia,
}: HomeBaseContextRowProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <section className="rounded-lg border border-border bg-card p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarHeart className="h-4 w-4 text-text-secondary" />
            <h2 className="text-sm font-semibold text-foreground">Sự kiện sắp tới (14 ngày)</h2>
          </div>
          <Link
            href="/app/dates"
            className="text-xs text-text-muted hover:text-foreground inline-flex items-center gap-1"
          >
            Xem lịch <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {upcomingDates.length > 0 ? (
          <div className="space-y-2">
            {upcomingDates.slice(0, 3).map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between rounded-md border border-border bg-background/60 px-3 py-2 text-xs"
              >
                <div className="min-w-0 pr-2">
                  <p className="font-medium text-foreground truncate">{d.title}</p>
                  {d.person_name && (
                    <p className="text-[11px] text-text-muted truncate">{d.person_name}</p>
                  )}
                </div>
                <span className="text-[11px] font-medium text-warning shrink-0 tabular-nums">
                  {d.event_date}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-text-muted py-2">
            Không có ngày quan trọng nào trong 14 ngày tới.
          </p>
        )}
      </section>

      <section className="rounded-lg border border-border bg-card p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tv className="h-4 w-4 text-text-secondary" />
            <h2 className="text-sm font-semibold text-foreground">Giải trí đang theo dõi</h2>
          </div>
          <Link
            href="/app/entertainment"
            className="text-xs text-text-muted hover:text-foreground inline-flex items-center gap-1"
          >
            Mở kho <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {inProgressMedia.length > 0 ? (
          <div className="space-y-2">
            {inProgressMedia.slice(0, 3).map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-md border border-border bg-background/60 px-3 py-2 text-xs"
              >
                <div className="min-w-0 pr-2">
                  <p className="font-medium text-foreground truncate">{m.title}</p>
                  <p className="text-[11px] text-text-muted truncate">
                    {m.media_type} {m.platform ? `• ${m.platform}` : ''}
                  </p>
                </div>
                {m.genre && (
                  <span className="text-[11px] text-text-secondary shrink-0">{m.genre}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-between py-2">
            <p className="text-xs text-text-muted">Chưa có phim/game nào đang xem dở.</p>
            <Link href="/app/entertainment">
              <Button variant="outline" size="sm">
                Khám phá
              </Button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
