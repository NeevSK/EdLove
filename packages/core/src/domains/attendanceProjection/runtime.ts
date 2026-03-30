import { supabaseAttendanceProjectionRepository } from '../../adapters/supabase/attendanceProjectionRepository';
import { createAttendanceProjectionServices } from './services';

export const attendanceProjectionServices = createAttendanceProjectionServices(
    supabaseAttendanceProjectionRepository
);
