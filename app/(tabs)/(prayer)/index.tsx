
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from "react-native";
import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";

interface PrayerTime {
  name: string;
  time: string;
  completed: boolean;
}

export default function PrayerScreen() {
  const [prayers, setPrayers] = useState<PrayerTime[]>([
    { name: 'Fajr', time: '5:30 AM', completed: false },
    { name: 'Dhuhr', time: '12:45 PM', completed: false },
    { name: 'Asr', time: '4:15 PM', completed: false },
    { name: 'Maghrib', time: '6:30 PM', completed: false },
    { name: 'Isha', time: '8:00 PM', completed: false },
  ]);

  const togglePrayer = (index: number) => {
    const newPrayers = [...prayers];
    newPrayers[index].completed = !newPrayers[index].completed;
    setPrayers(newPrayers);
  };

  const completedCount = prayers.filter(p => p.completed).length;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Prayer Times</Text>
        
        {/* Progress Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>
            {completedCount} of {prayers.length} prayers completed
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(completedCount / prayers.length) * 100}%` }
              ]} 
            />
          </View>
        </View>

        {/* Prayer List */}
        <View style={styles.section}>
          {prayers.map((prayer, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                style={[
                  styles.prayerCard,
                  prayer.completed && styles.prayerCardCompleted
                ]}
                onPress={() => togglePrayer(index)}
                activeOpacity={0.7}
              >
                <View style={styles.prayerInfo}>
                  <Text style={[
                    styles.prayerName,
                    prayer.completed && styles.prayerNameCompleted
                  ]}>
                    {prayer.name}
                  </Text>
                  <Text style={[
                    styles.prayerTime,
                    prayer.completed && styles.prayerTimeCompleted
                  ]}>
                    {prayer.time}
                  </Text>
                </View>
                <View style={[
                  styles.checkbox,
                  prayer.completed && styles.checkboxCompleted
                ]}>
                  {prayer.completed && (
                    <IconSymbol
                      ios_icon_name="checkmark"
                      android_material_icon_name="check"
                      size={20}
                      color={colors.card}
                    />
                  )}
                </View>
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
    marginBottom: 24,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  summaryText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.highlight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  section: {
    marginBottom: 24,
  },
  prayerCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  prayerCardCompleted: {
    backgroundColor: colors.highlight,
  },
  prayerInfo: {
    flex: 1,
  },
  prayerName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  prayerNameCompleted: {
    color: colors.primary,
  },
  prayerTime: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  prayerTimeCompleted: {
    color: colors.primary,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  bottomPadding: {
    height: 120,
  },
});
