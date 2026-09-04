import { createSupabaseAttendanceProjectionRepository } from '@repo/core/adapters/supabase/attendanceProjectionRepository';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';
import { createAttendanceProjectionServices } from '@repo/core/logic/domains/attendanceProjection/services';

const attendanceProjectionRepository = createSupabaseAttendanceProjectionRepository(supabaseClient);

export const attendanceProjectionServices = createAttendanceProjectionServices(
  attendanceProjectionRepository,
);
