import { useState, useEffect, useCallback } from 'react';
import apiClient from '@src/services/ApiClient';
import { APIS } from '@src/constants/apis';

export interface WeightEntry {
  id: number;
  weight: number;
  unit: 'kg' | 'lb' | null;
  /** Weight normalised to kg, so entries in different units can be charted. */
  weight_kg: number;
  /** YYYY-MM-DD (local date) */
  entry_date: string;
}

export interface UseWeightEntriesReturn {
  entries: WeightEntry[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  deleteEntry: (id: number) => Promise<void>;
}

/**
 * Weight history for the last `months` months (oldest first).
 */
export function useWeightEntries(months: number = 6): UseWeightEntriesReturn {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get<WeightEntry[]>(
        APIS.v1.customer.weightEntries(months),
      );
      setEntries(Array.isArray(response) ? response : []);
    } catch (err: any) {
      if (err?.statusCode === 404) {
        setEntries([]);
        return;
      }
      console.info('Failed to fetch weight entries:', err);
      setError(
        err?.normalizedError?.message ||
          err?.message ||
          'Failed to load weight history',
      );
    } finally {
      setIsLoading(false);
    }
  }, [months]);

  const deleteEntry = useCallback(async (id: number) => {
    await apiClient.delete(APIS.v1.customer.deleteWeightEntry(id));
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return {
    entries,
    isLoading,
    error,
    refetch: fetchEntries,
    deleteEntry,
  };
}
