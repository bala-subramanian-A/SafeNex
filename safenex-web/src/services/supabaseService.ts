import { supabase } from '../lib/supabaseClient';
import { 
  TABLE_EMERGENCY_EVENTS, 
  TABLE_GPS_BREADCRUMBS, 
  STORAGE_BUCKET_VIDEOS,
  STORAGE_BUCKET_AUDIO 
} from '../lib/constants';
import { EmergencyEvent, SupabaseHealth, LocationState, UserProfile } from '../types';

export const supabaseService = {
  /**
   * Pings the live Supabase PostgreSQL backend and measures real round-trip network latency.
   */
  async checkHealth(): Promise<SupabaseHealth> {
    const startTime = performance.now();
    try {
      const { error } = await supabase
        .from(TABLE_EMERGENCY_EVENTS)
        .select('id')
        .limit(1);

      const latencyMs = Math.round(performance.now() - startTime);

      if (!error) {
        return {
          status: 'online',
          latencyMs,
          lastChecked: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };
      } else {
        console.warn('Supabase ping returned error:', error.message);
        return {
          status: 'offline',
          latencyMs,
          lastChecked: new Date().toLocaleTimeString(),
        };
      }
    } catch (e) {
      console.warn('Supabase health check connection error:', e);
      return {
        status: 'offline',
        latencyMs: 0,
        lastChecked: new Date().toLocaleTimeString(),
      };
    }
  },

  /**
   * Dispatches a real emergency incident event to the PostgreSQL `emergency_events` table.
   */
  async createEmergencyEvent(
    source: string, 
    loc: LocationState, 
    deviceName = 'SAFENEX Web Client',
    guardiansCount = 0
  ): Promise<string> {
    const mapsUrl = (loc.latitude && loc.longitude) 
      ? `https://maps.google.com/?q=${loc.latitude},${loc.longitude}` 
      : null;

    const record = {
      device_name: deviceName,
      trigger_source: source,
      latitude: loc.latitude,
      longitude: loc.longitude,
      accuracy: loc.accuracy,
      address: loc.address || (loc.latitude ? `Lat ${loc.latitude.toFixed(5)}, Lng ${loc.longitude?.toFixed(5)}` : 'Position Pending'),
      maps_url: mapsUrl,
      status: 'ACTIVE',
      guardians_notified: guardiansCount,
    };

    try {
      const { data, error } = await supabase
        .from(TABLE_EMERGENCY_EVENTS)
        .insert([record])
        .select('id')
        .single();

      if (!error && data?.id) {
        return data.id;
      }
      if (error) {
        console.warn('Supabase event insertion error:', error.message);
      }
    } catch (e) {
      console.warn('Supabase offline or unreachable:', e);
    }

    // Fallback: Generate real client UUID and cache locally if offline
    const fallbackId = crypto.randomUUID();
    const cachedEvents = JSON.parse(localStorage.getItem('safenex_cached_events') || '[]');
    cachedEvents.unshift({
      id: fallbackId,
      created_at: new Date().toISOString(),
      ...record,
      resolved_at: null,
      audio_url: null,
      video_url: null,
      photo_front_url: null,
      photo_back_url: null,
    });
    localStorage.setItem('safenex_cached_events', JSON.stringify(cachedEvents));
    return fallbackId;
  },

  /**
   * Continuously streams high-accuracy GPS breadcrumbs into `emergency_gps_breadcrumbs`.
   */
  async streamBreadcrumb(eventId: string, loc: LocationState): Promise<void> {
    if (!loc.latitude || !loc.longitude) return;

    try {
      const { error } = await supabase
        .from(TABLE_GPS_BREADCRUMBS)
        .insert([
          {
            event_id: eventId,
            latitude: loc.latitude,
            longitude: loc.longitude,
            accuracy: loc.accuracy || 5,
          }
        ]);

      if (error) {
        console.warn('Breadcrumb insertion error:', error.message);
      }
    } catch (e) {
      console.warn('Failed streaming breadcrumb to cloud:', e);
    }
  },

  /**
   * Updates an emergency event status to 'RESOLVED' once the cryptographic PIN is verified.
   */
  async resolveEmergencyEvent(eventId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(TABLE_EMERGENCY_EVENTS)
        .update({
          status: 'RESOLVED',
          resolved_at: new Date().toISOString(),
        })
        .eq('id', eventId);

      if (error) {
        console.warn('Error resolving event in cloud:', error.message);
      }
    } catch (e) {
      console.warn('Offline resolution error:', e);
    }

    // Also update local cache
    const cachedEvents = JSON.parse(localStorage.getItem('safenex_cached_events') || '[]');
    const updated = cachedEvents.map((ev: any) =>
      ev.id === eventId ? { ...ev, status: 'RESOLVED', resolved_at: new Date().toISOString() } : ev
    );
    localStorage.setItem('safenex_cached_events', JSON.stringify(updated));
  },

  /**
   * Uploads real audio or video evidence to Supabase Storage and attaches URL to the event.
   */
  async uploadEvidence(
    eventId: string, 
    blob: Blob, 
    fileName: string, 
    type: 'video' | 'audio' = 'video'
  ): Promise<string | null> {
    const bucket = type === 'video' ? STORAGE_BUCKET_VIDEOS : STORAGE_BUCKET_AUDIO;
    const contentType = type === 'video' ? 'video/webm' : 'audio/webm';

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, blob, {
          contentType,
          upsert: true,
        });

      if (!error && data?.path) {
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
        const publicUrl = urlData.publicUrl;

        // Attach evidence URL to the emergency event record in Supabase
        const updateField = type === 'video' ? { video_url: publicUrl } : { audio_url: publicUrl };
        await supabase
          .from(TABLE_EMERGENCY_EVENTS)
          .update(updateField)
          .eq('id', eventId);

        return publicUrl;
      } else if (error) {
        console.warn(`Supabase Storage upload to ${bucket} error:`, error.message);
      }
    } catch (e) {
      console.warn('Evidence upload failed:', e);
    }
    return null;
  },

  /**
   * Fetches real incident history from Supabase `emergency_events` table.
   * If database table is empty, returns an empty array. No fake demo data!
   */
  async fetchIncidents(): Promise<EmergencyEvent[]> {
    try {
      const { data, error } = await supabase
        .from(TABLE_EMERGENCY_EVENTS)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(25);

      if (!error && Array.isArray(data)) {
        return data as EmergencyEvent[];
      }
      if (error) {
        console.warn('Error fetching cloud incidents:', error.message);
      }
    } catch (e) {
      console.warn('Could not query Supabase incidents:', e);
    }

    // Fallback to locally cached incidents if cloud is offline
    const local = JSON.parse(localStorage.getItem('safenex_cached_events') || '[]');
    return local;
  },

  /**
   * Supabase Authentication Integration
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      const user = session.user;
      return {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Authenticated User',
        phone: user.phone || user.user_metadata?.phone || '',
        bloodGroup: user.user_metadata?.blood_group || '',
        allergies: user.user_metadata?.allergies || '',
        medicalNotes: user.user_metadata?.medical_notes || '',
        emergencyInstructions: user.user_metadata?.emergency_instructions || '',
        isAnonymous: false,
      };
    } catch (e) {
      console.warn('Auth getSession error:', e);
      return null;
    }
  },

  async signUp(email: string, pass: string, fullName: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      return { error: error ? error.message : null };
    } catch (e: any) {
      return { error: e.message || 'Registration failed' };
    }
  },

  async signIn(email: string, pass: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      return { error: error ? error.message : null };
    } catch (e: any) {
      return { error: e.message || 'Login failed' };
    }
  },

  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out error:', e);
    }
  },

  async updateUserMetadata(meta: Partial<UserProfile>): Promise<boolean> {
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: meta.name,
          phone: meta.phone,
          blood_group: meta.bloodGroup,
          allergies: meta.allergies,
          medical_notes: meta.medicalNotes,
          emergency_instructions: meta.emergencyInstructions,
        }
      });
      return !error;
    } catch (e) {
      console.warn('Update user metadata error:', e);
      return false;
    }
  }
};
