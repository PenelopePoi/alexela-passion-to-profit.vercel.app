import { motion } from 'motion/react';
import { Zap, Check, AlertTriangle, Loader2, Play, ChevronRight } from 'lucide-react';
import type { FlowState, FlowNodeId, FlowNodeStatus } from '../services/brandFlowPipeline';
import { getExecutionOrder } from '../services/brandFlowPipeline';

interface BrandFlowStatusProps {
  flowState: FlowState;
  onToggleAutoFlow: () => void;
  onRunFullPackage: () => void;
  onNodeClick: (nodeId: FlowNodeId) => void;
  isRunning: boolean;
}

const statusColor: Record<FlowNodeStatus, string> = {
  idle: 'bg-gray-500',
  running: 'bg-blue-500',
  done: 'bg-emerald-500',
  stale: 'bg-yellow-500',
  error: 'bg-red-500',
};

const StatusIcon = ({ status }: { status: FlowNodeStatus }) => {
  switch (status) {
    case 'done':
      return <Check className="w-3 h-3 text-emerald-400" />;
    case 'running':
      return (
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <Loader2 className="w-3 h-3 text-blue-400" />
        </motion.div>
      );
    case 'error':
      return <AlertTriangle className="w-3 h-3 text-red-400" />;
    case 'stale':
      return <AlertTriangle className="w-3 h-3 text-yellow-400" />;
    default:
      return null;
  }
};

const BrandFlowStatus = ({
  flowState,
  onToggleAutoFlow,
  onRunFullPackage,
  onNodeClick,
  isRunning,
}: BrandFlowStatusProps) => {
  const order = getExecutionOrder();
  const doneCount = Object.values(flowState?.nodes ?? {}).filter((n) => n.status === 'done').length;
  const totalCount = Object.values(flowState?.nodes ?? {}).length;

  return (
    <div className="glass-dark rounded-[2rem] p-4 mb-8">
      {/* Node pills row */}
      <div className="flex items-center gap-1 overflow-x-auto pb-3 scrollbar-hide">
        {order.map((nodeId, i) => {
          const node = flowState?.nodes?.[nodeId];
          if (!node) return null;
          return (
            <div key={nodeId} className="flex items-center shrink-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNodeClick(nodeId)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
              >
                <span className="relative flex h-2.5 w-2.5">
                  {node.status === 'running' && (
                    <motion.span
                      className="absolute inset-0 rounded-full bg-blue-400"
                      animate={{ opacity: [1, 0.3, 1], scale: [1, 1.6, 1] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                    />
                  )}
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${statusColor[node.status]}`} />
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/70">
                  {node.label}
                </span>
                <StatusIcon status={node.status} />
              </motion.button>
              {i < order.length - 1 && (
                <ChevronRight className="w-3 h-3 text-white/20 mx-0.5 shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/5">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onRunFullPackage}
            disabled={isRunning}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-brand-teal text-black font-black text-[10px] uppercase tracking-widest disabled:opacity-40 transition-opacity cursor-pointer"
          >
            {isRunning ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <Loader2 className="w-3.5 h-3.5" />
              </motion.div>
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            {isRunning ? 'Generating...' : 'Generate Full Package'}
          </motion.button>
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
            {doneCount}/{totalCount} complete
          </span>
        </div>

        <button
          onClick={onToggleAutoFlow}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:border-white/20 transition-colors cursor-pointer"
        >
          <Zap className={`w-3.5 h-3.5 ${flowState.isAutoFlowEnabled ? 'text-brand-teal' : 'text-white/30'}`} />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
            Auto-Flow
          </span>
          <div
            className={`w-8 h-4 rounded-full relative transition-colors ${
              flowState.isAutoFlowEnabled ? 'bg-brand-teal/40' : 'bg-white/10'
            }`}
          >
            <motion.div
              className="absolute top-0.5 w-3 h-3 rounded-full bg-white"
              animate={{ left: flowState.isAutoFlowEnabled ? '18px' : '2px' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </div>
        </button>
      </div>
    </div>
  );
};

export default BrandFlowStatus;
