import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://nihdqtamrfivlhxqdszf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5paGRxdGFtcmZpdmxoeHFkc3pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NjExNDQsImV4cCI6MjA4MTQzNzE0NH0.XQM7sZ4cPwBomqoMDtrjD9jDTJ4Mxp15cd02A_ApoLU";

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
