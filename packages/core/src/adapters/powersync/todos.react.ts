/**
 * Generic Todo & List Reactive Hook (PowerSync Offline-First Engine)
 *
 * Implements canonical offline-first list and task management.
 * Writes directly to local SQLite (WAL) with sub-second reactivity,
 * which PowerSync automatically syncs upstream to Supabase Postgres.
 */

import { toCompilableQuery } from '@powersync/drizzle-driver';
import { getActivePowerSyncDB, getDrizzleDB } from '@repo/core/adapters/powersync/database';
import { useQuery } from '@powersync/react';
import {
  lists,
  todos,
  type Todo,
  type TodoList,
} from '@repo/core/adapters/powersync/schema';
import { and, desc, eq } from 'drizzle-orm';
import { useCallback, useEffect, useMemo, useState } from 'react';

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

export interface UseTodosReturn {
  listId: string | null;
  todos: Todo[];
  isLoading: boolean;
  addTodo: (title: string, notes?: string) => Promise<void>;
  toggleTodo: (id: string, currentCompleted: boolean) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
}

export function useTodos(listName: string, userId?: string): UseTodosReturn {
  const [createdListId, setCreatedListId] = useState<string | null>(null);

  // 1. Reactive query to find or match the list
  const listQuery = useMemo(() => {
    if (!userId) return null;
    try {
      const db = getDrizzleDB();
      return toCompilableQuery(
        db
          .select()
          .from(lists)
          .where(and(eq(lists.name, listName), eq(lists.userId, userId)))
          .limit(1),
      );
    } catch {
      return null;
    }
  }, [listName, userId]);

  const { data: matchedLists, isLoading: isListLoading } = useQuery<TodoList>(
    listQuery || 'SELECT * FROM lists WHERE 1=0',
  );

  const activeListId = matchedLists?.[0]?.id || createdListId;

  // Auto-create list if it does not exist yet
  useEffect(() => {
    if (!userId || isListLoading || activeListId) return;

    let isMounted = true;
    const ensureList = async () => {
      try {
        const db = getDrizzleDB();
        const newListId = generateId();
        await db.insert(lists).values({
          id: newListId,
          userId,
          name: listName,
          color: null,
          createdAt: new Date().toISOString(),
        });
        if (isMounted) {
          setCreatedListId(newListId);
        }
      } catch (err) {
        console.warn(`[useTodos] Could not auto-create list ${listName}:`, err);
      }
    };

    void ensureList();

    return () => {
      isMounted = false;
    };
  }, [listName, userId, isListLoading, activeListId]);

  // 2. Reactive query for todos in the active list
  const todosQuery = useMemo(() => {
    if (!activeListId || !userId) return null;
    try {
      const db = getDrizzleDB();
      return toCompilableQuery(
        db
          .select()
          .from(todos)
          .where(and(eq(todos.listId, activeListId), eq(todos.userId, userId)))
          .orderBy(todos.isCompleted, desc(todos.createdAt)),
      );
    } catch {
      return null;
    }
  }, [activeListId, userId]);

  const { data: todoItems, isLoading: isTodosLoading } = useQuery<Todo>(
    todosQuery || 'SELECT * FROM todos WHERE 1=0',
  );

  // 3. Optimistic mutations
  const addTodo = useCallback(
    async (title: string, notes?: string) => {
      const trimmed = title.trim();
      if (!trimmed || !userId) return;

      let targetListId = activeListId;
      const db = getDrizzleDB();

      // Ensure list exists before adding
      if (!targetListId) {
        targetListId = generateId();
        await db.insert(lists).values({
          id: targetListId,
          userId,
          name: listName,
          color: null,
          createdAt: new Date().toISOString(),
        });
        setCreatedListId(targetListId);
      }

      await db.insert(todos).values({
        id: generateId(),
        listId: targetListId,
        userId,
        title: trimmed,
        notes: notes?.trim() || null,
        isCompleted: false,
        dueDate: null,
        createdAt: new Date().toISOString(),
        completedAt: null,
      });
    },
    [activeListId, listName, userId],
  );

  const toggleTodo = useCallback(async (id: string, currentCompleted: boolean) => {
    try {
      const db = getDrizzleDB();
      const nextState = !currentCompleted;
      await db
        .update(todos)
        .set({
          isCompleted: nextState,
          completedAt: nextState ? new Date().toISOString() : null,
        })
        .where(eq(todos.id, id));
    } catch (err) {
      console.warn(`[useTodos] Error toggling todo ${id}:`, err);
    }
  }, []);

  const deleteTodo = useCallback(async (id: string) => {
    try {
      const db = getDrizzleDB();
      await db.delete(todos).where(eq(todos.id, id));
    } catch (err) {
      console.warn(`[useTodos] Error deleting todo ${id}:`, err);
    }
  }, []);

  return {
    listId: activeListId,
    todos: todoItems || [],
    isLoading: isListLoading || isTodosLoading,
    addTodo,
    toggleTodo,
    deleteTodo,
  };
}
