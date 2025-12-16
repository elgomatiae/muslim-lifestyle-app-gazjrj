
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// These will be set by the user when they enable Supabase
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export interface VideoCategory {
  id: string;
  name: string;
  description: string;
  type: 'lecture' | 'recitation';
  order_index: number;
  created_at: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  category_id: string;
  duration: number; // in seconds
  scholar_name?: string;
  reciter_name?: string;
  views: number;
  order_index: number;
  created_at: string;
}

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return SUPABASE_URL !== '' && SUPABASE_ANON_KEY !== '';
};

// Fetch categories by type
export const fetchCategories = async (type: 'lecture' | 'recitation'): Promise<VideoCategory[]> => {
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('video_categories')
      .select('*')
      .eq('type', type)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

// Fetch videos by category
export const fetchVideosByCategory = async (categoryId: string): Promise<Video[]> => {
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('category_id', categoryId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Error fetching videos:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
};

// Increment video views
export const incrementVideoViews = async (videoId: string): Promise<void> => {
  if (!isSupabaseConfigured()) {
    return;
  }

  try {
    const { error } = await supabase.rpc('increment_video_views', { video_id: videoId });

    if (error) {
      console.error('Error incrementing views:', error);
    }
  } catch (error) {
    console.error('Error incrementing views:', error);
  }
};
