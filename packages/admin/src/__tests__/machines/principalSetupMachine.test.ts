import {
  clearPrincipalSetupSnapshot,
  createPrincipalSetupActor,
  getPrincipalSetupStorageKey,
  loadPrincipalSetupSnapshot,
  principalSetupMachine,
} from '@repo/admin/machines/principalSetupMachine';
import { storage } from '@repo/core/logic/managers/StorageManager';
import { beforeEach, describe, expect, it } from 'vitest';
import { createActor } from 'xstate';

describe('PrincipalSetupMachine v6', () => {
  beforeEach(() => {
    storage.clearAll();
  });

  it('initializes in welcome state with clean context', () => {
    const actor = createActor(principalSetupMachine);
    actor.start();

    const snapshot = actor.getSnapshot();
    expect(snapshot.value).toBe('welcome');
    expect(snapshot.context.step).toBe(0);
    expect(snapshot.context.schoolName).toBe('');
    expect(snapshot.context.facultyInvites).toEqual([]);
  });

  it('advances to school_profile on START_SETUP', () => {
    const actor = createActor(principalSetupMachine);
    actor.start();

    actor.send({ type: 'START_SETUP' });
    expect(actor.getSnapshot().value).toBe('school_profile');
    expect(actor.getSnapshot().context.step).toBe(1);
  });

  it('rejects empty school name with descriptive error', () => {
    const actor = createActor(principalSetupMachine);
    actor.start();
    actor.send({ type: 'START_SETUP' });

    actor.send({
      type: 'SET_SCHOOL_PROFILE',
      schoolName: '   ',
      schoolType: 'k12',
    });

    expect(actor.getSnapshot().value).toBe('school_profile');
    expect(actor.getSnapshot().context.error).toBe('School name is required');
  });

  it('advances through school_profile and domain_claim to faculty_invites', () => {
    const actor = createActor(principalSetupMachine);
    actor.start();
    actor.send({ type: 'START_SETUP' });

    actor.send({
      type: 'SET_SCHOOL_PROFILE',
      schoolName: 'Saraswati Academy',
      schoolType: 'sanctuary',
    });

    expect(actor.getSnapshot().value).toBe('domain_claim');
    expect(actor.getSnapshot().context.step).toBe(2);
    expect(actor.getSnapshot().context.schoolName).toBe('Saraswati Academy');

    actor.send({
      type: 'CLAIM_DOMAIN',
      domain: 'saraswati.edu',
    });

    expect(actor.getSnapshot().value).toBe('faculty_invites');
    expect(actor.getSnapshot().context.step).toBe(3);
    expect(actor.getSnapshot().context.domain).toBe('saraswati.edu');
  });

  it('collects faculty invitations and activates school', () => {
    const actor = createActor(principalSetupMachine);
    actor.start();
    actor.send({ type: 'START_SETUP' });
    actor.send({
      type: 'SET_SCHOOL_PROFILE',
      schoolName: 'EdLove Foundation School',
      schoolType: 'k12',
    });
    actor.send({
      type: 'CLAIM_DOMAIN',
      domain: 'edlove.org',
    });

    actor.send({
      type: 'ADD_FACULTY_INVITE',
      email: 'lead.teacher@edlove.org',
    });

    actor.send({
      type: 'ADD_FACULTY_INVITE',
      email: 'mentor@edlove.org',
    });

    expect(actor.getSnapshot().context.facultyInvites).toEqual([
      'lead.teacher@edlove.org',
      'mentor@edlove.org',
    ]);

    actor.send({ type: 'ACTIVATE_SCHOOL' });
    expect(actor.getSnapshot().value).toBe('activated');
    expect(actor.getSnapshot().context.step).toBe(4);
  });

  it('persists and restores setup progress across app launches', () => {
    const userId = 'principal-42';
    const actor1 = createPrincipalSetupActor(userId);

    actor1.send({ type: 'START_SETUP' });
    actor1.send({
      type: 'SET_SCHOOL_PROFILE',
      schoolName: 'Nalanda Sanctuary',
      schoolType: 'higher_ed',
    });

    // Check storage has persisted snapshot
    const raw = storage.getString(getPrincipalSetupStorageKey(userId));
    expect(raw).toBeTruthy();

    const snapshot = loadPrincipalSetupSnapshot(userId);
    expect(snapshot).toBeTruthy();

    // Relaunch app with restored actor
    const actor2 = createPrincipalSetupActor(userId);
    expect(actor2.getSnapshot().value).toBe('domain_claim');
    expect(actor2.getSnapshot().context.schoolName).toBe('Nalanda Sanctuary');
    expect(actor2.getSnapshot().context.step).toBe(2);

    // Clean up
    clearPrincipalSetupSnapshot(userId);
    expect(storage.getString(getPrincipalSetupStorageKey(userId))).toBeUndefined();
  });
});
