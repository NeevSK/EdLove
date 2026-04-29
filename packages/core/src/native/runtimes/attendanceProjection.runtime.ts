import { createSupabaseAttendanceProjectionRepository } from '../../adapters/supabase/attendanceProjectionRepository';
import { createAttendanceProjectionServices } from '../../logic/domains/attendanceProjection/services';
import { supabase } from '../../api/supabase';

const attendanceProjectionRepository = createSupabaseAttendanceProjectionRepository(supabase);

export const attendanceProjectionServices = createAttendanceProjectionServices(
  attendanceProjectionRepository,
);
