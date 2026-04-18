import React from 'react';
import { motion } from 'motion/react';
import { Home, Sparkles, Phone, Eye } from 'lucide-react';

interface MobileBottomNavProps {
  currentView: 'landing' | 'intake' | 'dashboard' | 'consult' | 'chat' | 'shuffle';
  onNavigate: (view: 'landing' | 'consult') => void;
  onScrollToPricing?: () => void;
  onScrollToPortfolio?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentView, onNavigate, onScrollToPricing, onScrollToPortfolio }) => {
  // Hide on consult/chat/shuffle since those have their own nav
  if (currentView === 'consult' || currentView === 'chat' || currentView === 'shuffle') {
    return null;
  }

  const items = [
    { icon: Home, label: 'Home', ariaLabel: 'Go to home page', onClick: () => onNavigate('landing') },
    { icon: Eye, label: 'Work', ariaLabel: 'View our portfolio', onClick: () => onScrollToPortfolio?.() },
    { icon: Sparkles, label: 'Quiz', ariaLabel: 'Start brand consultation quiz', onClick: () => onNavigate('consult') },
    { icon: Phone, label: 'Call', ariaLabel: 'Call (321) 375-9685', onClick: () => { window.location.href = 'tel:3213759685'; } },
  ];

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-[90] md:hidden bg-brand-black/95 backdrop-blur-xl border-t border-white/10 safe-bottom"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
    >
      <div className="flex items-center justify-around py-2.5 px-2">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            aria-label={item.ariaLabel}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-white/5 transition-all active:scale-95"
          >
            <item.icon size={20} className="text-white/60" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{item.label}</span>
          </button>
        ))}
      </div>
    </motion.nav>
  );
};

export default MobileBottomNav;
