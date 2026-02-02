import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://zofannumpvstuukwlbvw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvZmFubnVtcHZzdHV1a3dsYnZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MTc5NzcsImV4cCI6MjA4NTE5Mzk3N30.fDWSs6pRapPXvFZLd05l7wt4kCSHAE_c8jHK3kaPdD0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});