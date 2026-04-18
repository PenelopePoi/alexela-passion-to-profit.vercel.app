import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Shield, Eye, Heart, BookOpen, TrendingUp, Cpu, Search, ChevronRight, X, Mic, MicOff, Activity } from 'lucide-react';

// --- SKILL DATA ---

interface SkillNode {
  name: string;
  power: number; // 0-9999
  status: 'active' | 'standby' | 'charging';
  type: 'offense' | 'defense' | 'analysis' | 'creation' | 'meta';
}

interface Bundle {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  glowColor: string;
  totalPower: number;
  skills: SkillNode[];
}

const BUNDLES: Bundle[] = [
  {
    id: 'security', name: 'Security Research', icon: <Shield size={16} />,
    color: '#ff3333', glowColor: 'rgba(255,51,51,0.4)', totalPower: 8750,
    skills: [
      { name: 'Frida Hooking', power: 9200, status: 'active', type: 'offense' },
      { name: 'Malware Analysis', power: 8800, status: 'active', type: 'analysis' },
      { name: 'Prompt Injection', power: 9100, status: 'active', type: 'defense' },
      { name: 'SBOM Evaluator', power: 7600, status: 'standby', type: 'analysis' },
      { name: 'Stack Overflow', power: 8200, status: 'standby', type: 'analysis' },
      { name: 'Linux Malware', power: 8500, status: 'active', type: 'offense' },
      { name: 'Phishing Analyzer', power: 7900, status: 'standby', type: 'defense' },
      { name: 'Agent Architecture', power: 9400, status: 'active', type: 'creation' },
      { name: 'MCP Security', power: 8800, status: 'active', type: 'defense' },
      { name: 'CVE Research', power: 7200, status: 'standby', type: 'analysis' },
      { name: 'OpenClaw Eval', power: 8100, status: 'standby', type: 'defense' },
      { name: 'LLM RE Capability', power: 7800, status: 'standby', type: 'analysis' },
    ]
  },
  {
    id: 'consciousness', name: 'Consciousness & Belief', icon: <Eye size={16} />,
    color: '#a855f7', glowColor: 'rgba(168,85,247,0.4)', totalPower: 7800,
    skills: [
      { name: 'Manifestation Auditor', power: 8900, status: 'active', type: 'analysis' },
      { name: 'Neuro-Spiritual Map', power: 8600, status: 'active', type: 'analysis' },
      { name: 'Gabriel Claims', power: 7200, status: 'standby', type: 'analysis' },
      { name: 'Hype Cycle Eval', power: 7400, status: 'standby', type: 'analysis' },
      { name: 'Pseudoscience Detect', power: 8100, status: 'active', type: 'defense' },
      { name: 'Alignment Calibration', power: 9200, status: 'active', type: 'meta' },
      { name: 'Self-Correcting Mech', power: 9500, status: 'active', type: 'meta' },
    ]
  },
  {
    id: 'content', name: 'Content Intelligence', icon: <Search size={16} />,
    color: '#06b6d4', glowColor: 'rgba(6,182,212,0.4)', totalPower: 8200,
    skills: [
      { name: 'YouTube Pipeline', power: 9100, status: 'active', type: 'analysis' },
      { name: 'Creator Profiler', power: 8400, status: 'active', type: 'analysis' },
      { name: 'Transcript→Script', power: 8800, status: 'active', type: 'creation' },
      { name: 'Tech Claim Verify', power: 8600, status: 'active', type: 'analysis' },
      { name: 'Skill Extractor', power: 7900, status: 'standby', type: 'creation' },
      { name: 'Esoteric Educator', power: 8200, status: 'active', type: 'creation' },
      { name: 'Trend Predictor', power: 7600, status: 'standby', type: 'analysis' },
      { name: 'AI Decomposer', power: 8000, status: 'standby', type: 'analysis' },
    ]
  },
  {
    id: 'meta', name: 'Meta Skill Suite', icon: <Cpu size={16} />,
    color: '#eab308', glowColor: 'rgba(234,179,8,0.4)', totalPower: 8500,
    skills: [
      { name: 'Skill Selector', power: 8200, status: 'active', type: 'meta' },
      { name: 'Skill Router', power: 8800, status: 'active', type: 'meta' },
      { name: 'Skill Chainer', power: 9100, status: 'active', type: 'meta' },
      { name: 'Multi-Lens', power: 9400, status: 'active', type: 'meta' },
      { name: 'Manifest Destiny', power: 8600, status: 'active', type: 'meta' },
      { name: 'Skill Methodology', power: 7800, status: 'standby', type: 'creation' },
      { name: 'Grep Search', power: 7200, status: 'standby', type: 'analysis' },
      { name: 'AI UI Prompt Eng', power: 8400, status: 'active', type: 'creation' },
    ]
  },
  {
    id: 'people', name: 'People Strategy', icon: <Heart size={16} />,
    color: '#ec4899', glowColor: 'rgba(236,72,153,0.4)', totalPower: 7600,
    skills: [
      { name: 'FindYourPartner', power: 8800, status: 'active', type: 'analysis' },
      { name: 'Connection Architect', power: 8200, status: 'active', type: 'creation' },
      { name: 'Credibility Builder', power: 7600, status: 'standby', type: 'creation' },
      { name: 'Presentation Audit', power: 7400, status: 'standby', type: 'analysis' },
      { name: 'Negotiation', power: 8900, status: 'active', type: 'offense' },
    ]
  },
  {
    id: 'love', name: 'Love & Writing', icon: <Heart size={16} />,
    color: '#f43f5e', glowColor: 'rgba(244,63,94,0.4)', totalPower: 8100,
    skills: [
      { name: 'Love as System', power: 9200, status: 'active', type: 'analysis' },
      { name: 'Love Cartography', power: 8400, status: 'active', type: 'analysis' },
      { name: 'Love Making', power: 8100, status: 'standby', type: 'creation' },
      { name: 'Love Pregap', power: 8800, status: 'active', type: 'creation' },
      { name: 'Personification', power: 8600, status: 'active', type: 'creation' },
      { name: 'Lyrical Voice', power: 9000, status: 'active', type: 'creation' },
    ]
  },
  {
    id: 'financial', name: 'Financial Evaluator', icon: <TrendingUp size={16} />,
    color: '#22c55e', glowColor: 'rgba(34,197,94,0.4)', totalPower: 7400,
    skills: [
      { name: 'Claim Auditor', power: 8200, status: 'active', type: 'analysis' },
      { name: 'Asymmetric Risk', power: 8600, status: 'active', type: 'analysis' },
      { name: 'Owner Mindset', power: 7200, status: 'standby', type: 'creation' },
      { name: 'Business Model', power: 7800, status: 'active', type: 'analysis' },
    ]
  },
  {
    id: 'learning', name: 'Learning & Teaching', icon: <BookOpen size={16} />,
    color: '#f97316', glowColor: 'rgba(249,115,22,0.4)', totalPower: 7900,
    skills: [
      { name: 'Immersion Protocol', power: 9100, status: 'active', type: 'creation' },
      { name: 'Concept→Crash', power: 8400, status: 'active', type: 'creation' },
      { name: 'Autistic Pipeline', power: 7800, status: 'standby', type: 'analysis' },
      { name: 'Curriculum Builder', power: 8200, status: 'active', type: 'creation' },
    ]
  },
];

// --- SCANNING ANIMATION ---

const ScanLine: React.FC<{ color: string }> = ({ color }) => (
  <motion.div
    className="absolute left-0 right-0 h-[1px] opacity-60"
    style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
    animate={{ top: ['0%', '100%', '0%'] }}
    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
  />
);

// --- POWER BAR ---

const PowerBar: React.FC<{ power: number; max: number; color: string; label: string; status: string }> = ({ power, max, color, label, status }) => {
  const pct = (power / max) * 100;
  return (
    <div className="flex items-center gap-2 py-0.5">
      <div className="w-2 h-2 rounded-full" style={{
        background: status === 'active' ? color : '#444',
        boxShadow: status === 'active' ? `0 0 6px ${color}` : 'none'
      }} />
      <span className="text-[10px] font-mono w-28 truncate opacity-80">{label}</span>
      <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}88, ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="text-[10px] font-mono w-10 text-right" style={{ color }}>{power}</span>
    </div>
  );
};

// --- MAIN SCOUTER COMPONENT ---

export const SkillScouter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);
  const [scanMode, setScanMode] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const [intentBuffer, setIntentBuffer] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Total system power
  const totalPower = BUNDLES.reduce((sum, b) => sum + b.totalPower, 0);
  const totalSkills = BUNDLES.reduce((sum, b) => sum + b.skills.length, 0);
  const activeSkills = BUNDLES.reduce((sum, b) => sum + b.skills.filter(s => s.status === 'active').length, 0);

  // Mind control: keyboard navigation (simulates neural intent)
  const handleKeyNav = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    if (!selectedBundle) {
      // Bundle selection mode
      if (e.key === 'ArrowDown' || e.key === 'j') {
        setFocusIndex(prev => Math.min(prev + 1, BUNDLES.length - 1));
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        setFocusIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' || e.key === ' ') {
        setSelectedBundle(BUNDLES[focusIndex]);
        setFocusIndex(0);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    } else {
      // Skill view mode
      if (e.key === 'Escape' || e.key === 'Backspace') {
        setSelectedBundle(null);
        setFocusIndex(0);
      } else if (e.key === 'ArrowDown' || e.key === 'j') {
        setFocusIndex(prev => Math.min(prev + 1, selectedBundle.skills.length - 1));
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        setFocusIndex(prev => Math.max(prev - 1, 0));
      }
    }
  }, [isOpen, selectedBundle, focusIndex]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyNav);
    return () => window.removeEventListener('keydown', handleKeyNav);
  }, [handleKeyNav]);

  // Voice intent simulation
  const toggleVoice = () => {
    setVoiceActive(!voiceActive);
    if (!voiceActive) {
      // In production: Web Speech API recognition
      // For now: visual indicator
    }
  };

  // Scan animation on open
  useEffect(() => {
    if (isOpen) {
      setScanMode(true);
      const timer = setTimeout(() => setScanMode(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Power level color coding
  const getPowerColor = (power: number): string => {
    if (power >= 9000) return '#ff3333'; // Over 9000!
    if (power >= 8000) return '#eab308';
    if (power >= 7000) return '#22c55e';
    return '#06b6d4';
  };

  return (
    <>
      {/* SCOUTER TOGGLE — floating eye icon */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 right-6 z-[9999] w-12 h-12 rounded-full flex items-center justify-center"
        style={{
          background: isOpen ? 'linear-gradient(135deg, #1a1a2e, #16213e)' : 'linear-gradient(135deg, #0a0a0a, #1a1a2e)',
          border: `2px solid ${isOpen ? '#00ff88' : '#333'}`,
          boxShadow: isOpen ? '0 0 20px rgba(0,255,136,0.3), inset 0 0 20px rgba(0,255,136,0.1)' : '0 4px 12px rgba(0,0,0,0.5)'
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Brain size={20} className={isOpen ? 'text-green-400' : 'text-stone-400'} />
      </motion.button>

      {/* SCOUTER HUD */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-6 right-20 z-[9998] w-80 rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(10,10,20,0.95), rgba(5,15,30,0.98))',
              border: '1px solid rgba(0,255,136,0.15)',
              boxShadow: '0 0 40px rgba(0,255,136,0.08), 0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)'
            }}
          >
            {/* Scan line overlay */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <ScanLine color="#00ff88" />
              {scanMode && (
                <motion.div
                  className="absolute inset-0"
                  style={{ background: 'radial-gradient(ellipse at center, rgba(0,255,136,0.08), transparent 70%)' }}
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </div>

            {/* HEADER */}
            <div className="relative px-4 pt-4 pb-3 border-b border-green-900/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-green-400" />
                  <span className="text-[10px] font-mono font-bold tracking-[0.3em] text-green-400 uppercase">
                    Skill Scouter
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={toggleVoice} className="p-1 rounded-md hover:bg-white/5">
                    {voiceActive ? <Mic size={12} className="text-red-400 animate-pulse" /> : <MicOff size={12} className="text-stone-600" />}
                  </button>
                  <button onClick={() => setIsOpen(false)} className="p-1 rounded-md hover:bg-white/5">
                    <X size={12} className="text-stone-500" />
                  </button>
                </div>
              </div>

              {/* TOTAL POWER READING */}
              <div className="mt-3 flex items-baseline gap-2">
                <motion.span
                  className="text-3xl font-mono font-black"
                  style={{ color: '#00ff88', textShadow: '0 0 20px rgba(0,255,136,0.5)' }}
                  key={scanMode ? 'scanning' : 'stable'}
                  animate={scanMode ? { opacity: [1, 0.3, 1] } : {}}
                  transition={{ duration: 0.3, repeat: scanMode ? Infinity : 0 }}
                >
                  {scanMode ? '????' : totalPower.toLocaleString()}
                </motion.span>
                <span className="text-[10px] font-mono text-green-400/60 uppercase">total pl</span>
              </div>

              <div className="flex items-center gap-4 mt-1">
                <span className="text-[9px] font-mono text-stone-500">{BUNDLES.length} bundles</span>
                <span className="text-[9px] font-mono text-stone-500">{totalSkills} skills</span>
                <span className="text-[9px] font-mono text-green-500">{activeSkills} active</span>
              </div>

              {/* Intent input */}
              <div className="mt-2 relative">
                <input
                  type="text"
                  value={intentBuffer}
                  onChange={(e) => {
                    setIntentBuffer(e.target.value);
                    // Auto-focus matching bundle
                    const match = BUNDLES.findIndex(b =>
                      b.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
                      b.skills.some(s => s.name.toLowerCase().includes(e.target.value.toLowerCase()))
                    );
                    if (match >= 0) setFocusIndex(match);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !selectedBundle) {
                      setSelectedBundle(BUNDLES[focusIndex]);
                      setIntentBuffer('');
                      setFocusIndex(0);
                    }
                  }}
                  placeholder={voiceActive ? '🔴 listening...' : '↑↓ navigate · enter select · think...'}
                  className="w-full bg-black/30 border border-green-900/20 rounded-lg px-3 py-1.5 text-[10px] font-mono text-green-300 placeholder:text-stone-600 focus:outline-none focus:border-green-500/30"
                />
                <Zap size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-green-700" />
              </div>
            </div>

            {/* BODY */}
            <div className="relative max-h-[420px] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
              <AnimatePresence mode="wait">
                {!selectedBundle ? (
                  // BUNDLE LIST VIEW
                  <motion.div
                    key="bundles"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-3 space-y-1"
                  >
                    {BUNDLES.map((bundle, i) => (
                      <motion.button
                        key={bundle.id}
                        onClick={() => { setSelectedBundle(bundle); setFocusIndex(0); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                          focusIndex === i ? 'bg-white/5 ring-1' : 'hover:bg-white/[0.02]'
                        }`}
                        style={{
                          ringColor: focusIndex === i ? bundle.color + '40' : 'transparent',
                          borderColor: 'transparent'
                        }}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: scanMode ? 0.1 * i + 0.5 : 0.03 * i }}
                      >
                        {/* Power indicator */}
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
                          background: `${bundle.color}15`,
                          border: `1px solid ${bundle.color}30`
                        }}>
                          <span style={{ color: bundle.color }}>{bundle.icon}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono font-bold text-stone-200 truncate">{bundle.name}</span>
                            <span className="text-[10px] font-mono font-black" style={{ color: getPowerColor(bundle.totalPower) }}>
                              {bundle.totalPower.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex-1 h-1 bg-black/40 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ background: `linear-gradient(90deg, ${bundle.color}66, ${bundle.color})` }}
                                initial={{ width: 0 }}
                                animate={{ width: `${(bundle.totalPower / 10000) * 100}%` }}
                                transition={{ duration: 1, delay: scanMode ? 0.1 * i + 0.8 : 0 }}
                              />
                            </div>
                            <span className="text-[8px] font-mono text-stone-600">{bundle.skills.length}sk</span>
                          </div>
                        </div>

                        <ChevronRight size={12} className="text-stone-700" />
                      </motion.button>
                    ))}
                  </motion.div>
                ) : (
                  // SKILL DETAIL VIEW
                  <motion.div
                    key={`bundle-${selectedBundle.id}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="p-3"
                  >
                    {/* Bundle header */}
                    <button
                      onClick={() => { setSelectedBundle(null); setFocusIndex(0); }}
                      className="flex items-center gap-2 mb-3 text-stone-400 hover:text-stone-200 transition-colors"
                    >
                      <ChevronRight size={12} className="rotate-180" />
                      <span className="text-[10px] font-mono uppercase tracking-widest">back</span>
                    </button>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
                        background: `${selectedBundle.color}20`,
                        border: `1px solid ${selectedBundle.color}40`,
                        boxShadow: `0 0 20px ${selectedBundle.glowColor}`
                      }}>
                        <span style={{ color: selectedBundle.color }}>{selectedBundle.icon}</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-mono font-black text-stone-100">{selectedBundle.name}</h3>
                        <div className="flex items-center gap-2">
                          <motion.span
                            className="text-lg font-mono font-black"
                            style={{ color: selectedBundle.color, textShadow: `0 0 10px ${selectedBundle.glowColor}` }}
                            animate={{ opacity: [1, 0.7, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            {selectedBundle.totalPower.toLocaleString()}
                          </motion.span>
                          <span className="text-[9px] font-mono text-stone-600 uppercase">power level</span>
                        </div>
                      </div>
                    </div>

                    {/* Skill bars */}
                    <div className="space-y-0.5">
                      {selectedBundle.skills
                        .sort((a, b) => b.power - a.power)
                        .map((skill, i) => (
                          <motion.div
                            key={skill.name}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * i }}
                            className={`rounded-lg px-1 py-0.5 ${focusIndex === i ? 'bg-white/5' : ''}`}
                          >
                            <PowerBar
                              power={skill.power}
                              max={10000}
                              color={selectedBundle.color}
                              label={skill.name}
                              status={skill.status}
                            />
                          </motion.div>
                        ))}
                    </div>

                    {/* Stats footer */}
                    <div className="mt-4 pt-3 border-t border-white/5 flex justify-between">
                      <div className="text-center">
                        <div className="text-[10px] font-mono font-bold text-stone-300">{selectedBundle.skills.filter(s => s.status === 'active').length}</div>
                        <div className="text-[8px] font-mono text-stone-600 uppercase">active</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] font-mono font-bold text-stone-300">{selectedBundle.skills.filter(s => s.status === 'standby').length}</div>
                        <div className="text-[8px] font-mono text-stone-600 uppercase">standby</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] font-mono font-bold" style={{ color: selectedBundle.color }}>
                          {Math.round(selectedBundle.skills.reduce((s, sk) => s + sk.power, 0) / selectedBundle.skills.length)}
                        </div>
                        <div className="text-[8px] font-mono text-stone-600 uppercase">avg pl</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* FOOTER — nav hints */}
            <div className="px-4 py-2 border-t border-green-900/20 flex items-center justify-between">
              <span className="text-[8px] font-mono text-stone-700">↑↓ focus · ⏎ select · esc back</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[8px] font-mono text-green-600">neural link</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
