'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateImportantDate } from '@/hooks/useImportantDates';
import type { ImportantDate, DateCategory } from '@/types/database';

export function EditDateModal({
  isOpen,
  onClose,
  item,
}: {
  isOpen: boolean;
  onClose: () => void;
  item: ImportantDate;
}) {
  const [title, setTitle] = useState(item.title);
  const [personName, setPersonName] = useState(item.person_name || '');
  const [category, setCategory] = useState<DateCategory>(item.category);
  const formattedDate = item.event_date ? new Date(item.event_date).toISOString().split('T')[0] : '';
  const [eventDate, setEventDate] = useState(formattedDate);
  const [isRecurring, setIsRecurring] = useState(item.is_recurring);
  const [reminderDays, setReminderDays] = useState<string>(
    item.reminder_days_before !== undefined && item.reminder_days_before !== null
      ? String(item.reminder_days_before)
      : '7'
  );
  const [notes, setNotes] = useState(item.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateMutation = useUpdateImportantDate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Vui lòng nhập tên.');
      return;
    }
    if (!eventDate) {
      toast.error('Vui lòng chọn ngày.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateMutation.mutateAsync({
        id: item.id,
        updates: {
          title: title.trim(),
          person_name: personName || null,
          category,
          event_date: eventDate,
          is_recurring: isRecurring,
          reminder_days_before: reminderDays ? Number(reminderDays) : 0,
          notes: notes || null,
        },
      });
      toast.success('Đã cập nhật thành công!');
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sửa ngày quan trọng" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
        <Input label="Tiêu đề *" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input label="Tên người liên quan (không bắt buộc)" value={personName} onChange={(e) => setPersonName(e.target.value)} />

        <Select
          label="Phân loại"
          value={category}
          onChange={(e) => setCategory(e.target.value as DateCategory)}
        >
          <option value="BIRTHDAY">Sinh nhật</option>
          <option value="ANNIVERSARY">Kỷ niệm</option>
          <option value="REMINDER">Nhắc nhở</option>
          <option value="HOLIDAY">Lễ kỷ niệm</option>
          <option value="OTHER">Khác</option>
        </Select>

        <Input label="Ngày diễn ra *" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-input accent-primary"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
          />
          <span className="text-[13px] font-medium text-text-secondary">Lặp lại hàng năm</span>
        </label>

        <Input label="Báo trước (ngày)" type="number" min="0" value={reminderDays} onChange={(e) => setReminderDays(e.target.value)} />

        <Textarea label="Ghi chú" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />

        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Huỷ
          </Button>
          <Button type="submit" disabled={isSubmitting || !title.trim() || !eventDate}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Lưu</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
