
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  id?: string;
  user_id: string;
  username?: string;
  display_name?: string;
  phone?: string;
  location?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetch user profile from Supabase
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    console.log('Fetching user profile from Supabase for user:', userId);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.log('Error fetching user profile:', error);
      return null;
    }

    console.log('User profile fetched successfully:', data);
    return data;
  } catch (error) {
    console.log('Error in fetchUserProfile:', error);
    return null;
  }
}

/**
 * Update user profile in Supabase
 */
export async function updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<boolean> {
  try {
    console.log('Updating user profile in Supabase for user:', userId);
    
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        ...profile,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.log('Error updating user profile:', error);
      return false;
    }

    console.log('User profile updated successfully');
    return true;
  } catch (error) {
    console.log('Error in updateUserProfile:', error);
    return false;
  }
}

/**
 * Sync local profile data to Supabase
 */
export async function syncProfileToSupabase(userId: string): Promise<void> {
  try {
    console.log('Syncing profile to Supabase...');
    
    // Load local profile data
    const localProfileStr = await AsyncStorage.getItem('userProfile');
    if (!localProfileStr) {
      console.log('No local profile data to sync');
      return;
    }

    const localProfile = JSON.parse(localProfileStr);
    
    // Update Supabase with local data
    await updateUserProfile(userId, {
      display_name: localProfile.name,
      phone: localProfile.phone,
      location: localProfile.location,
    });
    
    console.log('Profile synced to Supabase successfully');
  } catch (error) {
    console.log('Error syncing profile to Supabase:', error);
  }
}

/**
 * Sync Supabase profile data to local storage
 */
export async function syncProfileFromSupabase(userId: string): Promise<void> {
  try {
    console.log('Syncing profile from Supabase...');
    
    // Fetch profile from Supabase
    const profile = await fetchUserProfile(userId);
    if (!profile) {
      console.log('No profile found in Supabase');
      return;
    }

    // Get user email from auth
    const { data: { user } } = await supabase.auth.getUser();
    
    // Save to local storage
    const localProfile = {
      name: profile.display_name || profile.username || 'User',
      email: user?.email || '',
      phone: profile.phone || '',
      location: profile.location || '',
    };
    
    await AsyncStorage.setItem('userProfile', JSON.stringify(localProfile));
    
    console.log('Profile synced from Supabase successfully');
  } catch (error) {
    console.log('Error syncing profile from Supabase:', error);
  }
}

/**
 * Initialize user profile on first login
 */
export async function initializeUserProfile(userId: string, username?: string, email?: string): Promise<void> {
  try {
    console.log('Initializing user profile...');
    
    // Check if profile already exists
    const existingProfile = await fetchUserProfile(userId);
    if (existingProfile) {
      console.log('Profile already exists, syncing to local...');
      await syncProfileFromSupabase(userId);
      return;
    }

    // Create new profile
    const newProfile: Partial<UserProfile> = {
      user_id: userId,
      username: username || email?.split('@')[0] || 'User',
      display_name: username || email?.split('@')[0] || 'User',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await updateUserProfile(userId, newProfile);
    
    // Save to local storage
    const localProfile = {
      name: newProfile.display_name || 'User',
      email: email || '',
      phone: '',
      location: '',
    };
    
    await AsyncStorage.setItem('userProfile', JSON.stringify(localProfile));
    
    console.log('User profile initialized successfully');
  } catch (error) {
    console.log('Error initializing user profile:', error);
  }
}
