import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { evaluateMaintenanceItem, formatDueCountdown } from '@/lib/maintenance';
import { ensureVapidConfigured, sendWebPush } from '@/lib/pushServer';
import type { MaintenanceItem } from '@/types/database';

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!ensureVapidConfigured()) {
    return NextResponse.json(
      { error: 'Missing VAPID keys' },
      { status: 500 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Missing SUPABASE_SERVICE_ROLE_KEY' },
      { status: 500 }
    );
  }

  const admin = createSupabaseAdmin(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: subscriptions, error: subError } = await admin
    .from('push_subscriptions')
    .select('id, user_id, endpoint, p256dh, auth');

  if (subError) {
    return NextResponse.json({ error: subError.message }, { status: 500 });
  }

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({ ok: true, usersNotified: 0, sent: 0 });
  }

  // Group subscriptions by user_id
  const subsByUser = new Map<string, typeof subscriptions>();
  for (const sub of subscriptions) {
    const list = subsByUser.get(sub.user_id) || [];
    list.push(sub);
    subsByUser.set(sub.user_id, list);
  }

  let usersNotified = 0;
  let sent = 0;

  for (const [userId, userSubs] of subsByUser.entries()) {
    const { data: items } = await admin
      .from('maintenance_items')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    const dueItems = ((items || []) as MaintenanceItem[])
      .map((item) => evaluateMaintenanceItem(item))
      .filter((e) => e.urgency === 'OVERDUE' || e.urgency === 'DUE_SOON')
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

    if (dueItems.length === 0) continue;

    const preview = dueItems
      .slice(0, 3)
      .map((e) => `${e.item.title} (${formatDueCountdown(e.daysUntilDue, e.isOdoDue)})`)
      .join(', ');
    const moreText =
      dueItems.length > 3 ? ` và ${dueItems.length - 3} việc khác` : '';

    const payload = {
      title: `HomeBase • ${dueItems.length} việc bảo trì cần chú ý`,
      body: `${preview}${moreText}`,
      url: '/app/maintenance',
      tag: 'homebase-daily-maintenance',
    };

    let userSent = false;
    for (const sub of userSubs) {
      const res = await sendWebPush(sub, payload);
      if (res.ok) {
        sent += 1;
        userSent = true;
      } else if (res.expired) {
        await admin.from('push_subscriptions').delete().eq('id', sub.id);
      }
    }
    if (userSent) usersNotified += 1;
  }

  return NextResponse.json({ ok: true, usersNotified, sent });
}
