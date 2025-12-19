
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/app/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface Category {
  id: string;
  name: string;
  type: string;
}

export default function PlaylistImportScreen() {
  const { user } = useAuth();
  const { type } = useLocalSearchParams<{ type?: string }>();
  const contentType = type === 'recitation' ? 'recitation' : 'lecture';
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const loadCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('video_categories')
        .select('*')
        .eq('type', contentType)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
      if (data && data.length > 0) {
        setSelectedCategory(data[0].id);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  }, [contentType]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const validateYouTubePlaylistUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return (
        (urlObj.hostname.includes('youtube.com') || urlObj.hostname === 'youtu.be') &&
        urlObj.searchParams.has('list')
      );
    } catch {
      return false;
    }
  };

  const handleImport = async () => {
    if (!playlistUrl.trim()) {
      Alert.alert('Error', 'Please enter a YouTube playlist URL');
      return;
    }

    if (!validateYouTubePlaylistUrl(playlistUrl)) {
      Alert.alert(
        'Invalid URL',
        'Please enter a valid YouTube playlist URL. It should contain "list=" parameter.\n\nExample:\nhttps://www.youtube.com/playlist?list=PLxxxxxxxx'
      );
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke('youtube-playlist-import', {
        body: {
          playlistUrl: playlistUrl.trim(),
          categoryId: selectedCategory,
        },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        'Success!',
        data.message || `Successfully imported ${data.successCount} videos from the playlist.`,
        [
          {
            text: `View ${contentType === 'recitation' ? 'Recitations' : 'Lectures'}`,
            onPress: () => router.back(),
          },
          {
            text: 'Import Another',
            onPress: () => {
              setPlaylistUrl('');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error importing playlist:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      let errorMessage = 'Failed to import playlist. Please try again.';
      
      if (error.message?.includes('YouTube API key')) {
        errorMessage = 'YouTube API is not configured. Please contact the administrator.';
      } else if (error.message?.includes('Invalid')) {
        errorMessage = error.message;
      }
      
      Alert.alert('Import Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasteUrl = async () => {
    // Note: Clipboard API would require expo-clipboard package
    // For now, users will paste manually
    Alert.alert(
      'Paste Playlist URL',
      'Please paste your YouTube playlist URL in the text field above.\n\nTo get a playlist URL:\n1. Open YouTube\n2. Go to the playlist\n3. Copy the URL from the address bar'
    );
  };

  if (loadingCategories) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={colors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerBanner}
        >
          <View style={styles.headerIconContainer}>
            <IconSymbol
              ios_icon_name="square.and.arrow.down.fill"
              android_material_icon_name="download"
              size={48}
              color={colors.card}
            />
          </View>
          <Text style={styles.headerTitle}>Import YouTube Playlist</Text>
          <Text style={styles.headerSubtitle}>
            Add multiple {contentType === 'recitation' ? 'recitations' : 'lectures'} at once from a YouTube playlist
          </Text>
        </LinearGradient>

        <View style={styles.instructionsCard}>
          <View style={styles.instructionHeader}>
            <IconSymbol
              ios_icon_name="info.circle.fill"
              android_material_icon_name="info"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.instructionTitle}>How to Import</Text>
          </View>
          <View style={styles.instructionSteps}>
            <View style={styles.instructionStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>
                Go to YouTube and find the playlist you want to import
              </Text>
            </View>
            <View style={styles.instructionStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>
                Copy the playlist URL from your browser
              </Text>
            </View>
            <View style={styles.instructionStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>
                Paste the URL below and select a category
              </Text>
            </View>
            <View style={styles.instructionStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={styles.stepText}>
                Tap Import to add all videos to your {contentType === 'recitation' ? 'recitations' : 'lectures'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formLabel}>YouTube Playlist URL</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="https://www.youtube.com/playlist?list=..."
              placeholderTextColor={colors.textSecondary}
              value={playlistUrl}
              onChangeText={setPlaylistUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
          <TouchableOpacity
            style={styles.pasteButton}
            onPress={handlePasteUrl}
            activeOpacity={0.7}
          >
            <IconSymbol
              ios_icon_name="doc.on.clipboard"
              android_material_icon_name="content-paste"
              size={16}
              color={colors.primary}
            />
            <Text style={styles.pasteButtonText}>How to get playlist URL</Text>
          </TouchableOpacity>

          <Text style={styles.formLabel}>Select Category</Text>
          <View style={styles.categoryList}>
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.categoryItem,
                  selectedCategory === category.id && styles.categoryItemSelected,
                ]}
                onPress={() => {
                  setSelectedCategory(category.id);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.categoryItemContent}>
                  <Text
                    style={[
                      styles.categoryItemText,
                      selectedCategory === category.id && styles.categoryItemTextSelected,
                    ]}
                  >
                    {category.name}
                  </Text>
                  {selectedCategory === category.id && (
                    <IconSymbol
                      ios_icon_name="checkmark.circle.fill"
                      android_material_icon_name="check-circle"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.importButton, loading && styles.importButtonDisabled]}
            onPress={handleImport}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={loading ? [colors.textSecondary, colors.textSecondary] : colors.gradientPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.importButtonGradient}
            >
              {loading ? (
                <React.Fragment>
                  <ActivityIndicator size="small" color={colors.card} />
                  <Text style={styles.importButtonText}>Importing...</Text>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <IconSymbol
                    ios_icon_name="square.and.arrow.down.fill"
                    android_material_icon_name="download"
                    size={20}
                    color={colors.card}
                  />
                  <Text style={styles.importButtonText}>Import Playlist</Text>
                </React.Fragment>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.noteCard}>
          <IconSymbol
            ios_icon_name="exclamationmark.triangle.fill"
            android_material_icon_name="warning"
            size={20}
            color={colors.warning}
          />
          <Text style={styles.noteText}>
            <Text style={styles.noteTextBold}>Note: </Text>
            This feature requires a YouTube Data API key to be configured. 
            The import process may take a few moments depending on the playlist size.
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: Platform.OS === 'android' ? 56 : 20,
    paddingHorizontal: spacing.xl,
    paddingBottom: 120,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  headerBanner: {
    borderRadius: borderRadius.xl,
    padding: spacing.xxxl,
    alignItems: 'center',
    marginBottom: spacing.xxl,
    ...shadows.colored,
  },
  headerIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.card,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.card,
    textAlign: 'center',
    opacity: 0.9,
  },
  instructionsCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.medium,
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  instructionTitle: {
    ...typography.h4,
    color: colors.text,
  },
  instructionSteps: {
    gap: spacing.md,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    ...typography.caption,
    color: colors.card,
    fontWeight: '700',
  },
  stepText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.medium,
  },
  formLabel: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  input: {
    ...typography.body,
    color: colors.text,
    padding: spacing.md,
    minHeight: 80,
  },
  pasteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xl,
  },
  pasteButtonText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  categoryList: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  categoryItem: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  categoryItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryItemText: {
    ...typography.body,
    color: colors.text,
  },
  categoryItemTextSelected: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  importButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.medium,
  },
  importButtonDisabled: {
    opacity: 0.6,
  },
  importButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  importButtonText: {
    ...typography.h4,
    color: colors.card,
    fontWeight: '600',
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: colors.warningLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  noteText: {
    ...typography.caption,
    color: colors.text,
    flex: 1,
    lineHeight: 18,
  },
  noteTextBold: {
    fontWeight: '700',
  },
  bottomPadding: {
    height: 40,
  },
});
