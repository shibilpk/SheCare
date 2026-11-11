import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontelloIcon from '../../../services/FontelloIcons';
import NotificationsModal, {
  NotificationItem,
} from '../../../components/common/NotificationsModal';
import { THEME_COLORS } from '../../../constants/colors';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RootStackParamList, SCREENS } from '../../../constants/navigation';
import { STYLE } from '../../../constants/app';
import { monthNames, monthNamesShort } from '../../../constants/common';
import HomeQuickActions from '@src/screens/common/quickAction/HomeQuickActions';
import { ScreenLoader } from '@src/components';
import GlobalModalContext from '@src/services/GlobalContext';
import apiClient from '@src/services/ApiClient';
import { APIS } from '@src/constants/apis';
import { parseLocalDate } from '@src/utils/date';
import {
  DashboardAppointment,
  usePregnancyDashboard,
} from '@src/hooks/usePregnancyDashboard';

interface MoodOption {
  id: string;
  name: string;
  emoji: string;
}

interface ChecklistSummary {
  packed_count: number;
  total_count: number;
}

const NEUTRAL_MOOD = '😐';

/** 'March 15, 2026' from a backend YYYY-MM-DD date. */
function formatLongDate(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  return `${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/** '2:30 PM' from a backend HH:MM[:SS] time. */
function formatTime(time: string | null): string | null {
  if (!time) return null;
  const [h, m] = time.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** Whole days from today (local) until a YYYY-MM-DD date. */
function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round(
    (parseLocalDate(dateStr).getTime() - today.getTime()) / 86400000,
  );
}

function relativeDayLabel(dateStr: string): string {
  const days = daysUntil(dateStr);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

function formatBabyWeight(grams: number): string {
  if (grams < 1) return 'less than 1 g';
  if (grams < 1000) return `~${grams} g`;
  return `~${(grams / 1000).toFixed(1)} kg`;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function withArticle(noun: string): string {
  return `${/^[aeiou]/i.test(noun) ? 'an' : 'a'} ${noun}`;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export default function PregnancyScreen() {
  const navigation = useNavigation<DrawerNavigationProp<RootStackParamList>>();
  const modal = useContext(GlobalModalContext);
  const { data, isLoading, error, notFound, refetch } = usePregnancyDashboard();

  const [showNotifications, setShowNotifications] = useState(false);
  const [moods, setMoods] = useState<MoodOption[]>([]);
  const [checklist, setChecklist] = useState<ChecklistSummary | null>(null);
  // Spinner only for pull-to-refresh; focus refetches update silently
  const [pullRefreshing, setPullRefreshing] = useState(false);

  // Mood list (id -> emoji) comes from the daily-actions endpoint
  useEffect(() => {
    let cancelled = false;
    apiClient
      .get<{ moods: MoodOption[] }>(APIS.v1.activities.dailyActionList())
      .then(res => {
        if (!cancelled) setMoods(res.moods || []);
      })
      .catch(e => console.info('Failed to fetch moods', e));
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchChecklist = useCallback(async () => {
    try {
      const res = await apiClient.get<ChecklistSummary>(
        APIS.v1.pregnancy.checklist(),
      );
      setChecklist({
        packed_count: res.packed_count,
        total_count: res.total_count,
      });
    } catch (e) {
      console.info('Failed to fetch hospital checklist', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchChecklist();
    }, [fetchChecklist]),
  );

  const onRefresh = useCallback(async () => {
    setPullRefreshing(true);
    await Promise.all([refetch(), fetchChecklist()]);
    setPullRefreshing(false);
  }, [refetch, fetchChecklist]);

  const header = (subtitle: string | null, badgeCount = 0) => (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.openDrawer()}
        style={styles.headerBtn}
      >
        <FontelloIcon name="cog-1" size={26} color="#333" />
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>My Pregnancy</Text>
        {subtitle ? <Text style={styles.headerDate}>{subtitle}</Text> : null}
      </View>
      <TouchableOpacity
        onPress={() => setShowNotifications(true)}
        style={styles.headerBtn}
        disabled={!data}
      >
        {badgeCount > 0 && (
          <View style={styles.appointmentBadge}>
            <Text style={styles.appointmentBadgeText}>{badgeCount}</Text>
          </View>
        )}
        <FontelloIcon name="bell-alt" size={26} color="#333" />
      </TouchableOpacity>
    </View>
  );

  if (!data) {
    let body: React.ReactNode;
    if (isLoading) {
      body = <ScreenLoader message="Loading your pregnancy..." />;
    } else if (notFound) {
      body = (
        <View style={styles.stateContainer}>
          <Text style={styles.stateEmoji}>🤰</Text>
          <Text style={styles.stateTitle}>No active pregnancy</Text>
          <Text style={styles.stateMessage}>
            Add your due date in pregnancy settings to see your week-by-week
            progress, baby's growth and health summary here.
          </Text>
          <TouchableOpacity
            style={styles.stateBtn}
            onPress={() => navigation.navigate(SCREENS.PREGNANCY_SETTINGS)}
          >
            <Text style={styles.stateBtnText}>Open Pregnancy Settings</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      body = (
        <View style={styles.stateContainer}>
          <FontelloIcon name="attention" size={40} color="#F59E0B" />
          <Text style={styles.stateTitle}>Couldn't load your pregnancy</Text>
          <Text style={styles.stateMessage}>
            {error || 'Something went wrong. Please try again.'}
          </Text>
          <TouchableOpacity style={styles.stateBtn} onPress={refetch}>
            <Text style={styles.stateBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {header(null)}
        {body}
      </SafeAreaView>
    );
  }

  const { pregnancy, baby, maternal, today, recent_symptoms } = data;
  const appointment: DashboardAppointment | null = data.upcoming_appointment;
  const dueDate = formatLongDate(pregnancy.due_date);

  const moodId = today.mood_ids[0];
  const mood = moodId ? moods.find(m => String(m.id) === moodId) : undefined;

  const quickStats = [
    {
      id: 'weight',
      label: 'Weight',
      value:
        maternal.weight_gain_kg === null
          ? '—'
          : `${maternal.weight_gain_kg >= 0 ? '+' : ''}${formatNumber(
              maternal.weight_gain_kg,
            )}kg`,
      bgColor: ['#E9D5FF', '#C084FC'],
    },
    {
      id: 'mood',
      label: 'Mood',
      emoji: mood?.emoji || NEUTRAL_MOOD,
      bgColor: ['#FED7AA', '#FB923C'],
    },
    {
      id: 'sleep',
      label: 'Sleep',
      value:
        today.sleep_hours === null
          ? '—'
          : `${formatNumber(today.sleep_hours)}h`,
      bgColor: ['#DDD6FE', '#A78BFA'],
    },
    {
      id: 'water',
      label: 'Water',
      value: `${formatNumber(today.water_glasses)}/${today.water_goal_glasses}`,
      bgColor: ['#BBF7D0', '#4ADE80'],
    },
  ];

  const weeklyMilestones = [
    {
      id: 1,
      icon: 'heart',
      title: 'Baby Size',
      description: `Your baby is the size of ${withArticle(
        baby.size_comparison,
      )}!`,
      detail: `~${formatNumber(baby.length_cm)}cm length`,
      color: '#EC4899',
      bgColor: '#FCE7F3',
    },
    {
      id: 2,
      icon: 'chart-line',
      title: 'Development',
      description: baby.development,
      detail: `Week ${baby.week}`,
      color: '#8B5CF6',
      bgColor: '#F3E8FF',
    },
  ];

  const dailyTips = [
    {
      id: 1,
      category: 'Nutrition',
      tip: 'Include iron-rich foods like spinach and lean meat',
      icon: 'food',
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
      icon: 'feather',
      color: '#3B82F6',
    },
  ];

  // Notifications derived from today's dashboard data
  const notifications: NotificationItem[] = [];
  if (appointment) {
    notifications.push({
      id: `appointment-${appointment.id}`,
      title: 'Appointment',
      message: `${appointment.title} – ${relativeDayLabel(
        appointment.date,
      ).toLowerCase()}`,
      time: formatLongDate(appointment.date),
      icon: 'calendar',
      color: '#8B5CF6',
    });
  }
  if (today.water_glasses < today.water_goal_glasses) {
    notifications.push({
      id: 'hydration',
      title: 'Hydration',
      message: `${formatNumber(today.water_glasses)}/${
        today.water_goal_glasses
      } glasses completed today`,
      icon: 'glass',
      color: '#3B82F6',
    });
  }
  if (today.mood_ids.length === 0) {
    notifications.push({
      id: 'checkin',
      title: 'Daily Check-in',
      message: "You haven't logged how you feel today",
      icon: 'smile',
      color: '#F59E0B',
    });
  }

  const checklistPercent =
    checklist && checklist.total_count > 0
      ? Math.round((checklist.packed_count / checklist.total_count) * 100)
      : 0;

  const partnerTip =
    pregnancy.current_week >= 23
      ? 'Encourage bonding by talking to the baby. They can hear voices now!'
      : 'Offer support at appointments and help with daily tasks. Small gestures make a big difference.';

  const sharePartnerTip = () => {
    Share.share({
      message: `Week ${pregnancy.current_week} of our pregnancy: baby is the size of ${withArticle(
        baby.size_comparison,
      )}. ${partnerTip}`,
    }).catch(e => console.info('Share failed', e));
  };

  const appointmentTime = appointment ? formatTime(appointment.time) : null;
  const appointmentDate = appointment ? parseLocalDate(appointment.date) : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      {header(
        `Week ${pregnancy.current_week} • Trimester ${pregnancy.trimester}`,
        notifications.length,
      )}

      {/* Notifications Modal (common) */}
      <NotificationsModal
        visible={showNotifications}
        items={notifications}
        onClose={() => setShowNotifications(false)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={pullRefreshing}
            onRefresh={onRefresh}
            colors={[THEME_COLORS.primary]}
            tintColor={THEME_COLORS.primary}
          />
        }
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
            <Text style={styles.mainCardValue}>
              {pregnancy.days_remaining}{' '}
              {pregnancy.days_remaining === 1 ? 'Day' : 'Days'}
            </Text>
            <Text style={styles.mainCardSubtitle}>{dueDate}</Text>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${pregnancy.progress_percent}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {pregnancy.progress_percent}% Complete
              </Text>
            </View>

            <Image
              source={require('@src/assets/images/cat.png')}
              style={styles.decorImage}
              resizeMode="contain"
            />
          </View>
        </LinearGradient>

        {/* Today's Quick Stats */}
        <View style={styles.quickStatsRow}>
          {quickStats.map(stat => (
            <LinearGradient
              key={stat.id}
              colors={stat.bgColor}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.quickStatCard}
            >
              <Text style={styles.quickStatValue}>
                {stat.emoji ?? stat.value}
              </Text>
              <Text style={styles.quickStatLabel}>{stat.label}</Text>
            </LinearGradient>
          ))}
        </View>

        {/* Baby Growth Visualization */}
        <View style={styles.babyGrowthCard}>
          <LinearGradient
            colors={['#FCE7F3', '#FBCFE8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.babyGrowthContent}>
              <View style={styles.babyGrowthLeft}>
                <Text style={styles.babyGrowthTitle}>
                  {pregnancy.baby_name
                    ? `${pregnancy.baby_name}'s Growth`
                    : "Baby's Growth"}
                </Text>
                <Text style={styles.babyGrowthSize}>
                  Size of {withArticle(capitalize(baby.size_comparison))}
                </Text>
                <Text style={styles.babyGrowthDetails}>
                  Length: ~{formatNumber(baby.length_cm)}cm
                </Text>
                <Text style={styles.babyGrowthDetails}>
                  Weight: {formatBabyWeight(baby.weight_g)}
                </Text>
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
          <TouchableOpacity
            style={styles.checkInBtn}
            onPress={() => modal.open()}
          >
            <FontelloIcon
              name="plus"
              size={24}
              color={THEME_COLORS.textLight}
            />
          </TouchableOpacity>
        </View>

        {/* Upcoming Appointment */}
        {appointment && appointmentDate && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Next Appointment</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate(SCREENS.APPOINTMENTS)}
              >
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.appointmentCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(SCREENS.APPOINTMENTS)}
            >
              <View
                style={[
                  styles.appointmentDateBox,
                  { backgroundColor: `${appointment.color || '#8B5CF6'}22` },
                ]}
              >
                <Text
                  style={[
                    styles.appointmentDay,
                    { color: appointment.color || '#8B5CF6' },
                  ]}
                >
                  {appointmentDate.getDate()}
                </Text>
                <Text style={styles.appointmentMonth}>
                  {monthNamesShort[appointmentDate.getMonth()]}
                </Text>
              </View>
              <View style={styles.appointmentContent}>
                <Text style={styles.appointmentTitle} numberOfLines={1}>
                  {appointment.title}
                </Text>
                {appointment.doctor ? (
                  <Text style={styles.appointmentMeta} numberOfLines={1}>
                    {appointment.doctor}
                  </Text>
                ) : null}
                <Text style={styles.appointmentMeta} numberOfLines={1}>
                  {relativeDayLabel(appointment.date)}
                  {appointmentTime ? ` • ${appointmentTime}` : ''}
                  {appointment.location ? ` • ${appointment.location}` : ''}
                </Text>
              </View>
              <FontelloIcon name="right-open-mini" size={20} color="#999" />
            </TouchableOpacity>
          </>
        )}

        {/* Current Symptoms */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Symptoms</Text>
          <TouchableOpacity onPress={() => modal.open()}>
            <Text style={styles.seeAllText}>Log</Text>
          </TouchableOpacity>
        </View>

        {recent_symptoms.length > 0 ? (
          <View style={styles.symptomsContainer}>
            {recent_symptoms.map(symptom => (
              <View key={symptom.id} style={styles.symptomChip}>
                <FontelloIcon name="attention" size={14} color="#666" />
                <Text style={styles.symptomName}>{symptom.name}</Text>
                <Text style={styles.symptomDays}>
                  {symptom.days} {symptom.days === 1 ? 'day' : 'days'}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.symptomsEmpty}>
            <Text style={styles.symptomsEmptyText}>
              No symptoms logged in the last 7 days. Use the daily check-in to
              track how you feel.
            </Text>
          </View>
        )}

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

        {/* Pregnancy Essentials */}
        <HomeQuickActions />

        {/* Hospital Bag Checklist */}
        <View style={styles.checklistCard}>
          <View style={styles.checklistHeader}>
            <FontelloIcon name="bag" size={24} color="#8B5CF6" />
            <Text style={styles.checklistTitle}>Hospital Bag Checklist</Text>
          </View>
          <Text style={styles.checklistSubtext}>
            {checklist
              ? `${checklist.packed_count} of ${checklist.total_count} items packed`
              : 'Get your bag ready before the big day'}
          </Text>
          <View style={styles.checklistProgress}>
            <View
              style={[
                styles.checklistProgressFill,
                { width: `${checklistPercent}%` },
              ]}
            />
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
          <Text style={styles.partnerContent}>{partnerTip}</Text>
          <TouchableOpacity style={styles.partnerBtn} onPress={sharePartnerTip}>
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
    ...STYLE.scrollContent,
    paddingHorizontal: 0,
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
    fontSize: 35,
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
  quickStatsRow: {
    flexDirection: 'row',
    marginHorizontal: STYLE.spacing.mh,
    marginTop: 16,
    gap: 10,
  },
  quickStatCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME_COLORS.text,
  },
  quickStatLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    marginTop: 4,
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  stateEmoji: {
    fontSize: 56,
  },
  stateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME_COLORS.text,
    textAlign: 'center',
  },
  stateMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
  },
  stateBtn: {
    marginTop: 8,
    backgroundColor: THEME_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  stateBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME_COLORS.textLight,
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
  symptomDays: {
    fontSize: 12,
    color: '#999',
  },
  symptomsEmpty: {
    backgroundColor: THEME_COLORS.textLight,
    marginHorizontal: STYLE.spacing.mh,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  symptomsEmptyText: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
  },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.textLight,
    marginHorizontal: STYLE.spacing.mh,
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  appointmentDateBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  appointmentDay: {
    fontSize: 20,
    fontWeight: '800',
  },
  appointmentMonth: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
  },
  appointmentContent: {
    flex: 1,
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.text,
    marginBottom: 2,
  },
  appointmentMeta: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  symptomName: {
    fontSize: 14,
    fontWeight: '500',
    color: THEME_COLORS.text,
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
