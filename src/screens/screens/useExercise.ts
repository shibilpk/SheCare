import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../services/ApiClient';
import { APIS } from '../../constants/apis';

export type ExerciseCategory = 'Cardio' | 'Strength' | 'Flexibility' | 'Sports';
export type ExerciseIntensity = 'Low' | 'Moderate' | 'High';

export interface ExerciseType {
  id: number;
  name: string;
  category: ExerciseCategory;
  calories_per_minute: number;
}

export interface ExerciseLog {
  id: number;
  exercise_type_id: number | null;
  name: string;
  date: string;
  minutes: number;
  calories: number;
  intensity: ExerciseIntensity;
}

export interface ExerciseWeekSummary {
  week_start: string;
  week_end: string;
  logs: ExerciseLog[];
  totals: { minutes: number; calories: number };
  goal: { minutes: number; calories: number };
  progress: { minutes: number; calories: number };
}

export interface AddExerciseLogPayload {
  exercise_type_id?: number;
  name?: string;
  date: string;
  minutes: number;
  /** 0 / omitted → backend estimates from the exercise type */
  calories?: number;
  intensity: ExerciseIntensity;
}

const errorMessage = (err: any, fallback: string): string =>
  err?.normalizedError?.message || fallback;

/** Exercise catalog + the Mon–Sun week summary containing `date` (YYYY-MM-DD). */
export function useExercise(date: string) {
  const [types, setTypes] = useState<ExerciseType[]>([]);
  const [summary, setSummary] = useState<ExerciseWeekSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    const response = await apiClient.get<ExerciseWeekSummary>(
      APIS.v1.exercise.weekSummary(date),
      { is_auth: true },
    );
    setSummary(response);
  }, [date]);

  const fetchAll = useCallback(async () => {
    try {
      const [typesResponse] = await Promise.all([
        apiClient.get<ExerciseType[]>(APIS.v1.exercise.types(), {
          is_auth: true,
        }),
        fetchSummary(),
      ]);
      setTypes(typesResponse);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch exercise data:', err);
      setError(errorMessage(err, 'Failed to load exercise data'));
    }
  }, [fetchSummary]);

  useEffect(() => {
    setIsLoading(true);
    fetchAll().finally(() => setIsLoading(false));
  }, [fetchAll]);

  /** Re-fetch without replacing the screen with a loader (pull-to-refresh / retry). */
  const refetch = useCallback(async () => {
    setIsRefreshing(true);
    await fetchAll();
    setIsRefreshing(false);
  }, [fetchAll]);

  const addLog = useCallback(
    async (payload: AddExerciseLogPayload) => {
      try {
        setIsUpdating(true);
        const response = await apiClient.post<ExerciseLog>(
          APIS.v1.exercise.logs(),
          payload,
          { is_auth: true },
        );
        await fetchSummary().catch(err =>
          console.error('Failed to refresh exercise summary:', err),
        );
        return response;
      } catch (err: any) {
        console.error('Failed to add exercise log:', err);
        throw new Error(errorMessage(err, 'Failed to add workout'));
      } finally {
        setIsUpdating(false);
      }
    },
    [fetchSummary],
  );

  const deleteLog = useCallback(
    async (id: number) => {
      try {
        setIsUpdating(true);
        await apiClient.delete(APIS.v1.exercise.log(id), { is_auth: true });
        await fetchSummary().catch(err =>
          console.error('Failed to refresh exercise summary:', err),
        );
      } catch (err: any) {
        console.error('Failed to delete exercise log:', err);
        throw new Error(errorMessage(err, 'Failed to delete workout'));
      } finally {
        setIsUpdating(false);
      }
    },
    [fetchSummary],
  );

  return {
    types,
    summary,
    isLoading,
    isRefreshing,
    isUpdating,
    error,
    refetch,
    addLog,
    deleteLog,
  };
}
