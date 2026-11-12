/**
 * Generic Todo & List Reactive Hook (Web / Supabase Engine)
 *
 * Provides reactive list and task management for Web and non-PowerSync clients.
 * Reads/writes directly to Supabase Postgres (public.lists & public.todos)
 * with instant 0ms optimistic updates and local storage fallback.
 */

import { useCallback, useEffect, useState } from 'react';
import { supabaseClient } from '../supabaseClient';

export interface WebTodo {
  id: string;
  listId: string;
  userId: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  dueDate: string | null;
  priority: number;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface UseWebTodosReturn {
  listId: string | null;
  todos: WebTodo[];
  isLoading: boolean;
  addTodo: (title: string, notes?: string) => Promise<void>;
  toggleTodo: (id: string, currentCompleted: boolean) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const STORAGE_KEY_PREFIX = 'gurudevi_todos_';

export function useWebTodos(listName: string, userId?: string): UseWebTodosReturn {
  const [listId, setListId] = useState<string | null>(null);
  const [todos, setTodos] = useState<WebTodo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const storageKey = `${STORAGE_KEY_PREFIX}${listName}_${userId || 'guest'}`;

  // Helper to persist to localStorage for offline / guest fallback
  const persistLocal = useCallback(
    (items: WebTodo[]) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(storageKey, JSON.stringify(items));
        }
      } catch {
        // Ignore localStorage quota errors
      }
    },
    [storageKey],
  );

  // Load initial data
  useEffect(() => {
    let isCancelled = false;

    async function load() {
      setIsLoading(true);

      // 1. Try local storage first for instant hydration
      let localItems: WebTodo[] = [];
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const raw = localStorage.getItem(storageKey);
          if (raw) {
            localItems = JSON.parse(raw);
            if (!isCancelled) setTodos(localItems);
          }
        }
      } catch {
        // Ignore parse error
      }

      // If no valid user, stop here with local items
      if (!userId || userId === 'guest') {
        if (!isCancelled) setIsLoading(false);
        return;
      }

      // 2. Fetch from Supabase
      try {
        // Ensure or find list
        let activeListId: string | null = null;
        const { data: existingLists, error: listError } = await supabaseClient
          .from('lists')
          .select('id')
          .eq('user_id', userId)
          .eq('name', listName)
          .limit(1);

        if (!listError && existingLists && existingLists.length > 0 && existingLists[0]) {
          activeListId = existingLists[0].id;
        } else {
          // Create the list
          const newListId = generateId();
          const { data: createdList } = await supabaseClient
            .from('lists')
            .insert({
              id: newListId,
              user_id: userId,
              name: listName,
            })
            .select('id')
            .single();

          activeListId = createdList?.id ?? newListId;
        }

        if (isCancelled) return;
        setListId(activeListId);

        if (activeListId) {
          const { data: remoteTodos, error: todosError } = await supabaseClient
            .from('todos')
            .select('*')
            .eq('list_id', activeListId)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (!todosError && remoteTodos) {
            const mapped: WebTodo[] = remoteTodos.map((r: any) => ({
              id: r.id,
              listId: r.list_id,
              userId: r.user_id,
              title: r.title,
              description: r.description,
              isCompleted: Boolean(r.is_completed),
              dueDate: r.due_date,
              priority: r.priority ?? 0,
              position: r.position ?? 0,
              createdAt: r.created_at,
              updatedAt: r.updated_at,
            }));

            if (!isCancelled) {
              setTodos(mapped);
              persistLocal(mapped);
            }
          }
        }
      } catch {
        // Network drop or offline: fallback to local items
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    load();

    return () => {
      isCancelled = true;
    };
  }, [listName, userId, storageKey, persistLocal]);

  // 1. Add Todo with optimistic update
  const addTodo = useCallback(
    async (title: string, notes?: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;

      const newId = generateId();
      const now = new Date().toISOString();
      const currentListId = listId ?? generateId();

      const optimisticTodo: WebTodo = {
        id: newId,
        listId: currentListId,
        userId: userId || 'guest',
        title: trimmed,
        description: notes || null,
        isCompleted: false,
        dueDate: null,
        priority: 0,
        position: Date.now(),
        createdAt: now,
        updatedAt: now,
      };

      setTodos((prev) => {
        const next = [optimisticTodo, ...prev];
        persistLocal(next);
        return next;
      });

      if (!userId || userId === 'guest') return;

      try {
        await supabaseClient.from('todos').insert({
          id: newId,
          list_id: currentListId,
          user_id: userId,
          title: trimmed,
          description: notes || null,
          is_completed: false,
          created_at: now,
          updated_at: now,
        });
      } catch (err) {
        console.error('[useWebTodos] Failed to sync new todo upstream:', err);
      }
    },
    [listId, userId, persistLocal],
  );

  // 2. Toggle Todo with optimistic update
  const toggleTodo = useCallback(
    async (id: string, currentCompleted: boolean) => {
      const nextCompleted = !currentCompleted;
      const now = new Date().toISOString();

      setTodos((prev) => {
        const next = prev.map((t) =>
          t.id === id ? { ...t, isCompleted: nextCompleted, updatedAt: now } : t,
        );
        persistLocal(next);
        return next;
      });

      if (!userId || userId === 'guest') return;

      try {
        await supabaseClient
          .from('todos')
          .update({
            is_completed: nextCompleted,
            updated_at: now,
          })
          .eq('id', id)
          .eq('user_id', userId);
      } catch (err) {
        console.error('[useWebTodos] Failed to sync toggle upstream:', err);
      }
    },
    [userId, persistLocal],
  );

  // 3. Delete Todo with optimistic update
  const deleteTodo = useCallback(
    async (id: string) => {
      setTodos((prev) => {
        const next = prev.filter((t) => t.id !== id);
        persistLocal(next);
        return next;
      });

      if (!userId || userId === 'guest') return;

      try {
        await supabaseClient
          .from('todos')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);
      } catch (err) {
        console.error('[useWebTodos] Failed to delete todo upstream:', err);
      }
    },
    [userId, persistLocal],
  );

  return {
    listId,
    todos,
    isLoading,
    addTodo,
    toggleTodo,
    deleteTodo,
  };
}
