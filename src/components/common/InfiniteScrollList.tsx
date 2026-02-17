import React, { useState, useCallback } from 'react';
import {
  FlatList,
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  RefreshControl,
  FlatListProps,
} from 'react-native';
import { THEME_COLORS } from '../../constants/colors';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface InfiniteScrollListProps<T> {
  fetchData: (page: number) => Promise<PaginatedResponse<T>>;
  renderItem: ({
    item,
    index,
  }: {
    item: T;
    index: number;
  }) => React.ReactElement | null;
  keyExtractor: (item: T, index: number) => string;
  ListEmptyComponent?: React.ReactElement;
  ListHeaderComponent?: React.ReactElement;
  ItemSeparatorComponent?: React.ReactElement;
  contentContainerStyle?: FlatListProps<T>['contentContainerStyle'];
  initialNumToRender?: number;
  onDataLoaded?: (data: T[]) => void;
}

export default function InfiniteScrollList<T>({
  fetchData,
  renderItem,
  keyExtractor,
  ListEmptyComponent,
  ListHeaderComponent,
  ItemSeparatorComponent,
  contentContainerStyle,
  initialNumToRender = 10,
  onDataLoaded,
}: InfiniteScrollListProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const loadData = useCallback(
    async (pageNum: number, isRefresh = false) => {
      if (loading || (!hasMore && !isRefresh)) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetchData(pageNum);

        if (isRefresh) {
          setData(response.results);
          setPage(1);
          setHasMore(response.next !== null);
        } else {
          setData(prev => [...prev, ...response.results]);
          setHasMore(response.next !== null);
        }

        if (onDataLoaded) {
          onDataLoaded(response.results);
        }

        setInitialLoad(false);
      } catch (err: any) {
        console.info('Error loading data:', err);
        setError(err?.message || 'Failed to load data');
        setInitialLoad(false);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [loading, hasMore, fetchData, onDataLoaded],
  );

  // Load initial data
  React.useEffect(() => {
    loadData(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore && !initialLoad) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadData(nextPage);
    }
  }, [loading, hasMore, page, loadData, initialLoad]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    loadData(1, true);
  }, [loadData]);

  const renderFooter = () => {
    if (!loading || refreshing) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={THEME_COLORS.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (initialLoad && loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={THEME_COLORS.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.retryText} onPress={() => handleRefresh()}>
            Tap to retry
          </Text>
        </View>
      );
    }

    if (ListEmptyComponent) {
      return ListEmptyComponent;
    }

    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  };

  return (
    <>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        ListHeaderComponent={ListHeaderComponent}
        ItemSeparatorComponent={ItemSeparatorComponent}
        contentContainerStyle={contentContainerStyle}
        initialNumToRender={initialNumToRender}
        maxToRenderPerBatch={10}
        windowSize={10}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={THEME_COLORS.primary}
            colors={[THEME_COLORS.primary]}
          />
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryText: {
    fontSize: 14,
    color: '#1976d2',
    textDecorationLine: 'underline',
  },
});
