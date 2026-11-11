import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiquidGlassView, isLiquidGlassSupported } from '@callstack/liquid-glass';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { THEME_COLORS } from '../../constants/colors';
import { useIsDarkMode } from '../../services/theme';

/**
 * Floating tab bar using iOS 26 Liquid Glass. Falls back to a translucent
 * bar where Liquid Glass isn't available.
 */
const BAR_PADDING = 8;

export default function GlassTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const isDark = useIsDarkMode();
  const [barWidth, setBarWidth] = useState(0);
  const itemWidth = barWidth ? (barWidth - BAR_PADDING * 2) / state.routes.length : 0;

  // Sliding glass "lens" that stretches while travelling between tabs.
  const x = useSharedValue(0);
  const stretch = useSharedValue(1);
  useEffect(() => {
    if (!itemWidth) return;
    const target = BAR_PADDING + state.index * itemWidth;
    stretch.value = withSpring(1.25, { damping: 30, stiffness: 400 }, () => {
      stretch.value = withSpring(1, { damping: 12, stiffness: 180 });
    });
    x.value = withSpring(target, { damping: 14, stiffness: 160, mass: 0.8 });
  }, [state.index, itemWidth, x, stretch]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { scaleX: stretch.value }],
  }));

  const Container: any = isLiquidGlassSupported ? LiquidGlassView : View;
  const containerProps = isLiquidGlassSupported
    ? { effect: 'regular', interactive: true }
    : {};

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { bottom: Math.max(insets.bottom, 12) }]}
    >
      <Container
        {...containerProps}
        style={[
          styles.bar,
          !isLiquidGlassSupported && {
            backgroundColor: isDark
              ? 'rgba(30,30,30,0.92)'
              : 'rgba(255,255,255,0.92)',
          },
          Platform.OS === 'android' && { elevation: 8 },
        ]}
        onLayout={(e: any) => setBarWidth(e.nativeEvent.layout.width)}
      >
        {itemWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[styles.pill, { width: itemWidth }, pillStyle]}
          >
            {isLiquidGlassSupported ? (
              <LiquidGlassView
                effect="clear"
                interactive
                tintColor={THEME_COLORS.primary + '33'}
                style={styles.pillInner}
              />
            ) : (
              <View
                style={[
                  styles.pillInner,
                  { backgroundColor: THEME_COLORS.primary + '26' },
                ]}
              />
            )}
          </Animated.View>
        )}
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;

          // Custom buttons (e.g. the centre "+") render themselves.
          if (options.tabBarButton) {
            return (
              <View key={route.key} style={styles.item}>
                {(options.tabBarButton as any)({})}
              </View>
            );
          }

          const color = focused ? THEME_COLORS.primary : 'gray';
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.item}
              activeOpacity={0.7}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
            >
              {options.tabBarIcon?.({ focused, color, size: 24 })}
            </TouchableOpacity>
          );
        })}
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    borderRadius: 32,
    paddingHorizontal: BAR_PADDING,
  },
  pill: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    left: 0,
    paddingHorizontal: 4,
  },
  pillInner: {
    flex: 1,
    borderRadius: 26,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
