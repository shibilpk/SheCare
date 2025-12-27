import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { LineChart, BarChart, ProgressChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME_COLORS } from '../../constants/colors';

// Dummy data
const bmiAnalysis = {
  age: 28,
  weight: 68,
  height: 1.65,
  bmi: 24.9,
  category: 'Normal',
  advice: 'Great job! Your BMI is within the normal range. Maintain your healthy lifestyle with regular exercise and a balanced diet.'
};

const healthMetrics = {
  hydration: 0.75,
  sleep: 0.65,
  exercise: 0.80,
};

const AnalysisScreen = () => {
  const screenWidth = Dimensions.get('window').width;

  // Chart configurations
  const baseChartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(60, 60, 60, ${opacity})`,
    propsForBackgroundLines: {
      stroke: '#f0f0f0',
      strokeDasharray: '5',
      strokeWidth: 1,
    },
  };

  const cycleTrendData = {
    labels: ['D1', 'D5', 'D10', 'D15', 'D20', 'D25'],
    datasets: [{
      data: [2, 4, 3, 5, 4, 6],
      color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
      strokeWidth: 3,
    }],
  };

  const moodData = {
    labels: ['D1', 'D5', 'D10', 'D15', 'D20', 'D25'],
    datasets: [{
      data: [3, 2, 4, 5, 3, 4],
      color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
      strokeWidth: 3,
    }],
  };

  const symptomData = {
    labels: ['D1', 'D5', 'D10', 'D15', 'D20', 'D25'],
    datasets: [{
      data: [1, 3, 2, 4, 3, 2],
      color: (opacity = 1) => `rgba(65, 184, 131, ${opacity})`,
      strokeWidth: 3,
    }],
  };

  const weeklyActivityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{ data: [5, 6, 4, 7, 3, 5, 6] }],
  };

  const progressData = {
    labels: ['Hydration', 'Sleep', 'Exercise'],
    data: [healthMetrics.hydration, healthMetrics.sleep, healthMetrics.exercise],
  };

  const progressChartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Health Analysis</Text>
          <Text style={styles.subtitle}>Track your wellness journey</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStatsContainer}>
          <View style={styles.quickStatCard}>
            <Text style={styles.quickStatValue}>20</Text>
            <Text style={styles.quickStatLabel}>Cycle Day</Text>
          </View>
          <View style={styles.quickStatCard}>
            <Text style={styles.quickStatValue}>12</Text>
            <Text style={styles.quickStatLabel}>Days Left</Text>
          </View>
          <View style={styles.quickStatCard}>
            <Text style={styles.quickStatValue}>85%</Text>
            <Text style={styles.quickStatLabel}>Health Score</Text>
          </View>
        </View>

        {/* BMI Analysis Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>💪 BMI Analysis</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>{bmiAnalysis.category}</Text>
            </View>
          </View>

          <View style={styles.bmiMetricsGrid}>
            <View style={styles.bmiMetricItem}>
              <Text style={styles.bmiMetricLabel}>Age</Text>
              <Text style={styles.bmiMetricValue}>{bmiAnalysis.age}</Text>
              <Text style={styles.bmiMetricUnit}>years</Text>
            </View>
            <View style={styles.bmiMetricItem}>
              <Text style={styles.bmiMetricLabel}>Weight</Text>
              <Text style={styles.bmiMetricValue}>{bmiAnalysis.weight}</Text>
              <Text style={styles.bmiMetricUnit}>kg</Text>
            </View>
            <View style={styles.bmiMetricItem}>
              <Text style={styles.bmiMetricLabel}>Height</Text>
              <Text style={styles.bmiMetricValue}>{bmiAnalysis.height}</Text>
              <Text style={styles.bmiMetricUnit}>m</Text>
            </View>
            <View style={[styles.bmiMetricItem, styles.bmiHighlight]}>
              <Text style={styles.bmiMetricLabel}>BMI</Text>
              <Text style={styles.bmiMetricValueLarge}>{bmiAnalysis.bmi}</Text>
            </View>
          </View>

          <View style={styles.adviceBox}>
            <Text style={styles.adviceText}>{bmiAnalysis.advice}</Text>
          </View>
        </View>

        {/* Health Metrics Progress */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Daily Health Metrics</Text>
          <View style={styles.progressChartContainer}>
            <ProgressChart
              data={progressData}
              width={screenWidth - 68}
              height={200}
              strokeWidth={12}
              radius={28}
              chartConfig={progressChartConfig}
              hideLegend={false}
              style={styles.progressChart}
            />
          </View>
          <View style={styles.metricsLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#8641F4' }]} />
              <Text style={styles.legendText}>Hydration: {(healthMetrics.hydration * 100).toFixed(0)}%</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#8641F4' }]} />
              <Text style={styles.legendText}>Sleep: {(healthMetrics.sleep * 100).toFixed(0)}%</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#8641F4' }]} />
              <Text style={styles.legendText}>Exercise: {(healthMetrics.exercise * 100).toFixed(0)}%</Text>
            </View>
          </View>
        </View>

        {/* Insights & Tips */}
        <View style={[styles.card, styles.insightsCard]}>
          <Text style={styles.cardTitle}>💡 Insights & Tips</Text>
          <View style={styles.insightsList}>
            <View style={styles.insightItem}>
              <View style={styles.insightBullet} />
              <Text style={styles.insightText}>
                You are on <Text style={styles.bold}>day 20</Text> of your cycle
              </Text>
            </View>
            <View style={styles.insightItem}>
              <View style={styles.insightBullet} />
              <Text style={styles.insightText}>
                <Text style={styles.bold}>Medium chance</Text> of pregnancy
              </Text>
            </View>
            <View style={styles.insightItem}>
              <View style={styles.insightBullet} />
              <Text style={styles.insightText}>
                Next period in <Text style={styles.bold}>12 days</Text>
              </Text>
            </View>
            <View style={styles.insightItem}>
              <View style={styles.insightBullet} />
              <Text style={styles.insightText}>
                Log symptoms daily for accurate tracking
              </Text>
            </View>
            <View style={styles.insightItem}>
              <View style={styles.insightBullet} />
              <Text style={styles.insightText}>
                Stay hydrated and maintain good sleep
              </Text>
            </View>
          </View>
        </View>

        {/* Cycle Trend Chart */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>📈 Cycle Trend</Text>
            <Text style={styles.cardSubtitle}>Last 25 days</Text>
          </View>
          <LineChart
            data={cycleTrendData}
            width={screenWidth - 68}
            height={220}
            chartConfig={{
              ...baseChartConfig,
              fillShadowGradientOpacity: 0.3,
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#8641F4',
                fill: '#ffffff',
              },
            }}
            bezier
            style={styles.chart}
          />
          <Text style={styles.chartDescription}>
            Track your cycle patterns. Peaks indicate ovulation periods.
          </Text>
        </View>

        {/* Mood Variation Chart */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>😊 Mood Variation</Text>
            <Text style={styles.cardSubtitle}>Emotional wellness</Text>
          </View>
          <LineChart
            data={moodData}
            width={screenWidth - 68}
            height={220}
            chartConfig={{
              ...baseChartConfig,
              color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
              fillShadowGradientOpacity: 0.3,
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#FF6384',
                fill: '#ffffff',
              },
            }}
            bezier
            style={styles.chart}
          />
          <Text style={styles.chartDescription}>
            Monitor mood changes throughout your cycle for better self-care.
          </Text>
        </View>

        {/* Symptom Tracking */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🩺 Symptom Tracking</Text>
            <Text style={styles.cardSubtitle}>Monitor your body</Text>
          </View>
          <LineChart
            data={symptomData}
            width={screenWidth - 68}
            height={220}
            chartConfig={{
              ...baseChartConfig,
              color: (opacity = 1) => `rgba(65, 184, 131, ${opacity})`,
              fillShadowGradientOpacity: 0.3,
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#41B883',
                fill: '#ffffff',
              },
            }}
            bezier
            style={styles.chart}
          />
          <Text style={styles.chartDescription}>
            Track symptoms to identify patterns and improve wellness.
          </Text>
        </View>

        {/* Weekly Activity */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🏃‍♀️ Weekly Activity</Text>
            <Text style={styles.cardSubtitle}>Stay active</Text>
          </View>
          <BarChart
            data={weeklyActivityData}
            width={screenWidth - 68}
            height={220}
            chartConfig={{
              ...baseChartConfig,
              fillShadowGradient: '#8641F4',
              fillShadowGradientOpacity: 1,
              barPercentage: 0.7,
            }}
            style={styles.chart}
            showValuesOnTopOfBars
            fromZero
          />
          <Text style={styles.chartDescription}>
            Your activity score for each day. Keep up the consistency!
          </Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Export Health Report</Text>
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
    color: '#8641F4',
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
    shadowColor: '#8641F4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  quickStatValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#8641F4',
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
    shadowColor: '#8641F4',
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
    backgroundColor: '#4BB543',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  bmiMetricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
  },
  bmiMetricItem: {
    alignItems: 'center',
    flex: 1,
  },
  bmiHighlight: {
    backgroundColor: '#f0e6ff',
    borderRadius: 12,
    paddingVertical: 8,
  },
  bmiMetricLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    fontWeight: '600',
  },
  bmiMetricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  bmiMetricValueLarge: {
    fontSize: 24,
    fontWeight: '800',
    color: '#8641F4',
  },
  bmiMetricUnit: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  adviceBox: {
    backgroundColor: '#f0e6ff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#8641F4',
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
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
  insightsCard: {
    backgroundColor: '#fff9f0',
    borderLeftWidth: 4,
    borderLeftColor: '#FFA500',
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
    backgroundColor: '#8641F4',
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
    color: '#8641F4',
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
  actionButton: {
    backgroundColor: '#8641F4',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#8641F4',
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

export default AnalysisScreen;