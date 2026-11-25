'use client';

import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Check, X } from 'lucide-react';
import type { EnvelopeWithSpent } from '@/types/database';
import { formatVND, cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface EnvelopeGridProps {
  envelopes: EnvelopeWithSpent[];
  unallocatedAmount: number;
  isClosed: boolean;
  onQuickSpend: (envelope: EnvelopeWithSpent) => void;
  onAddEnvelope: (name: string, allocated: number) => Promise<void>;
  onUpdateEnvelope: (id: string, name: string, allocated: number) => Promise<void>;
  onDeleteEnvelope: (id: string) => Promise<void>;
}

export function EnvelopeGrid({
  envelopes,
  unallocatedAmount,
  isClosed,
  onQuickSpend,
  onAddEnvelope,
  onUpdateEnvelope,
  onDeleteEnvelope,
}: EnvelopeGridProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const amount = parseInt(newAmount.replace(/\D/g, ''), 10) || 0;
    if (!newName.trim()) {
      setErrorMsg('Vui lòng nhập tên hũ ngân sách.');
      return;
    }
    if (amount > unallocatedAmount) {
      setErrorMsg(`Số tiền vượt quá phần chưa phân bổ (${formatVND(unallocatedAmount)}).`);
      return;
    }
    await onAddEnvelope(newName.trim(), amount);
    setNewName('');
    setNewAmount('');
    setIsAdding(false);
  };

  const handleSaveEdit = async (env: EnvelopeWithSpent) => {
    setErrorMsg(null);
    const amount = parseInt(editAmount.replace(/\D/g, ''), 10) || 0;
    const maxAllowed = unallocatedAmount + env.allocated_amount;
    if (!editName.trim()) return;
    if (amount > maxAllowed) {
      setErrorMsg(`Tối đa cho hũ này là ${formatVND(maxAllowed)} để không vượt trần tuần.`);
      return;
    }
    await onUpdateEnvelope(env.id, editName.trim(), amount);
    setEditingId(null);
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Các hũ ngân sách tuần ({envelopes.length})
          </h2>
          <p className="text-xs text-text-muted">
            Bấm &ldquo;+ Chi&rdquo; trên từng hũ để ghi nhanh chi tiêu. Còn{' '}
            <span className="font-medium text-foreground">{formatVND(Math.max(0, unallocatedAmount))}</span>{' '}
            chưa phân bổ.
          </p>
        </div>

        {!isClosed && !isAdding && (
          <Button size="sm" variant="outline" onClick={() => setIsAdding(true)}>
            <Plus className="h-3.5 w-3.5" />
            Thêm hũ
          </Button>
        )}
      </div>

      {errorMsg && (
        <div className="rounded-md border border-destructive/30 bg-destructive-subtle px-3 py-2 text-xs text-destructive">
          {errorMsg}
        </div>
      )}

      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="rounded-lg border border-border bg-card p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
        >
          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1">
              Tên hũ ngân sách
            </label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="VD: Cà phê, Ăn vặt..."
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1">
              Hạn mức tuần (VNĐ)
            </label>
            <Input
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              placeholder={`Tối đa ${Math.max(0, unallocatedAmount)}`}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" className="flex-1">
              Lưu hũ
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setIsAdding(false);
                setErrorMsg(null);
              }}
            >
              Huỷ
            </Button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {envelopes.map((env) => {
          const pct =
            env.allocated_amount > 0
              ? Math.min(100, Math.round((env.spent_amount / env.allocated_amount) * 100))
              : env.spent_amount > 0
                ? 100
                : 0;
          const isOver = env.remaining_amount < 0;
          const isEditing = editingId === env.id;

          return (
            <div
              key={env.id}
              className="rounded-lg border border-border bg-card p-4 shadow-2xs flex flex-col justify-between gap-3"
            >
              {isEditing ? (
                <div className="space-y-2.5">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Tên hũ"
                    className="h-8 text-xs"
                  />
                  <Input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    placeholder="Hạn mức (VNĐ)"
                    className="h-8 text-xs"
                  />
                  <div className="flex items-center justify-end gap-1.5">
                    <Button size="sm" onClick={() => handleSaveEdit(env)}>
                      <Check className="h-3.5 w-3.5" />
                      Lưu
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingId(null);
                        setErrorMsg(null);
                      }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-foreground truncate">
                        {env.name}
                      </h3>
                      <p className="text-xs text-text-muted tabular-nums">
                        Hạn mức: {formatVND(env.allocated_amount)}
                      </p>
                    </div>

                    {!isClosed && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => onQuickSpend(env)}
                          className="h-7 px-2.5 text-xs"
                        >
                          <Plus className="h-3 w-3" />
                          Chi
                        </Button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(env.id);
                            setEditName(env.name);
                            setEditAmount(String(env.allocated_amount));
                          }}
                          className="p-1.5 rounded-md text-text-muted hover:bg-accent hover:text-foreground cursor-pointer"
                          title="Sửa hũ"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteEnvelope(env.id)}
                          className="p-1.5 rounded-md text-text-muted hover:bg-destructive-subtle hover:text-destructive cursor-pointer"
                          title="Xoá hũ"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-300',
                          isOver ? 'bg-destructive' : pct >= 85 ? 'bg-warning' : 'bg-primary'
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs tabular-nums">
                      <span className="text-text-muted">
                        Đã tiêu: <strong className="text-foreground">{formatVND(env.spent_amount)}</strong>
                      </span>
                      <span
                        className={cn(
                          'font-medium',
                          isOver ? 'text-destructive' : 'text-success'
                        )}
                      >
                        {isOver
                          ? `Vượt ${formatVND(Math.abs(env.remaining_amount))}`
                          : `Còn ${formatVND(env.remaining_amount)}`}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
