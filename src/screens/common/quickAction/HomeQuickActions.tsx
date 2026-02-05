import React from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { QuickActions } from '@src/components';
import { RootStackParamList, SCREENS } from '@src/constants/navigation';
import useStore from '@src/hooks/useStore';

/* ---------------- TYPES ---------------- */

type Navigation = NativeStackNavigationProp<RootStackParamList>;

type ActionConfig = {
  icon: string;
  label: string;
  color: string;
  bg: string;
  onPress: () => void;
};

/* ---------------- COMPONENT ---------------- */

const HomeQuickActions = () => {
  const isPregnant = useStore(state => state.isPregnant ?? false);
  const navigation = useNavigation<Navigation>();

  /* ---------------- GENERAL ACTIONS ---------------- */

  const GENERAL_ACTIONS: ActionConfig[] = [
    {
      icon: 'glass',
      label: 'Hydration',
      color: '#3B82F6',
      bg: '#DBEAFE',
      onPress: () => navigation.navigate(SCREENS.HYDRATION),
    },
    {
      icon: 'pitch',
      label: 'Nutrition',
      color: '#10B981',
      bg: '#D1FAE5',
      onPress: () => navigation.navigate(SCREENS.NUTRITION),
    },
    {
      icon: 'pharmacy',
      label: 'Medications',
      color: '#EC4899',
      bg: '#FCE7F3',
      onPress: () => navigation.navigate(SCREENS.MEDICATIONS),
    },
  ];

  /* ---------------- OTHER (NON-PREGNANT) ACTIONS ---------------- */

  const OTHER_ACTIONS: ActionConfig[] = [
    {
      icon: 'bell-alt',
      label: 'Reminders',
      color: '#6366F1',
      bg: '#E0E7FF',
      onPress: () => navigation.navigate(SCREENS.REMINDERS),
    },
  ];

  /* ---------------- PREGNANCY ACTIONS ---------------- */

  const PREGNANCY_ACTIONS: ActionConfig[] = [
    {
      icon: 'calendar',
      label: 'Appointments',
      color: '#8B5CF6',
      bg: '#EDE9FE',
      onPress: () => navigation.navigate(SCREENS.APPOINTMENTS),
    },
    {
      icon: 'heart',
      label: 'Exercise',
      color: '#F59E0B',
      bg: '#FEF3C7',
      onPress: () => navigation.navigate(SCREENS.EXERCISE),
    },
    {
      icon: 'moon',
      label: 'Sleep Log',
      color: '#8B5CF6',
      bg: '#EDE9FE',
      onPress: () => navigation.navigate(SCREENS.SLEEP_LOG),
    },
    {
      icon: 'chart-line',
      label: 'Baby Weight',
      color: '#EF4444',
      bg: '#FEE2E2',
      onPress: () => navigation.navigate(SCREENS.WEIGHT_TRACK),
    },
  ];

  /* ---------------- FINAL LIST ---------------- */

  const actions: ActionConfig[] = isPregnant
    ? [...GENERAL_ACTIONS, ...PREGNANCY_ACTIONS]
    : [...GENERAL_ACTIONS, ...OTHER_ACTIONS];

  return (
    <View>
      <QuickActions actions={actions} />
    </View>
  );
};

export default HomeQuickActions;
