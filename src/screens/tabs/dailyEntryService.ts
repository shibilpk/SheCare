import { APIS } from '@src/constants/apis';
import apiClient from '@src/services/ApiClient';

export interface DailyDataItem {
  id: string;
  type: 'mood' | 'symptom' | 'activity' | 'flow' | 'intimacy';
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

/**
 * Save or update a daily entry
 */
export async function saveDailyEntry(payload: DailyEntryPayload): Promise<DailyEntryResponse> {
  const response = await apiClient.post<DailyEntryResponse>(
    APIS.V1.ACTIVITIES.CREATE_DAILY_ENTRY,
    payload
  );
  return response;
}

/**
 * Fetch a daily entry for a specific date
 */
export async function fetchDailyEntry(date: Date): Promise<DailyEntryResponse | null> {
  const dateStr = date.toISOString().split('T')[0];

  try {
    const response = await apiClient.get<DailyEntryResponse>(
      APIS.V1.ACTIVITIES.getDailyEntires(dateStr)
    );
    return response;
  } catch (error: any) {
    // If 404, return null (no entry exists for this date)
    if (error?.statusCode === 404) {
      return null;
    }
    throw error;
  }
}
