import { createSupabaseAttendanceProjectionRepository } from '@repo/core/adapters/supabase/attendanceProjectionRepository';
import { createAttendanceProjectionServices } from '@repo/core/logic/domains/attendanceProjection/services';
import { supabaseClient } from '@repo/core/adapters/supabaseClient';

const attendanceProjectionRepository = createSupabaseAttendanceProjectionRepository(
  supabaseClient,
);

export const attendanceProjectionServices = createAttendanceProjectionServices(
  attendanceProjectionRepository,
);
