import { useState, useCallback } from 'react';
import apiClient from '@src/services/ApiClient';
import { APIS } from '@src/constants/apis';

export interface DailyDataItem {
  id: string;
  type: 'mood' | 'symptom' | 'activity' | 'flow' | 'intimacy';
  tag?: string;
  name?: string;
  label?: string;
  emoji?: string;
  icon?: string;
  color?: string;
}

export interface RatingItem {
  id: string;
  rating: number;
}

export interface DailyEntryPayload {
  date: string;
  daily_data: DailyDataItem[];
  ratings: RatingItem[];
}

export interface DailyEntryResponse {
  id: number;
  date: string;
  daily_data: DailyDataItem[];
  ratings: RatingItem[];
  created_at: string;
  updated_at: string;
}

export interface SummaryCard {
  id: number;
  icon: string;
  title: string;
  value?: string;
  rating?: number;
  color: string;
}

export interface DailySummaryResponse {
  id: number;
  date: string;
  summary_cards: SummaryCard[];
  created_at: string;
  updated_at: string;
}

export interface UseDailyEntryReturn {
  dailyEntry: DailyEntryResponse | null;
  dailySummary: DailySummaryResponse | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  fetchEntry: (date: Date) => Promise<DailyEntryResponse | null>;
  saveEntry: (payload: DailyEntryPayload) => Promise<DailyEntryResponse>;
  fetchDailyDetailed: (date: Date) => Promise<DailySummaryResponse | null>;
}

/**
 * Custom hook for daily entry operations (moods, symptoms, activities, ratings)
 * Provides fetch and save functionality for daily entries
 */
export function useDailyEntry(): UseDailyEntryReturn {
  const [dailyEntry, setDailyEntry] = useState<DailyEntryResponse | null>(null);
  const [dailySummary, setDailySummary] = useState<DailySummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEntry = useCallback(async (date: Date): Promise<DailyEntryResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const dateStr = date.toISOString().split('T')[0];
      const response = await apiClient.get<DailyEntryResponse>(
        APIS.V1.ACTIVITIES.getDailyEntires(dateStr)
      );

      setDailyEntry(response);
      return response;
    } catch (err: any) {
      // If 404, return null (no entry exists for this date)
      if (err?.statusCode === 404) {
        setDailyEntry(null);
        return null;
      }

      console.info('Failed to fetch daily entry:', err);
      setError(err.message || 'Failed to load daily entry');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDailyDetailed = useCallback(async (date: Date): Promise<DailySummaryResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const dateStr = date.toISOString().split('T')[0];
      const response = await apiClient.get<DailySummaryResponse>(
        APIS.V1.ACTIVITIES.getDailyDetailed(dateStr)
      );

      setDailySummary(response);
      return response;
    } catch (err: any) {
      // If 404, return null (no entry exists for this date)
      if (err?.statusCode === 404) {
        setDailySummary(null);
        return null;
      }

      console.info('Failed to fetch daily entry:', err);
      setError(err.message || 'Failed to load daily entry');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveEntry = useCallback(async (payload: DailyEntryPayload): Promise<DailyEntryResponse> => {
    try {
      setIsSaving(true);
      setError(null);

      const response = await apiClient.post<DailyEntryResponse>(
        APIS.V1.ACTIVITIES.CREATE_DAILY_ENTRY,
        payload,
      );

      setDailyEntry(response);
      return response;
    } catch (err: any) {
      console.info('Failed to save daily entry:', err);
      setError(err.message || 'Failed to save daily entry');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    dailyEntry,
    dailySummary,
    isLoading,
    isSaving,
    error,
    fetchEntry,
    saveEntry,
    fetchDailyDetailed,
  };
}
