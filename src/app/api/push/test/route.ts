import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ensureVapidConfigured, sendWebPush } from '@/lib/pushServer';

export async function POST() {
  if (!ensureVapidConfigured()) {
    return NextResponse.json(
      {
        error:
          'Chưa cấu hình NEXT_PUBLIC_VAPID_PUBLIC_KEY và VAPID_PRIVATE_KEY trên server.',
      },
      { status: 500 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!subs || subs.length === 0) {
    return NextResponse.json(
      { error: 'Thiết bị chưa đăng ký nhận thông báo.' },
      { status: 404 }
    );
  }

  let sent = 0;
  for (const sub of subs) {
    const res = await sendWebPush(sub, {
      title: 'HomeBase — Thông báo thử nghiệm',
      body: 'Kết nối thành công! Nhắc lịch bảo trì cuộc sống sẽ hiển thị tại đây.',
      url: '/app/maintenance',
      tag: 'homebase-test',
    });

    if (res.ok) {
      sent += 1;
    } else if (res.expired) {
      await supabase.from('push_subscriptions').delete().eq('id', sub.id);
    }
  }

  return NextResponse.json({ ok: true, sent });
}
