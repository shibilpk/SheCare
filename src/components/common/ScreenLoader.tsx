import React from "react";
import { View, StyleSheet, Text, ActivityIndicator } from "react-native";
import { THEME_COLORS } from "../../constants/colors";

interface ScreenLoaderProps {
  message?: string;
}

export const ScreenLoader: React.FC<ScreenLoaderProps> = ({
  message = "Loading..."
}) => {
  return (
    <View style={styles.screenContainer}>
      <ActivityIndicator size="large" color={THEME_COLORS.primary} />
      <Text style={styles.mainLoadingText}>{message}</Text>
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
  mainLoadingText: {
    fontSize: 16,
    color: '#666',
  },
});
