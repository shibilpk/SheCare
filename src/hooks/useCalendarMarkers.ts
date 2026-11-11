import { useState, useEffect } from 'react';
import apiClient from '@src/services/ApiClient';
import { APIS } from '@src/constants/apis';
import { toLocalDateString, parseLocalDate } from '../utils/date';

export type CalendarMarkerType =
  | 'period'
  | 'future_period'
  | 'ovulation'
  | 'fertile'
  | 'pregnant'
  | 'medication'
  | 'love'
  | 'diary';

export type CalendarMarkers = Record<CalendarMarkerType, Date[]>;

type CalendarMarkersResponse = Record<CalendarMarkerType, string[]>;

const EMPTY_MARKERS: CalendarMarkers = {
  period: [],
  future_period: [],
  ovulation: [],
  fertile: [],
  pregnant: [],
  medication: [],
  love: [],
  diary: [],
};

/**
 * Fetches the dates to mark on the calendar around the given month
 * (one month before to two months after).
 */
export function useCalendarMarkers(month: Date) {
  const [markers, setMarkers] = useState<CalendarMarkers>(EMPTY_MARKERS);
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  useEffect(() => {
    let cancelled = false;
    const start = new Date(year, monthIndex - 1, 1);
    const end = new Date(year, monthIndex + 3, 0);

    apiClient
      .get<CalendarMarkersResponse>(
        APIS.v1.activities.calendarMarkers(
          toLocalDateString(start),
          toLocalDateString(end),
        ),
      )
      .then(response => {
        if (cancelled) {
          return;
        }
        const parsed = { ...EMPTY_MARKERS };
        (Object.keys(EMPTY_MARKERS) as CalendarMarkerType[]).forEach(type => {
          parsed[type] = (response[type] ?? []).map(parseLocalDate);
        });
        setMarkers(parsed);
      })
      .catch(err => console.info('Failed to fetch calendar markers:', err));

    return () => {
      cancelled = true;
    };
  }, [year, monthIndex]);

  return markers;
}
