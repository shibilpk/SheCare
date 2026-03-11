import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontelloIcon from '../../services/FontelloIcons';
import NotificationsModal from '../../components/common/NotificationsModal';
import { THEME_COLORS, HOME_CARD_PASTEL } from '../../constants/colors';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RootStackParamList, SCREENS } from '../../constants/navigation';
import { monthNamesShort } from '../../constants/common';
import { STYLE } from '../../constants/app';
import HomeQuickActions from '../common/quickAction/HomeQuickActions';
import { DateRange } from '@src/components/widgets/Calender';
import GlobalModalContext from '@src/services/GlobalContext';
import { useDailyTip } from '@src/hooks/useDailyTip';
import { useBlogList } from '@src/hooks/useBlog';
import { usePeriodData, PeriodRange } from '@src/hooks/usePeriodData';

export default function HomeScreen() {
  const navigation = useNavigation<DrawerNavigationProp<RootStackParamList>>();
  const [showNotifications, setShowNotifications] = useState(false);
  const [range, setRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });
  const [activePeriodId, setActivePeriodId] = useState<string | null>(null);
  const modal = useContext(GlobalModalContext);

  // Use hooks for API calls
  const {
    tip: dailyTip,
    isLoading: isLoadingTip,
    error: tipError,
  } = useDailyTip();
  const { periodData: customerPeriodData, isLoading: isLoadingPeriod } =
    usePeriodData();

  // Fetch latest blogs using the hook
  const { blogs, isLoading: isLoadingBlogs } = useBlogList(5);

  async function setActivePeriod(response: PeriodRange) {
    try {
      setRange({
        startDate: new Date(response.start_date),
        endDate: new Date(response.end_date),
      });
      setActivePeriodId(response.id);
    } catch (error) {
      console.info('Failed to fetch active period', error);
      setActivePeriodId(null);
    }
  }

  // Update active period when customerPeriodData changes
  useEffect(() => {
    if (customerPeriodData?.active_period) {
      setActivePeriod(customerPeriodData.active_period);
    }
  }, [customerPeriodData]);

  useEffect(() => {}, [range]);

  const dummyNotifications = [
    {
      id: 1,
      title: 'Welcome!',
      message: 'Thanks for joining FemCare.',
      time: '3 min ago',
      icon: 'heart',
      color: THEME_COLORS.secondary,
    },
    {
      id: 2,
      title: 'Cycle Reminder',
      message: 'Your next period is in 12 days.',
      time: '5 min ago',
      icon: 'calendar',
      color: '#8B5CF6',
    },
    {
      id: 3,
      title: 'Health Tip',
      message: 'Drink more water today!',
      time: '8 min ago',
      icon: 'glass',
      color: '#3B82F6',
    },
    {
      id: 4,
      title: 'Mood Check',
      message: 'How are you feeling today?',
      time: '10 min ago',
      icon: 'heart',
      color: '#F59E0B',
    },
    {
      id: 5,
      title: 'Update',
      message: 'App version 2.0 released.',
      time: '12 min ago',
      icon: 'cog-1',
      color: '#10B981',
    },
  ];

  const getPregnancyChanceDisplay = () => {
    if (!customerPeriodData?.pregnancy_chance)
      return { value: 'L', icon: 'down', color: '#DC2626' };

    const chance = customerPeriodData.pregnancy_chance.level;
    switch (chance) {
      case 'high':
        return { value: 'H', icon: 'up', color: '#10B981' };
      case 'medium':
        return { value: 'M', icon: 'resize-vertical', color: '#ffa200' };
      case 'low':
      default:
        return { value: 'L', icon: 'down', color: '#DC2626' };
    }
  };

  const pregnancyDisplay = getPregnancyChanceDisplay();

  const getDaysUntilNextPeriod = () => {
    if (!customerPeriodData?.next_period_date) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextPeriodDate = new Date(customerPeriodData.next_period_date);
    nextPeriodDate.setHours(0, 0, 0, 0);
    const days = Math.ceil(
      (nextPeriodDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    return days > 0 ? days : null;
  };

  const getDaysUntilOvulation = () => {
    if (!customerPeriodData?.ovulation_date) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ovulationDate = new Date(customerPeriodData.ovulation_date);
    ovulationDate.setHours(0, 0, 0, 0);
    const days = Math.ceil(
      (ovulationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    return days > 0 ? days : null;
  };

  const quickStats = [
    {
      id: 'next_period',
      label: 'Next Period',
      value: getDaysUntilNextPeriod(),
      icon: 'frown',
      iconColor: '#9333EA',
      bgColor: ['#E9D5FF', '#C084FC'],
      contentType: 'value',
      screen: SCREENS.PERIODS_LIST,
    },
    {
      id: 'pregnancy_chance',
      label: 'Pregnancy',
      value: pregnancyDisplay.value,
      icon: 'venus-mars',
      iconColor: '#cc40ab',
      levelIcon: pregnancyDisplay.icon,
      levelColor: pregnancyDisplay.color,
      bgColor: ['#E9D5FF', '#fbb9d3'],
      contentType: 'value',
      screen: SCREENS.CALENDAR,
    },
    {
      id: 'ovulation',
      label: 'Ovulation',
      value: getDaysUntilOvulation(),
      icon: 'water',
      iconColor: '#ff5c9d',
      bgColor: ['#e7a6cc', '#f995bd'],
      contentType: 'value',
      screen: null,
    },
    {
      id: 'history',
      label: 'History',
      icon: 'history',
      emoji: '🗓️',
      iconColor: '#18b8fd',
      bgColor: ['#BAE6FD', '#38BDF8'],
      contentType: 'emoji',
      screen: SCREENS.PERIODS_LIST,
    },
    {
      id: 'mood',
      label: 'Mood',
      emoji: '😊',
      icon: 'heart',
      iconColor: '#EA580C',
      bgColor: ['#FED7AA', '#FB923C'],
      contentType: 'emoji',
      screen: null,
    },
    {
      id: 'energy',
      label: 'Energy',
      value: '85%',
      icon: 'flash',
      iconColor: '#0284C7',
      levelIcon: 'up-open',
      levelColor: '#10B981',
      bgColor: ['#DBEAFE', '#60A5FA'],
      contentType: 'value',
      screen: null,
    },
    {
      id: 'symptoms',
      label: 'Symptoms',
      value: '2',
      icon: 'attention',
      iconColor: '#CA8A04',
      bgColor: ['#FDE68A', '#FBBF24'],
      contentType: 'value',
      screen: null,
    },
    {
      id: 'sleep',
      label: 'Sleep',
      emoji: '😴',
      icon: 'moon',
      iconColor: '#7C3AED',
      bgColor: ['#DDD6FE', '#A78BFA'],
      contentType: 'emoji',
      screen: SCREENS.SLEEP_LOG,
    },
  ].filter(stat => {
    if (stat.id === 'ovulation') {
      return getDaysUntilOvulation() !== null; // or !== undefined
    }
    if (stat.id === 'next_period') {
      return getDaysUntilNextPeriod() !== null; // or !== undefined
    }

    return true;
  });

  const openModal = () => {
    setShowNotifications(true);
  };

  const closeModal = () => {
    setShowNotifications(false);
  };

  // Helper function to format date
  const formatBlogDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const healthInsights = [
    {
      id: 1,
      icon: 'loop',
      title: 'Cycle Pattern',
      description: 'Your cycle has been regular for the past 3 months',
      color: '#8B5CF6',
      bgColor: '#F3E8FF',
    },
    {
      id: 2,
      icon: 'heart',
      title: 'Wellness Score',
      description: 'Great job! Your wellness score is 85%',
      color: '#EC4899',
      bgColor: '#FCE7F3',
    },
  ];

  const handleStartPeriod = async () => {
    const rangeDays = customerPeriodData?.avg_period_length || 7;
    navigation.navigate(SCREENS.PERIOD_SELECTOR, {
      startDate: null,
      endDate: null,
      rangeDays: rangeDays,
    });
  };

  const handleViewHistory = () => {
    navigation.navigate(SCREENS.PERIODS_LIST);
  };

  const handleEndPeriod = async () => {
    const rangeDays = customerPeriodData?.avg_period_length || 5;

    navigation.navigate(SCREENS.PERIOD_SELECTOR, {
      ...range,
      rangeDays: rangeDays,
      periodId: activePeriodId,
    });
  };

  // Simple helper functions using server-calculated data
  const getCardLabel = () => {
    if (isLoadingPeriod) return '';
    return customerPeriodData?.card_label || 'Next Event';
  };

  const getCardValue = () => {
    if (isLoadingPeriod) return 'Loading...';
    return customerPeriodData?.card_value || 'Not Available';
  };

  const getCardSubtitle = () => {
    if (isLoadingPeriod) return '';
    return customerPeriodData?.card_subtitle || 'Start tracking your periods';
  };

  const getCardButtonText = () => {
    return customerPeriodData?.card_button_text || 'Start Period';
  };

  const handleCardButtonPress = () => {
    const status = customerPeriodData?.card_status;

    // Use server's status to determine action
    if (status === 'period_active') {
      handleEndPeriod();
    } else if (status === 'fertile_window') {
      handleViewHistory();
    } else {
      // period_late, upcoming_ovulation, upcoming_period, no_data
      handleStartPeriod();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={styles.headerBtn}
        >
          <FontelloIcon name="cog-1" size={26} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>FemCare</Text>
          <Text style={styles.headerDate}>
            {monthNamesShort[new Date().getMonth()]} {new Date().getFullYear()}
          </Text>
        </View>
        <TouchableOpacity onPress={openModal} style={styles.headerBtn}>
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>5</Text>
          </View>
          <FontelloIcon name="bell-alt" size={26} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Notifications Modal */}
      <NotificationsModal
        visible={showNotifications}
        items={dummyNotifications}
        onClose={closeModal}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Period Card */}
        <LinearGradient
          colors={[
            HOME_CARD_PASTEL.coral,
            HOME_CARD_PASTEL.melon,
            HOME_CARD_PASTEL.peach,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.mainCard}
        >
          <View style={styles.mainCardContent}>
            <Text style={styles.mainCardLabel}>{getCardLabel()}</Text>

            <Text style={styles.mainCardValue}>{getCardValue()}</Text>

            <Text style={styles.mainCardSubtitle}>{getCardSubtitle()}</Text>

            <TouchableOpacity
              style={styles.periodBtn}
              onPress={handleCardButtonPress}
              disabled={isLoadingPeriod}
            >
              {isLoadingPeriod ? (
                <ActivityIndicator
                  size="small"
                  color={THEME_COLORS.secondary}
                />
              ) : (
                <Text style={styles.periodBtnText}>{getCardButtonText()}</Text>
              )}
            </TouchableOpacity>

            <Image
              source={require('../../assets/images/cat.png')}
              style={styles.decorImage}
              resizeMode="contain"
            />
          </View>
        </LinearGradient>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statsScrollView}
          contentContainerStyle={styles.statsScroll}
        >
          {quickStats.map(stat => (
            <TouchableOpacity
              key={stat.id}
              activeOpacity={0.7}
              onPress={() => {
                if (stat.screen) {
                  navigation.navigate(stat.screen);
                }
              }}
            >
              <LinearGradient
                colors={stat.bgColor}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCard}
              >
                <View style={styles.statCardContent}>
                  {/* Icon at top */}
                  {stat.icon && (
                    <View style={styles.statIconContainer}>
                      <FontelloIcon
                        name={stat.icon}
                        size={18}
                        color={stat.iconColor}
                      />
                    </View>
                  )}
                  {/* Label */}
                  <Text style={styles.statLabel}>{stat.label}</Text>

                  {/* Content - Value or Emoji */}
                  {stat.contentType === 'value' && (
                    <View style={styles.statValueContainer}>
                      <Text style={styles.statValue}>{stat.value}</Text>
                      {stat.levelIcon && (
                        <FontelloIcon
                          name={stat.levelIcon}
                          size={12}
                          color={stat.levelColor}
                          style={styles.levelIndicator}
                        />
                      )}
                    </View>
                  )}
                  {stat.contentType === 'emoji' && (
                    <Text style={styles.statEmoji}>{stat.emoji}</Text>
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Daily Check-in */}
        <View style={styles.checkInCard}>
          <View style={styles.checkInLeft}>
            <Text style={styles.checkInTitle}>How are you feeling today?</Text>
            <Text style={styles.checkInSubtitle}>Log your daily wellness</Text>
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

        {/* Health Insights */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Health Insights</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {healthInsights.map(insight => (
          <View key={insight.id} style={styles.insightCard}>
            <View
              style={[styles.insightIcon, { backgroundColor: insight.bgColor }]}
            >
              <FontelloIcon
                name={insight.icon}
                size={22}
                color={insight.color}
              />
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightDescription}>
                {insight.description}
              </Text>
            </View>
          </View>
        ))}

        {/* Daily Tips Card */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <View style={styles.tipsIconBox}>
              <Text style={styles.tipsIcon}>💡</Text>
            </View>
            <Text style={styles.tipsTitle}>Daily Health Tip</Text>
          </View>
          {isLoadingTip ? (
            <View style={styles.tipLoadingContainer}>
              <ActivityIndicator size="small" color={THEME_COLORS.primary} />
              <Text style={styles.tipLoadingText}>Loading today's tip...</Text>
            </View>
          ) : tipError ? (
            <Text style={styles.tipsText}>
              Stay hydrated and get 7-8 hours of sleep for optimal health.
              Regular exercise can help regulate your cycle and improve mood.
            </Text>
          ) : dailyTip ? (
            <>
              <Text style={styles.tipsText}>{dailyTip.short_description}</Text>
              <TouchableOpacity
                style={styles.tipsBtn}
                onPress={() => {
                  navigation.navigate(SCREENS.DAILY_TIP);
                }}
              >
                <Text style={styles.tipsBtnText}>Read More</Text>
                <FontelloIcon
                  name="right-open-mini"
                  size={16}
                  color={THEME_COLORS.primary}
                />
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.tipsText}>
              Stay hydrated and get 7-8 hours of sleep for optimal health.
            </Text>
          )}
        </View>

        {/* Quick Actions */}
        <HomeQuickActions />

        {/* Latest Blogs */}
        <View style={styles.blogsHeader}>
          <Text style={styles.blogsTitle}>Latest Articles</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate(SCREENS.BLOG_LIST)}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        {isLoadingBlogs ? (
          <View style={styles.blogsLoadingContainer}>
            <ActivityIndicator size="small" color={THEME_COLORS.primary} />
          </View>
        ) : blogs.length === 0 ? (
          <View style={styles.blogsEmptyContainer}>
            <Text style={styles.blogsEmptyText}>No articles available yet</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.blogsScroll}
          >
            {blogs.map(blog => (
              <TouchableOpacity
                key={blog.id}
                style={styles.blogCard}
                onPress={() =>
                  navigation.navigate(SCREENS.BLOG_DETAIL, {
                    blogId: blog.id,
                  } as any)
                }
                activeOpacity={0.8}
              >
                <View style={styles.placeholderBlogImage}>
                  <FontelloIcon
                    name="doc-text"
                    size={32}
                    color={THEME_COLORS.primary}
                  />
                </View>
                <View style={styles.blogCardContent}>
                  <View style={styles.blogCardBadge}>
                    <Text style={styles.blogCardBadgeText}>Article</Text>
                  </View>
                  <Text style={styles.blogCardTitle} numberOfLines={2}>
                    {blog.title}
                  </Text>
                  <Text style={styles.blogCardExcerpt} numberOfLines={2}>
                    {blog.short_description || 'Read more...'}
                  </Text>
                  <View style={styles.blogCardFooter}>
                    <Text style={styles.blogCardReadTime}>
                      {formatBlogDate(blog.published_date)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
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
    paddingHorizontal: STYLE.spacing.ph,
    paddingVertical: 8,
    backgroundColor: THEME_COLORS.textLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: STYLE.spacing.mv,
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
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: THEME_COLORS.secondary,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  notificationBadgeText: {
    color: THEME_COLORS.textLight,
    fontSize: 10,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: STYLE.spacing.mh,
  },
  statsScrollView: {
    marginHorizontal: -STYLE.spacing.mh,
  },
  statsScroll: {
    paddingHorizontal: STYLE.spacing.mh,
    marginVertical: STYLE.spacing.mv,
    gap: 10,
  },
  mainCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    marginVertical: STYLE.spacing.mv,
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
  periodBtn: {
    backgroundColor: THEME_COLORS.extraLightBg,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  periodBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLORS.secondary,
  },
  decorImage: {
    position: 'absolute',
    bottom: -10,
    right: 10,
    width: 90,
    height: 90,
    opacity: 0.7,
  },
  blogsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: STYLE.spacing.ph,
    marginTop: 8,
    marginBottom: 12,
  },
  blogsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME_COLORS.text,
  },
  blogsScroll: {
    paddingHorizontal: STYLE.spacing.ph,
    paddingBottom: 20,
    gap: 12,
  },
  blogCard: {
    width: 280,
    backgroundColor: THEME_COLORS.textLight,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  blogCardImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#E5E7EB',
  },
  placeholderBlogImage: {
    width: '100%',
    height: 140,
    backgroundColor: THEME_COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blogCardContent: {
    padding: 12,
  },
  blogCardBadge: {
    alignSelf: 'flex-start',
    backgroundColor: THEME_COLORS.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  blogCardBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME_COLORS.primary,
  },
  blogCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME_COLORS.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  blogCardExcerpt: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  blogCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  blogCardReadTime: {
    fontSize: 12,
    color: '#999',
  },
  blogsLoadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  blogsEmptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    paddingHorizontal: STYLE.spacing.ph,
  },
  blogsEmptyText: {
    fontSize: 14,
    color: '#999',
  },
  checkInCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME_COLORS.textLight,
    padding: 20,
    borderRadius: 16,
    marginVertical: STYLE.spacing.mv,
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
    paddingHorizontal: STYLE.spacing.ph,
    marginVertical: STYLE.spacing.mv,
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
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLORS.textLight,
    marginBottom: STYLE.spacing.mv,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  insightIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME_COLORS.text,
    marginBottom: 2,
  },
  insightDescription: {
    fontSize: 13,
    color: '#999',
  },
  tipsCard: {
    backgroundColor: '#FFF9F0',
    marginVertical: STYLE.spacing.mv,
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsIconBox: {
    marginRight: 8,
  },
  tipsIcon: {
    fontSize: 24,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME_COLORS.text,
  },
  tipsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  tipsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  tipsBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLORS.primary,
    marginRight: 4,
  },
  tipLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  tipLoadingText: {
    fontSize: 14,
    color: '#999',
  },
  statCard: {
    width: 100,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  statCardContent: {
    padding: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME_COLORS.text,
    opacity: 0.85,
    textAlign: 'center',
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 25,
    fontWeight: '800',
    color: THEME_COLORS.text,
  },
  levelIndicator: {
    marginTop: 2,
  },
  statEmoji: {
    fontSize: 25,
  },
  iconEmoji: {
    fontSize: 14,
  },
});
