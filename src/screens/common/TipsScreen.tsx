import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import FontelloIcon from '../../utils/FontelloIcons';
import { THEME_COLORS } from '../../constants/colors';
import { RootStackParamList } from '../../constants/navigation';

interface Tip {
  id: number;
  category: string;
  icon: string;
  title: string;
  description: string;
  color: string;
}

const healthTips: Tip[] = [
  {
    id: 1,
    category: 'Hydration',
    icon: 'glass',
    title: 'Stay Hydrated',
    description:
      'Drink at least 8 glasses of water daily. Proper hydration helps reduce bloating, improves skin health, and supports your menstrual cycle. Add lemon or cucumber for flavor!',
    color: '#3B82F6',
  },
  {
    id: 2,
    category: 'Sleep',
    icon: 'moon',
    title: 'Quality Sleep',
    description:
      'Aim for 7-8 hours of quality sleep each night. Good sleep helps regulate hormones, reduces stress, and improves mood. Create a bedtime routine and avoid screens before bed.',
    color: '#8B5CF6',
  },
  {
    id: 3,
    category: 'Exercise',
    icon: 'heartbeat',
    title: 'Regular Exercise',
    description:
      'Exercise for at least 30 minutes daily. Regular physical activity helps regulate your cycle, reduces cramps, boosts mood, and improves overall health. Try yoga, walking, or dancing!',
    color: '#10B981',
  },
  {
    id: 4,
    category: 'Nutrition',
    icon: 'pitch',
    title: 'Balanced Diet',
    description:
      'Eat a balanced diet rich in iron, calcium, and vitamins. Include leafy greens, whole grains, lean proteins, and fruits. Avoid excessive caffeine and processed foods during your period.',
    color: '#F59E0B',
  },
  {
    id: 5,
    category: 'Stress Management',
    icon: 'heart',
    title: 'Manage Stress',
    description:
      'Practice stress-reduction techniques like meditation, deep breathing, or journaling. Chronic stress can affect your menstrual cycle and overall health. Take time for self-care daily.',
    color: '#EC4899',
  },
  {
    id: 6,
    category: 'Iron Intake',
    icon: 'battery-4',
    title: 'Boost Iron Levels',
    description:
      'Iron is crucial during menstruation. Eat iron-rich foods like spinach, beans, red meat, and fortified cereals. Pair with vitamin C for better absorption. Consider supplements if needed.',
    color: '#EF4444',
  },
  {
    id: 7,
    category: 'Heat Therapy',
    icon: 'fire',
    title: 'Heat for Cramps',
    description:
      'Apply heat to your lower abdomen to relieve menstrual cramps. Use a heating pad or hot water bottle for 15-20 minutes. Heat helps relax muscles and improve blood flow.',
    color: '#F97316',
  },
  {
    id: 8,
    category: 'Track Your Cycle',
    icon: 'calendar',
    title: 'Monitor Your Cycle',
    description:
      'Keep track of your menstrual cycle, symptoms, and moods. This helps predict your period, identify patterns, and notice any irregularities that may need medical attention.',
    color: '#6366F1',
  },
  {
    id: 9,
    category: 'Omega-3',
    icon: 'fish',
    title: 'Omega-3 Fatty Acids',
    description:
      'Include omega-3 rich foods like salmon, walnuts, and flaxseeds. Omega-3s help reduce inflammation, ease period pain, and support hormonal balance.',
    color: '#06B6D4',
  },
  {
    id: 10,
    category: 'Avoid Smoking',
    icon: 'block',
    title: 'Say No to Smoking',
    description:
      'Smoking can worsen period symptoms and increase the risk of reproductive health issues. If you smoke, consider quitting for better overall health and easier periods.',
    color: '#DC2626',
  },
];

const HealthTipsScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <FontelloIcon name="left-open-mini" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Tips</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Intro */}
        <View style={styles.introCard}>
          <Text style={styles.introEmoji}>💡</Text>
          <Text style={styles.introTitle}>Your Guide to Better Health</Text>
          <Text style={styles.introText}>
            Simple daily tips to help you manage your cycle and improve overall
            wellness.
          </Text>
        </View>

        {/* Tips */}
        {healthTips.map(tip => (
          <View key={tip.id} style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <View
                style={[
                  styles.tipIconBox,
                  { backgroundColor: tip.color + '20' },
                ]}
              >
                <FontelloIcon name={tip.icon} size={22} color={tip.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.tipCategory}>{tip.category}</Text>
                <Text style={styles.tipTitle}>{tip.title}</Text>
              </View>
            </View>
            <Text style={styles.tipDescription}>{tip.description}</Text>
          </View>
        ))}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};
export default HealthTipsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: THEME_COLORS.textLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  closeBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME_COLORS.text,
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  introCard: {
    backgroundColor: '#FFF9F0',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  introEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME_COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  introText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  tipCard: {
    backgroundColor: THEME_COLORS.textLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tipHeaderText: {
    flex: 1,
  },
  tipCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME_COLORS.text,
  },
  tipDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 40,
  },
});
