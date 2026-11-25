'use client';

import React, { useEffect, useState } from 'react';
import { Bell, BellOff, CheckCircle2, Loader2, Send, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationCard() {
  const [status, setStatus] = useState<
    'checking' | 'unsupported' | 'ios-not-installed' | 'disabled' | 'enabled'
  >('checking');
  const [isBusy, setIsBusy] = useState(false);

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

  useEffect(() => {
    let cancelled = false;

    async function checkSupport() {
      if (typeof window === 'undefined') return;

      const isIos =
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        Boolean((navigator as unknown as { standalone?: boolean }).standalone);

      if (isIos && !isStandalone) {
        if (!cancelled) setStatus('ios-not-installed');
        return;
      }

      if (
        !('serviceWorker' in navigator) ||
        !('PushManager' in window) ||
        !('Notification' in window)
      ) {
        if (!cancelled) setStatus('unsupported');
        return;
      }

      try {
        const reg = await navigator.serviceWorker.getRegistration('/sw.js');
        const sub = reg ? await reg.pushManager.getSubscription() : null;
        if (!cancelled) {
          setStatus(sub ? 'enabled' : 'disabled');
        }
      } catch {
        if (!cancelled) setStatus('disabled');
      }
    }

    checkSupport();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleEnable = async () => {
    if (!vapidPublicKey) {
      toast.error('Chưa cấu hình NEXT_PUBLIC_VAPID_PUBLIC_KEY trên server.');
      return;
    }

    setIsBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Bạn đã từ chối quyền thông báo trên thiết bị này.');
        return;
      }

      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const existing = await reg.pushManager.getSubscription();
      const keyBytes = urlBase64ToUint8Array(vapidPublicKey);
      const subscription =
        existing ||
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: keyBytes.buffer as ArrayBuffer,
        }));

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Không thể lưu đăng ký thông báo.');
      }

      setStatus('enabled');
      toast.success('Đã bật thông báo đẩy trên thiết bị này!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể bật thông báo.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleDisable = async () => {
    setIsBusy(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration('/sw.js');
      const sub = reg ? await reg.pushManager.getSubscription() : null;
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setStatus('disabled');
      toast.success('Đã tắt thông báo trên thiết bị này.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể tắt thông báo.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleSendTest = async () => {
    setIsBusy(true);
    try {
      const res = await fetch('/api/push/test', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (res.status === 404) {
        setStatus('disabled');
      }
      if (!res.ok) {
        throw new Error(data.error || 'Gửi thử thất bại.');
      }
      toast.success('Đã gửi thông báo thử! Kiểm tra màn hình iPhone nhé.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể gửi thử.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div
      id="push"
      className="rounded-lg border border-border bg-card p-5 sm:p-6 shadow-2xs space-y-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-text-secondary" />
            Thông báo trên iPhone / PWA
          </h3>
          <p className="text-[13px] text-text-muted">
            Nhận tất cả thông báo nhắc nhở (Bảo trì cuộc sống, Ngày quan trọng...) trực tiếp trên màn hình khóa lúc 8:00 sáng mỗi ngày.
          </p>
        </div>

        {status === 'enabled' && (
          <Badge variant="success">
            <CheckCircle2 className="h-3 w-3" />
            Đang bật
          </Badge>
        )}
      </div>

      {status === 'checking' ? (
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Đang kiểm tra khả năng hỗ trợ của thiết bị...
        </div>
      ) : status === 'ios-not-installed' ? (
        <div className="rounded-lg border border-warning/30 bg-warning-subtle/50 p-3.5 text-xs text-foreground leading-relaxed">
          Bạn đang mở bằng trình duyệt Safari. Để nhận thông báo trên iPhone, hãy mở ứng dụng từ icon <strong>HomeBase</strong> ngoài Màn hình chính (PWA).
        </div>
      ) : status === 'unsupported' ? (
        <div className="rounded-lg border border-border bg-secondary/40 p-3.5 text-xs text-text-muted">
          Trình duyệt hoặc thiết bị hiện tại chưa hỗ trợ Web Push (cần iOS 16.4+ chạy qua HTTPS từ Màn hình chính).
        </div>
      ) : status === 'enabled' ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSendTest}
            disabled={isBusy}
          >
            <Send className="h-3.5 w-3.5" />
            Gửi thử thông báo
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDisable}
            disabled={isBusy}
            className="text-text-muted hover:text-destructive"
          >
            <BellOff className="h-3.5 w-3.5" />
            Tắt trên thiết bị này
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={handleEnable}
            disabled={isBusy}
          >
            {isBusy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Bell className="h-3.5 w-3.5" />
            )}
            Bật thông báo trên thiết bị này
          </Button>
        </div>
      )}
    </div>
  );
}
