import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Send, Loader2, Check, Circle, AlertCircle, Zap, Play, Clock, FileText, Sparkles } from 'lucide-react';
import { BrandInput, BrandStrategy } from '../types';
import {
  decomposeWorkRequest,
  generateBrandStrategy,
  generateBrandingPackages,
  generateContentCalendar,
  generateEmailTemplates,
  generateBrandGuidelines,
  generateAdAssets,
  generateFlyerCopy,
  generateBrandStory,
  regenerateTaglines,
  generateSalesPitch,
} from '../services/geminiService';

interface TaskStep {
  id: string;
  label: string;
  functionName: string;
  status: 'pending' | 'running' | 'done' | 'error';
  result?: any;
  error?: string;
}

interface TaskRun {
  id: string;
  request: string;
  steps: TaskStep[];
  status: 'planning' | 'running' | 'done' | 'error';
  startedAt: number;
  completedAt?: number;
}

interface BrandEmployeeProps {
  input: BrandInput;
  strategy: BrandStrategy;
  onUpdateStrategy: (updated: Partial<BrandStrategy>) => void;
}

const PLACEHOLDERS = [
  'Prepare everything for my Thursday client meeting...',
  'Build a complete social media launch kit',
  'Generate brand guidelines + email templates + content calendar',
];

const resultLabel = (functionName: string): string => {
  const map: Record<string, string> = {
    generateBrandStrategy: 'Brand Strategy',
    generateBrandingPackages: 'Branding Packages',
    generateContentCalendar: 'Content Calendar',
    generateEmailTemplates: 'Email Templates',
    generateBrandGuidelines: 'Brand Guidelines',
    generateAdAssets: 'Ad Assets',
    generateFlyerCopy: 'Flyer Copy',
    generateBrandStory: 'Brand Story',
    regenerateTaglines: 'Taglines',
    generateSalesPitch: 'Sales Pitch',
  };
  return map[functionName] || functionName;
};

const truncatePreview = (data: any): string => {
  if (typeof data === 'string') return data.slice(0, 180) + (data.length > 180 ? '...' : '');
  if (Array.isArray(data)) return `${data.length} items generated`;
  if (typeof data === 'object' && data !== null) {
    const keys = Object.keys(data);
    return `${keys.length} sections: ${keys.slice(0, 4).join(', ')}${keys.length > 4 ? '...' : ''}`;
  }
  return String(data).slice(0, 120);
};

export const BrandEmployee: React.FC<BrandEmployeeProps> = ({ input, strategy, onUpdateStrategy }) => {
  const [request, setRequest] = useState('');
  const [currentRun, setCurrentRun] = useState<TaskRun | null>(null);
  const [pastRuns, setPastRuns] = useState<TaskRun[]>([]);
  const [isPlanning, setIsPlanning] = useState(false);
  const [expandedPast, setExpandedPast] = useState<string | null>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const placeholderIdx = useRef(0);
  const [placeholder, setPlaceholder] = useState(PLACEHOLDERS[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      placeholderIdx.current = (placeholderIdx.current + 1) % PLACEHOLDERS.length;
      setPlaceholder(PLACEHOLDERS[placeholderIdx.current]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (stepsRef.current) {
      stepsRef.current.scrollTop = stepsRef.current.scrollHeight;
    }
  }, [currentRun?.steps]);

  const executeStep = async (step: TaskStep): Promise<any> => {
    switch (step.functionName) {
      case 'generateBrandStrategy': {
        const result = await generateBrandStrategy(input);
        onUpdateStrategy(result);
        return result;
      }
      case 'generateBrandingPackages': {
        const result = await generateBrandingPackages(input);
        onUpdateStrategy({ packages: result });
        return result;
      }
      case 'generateContentCalendar': {
        const result = await generateContentCalendar(input, strategy);
        onUpdateStrategy({ contentCalendar: result });
        return result;
      }
      case 'generateEmailTemplates': {
        const result = await generateEmailTemplates(input, strategy);
        onUpdateStrategy({ emailTemplates: result });
        return result;
      }
      case 'generateBrandGuidelines': {
        const result = await generateBrandGuidelines(input, strategy);
        onUpdateStrategy({ brandGuidelines: result });
        return result;
      }
      case 'generateAdAssets': {
        const result = await generateAdAssets(input, strategy);
        return result;
      }
      case 'generateFlyerCopy': {
        const result = await generateFlyerCopy(input, strategy);
        onUpdateStrategy({ flyerCopy: result });
        return result;
      }
      case 'generateBrandStory': {
        const result = await generateBrandStory(input, strategy);
        onUpdateStrategy({ brandStory: result });
        return result;
      }
      case 'regenerateTaglines': {
        const result = await regenerateTaglines(input);
        onUpdateStrategy({ taglines: result });
        return result;
      }
      case 'generateSalesPitch': {
        const result = await generateSalesPitch(input, strategy);
        return result;
      }
      default:
        throw new Error(`Unknown function: ${step.functionName}`);
    }
  };

  const handleDeploy = async () => {
    if (!request.trim() || isPlanning || currentRun?.status === 'running') return;

    setIsPlanning(true);

    try {
      const plan = await decomposeWorkRequest(request.trim(), {
        companyName: input.companyName,
        industry: input.industry,
        vibe: input.vibe,
        audience: input.audience,
      });

      const steps: TaskStep[] = plan.steps.map((s) => ({
        ...s,
        status: 'pending' as const,
      }));

      const run: TaskRun = {
        id: `run-${Date.now()}`,
        request: request.trim(),
        steps,
        status: 'running',
        startedAt: Date.now(),
      };

      setCurrentRun(run);
      setIsPlanning(false);
      setRequest('');

      // Execute steps sequentially
      for (let i = 0; i < steps.length; i++) {
        setCurrentRun((prev) => {
          if (!prev) return prev;
          const updated = { ...prev, steps: [...prev.steps] };
          updated.steps[i] = { ...updated.steps[i], status: 'running' };
          return updated;
        });

        try {
          const result = await executeStep(steps[i]);
          setCurrentRun((prev) => {
            if (!prev) return prev;
            const updated = { ...prev, steps: [...prev.steps] };
            updated.steps[i] = { ...updated.steps[i], status: 'done', result };
            return updated;
          });
        } catch (err: any) {
          setCurrentRun((prev) => {
            if (!prev) return prev;
            const updated = { ...prev, steps: [...prev.steps] };
            updated.steps[i] = { ...updated.steps[i], status: 'error', error: err.message };
            return updated;
          });
        }
      }

      // Finalize
      setCurrentRun((prev) => {
        if (!prev) return prev;
        const hasError = prev.steps.some((s) => s.status === 'error');
        return { ...prev, status: hasError ? 'error' : 'done', completedAt: Date.now() };
      });
    } catch (err: any) {
      setIsPlanning(false);
      setCurrentRun({
        id: `run-${Date.now()}`,
        request: request.trim(),
        steps: [],
        status: 'error',
        startedAt: Date.now(),
        completedAt: Date.now(),
      });
    }
  };

  const handleFinishRun = () => {
    if (currentRun && (currentRun.status === 'done' || currentRun.status === 'error')) {
      setPastRuns((prev) => [currentRun, ...prev]);
      setCurrentRun(null);
    }
  };

  const doneCount = currentRun?.steps.filter((s) => s.status === 'done').length || 0;
  const totalCount = currentRun?.steps.length || 0;
  const progress = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;

  const StatusIcon = ({ status }: { status: TaskStep['status'] }) => {
    switch (status) {
      case 'pending':
        return <Circle className="w-4 h-4 text-stone-300" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-brand-teal animate-spin" />;
      case 'done':
        return <Check className="w-4 h-4 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const elapsed = currentRun
    ? ((currentRun.completedAt || Date.now()) - currentRun.startedAt) / 1000
    : 0;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-brand-teal/10 flex items-center justify-center">
          <Bot className="w-5 h-5 text-brand-teal" />
        </div>
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-stone-400">
            AI Employee
          </h2>
          <p className="text-sm text-stone-500">
            Describe what you need — I'll handle everything
          </p>
        </div>
      </div>

      {/* Input Section */}
      {!currentRun && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <textarea
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            placeholder={placeholder}
            className="w-full h-32 px-6 py-4 rounded-[2rem] border border-stone-200 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 outline-none text-lg resize-none transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.metaKey) handleDeploy();
            }}
          />
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-stone-400 tracking-wide">
              {isPlanning ? 'Planning work...' : '⌘ + Enter to deploy'}
            </p>
            <button
              onClick={handleDeploy}
              disabled={!request.trim() || isPlanning}
              className="bg-brand-black text-white rounded-2xl px-8 py-4 font-black text-[10px] uppercase tracking-widest hover:bg-brand-lavender transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPlanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Planning
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Deploy Employee
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Active Run */}
      <AnimatePresence>
        {currentRun && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="space-y-4"
          >
            {/* Progress bar */}
            <div className="h-1 w-full bg-stone-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-brand-teal rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>

            {/* Plan header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-brand-teal" />
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                  Work Plan
                </span>
                <span className="text-[10px] text-stone-400">
                  — {doneCount}/{totalCount} steps
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-stone-400">
                <Clock className="w-3 h-3" />
                {elapsed.toFixed(1)}s
              </div>
            </div>

            {/* Request */}
            <p className="text-sm text-stone-600 italic">"{currentRun.request}"</p>

            {/* Step timeline */}
            <div ref={stepsRef} className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {currentRun.steps.map((step, i) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                    step.status === 'running'
                      ? 'bg-brand-teal/5 border-brand-teal'
                      : step.status === 'done'
                      ? 'border-l-2 border-l-emerald-400 border-stone-100 bg-white'
                      : step.status === 'error'
                      ? 'border-red-200 bg-red-50/50'
                      : 'border-stone-100 bg-white'
                  }`}
                >
                  <div className="mt-0.5">
                    <StatusIcon status={step.status} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800">{step.label}</p>
                    <p className="text-[10px] text-stone-400 tracking-wide">
                      {step.functionName}
                    </p>
                    {step.error && (
                      <p className="text-xs text-red-500 mt-1">{step.error}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Results */}
            {doneCount > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-lavender" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                    Results
                  </span>
                </div>
                <div className="grid gap-2">
                  {currentRun.steps
                    .filter((s) => s.status === 'done' && s.result)
                    .map((step) => (
                      <div
                        key={step.id + '-result'}
                        className="bg-stone-50 rounded-2xl p-4 border border-stone-100"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-3.5 h-3.5 text-stone-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">
                            {resultLabel(step.functionName)}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 leading-relaxed">
                          {truncatePreview(step.result)}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Done / dismiss */}
            {(currentRun.status === 'done' || currentRun.status === 'error') && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleFinishRun}
                className="w-full bg-brand-black text-white rounded-2xl px-8 py-4 font-black text-[10px] uppercase tracking-widest hover:bg-brand-lavender transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                {currentRun.status === 'done' ? 'Done — Start New Task' : 'Dismiss — Try Again'}
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Past Runs */}
      {pastRuns.length > 0 && !currentRun && (
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
            History
          </span>
          {pastRuns.map((run) => {
            const isExpanded = expandedPast === run.id;
            const runDone = run.steps.filter((s) => s.status === 'done').length;
            const duration = run.completedAt
              ? ((run.completedAt - run.startedAt) / 1000).toFixed(1)
              : '—';
            return (
              <motion.div
                key={run.id}
                layout
                className="border border-stone-100 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedPast(isExpanded ? null : run.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-stone-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-700 truncate">
                      {run.request}
                    </p>
                    <p className="text-[10px] text-stone-400">
                      {runDone}/{run.steps.length} steps · {duration}s
                    </p>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      run.status === 'done' ? 'bg-emerald-400' : 'bg-red-400'
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-stone-100"
                    >
                      <div className="p-4 space-y-2">
                        {run.steps
                          .filter((s) => s.status === 'done' && s.result)
                          .map((step) => (
                            <div
                              key={step.id + '-hist'}
                              className="bg-stone-50 rounded-2xl p-3 border border-stone-100"
                            >
                              <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">
                                {resultLabel(step.functionName)}
                              </span>
                              <p className="text-xs text-stone-500 mt-1">
                                {truncatePreview(step.result)}
                              </p>
                            </div>
                          ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
