import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../services/ApiClient';
import { APIS } from '../../constants/apis';

export interface HydrationLog {
  id: number;
  date: string;
  amount_ml: number;
  glass_size_ml: number;
  glasses_count: number;
  daily_goal_ml: number;
  total_liters: number;
  progress_percent: number;
  created_at: string;
  updated_at: string;
}

export interface CreateHydrationLogPayload {
  date: string;
  amount_ml?: number;
  glass_size_ml?: number;
  daily_goal_ml?: number;
}

export function useHydration(date: string) {
  const [hydrationLog, setHydrationLog] = useState<HydrationLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHydrationLog = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get<HydrationLog>(
        APIS.V1.HYDRATION.getHydrationLog(date),
        { is_auth: true }
      );
      setHydrationLog(response);
      setError(null);
    } catch (err: any) {
      // If no log exists, create a default one
      if (err?.statusCode === 404) {
        try {
          const newLog = await apiClient.post<HydrationLog>(
            APIS.V1.HYDRATION.CREATE_UPDATE_HYDRATION,
            {
              date,
              amount_ml: 0,
              glass_size_ml: 250,
              daily_goal_ml: 2000,
            },
            { is_auth: true }
          );
          setHydrationLog(newLog);
          setError(null);
        } catch (createErr: any) {
          console.error('Failed to create hydration log:', createErr);
          setError(createErr?.normalizedError?.message || 'Failed to create hydration log');
        }
      } else {
        console.error('Failed to fetch hydration log:', err);
        setError(err?.normalizedError?.message || 'Failed to load hydration log');
      }
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  const updateHydrationLog = useCallback(async (payload: CreateHydrationLogPayload) => {
    try {
      setIsUpdating(true);
      const response = await apiClient.post<HydrationLog>(
        APIS.V1.HYDRATION.CREATE_UPDATE_HYDRATION,
        payload,
        { is_auth: true }
      );
      setHydrationLog(response);
      setError(null);
      return response;
    } catch (err: any) {
      console.error('Failed to update hydration log:', err);
      const errorMessage = err?.normalizedError?.message || 'Failed to update hydration log';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const addWater = useCallback(async (amountMl?: number) => {
    if (!hydrationLog) return;

    const amount = amountMl ?? hydrationLog.glass_size_ml;
    const newAmount = hydrationLog.amount_ml + amount;
    return updateHydrationLog({
      date,
      amount_ml: newAmount,
      glass_size_ml: hydrationLog.glass_size_ml,
      daily_goal_ml: hydrationLog.daily_goal_ml,
    });
  }, [date, hydrationLog, updateHydrationLog]);

  const removeWater = useCallback(async (amountMl?: number) => {
    if (!hydrationLog) return;

    const amount = amountMl ?? hydrationLog.glass_size_ml;
    const newAmount = Math.max(0, hydrationLog.amount_ml - amount);
    return updateHydrationLog({
      date,
      amount_ml: newAmount,
      glass_size_ml: hydrationLog.glass_size_ml,
      daily_goal_ml: hydrationLog.daily_goal_ml,
    });
  }, [date, hydrationLog, updateHydrationLog]);

  const updateSettings = useCallback(async (
    glassSize: number,
    dailyGoal: number
  ) => {
    if (!hydrationLog) return;

    return updateHydrationLog({
      date,
      amount_ml: hydrationLog.amount_ml,
      glass_size_ml: glassSize,
      daily_goal_ml: dailyGoal,
    });
  }, [date, hydrationLog, updateHydrationLog]);

  useEffect(() => {
    fetchHydrationLog();
  }, [fetchHydrationLog]);

  return {
    hydrationLog,
    isLoading,
    isUpdating,
    error,
    addWater,
    removeWater,
    updateSettings,
    refresh: fetchHydrationLog,
  };
}
