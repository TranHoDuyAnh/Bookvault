'use client';

import React, { useState } from 'react';
import { Gift, Sparkles, Flame, Award, Calendar, CheckCircle2, History, Compass, HeartHandshake, Utensils, Home, BookOpen } from 'lucide-react';
import { useTodayQuest, useQuestHistory, useQuestStats } from '@/hooks/useMystery';
import { MysteryBoxCard, CATEGORY_ICONS } from '@/components/mystery/MysteryBoxCard';
import { QuestCompleteModal } from '@/components/mystery/QuestCompleteModal';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDateVN } from '@/lib/utils';

export default function MysteryBoxPage() {
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  const { data: todayQuest, isLoading: questLoading } = useTodayQuest();
  const { data: history = [], isLoading: historyLoading } = useQuestHistory();
  const { data: stats, isLoading: statsLoading } = useQuestStats();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Gift className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Mystery Box & Nhiệm Vụ Ngày
            </h1>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
            Mỗi ngày một nhiệm vụ bất ngờ giúp bạn thoát khỏi lối mòn và tận hưởng cuộc sống trọn vẹn.
          </p>
        </div>

        {/* Streak & XP Badges */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-2xl border border-amber-300 bg-amber-50 dark:bg-amber-950/60 px-4 py-2 text-xs font-bold text-amber-900 dark:text-amber-300 shadow-2xs">
            <Flame className="h-5 w-5 text-orange-500 animate-pulse fill-orange-500" />
            <div>
              <span className="block text-[10px] uppercase font-semibold text-amber-700">Chuỗi liên tiếp</span>
              <span className="text-base">{stats?.currentStreak || 0} ngày 🔥</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-2xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-4 py-2 text-xs font-bold text-emerald-900 dark:text-emerald-300 shadow-2xs">
            <Award className="h-5 w-5 text-emerald-600 fill-emerald-600" />
            <div>
              <span className="block text-[10px] uppercase font-semibold text-emerald-700">Tổng điểm</span>
              <span className="text-base">{stats?.totalPoints || 0} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Today Quest Interactive Card */}
      {questLoading ? (
        <Skeleton className="h-80 w-full rounded-3xl" />
      ) : (
        <MysteryBoxCard
          dailyQuest={todayQuest || null}
          onOpenCompleteModal={() => setIsCompleteModalOpen(true)}
        />
      )}

      {/* Completed Quests History Timeline */}
      <div className="rounded-3xl border border-[#e7e2d9] dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
          <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <History className="h-4 w-4 text-[#1e3a2f]" />
            Lịch sử thử thách đã qua ({history.filter((h) => h.is_completed).length})
          </h3>
        </div>

        {historyLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-500">
            Chưa có lịch sử nhiệm vụ. Hãy mở hộp quà hôm nay để bắt đầu! ✨
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => {
              const catConfig = item.quest?.category ? CATEGORY_ICONS[item.quest.category] || CATEGORY_ICONS.MINDFULNESS : CATEGORY_ICONS.MINDFULNESS;
              const CatIcon = catConfig.icon;

              return (
                <div
                  key={item.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border transition-all ${
                    item.is_completed
                      ? 'border-emerald-200 bg-emerald-50/30 dark:bg-stone-800/40 dark:border-stone-700'
                      : 'border-stone-200 bg-stone-50/50 dark:bg-stone-800/20 opacity-70'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl ${catConfig.color} flex-shrink-0 mt-0.5`}>
                      <CatIcon className="h-4 w-4" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                          {item.quest?.title}
                        </span>
                        <span className="text-[10px] font-semibold text-stone-400">
                          • {formatDateVN(item.assigned_date)}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-1">
                        {item.quest?.description}
                      </p>
                      {item.proof_note && (
                        <p className="text-xs text-emerald-800 dark:text-emerald-400 italic pt-0.5">
                          &ldquo;{item.proof_note}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                    {item.is_completed ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        +{item.quest?.points || 10} XP
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-stone-400">
                        Chưa hoàn thành
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quest Complete Modal */}
      <QuestCompleteModal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        dailyQuest={todayQuest || null}
      />
    </div>
  );
}
