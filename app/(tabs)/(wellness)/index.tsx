
import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, typography, spacing, borderRadius, shadows } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from 'expo-haptics';
import { useImanTracker } from "@/contexts/ImanTrackerContext";
import { router } from "expo-router";

const HEADER_MAX_HEIGHT = 200;
const HEADER_MIN_HEIGHT = 70;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

type WellnessTab = 'mental' | 'physical';

export default function WellnessScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const { amanahGoals, sectionScores } = useImanTracker();
  const [activeTab, setActiveTab] = useState<WellnessTab>('mental');

  // Calculate Amanah completion percentage
  const calculateAmanahCompletion = () => {
    if (!amanahGoals) return 0;
    
    let totalGoals = 0;
    let completedGoals = 0;
    
    // Physical goals
    if (amanahGoals.dailyExerciseGoal > 0) {
      totalGoals++;
      if (amanahGoals.dailyExerciseCompleted >= amanahGoals.dailyExerciseGoal) completedGoals++;
    }
    if (amanahGoals.dailyWaterGoal > 0) {
      totalGoals++;
      if (amanahGoals.dailyWaterCompleted >= amanahGoals.dailyWaterGoal) completedGoals++;
    }
    if (amanahGoals.weeklyWorkoutGoal > 0) {
      totalGoals++;
      if (amanahGoals.weeklyWorkoutCompleted >= amanahGoals.weeklyWorkoutGoal) completedGoals++;
    }
    
    // Mental goals
    if (amanahGoals.weeklyMentalHealthGoal > 0) {
      totalGoals++;
      if (amanahGoals.weeklyMentalHealthCompleted >= amanahGoals.weeklyMentalHealthGoal) completedGoals++;
    }
    if (amanahGoals.weeklyStressManagementGoal > 0) {
      totalGoals++;
      if (amanahGoals.weeklyStressManagementCompleted >= amanahGoals.weeklyStressManagementGoal) completedGoals++;
    }
    
    // Sleep goals
    if (amanahGoals.dailySleepGoal > 0) {
      totalGoals++;
      if (amanahGoals.dailySleepCompleted >= amanahGoals.dailySleepGoal) completedGoals++;
    }
    
    return totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
  };

  const amanahCompletion = calculateAmanahCompletion();
  const amanahScore = sectionScores.amanah || 0;

  // Header animations
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  const iconScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.6],
    extrapolate: 'clamp',
  });

  const handleTabChange = (tab: WellnessTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Collapsing Header - REDUCED HEIGHT */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <LinearGradient
          colors={colors.gradientOcean}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          {/* Collapsed Title (visible when scrolled) */}
          <Animated.View style={[styles.collapsedHeader, { opacity: titleOpacity }]}>
            <IconSymbol
              ios_icon_name="heart.circle.fill"
              android_material_icon_name="favorite"
              size={24}
              color={colors.card}
            />
            <Text style={styles.collapsedTitle}>Wellness Hub</Text>
          </Animated.View>

          {/* Expanded Header Content (visible when not scrolled) - SIMPLIFIED */}
          <Animated.View style={[styles.expandedHeader, { opacity: headerOpacity }]}>
            <View style={styles.headerRow}>
              <Animated.View style={{ transform: [{ scale: iconScale }] }}>
                <IconSymbol
                  ios_icon_name="heart.circle.fill"
                  android_material_icon_name="favorite"
                  size={32}
                  color={colors.card}
                />
              </Animated.View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Wellness Hub</Text>
                <Text style={styles.headerSubtitle}>Nurture mind, body & soul</Text>
              </View>
            </View>

            {/* Compact Amanah Score */}
            <View style={styles.amanahCompact}>
              <View style={styles.amanahScoreCircle}>
                <Text style={styles.amanahScoreText}>{Math.round(amanahScore)}</Text>
              </View>
              <View style={styles.amanahInfo}>
                <Text style={styles.amanahInfoTitle}>Well-Being Score</Text>
                <Text style={styles.amanahInfoText}>{amanahCompletion}% goals completed</Text>
              </View>
            </View>
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      {/* Tab Switcher - Now positioned dynamically below the header */}
      <Animated.View style={[styles.tabSwitcherContainer, { top: headerHeight }]}>
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'mental' && styles.tabActive]}
            onPress={() => handleTabChange('mental')}
            activeOpacity={0.7}
          >
            {activeTab === 'mental' ? (
              <LinearGradient
                colors={colors.gradientPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tabGradient}
              >
                <IconSymbol
                  ios_icon_name="brain.head.profile"
                  android_material_icon_name="psychology"
                  size={18}
                  color={colors.card}
                />
                <Text style={styles.tabTextActive}>Mental</Text>
              </LinearGradient>
            ) : (
              <View style={styles.tabContent}>
                <IconSymbol
                  ios_icon_name="brain.head.profile"
                  android_material_icon_name="psychology"
                  size={18}
                  color={colors.textSecondary}
                />
                <Text style={styles.tabText}>Mental</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'physical' && styles.tabActive]}
            onPress={() => handleTabChange('physical')}
            activeOpacity={0.7}
          >
            {activeTab === 'physical' ? (
              <LinearGradient
                colors={colors.gradientWarning}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tabGradient}
              >
                <IconSymbol
                  ios_icon_name="figure.run"
                  android_material_icon_name="directions-run"
                  size={18}
                  color={colors.card}
                />
                <Text style={styles.tabTextActive}>Physical</Text>
              </LinearGradient>
            ) : (
              <View style={styles.tabContent}>
                <IconSymbol
                  ios_icon_name="figure.run"
                  android_material_icon_name="directions-run"
                  size={18}
                  color={colors.textSecondary}
                />
                <Text style={styles.tabText}>Physical</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        {/* Add padding at the top to account for header + tabs */}
        <View style={styles.contentTopPadding} />

        {activeTab === 'mental' ? (
          <View style={styles.section}>
            <View style={styles.cardsGrid}>
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(tabs)/(wellness)/journal' as any);
                }}
              >
                <LinearGradient
                  colors={colors.gradientPrimary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                >
                  <IconSymbol
                    ios_icon_name="book.fill"
                    android_material_icon_name="menu-book"
                    size={32}
                    color={colors.card}
                  />
                  <Text style={styles.cardTitle}>Journal</Text>
                  <Text style={styles.cardSubtitle}>Express thoughts</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(tabs)/(wellness)/meditation' as any);
                }}
              >
                <LinearGradient
                  colors={colors.gradientTeal}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                >
                  <IconSymbol
                    ios_icon_name="leaf.fill"
                    android_material_icon_name="spa"
                    size={32}
                    color={colors.card}
                  />
                  <Text style={styles.cardTitle}>Meditation</Text>
                  <Text style={styles.cardSubtitle}>Find peace</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(tabs)/(wellness)/mental-duas' as any);
                }}
              >
                <LinearGradient
                  colors={colors.gradientPurple}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                >
                  <IconSymbol
                    ios_icon_name="hands.sparkles.fill"
                    android_material_icon_name="self-improvement"
                    size={32}
                    color={colors.card}
                  />
                  <Text style={styles.cardTitle}>Healing Duas</Text>
                  <Text style={styles.cardSubtitle}>Spiritual comfort</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(tabs)/(wellness)/emotional-support' as any);
                }}
              >
                <LinearGradient
                  colors={colors.gradientAccent}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                >
                  <IconSymbol
                    ios_icon_name="heart.fill"
                    android_material_icon_name="favorite"
                    size={32}
                    color={colors.card}
                  />
                  <Text style={styles.cardTitle}>Support</Text>
                  <Text style={styles.cardSubtitle}>Get guidance</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(tabs)/(wellness)/prophet-stories' as any);
                }}
              >
                <LinearGradient
                  colors={colors.gradientInfo}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                >
                  <IconSymbol
                    ios_icon_name="book.pages.fill"
                    android_material_icon_name="auto-stories"
                    size={32}
                    color={colors.card}
                  />
                  <Text style={styles.cardTitle}>Prophet Stories</Text>
                  <Text style={styles.cardSubtitle}>Learn & reflect</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.cardsGrid}>
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(tabs)/(wellness)/activity-tracker' as any);
                }}
              >
                <LinearGradient
                  colors={colors.gradientWarning}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                >
                  <IconSymbol
                    ios_icon_name="figure.mixed.cardio"
                    android_material_icon_name="fitness-center"
                    size={32}
                    color={colors.card}
                  />
                  <Text style={styles.cardTitle}>Activity</Text>
                  <Text style={styles.cardSubtitle}>Log workouts</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(tabs)/(wellness)/sleep-tracker' as any);
                }}
              >
                <LinearGradient
                  colors={colors.gradientSecondary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                >
                  <IconSymbol
                    ios_icon_name="moon.stars.fill"
                    android_material_icon_name="bedtime"
                    size={32}
                    color={colors.card}
                  />
                  <Text style={styles.cardTitle}>Sleep</Text>
                  <Text style={styles.cardSubtitle}>Monitor rest</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(tabs)/(wellness)/physical-goals' as any);
                }}
              >
                <LinearGradient
                  colors={colors.gradientInfo}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                >
                  <IconSymbol
                    ios_icon_name="target"
                    android_material_icon_name="track-changes"
                    size={32}
                    color={colors.card}
                  />
                  <Text style={styles.cardTitle}>Goals</Text>
                  <Text style={styles.cardSubtitle}>Set & achieve</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Crisis Support Banner */}
        <TouchableOpacity
          style={styles.crisisCard}
          activeOpacity={0.8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(tabs)/(wellness)/crisis-support' as any);
          }}
        >
          <LinearGradient
            colors={['#FF6B6B', '#EE5A6F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.crisisGradient}
          >
            <View style={styles.crisisContent}>
              <IconSymbol
                ios_icon_name="exclamationmark.triangle.fill"
                android_material_icon_name="warning"
                size={28}
                color={colors.card}
              />
              <View style={styles.crisisText}>
                <Text style={styles.crisisTitle}>Need Help?</Text>
                <Text style={styles.crisisSubtitle}>24/7 crisis support</Text>
              </View>
            </View>
            <IconSymbol
              ios_icon_name="arrow.right.circle.fill"
              android_material_icon_name="arrow-forward"
              size={24}
              color={colors.card}
            />
          </LinearGradient>
        </TouchableOpacity>

        {/* Inspirational Quote */}
        <View style={styles.quoteSection}>
          <LinearGradient
            colors={colors.gradientTeal}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.quoteGradient}
          >
            <IconSymbol
              ios_icon_name="quote.opening"
              android_material_icon_name="format-quote"
              size={28}
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
            size={18}
            color={colors.primary}
          />
          <Text style={styles.disclaimerText}>
            This app provides Islamic guidance and support resources, but is not a substitute for professional mental health care.
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.large,
  },
  headerGradient: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  collapsedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_MIN_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  collapsedTitle: {
    ...typography.h4,
    color: colors.card,
  },
  expandedHeader: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.card,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.card,
    opacity: 0.95,
  },
  amanahCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  amanahScoreCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amanahScoreText: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: '800',
  },
  amanahInfo: {
    flex: 1,
  },
  amanahInfoTitle: {
    ...typography.bodyBold,
    color: colors.card,
    marginBottom: 2,
  },
  amanahInfoText: {
    ...typography.caption,
    color: colors.card,
    opacity: 0.9,
  },
  tabSwitcherContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  tabSwitcher: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    borderColor: 'transparent',
  },
  tabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
  },
  tabText: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.textSecondary,
  },
  tabTextActive: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.card,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
  },
  contentTopPadding: {
    height: HEADER_MAX_HEIGHT + 60,
  },
  section: {
    marginBottom: spacing.xl,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  card: {
    width: '48%',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.medium,
  },
  cardGradient: {
    padding: spacing.lg,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    ...typography.bodyBold,
    fontSize: 16,
    color: colors.card,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  cardSubtitle: {
    ...typography.small,
    color: colors.card,
    opacity: 0.9,
    textAlign: 'center',
  },
  crisisCard: {
    marginBottom: spacing.xl,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.large,
  },
  crisisGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  crisisContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  crisisText: {
    flex: 1,
  },
  crisisTitle: {
    ...typography.bodyBold,
    color: colors.card,
    marginBottom: spacing.xs,
  },
  crisisSubtitle: {
    ...typography.caption,
    color: colors.card,
    opacity: 0.9,
  },
  quoteSection: {
    marginBottom: spacing.xl,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.medium,
  },
  quoteGradient: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  quoteText: {
    ...typography.h4,
    color: colors.card,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    fontStyle: 'italic',
  },
  quoteSource: {
    ...typography.bodyBold,
    color: colors.card,
    opacity: 0.9,
  },
  disclaimerCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  disclaimerText: {
    ...typography.small,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  bottomPadding: {
    height: 100,
  },
});
</write file>

<write file="components/FloatingTabBar.tsx">
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/IconSymbol';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Href } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

export interface TabBarItem {
  name: string;
  route: Href;
  icon: keyof typeof MaterialIcons.glyphMap;
  iosIcon?: string;
  label: string;
}

interface FloatingTabBarProps {
  tabs: TabBarItem[];
}

export default function FloatingTabBar({ tabs }: FloatingTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Initialize animation value at the top level
  const animatedValue = useSharedValue(0);
  
  // Create scale values for each tab - moved outside useMemo
  const scaleValue0 = useSharedValue(1);
  const scaleValue1 = useSharedValue(1);
  const scaleValue2 = useSharedValue(1);
  const scaleValue3 = useSharedValue(1);
  const scaleValue4 = useSharedValue(1);
  
  // Store scale values in an array using useMemo (without calling hooks inside)
  const scaleValues = React.useMemo(() => {
    return [scaleValue0, scaleValue1, scaleValue2, scaleValue3, scaleValue4].slice(0, tabs.length);
  }, [scaleValue0, scaleValue1, scaleValue2, scaleValue3, scaleValue4, tabs]);

  // Find the center tab index (should be Iman)
  const centerTabIndex = Math.floor(tabs.length / 2);

  // Improved active tab detection with better path matching
  const activeTabIndex = React.useMemo(() => {
    console.log('Current pathname:', pathname);
    
    // Find the best matching tab based on the current pathname
    let bestMatch = -1;
    let bestMatchScore = 0;

    tabs.forEach((tab, index) => {
      let score = 0;
      const tabRoute = tab.route as string;

      // Exact route match gets highest score
      if (pathname === tabRoute) {
        score = 100;
      }
      // Check if pathname starts with tab route (for nested routes)
      else if (pathname.startsWith(tabRoute)) {
        score = 80;
      }
      // Check if pathname contains the tab name
      else if (pathname.includes(tab.name)) {
        score = 60;
      }
      // Check for partial matches in the route
      else if (tabRoute.includes('/(tabs)/') && pathname.includes(tabRoute.split('/(tabs)/')[1])) {
        score = 40;
      }

      console.log(`Tab ${tab.name} (${tabRoute}) score: ${score}`);

      if (score > bestMatchScore) {
        bestMatchScore = score;
        bestMatch = index;
      }
    });

    console.log('Active tab index:', bestMatch);
    // Default to first tab if no match found
    return bestMatch >= 0 ? bestMatch : 0;
  }, [pathname, tabs]);

  React.useEffect(() => {
    if (activeTabIndex >= 0) {
      animatedValue.value = withSpring(activeTabIndex, {
        damping: 20,
        stiffness: 120,
        mass: 1,
      });

      // Animate scale for active tab
      scaleValues.forEach((scale, index) => {
        if (index === activeTabIndex) {
          scale.value = withSpring(1.1, {
            damping: 15,
            stiffness: 150,
          });
        } else {
          scale.value = withSpring(1, {
            damping: 15,
            stiffness: 150,
          });
        }
      });
    }
  }, [activeTabIndex, animatedValue, scaleValues]);

  const handleTabPress = (route: Href, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route);
  };

  const tabWidth = 100 / tabs.length;

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            animatedValue.value,
            [0, tabs.length - 1],
            [0, tabWidth * (tabs.length - 1)]
          ),
        },
      ],
      width: `${tabWidth}%`,
    };
  });

  return (
    <View style={styles.wrapper}>
      <BlurView intensity={80} tint="light" style={styles.blurContainer}>
        <View style={styles.container}>
          <View style={styles.tabsContainer}>
            {tabs.map((tab, index) => {
              const isActive = activeTabIndex === index;
              const isCenterTab = index === centerTabIndex;

              // Center tab (Iman) gets special treatment - SMALLER and FITS IN TAB BAR
              if (isCenterTab) {
                return (
                  <React.Fragment key={index}>
                    <TouchableOpacity
                      style={styles.centerTabWrapper}
                      onPress={() => handleTabPress(tab.route, index)}
                      activeOpacity={0.8}
                    >
                      <AnimatedCenterTab
                        scaleValue={scaleValues[index]}
                        isActive={isActive}
                        tab={tab}
                      />
                      <Text
                        style={[
                          styles.centerTabLabel,
                          isActive && styles.centerTabLabelActive,
                        ]}
                        numberOfLines={1}
                      >
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  </React.Fragment>
                );
              }

              // Regular tabs
              return (
                <React.Fragment key={index}>
                  <TouchableOpacity
                    style={styles.tab}
                    onPress={() => handleTabPress(tab.route, index)}
                    activeOpacity={0.7}
                  >
                    <AnimatedRegularTab
                      scaleValue={scaleValues[index]}
                      isActive={isActive}
                      tab={tab}
                    />
                  </TouchableOpacity>
                </React.Fragment>
              );
            })}
          </View>
        </View>
      </BlurView>
    </View>
  );
}

// Separate component for animated center tab to avoid hooks in callbacks
function AnimatedCenterTab({ 
  scaleValue, 
  isActive, 
  tab 
}: { 
  scaleValue: Animated.SharedValue<number>; 
  isActive: boolean; 
  tab: TabBarItem;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  return (
    <Animated.View style={[styles.centerTab, animatedStyle]}>
      <LinearGradient
        colors={isActive ? colors.gradientOcean : colors.gradientPrimary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.centerTabGradient}
      >
        <View style={styles.centerIconContainer}>
          <IconSymbol
            android_material_icon_name={tab.icon}
            ios_icon_name={tab.iosIcon || tab.icon}
            size={28}
            color="#FFFFFF"
          />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

// Separate component for animated regular tab to avoid hooks in callbacks
function AnimatedRegularTab({ 
  scaleValue, 
  isActive, 
  tab 
}: { 
  scaleValue: Animated.SharedValue<number>; 
  isActive: boolean; 
  tab: TabBarItem;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  return (
    <Animated.View style={[styles.tabContent, animatedStyle]}>
      <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
        <IconSymbol
          android_material_icon_name={tab.icon}
          ios_icon_name={tab.iosIcon || tab.icon}
          size={24}
          color={isActive ? colors.primary : colors.textSecondary}
        />
      </View>
      <Text
        style={[
          styles.tabLabel,
          isActive && styles.tabLabelActive,
        ]}
        numberOfLines={1}
      >
        {tab.label}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: '0px -4px 12px rgba(139, 92, 246, 0.15)',
      },
    }),
    marginBottom: 8,
  },
  blurContainer: {
    overflow: 'hidden',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    width: '100%',
    position: 'relative',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tabsContainer: {
    flexDirection: 'row',
    height: 72,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: 'transparent',
  },
  iconContainerActive: {
    backgroundColor: colors.highlight,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  // Center tab (Iman) special styles - SMALLER SIZE TO FIT IN TAB BAR
  centerTabWrapper: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  centerTab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginBottom: 4,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 4px 8px rgba(139, 92, 246, 0.3)',
      },
    }),
  },
  centerTabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  centerIconContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTabLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.textSecondary,
  },
  centerTabLabelActive: {
    color: colors.primary,
    fontWeight: '800',
  },
});
