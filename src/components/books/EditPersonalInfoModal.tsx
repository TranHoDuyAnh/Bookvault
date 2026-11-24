'use client';

import React, { useState } from 'react';
import { Edit3, DollarSign, MapPin, Calendar, Loader2, Check, Star } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { STATUS_CONFIG } from '@/lib/utils';
import { useUpdateUserBook } from '@/hooks/useLibrary';
import type { MyLibraryItem, BookStatus } from '@/types/database';
import { toast } from 'sonner';

export interface EditPersonalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: MyLibraryItem;
  onSaved?: () => void;
}

export function EditPersonalInfoModal({
  isOpen,
  onClose,
  book,
  onSaved,
}: EditPersonalInfoModalProps) {
  const updateUserBookMutation = useUpdateUserBook();

  const [status, setStatus] = useState<BookStatus>(book.status || 'OWNED');
  const [rating, setRating] = useState<number>(book.rating || 0);
  const [purchaseStore, setPurchaseStore] = useState<string>(book.purchase_store || '');
  const [purchasePrice, setPurchasePrice] = useState<string>(
    book.purchase_price !== null && book.purchase_price !== undefined ? String(book.purchase_price) : ''
  );
  const [purchaseDate, setPurchaseDate] = useState<string>(book.purchase_date || '');
  const [startedReadingAt, setStartedReadingAt] = useState<string>(book.started_reading_at || '');
  const [finishedReadingAt, setFinishedReadingAt] = useState<string>(book.finished_reading_at || '');
  const [notes, setNotes] = useState<string>(book.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateUserBookMutation.mutateAsync({
        userBookId: book.id,
        updates: {
          status,
          rating: rating > 0 ? rating : null,
          purchase_store: purchaseStore.trim() || null,
          purchase_price: purchasePrice !== '' ? Number(purchasePrice) : null,
          purchase_date: purchaseDate || null,
          started_reading_at: startedReadingAt || null,
          finished_reading_at: finishedReadingAt || null,
          notes: notes.trim() || null,
        },
      });

      toast.success('Đã cập nhật thông tin sở hữu cá nhân thành công!');
      onSaved?.();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi khi cập nhật thông tin.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2">
          <Edit3 className="h-4 w-4 text-text-secondary" />
          <span>Chỉnh sửa thông tin sở hữu</span>
        </div>
      }
      description={`Cập nhật thông tin mua, đánh giá và ghi chú riêng cho "${book.title}"`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-[13px] font-medium text-text-secondary">
            Trạng thái sách *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {(Object.keys(STATUS_CONFIG) as BookStatus[]).map((st) => {
              const conf = STATUS_CONFIG[st];
              const isSelected = status === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-secondary text-foreground font-semibold'
                      : 'border-border bg-card hover:bg-accent text-text-secondary'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full mb-1 ${conf.dot}`} />
                  {conf.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Nơi mua sách"
            placeholder="Fahasa, Nhã Nam, Tiki..."
            value={purchaseStore}
            onChange={(e) => setPurchaseStore(e.target.value)}
            leftIcon={<MapPin className="h-4 w-4" />}
          />

          <Input
            label="Giá mua (VNĐ)"
            type="number"
            min="0"
            placeholder="120000"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            leftIcon={<DollarSign className="h-4 w-4" />}
          />

          <Input
            label="Ngày mua"
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            leftIcon={<Calendar className="h-4 w-4" />}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Ngày bắt đầu đọc"
            type="date"
            value={startedReadingAt}
            onChange={(e) => setStartedReadingAt(e.target.value)}
            leftIcon={<Calendar className="h-4 w-4" />}
          />

          <Input
            label="Ngày hoàn thành"
            type="date"
            value={finishedReadingAt}
            onChange={(e) => setFinishedReadingAt(e.target.value)}
            leftIcon={<Calendar className="h-4 w-4" />}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-[13px] font-medium text-text-secondary">
            Đánh giá cá nhân: {rating > 0 ? `${rating} / 5` : 'Chưa đánh giá'}
          </label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(rating === star ? 0 : star)}
                className="p-1 cursor-pointer"
              >
                <Star
                  className={`h-5 w-5 ${
                    star <= rating ? 'text-warning fill-warning' : 'text-text-disabled'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <Textarea
          label="Ghi chú riêng về cuốn sách"
          placeholder="Ví dụ: Bạn tặng sinh nhật, sách ấn bản giới hạn..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Huỷ
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                Lưu thông tin
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
