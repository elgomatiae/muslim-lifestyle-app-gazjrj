
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import CategoryRow from '@/components/CategoryRow';
import VideoPlayer from '@/components/VideoPlayer';
import { fetchCategories, fetchVideosByCategory, incrementVideoViews, isSupabaseConfigured, Video, VideoCategory } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';

export default function LecturesScreen() {
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [videosByCategory, setVideosByCategory] = useState<{ [key: string]: Video[] }>({});
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [supabaseEnabled, setSupabaseEnabled] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const configured = isSupabaseConfigured();
    setSupabaseEnabled(configured);

    if (!configured) {
      setLoading(false);
      return;
    }

    try {
      const fetchedCategories = await fetchCategories('lecture');
      setCategories(fetchedCategories);

      const videosData: { [key: string]: Video[] } = {};
      for (const category of fetchedCategories) {
        const videos = await fetchVideosByCategory(category.id);
        videosData[category.id] = videos;
      }
      setVideosByCategory(videosData);
    } catch (error) {
      console.error('Error loading lectures:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoPress = async (video: Video) => {
    setSelectedVideo(video);
    await incrementVideoViews(video.id);
  };

  const handleCloseVideo = () => {
    setSelectedVideo(null);
  };

  if (selectedVideo) {
    return <VideoPlayer video={selectedVideo} onClose={handleCloseVideo} />;
  }

  if (!supabaseEnabled) {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={colors.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.setupBanner}
          >
            <View style={styles.setupIconContainer}>
              <IconSymbol
                ios_icon_name="cloud.fill"
                android_material_icon_name="cloud"
                size={48}
                color={colors.card}
              />
            </View>
            <Text style={styles.setupTitle}>Connect to Supabase</Text>
            <Text style={styles.setupDescription}>
              To access Islamic lectures, please enable Supabase by pressing the Supabase button and connecting to your project.
            </Text>
            <View style={styles.setupSteps}>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>Create a Supabase project</Text>
              </View>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>Press the Supabase button</Text>
              </View>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>Connect to your project</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Database Setup Required</Text>
            <Text style={styles.infoText}>
              You&apos;ll need to create the following tables in your Supabase project:
            </Text>
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>• video_categories</Text>
              <Text style={styles.codeText}>• videos</Text>
            </View>
            <Text style={styles.infoText}>
              Upload your lecture videos to Supabase Storage and reference them in the videos table.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading lectures...</Text>
      </View>
    );
  }

  if (categories.length === 0) {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <IconSymbol
                ios_icon_name="video.slash.fill"
                android_material_icon_name="videocam-off"
                size={64}
                color={colors.textSecondary}
              />
            </View>
            <Text style={styles.emptyTitle}>No Lectures Yet</Text>
            <Text style={styles.emptyText}>
              Add categories and videos to your Supabase database to see them here.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Islamic Lectures</Text>
          <Text style={styles.headerSubtitle}>Learn from renowned scholars</Text>
        </View>

        {categories.map((category, index) => (
          <React.Fragment key={index}>
            <CategoryRow
              category={category}
              videos={videosByCategory[category.id] || []}
              onVideoPress={handleVideoPress}
              onSeeAllPress={() => console.log('See all:', category.name)}
            />
          </React.Fragment>
        ))}

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
  scrollContent: {
    paddingTop: Platform.OS === 'android' ? 56 : 20,
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
  header: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  setupBanner: {
    borderRadius: borderRadius.xl,
    padding: spacing.xxxl,
    alignItems: 'center',
    marginBottom: spacing.xxl,
    ...shadows.colored,
  },
  setupIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  setupTitle: {
    ...typography.h2,
    color: colors.card,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  setupDescription: {
    ...typography.body,
    color: colors.card,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    lineHeight: 24,
  },
  setupSteps: {
    width: '100%',
    alignItems: 'flex-start',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  stepNumberText: {
    ...typography.bodyBold,
    color: colors.card,
  },
  stepText: {
    ...typography.body,
    color: colors.card,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    ...shadows.medium,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  codeBlock: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  codeText: {
    ...typography.caption,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xxxl,
    alignItems: 'center',
    ...shadows.medium,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomPadding: {
    height: 40,
  },
});
