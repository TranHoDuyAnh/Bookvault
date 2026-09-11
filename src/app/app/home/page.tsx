'use client';

import React, { useState } from 'react';
import { Home, Plus, Search, ShieldCheck, AlertTriangle, ShieldAlert, Wrench, DollarSign, Filter, Layers } from 'lucide-react';
import { useHomeItems, useHomeRooms, useHomeStats } from '@/hooks/useHome';
import { HomeItemCard } from '@/components/home/HomeItemCard';
import { AddHomeItemModal } from '@/components/home/AddHomeItemModal';
import { MaintenanceModal } from '@/components/home/MaintenanceModal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { formatVND } from '@/lib/utils';
import type { HomeItem } from '@/types/database';

export default function HomeManagerPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItemForMaintenance, setSelectedItemForMaintenance] = useState<HomeItem | null>(null);

  const [selectedRoomId, setSelectedRoomId] = useState<string>('ALL');
  const [warrantyFilter, setWarrantyFilter] = useState<'all' | 'expiring_soon' | 'active' | 'expired'>('all');
  const [search, setSearch] = useState('');

  const { data: stats, isLoading: statsLoading } = useHomeStats();
  const { data: rooms = [] } = useHomeRooms();
  const { data: items = [], isLoading } = useHomeItems({
    roomId: selectedRoomId !== 'ALL' ? selectedRoomId : undefined,
    warrantyStatus: warrantyFilter,
    search: search.trim() || undefined,
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Home className="h-6 w-6 text-[#1e3a2f] dark:text-emerald-400" />
            <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Home Manager & Quản Lý Thiết Bị
            </h1>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
            Quản lý đồ đạc trong nhà theo phòng, theo dõi hạn bảo hành và kiểm soát chi phí bảo dưỡng.
          </p>
        </div>

        <Button onClick={() => setIsAddModalOpen(true)} className="gap-1.5 font-bold shadow-xs">
          <Plus className="h-4 w-4" />
          Thêm đồ đạc / Thiết bị
        </Button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Tổng số đồ đạc</span>
          <p className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
            {statsLoading ? <Skeleton className="h-7 w-12" /> : stats?.totalItems || 0}
          </p>
          <span className="text-[11px] text-stone-400">thiết bị & nội thất</span>
        </div>

        <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Tổng giá trị tài sản</span>
          <p className="font-serif text-xl font-bold text-emerald-800 dark:text-emerald-400 truncate">
            {statsLoading ? <Skeleton className="h-7 w-20" /> : formatVND(stats?.totalAssetValue || 0)}
          </p>
          <span className="text-[11px] text-stone-400">giá trị mua ban đầu</span>
        </div>

        <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-stone-900 p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Sắp hết bảo hành
          </span>
          <p className="font-serif text-2xl font-bold text-amber-700 dark:text-amber-400">
            {statsLoading ? <Skeleton className="h-7 w-12" /> : stats?.expiringWarrantiesCount || 0}
          </p>
          <span className="text-[11px] text-amber-700/80">trong 30 ngày tới</span>
        </div>

        <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Chi phí bảo trì</span>
          <p className="font-serif text-xl font-bold text-stone-800 dark:text-stone-200 truncate">
            {statsLoading ? <Skeleton className="h-7 w-20" /> : formatVND(stats?.totalMaintenanceSpent || 0)}
          </p>
          <span className="text-[11px] text-stone-400">sửa chữa & thay linh kiện</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="w-full sm:max-w-md">
            <Input
              placeholder="Tìm thiết bị, nơi mua, số Serial..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              className="h-10 text-xs"
            />
          </div>

          {/* Warranty Quick Filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-stone-500 font-medium whitespace-nowrap">Bảo hành:</span>
            <button
              onClick={() => setWarrantyFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                warrantyFilter === 'all'
                  ? 'bg-[#1e3a2f] text-white border-[#1e3a2f]'
                  : 'bg-white text-stone-600 border-stone-200'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setWarrantyFilter('expiring_soon')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
                warrantyFilter === 'expiring_soon'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white text-amber-800 border-amber-300'
              }`}
            >
              <AlertTriangle className="h-3 w-3" /> Sắp hết hạn (30d)
            </button>
            <button
              onClick={() => setWarrantyFilter('active')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
                warrantyFilter === 'active'
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-white text-emerald-800 border-emerald-300'
              }`}
            >
              <ShieldCheck className="h-3 w-3" /> Còn hạn
            </button>
            <button
              onClick={() => setWarrantyFilter('expired')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
                warrantyFilter === 'expired'
                  ? 'bg-stone-700 text-white border-stone-700'
                  : 'bg-white text-stone-500 border-stone-200'
              }`}
            >
              <ShieldAlert className="h-3 w-3" /> Đã hết hạn
            </button>
          </div>
        </div>

        {/* Room Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
          <span className="text-xs text-stone-500 font-medium mr-1 flex items-center gap-1">
            <Layers className="h-3 w-3" /> Khu vực:
          </span>
          <button
            onClick={() => setSelectedRoomId('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedRoomId === 'ALL'
                ? 'bg-stone-800 text-white shadow-2xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
            }`}
          >
            Tất cả phòng ({items.length})
          </button>
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setSelectedRoomId(room.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedRoomId === room.id
                  ? 'bg-stone-800 text-white shadow-2xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
              }`}
            >
              {room.name} {room.item_count ? `(${room.item_count})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[16/10] w-full rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Home className="h-8 w-8 text-[#1e3a2f]" />}
          title="Chưa có đồ đạc nào trong danh mục"
          description="Bắt đầu quản lý thiết bị gia dụng, đồ công nghệ và theo dõi hạn bảo hành để không bỏ lỡ quyền lợi."
          actionLabel="Thêm thiết bị đầu tiên"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <HomeItemCard
              key={item.id}
              item={item}
              onOpenMaintenanceModal={(it) => setSelectedItemForMaintenance(it)}
            />
          ))}
        </div>
      )}

      {/* Add Item Modal */}
      <AddHomeItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Maintenance Log Modal */}
      <MaintenanceModal
        isOpen={!!selectedItemForMaintenance}
        onClose={() => setSelectedItemForMaintenance(null)}
        item={selectedItemForMaintenance}
      />
    </div>
  );
}
