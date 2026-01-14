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
import FontelloIcon from '../../utils/FontelloIcons';
import NotificationsModal from '../../components/common/NotificationsModal';
import { THEME_COLORS, HOME_CARD_PASTEL } from '../../constants/colors';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RootStackParamList, SCREENS } from '../../constants/navigation';
import { monthNamesShort } from '../../constants/common';
import QuickActions from '../../components/common/QuickActions';
import DiaryModal from '../common/dairy/DiaryModal';
import { blogPosts } from '../blog/BlogListScreen';

export default function HomeScreen() {
  const navigation = useNavigation<DrawerNavigationProp<RootStackParamList>>();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDiaryModal, setShowDiaryModal] = useState(false);

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
      icon: 'cog-b',
      color: '#10B981',
    },
  ];

  const quickStats = [
    {
      id: 1,
      label: 'Cycle Day',
      value: '20',
      icon: 'calendar',
      iconColor: '#9333EA',
      bgColor: ['#E9D5FF', '#C084FC'],
      contentType: 'value',
    },
    {
      id: 2,
      label: 'Pregnancy',
      value: 'Low',
      icon: 'heart',
      iconColor: '#DC2626',
      levelIcon: 'down-open',
      levelColor: '#DC2626',
      bgColor: ['#FECACA', '#F87171'],
      contentType: 'value',
    },
    {
      id: 3,
      label: 'Ovulation',
      emoji: '🎯',
      icon: 'target',
      iconColor: '#0284C7',
      bgColor: ['#BAE6FD', '#38BDF8'],
      contentType: 'emoji',
    },
    {
      id: 4,
      label: 'Mood',
      emoji: '😊',
      icon: 'heart',
      iconColor: '#EA580C',
      bgColor: ['#FED7AA', '#FB923C'],
      contentType: 'emoji',
    },
    {
      id: 5,
      label: 'Energy',
      value: '85%',
      icon: 'flash',
      iconColor: '#0284C7',
      levelIcon: 'up-open',
      levelColor: '#10B981',
      bgColor: ['#DBEAFE', '#60A5FA'],
      contentType: 'value',
    },
    {
      id: 6,
      label: 'Symptoms',
      value: '2',
      icon: 'attention',
      iconColor: '#CA8A04',
      bgColor: ['#FDE68A', '#FBBF24'],
      contentType: 'value',
    },
    {
      id: 7,
      label: 'Sleep',
      emoji: '😴',
      icon: 'moon',
      iconColor: '#7C3AED',
      bgColor: ['#DDD6FE', '#A78BFA'],
      contentType: 'emoji',
    },
  ];

  const openModal = () => {
    setShowNotifications(true);
  };

  const closeModal = () => {
    setShowNotifications(false);
  };

  const latestBlogs = blogPosts.slice(0, 5);

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
            <Text style={styles.mainCardLabel}>Next Period</Text>
            <Text style={styles.mainCardValue}>12 Days Left</Text>
            <Text style={styles.mainCardSubtitle}>
              Expected date: Jan 26, 2026
            </Text>

            <TouchableOpacity
              style={styles.periodBtn}
              onPress={() => {
                navigation.navigate(SCREENS.PERIOD_SELECTOR);
              }}
            >
              <Text style={styles.periodBtnText}>Period Starts</Text>
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
          contentContainerStyle={styles.statsScroll}
        >
          {quickStats.map(stat => (
            <TouchableOpacity key={stat.id} activeOpacity={0.7}>
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
            onPress={() => setShowDiaryModal(true)}
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

        {/* Tips Card */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <View style={styles.tipsIconBox}>
              <Text style={styles.tipsIcon}>💡</Text>
            </View>
            <Text style={styles.tipsTitle}>Daily Health Tips</Text>
          </View>
          <Text style={styles.tipsText}>
            Stay hydrated and get 7-8 hours of sleep for optimal health. Regular
            exercise can help regulate your cycle and improve mood.
          </Text>
          <TouchableOpacity
            style={styles.tipsBtn}
            onPress={() => navigation.navigate(SCREENS.TIPS_SCREEN)}
          >
            <Text style={styles.tipsBtnText}>Learn More</Text>
            <FontelloIcon
              name="right-open-mini"
              size={16}
              color={THEME_COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <QuickActions
          actions={[
            {
              icon: 'bell-alt',
              label: 'Reminders',
              color: '#6366F1',
              bg: '#E0E7FF',
              onPress: () => navigation.navigate(SCREENS.REMINDERS),
            },
            {
              icon: 'heart',
              label: 'Symptoms',
              color: '#EC4899',
              bg: '#FCE7F3',
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
              icon: 'pharmacy',
              label: 'Medications',
              color: '#F59E0B',
              bg: '#FDE68A',
            },
            {
              icon: 'calendar',
              label: 'Calendar',
              color: '#EF4444',
              bg: '#FEE2E2',
            },
          ]}
        />

        {/* Latest Blogs */}
        <View style={styles.blogsHeader}>
          <Text style={styles.blogsTitle}>Latest Articles</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate(SCREENS.BLOG_LIST)}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.blogsScroll}
        >
          {latestBlogs.map(blog => (
            <TouchableOpacity
              key={blog.id}
              style={styles.blogCard}
              onPress={() =>
                navigation.navigate(SCREENS.BLOG_DETAIL, { blog } as any)
              }
              activeOpacity={0.8}
            >
              <Image source={blog.image} style={styles.blogCardImage} />
              <View style={styles.blogCardContent}>
                <View style={styles.blogCardBadge}>
                  <Text style={styles.blogCardBadgeText}>{blog.category}</Text>
                </View>
                <Text style={styles.blogCardTitle} numberOfLines={2}>
                  {blog.title}
                </Text>
                <View style={styles.blogCardFooter}>
                  <Text style={styles.blogCardReadTime}>{blog.readTime}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
      <DiaryModal
        visible={showDiaryModal}
        onClose={() => setShowDiaryModal(false)}
        initialDate={new Date()}
        onSave={(date, text) => {
          // Handle save logic here
          console.log('Diary saved:', { date, text });
        }}
      />
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
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 12,
  },
  blogsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME_COLORS.text,
  },
  blogsScroll: {
    paddingHorizontal: 20,
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
  blogCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  blogCardReadTime: {
    fontSize: 12,
    color: '#999',
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
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 24,
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
  statsScroll: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
  },
  statCard: {
    width: 100,
    // height: 115,
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
});
