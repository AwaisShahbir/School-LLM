import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

export const REMOTE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://iowkrflylrypjjeymotg.supabase.co';
export const BRIDGE_URL = 'http://localhost:8082';
export const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_YS0XvtyurDsTmoNFg1Z5Ig_6TabpGgt';

export const isSupabaseConfigured = true;

const clientConfig = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
};

export const remoteClient = createClient<any>(REMOTE_URL, supabaseAnonKey, clientConfig);
export const bridgeClient = createClient<any>(BRIDGE_URL, supabaseAnonKey, clientConfig);

// By default in dev with USB connection, use bridgeClient; otherwise remoteClient
export let activeSupabase = bridgeClient;

export function setActiveClient(useBridge: boolean) {
  activeSupabase = useBridge ? bridgeClient : remoteClient;
}

// Proxied supabase export that routes to activeSupabase
export const supabase = new Proxy({} as any, {
  get(_target, prop) {
    return (activeSupabase as any)[prop];
  }
});
