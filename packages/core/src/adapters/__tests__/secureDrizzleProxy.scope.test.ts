import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/sqlite-proxy';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  bond: {
    id: 'bond-1',
    user_id: 'user-1',
    entity_id: 'school-1',
    entity_type: 'SCHOOL',
    capacity: 'teacher',
    status: 'active',
  },
}));
vi.mock('../../store/useAuthStore', () => ({
  useAuthStore: { getState: () => ({ user: { id: 'user-1', school_id: 'school-1' } }) },
}));
vi.mock('../../store/scopeSession', () => ({
  useScopeSessionStore: { getState: () => ({ snapshot: { activeBond: state.bond } }) },
}));

import { classrooms, todos } from '../powersync/schema';
import {
  createSecureDrizzleProxy,
  registerPermissionValidator,
  resetSecureDrizzleState,
} from '../powersync/secureDrizzleProxy';

describe('secure Drizzle scope forwarding', () => {
  beforeEach(() => resetSecureDrizzleState());

  it('passes the active bond scope to the permission validator', async () => {
    const validator = vi.fn().mockResolvedValue(true);
    registerPermissionValidator(validator);
    const db = createSecureDrizzleProxy({ insert: () => ({ execute: async () => 'ok' }) });
    await db.insert({ _: { name: 'classrooms' } }).execute();
    expect(validator).toHaveBeenCalledWith(
      expect.objectContaining({
        userContext: expect.objectContaining({
          userId: 'user-1',
          activeEntityId: 'school-1',
          activeEntityType: 'SCHOOL',
          capacity: 'teacher',
        }),
      }),
    );
  });

  it('extracts a real Drizzle table name before calling the validator', async () => {
    const validator = vi.fn().mockResolvedValue(true);
    registerPermissionValidator(validator);
    const db = createSecureDrizzleProxy({ insert: () => ({ execute: async () => 'ok' }) });
    await expect(db.insert(classrooms).execute()).resolves.toBe('ok');
    expect(validator).toHaveBeenCalledWith(expect.objectContaining({ resourceType: 'Classrooms' }));
  });

  it('characterizes chained real Drizzle writes bypassing the current interceptor', async () => {
    const validator = vi.fn().mockResolvedValue(false);
    const driver = vi.fn().mockResolvedValue({ rows: [] });
    registerPermissionValidator(validator);
    const db = createSecureDrizzleProxy(drizzle(driver));

    await db
      .insert(todos)
      .values({ id: 'todo-1', listId: 'list-1', userId: 'user-1', title: 'test' });
    await db.update(todos).set({ title: 'changed' }).where(eq(todos.id, 'todo-1'));
    await db.delete(todos).where(eq(todos.id, 'todo-1'));

    expect(driver).toHaveBeenCalledTimes(3);
    expect(validator).not.toHaveBeenCalled();
  });
});
