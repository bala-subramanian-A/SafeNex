import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, RefreshCw, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';
import { LocationState } from '../types';

interface LiveMapProps {
  location: LocationState;
  onRetry: () => void;
  isEmergency?: boolean;
}

export const LiveMap: React.FC<LiveMapProps> = ({
  location,
  onRetry,
  isEmergency = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  const hasCoords = location.latitude !== null && location.longitude !== null;
  const lat = location.latitude ?? 0;
  const lng = location.longitude ?? 0;

  useEffect(() => {
    if (!hasCoords || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 16,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Custom pulsing emerald or red marker
      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full ${
              isEmergency ? 'bg-[#FF304F] opacity-75' : 'bg-[#00E6A0] opacity-60'
            }"></span>
            <span class="relative inline-flex rounded-full h-5 w-5 ${
              isEmergency ? 'bg-[#FF304F] ring-4 ring-[#FF304F]/40' : 'bg-[#00E6A0] ring-4 ring-[#00E6A0]/40'
            } shadow-lg shadow-black"></span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
      markerRef.current = marker;

      if (location.accuracy) {
        const circle = L.circle([lat, lng], {
          radius: location.accuracy,
          color: isEmergency ? '#FF304F' : '#00E6A0',
          fillColor: isEmergency ? '#FF304F' : '#00E6A0',
          fillOpacity: 0.12,
          weight: 1,
        }).addTo(map);
        circleRef.current = circle;
      }

      mapInstanceRef.current = map;
    } else {
      const map = mapInstanceRef.current;
      map.setView([lat, lng], map.getZoom(), { animate: true });

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }

      if (circleRef.current && location.accuracy) {
        circleRef.current.setLatLng([lat, lng]);
        circleRef.current.setRadius(location.accuracy);
        circleRef.current.setStyle({
          color: isEmergency ? '#FF304F' : '#00E6A0',
          fillColor: isEmergency ? '#FF304F' : '#00E6A0',
        });
      }
    }
  }, [hasCoords, lat, lng, isEmergency, location.accuracy]);

  const handleCenter = () => {
    if (mapInstanceRef.current && hasCoords) {
      mapInstanceRef.current.setView([lat, lng], 16, { animate: true });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[320px] rounded-3xl overflow-hidden border border-[#24434A] bg-[#0B151D] flex flex-col shadow-card">
      {hasCoords ? (
        <>
          {/* Top Controls Overlay */}
          <div className="absolute top-3 left-3 right-3 z-[400] flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 pointer-events-auto">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#101F29]/90 backdrop-blur-md border border-[#24434A] text-xs font-semibold shadow-md">
                <span className="w-2 h-2 rounded-full bg-[#00E6A0] animate-pulse"></span>
                <span className="text-[#F4FAFA]">Satellite Fix</span>
                {location.accuracy && (
                  <span className="text-[#A2B5BF] border-l border-[#24434A] pl-2 font-mono">
                    ±{location.accuracy}m
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                onClick={handleCenter}
                title="Center on me"
                className="p-2 rounded-xl bg-[#101F29]/90 backdrop-blur-md border border-[#24434A] text-[#A2B5BF] hover:text-[#00E6A0] hover:border-[#00E6A0]/40 transition shadow-md"
              >
                <Navigation className="w-4 h-4" />
              </button>
              <button
                onClick={onRetry}
                title="Refresh GPS"
                className="p-2 rounded-xl bg-[#101F29]/90 backdrop-blur-md border border-[#24434A] text-[#A2B5BF] hover:text-[#35DDF2] hover:border-[#35DDF2]/40 transition shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Leaflet Canvas */}
          <div ref={mapContainerRef} className="flex-1 w-full h-full" />

          {/* Bottom Telemetry Bar */}
          <div className="p-3 bg-[#101F29]/95 backdrop-blur-md border-t border-[#24434A] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#A2B5BF] truncate">
              <MapPin className="w-3.5 h-3.5 text-[#00E6A0] flex-shrink-0" />
              <span className="truncate text-[#F4FAFA] font-medium">
                {location.address || `${lat.toFixed(5)}°, ${lng.toFixed(5)}°`}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[#708792] font-mono text-[11px] flex-shrink-0">
              <span>{lat.toFixed(5)}°N</span>
              <span>{lng.toFixed(5)}°E</span>
              <span className="flex items-center gap-1 text-[#00E6A0]">
                <ShieldCheck className="w-3 h-3" /> Live
              </span>
            </div>
          </div>
        </>
      ) : (
        /* Honest Non-Simulated GPS State View */
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          {location.permissionStatus === 'denied' ? (
            <div className="flex flex-col items-center max-w-sm">
              <div className="p-3 rounded-2xl bg-[#FF304F]/15 text-[#FF304F] border border-[#FF304F]/30 mb-3">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-[#F4FAFA] mb-1">
                Location Permission Blocked
              </h4>
              <p className="text-xs text-[#A2B5BF] leading-relaxed mb-4">
                SafeNex requires your browser's location permission to broadcast accurate coordinates to guardians during emergencies.
              </p>
              <button
                onClick={onRetry}
                className="py-2.5 px-5 rounded-xl btn-emerald-gradient text-xs font-bold shadow-md cursor-pointer flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Request Location Permission</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center max-w-sm">
              <Loader2 className="w-8 h-8 text-[#00E6A0] animate-spin mb-3" />
              <h4 className="text-sm font-bold text-[#F4FAFA] mb-1">
                Acquiring GPS Telemetry
              </h4>
              <p className="text-xs text-[#A2B5BF] leading-relaxed mb-4">
                Connecting to device satellite positioning...
              </p>
              <button
                onClick={onRetry}
                className="py-2 px-4 rounded-xl bg-[#142B35] hover:bg-[#1A3644] border border-[#24434A] text-xs font-semibold text-[#A2B5BF] hover:text-white transition"
              >
                Refresh GPS Scanner
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
