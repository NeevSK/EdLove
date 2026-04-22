import { createSupabaseAttendanceProjectionRepository } from '../../adapters/supabase/attendanceProjectionRepository';
import { createAttendanceProjectionServices } from '../../logic/domains/attendanceProjection/services';

const attendanceProjectionRepository = createSupabaseAttendanceProjectionRepository();

export const attendanceProjectionServices = createAttendanceProjectionServices(
  attendanceProjectionRepository,
);
