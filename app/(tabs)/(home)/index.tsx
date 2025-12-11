
import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { colors } from "@/styles/commonStyles";

interface PrayerTime {
  name: string;
  time: string;
}

export default function HomeScreen() {
  const prayerTimes: PrayerTime[] = [
    { name: 'Fajr', time: '5:30 AM' },
    { name: 'Dhuhr', time: '12:45 PM' },
    { name: 'Asr', time: '4:15 PM' },
    { name: 'Maghrib', time: '6:30 PM' },
    { name: 'Isha', time: '8:00 PM' },
  ];

  const dailyHadith = {
    text: "The best of you are those who are best to their families.",
    source: "Tirmidhi"
  };

  const dailyVerse = {
    text: "Indeed, with hardship comes ease.",
    reference: "Quran 94:6"
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>As-Salamu Alaykum</Text>
        
        {/* Prayer Times Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prayer Times</Text>
          {prayerTimes.map((prayer, index) => (
            <React.Fragment key={index}>
              <View style={styles.prayerCard}>
                <Text style={styles.prayerName}>{prayer.name}</Text>
                <Text style={styles.prayerTime}>{prayer.time}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Daily Hadith Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Hadith</Text>
          <View style={styles.contentCard}>
            <Text style={styles.contentText}>&quot;{dailyHadith.text}&quot;</Text>
            <Text style={styles.contentSource}>- {dailyHadith.source}</Text>
          </View>
        </View>

        {/* Daily Quran Verse Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Verse</Text>
          <View style={styles.contentCard}>
            <Text style={styles.contentText}>&quot;{dailyVerse.text}&quot;</Text>
            <Text style={styles.contentSource}>- {dailyVerse.reference}</Text>
          </View>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 12,
  },
  prayerCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  prayerName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  prayerTime: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  contentCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  contentSource: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  bottomPadding: {
    height: 120,
  },
});
