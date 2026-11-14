import {
  CAPABILITY_MANIFEST,
  declaredCapabilities,
  declaredCapability,
  getCapabilitiesForCapacity,
} from '@repo/core/logic/registry/capabilityManifest';
import { describe, expect, it } from 'vitest';

describe('capability access-class declarations', () => {
  it('declares bounded access classes for every shipped capability', () => {
    expect(CAPABILITY_MANIFEST).not.toHaveLength(0);
    for (const declaration of CAPABILITY_MANIFEST) {
      expect(['public', 'account-required', 'open', 'scoped', 'private']).toContain(
        declaration.accessClass,
      );
    }
  });

  it('keeps self capabilities account-bound and attendance scope-bound', () => {
    expect(declaredCapability('fire_journal')?.accessClass).toBe('account-required');
    expect(declaredCapability('mood_lotus')?.accessClass).toBe('account-required');
    expect(declaredCapability('attendance')?.accessClass).toBe('scoped');
    expect(declaredCapabilities('self', 'browser').map((item) => item.id)).toEqual([
      'fire_journal',
      'mood_lotus',
    ]);
  });

  it('declares role-specific workspace capabilities and resolves them by capacity', () => {
    expect(declaredCapability('climate_sensing')?.accessClass).toBe('scoped');
    expect(declaredCapability('learning_studio')?.accessClass).toBe('scoped');
    expect(declaredCapability('family_bridge')?.accessClass).toBe('scoped');

    // Teacher has access to attendance, climate_sensing, learning_studio, family_bridge
    const teacherCaps = getCapabilitiesForCapacity('workspace', 'browser', 'teacher').map(
      (c) => c.id,
    );
    expect(teacherCaps).toContain('attendance');
    expect(teacherCaps).toContain('climate_sensing');
    expect(teacherCaps).toContain('learning_studio');
    expect(teacherCaps).toContain('family_bridge');

    // Principal has access to attendance and climate_sensing, but not student learning studio
    const principalCaps = getCapabilitiesForCapacity('workspace', 'browser', 'principal').map(
      (c) => c.id,
    );
    expect(principalCaps).toContain('attendance');
    expect(principalCaps).toContain('climate_sensing');
    expect(principalCaps).not.toContain('learning_studio');
    expect(principalCaps).not.toContain('family_bridge');

    // Student has access to learning_studio, but not attendance or climate_sensing
    const studentCaps = getCapabilitiesForCapacity('workspace', 'browser', 'student').map(
      (c) => c.id,
    );
    expect(studentCaps).toEqual(['learning_studio']);

    // Guardian has access to family_bridge, but not attendance
    const guardianCaps = getCapabilitiesForCapacity('workspace', 'browser', 'guardian').map(
      (c) => c.id,
    );
    expect(guardianCaps).toEqual(['family_bridge']);
  });
});
