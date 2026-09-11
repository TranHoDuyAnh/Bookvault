'use client';
import React, { useState } from 'react';
import { PieChart, Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useExpenses, useIncomes, useMonthlyBudgetSummary, useDeleteIncome } from '@/hooks/useBudget';
import { ExpenseCard } from '@/components/budget/ExpenseCard';
import { BudgetCategoryCard } from '@/components/budget/BudgetCategoryCard';
import { AddExpenseModal } from '@/components/budget/AddExpenseModal';
import { AddIncomeModal } from '@/components/budget/AddIncomeModal';
import { AddBudgetCategoryModal } from '@/components/budget/AddBudgetCategoryModal';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { formatVND } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function BudgetPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const [activeTab, setActiveTab] = useState<'expenses' | 'incomes' | 'categories'>('expenses');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);

  const { data: expenses = [], isLoading: loadingExp } = useExpenses(month, year);
  const { data: incomes = [], isLoading: loadingInc } = useIncomes(month, year);
  const { data: summary, isLoading: loadingSum } = useMonthlyBudgetSummary(month, year);
  
  const deleteIncomeMutation = useDeleteIncome();

  const prevMonth = () => setCurrentDate(new Date(year, month - 2, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month, 1));

  const handleDeleteIncome = async (id: string) => {
    if (!confirm('Xoá thu nhập này?')) return;
    try {
      await deleteIncomeMutation.mutateAsync(id);
      toast.success('Đã xoá!');
    } catch(err:any) {
      toast.error(err.message);
    }
  }

  const isLoading = loadingExp || loadingInc || loadingSum;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <PieChart className="h-6 w-6 text-emerald-800" />
            <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Quản lý chi tiêu
            </h1>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">Theo dõi thu chi và ngân sách hàng tháng</p>
        </div>
        
        <div className="flex items-center bg-white dark:bg-stone-900 rounded-full border border-stone-200 dark:border-stone-800 p-1">
          <button onClick={prevMonth} className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"><ChevronLeft className="w-5 h-5" /></button>
          <span className="px-4 font-semibold text-sm">Tháng {month}/{year}</span>
          <button onClick={nextMonth} className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800">
          <p className="text-sm text-stone-500 mb-1">Tổng thu</p>
          <p className="text-xl font-bold text-emerald-600">{formatVND(summary?.totalIncome || 0)}</p>
        </div>
        <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800">
          <p className="text-sm text-stone-500 mb-1">Tổng chi</p>
          <p className="text-xl font-bold text-rose-600">{formatVND(summary?.totalExpense || 0)}</p>
        </div>
        <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800">
          <p className="text-sm text-stone-500 mb-1">Cân đối</p>
          <p className={`text-xl font-bold ${(summary?.netBalance || 0) >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
            {formatVND(summary?.netBalance || 0)}
          </p>
        </div>
        <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200 dark:border-stone-800">
          <p className="text-sm text-stone-500 mb-1">Số danh mục</p>
          <p className="text-xl font-bold text-stone-900 dark:text-stone-100">{summary?.byCategory.length || 0}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 dark:border-stone-800">
        <button onClick={() => setActiveTab('expenses')} className={`px-4 py-2 font-medium text-sm border-b-2 ${activeTab === 'expenses' ? 'border-[#1e3a2f] text-[#1e3a2f] dark:border-emerald-500 dark:text-emerald-500' : 'border-transparent text-stone-500 hover:text-stone-700'}`}>
          Chi tiêu
        </button>
        <button onClick={() => setActiveTab('incomes')} className={`px-4 py-2 font-medium text-sm border-b-2 ${activeTab === 'incomes' ? 'border-[#1e3a2f] text-[#1e3a2f] dark:border-emerald-500 dark:text-emerald-500' : 'border-transparent text-stone-500 hover:text-stone-700'}`}>
          Thu nhập
        </button>
        <button onClick={() => setActiveTab('categories')} className={`px-4 py-2 font-medium text-sm border-b-2 ${activeTab === 'categories' ? 'border-[#1e3a2f] text-[#1e3a2f] dark:border-emerald-500 dark:text-emerald-500' : 'border-transparent text-stone-500 hover:text-stone-700'}`}>
          Danh mục ngân sách
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        </div>
      ) : activeTab === 'expenses' ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsAddExpenseOpen(true)} className="gap-1.5 font-bold shadow-xs text-sm">
              <Plus className="h-4 w-4" /> Thêm chi tiêu
            </Button>
          </div>
          {expenses.length === 0 ? (
            <EmptyState icon={<PieChart className="h-8 w-8" />} title="Chưa có chi tiêu" description="Thêm khoản chi đầu tiên trong tháng này" actionLabel="Thêm chi tiêu" onAction={() => setIsAddExpenseOpen(true)} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {expenses.map(exp => <ExpenseCard key={exp.id} item={exp} />)}
            </div>
          )}
        </div>
      ) : activeTab === 'incomes' ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsAddIncomeOpen(true)} className="gap-1.5 font-bold shadow-xs text-sm bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4" /> Thêm thu nhập
            </Button>
          </div>
          {incomes.length === 0 ? (
            <EmptyState icon={<PieChart className="h-8 w-8" />} title="Chưa có thu nhập" description="Ghi nhận thu nhập trong tháng này" actionLabel="Thêm thu nhập" onAction={() => setIsAddIncomeOpen(true)} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incomes.map(inc => (
                <div key={inc.id} className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-emerald-900">{inc.title}</h3>
                    <div className="text-xs text-emerald-600 flex gap-2 mt-1">
                      <span>{format(new Date(inc.income_date), 'dd/MM/yyyy')}</span>
                      {inc.source && <span>• {inc.source}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-emerald-600">+{formatVND(inc.amount)}</span>
                    <button onClick={() => handleDeleteIncome(inc.id)} className="text-stone-400 hover:text-rose-500 cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsAddCategoryOpen(true)} className="gap-1.5 font-bold shadow-xs text-sm">
              <Plus className="h-4 w-4" /> Thêm danh mục
            </Button>
          </div>
          {!summary || summary.byCategory.length === 0 ? (
            <EmptyState icon={<PieChart className="h-8 w-8" />} title="Chưa có danh mục" description="Tạo danh mục để quản lý ngân sách" actionLabel="Thêm danh mục" onAction={() => setIsAddCategoryOpen(true)} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {summary.byCategory.map(catItem => (
                <BudgetCategoryCard key={catItem.category.id} item={catItem.category} spent={catItem.spent} />
              ))}
            </div>
          )}
        </div>
      )}

      <AddExpenseModal isOpen={isAddExpenseOpen} onClose={() => setIsAddExpenseOpen(false)} />
      <AddIncomeModal isOpen={isAddIncomeOpen} onClose={() => setIsAddIncomeOpen(false)} />
      <AddBudgetCategoryModal isOpen={isAddCategoryOpen} onClose={() => setIsAddCategoryOpen(false)} />
    </div>
  );
}
