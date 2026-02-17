import { useState, useCallback } from 'react';
import apiClient from '@src/services/ApiClient';
import { APIS } from '@src/constants/apis';

export interface PeriodStartPayload {
  start_date: string;
  end_date: string;
}

export interface PeriodEndPayload {
  period_id: string;
  start_date: string;
  end_date: string;
}

export interface ActivePeriod {
  id: string;
  start_date: string;
  end_date: string;
  cycle_length: number;
}

export interface UsePeriodActionsReturn {
  isStarting: boolean;
  isEnding: boolean;
  error: string | null;
  startPeriod: (payload: PeriodStartPayload) => Promise<any>;
  endPeriod: (payload: PeriodEndPayload) => Promise<any>;
  getActivePeriod: () => Promise<ActivePeriod | null>;
}

/**
 * Custom hook for period actions (start, end, get active)
 * Handles lifecycle operations for period tracking
 */
export function usePeriodActions(): UsePeriodActionsReturn {
  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startPeriod = useCallback(async (payload: PeriodStartPayload) => {
    try {
      setIsStarting(true);
      setError(null);

      const response = await apiClient.post<any>(
        APIS.V1.PERIOD.START,
        payload,
      );

      return response;
    } catch (err: any) {
      console.info('Failed to start period:', err);
      setError(err.message || 'Failed to start period');
      throw err;
    } finally {
      setIsStarting(false);
    }
  }, []);

  const endPeriod = useCallback(async (payload: PeriodEndPayload) => {
    try {
      setIsEnding(true);
      setError(null);

      const response = await apiClient.post<any>(
        APIS.V1.PERIOD.END,
        payload,
      );

      return response;
    } catch (err: any) {
      console.info('Failed to end period:', err);
      setError(err.message || 'Failed to end period');
      throw err;
    } finally {
      setIsEnding(false);
    }
  }, []);

  const getActivePeriod = useCallback(async (): Promise<ActivePeriod | null> => {
    try {
      setError(null);

      const response = await apiClient.get<any>(APIS.V1.PERIOD.ACTIVE);

      // If no active period, backend might return null or empty object
      if (!response || !response.id) {
        return null;
      }

      return response as ActivePeriod;
    } catch (err: any) {
      // 404 typically means no active period
      if (err?.statusCode === 404) {
        return null;
      }

      console.info('Failed to get active period:', err);
      setError(err.message || 'Failed to get active period');
      throw err;
    }
  }, []);

  return {
    isStarting,
    isEnding,
    error,
    startPeriod,
    endPeriod,
    getActivePeriod,
  };
}
