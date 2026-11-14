import { cleanup } from '@testing-library/react';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { afterEach } from 'vitest';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

// Set test environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://qzoawolfkuwiuyaoiybz.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_Nt2qdjI6uKQHFQuyeqZJww_cjKYiV8W';

afterEach(() => {
  cleanup();
});
