'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, Check, Calendar, RotateCw, Edit } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useUpdateCleaningTask } from '@/hooks/useCleaning';
import type { CleaningTask } from '@/types/database';
import { toast } from 'sonner';

export function EditCleaningTaskModal({
  isOpen,
  onClose,
  task,
}: {
  isOpen: boolean;
  onClose: () => void;
  task: CleaningTask;
}) {
  const updateMutation = useUpdateCleaningTask();

  const [title, setTitle] = useState(task.title || '');
  const [category, setCategory] = useState(task.category || 'Nhà cửa');
  const [frequencyDays, setFrequencyDays] = useState(String(task.frequency_days || 30));
  const [lastCompletedAt, setLastCompletedAt] = useState(task.last_completed_at || '');
  const [nextDueDate, setNextDueDate] = useState(task.next_due_date || '');
  const [notes, setNotes] = useState(task.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && task) {
      setTitle(task.title || '');
      setCategory(task.category || 'Nhà cửa');
      setFrequencyDays(String(task.frequency_days || 30));
      setLastCompletedAt(task.last_completed_at || '');
      setNextDueDate(task.next_due_date || '');
      setNotes(task.notes || '');
    }
  }, [isOpen, task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Vui lòng nhập tên việc vệ sinh.');
      return;
    }

    setIsSubmitting(true);
    try {
      const fDays = Number(frequencyDays) || 30;
      await updateMutation.mutateAsync({
        taskId: task.id,
        updates: {
          title: title.trim(),
          category: category.trim(),
          frequency_days: fDays,
          last_completed_at: lastCompletedAt || null,
          next_due_date: nextDueDate || task.next_due_date,
          notes: notes.trim() || null,
        },
      });

      toast.success('Đã cập nhật lịch vệ sinh! 🧹');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi cập nhật lịch vệ sinh.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <Edit className="h-5 w-5 text-emerald-700" />
          <span>Chỉnh sửa lịch vệ sinh</span>
        </div>
      }
      description="Cập nhật chu kỳ lặp lại, ngày đến hạn kế tiếp và ghi chú."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Tên việc cần vệ sinh *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Khu vực / Phân loại"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <Input
            label="Chu kỳ lặp lại (ngày) *"
            type="number"
            min={1}
            value={frequencyDays}
            onChange={(e) => setFrequencyDays(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Lần dọn gần nhất"
            type="date"
            value={lastCompletedAt}
            onChange={(e) => setLastCompletedAt(e.target.value)}
          />

          <Input
            label="Hạn dọn tiếp theo"
            type="date"
            value={nextDueDate}
            onChange={(e) => setNextDueDate(e.target.value)}
          />
        </div>

        <Textarea
          label="Ghi chú (dụng cụ, dung dịch tẩy rửa, vị trí...)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Huỷ
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !title.trim()}
            className="bg-emerald-800 hover:bg-emerald-900 text-white gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Lưu thay đổi</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
