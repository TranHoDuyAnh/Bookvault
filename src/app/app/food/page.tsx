'use client';

import React, { useState } from 'react';
import { Utensils, Plus, Search, Heart, Home, Store, Filter, DollarSign, Star } from 'lucide-react';
import { useFoodEntries, useFoodStats } from '@/hooks/useFood';
import { FoodCard, MEAL_TYPE_LABELS } from '@/components/food/FoodCard';
import { AddFoodModal } from '@/components/food/AddFoodModal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { formatVND } from '@/lib/utils';
import type { MealType } from '@/types/database';

export default function FoodDiaryPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [mealTypeFilter, setMealTypeFilter] = useState<MealType | 'ALL'>('ALL');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [onlyHomeCooked, setOnlyHomeCooked] = useState<boolean | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'rating' | 'price_asc' | 'price_desc'>('newest');

  const { data: stats, isLoading: statsLoading } = useFoodStats();
  const { data: entries = [], isLoading } = useFoodEntries({
    mealType: mealTypeFilter,
    isFavorite: onlyFavorites ? true : undefined,
    isCookedAtHome: onlyHomeCooked,
    search: search.trim() || undefined,
    sortBy,
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Utensils className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
            <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Food Diary & Khám Phá Món Ngon
            </h1>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
            Ghi lại hành trình ẩm thực, quán ăn yêu thích và những bữa cơm tự nấu ấm cúng.
          </p>
        </div>

        <Button onClick={() => setIsAddModalOpen(true)} className="gap-1.5 font-bold shadow-xs">
          <Plus className="h-4 w-4" />
          Ghi món ăn mới
        </Button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Tổng số món</span>
          <p className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
            {statsLoading ? <Skeleton className="h-7 w-12" /> : stats?.totalDishes || 0}
          </p>
          <span className="text-[11px] text-stone-400">món đã ghi nhận</span>
        </div>

        <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Tự nấu tại nhà</span>
          <p className="font-serif text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            {statsLoading ? <Skeleton className="h-7 w-12" /> : stats?.homeCookedCount || 0}
          </p>
          <span className="text-[11px] text-stone-400">bữa cơm gia đình</span>
        </div>

        <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Món yêu thích</span>
          <p className="font-serif text-2xl font-bold text-rose-600 dark:text-rose-400">
            {statsLoading ? <Skeleton className="h-7 w-12" /> : stats?.favoriteCount || 0}
          </p>
          <span className="text-[11px] text-stone-400">món muốn quay lại</span>
        </div>

        <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Chi tiêu ăn uống</span>
          <p className="font-serif text-xl font-bold text-[#1e3a2f] dark:text-emerald-400 truncate">
            {statsLoading ? <Skeleton className="h-7 w-20" /> : formatVND(stats?.totalSpent || 0)}
          </p>
          <span className="text-[11px] text-stone-400">tổng đã chi</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="w-full sm:max-w-md">
            <Input
              placeholder="Tìm theo tên món, tên quán, địa chỉ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              className="h-10 text-xs"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-stone-500 font-medium whitespace-nowrap">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-10 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-3 py-1 text-xs font-medium text-stone-800 dark:text-stone-200 focus:outline-none"
            >
              <option value="newest">Mới ăn gần đây</option>
              <option value="rating">Đánh giá cao nhất</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
            </select>
          </div>
        </div>

        {/* Meal Type Tabs & Origin Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
          <button
            type="button"
            onClick={() => setMealTypeFilter('ALL')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              mealTypeFilter === 'ALL'
                ? 'bg-[#1e3a2f] text-white shadow-xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
            }`}
          >
            Tất cả
          </button>
          {(Object.keys(MEAL_TYPE_LABELS) as MealType[]).map((type) => {
            const isSelected = mealTypeFilter === type;
            const config = MEAL_TYPE_LABELS[type];
            return (
              <button
                key={type}
                type="button"
                onClick={() => setMealTypeFilter(type)}
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

          <div className="ml-auto flex items-center gap-2 pt-1 sm:pt-0">
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 cursor-pointer transition-colors ${
                onlyFavorites
                  ? 'bg-rose-50 text-rose-700 border-rose-300 font-bold'
                  : 'bg-white text-stone-600 border-stone-200'
              }`}
            >
              <Heart className={`h-3 w-3 ${onlyFavorites ? 'fill-rose-500 text-rose-500' : ''}`} />
              Món yêu thích
            </button>

            <button
              onClick={() => {
                if (onlyHomeCooked === undefined) setOnlyHomeCooked(true);
                else if (onlyHomeCooked === true) setOnlyHomeCooked(false);
                else setOnlyHomeCooked(undefined);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 cursor-pointer transition-colors ${
                onlyHomeCooked === true
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                  : onlyHomeCooked === false
                  ? 'bg-indigo-50 text-indigo-800 border-indigo-300 font-bold'
                  : 'bg-white text-stone-600 border-stone-200'
              }`}
            >
              {onlyHomeCooked === true ? '🏡 Chỉ Tự nấu' : onlyHomeCooked === false ? '🏬 Chỉ Ăn ngoài' : '🏡 / 🏬 Nguồn gốc: Tất cả'}
            </button>
          </div>
        </div>
      </div>

      {/* Food Entries Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] w-full rounded-2xl" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={<Utensils className="h-8 w-8 text-emerald-700" />}
          title="Chưa có món ăn nào trong nhật ký"
          description="Ghi lại món ăn ngon hôm nay hoặc quán ăn bạn vừa khám phá."
          actionLabel="Ghi món ăn đầu tiên"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {entries.map((entry) => (
            <FoodCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AddFoodModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
