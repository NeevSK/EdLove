import { describe, expect, it } from 'vitest';
import { AnimatedMeshQrDecoder, encodePayloadToMeshQrFrames } from './animatedMeshQr';

describe('AnimatedMeshQr', () => {
  it('encodes and decodes a small payload in a single frame', () => {
    const payload = {
      action: 'morningAttendance',
      grade: 10,
      presentCount: 38,
      timestamp: '2026-10-10T08:30:00Z',
    };

    const frames = encodePayloadToMeshQrFrames('batch_small_1', payload, 500);
    expect(frames).toHaveLength(1);
    expect(frames[0]).toContain('MESH:batch_small_1:1/1:');

    const decoder = new AnimatedMeshQrDecoder();
    const result = decoder.receiveFrame(frames[0]!);
    expect(result).not.toBeNull();
    expect(result?.batchId).toBe('batch_small_1');
    expect(result?.data).toEqual(payload);
  });

  it('encodes and reassembles a large chunked payload delivered out of order', () => {
    const payload = {
      schoolId: 'school_colombo_01',
      date: '2026-10-10',
      roster: Array.from({ length: 40 }, (_, i) => ({
        index: i + 1,
        studentId: `student_${i + 1}`,
        status: i % 5 === 0 ? 'absent' : 'present',
        notes: `Record note for student ${i + 1}`,
      })),
    };

    // Force small chunks of 150 chars to test multi-frame streaming
    const frames = encodePayloadToMeshQrFrames('batch_large_2', payload, 150);
    expect(frames.length).toBeGreaterThan(5);

    const decoder = new AnimatedMeshQrDecoder();

    // Deliver frames out of order (e.g. reverse)
    const reversedFrames = [...frames].reverse();
    let finalResult = null;

    for (let i = 0; i < reversedFrames.length; i++) {
      const frame = reversedFrames[i]!;
      const res = decoder.receiveFrame(frame);
      if (res) {
        finalResult = res;
      } else {
        const progress = decoder.getProgress('batch_large_2');
        expect(progress).not.toBeNull();
        expect(progress?.received).toBe(i + 1);
      }
    }

    expect(finalResult).not.toBeNull();
    expect(finalResult?.batchId).toBe('batch_large_2');
    expect(finalResult?.data).toEqual(payload);
  });

  it('rejects invalid or non-mesh frames', () => {
    const decoder = new AnimatedMeshQrDecoder();
    expect(decoder.receiveFrame('https://example.com')).toBeNull();
    expect(decoder.receiveFrame('MESH:malformed')).toBeNull();
    expect(decoder.receiveFrame('')).toBeNull();
  });
});
