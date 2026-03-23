import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { localPostgresInit } from './postgres.js';

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
   // connect to local pg container if supabase is not setup
   localPostgresInit();
   console.warn('⚠️ Supabase disabled for this environment (using local Postgres fallback).');
}

export const isSupabaseEnabled = hasValidSupabaseConfig;

export const supabase = hasValidSupabaseConfig ? createClient(supabaseUrl, supabaseKey) : (null as any);
