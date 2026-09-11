'use client';

import React, { useState } from 'react';
import { Zap, Plus, AlertTriangle, CheckCircle2, Clock, DollarSign, Filter } from 'lucide-react';
import { useUtilityBills, useUtilityStats } from '@/hooks/useUtilities';
import { UtilityBillCard, UTILITY_TYPES_CONFIG } from '@/components/utilities/UtilityBillCard';
import { AddUtilityModal } from '@/components/utilities/AddUtilityModal';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { formatVND } from '@/lib/utils';
import type { UtilityType } from '@/types/database';

export default function UtilityTrackerPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<UtilityType | 'ALL'>('ALL');
  const [filterPaid, setFilterPaid] = useState<'ALL' | 'UNPAID' | 'PAID'>('ALL');

  const { data: stats, isLoading: statsLoading } = useUtilityStats();
  const { data: bills = [], isLoading } = useUtilityBills({
    utilityType: selectedType,
    isPaid: filterPaid === 'ALL' ? 'ALL' : filterPaid === 'PAID',
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Utility Tracker & Hoá Đơn Định Kỳ
            </h1>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
            Quản lý tập trung các khoản hoá đơn sinh hoạt: Điện, Nước, Internet, Điện thoại, Phí quản lý chung cư, Rác.
          </p>
        </div>

        <Button onClick={() => setIsAddModalOpen(true)} className="gap-1.5 font-bold shadow-xs">
          <Plus className="h-4 w-4" />
          Thêm hoá đơn mới
        </Button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Tổng số hoá đơn</span>
          <p className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
            {statsLoading ? <Skeleton className="h-7 w-12" /> : stats?.totalBills || 0}
          </p>
          <span className="text-[11px] text-stone-400">khoản định kỳ</span>
        </div>

        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-stone-900 p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> Chưa thanh toán
          </span>
          <p className="font-serif text-2xl font-bold text-amber-700 dark:text-amber-400">
            {statsLoading ? <Skeleton className="h-7 w-12" /> : stats?.unpaidCount || 0}
          </p>
          <span className="text-[11px] text-amber-700/80">cần đóng tiền</span>
        </div>

        <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-stone-900 p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-800 dark:text-rose-400">Tiền cần đóng</span>
          <p className="font-serif text-xl sm:text-2xl font-bold text-rose-700 dark:text-rose-400 truncate">
            {statsLoading ? <Skeleton className="h-7 w-20" /> : formatVND(stats?.unpaidTotalAmount || 0)}
          </p>
          <span className="text-[11px] text-rose-700/80">tổng hoá đơn chưa trả</span>
        </div>

        <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Đã thanh toán</span>
          <p className="font-serif text-xl sm:text-2xl font-bold text-emerald-800 dark:text-emerald-400 truncate">
            {statsLoading ? <Skeleton className="h-7 w-20" /> : formatVND(stats?.totalSpentThisMonth || 0)}
          </p>
          <span className="text-[11px] text-stone-400">tổng đã trả</span>
        </div>
      </div>

      {/* Filter and Category Pills */}
      <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-2xs space-y-3">
        {/* Paid status toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterPaid('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterPaid === 'ALL'
                ? 'bg-[#1e3a2f] text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
            }`}
          >
            Tất cả trạng thái
          </button>
          <button
            onClick={() => setFilterPaid('UNPAID')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              filterPaid === 'UNPAID'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            <Clock className="h-3 w-3" /> Chưa thanh toán ({stats?.unpaidCount || 0})
          </button>
          <button
            onClick={() => setFilterPaid('PAID')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              filterPaid === 'PAID'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            <CheckCircle2 className="h-3 w-3" /> Đã đóng
          </button>
        </div>

        {/* Utility type selector */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
          <button
            onClick={() => setSelectedType('ALL')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedType === 'ALL'
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600'
            }`}
          >
            Tất cả loại
          </button>
          {(Object.keys(UTILITY_TYPES_CONFIG) as UtilityType[]).map((ut) => {
            const isSelected = selectedType === ut;
            const config = UTILITY_TYPES_CONFIG[ut];
            return (
              <button
                key={ut}
                onClick={() => setSelectedType(ut)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? `${config.bg} ${config.color} ring-2 ring-stone-900/20 font-bold border border-stone-300`
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600'
                }`}
              >
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      ) : bills.length === 0 ? (
        <EmptyState
          icon={<Zap className="h-8 w-8 text-amber-600" />}
          title="Chưa có hoá đơn nào trong danh mục này"
          description="Bắt đầu quản lý tiền điện, nước, internet để không bao giờ bị cắt dịch vụ hay trễ hạn."
          actionLabel="Thêm hoá đơn đầu tiên"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {bills.map((bill) => (
            <UtilityBillCard key={bill.id} bill={bill} />
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AddUtilityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
