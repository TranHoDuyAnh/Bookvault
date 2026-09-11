'use client';
import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateJournalEntry } from '@/hooks/useJournal';
import type { MoodLevel, JournalEntry } from '@/types/database';

const MOODS = [
  { val: 1 as MoodLevel, emoji: '😞' },
  { val: 2 as MoodLevel, emoji: '😐' },
  { val: 3 as MoodLevel, emoji: '🙂' },
  { val: 4 as MoodLevel, emoji: '😊' },
  { val: 5 as MoodLevel, emoji: '🤩' },
];

export function EditJournalModal({ isOpen, onClose, entry }: { isOpen: boolean; onClose: () => void; entry: JournalEntry }) {
  const [entryDate, setEntryDate] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<MoodLevel | null>(null);
  const [tagsStr, setTagsStr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const updateMutation = useUpdateJournalEntry();

  useEffect(() => {
    if (entry && isOpen) {
      setEntryDate(entry.entry_date ? new Date(entry.entry_date).toISOString().split('T')[0] : '');
      setTitle(entry.title || '');
      setContent(entry.content || '');
      setMood((entry.mood as MoodLevel) || null);
      setTagsStr(entry.tags ? entry.tags.join(', ') : '');
    }
  }, [entry, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) { toast.error('Vui lòng nhập nội dung nhật ký.'); return; }
    setIsSubmitting(true);
    
    const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
    
    try {
      await updateMutation.mutateAsync({ 
        id: entry.id,
        updates: {
          entry_date: entryDate,
          title: title.trim() || null,
          content: content.trim(),
          mood: mood || null,
          tags: tags.length > 0 ? tags : null
        }
      });
      toast.success('Đã cập nhật nhật ký!');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sửa Nhật Ký" maxWidth="2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input 
            type="date" 
            label="Ngày" 
            value={entryDate} 
            onChange={(e) => setEntryDate(e.target.value)} 
            required 
          />
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Tâm trạng</label>
            <div className="flex gap-2">
              {MOODS.map(m => (
                <button 
                  key={m.val} type="button" 
                  onClick={() => setMood(m.val)}
                  className={`text-2xl w-10 h-10 flex items-center justify-center rounded-full transition-all ${mood === m.val ? 'bg-amber-100 ring-2 ring-amber-500 scale-110' : 'hover:bg-stone-100 grayscale hover:grayscale-0'}`}
                >
                  {m.emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Input 
          label="Tiêu đề (tuỳ chọn)" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Tiêu đề ngày hôm nay..." 
        />

        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Nội dung *</label>
          <textarea
            className="w-full min-h-[200px] p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 resize-y outline-none focus:ring-2 focus:ring-[#1e3a2f]/20 focus:border-[#1e3a2f]"
            value={content}
            onChange={e => setContent(e.target.value)}
            required
            rows={8}
          />
        </div>

        <Input 
          label="Thẻ (Tags) - phân cách bằng dấu phẩy" 
          value={tagsStr} 
          onChange={(e) => setTagsStr(e.target.value)} 
          placeholder="bieton, congviec, giadinh" 
        />

        <div className="flex justify-end gap-2 pt-4 border-t border-stone-100 dark:border-stone-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Huỷ</Button>
          <Button type="submit" disabled={isSubmitting || !content.trim()} className="bg-[#1e3a2f] hover:bg-[#152a22] text-white gap-2">
            {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /><span>Đang lưu...</span></> : <><Check className="h-4 w-4" /><span>Cập nhật nhật ký</span></>}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
