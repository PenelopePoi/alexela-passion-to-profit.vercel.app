import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield, ShieldAlert, ShieldOff, Download, Trash2, Check,
  AlertTriangle, X, Clock, Activity, ToggleLeft, ToggleRight,
  Loader2, AlertCircle
} from 'lucide-react';
import type { BrandInput, BrandStrategy } from '../types';
import {
  getSentinelState, toggleSentinel, exportAuditLog, clearAuditLog,
  type AuditEvent, type SentinelState
} from '../services/guardianSentinel';

interface SentinelDashboardProps {
  input: BrandInput;
  strategy: BrandStrategy;
}

const verdictConfig = {
  approved: { color: 'bg-green-500/10 text-green-500 border-green-500/20', icon: Check, label: 'Approved' },
  flagged: { color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: AlertTriangle, label: 'Flagged' },
  blocked: { color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: X, label: 'Blocked' }
};

const tierConfig = {
  routine: 'bg-stone-100 text-stone-600',
  warning: 'bg-amber-100 text-amber-700',
  critical: 'bg-red-100 text-red-700'
};

export const SentinelDashboard: React.FC<SentinelDashboardProps> = ({ input, strategy }) => {
  const [state, setState] = useState<SentinelState>(getSentinelState());
  const [clearing, setClearing] = useState(false);
  const [clearProof, setClearProof] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    try {
      setState(getSentinelState());
    } catch (e) {
      setError('Failed to read sentinel state');
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleToggle = () => {
    try {
      toggleSentinel();
      refresh();
    } catch (e) {
      setError('Failed to toggle sentinel');
    }
  };

  const handleExport = () => {
    try {
      const { content, filename } = exportAuditLog();
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError('Failed to export audit log');
    }
  };

  const handleClear = async () => {
    try {
      setClearing(true);
      setError(null);
      const proof = await clearAuditLog();
      setClearProof(proof);
      refresh();
    } catch (e) {
      setError('Failed to clear audit log');
    } finally {
      setClearing(false);
    }
  };

  const stats = [
    { label: 'Total Audits', value: state.stats.totalAudits, icon: Activity },
    { label: 'Approved', value: state.stats.approved, icon: Check },
    { label: 'Flagged', value: state.stats.flagged, icon: AlertTriangle },
    { label: 'Blocked', value: state.stats.blocked, icon: X }
  ];

  const reversedEvents = [...state.events].reverse();

  return (
    <div className="space-y-8">
      {/* Section 1: Sentinel Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-brand-black rounded-[3rem] p-10 text-white"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Shield size={28} className="text-brand-lavender" />
            <div>
              <h2 className="text-2xl font-black tracking-widest uppercase">Guardian Sentinel</h2>
              <p className="text-white/40 text-xs tracking-wide mt-1">
                Autonomous audit for {input.companyName || 'your brand'}
              </p>
            </div>
          </div>
          <motion.button
            onClick={handleToggle}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-5 py-3 rounded-full border transition-all ${
              state.isActive
                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                : 'bg-white/5 text-white/40 border-white/10'
            }`}
          >
            {state.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
            <span className="text-[10px] font-black uppercase tracking-widest">
              {state.isActive ? 'Active' : 'Inactive'}
            </span>
          </motion.button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: StatIcon }) => (
            <div key={label} className="bg-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <StatIcon size={14} className="text-white/40" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{label}</span>
              </div>
              <p className="text-2xl font-black">{value}</p>
            </div>
          ))}
        </div>

        {state.lastAuditAt && (
          <div className="flex items-center gap-2 mt-6 text-white/30 text-xs">
            <Clock size={12} />
            <span>Last audit: {new Date(state.lastAuditAt).toLocaleString()}</span>
          </div>
        )}
      </motion.div>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-500"
          >
            <AlertCircle size={16} />
            <span className="text-sm">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section 2: Audit Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-[2.5rem] p-8 border border-stone-100"
      >
        <div className="flex items-center gap-3 mb-6">
          <Activity size={18} className="text-stone-400" />
          <h3 className="text-lg font-black uppercase tracking-widest text-stone-800">Audit Feed</h3>
          <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 bg-stone-100 px-3 py-1 rounded-full">
            {state.events.length} events
          </span>
        </div>

        {reversedEvents.length === 0 ? (
          <div className="text-center py-16">
            <Shield size={32} className="mx-auto text-stone-200 mb-4" />
            <p className="text-stone-400 text-sm">No audit events yet</p>
            <p className="text-stone-300 text-xs mt-1">Events appear as AI operations are performed</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            <AnimatePresence initial={false}>
              {reversedEvents.map((event: AuditEvent) => {
                const verdict = verdictConfig[event.verdict];
                const VerdictIcon = verdict.icon;

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="border border-stone-100 rounded-2xl p-5 hover:border-stone-200 transition-colors"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${verdict.color}`}>
                        <VerdictIcon size={10} />
                        {verdict.label}
                      </span>
                      <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-brand-lavender/10 text-brand-lavender">
                        {event.type}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${tierConfig[event.tier]}`}>
                        {event.tier}
                      </span>
                      <span className="ml-auto text-[9px] text-stone-400 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-sm text-stone-700 font-medium mb-2">{event.summary}</p>
                    <p className="text-xs text-stone-400 mb-3">{event.reasoning}</p>

                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-stone-400">
                        {event.voterCount} voter{event.voterCount !== 1 ? 's' : ''} in quorum
                      </span>
                      {event.chainHash && (
                        <span className="text-[9px] font-mono text-stone-300 truncate max-w-[200px]">
                          #{event.chainHash.slice(0, 16)}...
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Section 3: Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-4"
      >
        <motion.button
          onClick={handleExport}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-brand-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-stone-800 transition-colors"
        >
          <Download size={14} />
          Export Audit Log
        </motion.button>

        <motion.button
          onClick={handleClear}
          disabled={clearing}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-6 py-3 rounded-full border border-red-200 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {clearing ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          Clear Audit Log
        </motion.button>

        <AnimatePresence>
          {clearProof && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2 px-4 py-3 rounded-full bg-stone-50 border border-stone-100"
            >
              <Check size={12} className="text-green-500" />
              <span className="text-[9px] text-stone-500">Deletion proof:</span>
              <span className="text-[9px] font-mono text-stone-400 truncate max-w-[180px]">
                {clearProof.slice(0, 24)}...
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
