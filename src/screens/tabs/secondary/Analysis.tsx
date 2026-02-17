import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { LineChart, BarChart, ProgressChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME_COLORS } from '../../../constants/colors';

// Dummy pregnancy data
const pregnancyData = {
  currentWeek: 24,
  trimester: 2,
  dueDate: 'March 15, 2026',
  daysRemaining: 112,
  totalWeeks: 40,
};

const maternalHealth = {
  weight: 68,
  prePregnancyWeight: 60,
  weightGain: 8,
  targetWeightGain: '11-16 kg',
  bloodPressure: '118/76',
  status: 'Healthy',
};

const healthMetrics = {
  nutrition: 0.85,
  hydration: 0.75,
  sleep: 0.65,
  exercise: 0.70,
  mentalWellness: 0.80,
};

const PregnancyAnalysisScreen = () => {
  const screenWidth = Dimensions.get('window').width;
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

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

  // Weight progression data
  const weightProgressData = {
    labels: ['W8', 'W12', 'W16', 'W20', 'W24'],
    datasets: [{
      data: [61, 63, 65, 66.5, 68],
      color: (opacity = 1) => `rgba(236, 72, 153, ${opacity})`,
      strokeWidth: 3,
    }],
  };

  // Baby growth data (estimated weight in grams)
  const babyGrowthData = {
    labels: ['W12', 'W16', 'W20', 'W24', 'W28'],
    datasets: [{
      data: [14, 100, 300, 600, 1000],
      color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
      strokeWidth: 3,
    }],
  };

  // Weekly symptom tracking
  const symptomData = {
    labels: ['W19', 'W20', 'W21', 'W22', 'W23', 'W24'],
    datasets: [{
      data: [3, 2, 4, 3, 2, 3],
      color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
      strokeWidth: 3,
    }],
  };

  // Daily activity levels
  const activityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{ data: [4, 5, 3, 6, 4, 5, 4] }],
  };

  // Health metrics progress
  const progressData = {
    labels: ['Nutrition', 'Hydration', 'Sleep', 'Exercise', 'Wellness'],
    data: [
      healthMetrics.nutrition,
      healthMetrics.hydration,
      healthMetrics.sleep,
      healthMetrics.exercise,
      healthMetrics.mentalWellness,
    ],
  };

  const progressChartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(236, 72, 153, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
  };

  // Kick count data (last 7 days)
  const kickCountData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{ data: [8, 10, 12, 9, 11, 13, 12] }],
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#EC4899']}
            tintColor={'#EC4899'}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Pregnancy Analytics</Text>
          <Text style={styles.subtitle}>Week {pregnancyData.currentWeek} • Trimester {pregnancyData.trimester}</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStatsContainer}>
          <View style={styles.quickStatCard}>
            <Text style={styles.quickStatValue}>{pregnancyData.currentWeek}</Text>
            <Text style={styles.quickStatLabel}>Weeks</Text>
          </View>
          <View style={styles.quickStatCard}>
            <Text style={styles.quickStatValue}>{pregnancyData.daysRemaining}</Text>
            <Text style={styles.quickStatLabel}>Days Left</Text>
          </View>
          <View style={styles.quickStatCard}>
            <Text style={styles.quickStatValue}>{Math.round((pregnancyData.currentWeek / pregnancyData.totalWeeks) * 100)}%</Text>
            <Text style={styles.quickStatLabel}>Complete</Text>
          </View>
        </View>

        {/* Maternal Health Summary */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>👩‍⚕️ Maternal Health</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>{maternalHealth.status}</Text>
            </View>
          </View>

          <View style={styles.healthMetricsGrid}>
            <View style={styles.healthMetricItem}>
              <Text style={styles.healthMetricLabel}>Current Weight</Text>
              <Text style={styles.healthMetricValue}>{maternalHealth.weight}</Text>
              <Text style={styles.healthMetricUnit}>kg</Text>
            </View>
            <View style={styles.healthMetricItem}>
              <Text style={styles.healthMetricLabel}>Weight Gain</Text>
              <Text style={styles.healthMetricValue}>+{maternalHealth.weightGain}</Text>
              <Text style={styles.healthMetricUnit}>kg</Text>
            </View>
            <View style={styles.healthMetricItem}>
              <Text style={styles.healthMetricLabel}>Blood Pressure</Text>
              <Text style={[styles.healthMetricValue, { fontSize: 16 }]}>{maternalHealth.bloodPressure}</Text>
              <Text style={styles.healthMetricUnit}>mmHg</Text>
            </View>
            <View style={[styles.healthMetricItem, styles.healthHighlight]}>
              <Text style={styles.healthMetricLabel}>Target Gain</Text>
              <Text style={[styles.healthMetricValue, { fontSize: 14 }]}>{maternalHealth.targetWeightGain}</Text>
            </View>
          </View>

          <View style={styles.adviceBox}>
            <Text style={styles.adviceText}>
              Your weight gain is on track! Continue with balanced nutrition and regular prenatal check-ups.
            </Text>
          </View>
        </View>

        {/* Health Metrics Progress */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Daily Health Metrics</Text>
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
                <View style={[styles.legendDot, { backgroundColor: '#EC4899' }]} />
                <Text style={styles.legendText}>Nutrition: {(healthMetrics.nutrition * 100).toFixed(0)}%</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#EC4899' }]} />
                <Text style={styles.legendText}>Hydration: {(healthMetrics.hydration * 100).toFixed(0)}%</Text>
              </View>
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#EC4899' }]} />
                <Text style={styles.legendText}>Sleep: {(healthMetrics.sleep * 100).toFixed(0)}%</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#EC4899' }]} />
                <Text style={styles.legendText}>Exercise: {(healthMetrics.exercise * 100).toFixed(0)}%</Text>
              </View>
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#EC4899' }]} />
                <Text style={styles.legendText}>Wellness: {(healthMetrics.mentalWellness * 100).toFixed(0)}%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Pregnancy Insights */}
        <View style={[styles.card, styles.insightsCard]}>
          <Text style={styles.cardTitle}>💡 Pregnancy Insights</Text>
          <View style={styles.insightsList}>
            <View style={styles.insightItem}>
              <View style={styles.insightBullet} />
              <Text style={styles.insightText}>
                You're in <Text style={styles.bold}>week {pregnancyData.currentWeek}</Text> of your pregnancy
              </Text>
            </View>
            <View style={styles.insightItem}>
              <View style={styles.insightBullet} />
              <Text style={styles.insightText}>
                Baby is the size of a <Text style={styles.bold}>papaya</Text> 🥭
              </Text>
            </View>
            <View style={styles.insightItem}>
              <View style={styles.insightBullet} />
              <Text style={styles.insightText}>
                <Text style={styles.bold}>{pregnancyData.daysRemaining} days</Text> until your due date
              </Text>
            </View>
            <View style={styles.insightItem}>
              <View style={styles.insightBullet} />
              <Text style={styles.insightText}>
                Baby can hear sounds and respond to light
              </Text>
            </View>
            <View style={styles.insightItem}>
              <View style={styles.insightBullet} />
              <Text style={styles.insightText}>
                Keep tracking kick counts daily
              </Text>
            </View>
            <View style={styles.insightItem}>
              <View style={styles.insightBullet} />
              <Text style={styles.insightText}>
                Next ultrasound scheduled for week 28
              </Text>
            </View>
          </View>
        </View>

        {/* Weight Progression Chart */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>📈 Weight Progression</Text>
            <Text style={styles.cardSubtitle}>Last 16 weeks</Text>
          </View>
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
          <Text style={styles.chartDescription}>
            Your weight gain is progressing well. Maintain healthy eating habits and stay active.
          </Text>
        </View>

        {/* Baby Growth Chart */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>👶 Baby Growth Tracker</Text>
            <Text style={styles.cardSubtitle}>Estimated weight (grams)</Text>
          </View>
          <LineChart
            data={babyGrowthData}
            width={screenWidth - 68}
            height={220}
            chartConfig={{
              ...baseChartConfig,
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
          <Text style={styles.chartDescription}>
            Your baby is growing beautifully! Currently around 600g and developing rapidly.
          </Text>
        </View>

        {/* Kick Count Tracking */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>👣 Baby Kick Count</Text>
            <Text style={styles.cardSubtitle}>Last 7 days</Text>
          </View>
          <BarChart
            data={kickCountData}
            width={screenWidth - 68}
            height={220}
            chartConfig={{
              ...baseChartConfig,
              color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
              fillShadowGradient: '#3B82F6',
              fillShadowGradientOpacity: 1,
              barPercentage: 0.7,
            }}
            style={styles.chart}
            showValuesOnTopOfBars
            fromZero
          />
          <Text style={styles.chartDescription}>
            Great! Baby is active and healthy. Aim for 10+ movements per day.
          </Text>
        </View>

        {/* Symptom Tracking */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🩺 Symptom Intensity</Text>
            <Text style={styles.cardSubtitle}>Weekly average</Text>
          </View>
          <LineChart
            data={symptomData}
            width={screenWidth - 68}
            height={220}
            chartConfig={{
              ...baseChartConfig,
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
          <Text style={styles.chartDescription}>
            Monitor symptoms like fatigue, nausea, and discomfort. Discuss concerns with your doctor.
          </Text>
        </View>

        {/* Activity Levels */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🏃‍♀️ Activity Levels</Text>
            <Text style={styles.cardSubtitle}>This week</Text>
          </View>
          <BarChart
            data={activityData}
            width={screenWidth - 68}
            height={220}
            chartConfig={{
              ...baseChartConfig,
              color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
              fillShadowGradient: '#10B981',
              fillShadowGradientOpacity: 1,
              barPercentage: 0.7,
            }}
            style={styles.chart}
            showValuesOnTopOfBars
            fromZero
          />
          <Text style={styles.chartDescription}>
            Regular gentle exercise is beneficial. Continue with prenatal yoga and walking.
          </Text>
        </View>

        {/* Trimester Milestones */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎯 Trimester 2 Milestones</Text>
          <View style={styles.milestonesList}>
            <View style={styles.milestoneItem}>
              <View style={[styles.milestoneCheck, styles.completed]}>
                <Text style={styles.checkmark}>✓</Text>
              </View>
              <Text style={styles.milestoneText}>First kick felt (Week 20)</Text>
            </View>
            <View style={styles.milestoneItem}>
              <View style={[styles.milestoneCheck, styles.completed]}>
                <Text style={styles.checkmark}>✓</Text>
              </View>
              <Text style={styles.milestoneText}>Anatomy scan completed (Week 20)</Text>
            </View>
            <View style={styles.milestoneItem}>
              <View style={[styles.milestoneCheck, styles.completed]}>
                <Text style={styles.checkmark}>✓</Text>
              </View>
              <Text style={styles.milestoneText}>Gender revealed (Week 20)</Text>
            </View>
            <View style={styles.milestoneItem}>
              <View style={styles.milestoneCheck}>
                <Text style={styles.checkmark}>○</Text>
              </View>
              <Text style={styles.milestoneText}>Glucose screening test (Week 24-28)</Text>
            </View>
            <View style={styles.milestoneItem}>
              <View style={styles.milestoneCheck}>
                <Text style={styles.checkmark}>○</Text>
              </View>
              <Text style={styles.milestoneText}>Hospital tour (Week 28)</Text>
            </View>
          </View>
        </View>

        {/* Nutrition Tracking */}
        <View style={[styles.card, styles.nutritionCard]}>
          <Text style={styles.cardTitle}>🥗 Nutrition Overview</Text>
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionEmoji}>💧</Text>
              <Text style={styles.nutritionLabel}>Water</Text>
              <Text style={styles.nutritionValue}>6/8 glasses</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionEmoji}>🥛</Text>
              <Text style={styles.nutritionLabel}>Calcium</Text>
              <Text style={styles.nutritionValue}>850mg/1000mg</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionEmoji}>🥬</Text>
              <Text style={styles.nutritionLabel}>Iron</Text>
              <Text style={styles.nutritionValue}>22mg/27mg</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionEmoji}>🍊</Text>
              <Text style={styles.nutritionLabel}>Folic Acid</Text>
              <Text style={styles.nutritionValue}>550mcg/600mcg</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Download Pregnancy Report</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
          <Text style={styles.secondaryButtonText}>Share with Doctor</Text>
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
    paddingHorizontal: 20,
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
  statusBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
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
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#EC4899',
  },
  secondaryButtonText: {
    color: '#EC4899',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomPadding: {
    height: 40,
  },
});

export default PregnancyAnalysisScreen;