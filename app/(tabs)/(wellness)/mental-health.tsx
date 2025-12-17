
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, typography, spacing, borderRadius, shadows } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - spacing.xl * 3) / 2;

interface ContentItem {
  id: string;
  title: string;
  preview?: string;
  category?: string;
  created_at?: string;
}

interface QuickStat {
  label: string;
  value: string;
  icon: string;
  androidIcon: string;
  color: string[];
}

export default function MentalHealthScreen() {
  const { user } = useAuth();
  const [journalCount, setJournalCount] = useState(0);
  const [moodStreak, setMoodStreak] = useState(0);
  const [recentJournal, setRecentJournal] = useState<ContentItem | null>(null);
  const [featuredStory, setFeaturedStory] = useState<ContentItem | null>(null);
  const [dailyPrompt, setDailyPrompt] = useState<ContentItem | null>(null);
  const [featuredDua, setFeaturedDua] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    loadAllData();
    
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadJournalStats(),
        loadMoodStats(),
        loadRecentJournal(),
        loadFeaturedStory(),
        loadDailyPrompt(),
        loadFeaturedDua(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadJournalStats = async () => {
    if (!user) return;
    const { count } = await supabase
      .from('journal_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);
    setJournalCount(count || 0);
  };

  const loadMoodStats = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('mood_tracking')
      .select('date')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(30);
    
    if (data && data.length > 0) {
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < data.length; i++) {
        const entryDate = new Date(data[i].date);
        const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === i) {
          streak++;
        } else {
          break;
        }
      }
      setMoodStreak(streak);
    }
  };

  const loadRecentJournal = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('journal_entries')
      .select('id, title, content, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (data) {
      setRecentJournal({
        id: data.id,
        title: data.title,
        preview: data.content.substring(0, 100),
        created_at: data.created_at,
      });
    }
  };

  const loadFeaturedStory = async () => {
    const { data } = await supabase
      .from('prophet_stories')
      .select('id, title, mental_health_connection, category')
      .eq('is_active', true)
      .order('order_index', { ascending: true })
      .limit(1)
      .single();
    if (data) {
      setFeaturedStory({
        id: data.id,
        title: data.title,
        preview: data.mental_health_connection,
        category: data.category,
      });
    }
  };

  const loadDailyPrompt = async () => {
    const { data } = await supabase
      .from('journal_prompts')
      .select('id, prompt_text, category')
      .eq('is_active', true)
      .order('order_index', { ascending: true })
      .limit(1)
      .single();
    if (data) {
      setDailyPrompt({
        id: data.id,
        title: data.prompt_text,
        category: data.category,
      });
    }
  };

  const loadFeaturedDua = async () => {
    const { data } = await supabase
      .from('mental_health_duas')
      .select('id, title, translation, emotion_category')
      .eq('is_active', true)
      .order('order_index', { ascending: true })
      .limit(1)
      .single();
    if (data) {
      setFeaturedDua({
        id: data.id,
        title: data.title,
        preview: data.translation,
        category: data.emotion_category,
      });
    }
  };

  const quickStats: QuickStat[] = [
    {
      label: 'Journal Entries',
      value: journalCount.toString(),
      icon: 'book.fill',
      androidIcon: 'menu-book',
      color: colors.gradientPrimary,
    },
    {
      label: 'Day Streak',
      value: moodStreak.toString(),
      icon: 'flame.fill',
      androidIcon: 'local-fire-department',
      color: colors.gradientAccent,
    },
    {
      label: 'Mindful Minutes',
      value: '0',
      icon: 'leaf.fill',
      androidIcon: 'spa',
      color: colors.gradientSecondary,
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <Animated.View 
          style={[
            styles.heroSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={colors.gradientOcean}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <IconSymbol
                ios_icon_name="brain.head.profile"
                android_material_icon_name="psychology"
                size={56}
                color={colors.card}
              />
              <Text style={styles.heroTitle}>Mental Wellness Hub</Text>
              <Text style={styles.heroSubtitle}>
                Your journey to inner peace and emotional balance
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsGrid}>
            {quickStats.map((stat, index) => (
              <React.Fragment key={index}>
                <View style={styles.statCard}>
                  <LinearGradient
                    colors={stat.color}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.statGradient}
                  >
                    <IconSymbol
                      ios_icon_name={stat.icon}
                      android_material_icon_name={stat.androidIcon}
                      size={32}
                      color={colors.card}
                    />
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </LinearGradient>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Daily Prompt Feature */}
        {dailyPrompt && (
          <TouchableOpacity
            style={styles.featureCard}
            activeOpacity={0.8}
            onPress={() => router.push('/journal-prompts' as any)}
          >
            <LinearGradient
              colors={colors.gradientInfo}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.featureGradient}
            >
              <View style={styles.featureBadge}>
                <IconSymbol
                  ios_icon_name="sparkles"
                  android_material_icon_name="auto-awesome"
                  size={16}
                  color={colors.card}
                />
                <Text style={styles.featureBadgeText}>TODAY&apos;S PROMPT</Text>
              </View>
              <Text style={styles.featureTitle}>{dailyPrompt.title}</Text>
              <View style={styles.featureAction}>
                <Text style={styles.featureActionText}>Start Writing</Text>
                <IconSymbol
                  ios_icon_name="arrow.right"
                  android_material_icon_name="arrow-forward"
                  size={20}
                  color={colors.card}
                />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Content Grid */}
        <View style={styles.gridSection}>
          <Text style={styles.sectionTitle}>Explore & Discover</Text>
          
          <View style={styles.gridRow}>
            {/* Journal Card */}
            <TouchableOpacity
              style={styles.gridCard}
              activeOpacity={0.8}
              onPress={() => router.push('/journal' as any)}
            >
              <LinearGradient
                colors={colors.gradientPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gridGradient}
              >
                <IconSymbol
                  ios_icon_name="book.fill"
                  android_material_icon_name="menu-book"
                  size={40}
                  color={colors.card}
                />
                <Text style={styles.gridTitle}>Journal</Text>
                <Text style={styles.gridSubtitle}>Write your thoughts</Text>
                {recentJournal && (
                  <View style={styles.gridBadge}>
                    <Text style={styles.gridBadgeText}>
                      {formatDate(recentJournal.created_at!)}
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Mood Tracker Card */}
            <TouchableOpacity
              style={styles.gridCard}
              activeOpacity={0.8}
              onPress={() => router.push('/mood-tracker' as any)}
            >
              <LinearGradient
                colors={colors.gradientTeal}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gridGradient}
              >
                <IconSymbol
                  ios_icon_name="chart.line.uptrend.xyaxis"
                  android_material_icon_name="insights"
                  size={40}
                  color={colors.card}
                />
                <Text style={styles.gridTitle}>Mood</Text>
                <Text style={styles.gridSubtitle}>Track emotions</Text>
                {moodStreak > 0 && (
                  <View style={styles.gridBadge}>
                    <Text style={styles.gridBadgeText}>{moodStreak} day streak</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.gridRow}>
            {/* Duas Card */}
            <TouchableOpacity
              style={styles.gridCard}
              activeOpacity={0.8}
              onPress={() => router.push('/mental-duas' as any)}
            >
              <LinearGradient
                colors={colors.gradientPurple}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gridGradient}
              >
                <IconSymbol
                  ios_icon_name="hands.sparkles.fill"
                  android_material_icon_name="self-improvement"
                  size={40}
                  color={colors.card}
                />
                <Text style={styles.gridTitle}>Duas</Text>
                <Text style={styles.gridSubtitle}>Healing prayers</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Meditation Card */}
            <TouchableOpacity
              style={styles.gridCard}
              activeOpacity={0.8}
              onPress={() => router.push('/meditation' as any)}
            >
              <LinearGradient
                colors={colors.gradientSecondary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gridGradient}
              >
                <IconSymbol
                  ios_icon_name="leaf.fill"
                  android_material_icon_name="spa"
                  size={40}
                  color={colors.card}
                />
                <Text style={styles.gridTitle}>Meditate</Text>
                <Text style={styles.gridSubtitle}>Find peace</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Featured Story */}
        {featuredStory && (
          <View style={styles.featuredSection}>
            <Text style={styles.sectionTitle}>Featured Story</Text>
            <TouchableOpacity
              style={styles.storyCard}
              activeOpacity={0.8}
              onPress={() => router.push('/prophet-stories' as any)}
            >
              <LinearGradient
                colors={colors.gradientSunset}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.storyGradient}
              >
                <View style={styles.storyHeader}>
                  <View style={styles.storyIconContainer}>
                    <IconSymbol
                      ios_icon_name="book.closed.fill"
                      android_material_icon_name="auto-stories"
                      size={28}
                      color={colors.card}
                    />
                  </View>
                  <View style={styles.storyHeaderText}>
                    <Text style={styles.storyCategory}>{featuredStory.category?.toUpperCase()}</Text>
                    <Text style={styles.storyTitle}>{featuredStory.title}</Text>
                  </View>
                </View>
                <Text style={styles.storyPreview} numberOfLines={3}>
                  {featuredStory.preview}
                </Text>
                <View style={styles.storyAction}>
                  <Text style={styles.storyActionText}>Read More</Text>
                  <IconSymbol
                    ios_icon_name="arrow.right"
                    android_material_icon_name="arrow-forward"
                    size={20}
                    color={colors.card}
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              activeOpacity={0.8}
              onPress={() => router.push('/journal-prompts' as any)}
            >
              <View style={styles.actionIconContainer}>
                <IconSymbol
                  ios_icon_name="lightbulb.fill"
                  android_material_icon_name="lightbulb"
                  size={28}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.actionTitle}>Prompts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              activeOpacity={0.8}
              onPress={() => router.push('/prophet-stories' as any)}
            >
              <View style={styles.actionIconContainer}>
                <IconSymbol
                  ios_icon_name="book.closed.fill"
                  android_material_icon_name="auto-stories"
                  size={28}
                  color={colors.secondary}
                />
              </View>
              <Text style={styles.actionTitle}>Stories</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              activeOpacity={0.8}
              onPress={() => router.push('/emotional-support' as any)}
            >
              <View style={styles.actionIconContainer}>
                <IconSymbol
                  ios_icon_name="heart.fill"
                  android_material_icon_name="favorite"
                  size={28}
                  color={colors.accent}
                />
              </View>
              <Text style={styles.actionTitle}>Support</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              activeOpacity={0.8}
              onPress={() => router.push('/crisis-support' as any)}
            >
              <View style={styles.actionIconContainer}>
                <IconSymbol
                  ios_icon_name="exclamationmark.triangle.fill"
                  android_material_icon_name="warning"
                  size={28}
                  color={colors.error}
                />
              </View>
              <Text style={styles.actionTitle}>Crisis</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Inspirational Quote */}
        <View style={styles.quoteSection}>
          <LinearGradient
            colors={colors.gradientPurple}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.quoteGradient}
          >
            <IconSymbol
              ios_icon_name="quote.opening"
              android_material_icon_name="format-quote"
              size={32}
              color={colors.card}
            />
            <Text style={styles.quoteText}>
              &quot;Verily, with hardship comes ease.&quot;
            </Text>
            <Text style={styles.quoteSource}>Quran 94:6</Text>
          </LinearGradient>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerCard}>
          <IconSymbol
            ios_icon_name="info.circle.fill"
            android_material_icon_name="info"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.disclaimerText}>
            This app provides Islamic guidance and support resources, but is not a substitute for professional mental health care.
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
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
    paddingTop: spacing.lg,
  },
  heroSection: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    ...shadows.large,
  },
  heroGradient: {
    padding: spacing.xxxl,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    ...typography.h1,
    color: colors.card,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.card,
    opacity: 0.95,
    textAlign: 'center',
  },
  statsSection: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.medium,
  },
  statGradient: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h1,
    color: colors.card,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.small,
    color: colors.card,
    opacity: 0.9,
    textAlign: 'center',
  },
  featureCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.large,
  },
  featureGradient: {
    padding: spacing.xxl,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  featureBadgeText: {
    ...typography.smallBold,
    color: colors.card,
  },
  featureTitle: {
    ...typography.h3,
    color: colors.card,
    marginBottom: spacing.lg,
    lineHeight: 32,
  },
  featureAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureActionText: {
    ...typography.bodyBold,
    color: colors.card,
  },
  gridSection: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  gridRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  gridCard: {
    width: CARD_WIDTH,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.medium,
  },
  gridGradient: {
    padding: spacing.lg,
    minHeight: 160,
    justifyContent: 'space-between',
  },
  gridTitle: {
    ...typography.h3,
    color: colors.card,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  gridSubtitle: {
    ...typography.caption,
    color: colors.card,
    opacity: 0.9,
  },
  gridBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  gridBadgeText: {
    ...typography.small,
    color: colors.card,
  },
  featuredSection: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  storyCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.large,
  },
  storyGradient: {
    padding: spacing.xl,
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  storyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyHeaderText: {
    flex: 1,
  },
  storyCategory: {
    ...typography.smallBold,
    color: colors.card,
    opacity: 0.8,
    marginBottom: spacing.xs,
  },
  storyTitle: {
    ...typography.h3,
    color: colors.card,
  },
  storyPreview: {
    ...typography.body,
    color: colors.card,
    opacity: 0.95,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  storyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  storyActionText: {
    ...typography.bodyBold,
    color: colors.card,
  },
  actionsSection: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionCard: {
    width: (SCREEN_WIDTH - spacing.xl * 2 - spacing.md * 3) / 4,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionTitle: {
    ...typography.caption,
    color: colors.text,
    textAlign: 'center',
  },
  quoteSection: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.medium,
  },
  quoteGradient: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  quoteText: {
    ...typography.h3,
    color: colors.card,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  quoteSource: {
    ...typography.bodyBold,
    color: colors.card,
    opacity: 0.9,
  },
  disclaimerCard: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  disclaimerText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 120,
  },
});
