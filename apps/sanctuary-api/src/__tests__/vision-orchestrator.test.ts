import { describe, expect, it, vi } from 'vitest';
import type { VisionPort } from '../ai/ports/VisionPort';
import { VisionOrchestrator } from '../ai/vision/VisionOrchestrator';
import {
  type UniversalDocumentEnvelope,
  UniversalDocumentEnvelopeSchema,
  VisionExtractionRequestSchema,
} from '../ai/vision/schemas';

const mockEnvelope: UniversalDocumentEnvelope = {
  classification: {
    detectedType: 'student_roster',
    confidence: 0.96,
    documentTitle: 'Grade 5A Term 2 Attendance',
    detectedLanguage: 'en',
    summary: 'Classroom attendance sheet with student names and roll numbers',
  },
  entities: {
    students: [
      {
        name: 'Kamal Perera',
        index_number: '1001',
        notes: 'Present',
        confidence: 0.98,
        uncertain: false,
      },
      {
        name: 'Nimal Silva',
        index_number: '1002',
        notes: 'Late',
        confidence: 0.92,
        uncertain: false,
      },
    ],
  },
  tables: [
    {
      name: 'Roster',
      headers: ['Index', 'Name', 'Status'],
      rows: [
        { Index: '1001', Name: 'Kamal Perera', Status: 'Present' },
        { Index: '1002', Name: 'Nimal Silva', Status: 'Late' },
      ],
    },
  ],
  metadata: {
    Grade: '5A',
    Term: '2',
  },
  rawTranscription: 'Grade 5A Term 2 Attendance\n1001 Kamal Perera Present\n1002 Nimal Silva Late',
  suggestedActions: ['import_students', 'record_attendance'],
};

describe('Vision Schema Validation', () => {
  it('validates a conformant UniversalDocumentEnvelope', () => {
    const parsed = UniversalDocumentEnvelopeSchema.parse(mockEnvelope);
    expect(parsed.classification.detectedType).toBe('student_roster');
    expect(parsed.entities.students).toHaveLength(2);
    expect(parsed.suggestedActions).toContain('import_students');
  });

  it('validates VisionExtractionRequestSchema', () => {
    const validRequest = {
      imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      mimeType: 'image/png' as const,
      intentHint: 'student_roster',
    };
    const parsed = VisionExtractionRequestSchema.parse(validRequest);
    expect(parsed.mimeType).toBe('image/png');
    expect(parsed.intentHint).toBe('student_roster');
  });
});

describe('VisionOrchestrator', () => {
  it('successfully extracts document via primary provider', async () => {
    const mockBilling = {
      resolveBilling: vi.fn().mockResolvedValue({
        mode: 'baseline',
        provider: 'gemini',
        apiKey: 'test-gemini-key',
        model: 'gemini-2.5-flash',
      }),
      logUsage: vi.fn().mockResolvedValue(undefined),
    };

    const mockAdapter: VisionPort = {
      extractDocument: vi.fn().mockResolvedValue(mockEnvelope),
    };

    const orchestrator = new VisionOrchestrator(mockBilling as any, () => mockAdapter);

    const result = await orchestrator.extractDocument('user-123', {
      imageBase64: 'mock-base64-data',
      intentHint: 'student_roster',
    });

    expect(result.classification.detectedType).toBe('student_roster');
    expect(mockAdapter.extractDocument).toHaveBeenCalledTimes(1);
  });

  it('transparently falls over to secondary provider when primary fails', async () => {
    const mockBilling = {
      resolveBilling: vi.fn().mockResolvedValue({
        mode: 'baseline',
        provider: 'gemini',
        apiKey: 'test-key',
        model: 'gemini-2.5-flash',
      }),
      logUsage: vi.fn().mockResolvedValue(undefined),
    };

    let callCount = 0;
    const failingPrimaryAdapter: VisionPort = {
      extractDocument: vi.fn().mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          throw new Error('429 Rate limit exceeded on primary provider');
        }
        return mockEnvelope;
      }),
    };

    const orchestrator = new VisionOrchestrator(mockBilling as any, () => failingPrimaryAdapter);

    const result = await orchestrator.extractDocument('user-123', {
      imageBase64: 'mock-base64-data',
    });

    expect(result.classification.detectedType).toBe('student_roster');
    expect(failingPrimaryAdapter.extractDocument).toHaveBeenCalledTimes(2);
  });
});
