'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, BookOpen, Plus } from 'lucide-react';
import { BookCover } from '@/components/books/BookCover';
import { Skeleton } from '@/components/ui/Skeleton';
import { updateBookProgress } from '@/services/reading';
import type { MyLibraryItem } from '@/types/database';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CurrentlyReadingBentoCardProps {
  books: MyLibraryItem[];
  isLoading: boolean;
  className?: string;
}

export function CurrentlyReadingBentoCard({
  books,
  isLoading,
  className,
}: CurrentlyReadingBentoCardProps) {
  const queryClient = useQueryClient();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  const safeIdx = selectedIdx < books.length ? selectedIdx : 0;
  const book = books[safeIdx];

  const handleQuickAddPages = async (delta: number) => {
    if (!book || isUpdating) return;
    const total = book.total_pages || 0;
    const nextPage =
      total > 0 ? Math.min(total, (book.current_page || 0) + delta) : (book.current_page || 0) + delta;

    setIsUpdating(true);
    try {
      await updateBookProgress({
        userBookId: book.id,
        currentPage: nextPage,
        totalPages: book.total_pages,
        currentStatus: book.status,
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['library'] }),
        queryClient.invalidateQueries({ queryKey: ['library-stats'] }),
      ]);
      toast.success(`Đã cập nhật trang ${nextPage}`);
    } catch {
      toast.error('Không thể cập nhật tiến độ đọc.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <section
      className={cn(
        'rounded-2xl border border-border bg-card p-5 shadow-2xs flex flex-col justify-between gap-4 h-full',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Đang đọc dở</h2>
            <p className="text-[11px] text-text-muted">
              {books.length > 0 ? `${books.length} cuốn đang theo dõi` : 'Tủ sách cá nhân'}
            </p>
          </div>
        </div>

        <Link
          href="/app/library"
          className="text-xs font-medium text-text-muted hover:text-foreground transition-colors"
          title="Mở tủ sách"
        >
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex gap-3.5">
          <Skeleton className="h-24 w-16 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-2 w-full mt-3" />
          </div>
        </div>
      ) : !book ? (
        <div className="rounded-xl border border-dashed border-border bg-background/40 p-4 text-center space-y-2 my-auto">
          <p className="text-xs text-text-muted">
            Bạn chưa đánh dấu cuốn sách nào đang đọc.
          </p>
          <Link
            href="/app/library"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Chọn sách để đọc
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start gap-3.5">
            <Link href={`/app/library/${book.id}`} className="shrink-0">
              <BookCover
                src={book.images?.[0]?.image_url || null}
                title={book.title}
                author={book.author}
                size="sm"
                className="rounded-lg shadow-xs"
              />
            </Link>

            <div className="min-w-0 flex-1 space-y-2">
              <div>
                <Link
                  href={`/app/library/${book.id}`}
                  className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                >
                  {book.title}
                </Link>
                <p className="text-xs text-text-muted truncate">
                  {book.author || 'Chưa rõ tác giả'}
                </p>
              </div>

              {(() => {
                const total = book.total_pages || 0;
                const current = book.current_page || 0;
                const pct =
                  total > 0
                    ? Math.min(100, Math.round((current / total) * 100))
                    : Math.round(book.reading_progress || 0);
                return (
                  <div className="space-y-1">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-text-muted tabular-nums">
                      <span>
                        Trang {current}
                        {total > 0 ? ` / ${total}` : ''}
                      </span>
                      <span className="font-semibold text-foreground">{pct}%</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-0.5">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickAddPages(5)}
                disabled={isUpdating}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-background/70 hover:bg-secondary px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors cursor-pointer disabled:opacity-50"
              >
                <Plus className="h-3 w-3" />5 trang
              </button>
              <button
                type="button"
                onClick={() => handleQuickAddPages(15)}
                disabled={isUpdating}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-background/70 hover:bg-secondary px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors cursor-pointer disabled:opacity-50"
              >
                <Plus className="h-3 w-3" />15 trang
              </button>
            </div>

            {books.length > 1 && (
              <div className="flex items-center gap-1">
                {books.slice(0, 4).map((b, idx) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedIdx(idx)}
                    className={cn(
                      'h-2 rounded-full transition-all cursor-pointer',
                      idx === safeIdx ? 'w-5 bg-primary' : 'w-2 bg-border hover:bg-text-muted'
                    )}
                    title={b.title}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
