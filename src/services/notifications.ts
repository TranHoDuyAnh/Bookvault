import { createClient } from '@/lib/supabase/client';
import type { NotificationReminder } from '@/types/database';
import { getCleaningTasks } from './cleaning';
import { getUtilityBills } from './utilities';
import { getVehicles } from './vehicles';
import { getHomeItems } from './home';
import { getTodayQuest } from './mystery';
import { getUpcomingDates } from './importantDates';

export async function getGlobalNotifications(userId: string): Promise<NotificationReminder[]> {
  const notifications: NotificationReminder[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Check Cleaning Tasks
  try {
    const cleaningTasks = await getCleaningTasks(userId);
    cleaningTasks.forEach((task) => {
      const due = new Date(task.next_due_date);
      due.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        notifications.push({
          id: `cleaning_${task.id}`,
          type: 'CLEANING_DUE',
          title: `Đã quá hạn: ${task.title}`,
          description: `Đã trễ ${Math.abs(diffDays)} ngày so với lịch định kỳ (${task.frequency_days} ngày/lần).`,
          dueDate: task.next_due_date,
          severity: 'urgent',
          linkHref: '/app/cleaning',
          actionText: 'Dọn dẹp ngay',
        });
      } else if (diffDays <= 3) {
        notifications.push({
          id: `cleaning_${task.id}`,
          type: 'CLEANING_DUE',
          title: `Sắp đến hạn: ${task.title}`,
          description: diffDays === 0 ? 'Hạn vệ sinh là HÔM NAY!' : `Còn ${diffDays} ngày nữa là đến hạn vệ sinh.`,
          dueDate: task.next_due_date,
          severity: 'warning',
          linkHref: '/app/cleaning',
          actionText: 'Xem lịch dọn',
        });
      }
    });
  } catch (err) {
    console.error('Error checking cleaning notifications:', err);
  }

  // 2. Check Unpaid Utility Bills
  try {
    const bills = await getUtilityBills(userId, { isPaid: false });
    bills.forEach((bill) => {
      const due = new Date(bill.due_date);
      due.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        notifications.push({
          id: `utility_${bill.id}`,
          type: 'UTILITY_UNPAID',
          title: `Hoá đơn quá hạn: ${bill.title}`,
          description: `Chưa thanh toán ${new Intl.NumberFormat('vi-VN').format(bill.amount)}₫ (hạn đóng là ${bill.due_date}).`,
          dueDate: bill.due_date,
          severity: 'urgent',
          linkHref: '/app/utilities',
          actionText: 'Thanh toán ngay',
        });
      } else if (diffDays <= 5) {
        notifications.push({
          id: `utility_${bill.id}`,
          type: 'UTILITY_UNPAID',
          title: `Hoá đơn sắp tới hạn: ${bill.title}`,
          description: `Cần đóng ${new Intl.NumberFormat('vi-VN').format(bill.amount)}₫ (còn ${diffDays} ngày).`,
          dueDate: bill.due_date,
          severity: 'warning',
          linkHref: '/app/utilities',
          actionText: 'Đóng hoá đơn',
        });
      }
    });
  } catch (err) {
    console.error('Error checking utility notifications:', err);
  }

  // 3. Check Vehicles (Registration & Insurance)
  try {
    const vehicles = await getVehicles(userId);
    vehicles.forEach((v) => {
      if (v.registration_expiry_date) {
        const regDate = new Date(v.registration_expiry_date);
        regDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((regDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          notifications.push({
            id: `vehicle_reg_${v.id}`,
            type: 'VEHICLE_EXPIRY',
            title: `Đã hết hạn đăng kiểm: ${v.name}`,
            description: `Hạn đăng kiểm của xe (${v.license_plate || 'Chưa biển'}) đã hết! Hãy đi đăng kiểm sớm tránh bị phạt.`,
            dueDate: v.registration_expiry_date,
            severity: 'urgent',
            linkHref: '/app/vehicles',
            actionText: 'Xem xe',
          });
        } else if (diffDays <= 30) {
          notifications.push({
            id: `vehicle_reg_${v.id}`,
            type: 'VEHICLE_EXPIRY',
            title: `Sắp đến hạn đăng kiểm: ${v.name}`,
            description: `Hạn đăng kiểm còn ${diffDays} ngày nữa (${v.registration_expiry_date}).`,
            dueDate: v.registration_expiry_date,
            severity: 'warning',
            linkHref: '/app/vehicles',
            actionText: 'Đặt lịch đăng kiểm',
          });
        }
      }

      if (v.insurance_expiry_date) {
        const insDate = new Date(v.insurance_expiry_date);
        insDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((insDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          notifications.push({
            id: `vehicle_ins_${v.id}`,
            type: 'VEHICLE_EXPIRY',
            title: `Đã hết hạn bảo hiểm: ${v.name}`,
            description: `Bảo hiểm xe (${v.license_plate || 'Chưa biển'}) đã hết hạn vào ${v.insurance_expiry_date}.`,
            dueDate: v.insurance_expiry_date,
            severity: 'urgent',
            linkHref: '/app/vehicles',
            actionText: 'Gia hạn bảo hiểm',
          });
        } else if (diffDays <= 30) {
          notifications.push({
            id: `vehicle_ins_${v.id}`,
            type: 'VEHICLE_EXPIRY',
            title: `Sắp hết hạn bảo hiểm xe: ${v.name}`,
            description: `Bảo hiểm xe còn ${diffDays} ngày (${v.insurance_expiry_date}).`,
            dueDate: v.insurance_expiry_date,
            severity: 'warning',
            linkHref: '/app/vehicles',
            actionText: 'Gia hạn bảo hiểm',
          });
        }
      }
    });
  } catch (err) {
    console.error('Error checking vehicle notifications:', err);
  }

  // 4. Check Home Item Warranties
  try {
    const homeItems = await getHomeItems(userId);
    homeItems.forEach((item) => {
      if (item.warranty_end_date) {
        const wDate = new Date(item.warranty_end_date);
        wDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((wDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays <= 30) {
          notifications.push({
            id: `home_warranty_${item.id}`,
            type: 'WARRANTY_EXPIRY',
            title: `Sắp hết hạn bảo hành: ${item.name}`,
            description: `Bảo hành sẽ hết hạn trong ${diffDays} ngày tới (${item.warranty_end_date}).`,
            dueDate: item.warranty_end_date,
            severity: 'info',
            linkHref: '/app/home',
            actionText: 'Xem bảo hành',
          });
        }
      }
    });
  } catch (err) {
    console.error('Error checking home item notifications:', err);
  }

  // 5. Check Mystery Quest
  try {
    const todayQuest = await getTodayQuest(userId);
    if (todayQuest && !todayQuest.is_completed) {
      notifications.push({
        id: `mystery_${todayQuest.id}`,
        type: 'MYSTERY_QUEST',
        title: 'Hộp quà bí mật hôm nay chưa mở!',
        description: `Nhiệm vụ: "${todayQuest.quest?.title || 'Khám phá ngay'}" đang chờ bạn thực hiện.`,
        severity: 'info',
        linkHref: '/app/mystery',
        actionText: 'Mở hộp quà',
      });
    }
  } catch (err) {
    console.error('Error checking mystery quest notification:', err);
  }

  // 6. Check Upcoming Important Dates
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
