export type ScreenType = 
  | 'overview' 
  | 'console' 
  | 'history' 
  | 'ble' 
  | 'guardians' 
  | 'settings' 
  | 'auth'
  | 'landing';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  bloodGroup?: string;
  allergies?: string;
  medicalNotes?: string;
  emergencyInstructions?: string;
  isAnonymous?: boolean;
}

export interface Guardian {
  id: string;
  name: string;
  relation: string;
  phone: string;
  isPrimary: boolean;
  email?: string;
  notes?: string;
}

export interface ActivityItemData {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
  status: 'Active' | 'Success' | 'Completed' | 'Pending' | 'Warning' | 'Emergency';
  type: 'security' | 'sos' | 'ble' | 'guardian' | 'cloud';
}

export interface SecurityPreferences {
  shakeToSosEnabled: boolean;
  audioSirenEnabled: boolean;
  strobeLightEnabled: boolean;
  cameraEvidenceRecording: boolean;
  highAccuracyGps: boolean;
}

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface BleBandState {
  connected: boolean;
  name: string;
  batteryLevel: number | null;
  serviceAvailable: boolean;
  simulated: boolean;
  lastHeartbeat?: string;
  deviceId?: string;
  isScanning: boolean;
  scanError?: string | null;
}

export interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp: number | null;
  address?: string;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'loading' | 'unavailable';
  error?: string | null;
}

export interface CommuteSession {
  isActive: boolean;
  destination: string;
  totalMinutes: number;
  remainingSeconds: number;
  isOverdue: boolean;
  overdueCountdown: number; // 60s countdown before auto-SOS
  startedAt?: string;
}

export interface EmergencyEvent {
  id: string;
  created_at: string;
  device_name: string;
  trigger_source: string;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  address: string | null;
  maps_url: string | null;
  audio_url: string | null;
  photo_front_url: string | null;
  photo_back_url: string | null;
  video_url: string | null;
  status: 'ACTIVE' | 'VERIFYING' | 'RESOLVED';
  guardians_notified: number;
  resolved_at: string | null;
}

export interface SupabaseHealth {
  status: 'online' | 'offline' | 'checking';
  latencyMs: number;
  lastChecked: string;
}
