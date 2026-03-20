import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const disableSupabase = process.env.DISABLE_SUPABASE === 'true';

const hasValidSupabaseConfig =
  !disableSupabase &&
  Boolean(supabaseUrl) &&
  Boolean(supabaseKey) &&
  !supabaseUrl.includes('YOUR_SUPABASE');

if (!hasValidSupabaseConfig) {
  console.warn('⚠️ Supabase disabled for this environment (using local dev services).');
}

export const isSupabaseEnabled = hasValidSupabaseConfig;

export const supabase = hasValidSupabaseConfig ? createClient(supabaseUrl, supabaseKey): (null as any);
