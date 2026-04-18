
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { XelaLogo } from './XelaLogo';

const STATUS_MESSAGES = [
  'Analyzing your industry...',
  'Crafting your brand voice...',
  'Designing your color palette...',
  'Building your marketing plan...',
  'Polishing the final details...',
];

interface LoadingOverlayProps {
  onCancel?: () => void;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ onCancel }) => {
  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [showCancel, setShowCancel] = useState(false);
  const rafRef = useRef<number>(0);
  const startRef = useRef(Date.now());
  const mountedRef = useRef(true);

  // Fake progress curve: fast → medium → slow → done
  const tick = useCallback(() => {
    if (!mountedRef.current) return;
    const elapsed = (Date.now() - startRef.current) / 1000; // seconds
    let next: number;
    if (elapsed < 2) {
      next = (elapsed / 2) * 30;
    } else if (elapsed < 6) {
      next = 30 + ((elapsed - 2) / 4) * 40;
    } else if (elapsed < 12) {
      next = 70 + ((elapsed - 6) / 6) * 20;
    } else {
      next = Math.min(90 + (elapsed - 12) * 0.5, 99);
    }
    setProgress(next);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [tick]);

  // Rotate status messages
  useEffect(() => {
    const iv = setInterval(() => {
      setMsgIndex((p) => (p + 1) % STATUS_MESSAGES.length);
    }, 2800);
    return () => clearInterval(iv);
  }, []);

  // Show cancel button after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowCancel(true), 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-black/60 backdrop-blur-xl transition-all duration-500">
      <div className="relative bg-white/10 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl max-w-md w-full mx-4 p-10 overflow-hidden">
        {/* Ambient blobs */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-brand-teal rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-brand-lavender rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '0.7s' }} />

        <div className="relative z-10 flex flex-col items-center">
          {/* Logo */}
          <XelaLogo className="h-8 mb-6" color="white" />

          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-white/10 mb-8 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-teal to-brand-lavender transition-[width] duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Rotating status message */}
          <div className="h-6 flex items-center justify-center mb-2 overflow-hidden">
            <p
              key={msgIndex}
              className="text-sm text-white/90 font-medium animate-fade-in-up"
            >
              {STATUS_MESSAGES[msgIndex]}
            </p>
          </div>

          {/* Percentage */}
          <p className="text-xs text-white/40 font-mono tabular-nums mb-6">
            {Math.round(progress)}%
          </p>

          {/* Footer */}
          <div className="flex items-center gap-2 text-[10px] text-white/30 font-mono uppercase tracking-widest">
            <Loader2 size={10} className="animate-spin text-brand-lavender" />
            AI Generation in Progress
          </div>

          {/* Cancel button — appears after 10s */}
          {showCancel && onCancel && (
            <button
              onClick={onCancel}
              className="mt-4 px-6 py-2 rounded-full text-xs font-bold text-white/50 hover:text-white border border-white/15 hover:border-white/30 transition-all"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const CheckMark = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);
