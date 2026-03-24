import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../../services/ApiClient';
import { APIS } from '../../constants/apis';

export interface NutritionLog {
  id: number;
  date: string;
  name: string;
  quantity: number;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  created_at: string;
  updated_at: string;
}

export interface NutritionGoal {
  id: number;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  created_at: string;
  updated_at: string;
}

export interface NutritionSummary {
  date: string;
  logs: NutritionLog[];
  goal: NutritionGoal;
  totals: {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
  };
  progress: {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
  };
}

export interface AddNutritionPayload {
  date: string;
  name: string;
  quantity: number;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

export function useNutrition(date: string) {
  const [summary, setSummary] = useState<NutritionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);

  const fetchNutritionSummary = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get<NutritionSummary>(
        APIS.v1.nutrition.summary(date),
        { is_auth: true }
      );
      setSummary(response);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch nutrition summary:', err);
      setError(err?.normalizedError?.message || 'Failed to load nutrition data');
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  const addNutritionLog = useCallback(async (payload: AddNutritionPayload) => {
    try {
      setIsUpdating(true);
      const response = await apiClient.post<NutritionLog>(
        APIS.v1.nutrition.logs(),
        payload,
        { is_auth: true }
      );

      // Refresh summary after adding
      await fetchNutritionSummary();
      setError(null);
      return response;
    } catch (err: any) {
      console.error('Failed to add nutrition log:', err);
      const errorMessage = err?.normalizedError?.message || 'Failed to add meal';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [fetchNutritionSummary]);

  const updateNutritionLog = useCallback(async (logId: number, payload: AddNutritionPayload) => {
    try {
      setIsUpdating(true);
      const response = await apiClient.put<NutritionLog>(
        APIS.v1.nutrition.updateLog(logId),
        payload,
        { is_auth: true }
      );

      // Refresh summary after updating
      await fetchNutritionSummary();
      setError(null);
      return response;
    } catch (err: any) {
      console.error('Failed to update nutrition log:', err);
      const errorMessage = err?.normalizedError?.message || 'Failed to update meal';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [fetchNutritionSummary]);

  const deleteNutritionLog = useCallback(async (logId: number) => {
    try {
      setIsUpdating(true);
      await apiClient.delete(
        APIS.v1.nutrition.deleteLog(logId),
        { is_auth: true }
      );

      // Refresh summary after deleting
      await fetchNutritionSummary();
      setError(null);
    } catch (err: any) {
      console.error('Failed to delete nutrition log:', err);
      const errorMessage = err?.normalizedError?.message || 'Failed to delete meal';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [fetchNutritionSummary]);

  const updateGoal = useCallback(async (goal: Omit<NutritionGoal, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setIsUpdating(true);
      const response = await apiClient.post<NutritionGoal>(
        APIS.v1.nutrition.goal(),
        goal,
        { is_auth: true }
      );

      // Update summary with new goal
      if (summary) {
        setSummary({
          ...summary,
          goal: response,
          progress: {
            calories: Math.min(100, (summary.totals.calories / response.calories) * 100),
            carbs: Math.min(100, (summary.totals.carbs / response.carbs) * 100),
            protein: Math.min(100, (summary.totals.protein / response.protein) * 100),
            fat: Math.min(100, (summary.totals.fat / response.fat) * 100),
          },
        });
      }
      setError(null);
      return response;
    } catch (err: any) {
      console.error('Failed to update goal:', err);
      const errorMessage = err?.normalizedError?.message || 'Failed to update goal';
      setError(errorMessage);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [summary]);

  useEffect(() => {
    if (hasInitialized.current) {
      return;

    }
    hasInitialized.current = true;
    fetchNutritionSummary();
  }, [fetchNutritionSummary]);

  // Refetch when date changes
  useEffect(() => {
    if (hasInitialized.current) {
      fetchNutritionSummary();
    }
  }, [date]);

  return {
    summary,
    isLoading,
    isUpdating,
    error,
    addNutritionLog,
    updateNutritionLog,
    deleteNutritionLog,
    updateGoal,
    refresh: fetchNutritionSummary,
  };
}
