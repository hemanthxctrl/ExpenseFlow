import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from Vite env, Node process.env, or user settings in LocalStorage
const getCredentials = () => {
  const envUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : (typeof process !== 'undefined' && process.env ? process.env.VITE_SUPABASE_URL : null);
  const envKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : (typeof process !== 'undefined' && process.env ? process.env.VITE_SUPABASE_ANON_KEY : null);

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('expenseflow_supabase_url') : null;
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('expenseflow_supabase_anon_key') : null;

  const url = storedUrl || envUrl || '';
  const anonKey = storedKey || envKey || '';

  const isValidUrl = typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://localhost')) && !url.includes('your-project-ref');
  const isValidKey = typeof anonKey === 'string' && anonKey.length > 20 && !anonKey.includes('your-supabase-anon-key');

  return {
    url,
    anonKey,
    isConfigured: Boolean(isValidUrl && isValidKey)
  };
};

let clientInstance = null;
let currentConfig = getCredentials();

export const isSupabaseConfigured = () => {
  return getCredentials().isConfigured;
};

export const getSupabaseConfig = () => {
  return getCredentials();
};

export const getSupabase = () => {
  const creds = getCredentials();
  if (!creds.isConfigured) {
    return null;
  }

  // Re-instantiate if config changed or not created yet
  if (!clientInstance || creds.url !== currentConfig.url || creds.anonKey !== currentConfig.anonKey) {
    currentConfig = creds;
    clientInstance = createClient(creds.url, creds.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'expenseflow_auth_session'
      }
    });
  }

  return clientInstance;
};

export const saveCustomSupabaseConfig = (url, anonKey) => {
  if (typeof window !== 'undefined') {
    if (url && anonKey) {
      localStorage.setItem('expenseflow_supabase_url', url.trim());
      localStorage.setItem('expenseflow_supabase_anon_key', anonKey.trim());
    } else {
      localStorage.removeItem('expenseflow_supabase_url');
      localStorage.removeItem('expenseflow_supabase_anon_key');
    }
    clientInstance = null; // reset instance
  }
};

// Initial export
export const supabase = getSupabase();
