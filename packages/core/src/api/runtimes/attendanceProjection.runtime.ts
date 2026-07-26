import { createSupabaseAttendanceProjectionRepository } from '@/adapters/supabase/attendanceProjectionRepository';
import { createAttendanceProjectionServices } from '@/logic/domains/attendanceProjection/services';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '@/api/supabase';

const attendanceProjectionRepository = createSupabaseAttendanceProjectionRepository(
  __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__,
);

export const attendanceProjectionServices = createAttendanceProjectionServices(
  attendanceProjectionRepository,
);
