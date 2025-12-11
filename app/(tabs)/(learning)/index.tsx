
import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from "react-native";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";

interface LearningSection {
  title: string;
  description: string;
  icon: string;
  color: string;
}

export default function LearningScreen() {
  const sections: LearningSection[] = [
    {
      title: 'Islamic Lectures',
      description: 'Listen to inspiring lectures from scholars',
      icon: 'play-circle',
      color: colors.primary,
    },
    {
      title: 'Quran Recitations',
      description: 'Beautiful recitations of the Holy Quran',
      icon: 'headset',
      color: colors.accent,
    },
    {
      title: 'Quizzes',
      description: 'Test your Islamic knowledge',
      icon: 'quiz',
      color: colors.secondary,
    },
    {
      title: 'Duas',
      description: 'Learn daily supplications',
      icon: 'auto-stories',
      color: colors.primary,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Learning Center</Text>
        <Text style={styles.subtitle}>Expand your Islamic knowledge</Text>

        <View style={styles.sectionsContainer}>
          {sections.map((section, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                style={styles.sectionCard}
                activeOpacity={0.7}
                onPress={() => console.log(`Pressed ${section.title}`)}
              >
                <View style={[styles.iconContainer, { backgroundColor: section.color }]}>
                  <IconSymbol
                    ios_icon_name={section.icon}
                    android_material_icon_name={section.icon}
                    size={32}
                    color={colors.card}
                  />
                </View>
                <View style={styles.sectionContent}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <Text style={styles.sectionDescription}>{section.description}</Text>
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

        {/* Placeholder for content */}
        <View style={styles.placeholderCard}>
          <IconSymbol
            ios_icon_name="cloud-upload"
            android_material_icon_name="cloud-upload"
            size={48}
            color={colors.textSecondary}
          />
          <Text style={styles.placeholderTitle}>Content Coming Soon</Text>
          <Text style={styles.placeholderText}>
            Upload your Islamic lectures, Quran recitations, and other learning materials via Supabase.
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
    marginBottom: 32,
    textAlign: 'center',
  },
  sectionsContainer: {
    marginBottom: 24,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  sectionContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  placeholderCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 120,
  },
});
