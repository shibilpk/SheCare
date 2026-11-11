import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../services/ApiClient';
import { APIS } from '../../constants/apis';

export type SleepQuality = 'Poor' | 'Fair' | 'Good' | 'Excellent';

export interface SleepEntry {
  id: number;
  /** YYYY-MM-DD */
  date: string;
  duration_hours: number;
  quality: SleepQuality;
}

export interface SleepStats {
  average_hours_7d: number | null;
  entries_7d: number;
  goal_hours: number;
}

export interface SleepLogData {
  /** newest first */
  entries: SleepEntry[];
  stats: SleepStats;
}

export interface SaveSleepPayload {
  date: string;
  duration_hours: number;
  quality: SleepQuality;
}

const errorMessage = (err: any, fallback: string): string =>
  err?.normalizedError?.message || fallback;

export function useSleepLog() {
  const [data, setData] = useState<SleepLogData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      const response = await apiClient.get<SleepLogData>(APIS.v1.sleep.logs(), {
        is_auth: true,
      });
      setData(response);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch sleep logs:', err);
      setError(errorMessage(err, 'Failed to load sleep log'));
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchLogs().finally(() => setIsLoading(false));
  }, [fetchLogs]);

  const refetch = useCallback(async () => {
    setIsRefreshing(true);
    await fetchLogs();
    setIsRefreshing(false);
  }, [fetchLogs]);

  /** Creates the entry for `date`, or overwrites the existing one. */
  const saveEntry = useCallback(
    async (payload: SaveSleepPayload) => {
      try {
        setIsUpdating(true);
        const response = await apiClient.post<SleepEntry>(
          APIS.v1.sleep.logs(),
          payload,
          { is_auth: true },
        );
        await fetchLogs();
        return response;
      } catch (err: any) {
        console.error('Failed to save sleep entry:', err);
        throw new Error(errorMessage(err, 'Failed to save sleep entry'));
      } finally {
        setIsUpdating(false);
      }
    },
    [fetchLogs],
  );

  const deleteEntry = useCallback(
    async (id: number) => {
      try {
        setIsUpdating(true);
        await apiClient.delete(APIS.v1.sleep.log(id), { is_auth: true });
        await fetchLogs();
      } catch (err: any) {
        console.error('Failed to delete sleep entry:', err);
        throw new Error(errorMessage(err, 'Failed to delete sleep entry'));
      } finally {
        setIsUpdating(false);
      }
    },
    [fetchLogs],
  );

  return {
    data,
    isLoading,
    isRefreshing,
    isUpdating,
    error,
    refetch,
    saveEntry,
    deleteEntry,
  };
}
