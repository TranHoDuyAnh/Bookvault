import { NextResponse } from 'next/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { differenceInCalendarDays, parseISO, startOfDay } from 'date-fns';
import { evaluateMaintenanceItem, formatDueCountdown } from '@/lib/maintenance';
import { ensureVapidConfigured, sendWebPush } from '@/lib/pushServer';
import type { ImportantDate, MaintenanceItem } from '@/types/database';

function getUpcomingImportantDates(dates: ImportantDate[], today: Date) {
  const todayStart = startOfDay(today);
  const year = todayStart.getFullYear();

  return dates
    .map((d) => {
      const eventDate = parseISO(d.event_date);
      let nextOccurrence = startOfDay(eventDate);
      if (d.is_recurring) {
        nextOccurrence = new Date(
          year,
          eventDate.getMonth(),
          eventDate.getDate()
        );
        if (nextOccurrence < todayStart) {
          nextOccurrence = new Date(
            year + 1,
            eventDate.getMonth(),
            eventDate.getDate()
          );
        }
      }
      const daysUntil = differenceInCalendarDays(nextOccurrence, todayStart);
      const windowDays = Math.max(1, d.reminder_days_before || 7);
      return { date: d, daysUntil, windowDays };
    })
    .filter((x) => x.daysUntil >= 0 && x.daysUntil <= x.windowDays)
    .sort((a, b) => a.daysUntil - b.daysUntil);
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!ensureVapidConfigured()) {
    return NextResponse.json({ error: 'Missing VAPID keys' }, { status: 500 });
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

  const subsByUser = new Map<string, typeof subscriptions>();
  for (const sub of subscriptions) {
    const list = subsByUser.get(sub.user_id) || [];
    list.push(sub);
    subsByUser.set(sub.user_id, list);
  }

  const today = new Date();
  let usersNotified = 0;
  let sent = 0;

  for (const [userId, userSubs] of subsByUser.entries()) {
    const [{ data: maintRows }, { data: dateRows }] = await Promise.all([
      admin
        .from('maintenance_items')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true),
      admin.from('important_dates').select('*').eq('user_id', userId),
    ]);

    const dueMaint = ((maintRows || []) as MaintenanceItem[])
      .map((item) => evaluateMaintenanceItem(item, today))
      .filter((e) => e.urgency === 'OVERDUE' || e.urgency === 'DUE_SOON')
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

    const upcomingDates = getUpcomingImportantDates(
      (dateRows || []) as ImportantDate[],
      today
    );

    const totalCount = dueMaint.length + upcomingDates.length;
    if (totalCount === 0) continue;

    const snippets: string[] = [];
    dueMaint.slice(0, 2).forEach((e) => {
      snippets.push(
        `${e.item.title} (${formatDueCountdown(e.daysUntilDue, e.isOdoDue)})`
      );
    });
    upcomingDates.slice(0, 2).forEach((d) => {
      const when =
        d.daysUntil === 0
          ? 'Hôm nay'
          : d.daysUntil === 1
          ? 'Ngày mai'
          : `Còn ${d.daysUntil} ngày`;
      snippets.push(`${d.date.title} (${when})`);
    });

    const extraCount = totalCount - snippets.length;
    const bodyText =
      snippets.join(' • ') +
      (extraCount > 0 ? ` và ${extraCount} nhắc nhở khác` : '');

    const targetUrl =
      dueMaint.length > 0 && upcomingDates.length === 0
        ? '/app/maintenance'
        : upcomingDates.length > 0 && dueMaint.length === 0
        ? '/app/dates'
        : '/app/dashboard';

    const payload = {
      title: `HomeBase • ${totalCount} nhắc nhở hôm nay`,
      body: bodyText,
      url: targetUrl,
      tag: 'homebase-daily-reminders',
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
