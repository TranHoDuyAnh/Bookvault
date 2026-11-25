'use client';

import React, { useState } from 'react';
import { Languages, Quote } from 'lucide-react';
import type { MorningQuoteData } from '@/app/api/morning/route';
import { Skeleton } from '@/components/ui/Skeleton';

interface DailyQuoteCardProps {
  quote?: MorningQuoteData | null;
  isLoading?: boolean;
}

export function DailyQuoteCard({ quote, isLoading = false }: DailyQuoteCardProps) {
  const [showOriginal, setShowOriginal] = useState(true);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card px-5 py-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="mt-2 h-3.5 w-1/3" />
      </div>
    );
  }

  if (!quote) return null;

  const hasTranslation = quote.textVi && quote.textVi !== quote.textEn;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card backdrop-blur-xl px-5 py-4 sm:px-6 shadow-[var(--glass-shadow)]">
      <div className="flex items-start gap-3.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-text-secondary mt-0.5">
          <Quote className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="text-[15px] sm:text-base font-medium leading-relaxed text-foreground">
            “{quote.textVi}”
          </p>

          {hasTranslation && showOriginal && (
            <p className="text-xs italic text-text-muted leading-relaxed">
              “{quote.textEn}”
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
            <span className="text-xs font-medium text-text-secondary">
              — {quote.author}
            </span>

            {hasTranslation && (
              <button
                type="button"
                onClick={() => setShowOriginal((prev) => !prev)}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-text-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <Languages className="h-3 w-3" />
                {showOriginal ? 'Ẩn bản gốc' : 'Xem tiếng Anh'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
