import { createSupabaseAttendanceProjectionRepository } from '@repo/core/adapters/supabase/attendanceProjectionRepository';
import { createAttendanceProjectionServices } from '@repo/core/logic/domains/attendanceProjection/services';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '@repo/core/api/supabase';

const attendanceProjectionRepository = createSupabaseAttendanceProjectionRepository(
  __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__,
);

export const attendanceProjectionServices = createAttendanceProjectionServices(
  attendanceProjectionRepository,
);
