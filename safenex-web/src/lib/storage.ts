import {
  UserProfile,
  Guardian,
  ActivityItemData,
  SecurityPreferences,
} from '../types';

export const STORAGE_KEYS = {
  PROFILE: 'safenex_user_profile_v2',
  GUARDIANS: 'safenex_real_guardians_v2',
  ACTIVITIES: 'safenex_audit_activities_v2',
  PREFERENCES: 'safenex_user_preferences_v2',
};

export const DEFAULT_PROFILE: UserProfile = {
  id: 'local-user',
  email: '',
  name: 'Safety User',
  phone: '',
  bloodGroup: '',
  allergies: '',
  medicalNotes: '',
  emergencyInstructions: '',
  isAnonymous: true,
};

// No fake guardians. Real users add their genuine emergency contacts.
export const DEFAULT_GUARDIANS: Guardian[] = [];

// Clean initial activity log.
export const DEFAULT_ACTIVITIES: ActivityItemData[] = [
  {
    id: 'sys-init',
    title: 'SafeNex Safety Core Initialized',
    subtitle: 'Cryptographic security & Supabase cloud sync ready',
    timestamp: 'System Boot',
    status: 'Active',
    type: 'security',
  },
];

export const DEFAULT_PREFERENCES: SecurityPreferences = {
  shakeToSosEnabled: true,
  audioSirenEnabled: true,
  strobeLightEnabled: true,
  cameraEvidenceRecording: true,
  highAccuracyGps: true,
};

export function getStoredItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (e) {
    console.warn(`Error reading localStorage for key ${key}:`, e);
    return defaultValue;
  }
}

export function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error setting localStorage for key ${key}:`, e);
  }
}
