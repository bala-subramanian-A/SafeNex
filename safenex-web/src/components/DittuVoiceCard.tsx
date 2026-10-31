import React, { useState, useRef } from 'react';
import { Mic, MicOff, Sparkles } from 'lucide-react';

interface DittuVoiceCardProps {
  onTriggerSos: (source: string) => void;
  onCallGuardian: () => void;
  onQueryLocation: () => void;
}

export const DittuVoiceCard: React.FC<DittuVoiceCardProps> = ({
  onTriggerSos,
  onCallGuardian,
  onQueryLocation,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('DITTU voice standby. Tap mic or speak "HELP!"');
  const recognitionRef = useRef<any>(null);

  const speak = (msg: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(msg);
      u.rate = 1.0;
      u.pitch = 1.0;
      window.speechSynthesis.speak(u);
    }
  };

  const handleCommand = (rawText: string) => {
    const text = rawText.toLowerCase().trim();
    setTranscript(`"${rawText}"`);

    if (text.includes('help') || text.includes('emergency') || text.includes('danger') || text.includes('save me')) {
      speak('Emergency alert detected! Activating SafeNex protocol.');
      onTriggerSos('VOICE');
    } else if (text.includes('call') || text.includes('guardian') || text.includes('contact')) {
      speak('Calling primary guardian now.');
      onCallGuardian();
    } else if (text.includes('where') || text.includes('location') || text.includes('gps')) {
      speak('GPS location is locked and streaming to your secure cloud.');
      onQueryLocation();
    } else if (text.includes('status')) {
      speak('All systems nominal. BLE Band paired, GPS locked, 24/7 AI Shield armed.');
    }
  };

  const toggleListening = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRec) {
      setTranscript('Speech recognition is not supported in this browser. Use manual buttons.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setTranscript('Voice assistant standby.');
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('Listening for "HELP!", "Call Guardian", "Where am I"...');
      };

      recognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript;
        if (event.results[last].isFinal) {
          handleCommand(text);
        } else {
          setTranscript(`Listening: "${text}"`);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e.error);
        setIsListening(false);
        setTranscript('Voice recognition paused. Click to reactivate.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Speech recognition start failed:', e);
      setIsListening(false);
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-5 border border-[#24434A] shadow-card flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className={`p-2.5 rounded-xl border ${
            isListening
              ? 'bg-[#00E6A0]/15 border-[#00E6A0] text-[#00E6A0]'
              : 'bg-[#142B35] border-[#24434A] text-[#708792]'
          }`}>
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#F4FAFA] tracking-wide">
              DITTU AI VOICE ASSISTANT
            </h4>
            <p className="text-[11px] text-[#A2B5BF]">Hands-free emergency voice trigger</p>
          </div>
        </div>

        <button
          onClick={toggleListening}
          className={`p-2.5 rounded-full border transition cursor-pointer ${
            isListening
              ? 'bg-[#FF304F] text-white border-[#FF304F] shadow-lg animate-pulse'
              : 'bg-[#142B35] text-[#A2B5BF] border-[#24434A] hover:border-[#00E6A0]/40'
          }`}
          title={isListening ? 'Stop listening' : 'Start voice recognition'}
        >
          {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>
      </div>

      {/* Waveform / Visualizer */}
      <div className="my-2 p-3 rounded-2xl bg-[#0B151D]/90 border border-[#24434A] flex flex-col items-center justify-center min-h-[64px]">
        {isListening ? (
          <div className="flex items-center gap-1.5 h-6">
            <span className="w-1 bg-[#00E6A0] rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-5" />
            <span className="w-1 bg-[#35DDF2] rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-8" />
            <span className="w-1 bg-[#78FFD0] rounded-full animate-[pulse_0.3s_ease-in-out_infinite] h-4" />
            <span className="w-1 bg-[#00E6A0] rounded-full animate-[pulse_0.5s_ease-in-out_infinite] h-7" />
            <span className="w-1 bg-[#35DDF2] rounded-full animate-[pulse_0.7s_ease-in-out_infinite] h-5" />
          </div>
        ) : (
          <p className="text-xs font-mono text-[#A2B5BF] text-center line-clamp-2">
            {transcript}
          </p>
        )}
      </div>

      {/* Trigger Pills */}
      <div className="flex items-center justify-between gap-1.5 mt-2">
        <button
          onClick={() => handleCommand('help')}
          className="flex-1 py-1.5 px-2 rounded-xl bg-[#FF304F]/10 hover:bg-[#FF304F]/20 border border-[#FF304F]/20 text-[11px] font-semibold text-[#FF304F] transition text-center"
        >
          Say "HELP!"
        </button>
        <button
          onClick={() => handleCommand('call guardian')}
          className="flex-1 py-1.5 px-2 rounded-xl bg-[#142B35] hover:bg-[#1A3644] border border-[#24434A] text-[11px] font-semibold text-[#A2B5BF] hover:text-[#00E6A0] transition text-center"
        >
          Say "Call"
        </button>
        <button
          onClick={() => handleCommand('where am i')}
          className="flex-1 py-1.5 px-2 rounded-xl bg-[#142B35] hover:bg-[#1A3644] border border-[#24434A] text-[11px] font-semibold text-[#A2B5BF] hover:text-[#35DDF2] transition text-center"
        >
          Say "Where"
        </button>
      </div>
    </div>
  );
};
