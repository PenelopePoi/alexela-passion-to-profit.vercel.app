import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Layers, X, DollarSign } from 'lucide-react';
import { isAlexMode, getCurrentDepth, setCurrentDepth, getQuickPriceEstimate, getDeepPriceBreakdown, ClientDepth } from '../services/alexSignal';

interface AlexSignalPanelProps {
  services?: string[];
  onDepthChange?: (depth: ClientDepth) => void;
}

export const AlexSignalPanel: React.FC<AlexSignalPanelProps> = ({ services = [], onDepthChange }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [depth, setDepth] = useState<ClientDepth>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (isAlexMode()) {
      setIsVisible(true);
      setDepth(getCurrentDepth());
    }

    // Keyboard shortcut: Cmd+Shift+A to toggle
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setIsVisible(v => !v);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleDepthChange = (newDepth: ClientDepth) => {
    setDepth(newDepth);
    setCurrentDepth(newDepth);
    onDepthChange?.(newDepth);
  };

  if (!isVisible) return null;

  const quickEstimate = getQuickPriceEstimate(services);
  const deepBreakdown = getDeepPriceBreakdown(services);
  const deepTotal = deepBreakdown.reduce((sum, item) => sum + item.price, 0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 300, opacity: 0 }}
        className="fixed right-6 top-24 z-[95] bg-brand-black/95 backdrop-blur-xl border border-brand-lavender/40 rounded-2xl shadow-2xl max-w-sm"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-lavender animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-lavender">Alex Mode</p>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setCollapsed(!collapsed)} className="text-white/40 hover:text-white text-xs px-2">
              {collapsed ? '+' : '−'}
            </button>
            <button onClick={() => setIsVisible(false)} className="text-white/40 hover:text-white">
              <X size={14} />
            </button>
          </div>
        </div>

        {!collapsed && (
          <div className="p-4 space-y-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2">Client Type</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDepthChange('quick')}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    depth === 'quick'
                      ? 'border-brand-teal bg-brand-teal/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <Zap size={16} className={depth === 'quick' ? 'text-brand-teal mx-auto mb-1' : 'text-white/40 mx-auto mb-1'} />
                  <p className={`text-[10px] font-black uppercase tracking-widest ${depth === 'quick' ? 'text-brand-teal' : 'text-white/60'}`}>Quick</p>
                  <p className="text-[9px] text-white/40 mt-1">Short-list price</p>
                </button>
                <button
                  onClick={() => handleDepthChange('deep')}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    depth === 'deep'
                      ? 'border-brand-lavender bg-brand-lavender/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <Layers size={16} className={depth === 'deep' ? 'text-brand-lavender mx-auto mb-1' : 'text-white/40 mx-auto mb-1'} />
                  <p className={`text-[10px] font-black uppercase tracking-widest ${depth === 'deep' ? 'text-brand-lavender' : 'text-white/60'}`}>Deep</p>
                  <p className="text-[9px] text-white/40 mt-1">Detailed scope</p>
                </button>
              </div>
            </div>

            {depth === 'quick' && (
              <div className="bg-brand-teal/5 border border-brand-teal/20 rounded-xl p-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-brand-teal mb-1">Quick Estimate</p>
                <p className="text-xl font-black text-white">${quickEstimate.low} – ${quickEstimate.high}</p>
                <p className="text-[10px] text-white/60 mt-1">Tier: {quickEstimate.label}</p>
              </div>
            )}

            {depth === 'deep' && deepBreakdown.length > 0 && (
              <div className="bg-brand-lavender/5 border border-brand-lavender/20 rounded-xl p-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-brand-lavender mb-2">Deep Breakdown</p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {deepBreakdown.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <span className="text-white/60 truncate">{item.item}</span>
                      <span className="text-white font-bold">${item.price}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/10 mt-2 pt-2 flex justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-lavender">Total</span>
                  <span className="text-white font-black">${deepTotal}</span>
                </div>
              </div>
            )}

            {depth === 'deep' && deepBreakdown.length === 0 && (
              <p className="text-xs text-white/40 italic">Add services to see breakdown</p>
            )}

            <p className="text-[9px] text-white/30 text-center italic">Cmd+Shift+A to toggle</p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default AlexSignalPanel;
