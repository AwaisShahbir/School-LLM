import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iowkrflylrypjjeymotg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_YS0XvtyurDsTmoNFg1Z5Ig_6TabpGgt';

export const isSupabaseConfigured = true;

export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey);
