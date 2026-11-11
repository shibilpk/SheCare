import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MenuView } from '@react-native-menu/menu';
import FontelloIcon from '../../services/FontelloIcons';
import { THEME_COLORS } from '../../constants/colors';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import InfiniteScrollList from '../../components/common/InfiniteScrollList';
import apiClient, { APIError } from '../../services/ApiClient';
import { APIS } from '../../constants/apis';
import { STYLE } from '../../constants/app';
import { RootStackParamList, SCREENS } from '../../constants/navigation';
import { parseLocalDate } from '../../utils/date';
import { useToastMessage } from '../../utils/toastMessage';

interface PeriodData {
  id: string;
  // Backend returns datetimes (e.g. "2026-10-01T00:00:00Z"); only the date part matters.
  start_date: string;
  end_date: string;
  cycle_length: number | null;
  is_active?: boolean;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PeriodData[];
}

/** Local Date from a backend 'YYYY-MM-DD' or 'YYYY-MM-DDTHH:mm:ss...' string. */
const toLocalDate = (value: string) => parseLocalDate(value.slice(0, 10));

export default function PeriodHistoryScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { showToast } = useToastMessage();
  // Bumping this key remounts InfiniteScrollList, which refetches from page 1.
  const [listKey, setListKey] = useState(0);
  const hasFocusedOnce = useRef(false);

  const reloadList = useCallback(() => setListKey(k => k + 1), []);

  // Refresh when coming back (e.g. after editing a period in PeriodSelector).
  useFocusEffect(
    useCallback(() => {
      if (hasFocusedOnce.current) {
        reloadList();
      } else {
        hasFocusedOnce.current = true;
      }
    }, [reloadList]),
  );

  const fetchPeriods = useCallback(
    async (page: number): Promise<PaginatedResponse> => {
      try {
        const response = await apiClient.get<PaginatedResponse>(
          APIS.v1.period.list(),
          { params: { page, page_size: 10 } },
        );
        return response;
      } catch (error) {
        console.info('Error fetching periods:', error);
        throw error;
      }
    },
    [],
  );

  const formatDate = (dateString: string) => {
    return toLocalDate(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Inclusive day count (same as PeriodSelector).
  const calculateDuration = (startDate: string, endDate: string) => {
    const start = toLocalDate(startDate);
    const end = toLocalDate(endDate);
    const diffDays = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    return Math.max(diffDays + 1, 1);
  };

  const handleEdit = (item: PeriodData) => {
    navigation.navigate(SCREENS.PERIOD_SELECTOR, {
      startDate: toLocalDate(item.start_date),
      endDate: toLocalDate(item.end_date),
      rangeDays: null,
      periodId: item.id,
      mode: 'edit',
    });
  };

  const deletePeriod = async (item: PeriodData) => {
    try {
      const response = await apiClient.delete<{
        detail?: { title?: string; message?: string };
      }>(APIS.v1.period.detail(item.id));
      showToast(response?.detail?.message || 'Period deleted successfully', {
        type: 'success',
      });
      reloadList();
    } catch (error) {
      const apiError = error as APIError;
      showToast(
        apiError?.normalizedError?.message || 'Failed to delete period',
        { type: 'danger' },
      );
    }
  };

  const handleDelete = (item: PeriodData) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete this period record?\n${formatDate(item.start_date)} - ${formatDate(item.end_date)}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deletePeriod(item);
          },
        },
      ],
    );
  };

  const renderPeriodItem = ({ item }: { item: PeriodData }) => {
    const duration = calculateDuration(item.start_date, item.end_date);
    const startDate = formatDate(item.start_date);
    const endDate = formatDate(item.end_date);

    return (
      <View style={styles.periodCard}>
        <View style={styles.cardHeader}>
          <View style={styles.dateContainer}>
            <FontelloIcon
              name="calendar"
              size={20}
              color={THEME_COLORS.primary}
            />
            <Text style={styles.dateText}>
              {startDate} - {endDate}
            </Text>
          </View>
          <View style={styles.headerRight}>
            {item.is_active && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeText}>Active</Text>
              </View>
            )}
            <MenuView
              onPressAction={({ nativeEvent }) => {
                if (nativeEvent.event === 'edit') {
                  handleEdit(item);
                } else if (nativeEvent.event === 'delete') {
                  handleDelete(item);
                }
              }}
              actions={[
                {
                  id: 'edit',
                  title: 'Edit Period',
                  image: 'pencil',
                  imageColor: THEME_COLORS.primary,
                },
                {
                  id: 'delete',
                  title: 'Delete Period',
                  image: 'trash',
                  attributes: {
                    destructive: true,
                  },
                },
              ]}
            >
              <View style={styles.menuButton}>
                <FontelloIcon name="dot-3" size={20} color="#666" />
              </View>
            </MenuView>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={styles.infoValue}>
                {duration} {duration === 1 ? 'day' : 'days'}
              </Text>
            </View>

            {item.cycle_length !== null && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Cycle Length</Text>
                <Text style={styles.infoValue}>
                  {item.cycle_length} {item.cycle_length === 1 ? 'day' : 'days'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <Text style={styles.sectionTitle}>Period History</Text>
      <Text style={styles.headerSubtitle}>
        Track and manage your menstrual cycle history
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <FontelloIcon name="calendar" size={60} color="#ccc" />
      <Text style={styles.emptyText}>No period records found</Text>
      <Text style={styles.emptySubtext}>
        Start tracking your menstrual cycle
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <FontelloIcon name="left-open-mini" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Periods List</Text>
        <TouchableOpacity style={styles.addButton}>
          <FontelloIcon name="plus" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      <InfiniteScrollList<PeriodData>
        key={listKey}
        fetchData={fetchPeriods}
        renderItem={renderPeriodItem}
        keyExtractor={(item, index) => item.id ?? `${item.start_date}-${index}`}
        ListHeaderComponent={renderHeader()}
        ListEmptyComponent={renderEmpty()}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...STYLE.header,
  },

  backButton: {
    padding: 4,
  },
  headerTitle: {
    ...STYLE.headerTitle,
  },
  addButton: {
    padding: 4,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  headerSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  periodCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuButton: {
    padding: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  activeBadge: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    marginBottom: 0,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
});
