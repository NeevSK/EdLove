import { createSupabaseAttendanceProjectionRepository } from '../../adapters/supabase/attendanceProjectionRepository';
import { __INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__ } from '../supabase';
import { createAttendanceProjectionServices } from '../../logic/domains/attendanceProjection/services';

const attendanceProjectionRepository = createSupabaseAttendanceProjectionRepository(__INTERNAL_SUPABASE_DO_NOT_USE_DIRECTLY__);

export const attendanceProjectionServices = createAttendanceProjectionServices(
  attendanceProjectionRepository,
);
