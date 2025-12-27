import React, {
  useState,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ViewToken,
  TouchableOpacity,
} from 'react-native';

const CELL_WIDTH = 64;
const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type Props = {
  onMonthChange?: (month: number, year: number) => void;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
};

const DaysScroller = forwardRef(function DaysScroller(
  { onMonthChange, selectedDate, onSelectDate }: Props,
  ref,
) {
  const today = new Date();

  // initial dates: 1 month before & after today
  const [days, setDays] = useState(() => {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 2, 0);
    const arr: Date[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      arr.push(new Date(d));
    }
    return arr;
  });

  const listRef = useRef<FlatList<Date>>(null);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: CELL_WIDTH,
      offset: CELL_WIDTH * index,
      index,
    }),
    [],
  );

  // Infinite scroll logic
  const prependMonth = useCallback(() => {
    const first = days[0];
    const start = new Date(first.getFullYear(), first.getMonth() - 1, 1);
    const end = new Date(first.getFullYear(), first.getMonth(), 0);
    const newDays: Date[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      newDays.push(new Date(d));
    }
    listRef.current?.scrollToOffset({
      offset: CELL_WIDTH * newDays.length,
      animated: false,
    });
    setDays(prev => [...newDays, ...prev]);
  }, [days]);

  const appendMonth = useCallback(() => {
    const last = days[days.length - 1];
    const start = new Date(last.getFullYear(), last.getMonth() + 1, 1);
    const end = new Date(last.getFullYear(), last.getMonth() + 2, 0);
    const newDays: Date[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      newDays.push(new Date(d));
    }
    setDays(prev => [...prev, ...newDays]);
  }, [days]);

  // Track which date is currently visible to update header
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const firstVisible = viewableItems[0].item as Date;
        if (onMonthChange) {
          onMonthChange(firstVisible.getMonth(), firstVisible.getFullYear());
        }
      }
    },
    [onMonthChange],
  );

  const viewConfigRef = { viewAreaCoveragePercentThreshold: 50 };

  const goToToday = () => {
    const idx = days.findIndex(d => d.toDateString() === today.toDateString());
    if (idx !== -1) {
      onSelectDate(today);
      listRef.current?.scrollToIndex({ index: idx, animated: true });
    }
  };

  useImperativeHandle(ref, () => ({ goToToday }));

  const renderItem = ({ item }: { item: Date }) => {
    const isSelected = selectedDate
      ? item.toDateString() === selectedDate.toDateString()
      : false;
    return (
      <TouchableOpacity
        style={styles.dayCell}
        onPress={() => onSelectDate(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.dayLabel}>{dayLabels[item.getDay()]}</Text>
        <View style={[styles.dateCircle, isSelected && styles.selectedCircle]}>
          <Text style={[styles.dateText, isSelected && styles.selectedText]}>
            {item.getDate()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View>
      {/* Go to Today Button (optional, can be removed from here if parent wants to control) */}
      <FlatList
        ref={listRef}
        horizontal
        data={days}
        keyExtractor={d => d.toISOString()}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        showsHorizontalScrollIndicator={false}
        onEndReached={appendMonth}
        onEndReachedThreshold={0.3}
        onScrollBeginDrag={({ nativeEvent }) => {
          if (nativeEvent.contentOffset.x <= CELL_WIDTH * 2) {
            prependMonth();
          }
        }}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfigRef}
        initialScrollIndex={days.findIndex(
          d => d.toDateString() === today.toDateString(),
        )}
        initialNumToRender={30}
        windowSize={15}
        onMomentumScrollEnd={e => {
          const offset = e.nativeEvent.contentOffset.x;
          const firstIdx = Math.round(offset / CELL_WIDTH);
          if (days[firstIdx]) onSelectDate(days[firstIdx]);
        }}
      />
    </View>
  );
});

export default DaysScroller;

const styles = StyleSheet.create({
  dayCell: {
    width: 56,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  dayLabel: { fontSize: 12, color: '#888' },
  dateCircle: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },
  selectedCircle: { backgroundColor: '#1e90ff' },
  dateText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  selectedText: { color: '#fff' },
  todayButton: {
    backgroundColor: '#1e90ff',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  todayButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
