
import React, { useCallback, useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, RefreshControl, TouchableOpacity, ActivityIndicator, Animated, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, typography, spacing, borderRadius, shadows } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from '@/contexts/AuthContext';
import { useImanTracker } from '@/contexts/ImanTrackerContext';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import ImanRingsDisplay from "@/components/iman/ImanRingsDisplay";
import IbadahSection from "./ibadah-section";
import IlmSection from "./ilm-section";
import AmanahSection from "./amanah-section";
import AchievementsBadges from "@/components/iman/AchievementsBadges";
import StreakDisplay from "@/components/iman/StreakDisplay";
import AllStreaksDisplay from "@/components/iman/AllStreaksDisplay";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Header animation constants
const HEADER_MAX_HEIGHT = 150;
const HEADER_MIN_HEIGHT = 70;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

// Tab animation constants
const TAB_MAX_HEIGHT = 60;
const TAB_MIN_HEIGHT = 0;
const TAB_SCROLL_DISTANCE = 80;

type TabType = 'tracker' | 'achievements';

export default function ImanTrackerScreen() {
  const { user } = useAuth();
  const { refreshScores } = useImanTracker();
  const [activeTab, setActiveTab] = useState<TabType>('tracker');
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = useState(false);

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;

  // Header height animation
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  // Header content opacity
  const headerContentOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  // Header title scale for collapsed state
  const headerTitleScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  // Tab switcher height animation
  const tabHeight = scrollY.interpolate({
    inputRange: [0, TAB_SCROLL_DISTANCE],
    outputRange: [TAB_MAX_HEIGHT, TAB_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  // Tab switcher opacity
  const tabOpacity = scrollY.interpolate({
    inputRange: [0, TAB_SCROLL_DISTANCE / 2, TAB_SCROLL_DISTANCE],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshScores();
    setRefreshing(false);
  }, [refreshScores]);

  const handleTabChange = (tab: TabType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* COLLAPSING HEADER */}
      <Animated.View 
        style={[
          styles.headerSection,
          { height: headerHeight }
        ]}
      >
        <LinearGradient
          colors={['#667EEA', '#764BA2', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerPattern}>
            <View style={styles.headerPatternCircle1} />
            <View style={styles.headerPatternCircle2} />
            <View style={styles.headerPatternCircle3} />
          </View>
          <Animated.View 
            style={[
              styles.headerContent,
              { opacity: headerContentOpacity }
            ]}
          >
            <Animated.View 
              style={[
                styles.headerTop,
                { transform: [{ scale: headerTitleScale }] }
              ]}
            >
              <View style={styles.headerIconContainer}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)']}
                  style={styles.headerIconGradient}
                >
                  <IconSymbol
                    ios_icon_name="sparkles"
                    android_material_icon_name="auto-awesome"
                    size={32}
                    color="#FFFFFF"
                  />
                </LinearGradient>
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.header}>Iman Tracker</Text>
                <Text style={styles.subtitle}>Track your spiritual journey daily</Text>
              </View>
              <TouchableOpacity
                style={styles.activityButton}
                onPress={() => router.push('/(tabs)/(iman)/activity')}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
                  style={styles.activityButtonGradient}
                >
                  <IconSymbol
                    ios_icon_name="list.bullet.clipboard.fill"
                    android_material_icon_name="assignment"
                    size={22}
                    color="#FFFFFF"
                  />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      {/* COLLAPSING TABS */}
      <Animated.View 
        style={[
          styles.tabsContainer,
          { 
            height: tabHeight,
            opacity: tabOpacity,
          }
        ]}
      >
        <View style={styles.tabsWrapper}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'tracker' && styles.tabActive]}
            onPress={() => handleTabChange('tracker')}
            activeOpacity={0.7}
          >
            {activeTab === 'tracker' ? (
              <LinearGradient
                colors={colors.gradientPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tabGradient}
              >
                <IconSymbol
                  ios_icon_name="chart.pie.fill"
                  android_material_icon_name="pie-chart"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.tabTextActive}>Tracker</Text>
              </LinearGradient>
            ) : (
              <View style={styles.tabInactive}>
                <IconSymbol
                  ios_icon_name="chart.pie.fill"
                  android_material_icon_name="pie-chart"
                  size={20}
                  color={colors.textSecondary}
                />
                <Text style={styles.tabText}>Tracker</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'achievements' && styles.tabActive]}
            onPress={() => handleTabChange('achievements')}
            activeOpacity={0.7}
          >
            {activeTab === 'achievements' ? (
              <LinearGradient
                colors={colors.gradientWarning}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tabGradient}
              >
                <IconSymbol
                  ios_icon_name="trophy.fill"
                  android_material_icon_name="emoji-events"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.tabTextActive} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>Achievements</Text>
              </LinearGradient>
            ) : (
              <View style={styles.tabInactive}>
                <IconSymbol
                  ios_icon_name="trophy.fill"
                  android_material_icon_name="emoji-events"
                  size={20}
                  color={colors.textSecondary}
                />
                <Text style={styles.tabText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>Achievements</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tab}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(tabs)/(iman)/communities');
            }}
            activeOpacity={0.7}
          >
            <View style={styles.tabInactive}>
              <IconSymbol
                ios_icon_name="person.3.fill"
                android_material_icon_name="groups"
                size={20}
                color={colors.textSecondary}
              />
                <Text style={styles.tabText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>Communities</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* TAB CONTENT WITH ANIMATED SCROLL */}
      {activeTab === 'tracker' && (
        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          {/* IMAN RINGS DISPLAY */}
          <ImanRingsDisplay onRefresh={onRefresh} />

          {/* ALL STREAKS DISPLAY */}
          <View style={styles.streakSection}>
            <Text style={styles.streakSectionTitle}>Your Streaks</Text>
            <AllStreaksDisplay />
          </View>

          {/* QUICK ACCESS FEATURES - MOVED UP */}
          <View style={styles.quickAccessSection}>
            <Text style={styles.sectionHeader}>Quick Access</Text>
            <View style={styles.quickAccessGrid}>
              <TouchableOpacity
                style={styles.quickAccessCard}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(tabs)/(iman)/activity' as any);
                }}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#A78BFA', '#8B5CF6', '#7C3AED']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.quickAccessGradient}
                >
                  <View style={styles.quickAccessIconContainer}>
                    <IconSymbol
                      ios_icon_name="list.bullet.clipboard.fill"
                      android_material_icon_name="assignment"
                      size={30}
                      color="#FFFFFF"
                    />
                  </View>
                  <Text style={styles.quickAccessTitle}>Activity</Text>
                  <Text style={styles.quickAccessSubtitle}>View log</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAccessCard}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(tabs)/(iman)/trends' as any);
                }}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#FBBF24', '#F59E0B', '#D97706']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.quickAccessGradient}
                >
                  <View style={styles.quickAccessIconContainer}>
                    <IconSymbol
                      ios_icon_name="chart.line.uptrend.xyaxis"
                      android_material_icon_name="trending-up"
                      size={30}
                      color="#FFFFFF"
                    />
                  </View>
                  <Text style={styles.quickAccessTitle}>Trends</Text>
                  <Text style={styles.quickAccessSubtitle}>View progress</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickAccessCard}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(tabs)/(iman)/goals-settings' as any);
                }}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#34D399', '#10B981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.quickAccessGradient}
                >
                  <View style={styles.quickAccessIconContainer}>
                    <IconSymbol
                      ios_icon_name="target"
                      android_material_icon_name="flag"
                      size={30}
                      color="#FFFFFF"
                    />
                  </View>
                  <Text style={styles.quickAccessTitle}>Goals</Text>
                  <Text style={styles.quickAccessSubtitle}>Set targets</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* SECTION DIVIDER */}
          <View style={styles.sectionDivider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Your Goals</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* DEDICATED SECTIONS FOR EACH RING */}
          <IbadahSection />
          <IlmSection />
          <AmanahSection />

          <View style={styles.bottomPadding} />
        </Animated.ScrollView>
      )}

      {activeTab === 'achievements' && (
        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          {/* Use the AchievementsBadges component which shows all achievements by default */}
          <AchievementsBadges />

          <View style={styles.bottomPadding} />
        </Animated.ScrollView>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxxl,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  headerSection: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: borderRadius.xl + 4,
    overflow: 'hidden',
    ...shadows.large,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerGradient: {
    flex: 1,
    padding: spacing.lg + 4,
    justifyContent: 'center',
    position: 'relative',
  },
  headerPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
  },
  headerPatternCircle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    top: -40,
    right: -40,
  },
  headerPatternCircle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    bottom: -20,
    left: -20,
  },
  headerPatternCircle3: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    top: '50%',
    right: 20,
  },
  headerIconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    gap: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTextContainer: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  activityButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    overflow: 'hidden',
  },
  tabsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  tabsWrapper: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xs + 2,
    ...shadows.large,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  tabActive: {
    ...shadows.small,
  },
  tabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    minWidth: 0,
    borderRadius: borderRadius.md,
  },
  tabInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    backgroundColor: 'transparent',
    minWidth: 0,
    borderRadius: borderRadius.md,
  },
  tabText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    flexShrink: 1,
  },
  tabTextActive: {
    ...typography.caption,
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
    flexShrink: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  bottomPadding: {
    height: 100,
  },
  quickAccessSection: {
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  streakSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  streakSectionTitle: {
    ...typography.h3,
    fontSize: 22,
    color: colors.text,
    marginBottom: spacing.lg,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  sectionHeader: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '800',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
    fontSize: 22,
    letterSpacing: -0.5,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickAccessCard: {
    flex: 1,
    borderRadius: borderRadius.xl + 2,
    overflow: 'hidden',
    ...shadows.large,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  quickAccessGradient: {
    padding: spacing.lg + 4,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
    gap: spacing.sm,
    position: 'relative',
  },
  quickAccessIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    ...shadows.medium,
  },
  quickAccessTitle: {
    ...typography.bodyBold,
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  quickAccessSubtitle: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
  },
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xxl,
    gap: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  dividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    borderRadius: 1,
  },
  dividerText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontSize: 12,
    paddingHorizontal: spacing.sm,
  },
});
