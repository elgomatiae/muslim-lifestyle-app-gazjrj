import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { colors } from '@/styles/commonStyles';

/**
 * Root index screen - handles initial routing based on auth state
 * This is the first screen that loads when the app opens
 */
export default function Index() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) {
      // Still checking auth state, wait
      return;
    }

    if (user) {
      // User is signed in, redirect to home
      console.log('✅ User authenticated, redirecting to home');
      router.replace('/(tabs)/(home)/');
    } else {
      // User is not signed in, redirect to login
      console.log('❌ User not authenticated, redirecting to login');
      router.replace('/(auth)/login');
    }
  }, [user, loading]);

  // Show loading screen while checking auth
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
