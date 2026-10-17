import { describe, expect, it } from 'vitest';
import { parseInstitutionalQR } from './institutionalQrParser';

describe('parseInstitutionalQR', () => {
  it('parses raw ASSET prefix', () => {
    const res = parseInstitutionalQR('ASSET:microscope_olympus_042');
    expect(res).toEqual({
      kind: 'asset',
      assetId: 'microscope_olympus_042',
    });
  });

  it('parses raw ASWESUMA prefix with household ID', () => {
    const res = parseInstitutionalQR('ASWESUMA:hash_abc123:hh_colombo_88');
    expect(res).toEqual({
      kind: 'aswesuma',
      certificateHash: 'hash_abc123',
      householdId: 'hh_colombo_88',
    });
  });

  it('parses MEAL roll-call barcode', () => {
    const res = parseInstitutionalQR('MEAL:student_grade6_09');
    expect(res).toEqual({
      kind: 'meal',
      studentId: 'student_grade6_09',
    });
  });

  it('parses URI schemes', () => {
    const res = parseInstitutionalQR('gurudevi://asset/projector_benq_01');
    expect(res).toEqual({
      kind: 'asset',
      assetId: 'projector_benq_01',
    });
  });

  it('parses JSON payloads', () => {
    const res = parseInstitutionalQR(
      JSON.stringify({ type: 'aswesuma', hash: 'sha256_proof', householdId: 'hh_99' }),
    );
    expect(res).toEqual({
      kind: 'aswesuma',
      certificateHash: 'sha256_proof',
      householdId: 'hh_99',
    });
  });

  it('parses raw ATTENDANCE prefix with classroom ID', () => {
    const res = parseInstitutionalQR('ATTENDANCE:sample-c1:sample-s1');
    expect(res).toEqual({
      kind: 'attendance',
      classroomId: 'sample-c1',
      studentId: 'sample-s1',
    });
  });

  it('parses raw STUDENT prefix', () => {
    const res = parseInstitutionalQR('STUDENT:sample-s3');
    expect(res).toEqual({
      kind: 'attendance',
      studentId: 'sample-s3',
    });
  });

  it('parses attendance URI scheme with query params', () => {
    const res = parseInstitutionalQR('gurudevi://attendance/sample-s2?classroomId=sample-c1');
    expect(res).toEqual({
      kind: 'attendance',
      studentId: 'sample-s2',
      classroomId: 'sample-c1',
    });
  });

  it('parses JSON attendance payload', () => {
    const res = parseInstitutionalQR(
      JSON.stringify({ type: 'attendance', studentId: 'sample-s4', classroomId: 'sample-c1' }),
    );
    expect(res).toEqual({
      kind: 'attendance',
      studentId: 'sample-s4',
      classroomId: 'sample-c1',
    });
  });

  it('falls back to unknown for unstructured text', () => {
    const res = parseInstitutionalQR('hello world');
    expect(res).toEqual({
      kind: 'unknown',
      raw: 'hello world',
    });
  });
});
