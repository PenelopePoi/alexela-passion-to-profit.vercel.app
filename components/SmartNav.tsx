import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp, Rocket, Phone, DollarSign, MessageSquare, X, Save, Download, PlusCircle } from 'lucide-react';

type View = 'landing' | 'intake' | 'dashboard' | 'consult' | 'chat' | 'shuffle';

interface SmartNavProps {
  currentView: View;
  onNavigate: (view: View) => void;
  scrollY: number;
  hasInteractedSinceAutoNav: boolean;
  onAutoNavFired: () => void;
}

interface Suggestion {
  label: string;
  icon: React.ReactNode;
  action: () => void;
}

interface PendingAutoNav {
  label: string;
  action: () => void;
  key: string;
}

export default function SmartNav({ currentView, onNavigate, scrollY, hasInteractedSinceAutoNav, onAutoNavFired }: SmartNavProps) {
  const [isScrolling, setIsScrolling] = useState(false);
  const [pendingAutoNav, setPendingAutoNav] = useState<PendingAutoNav | null>(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const lastAutoNavRef = useRef<string | null>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const autoNavTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const cancelTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const landingTimeRef = useRef(Date.now());

  // Reset landing timer when view changes
  useEffect(() => {
    if (currentView === 'landing') landingTimeRef.current = Date.now();
  }, [currentView]);

  // Detect mobile keyboard via viewport height
  useEffect(() => {
    const threshold = window.innerHeight * 0.75;
    const onResize = () => setKeyboardOpen(window.visualViewport ? window.visualViewport.height < threshold : false);
    window.visualViewport?.addEventListener('resize', onResize);
    return () => window.visualViewport?.removeEventListener('resize', onResize);
  }, []);

  // Scroll idle detection
  const prevScrollY = useRef(scrollY);
  useEffect(() => {
    if (scrollY !== prevScrollY.current) {
      setIsScrolling(true);
      clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => setIsScrolling(false), 500);
      prevScrollY.current = scrollY;
    }
  }, [scrollY]);

  // Predictive auto-nav engine
  useEffect(() => {
    if (currentView !== 'landing') return;
    autoNavTimerRef.current = setTimeout(() => {
      const elapsed = Date.now() - landingTimeRef.current;
      if (elapsed > 45000 && scrollY > 2000 && hasInteractedSinceAutoNav && lastAutoNavRef.current !== 'scroll-cta') {
        triggerAutoNav({ label: 'pricing', action: () => window.scrollTo({ top: 4000, behavior: 'smooth' }), key: 'scroll-cta' });
      }
    }, 5000);
    return () => clearTimeout(autoNavTimerRef.current);
  }, [currentView, scrollY, hasInteractedSinceAutoNav]);

  const triggerAutoNav = useCallback((nav: PendingAutoNav) => {
    if (lastAutoNavRef.current === nav.key || !hasInteractedSinceAutoNav) return;
    setPendingAutoNav(nav);
    cancelTimerRef.current = setTimeout(() => {
      nav.action();
      lastAutoNavRef.current = nav.key;
      onAutoNavFired();
      setPendingAutoNav(null);
    }, 2000);
  }, [hasInteractedSinceAutoNav, onAutoNavFired]);

  const cancelAutoNav = useCallback(() => {
    clearTimeout(cancelTimerRef.current);
    setPendingAutoNav(null);
  }, []);

  // Cleanup
  useEffect(() => () => {
    clearTimeout(scrollTimerRef.current);
    clearTimeout(autoNavTimerRef.current);
    clearTimeout(cancelTimerRef.current);
  }, []);

  // Bucket scrollY to reduce re-computation frequency
  const scrollBucket = useMemo(() => {
    if (scrollY <= 600) return 'top';
    if (scrollY <= 2000) return 'mid';
    if (scrollY <= 4000) return 'lower';
    return 'bottom';
  }, [scrollY]);

  // Determine suggestions based on context — memoized
  const suggestions = useMemo((): Suggestion[] => {
    if (currentView === 'consult') return [];
    if (currentView === 'intake') return [
      { label: 'Save Progress', icon: <Save size={14} />, action: () => {} },
      { label: 'Need Help? Call Us', icon: <Phone size={14} />, action: () => window.open('tel:+13213759685') },
    ];
    if (currentView === 'dashboard') return [
      { label: 'New Project', icon: <PlusCircle size={14} />, action: () => {} },
      { label: 'Save', icon: <Save size={14} />, action: () => {} },
      { label: 'Export', icon: <Download size={14} />, action: () => {} },
    ];
    // Landing page — scroll-dependent
    if (scrollBucket === 'top') return [];
    if (scrollBucket === 'bottom') return [
      { label: 'Back to Top', icon: <ArrowUp size={14} />, action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
      { label: 'Start Now', icon: <Rocket size={14} />, action: () => onNavigate('consult') },
    ];
    if (scrollBucket === 'lower') return [
      { label: 'Start Your Brand', icon: <Rocket size={14} />, action: () => onNavigate('consult') },
      { label: 'Free Consultation', icon: <MessageSquare size={14} />, action: () => onNavigate('consult') },
      { label: 'Call Now', icon: <Phone size={14} />, action: () => window.open('tel:+13213759685') },
    ];
    return [
      { label: 'Start Brand Quiz', icon: <Rocket size={14} />, action: () => onNavigate('intake') },
      { label: 'See Pricing', icon: <DollarSign size={14} />, action: () => window.scrollTo({ top: 2000, behavior: 'smooth' }) },
      { label: 'Call Now', icon: <Phone size={14} />, action: () => window.open('tel:+13213759685') },
    ];
  }, [currentView, scrollBucket, onNavigate]);
  const visible = suggestions.length > 0 && !isScrolling && !keyboardOpen;

  return (
    <>
      {/* Auto-nav cancel toast */}
      <AnimatePresence>
        {pendingAutoNav && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-5 py-3 rounded-2xl bg-black/80 backdrop-blur-xl text-white text-sm shadow-2xl border border-white/10"
          >
            <span>Taking you to {pendingAutoNav.label}...</span>
            <button onClick={cancelAutoNav} className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 transition-colors text-xs font-medium">
              <X size={12} /> Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestion pills */}
      <AnimatePresence>
        {visible && (
          <motion.nav
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 hidden md:flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 backdrop-blur-2xl border border-white/15 shadow-2xl"
          >
            {suggestions.map((s) => (
              <motion.button
                key={s.label}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={s.action}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors whitespace-nowrap"
              >
                {s.icon}
                {s.label}
              </motion.button>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
