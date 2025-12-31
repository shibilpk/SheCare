import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import FontelloIcon from '../../utils/FontelloIcons';
import { THEME_COLORS } from '../../constants/colors';

interface QuickAction {
  icon: string;
  label: string;
  color: string;
  bg: string;
  onPress?: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
  title?: string;
  showTitle?: boolean;
  columns?: number;
}

export default function QuickActions({
  actions,
  title = 'Quick Actions',
  showTitle = true,
  columns = 4,
}: QuickActionsProps) {
  const itemWidth = columns === 4 ? '22%' : columns === 3 ? '30%' : '22%';

  return (
    <>
      {showTitle && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
      )}

      <View style={styles.actionsGrid}>
        {actions.map((action, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.actionItem, { width: itemWidth }]}
            onPress={action.onPress}
          >
            <View style={[styles.actionIcon, { backgroundColor: action.bg }]}>
              <FontelloIcon name={action.icon} size={24} color={action.color} />
            </View>
            <Text
              style={styles.actionLabel}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME_COLORS.text,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  actionItem: {
    minWidth: 70,
    alignItems: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME_COLORS.text,
    textAlign: 'center',
  },
});
