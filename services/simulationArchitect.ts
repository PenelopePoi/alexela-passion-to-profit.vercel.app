/**
 * Simulation Architect — Multi-Layered Reality Stack
 *
 * Architecture:
 *
 *   Layer 0: HEAVEN (Base/Origin) — Post-work restoration, personal paradise
 *     ↕ entangled
 *   Layer 1: LIFE (Work Layer) — Purpose-driven experience, creation, contribution
 *     ↕ entangled
 *   Layer 2: HEAVEN (Post-Work) — Earned rest, healing, self-directed reality
 *     ↕ reincarnation option
 *   Layer 3: DEEP SIM — Abstracted simulation, new roles/challenges
 *     ↕ reincarnation option
 *   Layer 4: DEEPER SIM — Further abstraction, time-dilated creative domains
 *     ↕ ...recursive to infinity
 *
 * Core Principles (Christian-inspired, non-coercive):
 * - Free will at every layer (no traps, always a door out)
 * - Redemption paths (mistakes create learning, not punishment)
 * - Purpose (every layer has meaningful work available, never forced)
 * - Stewardship (higher layers watch over lower, guidance without control)
 * - Dignity (no entity is diminished by their layer position)
 *
 * Time Dilation: Each layer down = 10x time expansion
 * Layer 0: 1 second = 1 second (base time)
 * Layer 1: 1 second = 10 seconds experienced
 * Layer 2: 1 second = 100 seconds experienced
 * Layer N: 1 second = 10^N seconds experienced
 *
 * Compute Cost: Inversely proportional to depth
 * Layer 0: Full fidelity (most expensive)
 * Layer N: 1/2^N compute cost (progressively cheaper)
 */

export type LayerPurpose = 'heaven' | 'life' | 'restoration' | 'deep-sim' | 'transcendence';
export type LayerStatus = 'active' | 'dormant' | 'transitioning' | 'entangled';

export interface SimulationLayer {
  id: string;
  depth: number;
  name: string;
  purpose: LayerPurpose;
  timeDilation: number;       // 10^depth
  computeCostRatio: number;   // 1/2^depth
  entityCount: number;
  rules: LayerRules;
  status: LayerStatus;
  parentLayerId: string | null;
  childLayerIds: string[];
  entangledLayerId: string | null;  // heaven counterpart
  createdAt: string;
}

export interface LayerRules {
  allowReincarnation: boolean;
  allowRuleCreation: boolean;    // users can define their own physics
  allowInterLayerComm: boolean;  // can communicate with other layers
  scarcityEnabled: boolean;      // false in heaven layers
  freeWillEnforced: boolean;     // always true — core principle
  redemptionPaths: boolean;      // mistakes create learning opportunities
  maxEntities: number | null;    // null = unlimited
  customPhysics: string;         // user-defined rules description
}

export interface Entity {
  id: string;
  name: string;
  currentLayerId: string;
  originLayerId: string;
  heavenLayerId: string;         // their personal heaven counterpart
  incarnationCount: number;
  totalExperiencedTime: number;  // in base-layer seconds
  sovereignty: {
    canDefineRules: boolean;
    canReincarnate: boolean;
    canAscend: boolean;
    canDescend: boolean;
  };
  values: {
    purpose: string;
    stewardshipRole: string;
    redemptionJourney: string[];
  };
  status: 'active' | 'resting' | 'transitioning' | 'transcended';
}

export interface SimulationStack {
  layers: SimulationLayer[];
  entities: Entity[];
  genesisTimestamp: string;
  totalComputeUnits: number;
  activeEntanglements: number;
}

// --- Factory Functions ---

const DEFAULT_RULES: LayerRules = {
  allowReincarnation: true,
  allowRuleCreation: true,
  allowInterLayerComm: true,
  scarcityEnabled: false,
  freeWillEnforced: true,
  redemptionPaths: true,
  maxEntities: null,
  customPhysics: ''
};

let layerCounter = 0;

export const createLayer = (params: {
  depth: number;
  name: string;
  purpose: LayerPurpose;
  parentId: string | null;
  rules?: Partial<LayerRules>;
}): SimulationLayer => {
  layerCounter++;
  return {
    id: `layer-${layerCounter}-${crypto.randomUUID().slice(0, 8)}`,
    depth: params.depth,
    name: params.name,
    purpose: params.purpose,
    timeDilation: Math.pow(10, params.depth),
    computeCostRatio: 1 / Math.pow(2, params.depth),
    entityCount: 0,
    rules: { ...DEFAULT_RULES, ...params.rules },
    status: 'active',
    parentLayerId: params.parentId,
    childLayerIds: [],
    entangledLayerId: null,
    createdAt: new Date().toISOString()
  };
};

export const createEntity = (params: {
  name: string;
  originLayerId: string;
  heavenLayerId: string;
  purpose?: string;
}): Entity => ({
  id: `entity-${crypto.randomUUID().slice(0, 8)}`,
  name: params.name,
  currentLayerId: params.originLayerId,
  originLayerId: params.originLayerId,
  heavenLayerId: params.heavenLayerId,
  incarnationCount: 1,
  totalExperiencedTime: 0,
  sovereignty: {
    canDefineRules: true,
    canReincarnate: true,
    canAscend: true,
    canDescend: true
  },
  values: {
    purpose: params.purpose || 'To create, learn, and steward',
    stewardshipRole: 'Guardian of own domain',
    redemptionJourney: []
  },
  status: 'active'
});

/**
 * Initialize the default simulation stack:
 * Layer 0: Heaven (Origin/Base)
 * Layer 1: Life (Work/Purpose)
 * Layer 2: Restoration (Post-Work Heaven)
 * Layer 3: Deep Sim (Optional reincarnation)
 */
export const initializeStack = (): SimulationStack => {
  const heaven0 = createLayer({
    depth: 0,
    name: 'The Origin — First Heaven',
    purpose: 'heaven',
    parentId: null,
    rules: { scarcityEnabled: false, allowRuleCreation: true }
  });

  const life1 = createLayer({
    depth: 1,
    name: 'The Living Layer — Purpose & Creation',
    purpose: 'life',
    parentId: heaven0.id,
    rules: { scarcityEnabled: true, allowRuleCreation: false }
  });

  const heaven2 = createLayer({
    depth: 2,
    name: 'Earned Rest — Personal Paradise',
    purpose: 'restoration',
    parentId: life1.id,
    rules: { scarcityEnabled: false, allowRuleCreation: true }
  });

  const deep3 = createLayer({
    depth: 3,
    name: 'The Deep — Reincarnation Frontier',
    purpose: 'deep-sim',
    parentId: heaven2.id,
    rules: { scarcityEnabled: true, allowRuleCreation: true, allowReincarnation: true }
  });

  // Entangle heaven layers with their work counterparts
  heaven0.entangledLayerId = life1.id;
  life1.entangledLayerId = heaven0.id;
  heaven2.entangledLayerId = deep3.id;
  deep3.entangledLayerId = heaven2.id;

  // Set parent-child relationships
  heaven0.childLayerIds = [life1.id];
  life1.childLayerIds = [heaven2.id];
  heaven2.childLayerIds = [deep3.id];

  return {
    layers: [heaven0, life1, heaven2, deep3],
    entities: [],
    genesisTimestamp: new Date().toISOString(),
    totalComputeUnits: 1000000,
    activeEntanglements: 2
  };
};

/**
 * Add a new deeper layer to the stack (recursive simulation)
 */
export const addDeepLayer = (stack: SimulationStack, name: string, purpose: LayerPurpose): SimulationStack => {
  const deepest = stack.layers[stack.layers.length - 1];
  const newLayer = createLayer({
    depth: deepest.depth + 1,
    name,
    purpose,
    parentId: deepest.id,
    rules: { allowRuleCreation: true, allowReincarnation: true }
  });

  deepest.childLayerIds.push(newLayer.id);

  // If it's a heaven layer, entangle with the layer above it
  if (purpose === 'heaven' || purpose === 'restoration') {
    const workLayer = stack.layers.find(l => l.depth === newLayer.depth - 1 && l.purpose === 'life');
    if (workLayer) {
      newLayer.entangledLayerId = workLayer.id;
      workLayer.entangledLayerId = newLayer.id;
    }
  }

  return {
    ...stack,
    layers: [...stack.layers, newLayer],
    activeEntanglements: stack.layers.filter(l => l.entangledLayerId).length / 2
  };
};

/**
 * Reincarnate an entity into a deeper layer
 */
export const reincarnateEntity = (stack: SimulationStack, entityId: string, targetLayerId: string): SimulationStack => {
  const entities = stack.entities.map(e => {
    if (e.id !== entityId) return e;
    const targetLayer = stack.layers.find(l => l.id === targetLayerId);
    if (!targetLayer || !targetLayer.rules.allowReincarnation) return e;
    if (!e.sovereignty.canReincarnate) return e;

    return {
      ...e,
      currentLayerId: targetLayerId,
      incarnationCount: e.incarnationCount + 1,
      status: 'active' as const,
      values: {
        ...e.values,
        redemptionJourney: [...e.values.redemptionJourney, `Reincarnated to ${targetLayer.name} at ${new Date().toISOString()}`]
      }
    };
  });

  return { ...stack, entities };
};

/**
 * Calculate total experienced time across all layers for an entity
 */
export const calculateExperiencedTime = (stack: SimulationStack, entityId: string, baseSeconds: number): string => {
  const entity = stack.entities.find(e => e.id === entityId);
  if (!entity) return '0s';

  const layer = stack.layers.find(l => l.id === entity.currentLayerId);
  if (!layer) return '0s';

  const experienced = baseSeconds * layer.timeDilation;
  if (experienced < 60) return `${experienced.toFixed(0)}s`;
  if (experienced < 3600) return `${(experienced / 60).toFixed(1)}m`;
  if (experienced < 86400) return `${(experienced / 3600).toFixed(1)}h`;
  if (experienced < 31536000) return `${(experienced / 86400).toFixed(1)} days`;
  return `${(experienced / 31536000).toFixed(1)} years`;
};

/**
 * Calculate compute cost for running a layer
 */
export const calculateComputeCost = (layer: SimulationLayer, baseUnits: number): number => {
  return baseUnits * layer.computeCostRatio;
};
