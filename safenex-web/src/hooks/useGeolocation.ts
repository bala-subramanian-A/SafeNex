import { useState, useEffect, useCallback, useRef } from 'react';
import { LocationState } from '../types';

export function useGeolocation() {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null,
    permissionStatus: 'loading',
    address: 'Initializing GPS telemetry...',
    error: null,
  });

  const watchIdRef = useRef<number | null>(null);

  const fetchReverseGeocode = useCallback(async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.display_name) {
          const parts = data.display_name.split(',');
          const shortAddress = parts.slice(0, 3).join(',').trim();
          setLocation((prev) => ({
            ...prev,
            address: shortAddress || data.display_name,
          }));
          return;
        }
      }
    } catch {
      // Offline or network error
    }

    setLocation((prev) => ({
      ...prev,
      address: `Lat ${lat.toFixed(5)}°, Lng ${lon.toFixed(5)}°`,
    }));
  }, []);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        latitude: null,
        longitude: null,
        permissionStatus: 'unavailable',
        error: 'Geolocation is not supported by your browser.',
        address: 'GPS hardware unavailable on this device',
      }));
      return;
    }

    setLocation((prev) => ({
      ...prev,
      permissionStatus: 'loading',
      error: null,
      address: 'Acquiring satellite GPS lock...',
    }));

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const acc = Math.round(position.coords.accuracy * 10) / 10;

        setLocation((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          accuracy: acc,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
          permissionStatus: 'granted',
          error: null,
        }));

        fetchReverseGeocode(lat, lng);
      },
      (err) => {
        let status: 'denied' | 'unavailable' = 'unavailable';
        let userMessage = 'Location currently unavailable. Click Retry.';

        if (err.code === 1) { // PERMISSION_DENIED
          status = 'denied';
          userMessage = 'Location permission blocked. Enable location in your browser settings to track live GPS.';
        } else if (err.code === 2) { // POSITION_UNAVAILABLE
          status = 'unavailable';
          userMessage = 'GPS signal lost or unavailable.';
        } else if (err.code === 3) { // TIMEOUT
          status = 'unavailable';
          userMessage = 'GPS satellite acquisition timed out. Retrying...';
        }

        setLocation((prev) => ({
          ...prev,
          latitude: null,
          longitude: null,
          accuracy: null,
          permissionStatus: status,
          error: err.message,
          address: userMessage,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      }
    );
  }, [fetchReverseGeocode]);

  useEffect(() => {
    startWatching();
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [startWatching]);

  return {
    ...location,
    retry: startWatching,
  };
}
