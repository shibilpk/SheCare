import React from 'react';
import FontelloIcon from '../../utils/FontelloIcons';
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
    <TouchableOpacity activeOpacity={0.7} onPress={props.onPress}>
      <View style={styles.rotatedSquareWrapper}>
        <View style={styles.rotatedSquare} />
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
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    overflow: 'visible',
  },
  rotatedSquare: {
    width: '100%',
    height: '100%',
    backgroundColor: THEME_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    shadowColor: '#000',
    transform: [{ rotate: '45deg' }],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    position: 'relative',
  },
  rotatedSquareIcon: {
    position: 'absolute',
  },
});
