'use client';

import React, { useState } from 'react';
import { Trash2, PiggyBank, BarChart3, Receipt, Plus } from 'lucide-react';
import type {
  BudgetExpense,
  EnvelopeWithSpent,
  SavingsGoal,
  SavingsTransaction,
} from '@/types/database';
import type { WeeklyReportItem } from '@/services/budget';
import { formatDateVN, formatVND, cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface WeeklyReportAndSavingsProps {
  expenses: BudgetExpense[];
  envelopes: EnvelopeWithSpent[];
  reports: WeeklyReportItem[];
  savingsGoals: SavingsGoal[];
  savingsTransactions: SavingsTransaction[];
  isClosed: boolean;
  onDeleteExpense: (id: string) => Promise<void>;
  onCreateSavingsGoal: (name: string, targetAmount: number | null) => Promise<void>;
}

export function WeeklyReportAndSavings({
  expenses,
  envelopes,
  reports,
  savingsGoals,
  savingsTransactions,
  isClosed,
  onDeleteExpense,
  onCreateSavingsGoal,
}: WeeklyReportAndSavingsProps) {
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [showAddGoal, setShowAddGoal] = useState(false);

  const envelopeMap = new Map(envelopes.map((e) => [e.id, e.name]));

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalName.trim()) return;
    const target = parseInt(newGoalTarget.replace(/\D/g, ''), 10) || null;
    await onCreateSavingsGoal(newGoalName.trim(), target);
    setNewGoalName('');
    setNewGoalTarget('');
    setShowAddGoal(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Expenses in Selected Week */}
        <section className="rounded-lg border border-border bg-card p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-text-secondary" />
            <h3 className="text-sm font-semibold text-foreground">
              Chi tiêu trong tuần ({expenses.length})
            </h3>
          </div>

          {expenses.length === 0 ? (
            <p className="text-xs text-text-muted py-4 text-center">
              Chưa có khoản chi nào được ghi nhận trong tuần này.
            </p>
          ) : (
            <div className="divide-y divide-border max-h-72 overflow-y-auto pr-1">
              {expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 text-xs gap-2"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {envelopeMap.get(exp.envelope_id) || 'Hũ đã xoá'}
                      {exp.note ? (
                        <span className="font-normal text-text-muted"> • {exp.note}</span>
                      ) : null}
                    </p>
                    <p className="text-[11px] text-text-muted">{formatDateVN(exp.spent_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-semibold text-foreground tabular-nums">
                      -{formatVND(exp.amount)}
                    </span>
                    {!isClosed && (
                      <button
                        type="button"
                        onClick={() => onDeleteExpense(exp.id)}
                        className="p-1 rounded text-text-muted hover:bg-destructive-subtle hover:text-destructive cursor-pointer"
                        title="Xoá khoản chi"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Savings Goals */}
        <section className="rounded-lg border border-border bg-card p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PiggyBank className="h-4 w-4 text-success" />
              <h3 className="text-sm font-semibold text-foreground">Quỹ tiết kiệm</h3>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddGoal((prev) => !prev)}
            >
              <Plus className="h-3.5 w-3.5" />
              Tạo quỹ
            </Button>
          </div>

          {showAddGoal && (
            <form onSubmit={handleAddGoal} className="flex flex-wrap gap-2 pt-1">
              <Input
                value={newGoalName}
                onChange={(e) => setNewGoalName(e.target.value)}
                placeholder="Tên quỹ (VD: Dự phòng)"
                className="flex-1 min-w-[140px] h-8 text-xs"
              />
              <Input
                type="number"
                value={newGoalTarget}
                onChange={(e) => setNewGoalTarget(e.target.value)}
                placeholder="Mục tiêu (tuỳ chọn)"
                className="w-36 h-8 text-xs"
              />
              <Button type="submit" size="sm">
                Lưu
              </Button>
            </form>
          )}

          {savingsGoals.length === 0 ? (
            <p className="text-xs text-text-muted py-4 text-center">
              Chưa có quỹ tiết kiệm. Khi chốt tuần, bạn có thể chuyển tiền dư vào đây.
            </p>
          ) : (
            <div className="space-y-2.5">
              {savingsGoals.map((goal) => {
                const pct =
                  goal.target_amount && goal.target_amount > 0
                    ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100))
                    : null;
                return (
                  <div
                    key={goal.id}
                    className="rounded-md border border-border bg-background/60 p-3 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">{goal.name}</span>
                      <span className="font-semibold text-success tabular-nums">
                        {formatVND(goal.current_amount)}
                      </span>
                    </div>
                    {pct !== null && (
                      <div className="space-y-1">
                        <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full rounded-full bg-success"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-text-muted text-right tabular-nums">
                          {pct}% mục tiêu {formatVND(goal.target_amount)}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {savingsTransactions.length > 0 && (
            <div className="pt-2 border-t border-border space-y-1">
              <p className="text-[11px] font-medium text-text-muted">Lịch sử góp từ tiền dư</p>
              {savingsTransactions.slice(0, 3).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between text-[11px]">
                  <span className="text-text-secondary truncate pr-2">{tx.note}</span>
                  <span className="font-medium text-success shrink-0 tabular-nums">
                    +{formatVND(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Weekly Comparison Report */}
      <section className="rounded-lg border border-border bg-card p-5 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-text-secondary" />
          <h3 className="text-sm font-semibold text-foreground">Báo cáo tổng hợp các tuần</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border text-text-muted">
                <th className="py-2 pr-3 font-medium">Tuần</th>
                <th className="py-2 px-3 font-medium text-right">Ngân sách</th>
                <th className="py-2 px-3 font-medium text-right">Thực chi</th>
                <th className="py-2 px-3 font-medium text-right">Dư / Vượt</th>
                <th className="py-2 pl-3 font-medium text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border tabular-nums">
              {reports.map((r) => (
                <tr key={r.id}>
                  <td className="py-2.5 pr-3 text-foreground font-medium whitespace-nowrap">
                    {formatDateVN(r.week_start)} – {formatDateVN(r.week_end)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-text-secondary">
                    {formatVND(r.total_cap + r.rollover_in)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-foreground font-medium">
                    {formatVND(r.total_spent)}
                  </td>
                  <td
                    className={cn(
                      'py-2.5 px-3 text-right font-semibold',
                      r.leftover >= 0 ? 'text-success' : 'text-destructive'
                    )}
                  >
                    {formatVND(r.leftover)}
                  </td>
                  <td className="py-2.5 pl-3 text-right">
                    {r.status === 'CLOSED' ? (
                      <span className="text-[11px] text-success">Đã chốt</span>
                    ) : (
                      <span className="text-[11px] text-text-muted">Đang mở</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
