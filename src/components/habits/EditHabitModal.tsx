'use client';
import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdateHabit } from '@/hooks/useHabits';
import type { HabitFrequency, Habit } from '@/types/database';

const ICONS = ['✅', '🏃', '📚', '💧', '🧘', '😴', '🥗', '🎯', '🏋️', '💻'];
const COLORS = [
  { value: 'emerald', bg: 'bg-emerald-500' },
  { value: 'blue', bg: 'bg-blue-500' },
  { value: 'violet', bg: 'bg-violet-500' },
  { value: 'amber', bg: 'bg-amber-500' },
  { value: 'rose', bg: 'bg-rose-500' },
  { value: 'teal', bg: 'bg-teal-500' },
];

export function EditHabitModal({ isOpen, onClose, habit }: { isOpen: boolean; onClose: () => void; habit: Habit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [color, setColor] = useState('emerald');
  const [frequency, setFrequency] = useState<HabitFrequency>('DAILY');
  const [targetPerWeek, setTargetPerWeek] = useState(7);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const updateMutation = useUpdateHabit();

  useEffect(() => {
    if (habit && isOpen) {
      setTitle(habit.title);
      setDescription(habit.description || '');
      setIcon(habit.icon || '🎯');
      setColor(habit.color || 'emerald');
      setFrequency(habit.frequency || 'DAILY');
      setTargetPerWeek(habit.target_per_week || 7);
    }
  }, [habit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('Vui lòng nhập tên thói quen.'); return; }
    setIsSubmitting(true);
    try {
      await updateMutation.mutateAsync({ 
        id: habit.id,
        updates: {
          title: title.trim(),
          description: description.trim() || null,
          icon,
          color,
          frequency,
          target_per_week: frequency === 'WEEKLY' ? targetPerWeek : 7
        }
      });
      toast.success('Đã cập nhật!');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sửa Thói Quen" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Tên thói quen *" value={title} onChange={(e) => setTitle(e.target.value)} required />
        
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Biểu tượng</label>
          <div className="flex flex-wrap gap-2">
            {ICONS.map(i => (
              <button 
                key={i} type="button" 
                onClick={() => setIcon(i)}
                className={`w-10 h-10 text-xl flex items-center justify-center rounded-xl border ${icon === i ? 'bg-stone-100 border-stone-400 dark:bg-stone-800' : 'border-stone-200 dark:border-stone-700'}`}
              >
                {i}
              </button>
            ))}
            <Input className="w-16 text-center" value={icon} onChange={e => setIcon(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Màu sắc</label>
          <div className="flex gap-2">
            {COLORS.map(c => (
              <button 
                key={c.value} type="button" 
                onClick={() => setColor(c.value)}
                className={`w-8 h-8 rounded-full ${c.bg} ${color === c.value ? 'ring-2 ring-offset-2 ring-stone-800 dark:ring-stone-200' : ''}`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Tần suất</label>
            <select 
              className="w-full h-10 px-3 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
              value={frequency} onChange={e => setFrequency(e.target.value as HabitFrequency)}
            >
              <option value="DAILY">Hàng ngày</option>
              <option value="WEEKLY">Theo tuần</option>
            </select>
          </div>
          {frequency === 'WEEKLY' && (
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Số lần/tuần</label>
              <Input type="number" min={1} max={7} value={targetPerWeek} onChange={e => setTargetPerWeek(Number(e.target.value))} />
            </div>
          )}
        </div>

        <Input label="Mô tả (tuỳ chọn)" value={description} onChange={(e) => setDescription(e.target.value)} />

        <div className="flex justify-end gap-2 pt-4 border-t border-stone-100 dark:border-stone-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Huỷ</Button>
          <Button type="submit" disabled={isSubmitting || !title.trim()} className="bg-[#1e3a2f] hover:bg-[#152a22] text-white gap-2">
            {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /><span>Đang lưu...</span></> : <><Check className="h-4 w-4" /><span>Cập nhật</span></>}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
