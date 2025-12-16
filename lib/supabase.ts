
import { supabase as supabaseClient } from '@/app/integrations/supabase/client';

// Re-export the supabase client
export const supabase = supabaseClient;

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
  // Check if the supabase client is properly initialized
  try {
    const url = supabaseClient.supabaseUrl;
    const key = supabaseClient.supabaseKey;
    return url !== '' && key !== '' && url !== undefined && key !== undefined;
  } catch (error) {
    console.error('Error checking Supabase configuration:', error);
    return false;
  }
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

// Fetch all videos (for search)
export const fetchAllVideos = async (type: 'lecture' | 'recitation'): Promise<Video[]> => {
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*, video_categories!inner(type)')
      .eq('video_categories.type', type)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all videos:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching all videos:', error);
    return [];
  }
};

// Search videos by title, description, or scholar name
export const searchVideos = async (
  query: string,
  type: 'lecture' | 'recitation'
): Promise<Video[]> => {
  if (!isSupabaseConfigured() || !query.trim()) {
    return [];
  }

  try {
    const searchTerm = `%${query.toLowerCase()}%`;
    
    const { data, error } = await supabase
      .from('videos')
      .select('*, video_categories!inner(type)')
      .eq('video_categories.type', type)
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},scholar_name.ilike.${searchTerm},reciter_name.ilike.${searchTerm}`)
      .order('views', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error searching videos:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error searching videos:', error);
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
