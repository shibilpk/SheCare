import React from 'react';
import FontelloIcon from '../../services/FontelloIcons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { THEME_COLORS } from '../../constants/colors';

export function tabOptions(name: string, label: string) {
  return {
    tabBarLabel: label,
    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
      <FontelloIcon name={name} size={size ?? 30} color={color ?? '#000'} />
    ),
  };
}

export function todayTabBarIcon(props: { onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.rotatedSquareParent} activeOpacity={0.7} onPress={props.onPress}>
      <View style={styles.rotatedSquareWrapper}>
        <View style={styles.rotatedSquareContainer}>
          <View style={styles.rotatedSquare} />
        </View>

        <FontelloIcon
          style={styles.rotatedSquareIcon}
          name="plus"
          size={30}
          color="#fff"
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  rotatedSquareWrapper: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Defines layout size (not rotated)
  rotatedSquareContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Only this rotates
  rotatedSquare: {
    width: '100%',
    height: '100%',
    backgroundColor: THEME_COLORS.primary,
    borderRadius: 8,
    transform: [{ rotate: '45deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  rotatedSquareIcon: {
    position: 'absolute',
  },
  rotatedSquareParent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
