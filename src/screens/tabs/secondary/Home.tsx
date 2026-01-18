import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontelloIcon from '../../../utils/FontelloIcons';
import QuickActions from '../../../components/common/QuickActions';
import NotificationsModal from '../../../components/common/NotificationsModal';
import { THEME_COLORS } from '../../../constants/colors';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RootStackParamList, SCREENS } from '../../../constants/navigation';
import { STYLE } from '../../../constants/app';

export default function PregnancyScreen() {
  const navigation = useNavigation<DrawerNavigationProp<RootStackParamList>>();

  const [showNotifications, setShowNotifications] = useState(false);

  // Dummy pregnancy data
  const currentWeek = 24;
  const currentTrimester = 2;
  const dueDate = 'March 15, 2026';
  const daysRemaining = 112;

  const quickStats = [
    { id: 1, label: 'Weight', value: '+8kg', bgColor: ['#E9D5FF', '#C084FC'] },
    { id: 2, label: 'Mood', emoji: '😊', bgColor: ['#FED7AA', '#FB923C'] },
    { id: 3, label: 'Energy', emoji: '⚡', bgColor: ['#BAE6FD', '#38BDF8'] },
    { id: 4, label: 'Sleep', emoji: '😴', bgColor: ['#DDD6FE', '#A78BFA'] },
    { id: 5, label: 'Water', value: '6/8', bgColor: ['#BBF7D0', '#4ADE80'] },
  ];

  const weeklyMilestones = [
    {
      id: 1,
      icon: 'baby',
      title: 'Baby Size',
      description: 'Your baby is the size of a papaya!',
      detail: '~30cm length',
      color: '#EC4899',
      bgColor: '#FCE7F3',
    },
    {
      id: 2,
      icon: 'heartbeat',
      title: 'Development',
      description: 'Baby can hear sounds and respond to light',
      detail: 'Lungs developing',
      color: '#8B5CF6',
      bgColor: '#F3E8FF',
    },
  ];

  const dailyTips = [
    {
      id: 1,
      category: 'Nutrition',
      tip: 'Include iron-rich foods like spinach and lean meat',
      icon: 'pitch',
      color: '#10B981',
    },
    {
      id: 2,
      category: 'Exercise',
      tip: 'Try gentle prenatal yoga for 20 minutes',
      icon: 'heart',
      color: '#F59E0B',
    },
    {
      id: 3,
      category: 'Wellness',
      tip: 'Practice deep breathing exercises',
      icon: 'leaf',
      color: '#3B82F6',
    },
  ];

  const symptoms = [
    { id: 1, name: 'Backache', severity: 'Moderate', icon: 'attention' },
    { id: 2, name: 'Fatigue', severity: 'Mild', icon: 'moon' },
    { id: 3, name: 'Heartburn', severity: 'Mild', icon: 'fire' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={styles.headerBtn}
        >
          <FontelloIcon name="cog-b" size={26} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Pregnancy</Text>
          <Text style={styles.headerDate}>
            Week {currentWeek} • Trimester {currentTrimester}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowNotifications(true)}
          style={styles.headerBtn}
        >
          <View style={styles.appointmentBadge}>
            <Text style={styles.appointmentBadgeText}>3</Text>
          </View>
          <FontelloIcon name="bell-alt" size={26} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Notifications Modal (common) */}
      <NotificationsModal
        visible={showNotifications}
        items={[
          {
            id: 1,
            title: 'Kick Counter',
            message: 'You logged 12 kicks today',
            time: '2h ago',
            icon: 'heart',
            color: '#F59E0B',
          },
          {
            id: 2,
            title: 'Hydration',
            message: '6/8 glasses completed',
            time: '4h ago',
            icon: 'glass',
            color: '#3B82F6',
          },
          {
            id: 3,
            title: 'Appointment',
            message: 'Ultrasound in 2 days',
            time: '1d ago',
            icon: 'calendar',
            color: '#8B5CF6',
          },
        ]}
        onClose={() => setShowNotifications(false)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Progress Card */}
        <LinearGradient
          colors={['#FDE68A', '#FCD34D', '#FBBF24']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.mainCard}
        >
          <View style={styles.mainCardContent}>
            <Text style={styles.mainCardLabel}>Due Date</Text>
            <Text style={styles.mainCardValue}>{daysRemaining} Days</Text>
            <Text style={styles.mainCardSubtitle}>{dueDate}</Text>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(currentWeek / 40) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round((currentWeek / 40) * 100)}% Complete
              </Text>
            </View>

            <Image
              source={require('../../../assets/images/cat.png')}
              style={styles.decorImage}
              resizeMode="contain"
            />
          </View>
        </LinearGradient>

        {/* Baby Growth Visualization */}
        <View style={styles.babyGrowthCard}>
          <LinearGradient
            colors={['#FCE7F3', '#FBCFE8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.babyGrowthContent}>
              <View style={styles.babyGrowthLeft}>
                <Text style={styles.babyGrowthTitle}>Baby's Growth</Text>
                <Text style={styles.babyGrowthSize}>Size of Papaya 🥭</Text>
                <Text style={styles.babyGrowthDetails}>Length: ~30cm</Text>
                <Text style={styles.babyGrowthDetails}>Weight: ~600g</Text>
              </View>
              <View style={styles.babyImageContainer}>
                <Text style={styles.babyEmoji}>👶</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Daily Check-in */}
        <View style={styles.checkInCard}>
          <View style={styles.checkInLeft}>
            <Text style={styles.checkInTitle}>How are you feeling today?</Text>
            <Text style={styles.checkInSubtitle}>Track symptoms and mood</Text>
          </View>
          <TouchableOpacity style={styles.checkInBtn}>
            <FontelloIcon
              name="plus"
              size={24}
              color={THEME_COLORS.textLight}
            />
          </TouchableOpacity>
        </View>

        {/* Current Symptoms */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Current Symptoms</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Manage</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.symptomsContainer}>
          {symptoms.map(symptom => (
            <View key={symptom.id} style={styles.symptomChip}>
              <FontelloIcon name={symptom.icon} size={14} color="#666" />
              <Text style={styles.symptomName}>{symptom.name}</Text>
              <View
                style={[
                  styles.severityDot,
                  {
                    backgroundColor:
                      symptom.severity === 'Moderate' ? '#F59E0B' : '#10B981',
                  },
                ]}
              />
            </View>
          ))}
        </View>

        {/* Weekly Milestones */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>This Week's Milestones</Text>
        </View>

        {weeklyMilestones.map(milestone => (
          <View key={milestone.id} style={styles.milestoneCard}>
            <View
              style={[
                styles.milestoneIcon,
                { backgroundColor: milestone.bgColor },
              ]}
            >
              <FontelloIcon
                name={milestone.icon}
                size={24}
                color={milestone.color}
              />
            </View>
            <View style={styles.milestoneContent}>
              <Text style={styles.milestoneTitle}>{milestone.title}</Text>
              <Text style={styles.milestoneDescription}>
                {milestone.description}
              </Text>
              <Text style={styles.milestoneDetail}>{milestone.detail}</Text>
            </View>
          </View>
        ))}

        {/* Daily Tips Carousel */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Tips</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tipsScroll}
        >
          {dailyTips.map(tip => (
            <View key={tip.id} style={styles.tipCard}>
              <View
                style={[styles.tipIconCircle, { backgroundColor: tip.color }]}
              >
                <FontelloIcon
                  name={tip.icon}
                  size={20}
                  color={THEME_COLORS.textLight}
                />
              </View>
              <Text style={styles.tipCategory}>{tip.category}</Text>
              <Text style={styles.tipText}>{tip.tip}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Kick Counter */}
        <LinearGradient
          colors={['#DBEAFE', '#BFDBFE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.kickCounterCard}
        >
          <View style={styles.kickCounterCardWrapper}>
            <View style={styles.kickCounterHeader}>
              <View style={styles.kickCounterLeft}>
                <Text style={styles.kickCounterTitle}>Baby Kicks Today</Text>
                <Text style={styles.kickCounterCount}>12 kicks</Text>
              </View>
              <TouchableOpacity style={styles.kickBtn}>
                <FontelloIcon name="plus" size={28} color="#3B82F6" />
              </TouchableOpacity>
            </View>
            <Text style={styles.kickCounterSubtext}>
              Tap + when you feel baby move
            </Text>
          </View>
        </LinearGradient>

        {/* Pregnancy Essentials */}
        <QuickActions
          actions={[
            {
              icon: 'calendar',
              label: 'Appointments',
              color: '#8B5CF6',
              bg: '#EDE9FE',
              onPress: () => navigation.navigate(SCREENS.APPOINTMENTS),
            },
            {
              icon: 'pharmacy',
              label: 'Medications',
              color: '#EC4899',
              bg: '#FCE7F3',
              onPress: () => navigation.navigate(SCREENS.MEDICATIONS),
            },
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
          ]}
        />

        {/* Hospital Bag Checklist */}
        <View style={styles.checklistCard}>
          <View style={styles.checklistHeader}>
            <FontelloIcon name="suitcase" size={24} color="#8B5CF6" />
            <Text style={styles.checklistTitle}>Hospital Bag Checklist</Text>
          </View>
          <Text style={styles.checklistSubtext}>5 of 20 items packed</Text>
          <View style={styles.checklistProgress}>
            <View style={[styles.checklistProgressFill, { width: '25%' }]} />
          </View>
          <TouchableOpacity
            style={styles.checklistBtn}
            onPress={() => navigation.navigate(SCREENS.HOSPITAL_CHECKLIST)}
          >
            <Text style={styles.checklistBtnText}>View Checklist</Text>
            <FontelloIcon name="right-open-mini" size={16} color="#8B5CF6" />
          </TouchableOpacity>
        </View>

        {/* Partner Section */}
        <View style={styles.partnerCard}>
          <View style={styles.partnerHeader}>
            <Text style={styles.partnerEmoji}>👫</Text>
            <View style={styles.partnerTextContainer}>
              <Text style={styles.partnerTitle}>Partner's Corner</Text>
              <Text style={styles.partnerSubtext}>
                Tips for your partner this week
              </Text>
            </View>
          </View>
          <Text style={styles.partnerContent}>
            Encourage bonding by talking to the baby. They can hear voices now!
          </Text>
          <TouchableOpacity style={styles.partnerBtn}>
            <Text style={styles.partnerBtnText}>Share with Partner</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
    paddingVertical: 8,
    backgroundColor: THEME_COLORS.textLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerBtn: {
    padding: 4,
    position: 'relative',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME_COLORS.text,
  },
  headerDate: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  appointmentBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#F59E0B',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  appointmentBadgeText: {
    color: THEME_COLORS.textLight,
    fontSize: 10,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  mainCard: {
    marginHorizontal: STYLE.spacing.mh,
    marginTop: 20,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  mainCardContent: {
    padding: 24,
    alignItems: 'center',
    position: 'relative',
  },
  mainCardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.text,
    marginBottom: 8,
  },
  mainCardValue: {
    fontSize: 42,
    fontWeight: '800',
    color: THEME_COLORS.text,
    marginBottom: 8,
  },
  mainCardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  progressBarContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  decorImage: {
    position: 'absolute',
    bottom: -10,
    right: 10,
    width: 90,
    height: 90,
    opacity: 0.5,
  },
  babyGrowthCard: {
    marginHorizontal: STYLE.spacing.mh,
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  babyGrowthContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  babyGrowthLeft: {
    flex: 1,
  },
  babyGrowthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME_COLORS.text,
    marginBottom: 8,
  },
  babyGrowthSize: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EC4899',
    marginBottom: 6,
  },
  babyGrowthDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  babyImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  babyEmoji: {
    fontSize: 48,
  },
  checkInCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME_COLORS.textLight,
    marginHorizontal: STYLE.spacing.mh,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  checkInLeft: {
    flex: 1,
  },
  checkInTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.text,
    marginBottom: 4,
  },
  checkInSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  checkInBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME_COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME_COLORS.text,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLORS.primary,
  },
  symptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 24,
  },
  symptomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.textLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  symptomName: {
    fontSize: 14,
    fontWeight: '500',
    color: THEME_COLORS.text,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.textLight,
    marginHorizontal: STYLE.spacing.mh,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  milestoneIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.text,
    marginBottom: 4,
  },
  milestoneDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  milestoneDetail: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },
  tipsScroll: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  tipCard: {
    backgroundColor: THEME_COLORS.textLight,
    padding: 20,
    borderRadius: 16,
    width: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tipIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  tipCategory: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME_COLORS.primary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  kickCounterCard: {
    marginHorizontal: STYLE.spacing.mh,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  kickCounterCardWrapper: {
    padding: 20,
  },
  kickCounterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  kickCounterLeft: {
    flex: 1,
  },
  kickCounterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.text,
    marginBottom: 4,
  },
  kickCounterCount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#3B82F6',
  },
  kickBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME_COLORS.textLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  kickCounterSubtext: {
    fontSize: 13,
    color: '#666',
  },
  checklistCard: {
    backgroundColor: '#F3E8FF',
    marginHorizontal: STYLE.spacing.mh,
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  checklistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  checklistTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME_COLORS.text,
  },
  checklistSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  checklistProgress: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  checklistProgressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  checklistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
  },
  checklistBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  partnerCard: {
    backgroundColor: '#FFF9F0',
    marginHorizontal: STYLE.spacing.mh,
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  partnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  partnerEmoji: {
    fontSize: 32,
  },
  partnerTextContainer: {
    flex: 1,
  },
  partnerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME_COLORS.text,
    marginBottom: 2,
  },
  partnerSubtext: {
    fontSize: 13,
    color: '#999',
  },
  partnerContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  partnerBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  partnerBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLORS.textLight,
  },
});
