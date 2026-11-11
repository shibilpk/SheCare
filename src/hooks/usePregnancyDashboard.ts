import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import apiClient, { APIError } from '@src/services/ApiClient';
import { APIS } from '@src/constants/apis';

export interface DashboardPregnancy {
  id: string;
  due_date: string; // YYYY-MM-DD
  start_date: string; // YYYY-MM-DD
  baby_name: string;
  current_week: number;
  current_day: number;
  trimester: number;
  days_remaining: number;
  total_weeks: number;
  progress_percent: number;
}

export interface DashboardBaby {
  week: number;
  size_comparison: string;
  length_cm: number;
  weight_g: number;
  development: string;
}

export interface DashboardMaternal {
  pre_pregnancy_weight_kg: number | null;
  current_weight_kg: number | null;
  weight_gain_kg: number | null;
  recommended_gain: string;
}

export interface DashboardToday {
  water_glasses: number;
  water_goal_glasses: number;
  sleep_hours: number | null;
  exercise_minutes_week: number;
  mood_ids: string[];
}

/** Each value is 0..1 — share of goal reached over the last 7 days. */
export interface DashboardHealthMetrics {
  nutrition: number;
  hydration: number;
  sleep: number;
  exercise: number;
  /** Days with a daily check-in in the last 7 days / 7. */
  wellness: number;
}

export interface DashboardAppointment {
  id: number;
  title: string;
  doctor: string;
  location: string;
  date: string; // YYYY-MM-DD
  time: string | null; // HH:MM[:SS]
  notes: string;
  icon: string;
  color: string;
  is_completed: boolean;
}

export interface PregnancyDashboard {
  pregnancy: DashboardPregnancy;
  baby: DashboardBaby;
  baby_growth: { week: number; weight_g: number }[];
  maternal: DashboardMaternal;
  weight_series: { week: number; weight_kg: number }[];
  today: DashboardToday;
  health_metrics: DashboardHealthMetrics;
  activity_last_7_days: { date: string; label: string; minutes: number }[];
  symptoms_by_week: { week: number; count: number }[];
  recent_symptoms: { id: string; name: string; days: number }[];
  upcoming_appointment: DashboardAppointment | null;
}

export interface UsePregnancyDashboardReturn {
  data: PregnancyDashboard | null;
  /** True only while there is no data yet (first load, or retry after notFound/error). */
  isLoading: boolean;
  /** True while a refetch is running in the background over existing data. */
  isRefreshing: boolean;
  error: string | null;
  /** Backend returned 404: the customer has no active pregnancy. */
  notFound: boolean;
  refetch: () => Promise<void>;
}

/**
 * Fetches the pregnancy-mode dashboard (week, baby development, maternal
 * weight, last-7-day health metrics, symptom trends, next appointment).
 * Refetches whenever the screen regains focus so values logged elsewhere show up.
 */
export function usePregnancyDashboard(): UsePregnancyDashboardReturn {
  const [data, setData] = useState<PregnancyDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const hasData = useRef(false);
  const requestId = useRef(0);

  const fetchDashboard = useCallback(async () => {
    const id = ++requestId.current;
    if (hasData.current) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    try {
      const response = await apiClient.get<PregnancyDashboard>(
        APIS.v1.pregnancy.dashboard(),
      );
      if (id !== requestId.current) return;
      hasData.current = true;
      setData(response);
      setNotFound(false);
    } catch (err: any) {
      if (id !== requestId.current) return;
      if (err instanceof APIError && err.type === 'cancelled') return;
      if (err instanceof APIError && err.statusCode === 404) {
        hasData.current = false;
        setData(null);
        setNotFound(true);
      } else {
        // Keep previously loaded data on a failed background refresh;
        // screens show the error state only when there is no data.
        console.info('Failed to fetch pregnancy dashboard:', err);
        setNotFound(false);
        setError(
          err?.normalizedError?.message ||
            err?.message ||
            'Failed to load pregnancy data',
        );
      }
    } finally {
      if (id === requestId.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [fetchDashboard]),
  );

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    notFound,
    refetch: fetchDashboard,
  };
}
