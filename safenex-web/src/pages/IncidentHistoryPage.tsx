import React, { useState, useEffect } from 'react';
import { History, ShieldAlert, CheckCircle2, MapPin, RefreshCw, ExternalLink, Calendar, Video, Volume2 } from 'lucide-react';
import { EmergencyEvent } from '../types';
import { supabaseService } from '../services/supabaseService';

export const IncidentHistoryPage: React.FC = () => {
  const [incidents, setIncidents] = useState<EmergencyEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'ACTIVE' | 'RESOLVED'>('all');

  const loadIncidents = async () => {
    setIsLoading(true);
    try {
      const data = await supabaseService.fetchIncidents();
      setIncidents(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const filteredIncidents = incidents.filter((inc) => {
    if (filter === 'all') return true;
    return inc.status === filter;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl glass-panel border border-[#24434A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#35DDF2]/15 text-[#35DDF2]">
              <History className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-[#35DDF2] uppercase tracking-wider">
              POSTGRESQL AUDIT ARCHIVE
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#F4FAFA]">Incident History & Blackbox Evidence</h2>
          <p className="text-xs text-[#A2B5BF] mt-1">
            Cryptographically timestamped emergency events and media attachments from Supabase <code className="text-[#35DDF2] font-mono">emergency_events</code>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#0B151D] p-1 rounded-2xl border border-[#24434A]">
            {(['all', 'ACTIVE', 'RESOLVED'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  filter === f
                    ? 'bg-[#142B35] text-[#00E6A0] border border-[#00E6A0]/30 shadow-sm'
                    : 'text-[#A2B5BF] hover:text-white'
                }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={loadIncidents}
            disabled={isLoading}
            className="py-2.5 px-4 rounded-2xl bg-[#142B35] hover:bg-[#1A3644] border border-[#24434A] text-xs font-semibold text-[#F4FAFA] flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-[#00E6A0] ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Incidents List */}
      <div className="glass-panel rounded-3xl border border-[#24434A] overflow-hidden">
        {filteredIncidents.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <CheckCircle2 className="w-12 h-12 text-[#00E6A0] mb-3" />
            <h4 className="text-base font-bold text-[#F4FAFA]">No Incidents Recorded</h4>
            <p className="text-xs text-[#A2B5BF] max-w-sm mt-1">
              Your security timeline is clean. Real incidents dispatched through SOS will be archived here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#24434A]/60">
            {filteredIncidents.map((inc) => (
              <div
                key={inc.id}
                className="p-5 sm:p-6 hover:bg-[#142B35]/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl border flex-shrink-0 mt-0.5 ${
                    inc.status === 'ACTIVE'
                      ? 'bg-[#FF304F]/15 border-[#FF304F] text-[#FF304F] animate-pulse'
                      : 'bg-[#00E6A0]/10 border-[#00E6A0]/30 text-[#00E6A0]'
                  }`}>
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-[#F4FAFA]">
                        {inc.trigger_source || 'Emergency SOS Alert'}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                        inc.status === 'ACTIVE'
                          ? 'bg-[#FF304F]/20 text-[#FF304F] border-[#FF304F]/40'
                          : 'bg-[#00E6A0]/15 text-[#00E6A0] border-[#00E6A0]/30'
                      }`}>
                        {inc.status}
                      </span>
                      <span className="text-[10px] font-mono text-[#708792]">
                        {inc.device_name || 'SAFENEX-CLIENT'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#A2B5BF]">
                      <MapPin className="w-3.5 h-3.5 text-[#00E6A0] flex-shrink-0" />
                      <span>{inc.address || (inc.latitude ? `Lat ${inc.latitude.toFixed(5)}, Lng ${inc.longitude?.toFixed(5)}` : 'Position Pending')}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-[#708792] font-mono mt-1.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(inc.created_at).toLocaleString()}
                      </span>
                      <span>Ref: {inc.id.slice(0, 8)}...</span>
                      {inc.resolved_at && (
                        <span className="text-[#00E6A0]">
                          Resolved: {new Date(inc.resolved_at).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Evidence & Map Links */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {inc.video_url && (
                    <a
                      href={inc.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl bg-[#142B35] hover:bg-[#1A3644] border border-[#24434A] text-xs font-semibold text-[#35DDF2] flex items-center gap-1.5 transition"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Evidence Video</span>
                    </a>
                  )}

                  {inc.audio_url && (
                    <a
                      href={inc.audio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl bg-[#142B35] hover:bg-[#1A3644] border border-[#24434A] text-xs font-semibold text-[#78FFD0] flex items-center gap-1.5 transition"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Evidence Audio</span>
                    </a>
                  )}

                  {(inc.maps_url || (inc.latitude && inc.longitude)) && (
                    <a
                      href={inc.maps_url || `https://maps.google.com/?q=${inc.latitude},${inc.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 px-3 rounded-xl bg-[#101F29] hover:bg-[#142B35] border border-[#24434A] text-xs font-semibold text-[#A2B5BF] hover:text-[#00E6A0] flex items-center gap-1.5 transition"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>View Map</span>
                      <ExternalLink className="w-3 h-3 text-[#708792]" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
