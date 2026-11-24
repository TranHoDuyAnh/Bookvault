'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  DollarSign,
  Star,
  Camera,
  Trash2,
  Edit3,
} from 'lucide-react';
import { useBookDetail, useDeleteUserBook, useUpdateUserBook } from '@/hooks/useLibrary';
import { BookCover } from '@/components/books/BookCover';
import { BookStatusBadge } from '@/components/books/BookStatusBadge';
import { BookImageGallery } from '@/components/books/BookImageGallery';
import { BookUploader } from '@/components/books/BookUploader';
import { EditPersonalInfoModal } from '@/components/books/EditPersonalInfoModal';
import { ReadingProgressCard } from '@/components/reading/ReadingProgressCard';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatVND, formatDateVN, STATUS_CONFIG } from '@/lib/utils';
import type { BookStatus } from '@/types/database';
import { toast } from 'sonner';

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userBookId = params.id as string;

  const { data: book, isLoading, refetch } = useBookDetail(userBookId);

  const deleteBookMutation = useDeleteUserBook();
  const updateBookMutation = useUpdateUserBook();

  const [isEditPersonalModalOpen, setIsEditPersonalModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-96 w-full rounded-lg" />
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="py-16 text-center space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Không tìm thấy sách</h2>
        <p className="text-sm text-text-muted">
          Cuốn sách này không tồn tại hoặc đã bị xoá khỏi tủ sách.
        </p>
        <Link href="/app/library">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Quay về Tủ sách
          </Button>
        </Link>
      </div>
    );
  }

  const primaryImage =
    book.images?.find((img) => img.is_primary)?.image_url ||
    book.images?.[0]?.image_url;

  const handleDeleteBook = async () => {
    try {
      await deleteBookMutation.mutateAsync(book.id);
      toast.success('Đã xoá cuốn sách khỏi tủ sách của bạn.');
      router.push('/app/library');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể xoá sách.';
      toast.error(message);
    }
  };

  const handleStatusChange = async (newStatus: BookStatus) => {
    try {
      await updateBookMutation.mutateAsync({
        userBookId: book.id,
        updates: {
          status: newStatus,
          started_reading_at:
            newStatus === 'READING' && !book.started_reading_at
              ? new Date().toISOString().split('T')[0]
              : book.started_reading_at,
          finished_reading_at:
            newStatus === 'READ'
              ? new Date().toISOString().split('T')[0]
              : book.finished_reading_at,
        },
      });
      setIsStatusMenuOpen(false);
      toast.success(`Đã chuyển trạng thái sang "${STATUS_CONFIG[newStatus].label}".`);
      refetch();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi cập nhật trạng thái.';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button & Action toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/app/library"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-text-secondary hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại Thư viện
        </Link>

        <div className="flex items-center gap-2">
          {/* Status Quick Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsStatusMenuOpen(!isStatusMenuOpen)}
              className="cursor-pointer"
            >
              <BookStatusBadge status={book.status} />
            </button>

            {isStatusMenuOpen && (
              <div className="absolute right-0 mt-2 z-30 w-44 rounded-lg border border-border bg-popover p-1.5 shadow-lg">
                {(Object.keys(STATUS_CONFIG) as BookStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStatusChange(st)}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium text-popover-foreground hover:bg-accent cursor-pointer"
                  >
                    <span className={`h-2 w-2 rounded-full ${STATUS_CONFIG[st].dot}`} />
                    <span>{STATUS_CONFIG[st].label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditPersonalModalOpen(true)}
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sửa thông tin</span>
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={() => setIsDeleteConfirmOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Xoá sách</span>
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Column */}
        <div className="space-y-5">
          <div className="flex justify-center rounded-lg border border-border bg-card p-6 shadow-2xs">
            <BookCover
              src={primaryImage}
              title={book.title}
              author={book.author}
              size="lg"
              className="w-44 h-64 sm:w-48 sm:h-72 book-shadow"
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Camera className="h-4 w-4 text-text-secondary" />
              Ảnh chụp sách vật lý ({book.images?.length || 0})
            </h3>

            <BookImageGallery
              bookId={book.book_id}
              images={book.images || []}
              onImageChanged={() => refetch()}
            />

            <BookUploader
              bookId={book.book_id}
              onUploaded={() => refetch()}
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-2 space-y-5">
          {/* Title & Author */}
          <div className="space-y-1.5 border-b border-border pb-4">
            <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-foreground leading-tight">
              {book.title}
            </h1>
            {book.subtitle && (
              <p className="text-sm text-text-muted">{book.subtitle}</p>
            )}
            <p className="text-sm text-text-secondary">
              Tác giả: <span className="font-medium text-foreground">{book.author || 'Chưa rõ tác giả'}</span>
            </p>
          </div>

          {/* Reading Progress Card */}
          <ReadingProgressCard book={book} onUpdated={() => refetch()} />

          {/* Personal Purchase & Ownership Information */}
          <div className="rounded-lg border border-border bg-card p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-text-secondary" />
                Thông tin sở hữu cá nhân
              </h3>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditPersonalModalOpen(true)}
              >
                <Edit3 className="h-3.5 w-3.5" />
                Chỉnh sửa
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-[13px]">
              <div className="space-y-0.5">
                <span className="text-xs text-text-muted">Nơi mua</span>
                <p className="font-medium text-foreground">
                  {book.purchase_store || 'Chưa lưu'}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-xs text-text-muted">Giá mua</span>
                <p className="font-medium text-foreground tabular-nums">
                  {formatVND(book.purchase_price)}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-xs text-text-muted">Ngày mua</span>
                <p className="font-medium text-foreground tabular-nums">
                  {formatDateVN(book.purchase_date)}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-xs text-text-muted">Đánh giá</span>
                <div className="flex items-center gap-1 font-medium text-foreground tabular-nums">
                  {book.rating ? (
                    <>
                      <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                      <span>{book.rating} / 5</span>
                    </>
                  ) : (
                    <span className="text-text-muted font-normal">Chưa đánh giá</span>
                  )}
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="text-xs text-text-muted">Bắt đầu đọc</span>
                <p className="font-medium text-foreground tabular-nums">
                  {formatDateVN(book.started_reading_at)}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-xs text-text-muted">Hoàn thành</span>
                <p className="font-medium text-foreground tabular-nums">
                  {formatDateVN(book.finished_reading_at)}
                </p>
              </div>
            </div>

            {book.notes && (
              <div className="pt-3 border-t border-border text-[13px] text-text-secondary">
                <span className="font-medium text-foreground">Ghi chú riêng: </span>
                {book.notes}
              </div>
            )}
          </div>

          {/* Book Catalog Details */}
          <div className="rounded-lg border border-border bg-card p-5 shadow-2xs space-y-4">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-text-secondary" />
              Thông tin ấn bản
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-[13px]">
              <div>
                <span className="text-xs text-text-muted">Nhà xuất bản</span>
                <p className="font-medium text-foreground">{book.publisher || '—'}</p>
              </div>
              <div>
                <span className="text-xs text-text-muted">Năm xuất bản</span>
                <p className="font-medium text-foreground tabular-nums">{book.release_year || '—'}</p>
              </div>
              <div>
                <span className="text-xs text-text-muted">Tổng số trang</span>
                <p className="font-medium text-foreground tabular-nums">
                  {book.page_count ? `${book.page_count} trang` : '—'}
                </p>
              </div>
              <div>
                <span className="text-xs text-text-muted">Mã ISBN-13</span>
                <p className="font-mono text-foreground">{book.isbn_13 || '—'}</p>
              </div>
              <div>
                <span className="text-xs text-text-muted">Mã ISBN-10</span>
                <p className="font-mono text-foreground">{book.isbn_10 || '—'}</p>
              </div>
              <div>
                <span className="text-xs text-text-muted">Ngôn ngữ</span>
                <p className="font-medium text-foreground uppercase">{book.language || 'vi'}</p>
              </div>
            </div>

            {book.description && (
              <div className="pt-3 border-t border-border text-[13px] text-text-secondary space-y-1">
                <span className="font-medium text-foreground block">Tóm tắt nội dung</span>
                <p className="leading-relaxed whitespace-pre-line">{book.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <EditPersonalInfoModal
        isOpen={isEditPersonalModalOpen}
        onClose={() => setIsEditPersonalModalOpen(false)}
        book={book}
        onSaved={() => refetch()}
      />

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteBook}
        title="Xoá sách khỏi tủ sách?"
        description={`Bạn có chắc chắn muốn xoá cuốn "${book.title}" khỏi tủ sách cá nhân? Toàn bộ ảnh chụp và nhật ký đọc liên quan cũng sẽ bị gỡ bỏ.`}
        confirmText="Xoá khỏi tủ sách"
        isDestructive
        isLoading={deleteBookMutation.isPending}
      />
    </div>
  );
}
