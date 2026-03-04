import React from "react";
import { View, StyleSheet, Text, ActivityIndicator } from "react-native";
import { STYLE } from "../../constants/app";
import { THEME_COLORS } from "../../constants/colors";
import LinearGradient from 'react-native-linear-gradient';

// Simple loader for Progress Card section
export const MedicationProgressLoader = () => {
  return (
    <LinearGradient
      colors={['#FCE7F3', '#FBCFE8']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.progressCard}
    >
      <ActivityIndicator size="large" color={THEME_COLORS.primary} />
      <Text style={styles.loadingText}>Loading progress...</Text>
    </LinearGradient>
  );
};

// Simple loader for Medication Cards section
export const MedicationCardsLoader = () => {
  return (
    <View style={styles.medCard}>
      <ActivityIndicator size="small" color={THEME_COLORS.primary} />
      <Text style={styles.loadingText}>Loading medications...</Text>
    </View>
  );
};

// Simple loader for Tips section
export const MedicationTipsLoader = () => {
  return (
    <View style={styles.tipsCard}>
      <ActivityIndicator size="small" color={THEME_COLORS.primary} />
      <Text style={styles.loadingText}>Loading tips...</Text>
    </View>
  );
};

// Combined loader for the entire Medications screen
export const MedicationsScreenLoader = () => {
  return (
    <View style={styles.screenContainer}>
      <ActivityIndicator size="large" color={THEME_COLORS.primary} />
      <Text style={styles.mainLoadingText}>Loading medications...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 40,
  },
  progressCard: {
    marginHorizontal: STYLE.spacing.mh,
    marginTop: 20,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  medCard: {
    backgroundColor: THEME_COLORS.textLight,
    marginHorizontal: STYLE.spacing.mh,
    marginBottom: 12,
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  tipsCard: {
    backgroundColor: THEME_COLORS.textLight,
    marginHorizontal: STYLE.spacing.mh,
    marginTop: 24,
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  mainLoadingText: {
    fontSize: 16,
    color: '#666',
  },
});
