
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, typography, spacing, borderRadius, shadows } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useImanTracker } from "@/contexts/ImanTrackerContext";
import * as Haptics from 'expo-haptics';

interface MeditationPractice {
  title: string;
  description: string;
  duration: number;
  iosIcon: string;
  androidIcon: string;
  color: string[];
  type: string;
}

interface MeditationSession {
  id: string;
  practice_type: string;
  duration_minutes: number;
  date: string;
  notes: string;
}

export default function MeditationScreen() {
  const { user } = useAuth();
  const { dhikrGoals, updateDhikrGoals, refreshData } = useImanTracker();
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(1);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedPractice, setSelectedPractice] = useState<MeditationPractice | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');

  const practices: MeditationPractice[] = [
    {
      title: 'Dhikr Meditation',
      description: 'Repeat SubhanAllah, Alhamdulillah, Allahu Akbar',
      duration: 10,
      iosIcon: 'sparkles',
      androidIcon: 'auto-awesome',
      color: colors.gradientPrimary,
      type: 'dhikr',
    },
    {
      title: 'Breath Awareness',
      description: 'Focus on your breathing, as taught by the Prophet ﷺ',
      duration: 5,
      iosIcon: 'wind',
      androidIcon: 'air',
      color: colors.gradientInfo,
      type: 'breath',
    },
    {
      title: 'Gratitude Reflection',
      description: 'Reflect on Allah&apos;s blessings in your life',
      duration: 10,
      iosIcon: 'heart.fill',
      androidIcon: 'favorite',
      color: colors.gradientPink,
      type: 'gratitude',
    },
    {
      title: 'Quran Contemplation',
      description: 'Slowly recite and reflect on Quranic verses',
      duration: 15,
      iosIcon: 'book.fill',
      androidIcon: 'menu-book',
      color: colors.gradientSecondary,
      type: 'quran',
    },
    {
      title: 'Nature Connection',
      description: 'Observe Allah&apos;s creation mindfully',
      duration: 15,
      iosIcon: 'leaf.fill',
      androidIcon: 'spa',
      color: colors.gradientOcean,
      type: 'nature',
    },
  ];

  useEffect(() => {
    loadMeditationData();
  }, [user]);

  const loadMeditationData = async () => {
    if (!user) return;

    try {
      // Load today's sessions
      const today = new Date().toISOString().split('T')[0];
      const { data: sessionsData } = await supabase
        .from('meditation_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('created_at', { ascending: false });

      if (sessionsData) {
        setSessions(sessionsData);
        setTodayCount(sessionsData.length);
      }

      // Load goal from iman_tracker_goals
      const { data: goalsData } = await supabase
        .from('iman_tracker_goals')
        .select('meditation_daily_goal, meditation_daily_completed')
        .eq('user_id', user.id)
        .single();

      if (goalsData) {
        setDailyGoal(goalsData.meditation_daily_goal || 1);
        setTodayCount(goalsData.meditation_daily_completed || 0);
      }
    } catch (error) {
      console.error('Error loading meditation data:', error);
    }
  };

  const handleStartPractice = (practice: MeditationPractice) => {
    setSelectedPractice(practice);
    setShowSessionModal(true);
  };

  const handleCompletePractice = async () => {
    if (!user || !selectedPractice) return;

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Save meditation session
      const { error: sessionError } = await supabase
        .from('meditation_sessions')
        .insert({
          user_id: user.id,
          practice_type: selectedPractice.type,
          duration_minutes: selectedPractice.duration,
          notes: sessionNotes,
        });

      if (sessionError) {
        console.error('Error saving session:', sessionError);
        Alert.alert('Error', 'Failed to save meditation session');
        return;
      }

      // Update meditation count in iman_tracker_goals
      const { data: currentGoals } = await supabase
        .from('iman_tracker_goals')
        .select('meditation_daily_completed, meditation_daily_goal')
        .eq('user_id', user.id)
        .single();

      const newCompleted = (currentGoals?.meditation_daily_completed || 0) + 1;

      const { error: updateError } = await supabase
        .from('iman_tracker_goals')
        .update({
          meditation_daily_completed: newCompleted,
          last_updated: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating goals:', updateError);
      }

      // Also increment dhikr if it's a dhikr meditation
      if (selectedPractice.type === 'dhikr' && dhikrGoals) {
        const dhikrIncrement = 33; // Standard tasbih count
        const updatedDhikrGoals = {
          ...dhikrGoals,
          dailyCompleted: dhikrGoals.dailyCompleted + dhikrIncrement,
          weeklyCompleted: dhikrGoals.weeklyCompleted + dhikrIncrement,
        };
        await updateDhikrGoals(updatedDhikrGoals);
      }

      // Refresh data
      await loadMeditationData();
      await refreshData();

      // Close modal and reset
      setShowSessionModal(false);
      setSelectedPractice(null);
      setSessionNotes('');

      Alert.alert(
        'Great Job! 🎉',
        `You completed ${selectedPractice.title}. Keep up the mindful practice!`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error completing practice:', error);
      Alert.alert('Error', 'Failed to complete meditation session');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={colors.gradientOcean}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <IconSymbol
              ios_icon_name="leaf.fill"
              android_material_icon_name="spa"
              size={48}
              color={colors.card}
            />
            <Text style={styles.header}>Meditation & Dhikr</Text>
            <Text style={styles.subtitle}>Mindfulness through Islamic practices</Text>
          </LinearGradient>
        </View>

        {/* Progress Card */}
        {user && (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Today&apos;s Progress</Text>
              <View style={styles.progressBadge}>
                <Text style={styles.progressBadgeText}>
                  {todayCount}/{dailyGoal}
                </Text>
              </View>
            </View>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min(100, (todayCount / dailyGoal) * 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressSubtext}>
              {todayCount >= dailyGoal 
                ? '✨ Goal achieved! Keep the momentum going!' 
                : `${dailyGoal - todayCount} more session${dailyGoal - todayCount === 1 ? '' : 's'} to reach your goal`}
            </Text>
          </View>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <IconSymbol
            ios_icon_name="info.circle.fill"
            android_material_icon_name="info"
            size={24}
            color={colors.primary}
          />
          <Text style={styles.infoText}>
            Islamic mindfulness combines remembrance of Allah with present-moment awareness, bringing peace to the heart and mind. Your meditation sessions are tracked in the Iman Tracker!
          </Text>
        </View>

        {/* Practices List */}
        <View style={styles.practicesContainer}>
          <Text style={styles.sectionTitle}>Mindfulness Practices</Text>
          {practices.map((practice, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                style={styles.practiceCard}
                activeOpacity={0.7}
                onPress={() => handleStartPractice(practice)}
              >
                <LinearGradient
                  colors={practice.color}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.practiceGradient}
                >
                  <View style={styles.practiceIconContainer}>
                    <IconSymbol
                      ios_icon_name={practice.iosIcon}
                      android_material_icon_name={practice.androidIcon}
                      size={32}
                      color={colors.card}
                    />
                  </View>
                  <View style={styles.practiceContent}>
                    <Text style={styles.practiceTitle}>{practice.title}</Text>
                    <Text style={styles.practiceDescription}>{practice.description}</Text>
                    <View style={styles.durationBadge}>
                      <IconSymbol
                        ios_icon_name="clock.fill"
                        android_material_icon_name="schedule"
                        size={14}
                        color={colors.card}
                      />
                      <Text style={styles.durationText}>{practice.duration} min</Text>
                    </View>
                  </View>
                  <IconSymbol
                    ios_icon_name="play.circle.fill"
                    android_material_icon_name="play-circle"
                    size={36}
                    color={colors.card}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        {/* Tips Section */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Mindfulness Tips</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={20}
                color={colors.success}
              />
              <Text style={styles.tipText}>Find a quiet, comfortable space</Text>
            </View>
            <View style={styles.tipItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={20}
                color={colors.success}
              />
              <Text style={styles.tipText}>Start with just 5 minutes daily</Text>
            </View>
            <View style={styles.tipItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={20}
                color={colors.success}
              />
              <Text style={styles.tipText}>Be patient with yourself</Text>
            </View>
            <View style={styles.tipItem}>
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check-circle"
                size={20}
                color={colors.success}
              />
              <Text style={styles.tipText}>Practice regularly for best results</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Session Completion Modal */}
      <Modal
        visible={showSessionModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSessionModal(false)}
      >
        {selectedPractice && (
          <SafeAreaView style={styles.modalContainer} edges={['top']}>
            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => setShowSessionModal(false)}
                  style={styles.closeButton}
                >
                  <IconSymbol
                    ios_icon_name="xmark"
                    android_material_icon_name="close"
                    size={24}
                    color={colors.text}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.sessionCard}>
                <LinearGradient
                  colors={selectedPractice.color}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.sessionHeader}
                >
                  <IconSymbol
                    ios_icon_name={selectedPractice.iosIcon}
                    android_material_icon_name={selectedPractice.androidIcon}
                    size={48}
                    color={colors.card}
                  />
                  <Text style={styles.sessionTitle}>{selectedPractice.title}</Text>
                  <Text style={styles.sessionDuration}>{selectedPractice.duration} minutes</Text>
                </LinearGradient>

                <View style={styles.sessionContent}>
                  <Text style={styles.sessionInstructions}>
                    Take your time with this practice. When you&apos;re done, mark it as complete below.
                  </Text>

                  <View style={styles.notesSection}>
                    <Text style={styles.notesLabel}>Notes (optional)</Text>
                    <TextInput
                      style={styles.notesInput}
                      placeholder="How did you feel during this practice?"
                      placeholderTextColor={colors.textSecondary}
                      value={sessionNotes}
                      onChangeText={setSessionNotes}
                      multiline
                      numberOfLines={4}
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.completeButton}
                    onPress={handleCompletePractice}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={colors.gradientSuccess}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.completeButtonGradient}
                    >
                      <IconSymbol
                        ios_icon_name="checkmark.circle.fill"
                        android_material_icon_name="check-circle"
                        size={24}
                        color={colors.card}
                      />
                      <Text style={styles.completeButtonText}>Mark as Complete</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
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
    paddingHorizontal: spacing.xl,
  },
  headerContainer: {
    marginBottom: spacing.xxl,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.large,
  },
  headerGradient: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  header: {
    ...typography.h1,
    color: colors.card,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.card,
    textAlign: 'center',
    opacity: 0.95,
  },
  progressCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.medium,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressTitle: {
    ...typography.h4,
    color: colors.text,
  },
  progressBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  progressBadgeText: {
    ...typography.bodyBold,
    color: colors.card,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.highlight,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },
  progressSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  infoText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    lineHeight: 22,
  },
  practicesContainer: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  practiceCard: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    ...shadows.medium,
  },
  practiceGradient: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    alignItems: 'center',
  },
  practiceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  practiceContent: {
    flex: 1,
  },
  practiceTitle: {
    ...typography.h4,
    color: colors.card,
    marginBottom: spacing.xs,
  },
  practiceDescription: {
    ...typography.caption,
    color: colors.card,
    opacity: 0.9,
    marginBottom: spacing.sm,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  durationText: {
    ...typography.smallBold,
    color: colors.card,
  },
  tipsCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.medium,
  },
  tipsTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  tipsList: {
    gap: spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  tipText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  bottomPadding: {
    height: 120,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.lg,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  sessionCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.xxl,
    ...shadows.large,
  },
  sessionHeader: {
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  sessionTitle: {
    ...typography.h2,
    color: colors.card,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  sessionDuration: {
    ...typography.bodyBold,
    color: colors.card,
    opacity: 0.9,
  },
  sessionContent: {
    padding: spacing.xl,
  },
  sessionInstructions: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    lineHeight: 24,
  },
  notesSection: {
    marginBottom: spacing.xxl,
  },
  notesLabel: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  notesInput: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.highlight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  completeButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.medium,
  },
  completeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  completeButtonText: {
    ...typography.h4,
    color: colors.card,
  },
});
