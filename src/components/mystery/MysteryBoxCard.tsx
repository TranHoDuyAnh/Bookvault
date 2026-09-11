'use client';

import React, { useState } from 'react';
import { Gift, Sparkles, CheckCircle2, Flame, Award, ArrowRight, Share2, Compass, HeartHandshake, Utensils, Home, BookOpen } from 'lucide-react';
import type { UserDailyQuest, QuestCategory } from '@/types/database';
import { Button } from '@/components/ui/Button';

export const CATEGORY_ICONS: Record<QuestCategory, { icon: any; label: string; color: string }> = {
  FOOD: { icon: Utensils, label: 'Ẩm thực', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  MINDFULNESS: { icon: HeartHandshake, label: 'Tâm trí & Sức khoẻ', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
  HOME: { icon: Home, label: 'Nhà cửa & Không gian', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
  ADVENTURE: { icon: Compass, label: 'Khám phá & Trải nghiệm', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
  READING: { icon: BookOpen, label: 'Đọc sách & Tri thức', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' },
};

export function MysteryBoxCard({
  dailyQuest,
  onOpenCompleteModal,
}: {
  dailyQuest: UserDailyQuest | null;
  onOpenCompleteModal: () => void;
}) {
  const [isRevealed, setIsRevealed] = useState(dailyQuest?.is_completed || false);
  const [isUnboxing, setIsUnboxing] = useState(false);

  const quest = dailyQuest?.quest;
  const categoryInfo = quest?.category ? CATEGORY_ICONS[quest.category] || CATEGORY_ICONS.MINDFULNESS : CATEGORY_ICONS.MINDFULNESS;
  const CategoryIcon = categoryInfo.icon;

  const handleUnbox = () => {
    setIsUnboxing(true);
    setTimeout(() => {
      setIsRevealed(true);
      setIsUnboxing(false);
    }, 700);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-600/30 bg-gradient-to-b from-[#FAF8F5] to-[#F3EEE7] dark:from-stone-900 dark:to-stone-950 p-6 sm:p-8 shadow-lg">
      {/* Background ambient glow */}
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      {!isRevealed && !dailyQuest?.is_completed ? (
        /* Box is Closed - Click to Unbox */
        <div className="flex flex-col items-center justify-center text-center space-y-6 py-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 dark:bg-amber-950/50 px-3.5 py-1 text-xs font-bold text-amber-800 dark:text-amber-300 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span>Nhiệm vụ bí mật hôm nay đã sẵn sàng!</span>
          </div>

          <div
            onClick={handleUnbox}
            className={`group relative flex h-36 w-36 items-center justify-center rounded-3xl bg-gradient-to-tr from-[#1e3a2f] via-[#2d5a47] to-[#3d705c] text-white shadow-2xl cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 ${
              isUnboxing ? 'animate-bounce scale-110' : 'animate-pulse'
            }`}
          >
            <Gift className="h-16 w-16 stroke-[1.5] group-hover:rotate-12 transition-transform duration-300" />
            <div className="absolute inset-0 rounded-3xl ring-4 ring-emerald-400/30 group-hover:ring-emerald-400/60" />
          </div>

          <div className="space-y-1 max-w-sm">
            <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
              Hộp quà Bí Mật Hôm Nay
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Mỗi ngày là một bất ngờ mới để trải nghiệm cuộc sống đa sắc màu và tạo nên những kỷ niệm đáng nhớ.
            </p>
          </div>

          <Button
            size="lg"
            onClick={handleUnbox}
            disabled={isUnboxing}
            className="gap-2 font-bold px-8 shadow-md"
          >
            <Sparkles className="h-4 w-4" />
            {isUnboxing ? 'Đang mở hộp quà...' : 'Mở Hộp Quà Bí Mật 🎁'}
          </Button>
        </div>
      ) : (
        /* Box is Revealed - Quest Card */
        <div className="space-y-6">
          {/* Top header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 dark:border-stone-800 pb-4">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${categoryInfo.color}`}>
                <CategoryIcon className="h-3.5 w-3.5" />
                {categoryInfo.label}
              </span>
              <span className="text-xs font-semibold text-stone-500">
                +{quest?.points || 10} điểm kinh nghiệm
              </span>
            </div>

            {dailyQuest?.is_completed ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Đã hoàn thành xuất sắc!
              </span>
            ) : (
              <span className="text-xs font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-200">
                Đang chờ thực hiện
              </span>
            )}
          </div>

          {/* Quest Content */}
          <div className="space-y-3">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 leading-snug">
              {quest?.title}
            </h3>
            <p className="text-sm sm:text-base text-stone-700 dark:text-stone-300 leading-relaxed">
              {quest?.description}
            </p>
          </div>

          {/* Proof / Reflection if completed */}
          {dailyQuest?.is_completed && dailyQuest.proof_note && (
            <div className="rounded-2xl bg-white/80 dark:bg-stone-900/80 border border-[#e7e2d9] dark:border-stone-800 p-4 space-y-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Nhật ký hoàn thành của bạn:
              </span>
              <p className="text-xs sm:text-sm italic text-stone-700 dark:text-stone-300">
                &ldquo;{dailyQuest.proof_note}&rdquo;
              </p>
              {dailyQuest.proof_image_url && (
                <div className="pt-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={dailyQuest.proof_image_url}
                    alt="Proof"
                    className="h-36 rounded-xl object-cover border border-stone-200"
                  />
                </div>
              )}
            </div>
          )}

          {/* Action button */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            {!dailyQuest?.is_completed ? (
              <Button
                size="lg"
                onClick={onOpenCompleteModal}
                className="w-full sm:w-auto gap-2 font-bold px-8 shadow-md"
              >
                <CheckCircle2 className="h-5 w-5" />
                Check-in hoàn thành nhiệm vụ &rarr;
              </Button>
            ) : (
              <p className="text-xs text-stone-500 font-medium">
                Tuyệt vời! Bạn đã duy trì được chuỗi phát triển bản thân hôm nay. Hẹn gặp lại bạn vào 00:00 ngày mai! ✨
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
