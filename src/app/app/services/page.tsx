'use client';

import React, { useState } from 'react';
import { Wrench, Plus, Search, Star, DollarSign, Store, Filter } from 'lucide-react';
import { useServiceRecords, useServiceStats } from '@/hooks/useServices';
import { ServiceRecordCard } from '@/components/services/ServiceRecordCard';
import { AddServiceModal } from '@/components/services/AddServiceModal';
import { SERVICE_CATEGORIES } from '@/services/services';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { formatVND } from '@/lib/utils';

export default function ServiceHistoryPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const { data: stats, isLoading: statsLoading } = useServiceStats();
  const { data: records = [], isLoading } = useServiceRecords(selectedCategory);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="h-6 w-6 text-emerald-800 dark:text-emerald-400" />
            <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Service History & Lịch Sử Dịch Vụ
            </h1>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
            Theo dõi chi phí và địa chỉ các lần bảo dưỡng xe, vệ sinh máy lạnh, cắt tóc, sửa điện thoại, dọn dẹp nhà.
          </p>
        </div>

        <Button onClick={() => setIsAddModalOpen(true)} className="gap-1.5 font-bold shadow-xs">
          <Plus className="h-4 w-4" />
          Ghi nhận dịch vụ mới
        </Button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Lần sử dụng dịch vụ</span>
          <p className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
            {statsLoading ? <Skeleton className="h-7 w-12" /> : stats?.totalRecords || 0}
          </p>
          <span className="text-[11px] text-stone-400">lần ghi nhận</span>
        </div>

        <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Tổng chi tiêu dịch vụ</span>
          <p className="font-serif text-xl sm:text-2xl font-bold text-emerald-800 dark:text-emerald-400 truncate">
            {statsLoading ? <Skeleton className="h-7 w-20" /> : formatVND(stats?.totalSpent || 0)}
          </p>
          <span className="text-[11px] text-stone-400">tổng đã chi</span>
        </div>

        <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Đơn vị / Thợ quen</span>
          <p className="font-serif text-2xl font-bold text-stone-800 dark:text-stone-200">
            {statsLoading ? <Skeleton className="h-7 w-12" /> : stats?.distinctProviders || 0}
          </p>
          <span className="text-[11px] text-stone-400">cửa hàng & thợ lưu trữ</span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-[#1e3a2f] text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
            }`}
          >
            Tất cả dịch vụ ({records.length})
          </button>
          {SERVICE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#1e3a2f] text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Records Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <EmptyState
          icon={<Wrench className="h-8 w-8 text-emerald-800" />}
          title="Chưa có lịch sử dịch vụ nào"
          description="Bắt đầu ghi lại các lần đi bảo dưỡng xe, cắt tóc, vệ sinh máy lạnh để theo dõi chi phí và lưu thông tin thợ uy tín."
          actionLabel="Ghi nhận dịch vụ đầu tiên"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {records.map((rec) => (
            <ServiceRecordCard key={rec.id} record={rec} />
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AddServiceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
