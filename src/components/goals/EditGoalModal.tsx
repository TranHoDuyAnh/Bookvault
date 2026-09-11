'use client';
import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useUpdatePersonalGoal } from '@/hooks/useGoals';
import type { PersonalGoal, GoalStatus } from '@/types/database';

export function EditGoalModal({ isOpen, onClose, goal }: { isOpen: boolean; onClose: () => void; goal: PersonalGoal }) {
  const [title, setTitle] = useState(goal.title);
  const [description, setDescription] = useState(goal.description || '');
  const [period, setPeriod] = useState(goal.period || '');
  const [icon, setIcon] = useState(goal.icon || '🎯');
  const [color, setColor] = useState(goal.color || '#1e3a2f');
  const [status, setStatus] = useState<GoalStatus>(goal.status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const updateMutation = useUpdatePersonalGoal();
  const emojis = ['🎯', '💪', '📚', '💰', '🏃', '🌟', '🏆', '❤️', '✈️', '🧘'];
  const colors = ['#1e3a2f', '#0f766e', '#0369a1', '#4338ca', '#7e22ce', '#be185d', '#b45309', '#3f3f46'];

  useEffect(() => {
    if (isOpen) {
      setTitle(goal.title);
      setDescription(goal.description || '');
      setPeriod(goal.period || '');
      setIcon(goal.icon || '🎯');
      setColor(goal.color || '#1e3a2f');
      setStatus(goal.status);
    }
  }, [isOpen, goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('Vui lòng nhập tên mục tiêu.'); return; }
    setIsSubmitting(true);
    try {
      await updateMutation.mutateAsync({ 
        id: goal.id,
        updates: {
          title: title.trim(),
          description: description.trim() || null,
          period: period.trim() || goal.period,
          icon,
          color,
          status
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
    <Modal isOpen={isOpen} onClose={onClose} title="Sửa Mục Tiêu" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Tên mục tiêu *" value={title} onChange={(e) => setTitle(e.target.value)} required />
        
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Mô tả</label>
          <textarea 
            className="w-full flex min-h-[80px] w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-stone-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-800 dark:bg-stone-950 dark:ring-offset-stone-950 dark:placeholder:text-stone-400 dark:focus-visible:ring-stone-300" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
          />
        </div>

        <Input label="Thời gian (VD: Q3 2026, 2026...)" value={period} onChange={(e) => setPeriod(e.target.value)} />
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Biểu tượng</label>
          <div className="flex flex-wrap gap-2">
            {emojis.map(e => (
              <button key={e} type="button" onClick={() => setIcon(e)} className={`w-8 h-8 rounded text-lg flex items-center justify-center ${icon === e ? 'bg-stone-200 dark:bg-stone-700' : 'hover:bg-stone-100 dark:hover:bg-stone-800'}`}>{e}</button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Màu sắc</label>
          <div className="flex flex-wrap gap-2">
            {colors.map(c => (
              <button key={c} type="button" onClick={() => setColor(c)} className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-stone-900 dark:border-stone-100' : 'border-transparent'}`} style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Trạng thái</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as GoalStatus)} className="w-full flex h-10 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2 dark:border-stone-800 dark:bg-stone-950 dark:ring-offset-stone-950 dark:focus-visible:ring-stone-300">
            <option value="ACTIVE">Đang thực hiện</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="PAUSED">Tạm dừng</option>
            <option value="ABANDONED">Từ bỏ</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Huỷ</Button>
          <Button type="submit" disabled={isSubmitting || !title.trim()} className="bg-[#1e3a2f] hover:bg-[#152a22] text-white gap-2">
            {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /><span>Đang lưu...</span></> : <><Check className="h-4 w-4" /><span>Lưu</span></>}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
