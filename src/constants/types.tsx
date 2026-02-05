interface WeightResponse {
  weight: string;
  unit: string;
}

interface ProfileResponse {
  email: string;
  name: string;
  phone?: string;
  photo?: string;
  age?: number;
  date_of_birth?: string;
  address?: string;
  height?: number;
  weight?: WeightResponse;
  cycleLength?: number;
  cycle_length?: number;
  periodLength?: number;
  period_length?: number;
  lutealPhase?: number;
  luteal_phase?: number;
}

export type { ProfileResponse, WeightResponse };
