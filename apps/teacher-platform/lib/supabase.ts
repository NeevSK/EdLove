import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// PASTE YOUR KEYS HERE (Keep the quote marks!)
const supabaseUrl = 'https://mtymkmcpojmhkinbylwi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eW1rbWNwb2ptaGtpbmJ5bHdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3ODgxNTcsImV4cCI6MjA3OTM2NDE1N30.xJM950OZ9SFa0okrhYR4UsZSOccsumfgDIdnTsW72jo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});