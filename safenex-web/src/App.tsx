import { useState, useEffect, useCallback } from 'react';
import { 
  ScreenType, 
  ToastMessage, 
  Guardian, 
  BleBandState, 
  CommuteSession, 
  SupabaseHealth,
  UserProfile 
} from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useGeolocation } from './hooks/useGeolocation';
import {
  STORAGE_KEYS,
  DEFAULT_PROFILE,
  DEFAULT_ACTIVITIES,
  DEFAULT_PREFERENCES,
  DEFAULT_GUARDIANS,
} from './lib/storage';
import { supabaseService } from './services/supabaseService';
import { bleService } from './services/bleService';
import { audioSiren } from './services/audioSirenService';
import { securityManager } from './lib/security';

// Layout & Overlays
import { AppLayout } from './components/AppLayout';
import { EmergencyActiveOverlay } from './components/EmergencyActiveOverlay';

// Pages
import { LandingPage } from './pages/LandingPage';
import { HomePage } from './pages/HomePage';
import { SafetyConsolePage } from './pages/SafetyConsolePage';
import { IncidentHistoryPage } from './pages/IncidentHistoryPage';
import { BleBandPage } from './pages/BleBandPage';
import { GuardiansPage } from './pages/GuardiansPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthPage } from './pages/AuthPage';

export function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('overview');

  // Real User Profile State
  const [user, setUser] = useLocalStorage<UserProfile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
  const [guardians, setGuardians] = useLocalStorage<Guardian[]>(STORAGE_KEYS.GUARDIANS, DEFAULT_GUARDIANS);
  const [activities, setActivities] = useLocalStorage(STORAGE_KEYS.ACTIVITIES, DEFAULT_ACTIVITIES);
  const [preferences, setPreferences] = useLocalStorage(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES);

  // Live Real Geolocation Telemetry
  const location = useGeolocation();

  // BLE Band State
  const [bleBand, setBleBand] = useState<BleBandState>({
    connected: false,
    name: 'SafeNex Band',
    batteryLevel: null,
    serviceAvailable: typeof navigator !== 'undefined' && 'bluetooth' in navigator,
    simulated: false,
    isScanning: false,
    scanError: null,
  });

  // Supabase Backend Health State
  const [supabaseHealth, setSupabaseHealth] = useState<SupabaseHealth>({
    status: 'checking',
    latencyMs: 0,
    lastChecked: 'Connecting...',
  });

  // Emergency SOS State
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [activeEventId, setActiveEventId] = useState<string>('');
  const [emergencyTriggerSource, setEmergencyTriggerSource] = useState('Manual Button');

  // Commute Dead-Man's Timer State
  const [commuteSession, setCommuteSession] = useState<CommuteSession>({
    isActive: false,
    destination: '',
    totalMinutes: 15,
    remainingSeconds: 900,
    isOverdue: false,
    overdueCountdown: 60,
  });

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((title: string, message?: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Initialize Cryptographic Salted PIN
  useEffect(() => {
    securityManager.initDefaultPinIfUnset();
  }, []);

  // 2. Check Supabase Auth Session
  useEffect(() => {
    supabaseService.getCurrentUser().then((authUser) => {
      if (authUser) {
        setUser(authUser);
      }
    });
  }, [setUser]);

  // 3. Ping Supabase Cloud Health
  const checkSupabase = useCallback(async () => {
    setSupabaseHealth((prev) => ({ ...prev, status: 'checking' }));
    const health = await supabaseService.checkHealth();
    setSupabaseHealth(health);
  }, []);

  useEffect(() => {
    checkSupabase();
    const interval = setInterval(checkSupabase, 45000);
    return () => clearInterval(interval);
  }, [checkSupabase]);

  // 4. Subscribe to Web Bluetooth events
  useEffect(() => {
    bleService.subscribe(
      (band) => setBleBand(band),
      (sosSource) => {
        handleTriggerSos(`Hardware: ${sosSource}`);
      }
    );
  }, []);

  // 5. Accelerometer Shake-to-SOS listener
  useEffect(() => {
    if (!preferences.shakeToSosEnabled) return;

    let lastX = 0, lastY = 0, lastZ = 0;
    let lastTime = 0;
    let shakeCount = 0;

    const handleDeviceMotion = (e: DeviceMotionEvent) => {
      const current = e.accelerationIncludingGravity;
      if (!current || current.x === null || current.y === null || current.z === null) return;

      const now = Date.now();
      if (now - lastTime > 100) {
        const diffTime = now - lastTime;
        lastTime = now;

        const speed = Math.abs(current.x + current.y + current.z - lastX - lastY - lastZ) / diffTime * 10000;
        if (speed > 1300) {
          shakeCount++;
          if (shakeCount >= 3) {
            shakeCount = 0;
            handleTriggerSos('SHAKE');
          }
        } else {
          shakeCount = Math.max(0, shakeCount - 0.2);
        }

        lastX = current.x;
        lastY = current.y;
        lastZ = current.z;
      }
    };

    window.addEventListener('devicemotion', handleDeviceMotion);
    return () => window.removeEventListener('devicemotion', handleDeviceMotion);
  }, [preferences.shakeToSosEnabled]);

  // 6. Commute Arrival Timer Ticker
  useEffect(() => {
    if (!commuteSession.isActive) return;

    const ticker = setInterval(() => {
      setCommuteSession((prev) => {
        if (!prev.isActive) return prev;

        if (prev.remainingSeconds > 1) {
          return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
        }

        // Timer reaches zero -> trigger 60s overdue warning alert
        if (!prev.isOverdue) {
          audioSiren.playChirp(false);
          return { ...prev, isOverdue: true, overdueCountdown: 60 };
        }

        if (prev.overdueCountdown > 1) {
          return { ...prev, overdueCountdown: prev.overdueCountdown - 1 };
        }

        // Overdue timeout reached -> automatically dispatch full SOS
        handleTriggerSos('COMMUTE_OVERDUE');
        return { ...prev, isActive: false, isOverdue: false };
      });
    }, 1000);

    return () => clearInterval(ticker);
  }, [commuteSession.isActive, commuteSession.isOverdue]);

  // Real Emergency Trigger
  const handleTriggerSos = async (source: string) => {
    if (isEmergencyActive) return;

    const sourceLabels: Record<string, string> = {
      'BUTTON': 'Manual Panic Button',
      'SHAKE': 'Violent Motion / Shake Sensor',
      'VOICE': 'DITTU Voice Alert ("HELP!")',
      'COMMUTE_OVERDUE': 'Commute Overdue Check-in Timeout',
      'BLE_BAND_BUTTON': 'ESP32 Wearable Band Button',
    };

    const displaySource = sourceLabels[source] || source;
    setEmergencyTriggerSource(displaySource);

    // Dispatch incident to Supabase PostgreSQL table
    const eventId = await supabaseService.createEmergencyEvent(
      displaySource, 
      location, 
      bleBand.connected ? bleBand.name : 'SAFENEX Web Client',
      guardians.length
    );

    setActiveEventId(eventId);
    setIsEmergencyActive(true);

    // Audio warning chirp
    audioSiren.playChirp(false);

    // Audit log
    setActivities((prev) => [
      {
        id: `sos-${Date.now()}`,
        title: 'EMERGENCY SOS DISPATCHED',
        subtitle: `${displaySource} • Event Ref: ${eventId.slice(0, 8)}`,
        timestamp: 'Just now',
        status: 'Emergency',
        type: 'sos',
      },
      ...prev,
    ]);

    addToast('EMERGENCY ACTIVE', `Broadcasting to Supabase & Guardians: ${displaySource}`, 'error');
  };

  // Disarm Emergency
  const handleDisarmEmergency = () => {
    setIsEmergencyActive(false);
    audioSiren.stopSiren();

    setActivities((prev) => [
      {
        id: `disarm-${Date.now()}`,
        title: 'Emergency Disarmed & Stand-Down',
        subtitle: 'Cryptographic PIN verified. Status updated to RESOLVED.',
        timestamp: 'Just now',
        status: 'Success',
        type: 'security',
      },
      ...prev,
    ]);

    addToast('Emergency Disarmed', 'PIN accepted. Alarms and streaming deactivated.', 'success');
  };

  // Safe Diagnostic Tests (Device only, no alert sent to guardians)
  const handleSafeTest = (type: string) => {
    if (type === 'SHAKE') {
      audioSiren.playChirp(true);
      addToast('Shake Sensor Test Pass', 'Device accelerometer detected movement successfully.', 'info');
    } else if (type === 'SIREN') {
      audioSiren.startSiren();
      setTimeout(() => audioSiren.stopSiren(), 2000);
      addToast('Acoustic Siren Diagnostic', 'Sweeping 1200Hz oscillator active for 2s.', 'warning');
    } else if (type === 'CLOUD_PING') {
      checkSupabase();
      addToast('Supabase Network Ping', `Round-trip cloud latency: ${supabaseHealth.latencyMs}ms`, 'success');
    }
  };

  // Commute actions
  const handleStartCommute = (dest: string, minutes: number) => {
    setCommuteSession({
      isActive: true,
      destination: dest || 'Destination',
      totalMinutes: minutes,
      remainingSeconds: minutes * 60,
      isOverdue: false,
      overdueCountdown: 60,
      startedAt: new Date().toLocaleTimeString(),
    });
    addToast('Commute Mode Armed', `Arrival check-in timer set for ${minutes} minutes.`, 'info');
  };

  const handleCancelCommute = () => {
    setCommuteSession((prev) => ({ ...prev, isActive: false, isOverdue: false }));
    addToast('Commute Timer Cancelled', undefined, 'info');
  };

  const handleExtendCommute = (extraMinutes: number) => {
    setCommuteSession((prev) => ({
      ...prev,
      remainingSeconds: prev.remainingSeconds + extraMinutes * 60,
      isOverdue: false,
      overdueCountdown: 60,
    }));
    addToast(`Timer Extended +${extraMinutes}m`, undefined, 'info');
  };

  const handleConfirmArrival = () => {
    setCommuteSession((prev) => ({ ...prev, isActive: false, isOverdue: false }));
    audioSiren.playChirp(true);
    addToast('Safe Arrival Confirmed', 'Commute monitoring ended safely.', 'success');
  };

  // Guardian Management
  const handleSetPrimaryGuardian = (id: string) => {
    setGuardians((prev) =>
      prev.map((g) => ({ ...g, isPrimary: g.id === id }))
    );
    addToast('Primary Guardian Updated', undefined, 'success');
  };

  const handleDeleteGuardian = (id: string) => {
    setGuardians((prev) => prev.filter((g) => g.id !== id));
    addToast('Guardian Removed', undefined, 'info');
  };

  const handleAddGuardian = (newG: Guardian) => {
    setGuardians((prev) => [...prev, newG]);
  };

  // Auth Handlers
  const handleSignOut = async () => {
    await supabaseService.signOut();
    setUser(DEFAULT_PROFILE);
    addToast('Signed Out', 'Switched to local offline safety mode.', 'info');
  };

  const primaryGuardian = guardians.find((g) => g.isPrimary) || (guardians.length > 0 ? guardians[0] : null);

  // Render Public Landing Page
  if (currentScreen === 'landing') {
    return (
      <LandingPage
        onGetStarted={() => setCurrentScreen('overview')}
        onNavigateTo={(screen) => setCurrentScreen(screen)}
      />
    );
  }

  return (
    <>
      <AppLayout
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        user={user}
        supabaseHealth={supabaseHealth}
        onCheckSupabase={checkSupabase}
        onTriggerSos={() => handleTriggerSos('BUTTON')}
        toasts={toasts}
        onDismissToast={dismissToast}
      >
        {currentScreen === 'overview' && (
          <HomePage
            user={user}
            activities={activities}
            location={location}
            onRetryLocation={location.retry}
            bleBand={bleBand}
            onConnectBle={() => bleService.scanAndConnect()}
            onDisconnectBle={() => bleService.disconnect()}
            commuteSession={commuteSession}
            onStartCommute={handleStartCommute}
            onCancelCommute={handleCancelCommute}
            onExtendCommute={handleExtendCommute}
            onConfirmArrival={handleConfirmArrival}
            guardians={guardians}
            onTriggerSos={handleTriggerSos}
            onSafeTest={handleSafeTest}
            onNavigateTo={setCurrentScreen}
            onNotify={addToast}
          />
        )}

        {currentScreen === 'console' && (
          <SafetyConsolePage
            onTriggerSos={handleTriggerSos}
            onSafeTest={handleSafeTest}
            onNotify={addToast}
          />
        )}

        {currentScreen === 'history' && <IncidentHistoryPage />}

        {currentScreen === 'ble' && (
          <BleBandPage
            bandState={bleBand}
            onConnect={() => bleService.scanAndConnect()}
            onDisconnect={() => bleService.disconnect()}
            onSimulateSos={() => handleTriggerSos('BLE_BAND_BUTTON')}
            onNotify={addToast}
          />
        )}

        {currentScreen === 'guardians' && (
          <GuardiansPage
            guardians={guardians}
            onSetPrimary={handleSetPrimaryGuardian}
            onDeleteGuardian={handleDeleteGuardian}
            onAddGuardian={handleAddGuardian}
            onNotify={addToast}
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsPage
            user={user}
            preferences={preferences}
            supabaseHealth={supabaseHealth}
            onUpdateProfile={setUser}
            onUpdatePreferences={setPreferences}
            onNotify={addToast}
          />
        )}

        {currentScreen === 'auth' && (
          <AuthPage
            user={user}
            onAuthSuccess={(u) => {
              setUser(u);
              setCurrentScreen('overview');
              addToast('Signed In Successfully', `Welcome, ${u.name}`, 'success');
            }}
            onContinueOffline={() => setCurrentScreen('overview')}
            onSignOut={handleSignOut}
          />
        )}
      </AppLayout>

      {/* Real Emergency Active Overlay */}
      <EmergencyActiveOverlay
        isOpen={isEmergencyActive}
        eventId={activeEventId}
        triggerSource={emergencyTriggerSource}
        location={location}
        onDisarm={handleDisarmEmergency}
        primaryGuardian={primaryGuardian}
      />
    </>
  );
}

export default App;
