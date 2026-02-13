import { APIS } from '@src/constants/apis';
import apiClient from '@src/services/ApiClient';
import { useState, useEffect } from 'react';

export interface DailyActionData {
  moods: any[];
  symptoms: any[];
  activities: any[];
  intimacyOptions: any[];
  flowOptions: any[];
  isLoading: boolean;
  error: string | null;
}

interface DailyActionResponse {
  moods: any[];
  symptoms: any[];
  activities: any[];
  intimacy_options: any[];
  flow_options: any[];
}

/**
 * Custom hook to fetch all daily action data (moods, symptoms, activities, etc.)
 * This hook should be used at a high level (e.g., in RootNavigation) to avoid
 * re-fetching data every time the modal opens.
 */
export function useDailyActionData(): DailyActionData {
  const [moods, setMoods] = useState<any[]>([]);
  const [symptoms, setSymptoms] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [intimacyOptions, setIntimacyOptions] = useState<any[]>([]);
  const [flowOptions, setFlowOptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await apiClient.get<DailyActionResponse>(
          APIS.V1.ACTIVITIES.DAILY_ACTION_LIST,
        );
        setMoods(res.moods || []);
        setSymptoms(res.symptoms || []);
        setActivities(res.activities || []);
        setIntimacyOptions(res.intimacy_options || []);
        setFlowOptions(res.flow_options || []);
      } catch (e) {
        console.error('Failed to fetch daily action data', e);
        setError('Failed to load daily action data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  return {
    moods,
    symptoms,
    activities,
    intimacyOptions,
    flowOptions,
    isLoading,
    error,
  };
}
