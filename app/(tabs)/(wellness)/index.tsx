
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from "react-native";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";

type WellnessTab = 'mental' | 'physical';

interface WellnessActivity {
  title: string;
  description: string;
  icon: string;
}

export default function WellnessScreen() {
  const [activeTab, setActiveTab] = useState<WellnessTab>('mental');

  const mentalActivities: WellnessActivity[] = [
    {
      title: 'Meditation & Reflection',
      description: 'Practice mindfulness and spiritual reflection',
      icon: 'self-improvement',
    },
    {
      title: 'Gratitude Journal',
      description: 'Write down things you are grateful for',
      icon: 'edit-note',
    },
    {
      title: 'Stress Management',
      description: 'Learn techniques to manage daily stress',
      icon: 'spa',
    },
    {
      title: 'Positive Affirmations',
      description: 'Start your day with positive thoughts',
      icon: 'sentiment-satisfied',
    },
  ];

  const physicalActivities: WellnessActivity[] = [
    {
      title: 'Exercise Routine',
      description: 'Stay active with daily physical activities',
      icon: 'fitness-center',
    },
    {
      title: 'Healthy Eating',
      description: 'Follow a balanced and nutritious diet',
      icon: 'restaurant',
    },
    {
      title: 'Sleep Tracking',
      description: 'Monitor and improve your sleep quality',
      icon: 'bedtime',
    },
    {
      title: 'Hydration',
      description: 'Track your daily water intake',
      icon: 'water-drop',
    },
  ];

  const activities = activeTab === 'mental' ? mentalActivities : physicalActivities;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Wellness</Text>
        <Text style={styles.subtitle}>Take care of your mind and body</Text>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'mental' && styles.tabActive,
            ]}
            onPress={() => setActiveTab('mental')}
            activeOpacity={0.7}
          >
            <IconSymbol
              ios_icon_name="brain"
              android_material_icon_name="psychology"
              size={24}
              color={activeTab === 'mental' ? colors.card : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'mental' && styles.tabTextActive,
              ]}
            >
              Mental
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'physical' && styles.tabActive,
            ]}
            onPress={() => setActiveTab('physical')}
            activeOpacity={0.7}
          >
            <IconSymbol
              ios_icon_name="heart"
              android_material_icon_name="favorite"
              size={24}
              color={activeTab === 'physical' ? colors.card : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'physical' && styles.tabTextActive,
              ]}
            >
              Physical
            </Text>
          </TouchableOpacity>
        </View>

        {/* Activities List */}
        <View style={styles.activitiesContainer}>
          {activities.map((activity, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                style={styles.activityCard}
                activeOpacity={0.7}
                onPress={() => console.log(`Pressed ${activity.title}`)}
              >
                <View style={[styles.activityIconContainer, { backgroundColor: colors.primary }]}>
                  <IconSymbol
                    ios_icon_name={activity.icon}
                    android_material_icon_name={activity.icon}
                    size={28}
                    color={colors.card}
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityDescription}>{activity.description}</Text>
                </View>
                <IconSymbol
                  ios_icon_name="chevron-right"
                  android_material_icon_name="chevron-right"
                  size={24}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </React.Fragment>
          ))}
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
    paddingTop: Platform.OS === 'android' ? 48 : 16,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.card,
  },
  activitiesContainer: {
    marginBottom: 24,
  },
  activityCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  activityIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  bottomPadding: {
    height: 120,
  },
});
