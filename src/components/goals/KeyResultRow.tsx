'use client';
import React, { useState } from 'react';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import { useDeleteKeyResult, useUpdateKeyResult } from '@/hooks/useGoals';
import type { KeyResult } from '@/types/database';
import { toast } from 'sonner';

export function KeyResultRow({ kr }: { kr: KeyResult }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentVal, setCurrentVal] = useState<number | ''>(kr.current_value);
  const deleteMutation = useDeleteKeyResult();
  const updateMutation = useUpdateKeyResult();

  const progress = kr.target_value > 0 ? Math.min(100, Math.max(0, (kr.current_value / kr.target_value) * 100)) : 0;

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xoá KR này?')) return;
    try {
      await deleteMutation.mutateAsync(kr.id);
      toast.success('Đã xoá KR!');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleUpdate = async () => {
    if (currentVal === '') return;
    try {
      await updateMutation.mutateAsync({ id: kr.id, updates: { current_value: Number(currentVal) } });
      toast.success('Đã cập nhật!');
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="py-2 border-b border-stone-100 dark:border-stone-800 last:border-0 group">
      <div className="flex items-center justify-between mb-1 text-sm">
        <div className="font-medium text-stone-700 dark:text-stone-300">
          {kr.title}
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-1">
              <input 
                type="number" 
                step="any" 
                className="w-16 px-1 py-0.5 text-xs border rounded bg-white dark:bg-stone-800 dark:border-stone-700" 
                value={currentVal} 
                onChange={(e) => setCurrentVal(e.target.value === '' ? '' : Number(e.target.value))} 
              />
              <button onClick={handleUpdate} className="text-emerald-600 hover:text-emerald-700"><Check className="h-4 w-4" /></button>
              <button onClick={() => { setIsEditing(false); setCurrentVal(kr.current_value); }} className="text-rose-500 hover:text-rose-600"><X className="h-4 w-4" /></button>
            </div>
          ) : (
            <div className="text-stone-600 dark:text-stone-400 font-mono text-xs cursor-pointer hover:text-emerald-600 flex items-center gap-1" onClick={() => setIsEditing(true)}>
              {kr.current_value} / {kr.target_value} {kr.unit} <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
          <button onClick={handleDelete} className="text-stone-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-1.5 overflow-hidden">
        <div className="bg-[#1e3a2f] h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
