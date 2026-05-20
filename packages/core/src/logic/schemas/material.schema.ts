import { makeModelSchema } from '@repo/schema';
import type { z } from 'zod';

/**
 * MaterialSchema - A repository of knowledge.
 * Derived from ZenStack Material model.
 */
export const MaterialSchema = makeModelSchema('Material');

export type Material = z.infer<typeof MaterialSchema>;
