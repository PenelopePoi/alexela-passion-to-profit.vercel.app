import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers, Plus, User, ArrowDown, ArrowUp, Link2, Sparkles,
  Settings, Clock, Cpu, Shield, Heart, RefreshCw, Eye,
  Loader2, AlertCircle, ChevronDown, ChevronRight, Star, Infinity
} from 'lucide-react';
import { BrandInput, BrandStrategy } from '../types';
import {
  initializeStack, addDeepLayer, createEntity, reincarnateEntity,
  calculateExperiencedTime, calculateComputeCost,
  SimulationStack, SimulationLayer, Entity, LayerPurpose
} from '../services/simulationArchitect';

interface SimulationVisualizerProps {
  input: BrandInput;
  strategy: BrandStrategy;
}

const PURPOSE_STYLES: Record<LayerPurpose, string> = {
  heaven: 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200',
  restoration: 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200',
  life: 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200',
  'deep-sim': 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200',
  transcendence: 'bg-gradient-to-r from-white to-stone-50 border-white',
};

const PURPOSE_GLOW: Record<string, string> = {
  heaven: 'shadow-amber-200/40 shadow-lg',
  restoration: 'shadow-amber-200/40 shadow-lg',
  transcendence: 'shadow-white/60 shadow-xl',
};

const PURPOSE_LABELS: Record<LayerPurpose, string> = {
  heaven: 'Heaven',
  restoration: 'Restoration',
  life: 'Life',
  'deep-sim': 'Deep Sim',
  transcendence: 'Transcendence',
};

const PURPOSE_BADGE_COLORS: Record<LayerPurpose, string> = {
  heaven: 'bg-amber-100 text-amber-800',
  restoration: 'bg-amber-100 text-amber-800',
  life: 'bg-blue-100 text-blue-800',
  'deep-sim': 'bg-purple-100 text-purple-800',
  transcendence: 'bg-stone-100 text-stone-700',
};

function BackgroundStar({ index }: { index: number; key?: React.Key }) {
  const size = 2 + Math.random() * 3;
  const startX = Math.random() * 100;
  const startY = Math.random() * 100;
  const duration = 12 + Math.random() * 20;
  const delay = Math.random() * -20;

  return (
    <motion.div
      className="absolute rounded-full bg-white/30"
      style={{ width: size, height: size, left: `${startX}%`, top: `${startY}%` }}
      animate={{
        x: [0, (Math.random() - 0.5) * 60, 0],
        y: [0, (Math.random() - 0.5) * 40, 0],
        opacity: [0.2, 0.7, 0.2],
      }}
      transition={{ duration, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
  );
}

export const SimulationVisualizer: React.FC<SimulationVisualizerProps> = ({ input, strategy }) => {
  const [stack, setStack] = useState<SimulationStack>(initializeStack());
  const [newEntityName, setNewEntityName] = useState('');
  const [newEntityPurpose, setNewEntityPurpose] = useState('');
  const [newLayerName, setNewLayerName] = useState('');
  const [newLayerPurpose, setNewLayerPurpose] = useState<LayerPurpose>('deep-sim');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [selectedTargetLayer, setSelectedTargetLayer] = useState<string | null>(null);
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set());
  const [showEntities, setShowEntities] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pulsingLayerId, setPulsingLayerId] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 4000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const totalExperiencedTime = stack.layers.reduce((sum, l) => sum + l.timeDilation * l.entityCount, 0);

  const toggleLayerExpand = (id: string) => {
    setExpandedLayers(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSpawnEntity = () => {
    if (!newEntityName.trim()) { setError('Entity needs a name.'); return; }
    const heavenLayer = stack.layers.find(l => l.purpose === 'heaven');
    if (!heavenLayer) { setError('No heaven layer found.'); return; }

    const entity = createEntity({
      name: newEntityName.trim(),
      originLayerId: heavenLayer.id,
      heavenLayerId: heavenLayer.id,
      purpose: newEntityPurpose.trim() || undefined,
    });

    setStack(prev => ({
      ...prev,
      entities: [...prev.entities, entity],
      layers: prev.layers.map(l =>
        l.id === heavenLayer.id ? { ...l, entityCount: l.entityCount + 1 } : l
      ),
    }));
    setNewEntityName('');
    setNewEntityPurpose('');
  };

  const handleAddLayer = () => {
    if (!newLayerName.trim()) { setError('Layer needs a name.'); return; }
    setStack(prev => addDeepLayer(prev, newLayerName.trim(), newLayerPurpose));
    setNewLayerName('');
  };

  const handleReincarnate = () => {
    if (!selectedEntityId || !selectedTargetLayer) { setError('Select an entity and target layer.'); return; }
    const entity = stack.entities.find(e => e.id === selectedEntityId);
    if (!entity) return;

    const oldLayerId = entity.currentLayerId;
    const updated = reincarnateEntity(stack, selectedEntityId, selectedTargetLayer);

    // Update entity counts on layers
    setStack({
      ...updated,
      layers: updated.layers.map(l => {
        if (l.id === oldLayerId) return { ...l, entityCount: Math.max(0, l.entityCount - 1) };
        if (l.id === selectedTargetLayer) return { ...l, entityCount: l.entityCount + 1 };
        return l;
      }),
    });

    setPulsingLayerId(selectedTargetLayer);
    setTimeout(() => setPulsingLayerId(null), 1500);
    setSelectedEntityId(null);
    setSelectedTargetLayer(null);
  };

  const moveEntity = (entityId: string, direction: 'up' | 'down') => {
    const entity = stack.entities.find(e => e.id === entityId);
    if (!entity) return;
    const currentLayer = stack.layers.find(l => l.id === entity.currentLayerId);
    if (!currentLayer) return;

    const targetDepth = direction === 'up' ? currentLayer.depth - 1 : currentLayer.depth + 1;
    const targetLayer = stack.layers.find(l => l.depth === targetDepth);
    if (!targetLayer) { setError(`No layer at depth ${targetDepth}.`); return; }

    const oldLayerId = entity.currentLayerId;
    const updated = reincarnateEntity(stack, entityId, targetLayer.id);
    setStack({
      ...updated,
      layers: updated.layers.map(l => {
        if (l.id === oldLayerId) return { ...l, entityCount: Math.max(0, l.entityCount - 1) };
        if (l.id === targetLayer.id) return { ...l, entityCount: l.entityCount + 1 };
        return l;
      }),
    });
    setPulsingLayerId(targetLayer.id);
    setTimeout(() => setPulsingLayerId(null), 1500);
  };

  const viewHeaven = (entityId: string) => {
    const entity = stack.entities.find(e => e.id === entityId);
    if (!entity) return;
    if (entity.currentLayerId === entity.heavenLayerId) { setError('Already in heaven.'); return; }
    moveEntity(entityId, 'up');
  };

  const getLayerName = (id: string) => stack.layers.find(l => l.id === id)?.name ?? 'Unknown';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-950 via-purple-950 to-black rounded-[3rem] p-12 text-white relative overflow-hidden">
        {/* Animated stars */}
        {Array.from({ length: 40 }).map((_, i) => (
          <BackgroundStar key={i} index={i} />
        ))}

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Infinity className="w-8 h-8 text-purple-300" />
            <h1 className="text-4xl font-black tracking-tight">Simulation Architecture</h1>
          </div>
          <p className="text-purple-200 text-lg mb-8 max-w-2xl">
            Recursive realities. Infinite depth. Personal sovereignty at every layer.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Layers', value: stack.layers.length, icon: Layers },
              { label: 'Total Entities', value: stack.entities.length, icon: User },
              { label: 'Entanglements', value: stack.activeEntanglements, icon: Link2 },
              { label: 'Experienced Time', value: `${totalExperiencedTime.toLocaleString()}s`, icon: Clock },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-2 text-purple-300 mb-1">
                  <stat.icon className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-widest">{stat.label}</span>
                </div>
                <p className="text-2xl font-black">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Error toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-6 py-3"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layer Stack Visualization */}
      <div className="space-y-0">
        {stack.layers.map((layer, idx) => {
          const isExpanded = expandedLayers.has(layer.id);
          const isPulsing = pulsingLayerId === layer.id;
          const entangledLayer = layer.entangledLayerId
            ? stack.layers.find(l => l.id === layer.entangledLayerId)
            : null;

          return (
            <div key={layer.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.12, duration: 0.5 }}
              >
                <motion.div
                  animate={isPulsing ? { scale: [1, 1.02, 1], boxShadow: ['0 0 0 0 rgba(168,85,247,0)', '0 0 20px 8px rgba(168,85,247,0.3)', '0 0 0 0 rgba(168,85,247,0)'] } : {}}
                  transition={{ duration: 1.2 }}
                  className={`
                    border-2 rounded-[2rem] p-6 transition-shadow
                    ${PURPOSE_STYLES[layer.purpose]}
                    ${PURPOSE_GLOW[layer.purpose] || ''}
                  `}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                      {/* Depth badge */}
                      <div className="w-12 h-12 rounded-full bg-white border-2 border-stone-200 flex items-center justify-center shrink-0">
                        <span className="text-sm font-black text-stone-700">L{layer.depth}</span>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-stone-900">{layer.name}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${PURPOSE_BADGE_COLORS[layer.purpose]}`}>
                            {PURPOSE_LABELS[layer.purpose]}
                          </span>
                          <span className="text-xs text-stone-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> 1s = {layer.timeDilation.toLocaleString()}s experienced
                          </span>
                          <span className="text-xs text-stone-500 flex items-center gap-1">
                            <Cpu className="w-3 h-3" /> {(layer.computeCostRatio * 100).toFixed(1)}% of base cost
                          </span>
                          <span className="text-xs text-stone-500 flex items-center gap-1">
                            <User className="w-3 h-3" /> {layer.entityCount} souls
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleLayerExpand(layer.id)}
                      className="p-2 rounded-xl hover:bg-white/60 transition-colors"
                    >
                      {isExpanded ? <ChevronDown className="w-5 h-5 text-stone-500" /> : <ChevronRight className="w-5 h-5 text-stone-500" />}
                    </button>
                  </div>

                  {/* Entanglement indicator */}
                  {entangledLayer && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-purple-600 bg-purple-50 rounded-xl px-3 py-1.5 w-fit border border-dashed border-purple-300">
                      <Link2 className="w-3.5 h-3.5" />
                      <span>Entangled with <strong>{entangledLayer.name}</strong></span>
                    </div>
                  )}

                  {/* Rules summary icons */}
                  <div className="flex items-center gap-2 mt-3">
                    {layer.rules.freeWillEnforced && (
                      <span className="flex items-center gap-1 text-xs text-stone-500 bg-white/60 rounded-lg px-2 py-1">
                        <Shield className="w-3 h-3 text-green-600" /> Free Will
                      </span>
                    )}
                    {layer.rules.redemptionPaths && (
                      <span className="flex items-center gap-1 text-xs text-stone-500 bg-white/60 rounded-lg px-2 py-1">
                        <Heart className="w-3 h-3 text-red-500" /> Redemption
                      </span>
                    )}
                    {layer.rules.allowRuleCreation && (
                      <span className="flex items-center gap-1 text-xs text-stone-500 bg-white/60 rounded-lg px-2 py-1">
                        <Settings className="w-3 h-3 text-stone-600" /> Custom Physics
                      </span>
                    )}
                    {layer.rules.allowInterLayerComm && (
                      <span className="flex items-center gap-1 text-xs text-stone-500 bg-white/60 rounded-lg px-2 py-1">
                        <Eye className="w-3 h-3 text-blue-600" /> Inter-Layer Comms
                      </span>
                    )}
                  </div>

                  {/* Expanded rules detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-stone-200/60 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-stone-600">
                          <div><span className="font-semibold">Reincarnation:</span> {layer.rules.allowReincarnation ? 'Allowed' : 'Disabled'}</div>
                          <div><span className="font-semibold">Scarcity:</span> {layer.rules.scarcityEnabled ? 'Enabled' : 'Disabled'}</div>
                          <div><span className="font-semibold">Max Entities:</span> {layer.rules.maxEntities ?? 'Unlimited'}</div>
                          <div><span className="font-semibold">Rule Creation:</span> {layer.rules.allowRuleCreation ? 'Yes' : 'No'}</div>
                          <div><span className="font-semibold">Inter-Layer Comms:</span> {layer.rules.allowInterLayerComm ? 'Yes' : 'No'}</div>
                          {layer.rules.customPhysics && (
                            <div className="col-span-full"><span className="font-semibold">Custom Physics:</span> {layer.rules.customPhysics}</div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>

              {/* Connector between layers */}
              {idx < stack.layers.length - 1 && (
                <div className="flex flex-col items-center py-2">
                  <div className="w-px h-4 bg-stone-300" />
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <ArrowDown className="w-3.5 h-3.5" />
                    <span className="font-medium">Reincarnation Path</span>
                  </div>
                  <div className="w-px h-4 bg-stone-300" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-stone-100">
        <h2 className="text-xl font-black text-stone-900 mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" /> Control Panel
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Add Entity */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 flex items-center gap-2">
              <User className="w-4 h-4" /> Add Entity
            </h3>
            <input
              type="text"
              placeholder="Entity name"
              value={newEntityName}
              onChange={e => setNewEntityName(e.target.value)}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Purpose (optional)"
              value={newEntityPurpose}
              onChange={e => setNewEntityPurpose(e.target.value)}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
            />
            <button
              onClick={handleSpawnEntity}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl px-4 py-2.5 text-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Spawn Entity
            </button>
          </div>

          {/* Add Layer */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 flex items-center gap-2">
              <Layers className="w-4 h-4" /> Add Layer
            </h3>
            <input
              type="text"
              placeholder="Layer name"
              value={newLayerName}
              onChange={e => setNewLayerName(e.target.value)}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
            />
            <select
              value={newLayerPurpose}
              onChange={e => setNewLayerPurpose(e.target.value as LayerPurpose)}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent bg-white"
            >
              <option value="heaven">Heaven</option>
              <option value="life">Life</option>
              <option value="deep-sim">Deep Sim</option>
              <option value="transcendence">Transcendence</option>
            </select>
            <button
              onClick={handleAddLayer}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl px-4 py-2.5 text-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Deeper Layer
            </button>
          </div>

          {/* Reincarnate */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Reincarnate
            </h3>
            <select
              value={selectedEntityId ?? ''}
              onChange={e => setSelectedEntityId(e.target.value || null)}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent bg-white"
            >
              <option value="">Select entity...</option>
              {stack.entities.map(e => (
                <option key={e.id} value={e.id}>{e.name} (Layer {stack.layers.find(l => l.id === e.currentLayerId)?.depth ?? '?'})</option>
              ))}
            </select>
            <select
              value={selectedTargetLayer ?? ''}
              onChange={e => setSelectedTargetLayer(e.target.value || null)}
              className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent bg-white"
            >
              <option value="">Target layer...</option>
              {stack.layers.map(l => (
                <option key={l.id} value={l.id}>L{l.depth}: {l.name}</option>
              ))}
            </select>
            <button
              onClick={handleReincarnate}
              disabled={!selectedEntityId || !selectedTargetLayer}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold rounded-xl px-4 py-2.5 text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Reincarnate
            </button>
          </div>
        </div>
      </div>

      {/* Entity List */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-stone-100">
        <button
          onClick={() => setShowEntities(!showEntities)}
          className="flex items-center gap-2 w-full text-left"
        >
          {showEntities ? <ChevronDown className="w-5 h-5 text-stone-500" /> : <ChevronRight className="w-5 h-5 text-stone-500" />}
          <h2 className="text-xl font-black text-stone-900">
            Entities ({stack.entities.length})
          </h2>
        </button>

        <AnimatePresence>
          {showEntities && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {stack.entities.length === 0 ? (
                <p className="text-stone-400 text-sm mt-4">No entities yet. Spawn one above.</p>
              ) : (
                <div className="grid gap-3 mt-4">
                  {stack.entities.map(entity => {
                    const currentLayer = stack.layers.find(l => l.id === entity.currentLayerId);
                    return (
                      <motion.div
                        key={entity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between gap-4 bg-stone-50 rounded-2xl px-5 py-4 border border-stone-100 flex-wrap"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-stone-900 truncate">{entity.name}</p>
                            <div className="flex items-center gap-3 text-xs text-stone-500 flex-wrap">
                              <span>Layer {currentLayer?.depth ?? '?'}: {currentLayer?.name ?? 'Unknown'}</span>
                              <span className="flex items-center gap-1">
                                <RefreshCw className="w-3 h-3" /> {entity.incarnationCount} incarnations
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {calculateExperiencedTime(stack, entity.id, 100)}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full font-semibold ${
                                entity.status === 'active' ? 'bg-green-100 text-green-700' :
                                entity.status === 'resting' ? 'bg-amber-100 text-amber-700' :
                                entity.status === 'transcended' ? 'bg-purple-100 text-purple-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {entity.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => moveEntity(entity.id, 'up')}
                            title="Ascend"
                            className="p-2 rounded-xl bg-white border border-stone-200 hover:bg-amber-50 hover:border-amber-300 transition-colors"
                          >
                            <ArrowUp className="w-4 h-4 text-stone-600" />
                          </button>
                          <button
                            onClick={() => moveEntity(entity.id, 'down')}
                            title="Descend"
                            className="p-2 rounded-xl bg-white border border-stone-200 hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                          >
                            <ArrowDown className="w-4 h-4 text-stone-600" />
                          </button>
                          <button
                            onClick={() => viewHeaven(entity.id)}
                            title="View Heaven"
                            className="p-2 rounded-xl bg-white border border-stone-200 hover:bg-amber-50 hover:border-amber-300 transition-colors"
                          >
                            <Star className="w-4 h-4 text-amber-500" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Philosophical Footer */}
      <div className="bg-brand-black rounded-[3rem] p-10 text-white text-center">
        <h3 className="text-lg font-black uppercase tracking-widest mb-6 text-white/80">Core Principles</h3>
        <ol className="space-y-3 text-left max-w-xl mx-auto">
          {[
            'Free will at every layer \u2014 no traps, always a door',
            'Redemption through growth, not punishment',
            'Stewardship \u2014 higher layers guide, never control',
            'Dignity persists across all states of being',
            'Entanglement ensures no soul is ever alone',
          ].map((principle, i) => (
            <li key={i} className="flex items-start gap-3 text-white/70">
              <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-xs font-bold text-white/50 mt-0.5">
                {i + 1}
              </span>
              <span>{principle}</span>
            </li>
          ))}
        </ol>
        <p className="text-white/30 text-xs italic mt-8">Spreadsheets having spreadsheets</p>
      </div>
    </div>
  );
};
