'use client';

import React from 'react';
import Link from 'next/link';
import { Star, ChevronRight } from 'lucide-react';
import type { MyLibraryItem } from '@/types/database';
import { BookCover } from './BookCover';
import { BookStatusBadge } from './BookStatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { formatVND, formatDateVN } from '@/lib/utils';

export function BookList({
  books,
  isLoading,
  onAddBook,
}: {
  books?: MyLibraryItem[];
  isLoading?: boolean;
  onAddBook?: () => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
          >
            <Skeleton className="h-16 w-12 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <EmptyState
        title="Tủ sách chưa có cuốn sách nào"
        description="Bắt đầu xây dựng tủ sách số cá nhân bằng cách thêm cuốn sách đầu tiên của bạn."
        actionLabel="Thêm sách mới"
        onAction={onAddBook}
      />
    );
  }

  return (
    <div className="space-y-2.5">
      {books.map((book) => {
        const primaryImage = book.cover_url;

        return (
          <Link
            key={book.id}
            href={`/app/library/${book.id}`}
            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 transition-colors duration-150 hover:border-ring/60"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="shrink-0">
                <BookCover
                  src={primaryImage}
                  title={book.title}
                  author={book.author}
                  size="sm"
                  className="w-12 h-16 sm:w-14 sm:h-20"
                />
              </div>

              <div className="min-w-0">
                <h4 className="text-sm sm:text-base font-semibold text-foreground truncate">
                  {book.title}
                </h4>
                <p className="text-xs text-text-muted truncate">
                  {book.author || 'Tác giả chưa rõ'}
                  {book.release_year ? ` • ${book.release_year}` : ''}
                </p>

                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-text-muted tabular-nums">
                  {book.purchase_store && (
                    <span>
                      Mua tại: <span className="font-medium text-text-secondary">{book.purchase_store}</span>
                    </span>
                  )}
                  {book.purchase_price !== null && (
                    <span>
                      Giá: <span className="font-medium text-text-secondary">{formatVND(book.purchase_price)}</span>
                    </span>
                  )}
                  {book.purchase_date && (
                    <span>Ngày: {formatDateVN(book.purchase_date)}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-border shrink-0">
              {book.status === 'READING' && (
                <div className="text-right hidden sm:block tabular-nums">
                  <span className="text-xs font-medium text-foreground">
                    {book.current_page} / {book.total_pages || '?'} tr ({book.reading_progress}%)
                  </span>
                  <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.min(book.reading_progress || 0, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {book.rating && book.rating > 0 ? (
                <div className="flex items-center gap-1 font-medium text-foreground text-xs tabular-nums">
                  <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                  <span>{book.rating.toFixed(1)}</span>
                </div>
              ) : null}

              <BookStatusBadge status={book.status} />

              <ChevronRight className="h-4 w-4 text-text-muted group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
