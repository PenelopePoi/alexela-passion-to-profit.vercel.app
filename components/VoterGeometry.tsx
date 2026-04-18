import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { BrandInput, BrandStrategy } from '../types';
import {
  initializeCouncil, GuardianVoter, recordVote, restoreVoter,
  VoteDecision
} from '../services/guardianVoters';

interface VoterGeometryProps {
  input: BrandInput;
  strategy: BrandStrategy;
}

/**
 * Each voter's adaptive thresholds define a shape in 5D space:
 *   fatigueThreshold, energyFloor, clarityDecayRate, energyCostBase, restoreClarity
 *
 * We project this onto a 2D polygon where each axis is one threshold,
 * normalized to 0-1. The polygon deforms as thresholds evolve.
 *
 * The geometry IS the voter's learned identity — no two voters
 * produce the same shape after enough decisions.
 */

const ROLE_PALETTES: Record<string, { fill: string; stroke: string; glow: string; label: string }> = {
  ethics:          { fill: 'rgba(59,130,246,0.12)',  stroke: '#3b82f6',  glow: '#3b82f6', label: 'Ethics' },
  quality:         { fill: 'rgba(168,85,247,0.12)',  stroke: '#a855f7',  glow: '#a855f7', label: 'Quality' },
  brand:           { fill: 'rgba(236,72,153,0.12)',  stroke: '#ec4899',  glow: '#ec4899', label: 'Brand' },
  market:          { fill: 'rgba(34,197,94,0.12)',   stroke: '#22c55e',  glow: '#22c55e', label: 'Market' },
  security:        { fill: 'rgba(239,68,68,0.12)',   stroke: '#ef4444',  glow: '#ef4444', label: 'Security' },
  'user-advocate': { fill: 'rgba(244,63,94,0.12)',   stroke: '#f43f5e',  glow: '#f43f5e', label: 'Advocate' },
  creative:        { fill: 'rgba(245,158,11,0.12)',  stroke: '#f59e0b',  glow: '#f59e0b', label: 'Creative' },
  financial:       { fill: 'rgba(16,185,129,0.12)',  stroke: '#10b981',  glow: '#10b981', label: 'Financial' },
};

// Normalize a threshold value to 0-1 range
const normalize = (value: number, min: number, max: number): number =>
  Math.max(0, Math.min(1, (value - min) / (max - min)));

// Generate polygon points from 5 threshold dimensions
const thresholdsToPolygon = (voter: GuardianVoter, cx: number, cy: number, radius: number): string => {
  const t = voter.thresholds;
  const dims = [
    normalize(t.fatigueThreshold, 50, 95),
    normalize(t.energyFloor, 10, 35),
    normalize(t.clarityDecayRate, 0.03, 0.25),
    normalize(t.energyCostBase, 8, 25),
    normalize(t.restoreClarity, 85, 100),
  ];

  return dims.map((d, i) => {
    const angle = (i / dims.length) * Math.PI * 2 - Math.PI / 2;
    const r = radius * (0.3 + d * 0.7); // min 30% radius, max 100%
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    return `${x},${y}`;
  }).join(' ');
};

// Generate health ring — a circle whose radius = composite health
const healthRadius = (voter: GuardianVoter, maxRadius: number): number => {
  const h = voter.health;
  const composite = (h.energy + h.clarity + h.alignment + (100 - h.fatigue)) / 400;
  return maxRadius * (0.2 + composite * 0.8);
};

const DIM_LABELS = ['Fatigue\nThreshold', 'Energy\nFloor', 'Clarity\nDecay', 'Energy\nCost', 'Restore\nClarity'];

export const VoterGeometry: React.FC<VoterGeometryProps> = ({ input, strategy }) => {
  const [council, setCouncil] = useState<GuardianVoter[]>(initializeCouncil());
  const [selectedVoter, setSelectedVoter] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  const [viewMode, setViewMode] = useState<'individual' | 'overlay'>('overlay');

  // Simulate decisions to show evolution
  const simulateDecisions = () => {
    setIsSimulating(true);
    setSimulationStep(0);

    let voters = [...council];
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setSimulationStep(step);

      voters = voters.map(voter => {
        if (voter.state === 'resting') return restoreVoter(voter);

        // Each voter gets a random decision with role-appropriate confidence
        const decisions: VoteDecision[] = ['approve', 'reject', 'revise', 'abstain'];
        const decision = decisions[Math.floor(Math.random() * 3)]; // rarely abstain

        // Role-specific confidence distributions
        let confidence: number;
        switch (voter.role) {
          case 'security': confidence = 60 + Math.random() * 40; break;  // high confidence
          case 'creative': confidence = 30 + Math.random() * 50; break;  // variable
          case 'ethics':   confidence = 50 + Math.random() * 50; break;  // moderate-high
          default:         confidence = 40 + Math.random() * 40; break;  // moderate
        }

        return recordVote(voter, `Simulated decision ${step}`, decision, 'Geometric evolution', confidence);
      });

      setCouncil([...voters]);

      if (step >= 60) {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 150);
  };

  const selected = council.find(v => v.id === selectedVoter);
  const palette = selected ? ROLE_PALETTES[selected.role] : null;

  // SVG dimensions
  const W = 800;
  const H = 600;
  const CX = W / 2;
  const CY = H / 2;
  const R = 220;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-brand-black rounded-[3rem] p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            {Array.from({ length: 20 }).map((_, i) => (
              <line key={i} x1={`${i * 5}%`} y1="0" x2={`${100 - i * 5}%`} y2="100%"
                stroke="white" strokeWidth="0.5" />
            ))}
          </svg>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Voter Geometry</h2>
            <p className="text-stone-400 text-sm mt-1">
              Each shape is a voter's learned identity — 5 adaptive thresholds projected as a polygon.
              No two shapes are alike after enough decisions.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setViewMode(viewMode === 'overlay' ? 'individual' : 'overlay')}
              className="px-5 py-2.5 bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
            >
              {viewMode === 'overlay' ? 'Split View' : 'Overlay'}
            </button>
            <button
              onClick={simulateDecisions}
              disabled={isSimulating}
              className="px-5 py-2.5 bg-brand-teal text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50"
            >
              {isSimulating ? `Evolving... ${simulationStep}/60` : 'Simulate 60 Decisions'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Visualization */}
      {viewMode === 'overlay' ? (
        <div className="bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-lg">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: '500px' }}>
            {/* Background grid — the geometric substrate */}
            <defs>
              {council.map(v => {
                const p = ROLE_PALETTES[v.role];
                return (
                  <filter key={`glow-${v.id}`} id={`glow-${v.id}`}>
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                );
              })}
            </defs>

            {/* Axis lines */}
            {DIM_LABELS.map((label, i) => {
              const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
              const x2 = CX + Math.cos(angle) * (R + 30);
              const y2 = CY + Math.sin(angle) * (R + 30);
              const lx = CX + Math.cos(angle) * (R + 50);
              const ly = CY + Math.sin(angle) * (R + 50);
              return (
                <g key={`axis-${i}`}>
                  <line x1={CX} y1={CY} x2={x2} y2={y2}
                    stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
                  <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
                    className="text-[9px] fill-stone-400 font-bold">
                    {label.split('\n').map((line, li) => (
                      <tspan key={li} x={lx} dy={li === 0 ? 0 : 12}>{line}</tspan>
                    ))}
                  </text>
                </g>
              );
            })}

            {/* Reference circles */}
            {[0.25, 0.5, 0.75, 1.0].map(frac => (
              <circle key={`ref-${frac}`} cx={CX} cy={CY} r={R * (0.3 + frac * 0.7)}
                fill="none" stroke="#f3f4f6" strokeWidth="1" />
            ))}

            {/* Voter polygons — the geometry */}
            {council.map(voter => {
              const p = ROLE_PALETTES[voter.role];
              const points = thresholdsToPolygon(voter, CX, CY, R);
              const hr = healthRadius(voter, 8);
              const isSelected = voter.id === selectedVoter;

              // Polygon centroid for the health dot
              const dims = [
                normalize(voter.thresholds.fatigueThreshold, 50, 95),
                normalize(voter.thresholds.energyFloor, 10, 35),
                normalize(voter.thresholds.clarityDecayRate, 0.03, 0.25),
                normalize(voter.thresholds.energyCostBase, 8, 25),
                normalize(voter.thresholds.restoreClarity, 85, 100),
              ];
              const avgD = dims.reduce((s, d) => s + d, 0) / dims.length;
              const dotR = R * (0.3 + avgD * 0.7) * 0.5;

              return (
                <g key={voter.id}
                  onClick={() => setSelectedVoter(voter.id === selectedVoter ? null : voter.id)}
                  style={{ cursor: 'pointer' }}>
                  <motion.polygon
                    points={points}
                    fill={p.fill}
                    stroke={p.stroke}
                    strokeWidth={isSelected ? 3 : 1.5}
                    opacity={selectedVoter && !isSelected ? 0.2 : 1}
                    filter={isSelected ? `url(#glow-${voter.id})` : undefined}
                    initial={false}
                    animate={{ points }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                  {/* Health dot at centroid */}
                  <motion.circle
                    cx={CX} cy={CY - dotR}
                    r={hr}
                    fill={p.stroke}
                    opacity={selectedVoter && !isSelected ? 0.2 : 0.8}
                    animate={{ r: hr }}
                  />
                </g>
              );
            })}

            {/* Center label */}
            <text x={CX} y={CY + 4} textAnchor="middle" className="text-[10px] fill-stone-300 font-bold uppercase tracking-widest">
              {selectedVoter ? ROLE_PALETTES[council.find(v => v.id === selectedVoter)?.role || '']?.label : 'All Voters'}
            </text>
          </svg>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {council.map(voter => {
              const p = ROLE_PALETTES[voter.role];
              const isSelected = voter.id === selectedVoter;
              return (
                <button
                  key={voter.id}
                  onClick={() => setSelectedVoter(voter.id === selectedVoter ? null : voter.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                    isSelected ? 'border-stone-900 bg-stone-50 scale-105' : 'border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.stroke }} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-600">
                    {p.label}
                  </span>
                  <span className="text-[9px] text-stone-400">
                    ×{voter.thresholds.calibrationCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Individual view — 2x4 grid of small radar charts */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {council.map(voter => {
            const p = ROLE_PALETTES[voter.role];
            const sz = 200;
            const cx = sz / 2;
            const cy = sz / 2;
            const r = 70;
            const points = thresholdsToPolygon(voter, cx, cy, r);

            return (
              <motion.div
                key={voter.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[2rem] p-4 border border-stone-100 hover:shadow-xl transition-all cursor-pointer"
                onClick={() => { setSelectedVoter(voter.id); setViewMode('overlay'); }}
              >
                <svg viewBox={`0 0 ${sz} ${sz}`} className="w-full">
                  {/* Axis lines */}
                  {DIM_LABELS.map((_, i) => {
                    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
                    return (
                      <line key={i} x1={cx} y1={cy}
                        x2={cx + Math.cos(angle) * (r + 10)}
                        y2={cy + Math.sin(angle) * (r + 10)}
                        stroke="#f3f4f6" strokeWidth="1" />
                    );
                  })}
                  <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth="1" />
                  <motion.polygon
                    points={points}
                    fill={p.fill}
                    stroke={p.stroke}
                    strokeWidth="2"
                    animate={{ points }}
                    transition={{ duration: 0.3 }}
                  />
                </svg>
                <div className="text-center mt-2">
                  <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: p.stroke }}>
                    {p.label}
                  </div>
                  <div className="text-[9px] text-stone-400">
                    {voter.history.length} decisions · {voter.thresholds.calibrationCount} evolutions
                  </div>
                  <div className="text-[9px] text-stone-400">
                    {voter.state === 'resting' ? '💤 Resting' : `⚡ ${voter.health.energy}%`}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Selected voter detail */}
      {selected && palette && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-8 border-2 shadow-xl"
          style={{ borderColor: palette.stroke + '40' }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: palette.stroke }} />
            <h3 className="text-lg font-black">{selected.name}</h3>
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
              style={{ backgroundColor: palette.fill, color: palette.stroke }}>
              {selected.role}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-4 mb-6">
            {[
              { label: 'Fatigue Threshold', value: selected.thresholds.fatigueThreshold, unit: '', default: 80 },
              { label: 'Energy Floor', value: selected.thresholds.energyFloor, unit: '', default: 20 },
              { label: 'Clarity Decay', value: selected.thresholds.clarityDecayRate, unit: '/decision', default: 0.1 },
              { label: 'Energy Cost', value: selected.thresholds.energyCostBase, unit: '/vote', default: 15 },
              { label: 'Restore Clarity', value: selected.thresholds.restoreClarity, unit: '%', default: 95 },
            ].map(({ label, value, unit, default: def }) => {
              const changed = Math.abs(value - def) > 0.01;
              const direction = value > def ? '↑' : value < def ? '↓' : '=';
              return (
                <div key={label} className="bg-stone-50 rounded-2xl p-4">
                  <div className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1">{label}</div>
                  <div className="text-xl font-black" style={{ color: changed ? palette.stroke : '#78716c' }}>
                    {typeof value === 'number' && value < 1 ? value.toFixed(3) : value}
                    <span className="text-xs text-stone-400">{unit}</span>
                  </div>
                  {changed && (
                    <div className="text-[9px] text-stone-400 mt-1">
                      {direction} from default {typeof def === 'number' && def < 1 ? def.toFixed(3) : def}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-stone-50 rounded-2xl p-4">
              <div className="text-[9px] font-black uppercase tracking-widest text-stone-400">Decisions</div>
              <div className="text-2xl font-black text-brand-black">{selected.history.length}</div>
            </div>
            <div className="bg-stone-50 rounded-2xl p-4">
              <div className="text-[9px] font-black uppercase tracking-widest text-stone-400">Evolutions</div>
              <div className="text-2xl font-black" style={{ color: palette.stroke }}>{selected.thresholds.calibrationCount}</div>
            </div>
            <div className="bg-stone-50 rounded-2xl p-4">
              <div className="text-[9px] font-black uppercase tracking-widest text-stone-400">Incarnation</div>
              <div className="text-2xl font-black text-brand-black">{selected.incarnation}</div>
            </div>
            <div className="bg-stone-50 rounded-2xl p-4">
              <div className="text-[9px] font-black uppercase tracking-widest text-stone-400">State</div>
              <div className="text-2xl font-black text-brand-black">{selected.state}</div>
            </div>
          </div>

          {/* Philosophy footer */}
          <div className="mt-6 pt-6 border-t border-stone-100">
            <p className="text-[10px] text-stone-400 italic text-center">
              This shape is not designed. It is the residue of {selected.history.length} decisions —
              the geometry that emerged when {selected.name.toLowerCase()} learned
              which states produce correct outputs. The form is shared. The forces are personal.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
