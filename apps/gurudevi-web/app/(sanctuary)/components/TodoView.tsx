/**
 * TodoView — Web Reusable Generic Offline-First Todo List Component
 *
 * Provides full feature parity with the Native TodoView:
 * mounts on any web dashboard (Founder, Teacher, Student, Tomorrow Prep)
 * with optimistic updates, filter states, remaining counts, and active world dressing.
 */

import React, { useState, useMemo } from 'react';
import { useWebTodos, type WebTodo } from '@repo/core/todos';
import styles from './todo-view.module.css';

export interface TodoViewProps {
  listName: string;
  userId?: string;
  displayTitle?: string;
  className?: string;
}

type FilterType = 'all' | 'active' | 'completed';

export function TodoView({
  listName,
  userId,
  displayTitle,
  className,
}: Readonly<TodoViewProps>) {
  const { todos, isLoading, addTodo, toggleTodo, deleteTodo } = useWebTodos(
    listName,
    userId,
  );

  const [inputTitle, setInputTitle] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingCount = useMemo(
    () => todos.filter((t) => !t.isCompleted).length,
    [todos],
  );
  const completedCount = useMemo(
    () => todos.length - pendingCount,
    [todos.length, pendingCount],
  );
  const progressPct = useMemo(
    () => (todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0),
    [todos.length, completedCount],
  );

  const filteredTodos = useMemo(() => {
    if (filter === 'active') return todos.filter((t) => !t.isCompleted);
    if (filter === 'completed') return todos.filter((t) => t.isCompleted);
    return todos;
  }, [todos, filter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputTitle.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    setInputTitle('');
    try {
      await addTodo(trimmed);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${styles.wrapper} ${className || ''}`} aria-label={displayTitle || listName}>
      {/* Header bar */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.headerTitle}>{displayTitle || listName}</h2>
          <span className={styles.badge}>
            {pendingCount} remaining
          </span>
        </div>

        {completedCount > 0 && (
          <span className={styles.badge} style={{ opacity: 0.8 }}>
            {completedCount} completed ({progressPct}%)
          </span>
        )}
      </div>

      {/* Progress Track */}
      {todos.length > 0 && (
        <div className={styles.progressContainer}>
          <div className={styles.progressTrack}>
            <div className={styles.progressBar} style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      )}

      {/* Quick-add inline input */}
      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <input
          type="text"
          className={styles.inputField}
          placeholder={`Add priority to ${displayTitle || listName}...`}
          value={inputTitle}
          onChange={(e) => setInputTitle(e.target.value)}
          disabled={isSubmitting}
        />
        <button
          type="submit"
          className={styles.addButton}
          disabled={!inputTitle.trim() || isSubmitting}
        >
          {isSubmitting ? 'Adding...' : '+ Add'}
        </button>
      </form>

      {/* Filter Tabs */}
      {todos.length > 0 && (
        <div className={styles.filtersBar}>
          <button
            type="button"
            className={styles.filterBtn}
            data-active={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            All ({todos.length})
          </button>
          <button
            type="button"
            className={styles.filterBtn}
            data-active={filter === 'active'}
            onClick={() => setFilter('active')}
          >
            Active ({pendingCount})
          </button>
          <button
            type="button"
            className={styles.filterBtn}
            data-active={filter === 'completed'}
            onClick={() => setFilter('completed')}
          >
            Done ({completedCount})
          </button>
        </div>
      )}

      {/* Items List */}
      {isLoading ? (
        <div className={styles.emptyState}>Loading tasks...</div>
      ) : filteredTodos.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyStateIcon}>🌱</span>
          <p style={{ margin: 0, fontWeight: 600 }}>
            {filter === 'completed'
              ? 'No completed tasks yet.'
              : filter === 'active'
              ? 'All tasks completed! Take a mindful breath.'
              : 'No items in this list yet.'}
          </p>
          <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>
            {filter === 'all' && 'Add an intention above to begin.'}
          </span>
        </div>
      ) : (
        <ul className={styles.todoList}>
          {filteredTodos.map((todo: WebTodo) => (
            <li key={todo.id} className={styles.todoItem}>
              <div className={styles.todoLeft}>
                <input
                  type="checkbox"
                  className={styles.checkboxInput}
                  checked={todo.isCompleted}
                  onChange={() => toggleTodo(todo.id, todo.isCompleted)}
                  aria-label={`Mark "${todo.title}" as ${todo.isCompleted ? 'incomplete' : 'complete'}`}
                />
                <span
                  className={`${styles.todoTitle} ${
                    todo.isCompleted ? styles.todoTitleCompleted : ''
                  }`}
                >
                  {todo.title}
                </span>
              </div>

              <button
                type="button"
                className={styles.deleteButton}
                onClick={() => deleteTodo(todo.id)}
                title="Delete task"
                aria-label={`Delete task "${todo.title}"`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
