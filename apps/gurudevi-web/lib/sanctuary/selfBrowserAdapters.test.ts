import { afterEach, describe, expect, it } from 'vitest';
import {
  createReminder,
  deleteReminder,
  fetchReminders,
  saveWindDownRitual,
} from './selfBrowserAdapters';

describe('browser Self adapters', () => {
  afterEach(() => window.localStorage.clear());

  it('keeps personal records account-scoped and persists a reminder deletion', async () => {
    const reminder = await createReminder('account-a', {
      title: 'Pause',
      icon_type: 'bell',
    });
    await createReminder('account-b', { title: 'Other account', icon_type: 'bell' });

    await deleteReminder(reminder.id);

    await expect(fetchReminders('account-a')).resolves.toEqual([]);
    await expect(fetchReminders('account-b')).resolves.toHaveLength(1);
  });

  it('persists wind-down records only inside the given account namespace', async () => {
    await saveWindDownRitual('account-a', {
      went_well: 'Stayed present',
      to_release: 'The unfinished list',
      tomorrow_intent: 'Begin calmly',
    });

    expect(window.localStorage.getItem('gurudevi:web:self:v1:wind-down:account-a')).toContain(
      'Stayed present',
    );
    expect(window.localStorage.getItem('gurudevi:web:self:v1:wind-down:account-b')).toBeNull();
  });
});
