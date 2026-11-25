'use client';

import React, { useMemo, useState } from 'react';
import { Plus, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { getWeekRange } from '@/services/budget';
import { useBudgetMutations, useSavingsData, useWeekBudget, useWeeklyReports } from '@/hooks/useBudget';
import type { EnvelopeWithSpent } from '@/types/database';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { WeeklySummaryHeader } from '@/components/budget/WeeklySummaryHeader';
import { EnvelopeGrid } from '@/components/budget/EnvelopeGrid';
import { QuickExpenseModal } from '@/components/budget/QuickExpenseModal';
import { CloseWeekModal } from '@/components/budget/CloseWeekModal';
import { WeeklyReportAndSavings } from '@/components/budget/WeeklyReportAndSavings';

export default function BudgetPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const { weekStart, weekEnd } = useMemo(() => getWeekRange(weekOffset), [weekOffset]);

  const { data, isLoading, error } = useWeekBudget(weekStart, weekEnd);
  const { data: reports = [] } = useWeeklyReports();
  const { data: savingsData } = useSavingsData();
  const mutations = useBudgetMutations();

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [selectedEnvelopeId, setSelectedEnvelopeId] = useState<string | null>(null);
  const [closeModalOpen, setCloseModalOpen] = useState(false);

  const budget = data?.budget;
  const envelopes = useMemo(() => data?.envelopes || [], [data?.envelopes]);
  const expenses = useMemo(() => data?.expenses || [], [data?.expenses]);

  const totalAllocated = useMemo(
    () => envelopes.reduce((sum, e) => sum + e.allocated_amount, 0),
    [envelopes]
  );
  const totalSpent = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  const effectiveCap = budget ? budget.total_cap + budget.rollover_in : 0;
  const unallocatedAmount = effectiveCap - totalAllocated;
  const remainingSurplus = effectiveCap - totalSpent;
  const isClosed = budget?.status === 'CLOSED';

  const handleQuickSpend = (env: EnvelopeWithSpent) => {
    setSelectedEnvelopeId(env.id);
    setExpenseModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ngân sách tuần"
        description="Chia trần chi tiêu vào từng hũ nhỏ, ghi nhanh và chuyển tiền dư sang tuần sau hoặc tiết kiệm."
        actions={
          budget && !isClosed ? (
            <Button
              size="sm"
              onClick={() => {
                setSelectedEnvelopeId(envelopes[0]?.id || null);
                setExpenseModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Ghi chi tiêu
            </Button>
          ) : null
        }
      />

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive-subtle p-5 text-sm text-destructive space-y-1">
          <p className="font-semibold flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Chưa thể tải dữ liệu ngân sách tuần
          </p>
          <p className="text-xs">
            {(error as Error).message}. Hãy chắc chắn bạn đã chạy đoạn SQL mới trong{' '}
            <code>db.md</code> (phần 29) trên Supabase SQL Editor.
          </p>
        </div>
      ) : isLoading || !budget ? (
        <div className="space-y-4">
          <Skeleton className="h-44 w-full rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Skeleton className="h-28 w-full rounded-lg" />
            <Skeleton className="h-28 w-full rounded-lg" />
            <Skeleton className="h-28 w-full rounded-lg" />
          </div>
        </div>
      ) : (
        <>
          <WeeklySummaryHeader
            budget={budget}
            totalAllocated={totalAllocated}
            totalSpent={totalSpent}
            weekOffset={weekOffset}
            onChangeWeekOffset={setWeekOffset}
            onUpdateCap={async (newCap) => {
              await mutations.updateCap.mutateAsync({ budgetId: budget.id, totalCap: newCap });
              toast.success('Đã cập nhật trần chi tiêu tuần.');
            }}
            onOpenCloseWeek={() => setCloseModalOpen(true)}
            isUpdatingCap={mutations.updateCap.isPending}
          />

          <EnvelopeGrid
            envelopes={envelopes}
            unallocatedAmount={unallocatedAmount}
            isClosed={isClosed}
            onQuickSpend={handleQuickSpend}
            onAddEnvelope={async (name, allocated) => {
              await mutations.addEnvelope.mutateAsync({
                weekly_budget_id: budget.id,
                name,
                allocated_amount: allocated,
                sort_order: envelopes.length,
              });
              toast.success(`Đã thêm hũ "${name}".`);
            }}
            onUpdateEnvelope={async (id, name, allocated) => {
              await mutations.editEnvelope.mutateAsync({
                id,
                updates: { name, allocated_amount: allocated },
              });
              toast.success('Đã cập nhật hũ ngân sách.');
            }}
            onDeleteEnvelope={async (id) => {
              await mutations.removeEnvelope.mutateAsync(id);
              toast.success('Đã xoá hũ ngân sách.');
            }}
          />

          <WeeklyReportAndSavings
            expenses={expenses}
            envelopes={envelopes}
            reports={reports}
            savingsGoals={savingsData?.goals || []}
            savingsTransactions={savingsData?.transactions || []}
            isClosed={isClosed}
            onDeleteExpense={async (id) => {
              await mutations.removeExpense.mutateAsync(id);
              toast.success('Đã xoá khoản chi.');
            }}
            onCreateSavingsGoal={async (name, targetAmount) => {
              await mutations.addSavingsGoal.mutateAsync({
                name,
                target_amount: targetAmount,
              });
              toast.success(`Đã tạo quỹ "${name}".`);
            }}
          />

          {expenseModalOpen && (
            <QuickExpenseModal
              key={selectedEnvelopeId || 'default-expense'}
              isOpen={expenseModalOpen}
              onClose={() => setExpenseModalOpen(false)}
              envelopes={envelopes}
              initialEnvelopeId={selectedEnvelopeId}
              onSubmit={async (payload) => {
                await mutations.addExpense.mutateAsync({
                  ...payload,
                  weekly_budget_id: budget.id,
                });
                toast.success('Đã ghi nhận chi tiêu.');
              }}
              isSubmitting={mutations.addExpense.isPending}
            />
          )}

          {closeModalOpen && (
            <CloseWeekModal
              key={budget.id}
              isOpen={closeModalOpen}
              onClose={() => setCloseModalOpen(false)}
              budget={budget}
              surplusAmount={remainingSurplus}
              savingsGoals={savingsData?.goals || []}
              onConfirm={async (payload) => {
                await mutations.closeWeek.mutateAsync({
                  budget,
                  ...payload,
                });
                toast.success('Đã chốt tuần và phân bổ tiền dư!');
              }}
              isSubmitting={mutations.closeWeek.isPending}
            />
          )}
        </>
      )}
    </div>
  );
}
