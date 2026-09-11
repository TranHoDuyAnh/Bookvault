'use client';

import { useQuery } from '@tanstack/react-query';
import { getGlobalNotifications } from '@/services/notifications';
import { useUser } from './useUser';

export function useGlobalNotifications() {
  const { user } = useUser();
  const userId = user?.id;

  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => (userId ? getGlobalNotifications(userId) : Promise.resolve([])),
    enabled: !!userId,
    refetchInterval: 1000 * 60 * 5, // auto refresh every 5 minutes
  });
}
