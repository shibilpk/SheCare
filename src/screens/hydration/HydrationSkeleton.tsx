import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import ContentLoader, { Rect, Circle } from "react-content-loader/native";
import { STYLE } from "../../constants/app";
import { THEME_COLORS } from "../../constants/colors";
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get("window");
const cardWidth = width - STYLE.spacing.ph * 2;

// Skeleton for Hydration Log (Progress Card + Water Controls)
export const HydrationLogSkeleton = () => {
  return (
    <>
      {/* Progress Card Skeleton */}
      <LinearGradient
        colors={['#ffd1b3', '#fcbcb9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.progressCard}
      >
        <ContentLoader
          speed={1.2}
          width={cardWidth}
          height={320}
          viewBox={`0 0 ${cardWidth} 320`}
          backgroundColor="rgba(255, 255, 255, 0.3)"
          foregroundColor="rgba(255, 255, 255, 0.5)"
        >
          {/* Header - Title and Badge */}
          <Rect x="20" y="16" rx="4" ry="4" width="140" height="18" />
          <Rect x={cardWidth - 80} y="14" rx="10" ry="10" width="60" height="22" />

          {/* Stats Cards Row */}
          <Rect x="20" y="50" rx="12" ry="12" width={(cardWidth - 60) / 3} height="70" />
          <Rect x={(cardWidth - 40) / 3 + 30} y="50" rx="12" ry="12" width={(cardWidth - 60) / 3} height="70" />
          <Rect x={(cardWidth - 40) * 2 / 3 + 40} y="50" rx="12" ry="12" width={(cardWidth - 60) / 3} height="70" />

          {/* Circular Progress */}
          <Circle cx={cardWidth / 2} cy="170" r="50" />

          {/* Progress Bar */}
          <Rect x="16" y="245" rx="5" ry="5" width={cardWidth - 32} height="10" />

          {/* Remaining text */}
          <Rect x={cardWidth / 2 - 70} y="270" rx="4" ry="4" width="140" height="14" />
        </ContentLoader>
      </LinearGradient>

      {/* Water Controls Card Skeleton */}
      <View style={styles.controlsCard}>
        <ContentLoader
          speed={1.2}
          width={cardWidth}
          height={100}
          viewBox={`0 0 ${cardWidth} 100`}
          backgroundColor="#E5E7EB"
          foregroundColor="#F3F4F6"
        >
          {/* Remove button */}
          <Rect x="20" y="20" rx="14" ry="14" width={(cardWidth - 60) / 3} height="60" />

          {/* Center glass display */}
          <Circle cx={cardWidth / 2} cy="30" r="24" />
          <Rect x={cardWidth / 2 - 25} y="62" rx="4" ry="4" width="50" height="16" />

          {/* Add button */}
          <Rect x={(cardWidth - 40) * 2 / 3 + 20} y="20" rx="14" ry="14" width={(cardWidth - 60) / 3} height="60" />
        </ContentLoader>
      </View>

      {/* Quick Add Card Skeleton */}
      <View style={styles.quickAddCard}>
        <ContentLoader
          speed={1.2}
          width={cardWidth}
          height={70}
          viewBox={`0 0 ${cardWidth} 70`}
          backgroundColor="#E5E7EB"
          foregroundColor="#F3F4F6"
        >
          {/* Title */}
          <Rect x="14" y="14" rx="4" ry="4" width="80" height="16" />

          {/* Quick add buttons */}
          <Rect x="14" y="40" rx="10" ry="10" width={(cardWidth - 44) / 3} height="44" />
          <Rect x={(cardWidth - 28) / 3 + 18} y="40" rx="10" ry="10" width={(cardWidth - 44) / 3} height="44" />
          <Rect x={(cardWidth - 28) * 2 / 3 + 22} y="40" rx="10" ry="10" width={(cardWidth - 44) / 3} height="44" />
        </ContentLoader>
      </View>
    </>
  );
};

// Skeleton for Hydration Content (Benefits & Tips)
export const HydrationContentSkeleton = () => {
  return (
    <>
      {/* Benefits Card */}
      <View style={styles.infoCard}>
        <ContentLoader
          speed={1.2}
          width={cardWidth}
          height={180}
          viewBox={`0 0 ${cardWidth} 180`}
          backgroundColor="#E5E7EB"
          foregroundColor="#F3F4F6"
        >
          {/* Header */}
          <Circle cx="20" cy="20" r="12" />
          <Rect x="44" y="12" rx="4" ry="4" width="150" height="18" />

          {/* Benefit items */}
          <Rect x="20" y="50" rx="4" ry="4" width="16" height="16" />
          <Rect x="44" y="50" rx="4" ry="4" width={cardWidth - 64} height="14" />

          <Rect x="20" y="80" rx="4" ry="4" width="16" height="16" />
          <Rect x="44" y="80" rx="4" ry="4" width={cardWidth - 64} height="14" />

          <Rect x="20" y="110" rx="4" ry="4" width="16" height="16" />
          <Rect x="44" y="110" rx="4" ry="4" width={cardWidth - 64} height="14" />

          <Rect x="20" y="140" rx="4" ry="4" width="16" height="16" />
          <Rect x="44" y="140" rx="4" ry="4" width={cardWidth - 64} height="14" />
        </ContentLoader>
      </View>

      {/* Tips Card */}
      <View style={[styles.infoCard, { marginTop: STYLE.spacing.mv }]}>
        <ContentLoader
          speed={1.2}
          width={cardWidth}
          height={180}
          viewBox={`0 0 ${cardWidth} 180`}
          backgroundColor="#E5E7EB"
          foregroundColor="#F3F4F6"
        >
          {/* Header */}
          <Circle cx="20" cy="20" r="12" />
          <Rect x="44" y="12" rx="4" ry="4" width="130" height="18" />

          {/* Tip items */}
          <Rect x="20" y="50" rx="4" ry="4" width="16" height="16" />
          <Rect x="44" y="50" rx="4" ry="4" width={cardWidth - 64} height="14" />

          <Rect x="20" y="80" rx="4" ry="4" width="16" height="16" />
          <Rect x="44" y="80" rx="4" ry="4" width={cardWidth - 64} height="14" />

          <Rect x="20" y="110" rx="4" ry="4" width="16" height="16" />
          <Rect x="44" y="110" rx="4" ry="4" width={cardWidth - 64} height="14" />

          <Rect x="20" y="140" rx="4" ry="4" width="16" height="16" />
          <Rect x="44" y="140" rx="4" ry="4" width={cardWidth - 64} height="14" />
        </ContentLoader>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  progressCard: {
    marginTop: 8,
    marginBottom: STYLE.spacing.mv,
    borderRadius: 18,
    overflow: 'hidden',
    padding: 16,
  },
  controlsCard: {
    backgroundColor: THEME_COLORS.textLight,
    marginBottom: STYLE.spacing.mv,
    padding: 16,
    borderRadius: 18,
  },
  quickAddCard: {
    backgroundColor: THEME_COLORS.textLight,
    marginBottom: STYLE.spacing.mv,
    padding: 14,
    borderRadius: 18,
  },
  infoCard: {
    backgroundColor: THEME_COLORS.textLight,
    marginBottom: STYLE.spacing.mv,
    padding: 16,
    borderRadius: 18,
  },
});
