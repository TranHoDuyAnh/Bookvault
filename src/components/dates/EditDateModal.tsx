'use client';
import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateImportantDate } from '@/hooks/useImportantDates';
import type { ImportantDate } from '@/types/database';

export function EditDateModal({ isOpen, onClose, item }: { isOpen: boolean; onClose: () => void, item: ImportantDate }) {
  const [title, setTitle] = useState(item.title);
  const [personName, setPersonName] = useState(item.person_name || '');
  const [category, setCategory] = useState(item.category);
  // Extract YYYY-MM-DD from ISO string
  const formattedDate = item.event_date ? new Date(item.event_date).toISOString().split('T')[0] : '';
  const [eventDate, setEventDate] = useState(formattedDate);
  const [isRecurring, setIsRecurring] = useState(item.is_recurring);
  const [reminderDays, setReminderDays] = useState<number | ''>(item.reminder_days_before ?? 7);
  const [notes, setNotes] = useState(item.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const updateMutation = useUpdateImportantDate();

  useEffect(() => {
    if (isOpen) {
      setTitle(item.title);
      setPersonName(item.person_name || '');
      setCategory(item.category);
      setEventDate(item.event_date ? new Date(item.event_date).toISOString().split('T')[0] : '');
      setIsRecurring(item.is_recurring);
      setReminderDays(item.reminder_days_before ?? 7);
      setNotes(item.notes || '');
    }
  }, [isOpen, item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('Vui lòng nhập tên.'); return; }
    if (!eventDate) { toast.error('Vui lòng chọn ngày.'); return; }
    
    setIsSubmitting(true);
    try {
      await updateMutation.mutateAsync({ 
        id: item.id,
        updates: {
          title: title.trim(),
          person_name: personName || null,
          category: category as any,
          event_date: eventDate,
          is_recurring: isRecurring,
          reminder_days_before: reminderDays ? Number(reminderDays) : 0,
          notes
        } as any
      });
      toast.success('Đã cập nhật thành công!');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sửa ngày quan trọng" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
        <Input label="Tiêu đề *" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input label="Tên người liên quan (không bắt buộc)" value={personName} onChange={(e) => setPersonName(e.target.value)} />
        
        <div className="space-y-1">
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Phân loại</label>
          <select className="w-full h-10 px-3 py-2 bg-transparent border border-stone-200 dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" value={category} onChange={(e) => setCategory(e.target.value as any)}>
            <option value="BIRTHDAY">🎂 Sinh nhật</option>
            <option value="ANNIVERSARY">💑 Kỷ niệm</option>
            <option value="REMINDER">⏰ Nhắc nhở</option>
            <option value="HOLIDAY">🎉 Lễ kỷ niệm</option>
            <option value="OTHER">📅 Khác</option>
          </select>
        </div>

        <Input label="Ngày diễn ra *" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />

        <label className="flex items-center gap-2 cursor-pointer mt-2">
          <input type="checkbox" className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
          <span className="text-sm font-medium text-stone-700 dark:text-stone-300">Lặp lại hàng năm</span>
        </label>

        <Input label="Báo trước (ngày)" type="number" min="0" value={reminderDays} onChange={(e) => setReminderDays(e.target.value as any)} />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Ghi chú</label>
          <textarea rows={2} className="w-full p-3 bg-transparent border border-stone-200 dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-stone-100 dark:border-stone-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Huỷ</Button>
          <Button type="submit" disabled={isSubmitting || !title.trim() || !eventDate} className="bg-[#1e3a2f] hover:bg-[#152a22] text-white gap-2">
            {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /><span>Đang lưu...</span></> : <><Check className="h-4 w-4" /><span>Lưu</span></>}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
