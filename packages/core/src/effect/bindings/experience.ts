import { supabaseUIExperienceRepository } from '@repo/core/adapters/supabase/uiExperienceRepository';
import type { UIExperienceRepository } from '@repo/core/logic/ports/uiExperience.port';

/** Journey history, goals, snapshot moments, pending work and the activity heatmap. */
export const uiExperience: UIExperienceRepository = supabaseUIExperienceRepository;
