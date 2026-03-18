import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('YOUR_SUPABASE')) {
  console.warn('⚠️ SUPABASE_URL or SUPABASE_ANON_KEY is not configured correctly in .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
