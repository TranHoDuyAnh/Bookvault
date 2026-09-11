'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getShoppingLists, 
  createShoppingList, 
  updateShoppingList, 
  deleteShoppingList,
  getShoppingItems,
  createShoppingItem,
  updateShoppingItem,
  checkItem,
  deleteShoppingItem,
  clearCheckedItems
} from '@/services/shopping';
import { useUser } from './useUser';
import type { ShoppingList, ShoppingItem } from '@/types/database';

export function useShoppingLists() {
  const { user } = useUser();
  return useQuery({
    queryKey: ['shopping-lists', user?.id],
    queryFn: () => (user?.id ? getShoppingLists(user.id) : Promise.resolve([])),
    enabled: !!user?.id,
  });
}

export function useShoppingItems(listId: string | null) {
  return useQuery({
    queryKey: ['shopping-items', listId],
    queryFn: () => (listId ? getShoppingItems(listId) : Promise.resolve([])),
    enabled: !!listId,
  });
}

export function useCreateShoppingList() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  return useMutation({
    mutationFn: async (data: Partial<ShoppingList>) => {
      if (!user) throw new Error('Bạn cần đăng nhập.');
      return createShoppingList({ ...data, user_id: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
    },
  });
}

export function useUpdateShoppingList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ShoppingList> }) => {
      return updateShoppingList(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
    },
  });
}

export function useDeleteShoppingList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return deleteShoppingList(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
    },
  });
}

export function useCreateShoppingItem() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  return useMutation({
    mutationFn: async (data: Partial<ShoppingItem>) => {
      if (!user) throw new Error('Bạn cần đăng nhập.');
      return createShoppingItem({ ...data, user_id: user.id });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items', variables.list_id] });
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
    },
  });
}

export function useUpdateShoppingItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ShoppingItem> }) => {
      return updateShoppingItem(id, updates);
    },
    onSuccess: (_, variables) => {
      // Assuming we know list_id from context or we just invalidate everything
      queryClient.invalidateQueries({ queryKey: ['shopping-items'] });
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
    },
  });
}

export function useCheckShoppingItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, checked }: { id: string; checked: boolean }) => {
      return checkItem(id, checked);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items'] });
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
    },
  });
}

export function useDeleteShoppingItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return deleteShoppingItem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items'] });
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
    },
  });
}

export function useClearCheckedItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (listId: string) => {
      return clearCheckedItems(listId);
    },
    onSuccess: (_, listId) => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items', listId] });
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
    },
  });
}
