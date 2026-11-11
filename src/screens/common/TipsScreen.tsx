import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import FontelloIcon from '../../services/FontelloIcons';
import { THEME_COLORS } from '../../constants/colors';
import { RootStackParamList } from '../../constants/navigation';
import { STYLE } from '../../constants/app';
import { useHealthTips } from '../../hooks/useHealthTips';

const FALLBACK_ICON = 'heart';
const FALLBACK_COLOR = THEME_COLORS.primary;

const HealthTipsScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { tips, isLoading, error, refetch } = useHealthTips();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderStatus = () => {
    if (isLoading && !refreshing && !tips.length) {
      return (
        <View style={styles.statusBox}>
          <ActivityIndicator size="large" color={THEME_COLORS.primary} />
        </View>
      );
    }
    if (error && !tips.length) {
      return (
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>{error}</Text>
          <TouchableOpacity onPress={refetch}>
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (!tips.length) {
      return (
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>No health tips available yet.</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => navigation.goBack()}
        >
          <FontelloIcon name="left-open-mini" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Health Tips</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={THEME_COLORS.primary}
            colors={[THEME_COLORS.primary]}
          />
        }
      >
        {/* Intro */}
        <View style={styles.introCard}>
          <Text style={styles.introEmoji}>💡</Text>
          <Text style={styles.introTitle}>Your Guide to Better Health</Text>
          <Text style={styles.introText}>
            Simple daily tips to help you manage your cycle and improve overall
            wellness.
          </Text>
        </View>

        {renderStatus()}

        {/* Tips */}
        {tips.map(tip => {
          const color = /^#[0-9a-fA-F]{6}$/.test(tip.color)
            ? tip.color
            : FALLBACK_COLOR;
          const icon = FontelloIcon.hasIcon(tip.icon) ? tip.icon : FALLBACK_ICON;
          return (
            <View key={tip.id} style={styles.tipCard}>
              <View style={styles.tipHeader}>
                <View
                  style={[styles.tipIconBox, { backgroundColor: color + '20' }]}
                >
                  <FontelloIcon name={icon} size={22} color={color} />
                </View>
                <View style={styles.tipHeaderText}>
                  <Text style={styles.tipCategory}>{tip.category}</Text>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                </View>
              </View>
              <Text style={styles.tipDescription}>{tip.description}</Text>
            </View>
          );
        })}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};
export default HealthTipsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...STYLE.header,
  },
  closeBtn: {
    padding: 4,
  },
  headerTitle: {
    ...STYLE.headerTitle,
  },
  placeholder: {
    width: 32,
  },
  statusBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  statusText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  introCard: {
    backgroundColor: '#FFF9F0',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  introEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME_COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  introText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  tipCard: {
    backgroundColor: THEME_COLORS.textLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tipHeaderText: {
    flex: 1,
  },
  tipCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME_COLORS.text,
  },
  tipDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 40,
  },
});
