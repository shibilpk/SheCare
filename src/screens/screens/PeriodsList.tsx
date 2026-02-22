import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MenuView } from '@react-native-menu/menu';
import FontelloIcon from '../../services/FontelloIcons';
import { THEME_COLORS } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import InfiniteScrollList from '../../components/common/InfiniteScrollList';
import apiClient from '../../services/ApiClient';
import { APIS } from '../../constants/apis';
import { STYLE } from '../../constants/app';

interface PeriodData {
  start_date: string;
  end_date: string;
  cycle_length: number | null;
  is_active: boolean;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PeriodData[];
}

export default function PeriodsListScreen() {
  const navigation = useNavigation();

  const fetchPeriods = async (page: number): Promise<PaginatedResponse> => {
    try {
      const response = await apiClient.get<PaginatedResponse>(
        `${APIS.V1.PERIOD.LIST}?page=${page}&page_size=10`,
      );
      return response;
    } catch (error) {
      console.info('Error fetching periods:', error);
      throw error;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleEdit = (item: PeriodData) => {
    // TODO: Navigate to edit screen or show edit modal

    Alert.alert(
      'Edit Period',
      `Edit period from ${formatDate(item.start_date)} to ${formatDate(item.end_date)}`,
    );
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
            // TODO: Call API to delete period

          },
        },
      ],
    );
  };

  const renderPeriodItem = ({
    item,
    index,
  }: {
    item: PeriodData;
    index: number;
  }) => {
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
      <Text style={styles.headerTitle}>Period History</Text>
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
        fetchData={fetchPeriods}
        renderItem={renderPeriodItem}
        keyExtractor={(item, index) => `${item.start_date}-${index}`}
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
  headerTitle: {
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
