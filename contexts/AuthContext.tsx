
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/app/integrations/supabase/client';
import { router } from 'expo-router';
import { initializeUserProfile } from '@/utils/profileSupabaseSync';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signInWithGoogle: async () => {},
  signInWithApple: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id || 'No session');
      setSession(session);
      setUser(session?.user ?? null);
      
      // Initialize user profile if logged in
      if (session?.user) {
        try {
          await initializeUserProfile(
            session.user.id,
            session.user.user_metadata?.username,
            session.user.email
          );
        } catch (error) {
          console.error('Error initializing user profile:', error);
        }
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event, session?.user?.id || 'No session');
      setSession(session);
      setUser(session?.user ?? null);
      
      // Initialize user profile on sign in
      if (_event === 'SIGNED_IN' && session?.user) {
        try {
          await initializeUserProfile(
            session.user.id,
            session.user.user_metadata?.username,
            session.user.email
          );
        } catch (error) {
          console.error('Error initializing user profile:', error);
        }
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      console.log('Signing out...');
      await supabase.auth.signOut();
      router.replace('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      console.log('Signing in with email...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        console.error('Sign in error:', error);
        throw new Error(error.message);
      }

      if (data.user) {
        console.log('Sign in successful:', data.user.id);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    try {
      console.log('Signing up with email...');
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            username: name?.trim() || email.split('@')[0],
          },
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        throw new Error(error.message);
      }

      if (data.user) {
        console.log('Sign up successful:', data.user.id);
        // Check if email confirmation is required
        if (data.user.identities && data.user.identities.length === 0) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        }
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Signing in with Google...');
      // TODO: Backend Integration - Implement Google OAuth sign-in
      // This requires setting up OAuth providers in Supabase dashboard
      throw new Error('Google sign-in not yet configured. Please use email/password.');
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const signInWithApple = async () => {
    try {
      console.log('Signing in with Apple...');
      // TODO: Backend Integration - Implement Apple OAuth sign-in
      // This requires setting up OAuth providers in Supabase dashboard
      throw new Error('Apple sign-in not yet configured. Please use email/password.');
    } catch (error) {
      console.error('Apple sign in error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      loading, 
      signOut,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signInWithApple,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
