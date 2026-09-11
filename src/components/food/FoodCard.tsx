'use client';

import React, { useState } from 'react';
import { Utensils, Star, MapPin, DollarSign, Calendar, Heart, Trash2, Home, Store, Edit2 } from 'lucide-react';
import type { FoodEntry, MealType } from '@/types/database';
import { formatVND, formatDateVN } from '@/lib/utils';
import { useDeleteFoodEntry, useUpdateFoodEntry } from '@/hooks/useFood';
import { EditFoodModal } from './EditFoodModal';
import { toast } from 'sonner';

export const MEAL_TYPE_LABELS: Record<MealType, { label: string; bg: string; text: string }> = {
  BREAKFAST: { label: 'Bữa sáng', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-800 dark:text-amber-300' },
  LUNCH: { label: 'Bữa trưa', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-800 dark:text-emerald-300' },
  DINNER: { label: 'Bữa tối', bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-800 dark:text-indigo-300' },
  SNACK: { label: 'Ăn vặt / Xế', bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-800 dark:text-rose-300' },
  CAFE_DRINK: { label: 'Cà phê / Nước', bg: 'bg-amber-100/60 dark:bg-amber-900/40', text: 'text-amber-900 dark:text-amber-200' },
};

export function FoodCard({ entry }: { entry: FoodEntry }) {
  const deleteMutation = useDeleteFoodEntry();
  const updateMutation = useUpdateFoodEntry();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const mealConfig = MEAL_TYPE_LABELS[entry.meal_type] || MEAL_TYPE_LABELS.DINNER;

  const handleToggleFavorite = async () => {
    try {
      await updateMutation.mutateAsync({
        entryId: entry.id,
        updates: { is_favorite: !entry.is_favorite },
      });
      toast.success(entry.is_favorite ? 'Đã bỏ khỏi mục yêu thích' : 'Đã thêm vào mục yêu thích ❤️');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi cập nhật.');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc muốn xoá món "${entry.dish_name}"?`)) return;
    try {
      await deleteMutation.mutateAsync(entry.id);
      toast.success('Đã xoá nhật ký món ăn.');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xoá.');
    }
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden shadow-2xs hover:shadow-md hover:border-[#1e3a2f]/40 transition-all">
      {/* Image or Food Placeholder */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f7f4ee] dark:bg-stone-800 flex items-center justify-center">
        {entry.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={entry.image_url}
            alt={entry.dish_name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-stone-400 space-y-1">
            <Utensils className="h-10 w-10 stroke-[1.5]" />
            <span className="text-[11px] font-serif italic text-stone-500">{entry.dish_name}</span>
          </div>
        )}

        {/* Meal Type Badge */}
        <div className="absolute top-2.5 left-2.5">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide backdrop-blur-xs ${mealConfig.bg} ${mealConfig.text} border border-black/5`}>
            {mealConfig.label}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          className={`absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-md transition-all cursor-pointer ${
            entry.is_favorite
              ? 'bg-rose-500 text-white shadow-xs scale-110'
              : 'bg-white/80 dark:bg-stone-900/80 text-stone-400 hover:text-rose-500'
          }`}
          title="Yêu thích"
        >
          <Heart className={`h-3.5 w-3.5 ${entry.is_favorite ? 'fill-white' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 line-clamp-1">
              {entry.dish_name}
            </h4>
            {entry.rating && entry.rating > 0 ? (
              <div className="flex items-center gap-0.5 text-xs font-bold text-amber-600 dark:text-amber-400 flex-shrink-0">
                <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                <span>{entry.rating.toFixed(1)}</span>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400">
            {entry.is_cooked_at_home ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                <Home className="h-3.5 w-3.5" />
                Tự nấu tại nhà
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-medium truncate">
                <Store className="h-3.5 w-3.5 text-stone-500 flex-shrink-0" />
                {entry.restaurant_name || 'Quán ăn chưa lưu'}
              </span>
            )}
          </div>

          {entry.location_address && !entry.is_cooked_at_home && (
            <p className="text-[11px] text-stone-400 flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              {entry.location_address}
            </p>
          )}

          {entry.review_notes && (
            <p className="pt-1 text-xs text-stone-600 dark:text-stone-300 italic line-clamp-2">
              &ldquo;{entry.review_notes}&rdquo;
            </p>
          )}
        </div>

        {/* Footer info & Delete */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-2">
            {entry.price !== null && entry.price !== undefined ? (
              <span className="font-bold text-emerald-800 dark:text-emerald-400">
                {formatVND(entry.price)}
              </span>
            ) : (
              <span>—</span>
            )}
            <span>•</span>
            <span className="text-[11px]">{formatDateVN(entry.entry_date)}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsEditOpen(true)}
              className="rounded p-1 text-stone-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors cursor-pointer"
              title="Chỉnh sửa món ăn"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className="rounded p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              title="Xoá nhật ký"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <EditFoodModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        entry={entry}
      />
    </div>
  );
}
