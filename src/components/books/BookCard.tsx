'use client';

import React from 'react';
import Link from 'next/link';
import { Star, BookOpen } from 'lucide-react';
import type { MyLibraryItem } from '@/types/database';
import { BookCover } from './BookCover';
import { BookStatusBadge } from './BookStatusBadge';

export function BookCard({ book }: { book: MyLibraryItem }) {
  const primaryImage = book.cover_url;

  const showProgress =
    book.status === 'READING' || (book.current_page > 0 && book.total_pages && book.total_pages > 0);

  return (
    <Link
      href={`/app/library/${book.id}`}
      className="group relative flex flex-col rounded-lg bg-card border border-border p-3 sm:p-4 transition-colors duration-150 hover:border-ring/60"
    >
      {/* Cover container */}
      <div className="relative mb-3 flex items-center justify-center overflow-hidden rounded-md bg-secondary/70 p-2.5 sm:p-3 aspect-[3/4]">
        <div className="book-shadow group-hover:scale-[1.02] transition-transform duration-150">
          <BookCover
            src={primaryImage}
            title={book.title}
            author={book.author}
            size="fill"
            className="w-28 h-40 sm:w-32 sm:h-46"
          />
        </div>

        <div className="absolute top-2 right-2 z-20">
          <BookStatusBadge status={book.status} />
        </div>
      </div>

      {/* Book details */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h4 className="text-sm font-semibold leading-snug text-foreground line-clamp-2">
            {book.title}
          </h4>
          <p className="mt-1 text-xs text-text-muted line-clamp-1">
            {book.author || 'Tác giả chưa rõ'}
          </p>
        </div>

        {/* Meta / Progress / Rating */}
        <div className="mt-3 space-y-2 pt-2.5 border-t border-border text-xs text-text-muted">
          {showProgress && (
            <div>
              <div className="flex justify-between items-center text-[11px] mb-1 tabular-nums">
                <span className="flex items-center gap-1 text-text-secondary">
                  <BookOpen className="h-3 w-3" />
                  {book.current_page}/{book.total_pages || '?'} tr
                </span>
                <span className="font-medium text-foreground">{book.reading_progress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${Math.min(book.reading_progress || 0, 100)}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-1">
            {book.rating && book.rating > 0 ? (
              <div className="flex items-center gap-1 font-medium text-foreground text-xs tabular-nums">
                <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                <span>{book.rating.toFixed(1)}</span>
              </div>
            ) : (
              <span className="text-[11px] text-text-muted">Chưa đánh giá</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
