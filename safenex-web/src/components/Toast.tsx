import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const iconMap = {
          success: <CheckCircle2 className="w-5 h-5 text-[#A5E8B4] shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0" />,
          info: <Info className="w-5 h-5 text-[#85B99A] shrink-0" />,
        };

        const borderMap = {
          success: 'border-[#A5E8B4]/40 bg-[#14271D]/95 text-[#F1F6ED]',
          error: 'border-rose-500/40 bg-[#1C1417]/95 text-[#F1F6ED]',
          warning: 'border-amber-500/40 bg-[#1C1A14]/95 text-[#F1F6ED]',
          info: 'border-[#214332] bg-[#14271D]/95 text-[#F1F6ED]',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between p-3.5 rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${borderMap[toast.type]}`}
          >
            <div className="flex items-start space-x-3">
              {iconMap[toast.type]}
              <div>
                <p className="text-sm font-bold leading-tight">{toast.title}</p>
                {toast.message && (
                  <p className="text-xs text-[#A1B1A3] mt-0.5 leading-relaxed">{toast.message}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[#A1B1A3] hover:text-[#F1F6ED] p-1 ml-2 transition-colors rounded-lg hover:bg-[#214332]/50"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

