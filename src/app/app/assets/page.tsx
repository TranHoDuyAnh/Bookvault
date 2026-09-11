'use client';

import React, { useState } from 'react';
import { Package, Plus, Search, DollarSign, TrendingDown, Layers } from 'lucide-react';
import { usePersonalAssets, useAssetStats } from '@/hooks/useAssets';
import { AssetCard, ASSET_CATEGORIES } from '@/components/assets/AssetCard';
import { AddAssetModal } from '@/components/assets/AddAssetModal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { formatVND } from '@/lib/utils';
import type { AssetCategory } from '@/types/database';

export default function PersonalAssetsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'value_desc' | 'value_asc' | 'newest'>('value_desc');

  const { data: stats, isLoading: statsLoading } = useAssetStats();
  const { data: assets = [], isLoading } = usePersonalAssets({
    category: selectedCategory,
    search: search.trim() || undefined,
    sortBy,
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-indigo-700 dark:text-indigo-400" />
            <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Personal Asset Manager & Quản Lý Tài Sản
            </h1>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
            Kiểm soát toàn bộ tài sản đang sở hữu, vị trí cất giữ và theo dõi biến động giá trị / khấu hao.
          </p>
        </div>

        <Button onClick={() => setIsAddModalOpen(true)} className="gap-1.5 font-bold shadow-xs">
          <Plus className="h-4 w-4" />
          Thêm tài sản mới
        </Button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Tổng số tài sản</span>
          <p className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
            {statsLoading ? <Skeleton className="h-7 w-12" /> : stats?.totalAssets || 0}
          </p>
          <span className="text-[11px] text-stone-400">mục đang sở hữu</span>
        </div>

        <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Giá trị hiện tại</span>
          <p className="font-serif text-xl sm:text-2xl font-bold text-emerald-800 dark:text-emerald-400 truncate">
            {statsLoading ? <Skeleton className="h-7 w-20" /> : formatVND(stats?.totalCurrentValue || 0)}
          </p>
          <span className="text-[11px] text-stone-400">ước tính theo giá thị trường</span>
        </div>

        <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Tổng vốn mua</span>
          <p className="font-serif text-xl sm:text-2xl font-bold text-stone-800 dark:text-stone-200 truncate">
            {statsLoading ? <Skeleton className="h-7 w-20" /> : formatVND(stats?.totalPurchaseValue || 0)}
          </p>
          <span className="text-[11px] text-stone-400">tổng tiền lúc mua</span>
        </div>

        <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Khấu hao</span>
          <p className="font-serif text-xl sm:text-2xl font-bold text-amber-700 dark:text-amber-400 truncate">
            {statsLoading ? <Skeleton className="h-7 w-20" /> : formatVND(stats?.depreciationValue || 0)}
          </p>
          <span className="text-[11px] text-stone-400">chênh lệch giá trị</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="w-full sm:max-w-md">
            <Input
              placeholder="Tìm theo tên tài sản, vị trí, số Serial..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              className="h-10 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-stone-500 font-medium whitespace-nowrap">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-10 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-3 py-1 text-xs font-medium text-stone-800 dark:text-stone-200 focus:outline-none"
            >
              <option value="value_desc">Giá trị cao nhất</option>
              <option value="value_asc">Giá trị thấp nhất</option>
              <option value="newest">Mới thêm gần đây</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-[#1e3a2f] text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
            }`}
          >
            Tất cả danh mục ({assets.length})
          </button>
          {(Object.keys(ASSET_CATEGORIES) as AssetCategory[]).map((cat) => {
            const isSelected = selectedCategory === cat;
            const config = ASSET_CATEGORIES[cat];
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? `${config.bg} ${config.text} ring-2 ring-[#1e3a2f]/20 font-bold border border-[#1e3a2f]/40`
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[16/10] w-full rounded-2xl" />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <EmptyState
          icon={<Package className="h-8 w-8 text-indigo-700" />}
          title="Chưa có tài sản nào được lưu"
          description="Bắt đầu số hoá danh mục thiết bị công nghệ, phương tiện, đồng hồ và các tài sản giá trị của bạn."
          actionLabel="Thêm tài sản đầu tiên"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AddAssetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
