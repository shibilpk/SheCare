import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect,
  useRef,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { THEME_COLORS } from '../../constants/colors';
import FontelloIcon from '../../services/FontelloIcons';

export type CalendarHandle = {
  goToToday: () => void;
  clearSelection: () => void;
};

type MarkedDate = {
  date: Date;
  icon?: any;
  backgroundColor?: string;
  textColor?: string;
};
type CalendarStyle = { dayText?: object; cell?: object; monthWrapper?: object };

type SelectionMode = 'single' | 'range';
export type DateRange = { startDate: Date | null; endDate: Date | null };

import { monthNames } from '../../constants/common';

type Props = {
  initialDate?: Date;
  selectedDate?: Date;
  selectedRange?: DateRange;
  selectionMode?: SelectionMode;
  onDayPress?: (date: Date | DateRange) => void;
  markedDates?: MarkedDate[];
  calendarStyle?: CalendarStyle;
  scrollable?: boolean;
  hideWeekDays?: boolean;
  onMonthChange?: (date: Date) => void;
  showMonthNavigation?: boolean;
};

const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const CalendarWidgetBase = forwardRef<CalendarHandle, Props>(
  (props, ref) => {
    const {
      initialDate = new Date(),
      selectedDate: selectedDateProp,
      selectedRange: selectedRangeProp,
      selectionMode = 'single',
      onDayPress,
      markedDates = [],
      calendarStyle = {},
      scrollable = false,
      hideWeekDays = false,
      onMonthChange,
      showMonthNavigation = false,
    } = props;

    const [currentMonth, setCurrentMonth] = useState(
      new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
    );
    const [selectedDate, setSelectedDate] = useState<Date | null>(
      selectedDateProp ?? null,
    );
    const [selectedRange, setSelectedRange] = useState<DateRange>({
      startDate: selectedRangeProp?.startDate ?? null,
      endDate: selectedRangeProp?.endDate ?? null,
    });
    const [containerWidth, setContainerWidth] = useState(0);
    useEffect(() => {
      setCurrentMonth(
        new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
      );
    }, [initialDate]);

    useEffect(() => {
      if (selectedDateProp) {
        setSelectedDate(selectedDateProp);
      }
    }, [selectedDateProp]);

    useEffect(() => {
      if (selectedRangeProp) {
        setSelectedRange({
          startDate: selectedRangeProp.startDate,
          endDate: selectedRangeProp.endDate,
        });
      }
    }, [selectedRangeProp]);

    useImperativeHandle(ref, () => ({
      goToToday: () => {
        const today = new Date();
        setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
        if (selectionMode === 'range') {
          setSelectedRange({ startDate: today, endDate: null });
          onDayPress?.({ startDate: today, endDate: null });
        } else {
          setSelectedDate(today);
          onDayPress?.(today);
        }
      },
      clearSelection: () => {
        if (selectionMode === 'range') {
          setSelectedRange({ startDate: null, endDate: null });
        } else {
          setSelectedDate(null);
        }
      },
    }));


    const getMonthDate = (base: Date, offset: number) =>
      new Date(base.getFullYear(), base.getMonth() + offset, 1);

    const getMonthCells = (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const startDay = firstDay.getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const cells: { date: Date | null; isCurrentMonth: boolean }[] = [];

      // Empty cells for days before the first day of the month
      for (let i = 0; i < startDay; i++) {
        cells.push({
          date: null,
          isCurrentMonth: false,
        });
      }

      // Current month's days
      for (let d = 1; d <= daysInMonth; d++) {
        cells.push({
          date: new Date(year, month, d),
          isCurrentMonth: true,
        });
      }

      // Empty cells to complete the grid
      const cellsAfter = (7 - (cells.length % 7)) % 7;
      for (let i = 0; i < cellsAfter; i++) {
        cells.push({
          date: null,
          isCurrentMonth: false,
        });
      }

      return cells;
    };

    const isSameDay = (date1: Date, date2: Date) => {
      return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
      );
    };

    const isInRange = (date: Date) => {
      if (!selectedRange.startDate || !selectedRange.endDate) return false;
      const start =
        selectedRange.startDate < selectedRange.endDate
          ? selectedRange.startDate
          : selectedRange.endDate;
      const end =
        selectedRange.startDate > selectedRange.endDate
          ? selectedRange.startDate
          : selectedRange.endDate;

      // Normalize dates to midnight for comparison
      const checkDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );
      const startDate = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate(),
      );
      const endDate = new Date(
        end.getFullYear(),
        end.getMonth(),
        end.getDate(),
      );

      return checkDate > startDate && checkDate < endDate;
    };

    const isRangeStart = (date: Date) => {
      if (!selectedRange.startDate) return false;
      return isSameDay(date, selectedRange.startDate);
    };

    const isRangeEnd = (date: Date) => {
      if (!selectedRange.endDate) return false;
      return isSameDay(date, selectedRange.endDate);
    };

    const handleDayPress = (date: Date) => {
      if (selectionMode === 'range') {
        // First click: set start date
        if (!selectedRange.startDate) {
          const newRange = { startDate: date, endDate: null };
          setSelectedRange(newRange);
          onDayPress?.(newRange);
        }
        // Second click: set end date
        else if (selectedRange.startDate && !selectedRange.endDate) {
          const newRange = {
            startDate: selectedRange.startDate,
            endDate: date,
          };
          setSelectedRange(newRange);
          onDayPress?.(newRange);
        }
        // Further clicks: update based on position
        else if (selectedRange.startDate && selectedRange.endDate) {
          const clickedTime = date.getTime();
          const startTime = selectedRange.startDate.getTime();
          const endTime = selectedRange.endDate.getTime();

          const [rangeStart, rangeEnd] =
            startTime < endTime ? [startTime, endTime] : [endTime, startTime];

          const middleTime = (rangeStart + rangeEnd) / 2;

          let newRange;
          if (clickedTime < rangeStart) {
            // Before range: update start date
            newRange = {
              startDate: date,
              endDate: selectedRange.endDate,
            };
          } else if (clickedTime > rangeEnd) {
            // After range: update end date
            newRange = {
              startDate: selectedRange.startDate,
              endDate: date,
            };
          } else {
            // Within range: update based on middle point
            if (clickedTime > middleTime) {
              // After middle: update end date
              newRange = {
                startDate: selectedRange.startDate,
                endDate: date,
              };
            } else {
              // Before or at middle: update start date
              newRange = {
                startDate: date,
                endDate: selectedRange.endDate,
              };
            }
          }
          setSelectedRange(newRange);
          onDayPress?.(newRange);
        }
      } else {
        setSelectedDate(date);
        onDayPress?.(date);
      }
    };

  const renderMonth = (date: Date) => {
      const cells = getMonthCells(date);
      const columnCount = 7;
      const rowCount = Math.ceil(cells.length / columnCount);

      // Build columns while keeping sequence same
      const columns: Array<
        Array<{ date: Date | null; isCurrentMonth: boolean }>
      > = Array.from({ length: columnCount }, (_: unknown, colIdx: number) =>
        Array.from({ length: rowCount }, (_2: unknown, rowIdx: number) => {
          const index = colIdx + rowIdx * columnCount;
          return cells[index];
        }),
      );

      return (
        <View style={[styles.fullWidth, calendarStyle.monthWrapper]}>
          {/* Month Navigation */}
          {showMonthNavigation && (
            <View style={styles.monthHeader}>
              <TouchableOpacity
                onPress={() => {
                  const newMonth = new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() - 1,
                    1,
                  );
                  setCurrentMonth(newMonth);
                  onMonthChange?.(newMonth);
                }}
                style={styles.navBtn}
              >
                <FontelloIcon
                  name="left-open-mini"
                  size={24}
                  color={THEME_COLORS.primary}
                />
              </TouchableOpacity>
              <View style={styles.monthTitleContainer}>
                <Text style={styles.monthTitle}>
                  {monthNames[currentMonth.getMonth()]}
                </Text>
                <Text style={styles.yearSubtitle}>
                  {currentMonth.getFullYear()}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  const newMonth = new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() + 1,
                    1,
                  );
                  setCurrentMonth(newMonth);
                  onMonthChange?.(newMonth);
                }}
                style={styles.navBtn}
              >
                <FontelloIcon
                  name="right-open-mini"
                  size={24}
                  color={THEME_COLORS.primary}
                />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.monthContainer}>
            {/* Weekday header */}
            {!hideWeekDays && (
              <View style={styles.weekRow}>
                {dayLabels.map((d, i) => (
                  <View key={i} style={styles.weekDayBox}>
                    <Text style={[styles.weekDay]}>{d}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Columns container */}
            <View style={styles.columnsContainer}>
              {columns.map((col, cIdx) => (
                <View key={cIdx} style={styles.columnStyle}>
                  {col.map((item, rIdx) => {
                    // If date is null, render an empty cell
                    if (!item.date) {
                      return (
                        <View
                          key={rIdx}
                          style={[
                            styles.cell,
                            styles.emptyCell,
                            calendarStyle.cell,
                          ]}
                        >
                          <Text />
                        </View>
                      );
                    }

                    const isToday = isSameDay(item.date, new Date());
                    const isSelected =
                      selectionMode === 'range'
                        ? isRangeStart(item.date) || isRangeEnd(item.date)
                        : selectedDate
                          ? isSameDay(item.date, selectedDate)
                          : false;
                    const inRange =
                      selectionMode === 'range' && isInRange(item.date);
                    const marked = item.date ? markedDates.find(d => d.date && isSameDay(d.date, item.date!)) : undefined;

                    return (
                      <TouchableOpacity
                        key={rIdx}
                        style={[
                          styles.cell,
                          styles.cellRelative,
                          calendarStyle.cell,
                          isToday && !isSelected && styles.todayCell,
                          inRange && styles.rangeCell,
                          isSelected && styles.selectedCell,
                          marked && marked.backgroundColor
                            ? { backgroundColor: marked.backgroundColor }
                            : null,
                        ]}
                        onPress={() => item.date && handleDayPress(item.date)}
                        disabled={!item.date}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            calendarStyle.dayText,
                            isToday && !isSelected && styles.todayText,
                            inRange && styles.rangeText,
                            isSelected && styles.selectedText,
                            marked && marked.textColor
                              ? { color: marked.textColor }
                              : null,
                          ]}
                        >
                          {item.date ? item.date.getDate() : ''}
                        </Text>
                        {marked && marked.icon && (
                          <View style={[styles.markIcon]}>{marked.icon}</View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </View>
      );
    };

    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
      if (scrollable) {
        flatListRef.current?.scrollToIndex({ index: 1, animated: false });
      }
    }, [currentMonth, scrollable]);

    if (scrollable) {
      const months = [
        getMonthDate(currentMonth, -1),
        currentMonth,
        getMonthDate(currentMonth, 1),
      ];
      const flatListProps = {
        horizontal: true,
        pagingEnabled: true,
        showsHorizontalScrollIndicator: false,
        initialScrollIndex: 1,
        getItemLayout: (_: any, i: number) => ({
          length: containerWidth,
          offset: containerWidth * i,
          index: i,
        }),
        snapToInterval: containerWidth,
        decelerationRate: 'fast' as const,
        onMomentumScrollEnd: (e: any) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / containerWidth);
          let newMonth = currentMonth;
          if (idx === 0) newMonth = getMonthDate(currentMonth, -1);
          else if (idx === 2) newMonth = getMonthDate(currentMonth, 1);

          if (newMonth !== currentMonth) {
            setCurrentMonth(newMonth);
            onMonthChange?.(newMonth);
          }
        },
      };
      return (
        <View
          style={styles.fullWidth}
          onLayout={(e) => {
            const width = e.nativeEvent.layout.width;
            if (width > 0 && width !== containerWidth) {
              setContainerWidth(width);
            }
          }}
        >
          {containerWidth > 0 && (
            <FlatList
              ref={flatListRef}
              data={months}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item }) => (
                <View style={{ width: containerWidth }}>{renderMonth(item)}</View>
              )}
              {...flatListProps}
            />
          )}
        </View>
      );
    } else {
      return renderMonth(currentMonth);
    }
  },
);

const styles = StyleSheet.create({
  fullWidth: {
    flex: 1,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  navBtn: {
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  monthTitleContainer: {
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  yearSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  columnsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  columnStyle: {
    flexDirection: 'column',
  },
  cellRelative: {
    position: 'relative',
  },
  emptyCell: {
    backgroundColor: 'transparent',
  },
  rangeCell: {
    backgroundColor: THEME_COLORS.primary,
    borderRadius: 10,
  },
  rangeText: {
    color: '#fff',
    fontWeight: '700',
  },
  monthContainer: {
    paddingTop: 8,
    alignItems: 'stretch',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDayBox: {
    alignItems: 'center',
  },
  weekDay: {
    fontWeight: '600',
    color: '#999',
    fontSize: 13,
  },
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginVertical: 2,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  dayText: {
    fontSize: 16,
    color: THEME_COLORS.text,
    fontWeight: '500',
  },
  todayCell: {
    outlineWidth: 1,
    outlineColor: THEME_COLORS.primary,
    borderRadius: 10,
  },
  todayText: {
    color: THEME_COLORS.primary,
    fontWeight: '700',
  },
  selectedCell: {
    backgroundColor: THEME_COLORS.primary,
    borderRadius: 10,
  },
  selectedText: {
    color: '#fff',
    fontWeight: '700',
  },
  markIcon: {
    position: 'absolute',
    top: 3,
    right: 3,
  },

});

export const CalendarWidget = React.memo(CalendarWidgetBase);
