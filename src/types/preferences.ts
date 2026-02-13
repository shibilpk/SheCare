export interface LanguageOption {
  value: string;
  label: string;
}

export interface TimezoneOption {
  value: string;
  label: string;
}

export interface PreferencesOptions {
  languages: LanguageOption[];
  timezones: TimezoneOption[];
}

export interface UserPreferences {
  language: string;
  timezone: string;
}
