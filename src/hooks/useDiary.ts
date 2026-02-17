import { useState, useCallback } from 'react';
import apiClient, { APIError } from '@src/services/ApiClient';
import { APIS } from '@src/constants/apis';

export interface DiaryEntry {
  entry_date: string;
  content: string | null;
}

export interface UseDiaryReturn {
  diaryEntry: DiaryEntry | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  fetchEntry: (date: Date) => Promise<DiaryEntry | null>;
  saveEntry: (date: Date, content: string) => Promise<string>;
}

/**
 * Custom hook for diary operations
 * Provides fetch and save functionality for diary entries
 */
export function useDiary(): UseDiaryReturn {
  const [diaryEntry, setDiaryEntry] = useState<DiaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEntry = useCallback(async (date: Date): Promise<DiaryEntry | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.get<DiaryEntry>(
        APIS.V1.DAIRY.ENTRY_FROM_DATE,
        {
          params: {
            entry_date: date.toISOString().split('T')[0],
          },
        },
      );

      setDiaryEntry(response);
      return response;
    } catch (err: any) {
      const apiError = err as APIError;

      // 404 = no diary entry for that date (not an error)
      if (apiError.statusCode === 404) {
        setDiaryEntry(null);
        return null;
      }

      console.info('Failed to fetch diary entry:', err);
      setError(err.message || 'Failed to load diary entry');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveEntry = useCallback(async (date: Date, content: string): Promise<string> => {
    try {
      setIsSaving(true);
      setError(null);

      const payload = {
        entry_date: date.toISOString().split('T')[0],
        content,
      };

      const response = await apiClient.post<any>(APIS.V1.DAIRY.ENTRY, payload);

      // Update local state with saved entry
      setDiaryEntry({
        entry_date: payload.entry_date,
        content: payload.content,
      });

      return response?.detail?.message ?? 'Diary entry saved successfully!';
    } catch (err: any) {
      console.info('Failed to save diary entry:', err);
      setError(err.message || 'Failed to save diary entry');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    diaryEntry,
    isLoading,
    isSaving,
    error,
    fetchEntry,
    saveEntry,
  };
}
