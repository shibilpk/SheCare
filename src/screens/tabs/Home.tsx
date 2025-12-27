import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  Modal,
} from 'react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import FontelloIcon from '../../utils/FontelloIcons';
import ModalTopIcon from '../../components/common/ModalTopIcon';
import { THEME_COLORS, HOME_CARD_PASTEL } from '../../constants/colors';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RootStackParamList, SCREENS } from '../../constants/navigation';
import { monthNamesShort } from '../../constants/common';

export default function HomeScreen() {
  const navigation = useNavigation<DrawerNavigationProp<RootStackParamList>>();
  const [showNotifications, setShowNotifications] = useState(false);
  const modalAnim = useSharedValue(0);
  const insets = useSafeAreaInsets();
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
      icon: "calendar",
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

  const openModal = () => {
    setShowNotifications(true);
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
    setTimeout(() => setShowNotifications(false), 300);
  };

  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY:
          modalAnim.value === 1
            ? withTiming(0, { duration: 0 })
            : withTiming(400 * (1 - modalAnim.value), { duration: 0 }),
      },
    ],
  }));

  const quickStats = [
    { id: 1, label: 'CYCLE DAY', value: '20', bgColor: ['#E9D5FF', '#C084FC'] },
    { id: 2, label: 'Mood', emoji: '😊', bgColor: ['#FED7AA', '#FB923C'] },
    { id: 3, label: 'Energy', emoji: '⚡', bgColor: ['#BAE6FD', '#38BDF8'] },
    { id: 4, label: 'Symptoms', emoji: '🤒', bgColor: ['#FECACA', '#F87171'] },
    { id: 5, label: 'Sleep', emoji: '😴', bgColor: ['#DDD6FE', '#A78BFA'] },
  ];

  const healthInsights = [
    {
      id: 1,
      icon: 'chart-line',
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
      <Modal
        visible={showNotifications}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={[styles.modalContent, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notifications</Text>
            <ModalTopIcon onPress={closeModal} iconName="cancel" />
          </View>
          <FlatList
            data={dummyNotifications}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.notificationCard}>
                <View
                  style={[
                    styles.notificationIcon,
                    { backgroundColor: item.color },
                  ]}
                >
                  <FontelloIcon
                    name={item.icon}
                    size={18}
                    color={THEME_COLORS.textLight}
                  />
                </View>
                <View style={styles.notificationContent}>
                  <View style={styles.notificationTop}>
                    <Text style={styles.notificationTitle}>{item.title}</Text>
                    <Text style={styles.notificationTime}>{item.time}</Text>
                  </View>
                  <Text style={styles.notificationMessage}>{item.message}</Text>
                </View>
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>

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
              Next ovulation: 29 days left
            </Text>

            <TouchableOpacity style={styles.periodBtn} onPress={() => {navigation.navigate(SCREENS.PERIOD_SELECTOR)}}>
              <Text style={styles.periodBtnText}>Period Starts</Text>
            </TouchableOpacity>

            <Image
              source={require('../../assets/images/cat.png')}
              style={styles.decorImage}
              resizeMode="contain"
            />
          </View>
        </LinearGradient>
        {/* Fertility Status Banner */}
        <LinearGradient
          colors={[THEME_COLORS.secondary, '#FECACA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fertilityBanner}
        >
          <View style={styles.fertilityBannerContent}>
            <View style={styles.fertilityIconBox}>
              <FontelloIcon
                name="heart"
                size={28}
                color={THEME_COLORS.textLight}
              />
            </View>
            <Text style={styles.fertilityText}>
              Medium chance of getting pregnant
            </Text>
          </View>
        </LinearGradient>

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
            <Text style={styles.checkInSubtitle}>Log your daily wellness</Text>
          </View>
          <TouchableOpacity
            style={styles.checkInBtn}
            onPress={() =>
              navigation.navigate(SCREENS.CALENDAR, { openDiaryModal: true })
            }
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
          <TouchableOpacity style={styles.tipsBtn}>
            <Text style={styles.tipsBtnText}>Learn More</Text>
            <FontelloIcon
              name="right-open-mini"
              size={16}
              color={THEME_COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <View
          style={[
            styles.actionsGrid,
            { justifyContent: 'flex-start', flexWrap: 'wrap' },
          ]}
        >
          {[
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
            },
            {
              icon: 'pitch',
              label: 'Nutrition',
              color: '#10B981',
              bg: '#D1FAE5',
            },
            {
              icon: 'pharmacy',
              label: 'Medications',
              color: '#F59E0B',
              bg: '#FDE68A',
            },
            {
              icon: "calendar",
              label: 'Calendar',
              color: '#EF4444',
              bg: '#FEE2E2',
            },
          ].map((action, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.actionGridItem}
              onPress={action?.onPress}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.bg }]}>
                <FontelloIcon
                  name={action.icon}
                  size={24}
                  color={action.color}
                />
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
  fertilityBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  fertilityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    shadowColor: THEME_COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    gap: 14,
  },
  fertilityIconBox: {
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: THEME_COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: THEME_COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  fertilityText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME_COLORS.textLight,
    textShadowColor: 'rgba(0,0,0,0.08)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
  statsScroll: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  statValue: {
    fontSize: 36,
    fontWeight: '800',
    color: THEME_COLORS.text,
  },
  statEmoji: {
    fontSize: 40,
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
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    gap: 12,
  },
  actionGridItem: {
    width: '22%', // 4 items per row with gap
    minWidth: 70,
    alignItems: 'center',
    marginBottom: 12,
  },

  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLORS.text,
  },
  modalContent: {
    backgroundColor: THEME_COLORS.textLight,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '100%',
    height: '100%',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderRadius: 0,
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
  notificationCard: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME_COLORS.text,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
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
    overflow: 'hidden',
  },

  statTitle: { color: THEME_COLORS.text, fontSize: 14, textAlign: 'center' },
});
