import webpush from 'web-push';

export interface WebPushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

export interface StoredPushSubscription {
  id?: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

let vapidConfigured = false;

export function ensureVapidConfigured(): boolean {
  if (vapidConfigured) return true;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:homebase@example.com';

  if (!publicKey || !privateKey) {
    return false;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
  return true;
}

export async function sendWebPush(
  sub: StoredPushSubscription,
  payload: WebPushPayload
): Promise<{ ok: boolean; expired?: boolean; error?: string }> {
  if (!ensureVapidConfigured()) {
    return { ok: false, error: 'VAPID keys chưa được cấu hình.' };
  }

  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      },
      JSON.stringify(payload)
    );
    return { ok: true };
  } catch (err: unknown) {
    const statusCode =
      typeof err === 'object' && err !== null && 'statusCode' in err
        ? (err as { statusCode?: number }).statusCode
        : undefined;

    if (statusCode === 404 || statusCode === 410) {
      return { ok: false, expired: true, error: 'Subscription expired' };
    }

    const message = err instanceof Error ? err.message : 'Push failed';
    return { ok: false, error: message };
  }
}
