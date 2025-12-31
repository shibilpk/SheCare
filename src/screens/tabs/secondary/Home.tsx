import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontelloIcon from '../../../utils/FontelloIcons';
import ModalTopIcon from '../../../components/common/ModalTopIcon';
import QuickActions from '../../../components/common/QuickActions';
import { THEME_COLORS, HOME_CARD_PASTEL } from '../../../constants/colors';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RootStackParamList, SCREENS } from '../../../constants/navigation';

export default function PregnancyScreen() {
  const navigation = useNavigation<DrawerNavigationProp<RootStackParamList>>();

  const [showAppointments, setShowAppointments] = useState(false);
  const modalAnim = useSharedValue(0);

  // Dummy pregnancy data
  const currentWeek = 24;
  const currentTrimester = 2;
  const dueDate = 'March 15, 2026';
  const daysRemaining = 112;

  const appointments = [
    {
      id: 1,
      title: 'Ultrasound Scan',
      date: 'Oct 10, 2025',
      time: '10:00 AM',
      doctor: 'Dr. Sarah Johnson',
      icon: 'stethoscope',
      color: '#8B5CF6',
    },
    {
      id: 2,
      title: 'Prenatal Check-up',
      date: 'Oct 17, 2025',
      time: '2:30 PM',
      doctor: 'Dr. Sarah Johnson',
      icon: 'heart',
      color: '#EC4899',
    },
    {
      id: 3,
      title: 'Blood Test',
      date: 'Oct 24, 2025',
      time: '9:00 AM',
      doctor: 'Lab Technician',
      icon: 'droplet',
      color: '#EF4444',
    },
  ];

  const openModal = () => {
    setShowAppointments(true);
    setTimeout(() => {
      modalAnim.value = withTiming(1, {
        duration: 350,
        easing: Easing.out(Easing.exp),
      });
    }, 10);
  };

  const closeModal = () => {
    modalAnim.value = withTiming(0, {
      duration: 300,
      easing: Easing.in(Easing.exp),
    });
    setTimeout(() => setShowAppointments(false), 300);
  };

  const animatedModalStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withTiming(modalAnim.value === 1 ? 0 : 600, {
            duration: 350,
            easing: Easing.out(Easing.exp),
          }),
        },
      ],
      width: '100%',
      alignSelf: 'center',
    };
  });

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
          <Text style={styles.headerDate}>Week {currentWeek} • Trimester {currentTrimester}</Text>
        </View>
        <TouchableOpacity onPress={openModal} style={styles.headerBtn}>
          <View style={styles.appointmentBadge}>
            <Text style={styles.appointmentBadgeText}>3</Text>
          </View>
          <FontelloIcon name="calendar" size={26} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Appointments Modal */}
      {showAppointments && (
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, animatedModalStyle]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upcoming Appointments</Text>
              <ModalTopIcon onPress={closeModal} iconName="cancel" />
            </View>
            <FlatList
              data={appointments}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.appointmentCard}>
                  <View
                    style={[
                      styles.appointmentIcon,
                      { backgroundColor: item.color },
                    ]}
                  >
                    <FontelloIcon name={item.icon} size={20} color={THEME_COLORS.textLight} />
                  </View>
                  <View style={styles.appointmentContent}>
                    <Text style={styles.appointmentTitle}>{item.title}</Text>
                    <Text style={styles.appointmentDoctor}>{item.doctor}</Text>
                    <View style={styles.appointmentBottom}>
                      <Text style={styles.appointmentDate}>{item.date}</Text>
                      <Text style={styles.appointmentTime}>{item.time}</Text>
                    </View>
                  </View>
                </View>
              )}
              showsVerticalScrollIndicator={false}
            />
          </Animated.View>
        </View>
      )}

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
                <View style={[styles.progressFill, { width: `${(currentWeek / 40) * 100}%` }]} />
              </View>
              <Text style={styles.progressText}>{Math.round((currentWeek / 40) * 100)}% Complete</Text>
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
            style={styles.babyGrowthGradient}
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

        {/* Quick Stats */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsScroll}
        >
          {quickStats.map(stat => (
            <LinearGradient
              key={stat.id}
              colors={stat.bgColor}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statContainer}
            >
              <View style={styles.statContainerInner}>
                <Text style={styles.statTitle}>{stat.label}</Text>
                {stat.value ? (
                  <Text style={styles.statValue}>{stat.value}</Text>
                ) : (
                  <Text style={styles.statEmoji}>{stat.emoji}</Text>
                )}
              </View>
            </LinearGradient>
          ))}
        </ScrollView>

        {/* Daily Check-in */}
        <View style={styles.checkInCard}>
          <View style={styles.checkInLeft}>
            <Text style={styles.checkInTitle}>How are you feeling today?</Text>
            <Text style={styles.checkInSubtitle}>Track symptoms and mood</Text>
          </View>
          <TouchableOpacity style={styles.checkInBtn}>
            <FontelloIcon name="plus" size={24} color={THEME_COLORS.textLight} />
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
              <View style={[
                styles.severityDot,
                { backgroundColor: symptom.severity === 'Moderate' ? '#F59E0B' : '#10B981' }
              ]} />
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
              style={[styles.milestoneIcon, { backgroundColor: milestone.bgColor }]}
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
              <View style={[styles.tipIconCircle, { backgroundColor: tip.color }]}>
                <FontelloIcon name={tip.icon} size={20} color={THEME_COLORS.textLight} />
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
          <View style={styles.kickCounterHeader}>
            <View style={styles.kickCounterLeft}>
              <Text style={styles.kickCounterTitle}>Baby Kicks Today</Text>
              <Text style={styles.kickCounterCount}>12 kicks</Text>
            </View>
            <TouchableOpacity style={styles.kickBtn}>
              <FontelloIcon name="plus" size={28} color="#3B82F6" />
            </TouchableOpacity>
          </View>
          <Text style={styles.kickCounterSubtext}>Tap + when you feel baby move</Text>
        </LinearGradient>

        {/* Pregnancy Essentials */}
        <QuickActions
          actions={[
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
            },
            {
              icon: 'heart',
              label: 'Exercise',
              color: '#F59E0B',
              bg: '#FEF3C7',
            },
            {
              icon: 'moon',
              label: 'Sleep Log',
              color: '#8B5CF6',
              bg: '#EDE9FE',
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
          <TouchableOpacity style={styles.checklistBtn} onPress={() => navigation.navigate(SCREENS.HOSPITAL_CHECKLIST)}>
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
              <Text style={styles.partnerSubtext}>Tips for your partner this week</Text>
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
    marginHorizontal: 20,
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
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  babyGrowthGradient: {
    padding: 20,
  },
  babyGrowthContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  statsScroll: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  statContainer: {
    borderRadius: 16,
    marginRight: 15,
    alignItems: 'center',
    minWidth: 110,
    overflow: 'hidden',
  },
  statContainerInner: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  statTitle: {
    color: THEME_COLORS.text,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: THEME_COLORS.text,
  },
  statEmoji: {
    fontSize: 36,
  },
  checkInCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME_COLORS.textLight,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
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
    marginHorizontal: 20,
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
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    marginHorizontal: 20,
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
    marginHorizontal: 20,
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
  modalOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  modalContent: {
    backgroundColor: THEME_COLORS.textLight,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
    width: '100%',
    alignSelf: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: THEME_COLORS.text,
  },
  appointmentCard: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  appointmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  appointmentContent: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.text,
    marginBottom: 4,
  },
  appointmentDoctor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  appointmentBottom: {
    flexDirection: 'row',
    gap: 12,
  },
  appointmentDate: {
    fontSize: 13,
    color: '#999',
  },
  appointmentTime: {
    fontSize: 13,
    color: THEME_COLORS.primary,
    fontWeight: '600',
  },
});