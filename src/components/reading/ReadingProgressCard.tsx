'use client';

import React, { useState } from 'react';
import { BookOpen, CheckCircle, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { updateBookProgress } from '@/services/reading';
import type { MyLibraryItem } from '@/types/database';
import { toast } from 'sonner';

export function ReadingProgressCard({
  book,
  onUpdated,
  onOpenSessionModal,
}: {
  book: MyLibraryItem;
  onUpdated?: () => void;
  onOpenSessionModal?: () => void;
}) {
  const [currentPage, setCurrentPage] = useState<number>(book.current_page || 0);
  const [isUpdating, setIsUpdating] = useState(false);

  const totalPages = book.total_pages || 0;
  const progressPercent =
    totalPages > 0 ? Number(((currentPage / totalPages) * 100).toFixed(1)) : 0;

  const handleSaveProgress = async (newPage: number) => {
    setIsUpdating(true);
    try {
      await updateBookProgress({
        userBookId: book.id,
        currentPage: newPage,
        totalPages: book.total_pages,
        currentStatus: book.status,
      });
      toast.success('Đã cập nhật tiến độ đọc.');
      onUpdated?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi cập nhật tiến độ.';
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkAsFinished = async () => {
    if (!book.total_pages) {
      handleSaveProgress(book.current_page);
      return;
    }
    setCurrentPage(book.total_pages);
    await handleSaveProgress(book.total_pages);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-text-secondary" />
          <h4 className="text-base font-semibold text-foreground">
            Tiến độ đọc sách
          </h4>
        </div>
        <Badge variant="secondary" className="tabular-nums">
          {progressPercent}% hoàn thành
        </Badge>
      </div>

      <div className="space-y-1.5">
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-text-muted tabular-nums">
          <span>Trang {currentPage}</span>
          <span>Tổng {totalPages > 0 ? `${totalPages} trang` : 'chưa có số trang'}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            max={totalPages || undefined}
            value={currentPage}
            onChange={(e) => setCurrentPage(Math.max(0, Number(e.target.value)))}
            className="w-24 text-center font-medium tabular-nums"
          />
          <Button
            size="sm"
            onClick={() => handleSaveProgress(currentPage)}
            disabled={isUpdating || currentPage === book.current_page}
          >
            {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Lưu trang'}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          {onOpenSessionModal && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onOpenSessionModal}
              className="flex-1 sm:flex-initial"
            >
              <Plus className="h-3.5 w-3.5" />
              Ghi phiên đọc
            </Button>
          )}

          {book.status !== 'READ' && totalPages > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleMarkAsFinished}
              disabled={isUpdating}
              className="flex-1 sm:flex-initial"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Đã đọc xong
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
