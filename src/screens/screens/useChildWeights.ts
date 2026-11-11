import { useState, useEffect, useCallback } from 'react';
import apiClient from '@src/services/ApiClient';
import { APIS } from '@src/constants/apis';

export interface ChildWeightEntry {
  id: number;
  entry_date: string; // YYYY-MM-DD
  age_months: number;
  age_label: string;
  weight_kg: number;
  gain_kg: number;
}

export interface ChildWeightPayload {
  entry_date: string; // YYYY-MM-DD
  age_months: number; // 0-240
  weight_kg: number; // > 0
}

const errorMessage = (err: any, fallback: string): string =>
  err?.normalizedError?.message || fallback;

export function useChildWeights() {
  const [entries, setEntries] = useState<ChildWeightEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async (refreshing = false) => {
    try {
      if (refreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      const response = await apiClient.get<ChildWeightEntry[]>(
        APIS.v1.pregnancy.childWeights(),
      );
      setEntries(response);
      setError(null);
    } catch (err: any) {
      console.info('Failed to fetch child weights:', err);
      setError(errorMessage(err, 'Failed to load weight history'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const addEntry = useCallback(
    async (payload: ChildWeightPayload) => {
      try {
        setIsSaving(true);
        const created = await apiClient.post<ChildWeightEntry>(
          APIS.v1.pregnancy.childWeights(),
          payload,
        );
        // Re-fetch so ordering and gain_kg of later entries stay correct
        await fetchEntries(true);
        return created;
      } catch (err: any) {
        throw new Error(errorMessage(err, 'Failed to save weight'));
      } finally {
        setIsSaving(false);
      }
    },
    [fetchEntries],
  );

  const deleteEntry = useCallback(
    async (id: number) => {
      try {
        setIsSaving(true);
        await apiClient.delete(APIS.v1.pregnancy.childWeight(id));
        await fetchEntries(true);
      } catch (err: any) {
        throw new Error(errorMessage(err, 'Failed to delete entry'));
      } finally {
        setIsSaving(false);
      }
    },
    [fetchEntries],
  );

  return {
    entries,
    isLoading,
    isRefreshing,
    isSaving,
    error,
    refetch: fetchEntries,
    addEntry,
    deleteEntry,
  };
}
