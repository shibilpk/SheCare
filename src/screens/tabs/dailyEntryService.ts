import { APIS } from '@src/constants/apis';
import apiClient from '@src/services/ApiClient';
import { toLocalDateString } from '../../utils/date';

export interface RatingItem {
  id: string;
  rating: number;
}

export interface DailyEntryPayload {
  date: string;
  moods: string[];
  symptoms: string[];
  activities: string[];
  intimacy: string[];
  flow: string[];
  ratings: RatingItem[];
}

export interface DailyEntryResponse {
  id: number;
  date: string;
  moods: string[];
  symptoms: string[];
  activities: string[];
  intimacy: string[];
  flow: string[];
  ratings: RatingItem[];
  created_at: string;
  updated_at: string;
}

/**
 * Save or update a daily entry
 */
export async function saveDailyEntry(payload: DailyEntryPayload): Promise<DailyEntryResponse> {
  const response = await apiClient.post<DailyEntryResponse>(
    APIS.v1.activities.createDailyEntry(),
    payload
  );
  return response;
}

/**
 * Fetch a daily entry for a specific date
 */
export async function fetchDailyEntry(date: Date): Promise<DailyEntryResponse | null> {
  const dateStr = toLocalDateString(date);

  try {
    const response = await apiClient.get<DailyEntryResponse>(
      APIS.v1.activities.dailyEntries(dateStr)
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
