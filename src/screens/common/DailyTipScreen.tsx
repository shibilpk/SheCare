import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FontelloIcon from '../../services/FontelloIcons';
import { THEME_COLORS } from '../../constants/colors';
import { RootStackParamList } from '../../constants/navigation';
import { STYLE } from '../../constants/app';
import { useDailyTip } from '../../hooks/useDailyTip';
import LinearGradient from 'react-native-linear-gradient';

type DailyTipNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DailyTip'
>;

const DailyTipScreen: React.FC = () => {
  const navigation = useNavigation<DailyTipNavigationProp>();
  const { tip: dailyTip, isLoading, error } = useDailyTip();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <FontelloIcon name="left-open-mini" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Health Tip</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={THEME_COLORS.primary} />
            <Text style={styles.loadingText}>Loading today's tip...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <FontelloIcon name="attention" size={48} color="#EF4444" />
            <Text style={styles.errorTitle}>Oops!</Text>
            <Text style={styles.errorText}>
              Unable to load today's tip. Please try again later.
            </Text>
          </View>
        ) : dailyTip ? (
          <>
            {/* Hero Section */}
            <LinearGradient
              colors={['#FFF9F0', '#FEF3C7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroCardContainer}>
                <View style={styles.iconContainer}>
                  <Text style={styles.heroIcon}>💡</Text>
                </View>
                <Text style={styles.heroTitle}>Daily Health Tip</Text>
                <Text style={styles.heroDate}>{formatDate(dailyTip.date)}</Text>
              </View>
            </LinearGradient>

            {/* Quick Tip Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <FontelloIcon
                  name="flash"
                  size={20}
                  color={THEME_COLORS.primary}
                />
                <Text style={styles.sectionTitle}>Quick Tip</Text>
              </View>
              <Text style={styles.shortDescription}>
                {dailyTip.short_description}
              </Text>
            </View>

            {/* Detailed Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <FontelloIcon
                  name="book"
                  size={20}
                  color={THEME_COLORS.primary}
                />
                <Text style={styles.sectionTitle}>Learn More</Text>
              </View>
              <Text style={styles.longDescription}>
                {dailyTip.long_description}
              </Text>
            </View>

            {/* Action Card */}
            <View style={styles.actionCard}>
              <View style={styles.actionIconBox}>
                <FontelloIcon name="heart" size={24} color="#EC4899" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Take Action Today</Text>
                <Text style={styles.actionText}>
                  Apply this tip to improve your health and wellness journey.
                </Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.errorContainer}>
            <FontelloIcon name="attention" size={48} color="#F59E0B" />
            <Text style={styles.errorTitle}>No Tip Available</Text>
            <Text style={styles.errorText}>
              Check back tomorrow for a new health tip!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...STYLE.header,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    ...STYLE.headerTitle,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME_COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  heroCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  heroCardContainer:{
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME_COLORS.textLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  heroIcon: {
    fontSize: 40,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: THEME_COLORS.text,
    marginBottom: 8,
  },
  heroDate: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  section: {
    backgroundColor: THEME_COLORS.textLight,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME_COLORS.text,
  },
  shortDescription: {
    fontSize: 16,
    color: THEME_COLORS.text,
    lineHeight: 24,
    fontWeight: '500',
  },
  longDescription: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 26,
  },
  actionCard: {
    flexDirection: 'row',
    backgroundColor: '#FCE7F3',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#EC4899',
  },
  actionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME_COLORS.textLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME_COLORS.text,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default DailyTipScreen;
