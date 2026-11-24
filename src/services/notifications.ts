import type { NotificationReminder } from '@/types/database';
import { getUpcomingDates } from './importantDates';

export async function getGlobalNotifications(userId: string): Promise<NotificationReminder[]> {
  const notifications: NotificationReminder[] = [];

  // Check Upcoming Important Dates
  try {
    const upcomingDates = await getUpcomingDates(userId, 7); // next 7 days
    upcomingDates.forEach((d) => {
      notifications.push({
        id: `date_${d.id}`,
        type: 'IMPORTANT_DATE',
        title: `Sắp tới ngày: ${d.title}`,
        description: d.person_name ? `Ngày đặc biệt của ${d.person_name} (${d.event_date})` : `Sự kiện diễn ra vào ${d.event_date}`,
        dueDate: d.event_date,
        severity: 'warning',
        linkHref: '/app/dates',
        actionText: 'Xem lịch',
      });
    });
  } catch (err) {
    console.error('Error checking important dates notification:', err);
  }

  // Sort: urgent first, then warning, then info
  const severityRank: Record<string, number> = { urgent: 0, warning: 1, info: 2 };
  notifications.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);

  return notifications;
}
