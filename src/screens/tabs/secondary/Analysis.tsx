import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Share,
} from 'react-native';
import { LineChart, BarChart, ProgressChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { STYLE } from '../../../constants/app';
import { RootStackParamList, SCREENS } from '../../../constants/navigation';
import { monthNames } from '../../../constants/common';
import { ScreenLoader } from '@src/components';
import { parseLocalDate } from '@src/utils/date';
import { usePregnancyDashboard } from '@src/hooks/usePregnancyDashboard';

const EXERCISE_WEEKLY_GOAL_MIN = 150; // matches backend health_metrics goal
const MAX_CHART_LABELS = 6;

/** Week-based guide (typical timings), checked off once the week has passed. */
const TRIMESTER_MILESTONES: Record<number, { week: number; label: string }[]> =
  {
    1: [
      { week: 6, label: 'Heartbeat may be detected (Week 6)' },
      { week: 8, label: 'First prenatal visit (Week 8-10)' },
      { week: 12, label: 'Dating / NT scan (Week 11-13)' },
      { week: 13, label: 'End of first trimester (Week 13)' },
    ],
    2: [
      { week: 16, label: 'Baby can sense light (Week 16)' },
      { week: 20, label: 'Anatomy scan (Week 18-22)' },
      { week: 20, label: 'First kicks often felt (Week 18-22)' },
      { week: 26, label: 'Glucose screening test (Week 24-28)' },
      { week: 27, label: 'End of second trimester (Week 27)' },
    ],
    3: [
      { week: 28, label: 'Start counting kicks daily (Week 28)' },
      { week: 32, label: 'Growth scan if advised (Week 32)' },
      { week: 36, label: 'Hospital bag packed (Week 36)' },
      { week: 37, label: 'Baby is early term (Week 37)' },
      { week: 40, label: 'Due date (Week 40)' },
    ],
  };

function formatLongDate(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  return `${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatBabyWeight(grams: number): string {
  if (grams < 1) return 'less than 1 g';
  if (grams < 1000) return `~${grams} g`;
  return `~${(grams / 1000).toFixed(1)} kg`;
}

function withArticle(noun: string): string {
  return `${/^[aeiou]/i.test(noun) ? 'an' : 'a'} ${noun}`;
}

/** Blank out labels so at most `max` are shown (chart-kit has no label skipping). */
function thinLabels(labels: string[], max = MAX_CHART_LABELS): string[] {
  if (labels.length <= max) return labels;
  const step = Math.ceil(labels.length / max);
  return labels.map((label, i) =>
    i % step === 0 || i === labels.length - 1 ? label : '',
  );
}

const pct = (value: number) => `${Math.round(value * 100)}%`;

const PregnancyAnalysisScreen = () => {
  const screenWidth = Dimensions.get('window').width;
  const navigation = useNavigation<DrawerNavigationProp<RootStackParamList>>();
  const { data, isLoading, error, notFound, refetch } = usePregnancyDashboard();
  // Spinner only for pull-to-refresh; focus refetches update silently
  const [pullRefreshing, setPullRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setPullRefreshing(true);
    await refetch();
    setPullRefreshing(false);
  }, [refetch]);

  // Chart configurations
  const baseChartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(236, 72, 153, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(60, 60, 60, ${opacity})`,
    propsForBackgroundLines: {
      stroke: '#f0f0f0',
      strokeDasharray: '5',
      strokeWidth: 1,
    },
  };

  const progressChartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(236, 72, 153, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
  };

  const renderHeader = (subtitle?: string) => (
    <View style={styles.header}>
      <Text style={styles.title}>Pregnancy Analytics</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );

  const renderChartEmpty = (message: string) => (
    <View style={styles.chartEmpty}>
      <Text style={styles.chartEmptyText}>{message}</Text>
    </View>
  );

  if (!data) {
    let body: React.ReactNode;
    if (isLoading) {
      body = <ScreenLoader message="Loading your analytics..." />;
    } else if (notFound) {
      body = (
        <View style={styles.stateContainer}>
          <Text style={styles.stateEmoji}>🤰</Text>
          <Text style={styles.stateTitle}>No active pregnancy</Text>
          <Text style={styles.stateMessage}>
            Add your due date in pregnancy settings to see weight, baby growth,
            symptom and activity trends here.
          </Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate(SCREENS.PREGNANCY_SETTINGS)}
          >
            <Text style={styles.actionButtonText}>Open Pregnancy Settings</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      body = (
        <View style={styles.stateContainer}>
          <Text style={styles.stateEmoji}>⚠️</Text>
          <Text style={styles.stateTitle}>Couldn't load your analytics</Text>
          <Text style={styles.stateMessage}>
            {error || 'Something went wrong. Please try again.'}
          </Text>
          <TouchableOpacity style={styles.actionButton} onPress={refetch}>
            <Text style={styles.actionButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.stateWrapper}>
          {renderHeader()}
          {body}
        </View>
      </SafeAreaView>
    );
  }

  const {
    pregnancy,
    baby,
    maternal,
    today,
    health_metrics: healthMetrics,
    weight_series: weightSeries,
    baby_growth: babyGrowth,
    symptoms_by_week: symptomsByWeek,
    activity_last_7_days: activity,
    upcoming_appointment: appointment,
  } = data;

  // Weight progression (mother's weight entries, latest per pregnancy week)
  const weightProgressData = {
    labels: thinLabels(weightSeries.map(p => `W${p.week}`)),
    datasets: [
      {
        data: weightSeries.map(p => p.weight_kg),
        color: (opacity = 1) => `rgba(236, 72, 153, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  // Baby growth (typical estimated weight in grams per week)
  const babyGrowthData = {
    labels: thinLabels(babyGrowth.map(p => `W${p.week}`)),
    datasets: [
      {
        data: babyGrowth.map(p => p.weight_g),
        color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  // Symptoms logged in daily check-ins, per pregnancy week
  const symptomData = {
    labels: symptomsByWeek.map(p => `W${p.week}`),
    datasets: [
      {
        data: symptomsByWeek.map(p => p.count),
        color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };
  const hasSymptoms = symptomsByWeek.some(p => p.count > 0);

  // Exercise minutes per day, last 7 days
  const activityData = {
    labels: activity.map(d => d.label),
    datasets: [{ data: activity.map(d => d.minutes) }],
  };
  const hasActivity = activity.some(d => d.minutes > 0);
  const activityTotal = activity.reduce((sum, d) => sum + d.minutes, 0);

  // Health metrics progress (each 0..1 of goal over the last 7 days)
  const progressData = {
    labels: ['Nutrition', 'Hydration', 'Sleep', 'Exercise', 'Check-ins'],
    data: [
      healthMetrics.nutrition,
      healthMetrics.hydration,
      healthMetrics.sleep,
      healthMetrics.exercise,
      healthMetrics.wellness,
    ],
  };
  const checkinDays = Math.round(healthMetrics.wellness * 7);

  const weightGain = maternal.weight_gain_kg;
  const weightAdvice =
    weightGain === null
      ? 'Log your weight regularly to track your pregnancy weight gain.'
      : `You've gained ${formatNumber(weightGain)} kg so far. The recommended total gain by your due date is ${maternal.recommended_gain}. Continue with balanced nutrition and regular prenatal check-ups.`;

  const weightChartDescription = (() => {
    if (weightSeries.length < 2) return null;
    const first = weightSeries[0];
    const last = weightSeries[weightSeries.length - 1];
    const diff = last.weight_kg - first.weight_kg;
    return `${diff >= 0 ? '+' : ''}${formatNumber(
      Math.round(diff * 10) / 10,
    )} kg between week ${first.week} and week ${last.week}.`;
  })();

  const milestones = TRIMESTER_MILESTONES[pregnancy.trimester] ?? [];

  const shareWithDoctor = () => {
    const lines = [
      `Pregnancy summary – week ${pregnancy.current_week} (trimester ${pregnancy.trimester})`,
      `Due date: ${formatLongDate(pregnancy.due_date)} (${pregnancy.days_remaining} days left)`,
      maternal.current_weight_kg !== null
        ? `Current weight: ${formatNumber(maternal.current_weight_kg)} kg`
        : null,
      weightGain !== null
        ? `Weight gain: ${formatNumber(weightGain)} kg (recommended ${maternal.recommended_gain})`
        : null,
      data.recent_symptoms.length > 0
        ? `Recent symptoms (last 7 days): ${data.recent_symptoms
            .map(s => `${s.name} (${s.days}d)`)
            .join(', ')}`
        : null,
      `Exercise last 7 days: ${activityTotal} min`,
      `Last 7 days – nutrition ${pct(healthMetrics.nutrition)}, hydration ${pct(
        healthMetrics.hydration,
      )}, sleep ${pct(healthMetrics.sleep)} of goal`,
    ].filter(Boolean);
    Share.share({ message: lines.join('\n') }).catch(e =>
      console.info('Share failed', e),
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={pullRefreshing}
            onRefresh={onRefresh}
            colors={['#EC4899']}
            tintColor={'#EC4899'}
          />
        }
      >
        {/* Header */}
        {renderHeader(
          `Week ${pregnancy.current_week} • Trimester ${pregnancy.trimester}`,
        )}

        {/* Quick Stats */}
        <View style={styles.quickStatsContainer}>
          <View style={styles.quickStatCard}>
            <Text style={styles.quickStatValue}>{pregnancy.current_week}</Text>
            <Text style={styles.quickStatLabel}>Weeks</Text>
          </View>
          <View style={styles.quickStatCard}>
            <Text style={styles.quickStatValue}>
              {pregnancy.days_remaining}
            </Text>
            <Text style={styles.quickStatLabel}>Days Left</Text>
          </View>
          <View style={styles.quickStatCard}>
            <Text style={styles.quickStatValue}>
              {pregnancy.progress_percent}%
            </Text>
            <Text style={styles.quickStatLabel}>Complete</Text>
          </View>
        </View>

        {/* Maternal Health Summary */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>👩‍⚕️ Maternal Health</Text>
          </View>

          <View style={styles.healthMetricsGrid}>
            <View style={styles.healthMetricItem}>
              <Text style={styles.healthMetricLabel}>Current Weight</Text>
              <Text style={styles.healthMetricValue}>
                {maternal.current_weight_kg === null
                  ? '—'
                  : formatNumber(maternal.current_weight_kg)}
              </Text>
              <Text style={styles.healthMetricUnit}>kg</Text>
            </View>
            <View style={styles.healthMetricItem}>
              <Text style={styles.healthMetricLabel}>Weight Gain</Text>
              <Text style={styles.healthMetricValue}>
                {weightGain === null
                  ? '—'
                  : `${weightGain >= 0 ? '+' : ''}${formatNumber(weightGain)}`}
              </Text>
              <Text style={styles.healthMetricUnit}>kg</Text>
            </View>
            <View style={styles.healthMetricItem}>
              <Text style={styles.healthMetricLabel}>Pre-pregnancy</Text>
              <Text style={styles.healthMetricValue}>
                {maternal.pre_pregnancy_weight_kg === null
                  ? '—'
                  : formatNumber(maternal.pre_pregnancy_weight_kg)}
              </Text>
              <Text style={styles.healthMetricUnit}>kg</Text>
            </View>
            <View style={styles.healthMetricItem}>
              <Text style={styles.healthMetricLabel}>Exercise (week)</Text>
              <Text style={styles.healthMetricValue}>
                {today.exercise_minutes_week}
              </Text>
              <Text style={styles.healthMetricUnit}>min</Text>
            </View>
            <View style={[styles.healthMetricItem, styles.healthHighlight]}>
              <Text style={styles.healthMetricLabel}>
                Recommended Total Gain
              </Text>
              <Text
                style={[
                  styles.healthMetricValue,
                  styles.healthMetricValueSmall,
                ]}
              >
                {maternal.recommended_gain}
              </Text>
            </View>
          </View>

          <View style={styles.adviceBox}>
            <Text style={styles.adviceText}>{weightAdvice}</Text>
          </View>
        </View>

        {/* Health Metrics Progress */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>📊 Health Metrics</Text>
            <Text style={styles.cardSubtitle}>Last 7 days</Text>
          </View>
          <View style={styles.progressChartContainer}>
            <ProgressChart
              data={progressData}
              width={screenWidth - 68}
              height={220}
              strokeWidth={10}
              radius={26}
              chartConfig={progressChartConfig}
              hideLegend={false}
              style={styles.progressChart}
            />
          </View>
          <View style={styles.metricsLegend}>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={styles.legendDot} />
                <Text style={styles.legendText}>
                  Nutrition: {pct(healthMetrics.nutrition)}
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={styles.legendDot} />
                <Text style={styles.legendText}>
                  Hydration: {pct(healthMetrics.hydration)}
                </Text>
              </View>
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={styles.legendDot} />
                <Text style={styles.legendText}>
                  Sleep: {pct(healthMetrics.sleep)}
                </Text>
              </View>
              <View style={styles.legendItem}>
                <View style={styles.legendDot} />
                <Text style={styles.legendText}>
                  Exercise: {pct(healthMetrics.exercise)}
                </Text>
              </View>
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={styles.legendDot} />
                <Text style={styles.legendText}>
                  Check-ins: {checkinDays}/7 days
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.chartDescription}>
            Share of your daily goals reached over the last 7 days. Exercise is
            measured against {EXERCISE_WEEKLY_GOAL_MIN} min per week.
          </Text>
        </View>

        {/* Pregnancy Insights */}
        <View style={[styles.card, styles.insightsCard]}>
          <Text style={styles.cardTitle}>💡 Pregnancy Insights</Text>
          <View style={styles.insightsList}>
            <View style={styles.insightItem}>
              <View style={styles.insightBullet} />
              <Text style={styles.insightText}>
                You're in{' '}
                <Text style={styles.bold}>week {pregnancy.current_week}</Text>{' '}
                of your pregnancy
              </Text>
            </View>
            <View style={styles.insightItem}>
              <View style={styles.insightBullet} />
              <Text style={styles.insightText}>
                Baby is the size of{' '}
                {/^[aeiou]/i.test(baby.size_comparison) ? 'an' : 'a'}{' '}
                <Text style={styles.bold}>{baby.size_comparison}</Text>
              </Text>
            </View>
            <View style={styles.insightItem}>
              <View style={styles.insightBullet} />
              <Text style={styles.insightText}>
                <Text style={styles.bold}>
                  {pregnancy.days_remaining}{' '}
                  {pregnancy.days_remaining === 1 ? 'day' : 'days'}
                </Text>{' '}
                until your due date ({formatLongDate(pregnancy.due_date)})
              </Text>
            </View>
            <View style={styles.insightItem}>
              <View style={styles.insightBullet} />
              <Text style={styles.insightText}>{baby.development}</Text>
            </View>
            {appointment && (
              <View style={styles.insightItem}>
                <View style={styles.insightBullet} />
                <Text style={styles.insightText}>
                  Next appointment:{' '}
                  <Text style={styles.bold}>{appointment.title}</Text> on{' '}
                  {formatLongDate(appointment.date)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Weight Progression Chart */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>📈 Weight Progression</Text>
            <Text style={styles.cardSubtitle}>kg by week</Text>
          </View>
          {weightSeries.length >= 2 ? (
            <LineChart
              data={weightProgressData}
              width={screenWidth - 68}
              height={220}
              chartConfig={{
                ...baseChartConfig,
                fillShadowGradientOpacity: 0.3,
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#EC4899',
                  fill: '#ffffff',
                },
              }}
              bezier
              style={styles.chart}
            />
          ) : (
            renderChartEmpty(
              weightSeries.length === 1
                ? `One weight entry so far (week ${
                    weightSeries[0].week
                  }: ${formatNumber(
                    weightSeries[0].weight_kg,
                  )} kg). Log your weight in another week to see your progression.`
                : 'No weight entries since your pregnancy started. Log your weight to see your progression.',
            )
          )}
          {weightChartDescription && (
            <Text style={styles.chartDescription}>
              {weightChartDescription}
            </Text>
          )}
        </View>

        {/* Baby Growth Chart */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>👶 Baby Growth Tracker</Text>
            <Text style={styles.cardSubtitle}>Typical weight (g)</Text>
          </View>
          {babyGrowth.length >= 2 ? (
            <LineChart
              data={babyGrowthData}
              width={screenWidth - 68}
              height={220}
              chartConfig={{
                ...baseChartConfig,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
                fillShadowGradientOpacity: 0.3,
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#8B5CF6',
                  fill: '#ffffff',
                },
              }}
              bezier
              style={styles.chart}
            />
          ) : (
            renderChartEmpty('Growth data will appear from week 12.')
          )}
          <Text style={styles.chartDescription}>
            At week {baby.week} babies typically weigh{' '}
            {formatBabyWeight(baby.weight_g)} and are about{' '}
            {formatNumber(baby.length_cm)} cm long — around the size of{' '}
            {withArticle(baby.size_comparison)}.
          </Text>
        </View>

        {/* Symptom Tracking */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🩺 Symptoms Logged</Text>
            <Text style={styles.cardSubtitle}>Per week</Text>
          </View>
          {symptomsByWeek.length >= 2 && hasSymptoms ? (
            <LineChart
              data={symptomData}
              width={screenWidth - 68}
              height={220}
              fromZero
              chartConfig={{
                ...baseChartConfig,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
                fillShadowGradientOpacity: 0.3,
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#F59E0B',
                  fill: '#ffffff',
                },
              }}
              bezier
              style={styles.chart}
            />
          ) : (
            renderChartEmpty(
              hasSymptoms
                ? 'Not enough weeks yet to show a trend.'
                : 'No symptoms logged in recent weeks. Add them in your daily check-in.',
            )
          )}
          <Text style={styles.chartDescription}>
            Number of symptoms selected in your daily check-ins each week.
            Discuss any concerns with your doctor.
          </Text>
        </View>

        {/* Activity Levels */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🏃‍♀️ Activity Levels</Text>
            <Text style={styles.cardSubtitle}>Minutes, last 7 days</Text>
          </View>
          {activity.length >= 2 && hasActivity ? (
            <BarChart
              data={activityData}
              width={screenWidth - 68}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                ...baseChartConfig,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                fillShadowGradient: '#10B981',
                fillShadowGradientOpacity: 1,
                barPercentage: 0.7,
              }}
              style={styles.chart}
              showValuesOnTopOfBars
              fromZero
            />
          ) : (
            renderChartEmpty(
              'No exercise logged in the last 7 days. Gentle activity like walking or prenatal yoga is beneficial.',
            )
          )}
          {hasActivity && (
            <Text style={styles.chartDescription}>
              {activityTotal} min in the last 7 days (goal{' '}
              {EXERCISE_WEEKLY_GOAL_MIN} min per week).
            </Text>
          )}
        </View>

        {/* Trimester Milestones */}
        {milestones.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              🎯 Trimester {pregnancy.trimester} Milestones
            </Text>
            <View style={styles.milestonesList}>
              {milestones.map(m => {
                const done = pregnancy.current_week > m.week;
                return (
                  <View key={m.label} style={styles.milestoneItem}>
                    <View
                      style={[styles.milestoneCheck, done && styles.completed]}
                    >
                      <Text
                        style={[styles.checkmark, done && styles.checkmarkDone]}
                      >
                        {done ? '✓' : '○'}
                      </Text>
                    </View>
                    <Text style={styles.milestoneText}>{m.label}</Text>
                  </View>
                );
              })}
            </View>
            <Text style={styles.chartDescription}>
              Typical timings — your care provider may schedule things
              differently.
            </Text>
          </View>
        )}

        {/* Today's Overview */}
        <View style={[styles.card, styles.nutritionCard]}>
          <Text style={styles.cardTitle}>🥗 Today's Overview</Text>
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionEmoji}>💧</Text>
              <Text style={styles.nutritionLabel}>Water</Text>
              <Text style={styles.nutritionValue}>
                {formatNumber(today.water_glasses)}/{today.water_goal_glasses}{' '}
                glasses
              </Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionEmoji}>😴</Text>
              <Text style={styles.nutritionLabel}>Sleep</Text>
              <Text style={styles.nutritionValue}>
                {today.sleep_hours === null
                  ? 'Not logged'
                  : `${formatNumber(today.sleep_hours)} hours`}
              </Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionEmoji}>🏃‍♀️</Text>
              <Text style={styles.nutritionLabel}>Exercise this week</Text>
              <Text style={styles.nutritionValue}>
                {today.exercise_minutes_week}/{EXERCISE_WEEKLY_GOAL_MIN} min
              </Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionEmoji}>🍎</Text>
              <Text style={styles.nutritionLabel}>Nutrition (7 days)</Text>
              <Text style={styles.nutritionValue}>
                {pct(healthMetrics.nutrition)} of calorie goal
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity style={styles.actionButton} onPress={shareWithDoctor}>
          <Text style={styles.actionButtonText}>Share with Doctor</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    ...STYLE.scrollContent,
  },
  header: {
    marginTop: 8,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#EC4899',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  quickStatValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#EC4899',
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  healthMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
  },
  healthMetricItem: {
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
  },
  healthHighlight: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    paddingVertical: 8,
    width: '100%',
  },
  healthMetricLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    fontWeight: '600',
  },
  healthMetricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  healthMetricValueSmall: {
    fontSize: 14,
  },
  healthMetricUnit: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  adviceBox: {
    backgroundColor: '#FCE7F3',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EC4899',
  },
  adviceText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  progressChartContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  progressChart: {
    borderRadius: 16,
  },
  metricsLegend: {
    marginTop: 8,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  legendDot: {
    backgroundColor: '#EC4899',
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 13,
    color: '#666',
  },
  insightsCard: {
    backgroundColor: '#FFF9F0',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  insightsList: {
    marginTop: 8,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  insightBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EC4899',
    marginTop: 6,
    marginRight: 10,
  },
  insightText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    flex: 1,
  },
  bold: {
    fontWeight: '700',
    color: '#EC4899',
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  chartEmpty: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  chartEmptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  stateWrapper: {
    flex: 1,
    paddingHorizontal: STYLE.spacing.mh,
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingBottom: 60,
    gap: 12,
  },
  stateEmoji: {
    fontSize: 56,
  },
  stateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  stateMessage: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 8,
  },
  chartDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginTop: 8,
    fontStyle: 'italic',
  },
  milestonesList: {
    marginTop: 16,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  milestoneCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  completed: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkmark: {
    color: '#999',
    fontSize: 16,
    fontWeight: '700',
  },
  checkmarkDone: {
    color: '#ffffff',
  },
  milestoneText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  nutritionCard: {
    backgroundColor: '#F0FDF4',
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  nutritionItem: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  nutritionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  nutritionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#EC4899',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomPadding: {
    height: 40,
  },
});

export default PregnancyAnalysisScreen;
