import { z } from 'zod';

/**
 * POA Metadata - The shared contract for authority markers across the system.
 * Defined at L0 to be consumed by both Client (L1/L3) and BFF (L4).
 */
export const POAMetadataSchema = z.object({
  authority: z.object({
    action: z.enum(['manage', 'create', 'read', 'update', 'delete', 'submit', 'verify', 'grade', 'resolve', 'publish', 'override']),
    subject: z.string(), // Maps to CASL Subjects
  }),
});

export type POAMetadata = z.infer<typeof POAMetadataSchema>;

/**
 * Placeholder for ts-rest initContract.
 * In a real 2026 stack, you would use: import { initContract } from '@ts-rest/core';
 */
const c = {
  router: <T>(routes: T): T => routes,
};

// Example Contract demonstrating the POA pattern
export const pOALessonsContract = c.router({
  getLessons: {
    method: 'GET',
    path: '/lessons',
    responses: {
      200: z.array(z.object({ id: z.string(), title: z.string() })),
    },
    metadata: {
      authority: { action: 'read', subject: 'Lesson' },
    } as POAMetadata,
  },
  createLesson: {
    method: 'POST',
    path: '/lessons',
    body: z.object({ title: z.string() }),
    responses: {
      201: z.object({ id: z.string() }),
    },
    metadata: {
      authority: { action: 'create', subject: 'Lesson' },
    } as POAMetadata,
  },
});
