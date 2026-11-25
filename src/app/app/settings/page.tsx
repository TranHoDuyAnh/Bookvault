'use client';

import React, { useState } from 'react';
import { User, Mail, LogOut, Check, Loader2, BookOpen, Sun, Moon, Laptop } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useTheme } from '@/contexts/ThemeContext';
import { updateProfile, signOut } from '@/services/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/ui/PageHeader';
import { PushNotificationCard } from '@/components/settings/PushNotificationCard';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, profile, loading } = useUser();
  const { theme, setTheme } = useTheme();
  const [displayNameOverride, setDisplayNameOverride] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const displayName = displayNameOverride ?? profile?.display_name ?? '';

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      await updateProfile(user.id, {
        display_name: displayName.trim(),
        avatar_url: profile?.avatar_url || undefined,
      });
      toast.success('Đã cập nhật thông tin hồ sơ thành công!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi khi cập nhật hồ sơ.';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Đã đăng xuất.');
      window.location.href = '/login';
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi đăng xuất.';
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-text-muted">
        Đang tải cài đặt...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="Cài đặt & Tài khoản"
        description="Quản lý thông tin cá nhân, giao diện và tài khoản HomeBase."
      />

      {/* Profile Form */}
      <div className="rounded-lg border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-4 border-b border-border pb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-foreground font-semibold text-xl border border-border shrink-0">
            {displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-foreground truncate">
              {displayName || 'Người dùng HomeBase'}
            </h3>
            <p className="text-xs text-text-muted truncate">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Tên hiển thị"
            placeholder="Ví dụ: Nguyễn Văn A"
            value={displayName}
            onChange={(e) => setDisplayNameOverride(e.target.value)}
            leftIcon={<User className="h-4 w-4" />}
            required
          />

          <Input
            label="Địa chỉ Email (Supabase Auth)"
            value={user?.email || ''}
            disabled
            leftIcon={<Mail className="h-4 w-4" />}
          />

          <div className="flex justify-end pt-1">
            <Button type="submit" disabled={isSaving} size="sm">
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Appearance / Theme Settings */}
      <div className="rounded-lg border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Giao diện hiển thị
          </h3>
          <p className="text-[13px] text-text-muted mt-0.5">
            Chọn chế độ sáng, tối hoặc tự động đồng bộ theo hệ điều hành.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'light' as const, label: 'Sáng', icon: Sun },
            { id: 'dark' as const, label: 'Tối', icon: Moon },
            { id: 'system' as const, label: 'Hệ thống', icon: Laptop },
          ].map((opt) => {
            const isSelected = theme === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTheme(opt.id)}
                className={`flex flex-col items-center justify-center p-3.5 rounded-lg border transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-secondary text-foreground font-semibold'
                    : 'border-border bg-card text-text-secondary hover:bg-accent hover:text-foreground'
                }`}
              >
                <opt.icon className="h-4 w-4 mb-1.5" />
                <span className="text-xs">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Push Notifications for iPhone / PWA */}
      <PushNotificationCard />

      {/* App Information Box */}
      <div className="rounded-lg border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-2.5">
        <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-text-secondary" />
          Về ứng dụng HomeBase
        </h3>
        <p className="text-[13px] text-text-muted leading-relaxed">
          HomeBase là ứng dụng quản lý cuộc sống cá nhân giúp bạn tổ chức tủ sách số, giải trí và các ngày quan trọng một cách tối giản, nhất quán.
        </p>
        <div className="pt-1 text-xs text-text-muted">
          Phiên bản 1.0.0 • Monochrome Design System
        </div>
      </div>

      {/* Danger Zone / Logout */}
      <div className="rounded-lg border border-destructive/30 bg-destructive-subtle/40 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-semibold text-foreground">
            Đăng xuất khỏi thiết bị
          </h4>
          <p className="text-[13px] text-text-muted mt-0.5">
            Kết thúc phiên làm việc hiện tại trên trình duyệt này.
          </p>
        </div>

        <Button variant="destructive" onClick={handleSignOut} size="sm">
          <LogOut className="h-4 w-4" />
          Đăng xuất tài khoản
        </Button>
      </div>
    </div>
  );
}
