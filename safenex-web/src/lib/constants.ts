export const SUPABASE_URL: string =
  import.meta.env.VITE_SUPABASE_URL || "https://vrxyxwzvcinytsorauau.supabase.co";

export const SUPABASE_KEY: string =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyeHl4d3p2Y2lueXRzb3JhdWF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5ODE4MDMsImV4cCI6MjEwMzU1NzgwM30.r0CbtU3H1Spx2CNQm5P3HWvhuzJApQG_rvFotq28f7o";

export const STORAGE_BUCKET_AUDIO = "emergency-audio";
export const STORAGE_BUCKET_PHOTOS = "emergency-photos";
export const STORAGE_BUCKET_VIDEOS = "emergency-videos";

export const APP_PUBLIC_URL: string =
  import.meta.env.VITE_APP_PUBLIC_URL || "https://fancy-syrniki-12abab.netlify.app";

// Web Bluetooth ESP32 Service and Characteristics
export const BLE_SERVICE_UUID = "7b7a1000-8f2a-4c5e-9b11-123456789001";
export const BLE_SOS_CHAR_UUID = "7b7a1001-8f2a-4c5e-9b11-123456789001";
export const BLE_STATUS_CHAR_UUID = "7b7a1002-8f2a-4c5e-9b11-123456789001";

// Database Tables
export const TABLE_EMERGENCY_EVENTS = "emergency_events";
export const TABLE_GPS_BREADCRUMBS = "emergency_gps_breadcrumbs";
