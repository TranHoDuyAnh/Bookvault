import * as webpushNamespace from 'web-push';

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

type WebPushModule = typeof webpushNamespace & {
  default?: typeof webpushNamespace;
};

function getWebPush(): typeof webpushNamespace {
  const mod = webpushNamespace as WebPushModule;
  if (typeof mod.sendNotification === 'function') {
    return mod;
  }
  if (mod.default && typeof mod.default.sendNotification === 'function') {
    return mod.default;
  }
  return mod;
}

let vapidConfigured = false;

export function ensureVapidConfigured(): { ok: boolean; error?: string } {
  if (vapidConfigured) return { ok: true };

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  let subject =
    process.env.VAPID_SUBJECT?.trim() || 'mailto:homebase@example.com';

  if (!publicKey || !privateKey) {
    return {
      ok: false,
      error:
        'Chưa cấu hình NEXT_PUBLIC_VAPID_PUBLIC_KEY hoặc VAPID_PRIVATE_KEY trên server.',
    };
  }

  if (!subject.startsWith('mailto:') && !subject.startsWith('https://')) {
    subject = `mailto:${subject}`;
  }

  try {
    const wp = getWebPush();
    wp.setVapidDetails(subject, publicKey, privateKey);
    vapidConfigured = true;
    return { ok: true };
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : 'Cấu hình VAPID keys không hợp lệ.';
    return { ok: false, error: `Lỗi VAPID: ${msg}` };
  }
}

export async function sendWebPush(
  sub: StoredPushSubscription,
  payload: WebPushPayload
): Promise<{ ok: boolean; expired?: boolean; error?: string }> {
  const vapid = ensureVapidConfigured();
  if (!vapid.ok) {
    return { ok: false, error: vapid.error || 'VAPID keys chưa được cấu hình.' };
  }

  try {
    const wp = getWebPush();
    await wp.sendNotification(
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

    const body =
      typeof err === 'object' && err !== null && 'body' in err
        ? String((err as { body?: unknown }).body || '')
        : '';
    const message = err instanceof Error ? err.message : 'Push failed';
    return {
      ok: false,
      error: body ? `${message} (${body})` : message,
    };
  }
}
