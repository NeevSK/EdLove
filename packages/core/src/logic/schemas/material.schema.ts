import { z } from 'zod';
import { makeModelSchema } from '../generated/zod';

/**
 * MaterialSchema - A repository of knowledge.
 * Derived from ZenStack Material model.
 */
export const MaterialSchema = makeModelSchema('Material');

export type Material = z.infer<typeof MaterialSchema>;
