import { z } from 'zod';

export const ParsedStudentEntitySchema = z.object({
  name: z.string().describe('Full name of student (English, Sinhala, or Tamil transliteration)'),
  index_number: z.string().describe('Admission or roll number'),
  notes: z.string().optional().describe('Attendance status, marks, or remarks'),
  confidence: z.number().min(0).max(1),
  uncertain: z.boolean().describe('True if smudged, crossed out, or ambiguous'),
});

export type ParsedStudentEntity = z.infer<typeof ParsedStudentEntitySchema>;

export const LessonFlowEntitySchema = z.object({
  phase: z.string().describe('e.g. hook, direct_instruction, guided_practice, closure'),
  duration_minutes: z.number().optional(),
  teacher_activity: z.string(),
  student_activity: z.string(),
});

export type LessonFlowEntity = z.infer<typeof LessonFlowEntitySchema>;

export const UniversalDocumentEnvelopeSchema = z.object({
  classification: z.object({
    detectedType: z.string().describe('e.g. student_roster, lesson_plan, gradebook, timetable, receipt, administrative_notice, handwritten_notes'),
    confidence: z.number().min(0).max(1),
    documentTitle: z.string().optional().describe('Detected document title or school header'),
    detectedLanguage: z.string().optional().describe('Detected language: en, si, ta, or mixed'),
    summary: z.string().describe('1-sentence summary of what this document is'),
  }),
  entities: z.object({
    students: z.array(ParsedStudentEntitySchema).optional().describe('Extracted student list if document is a roster or attendance sheet'),
    lesson_flow: z.array(LessonFlowEntitySchema).optional().describe('Lesson phases if document is a lesson plan or curriculum outline'),
    custom_records: z.array(z.record(z.string(), z.any())).optional().describe('Arbitrary structured records if document contains items, inventory, or expenses'),
  }),
  tables: z.array(
    z.object({
      name: z.string().optional(),
      headers: z.array(z.string()),
      rows: z.array(z.record(z.string(), z.any())),
    })
  ).optional().describe('Any tabular grid discovered on the document'),
  metadata: z.record(z.string(), z.string()).optional().describe('Key-value pairs found in document (e.g. Date, Grade, Subject, Teacher)'),
  rawTranscription: z.string().describe('Complete text transcription in natural reading order'),
  suggestedActions: z.array(z.string()).describe('Recommended next actions, e.g. "import_students", "create_lesson_draft", "record_attendance"'),
});

export type UniversalDocumentEnvelope = z.infer<typeof UniversalDocumentEnvelopeSchema>;

export const VisionExtractionRequestSchema = z.object({
  imageBase64: z.string().min(1, 'Image data is required'),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']).default('image/jpeg'),
  intentHint: z.string().optional().describe('Optional context hint, e.g. "student_roster", "lesson_plan"'),
  hintLanguage: z.string().optional(),
  preferredProvider: z.enum(['gemini', 'openai', 'anthropic', 'deepseek', 'openrouter']).optional(),
  preferredModel: z.string().optional(),
});

export type VisionExtractionRequest = z.infer<typeof VisionExtractionRequestSchema>;
