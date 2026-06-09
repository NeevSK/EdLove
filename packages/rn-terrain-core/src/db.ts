import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables locally if not already set
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // If variables are not set, fallback to the ones we retrieved from gurudevi-mobile .env
  process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://qzoawolfkuwiuyaoiybz.supabase.co';
  process.env.SUPABASE_ANON_KEY =
    process.env.SUPABASE_ANON_KEY || 'sb_publishable_Nt2qdjI6uKQHFQuyeqZJww_cjKYiV8W';
}

export const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
