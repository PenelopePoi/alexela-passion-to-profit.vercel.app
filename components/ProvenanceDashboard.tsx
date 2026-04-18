import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Link2, Shield, Check, X, Download, Trash2, Loader2,
  AlertCircle, Activity, Clock, Hash, Cpu, BarChart3, RefreshCw
} from 'lucide-react';
import { BrandInput, BrandStrategy } from '../types';
import {
  getChain, verifyChain, exportChain, getChainStats, clearChain,
  ProvenanceRecord
} from '../services/provenanceTracer';

interface ProvenanceDashboardProps {
  input: BrandInput;
  strategy: BrandStrategy;
}

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatAge = (first: string | null, last: string | null): string => {
  if (!first) return '—';
  const start = new Date(first).getTime();
  const end = last ? new Date(last).getTime() : Date.now();
  const diffMs = end - start;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return '< 1 min';
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m`;
  const days = Math.floor(hrs / 24);
  return `${days}d ${hrs % 24}h`;
};

const truncateHash = (hash: string, len = 12): string =>
  hash.length > len ? `${hash.slice(0, len)}…` : hash;

export const ProvenanceDashboard: React.FC<ProvenanceDashboardProps> = ({
  input,
  strategy,
}) => {
  const [chain, setChain] = useState(getChain());
  const [stats, setStats] = useState(getChainStats());
  const [integrity, setIntegrity] = useState<{
    valid: boolean;
    brokenAt?: number;
    totalRecords: number;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [deletionHash, setDeletionHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = () => {
    setChain(getChain());
    setStats(getChainStats());
  };

  const runVerify = async () => {
    try {
      setIsVerifying(true);
      setError(null);
      const result = await verifyChain();
      setIntegrity(result);
    } catch (e: any) {
      setError(e.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    refresh();
    runVerify();
  }, []);

  const handleExport = () => {
    try {
      const { content, filename } = exportChain();
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e.message || 'Export failed');
    }
  };

  const handleClear = async () => {
    try {
      setIsClearing(true);
      setError(null);
      const hash = await clearChain();
      setDeletionHash(hash);
      setShowClearConfirm(false);
      refresh();
      setIntegrity({ valid: true, totalRecords: 0 });
    } catch (e: any) {
      setError(e.message || 'Clear failed');
    } finally {
      setIsClearing(false);
    }
  };

  const modelEntries = Object.entries(stats.modelBreakdown).sort(
    (a, b) => (b[1] as number) - (a[1] as number)
  );
  const funcEntries = Object.entries(stats.functionBreakdown)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 10);
  const maxModelCount = modelEntries[0]?.[1] || 1;
  const maxFuncCount = funcEntries[0]?.[1] || 1;

  const modelColors = [
    'bg-brand-teal',
    'bg-brand-lavender',
    'bg-amber-400',
    'bg-rose-400',
    'bg-emerald-400',
    'bg-sky-400',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-6 py-4"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto hover:bg-red-100 rounded-full p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Section 1: Chain Status Header */}
      <div className="bg-brand-black rounded-[3rem] p-10 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute border border-white/20 rounded-full"
              style={{
                width: `${120 + i * 80}px`,
                height: `${120 + i * 80}px`,
                top: '50%',
                right: '-40px',
                transform: 'translateY(-50%)',
              }}
            />
          ))}
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                <Link2 className="w-7 h-7 text-brand-teal" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-widest uppercase">
                  Provenance Chain
                </h2>
                <p className="text-white/60 text-sm mt-1">
                  Every AI generation traced. Every output verifiable.
                </p>
              </div>
            </div>

            {/* Integrity Badge */}
            {integrity && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                  integrity.valid
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-red-500/20 text-red-300'
                }`}
              >
                {integrity.valid ? (
                  <>
                    <Shield className="w-4 h-4" />
                    Chain Valid
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    Chain Broken at record #{integrity.brokenAt}
                  </>
                )}
              </motion.div>
            )}
            {isVerifying && (
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying…
              </div>
            )}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-white/40 text-xs font-bold tracking-widest uppercase mb-1">
                <Activity className="w-3.5 h-3.5" />
                Generations
              </div>
              <div className="text-2xl font-black">{stats.totalGenerations}</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-white/40 text-xs font-bold tracking-widest uppercase mb-1">
                <Cpu className="w-3.5 h-3.5" />
                Models
              </div>
              <div className="text-2xl font-black">
                {Object.keys(stats.modelBreakdown).length}
              </div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-white/40 text-xs font-bold tracking-widest uppercase mb-1">
                <Hash className="w-3.5 h-3.5" />
                Data
              </div>
              <div className="text-2xl font-black">
                {formatBytes(stats.totalInputBytes + stats.totalOutputBytes)}
              </div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-white/40 text-xs font-bold tracking-widest uppercase mb-1">
                <Clock className="w-3.5 h-3.5" />
                Chain Age
              </div>
              <div className="text-2xl font-black">
                {formatAge(stats.firstGeneration, stats.lastGeneration)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={runVerify}
              disabled={isVerifying}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-full text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {isVerifying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Verify Chain
            </button>
            <button
              onClick={handleExport}
              disabled={chain.records.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-teal/20 hover:bg-brand-teal/30 text-brand-teal rounded-full text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Export Chain
            </button>
          </div>
        </div>
      </div>

      {/* Section 2: Chain Statistics */}
      {stats.totalGenerations > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-[2.5rem] p-8 border border-stone-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-5 h-5 text-brand-teal" />
            <h3 className="text-lg font-black tracking-widest uppercase text-brand-black">
              Chain Statistics
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Model Breakdown */}
            <div>
              <h4 className="text-xs font-bold tracking-widest uppercase text-stone-400 mb-4">
                Model Breakdown
              </h4>
              <div className="space-y-3">
                {modelEntries.map(([model, count], i) => {
                  const pct = Math.round(((count as number) / stats.totalGenerations) * 100);
                  const barWidth = ((count as number) / (maxModelCount as number)) * 100;
                  return (
                    <div key={model}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium text-stone-700 truncate mr-2">
                          {model}
                        </span>
                        <span className="text-stone-400 shrink-0">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${barWidth}%` }}
                          transition={{ duration: 0.6, delay: i * 0.08 }}
                          className={`h-full rounded-full ${
                            modelColors[i % modelColors.length]
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Function Breakdown */}
            <div>
              <h4 className="text-xs font-bold tracking-widest uppercase text-stone-400 mb-4">
                Function Breakdown
              </h4>
              <div className="space-y-3">
                {funcEntries.map(([fn, count], i) => {
                  const barWidth = ((count as number) / (maxFuncCount as number)) * 100;
                  return (
                    <div key={fn}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-mono text-xs text-stone-600 truncate mr-2">
                          {fn}
                        </span>
                        <span className="text-stone-400 shrink-0">{count}</span>
                      </div>
                      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${barWidth}%` }}
                          transition={{ duration: 0.6, delay: i * 0.05 }}
                          className="h-full rounded-full bg-brand-lavender"
                        />
                      </div>
                    </div>
                  );
                })}
                {funcEntries.length === 0 && (
                  <p className="text-stone-400 text-sm">No function data yet.</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Section 3: Chain Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white rounded-[2.5rem] p-8 border border-stone-100"
      >
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-5 h-5 text-brand-teal" />
          <h3 className="text-lg font-black tracking-widest uppercase text-brand-black">
            Chain Timeline
          </h3>
          <span className="ml-auto text-xs text-stone-400 font-medium">
            {chain.records.length} record{chain.records.length !== 1 ? 's' : ''}
          </span>
        </div>

        {chain.records.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
              <Link2 className="w-7 h-7 text-stone-300" />
            </div>
            <p className="text-stone-400 text-sm max-w-xs mx-auto">
              No generations traced yet. AI outputs will appear here as they're
              created.
            </p>
          </div>
        ) : (
          <div className="max-h-[32rem] overflow-y-auto pr-2 space-y-3 scrollbar-thin">
            {[...chain.records].reverse().map((record, idx) => {
              const recordIndex = chain.records.length - 1 - idx;
              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="bg-stone-50 rounded-2xl p-4 border border-stone-100 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-brand-teal font-semibold bg-brand-teal/10 px-2 py-0.5 rounded-md">
                        {truncateHash(record.chainHash)}
                      </span>
                      <span className="text-xs bg-stone-200 text-stone-600 px-2 py-0.5 rounded-md font-medium">
                        {record.model}
                      </span>
                      <span className="text-xs text-stone-500 font-mono">
                        {record.functionName}
                      </span>
                    </div>
                    <span className="text-xs text-stone-400">
                      {new Date(record.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs text-stone-500">
                    <span>
                      In: {formatBytes(record.metadata?.inputSize || 0)}
                    </span>
                    <span>
                      Out: {formatBytes(record.metadata?.outputSize || 0)}
                    </span>
                    {record.metadata?.latencyMs != null && (
                      <span>{record.metadata.latencyMs}ms</span>
                    )}
                  </div>

                  {/* Autoregressive link */}
                  {record.previousHash && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-stone-400">
                      <RefreshCw className="w-3 h-3" />
                      <span className="font-mono">
                        ← {truncateHash(record.previousHash, 10)}
                      </span>
                    </div>
                  )}
                  {!record.previousHash && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-500">
                      <Shield className="w-3 h-3" />
                      <span className="font-semibold">Genesis Record</span>
                    </div>
                  )}

                  <div className="mt-2 font-mono text-[10px] text-stone-300 group-hover:text-stone-400 transition-colors truncate">
                    chain: {record.chainHash}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Deletion Hash Display */}
        {deletionHash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-sm"
          >
            <p className="text-amber-700 font-semibold mb-1">Chain cleared.</p>
            <p className="font-mono text-xs text-amber-600 break-all">
              Deletion proof: {deletionHash}
            </p>
          </motion.div>
        )}

        {/* Clear Chain */}
        <div className="mt-6 pt-6 border-t border-stone-100">
          {!showClearConfirm ? (
            <button
              onClick={() => setShowClearConfirm(true)}
              disabled={chain.records.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 text-red-500 hover:bg-red-50 rounded-full text-sm font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              Clear Chain
            </button>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-red-600 font-medium">
                Delete all provenance records? This cannot be undone.
              </span>
              <button
                onClick={handleClear}
                disabled={isClearing}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {isClearing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Confirm Delete
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2.5 text-stone-500 hover:bg-stone-100 rounded-full text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
