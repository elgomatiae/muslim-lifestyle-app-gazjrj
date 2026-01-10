import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

// Use environment variables with EXPO_PUBLIC_ prefix for Expo/React Native
// Fallback to hardcoded values if env vars are not set (for development)
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://teemloiwfnwrogwnoxsa.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZW1sb2l3Zm53cm9nd25veHNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NTYzODMsImV4cCI6MjA4MDAzMjM4M30.CXCl1-nnRT0GB6Qg89daWxT8kWxx91gEDaUWk9jX4CQ";

// Debug: Log Supabase configuration (remove in production)
if (__DEV__) {
  console.log('🔧 Supabase Configuration:');
  console.log('  URL:', SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('  Key:', SUPABASE_PUBLISHABLE_KEY ? '✅ Set' : '❌ Missing');
  console.log('  Using env vars:', !!process.env.EXPO_PUBLIC_SUPABASE_URL);
  
  // Warn if using fallback values
  if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
    console.warn('⚠️ Using hardcoded Supabase URL - set EXPO_PUBLIC_SUPABASE_URL in .env for production');
  }
  if (!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('⚠️ Using hardcoded Supabase key - set EXPO_PUBLIC_SUPABASE_ANON_KEY in .env for production');
  }
}

// Validate configuration
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Missing Supabase configuration. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file');
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
