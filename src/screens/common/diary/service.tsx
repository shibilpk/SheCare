import { APIS } from '@src/constants/apis';
import apiClient, { APIError } from '@src/services/ApiClient';

export interface DiaryEntry {
  entry_date: string;
  content: string | null;
}

/**
 * Fetch diary entry by date
 */
export async function fetchDiaryEntry(date: Date): Promise<DiaryEntry | null> {
  try {
    const response = await apiClient.get<DiaryEntry>(
      APIS.V1.DAIRY.ENTRY_FROM_DATE,
      {
        params: {
          entry_date: date.toISOString().split('T')[0],
        },
      },
    );

    return response;
  } catch (error) {
    const apiError = error as APIError;

    // 404 = no diary entry for that date
    if (apiError.statusCode === 404) {
      return null;
    }

    throw error;
  }
}

/**
 * Create or update diary entry
 */
export async function saveDiaryEntry(
  date: Date,
  content: string,
): Promise<string> {
  const payload = {
    entry_date: date.toISOString().split('T')[0],
    content,
  };

  const response = await apiClient.post<any>(APIS.V1.DAIRY.ENTRY, payload);

  return response?.detail?.message ?? 'Diary entry saved successfully!';
}
