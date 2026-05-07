import { createSupabaseAttendanceProjectionRepository } from '../../adapters/supabase/attendanceProjectionRepository';
import { supabase } from '../supabase';
import { createAttendanceProjectionServices } from '../../logic/domains/attendanceProjection/services';

const attendanceProjectionRepository = createSupabaseAttendanceProjectionRepository(supabase);

export const attendanceProjectionServices = createAttendanceProjectionServices(
  attendanceProjectionRepository,
);
