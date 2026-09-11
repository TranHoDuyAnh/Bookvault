'use client';

import React, { useState } from 'react';
import { Wrench, Plus, Search, ShieldCheck, DollarSign, Layers } from 'lucide-react';
import { useMaintenanceRecords, useMaintenanceStats } from '@/hooks/useMaintenance';
import { MaintenanceCard } from '@/components/maintenance/MaintenanceCard';
import { AddMaintenanceModal, MAINTENANCE_CATEGORIES } from '@/components/maintenance/AddMaintenanceModal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { formatVND } from '@/lib/utils';

export default function HomeMaintenancePage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const { data: stats, isLoading: statsLoading } = useMaintenanceStats();
  const { data: records = [], isLoading } = useMaintenanceRecords({
    category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
    search: search.trim() || undefined,
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="h-6 w-6 text-[#1e3a2f] dark:text-emerald-400" />
            <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Home Maintenance & Nhật Ký Sửa Chữa
            </h1>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
            Ghi nhận mọi lần sửa điện nước, chống thấm, điều hoà, số điện thoại thợ và theo dõi bảo hành thi công.
          </p>
        </div>

        <Button onClick={() => setIsAddModalOpen(true)} className="gap-1.5 font-bold shadow-xs">
          <Plus className="h-4 w-4" />
          Ghi nhận sửa chữa mới
        </Button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Lần sửa chữa / bảo trì</span>
          <p className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
            {statsLoading ? <Skeleton className="h-7 w-12" /> : stats?.totalRecords || 0}
          </p>
          <span className="text-[11px] text-stone-400">hạng mục đã ghi nhận</span>
        </div>

        <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Tổng chi phí sửa chữa</span>
          <p className="font-serif text-xl sm:text-2xl font-bold text-[#1e3a2f] dark:text-emerald-400 truncate">
            {statsLoading ? <Skeleton className="h-7 w-20" /> : formatVND(stats?.totalCost || 0)}
          </p>
          <span className="text-[11px] text-stone-400">tổng đã chi</span>
        </div>

        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-stone-900 p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> Còn hạn bảo hành thi công
          </span>
          <p className="font-serif text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            {statsLoading ? <Skeleton className="h-7 w-12" /> : stats?.activeWarrantyCount || 0}
          </p>
          <span className="text-[11px] text-emerald-700/80">hạng mục còn hiệu lực bảo hành</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-2xs space-y-3">
        <div className="w-full sm:max-w-md">
          <Input
            placeholder="Tìm theo tiêu đề, mô tả, tên thợ sửa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            className="h-10 text-xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-[#1e3a2f] text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
            }`}
          >
            Tất cả hạng mục ({records.length})
          </button>
          {MAINTENANCE_CATEGORIES.map((cat) => (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <EmptyState
          icon={<Wrench className="h-8 w-8 text-[#1e3a2f]" />}
          title="Chưa có lịch sử sửa chữa nào"
          description="Lưu giữ lịch sử sửa chữa nhà cửa để tiện tra cứu khi cần gọi lại thợ hoặc yêu cầu bảo hành."
          actionLabel="Ghi nhận lần sửa đầu tiên"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((rec) => (
            <MaintenanceCard key={rec.id} record={rec} />
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AddMaintenanceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
