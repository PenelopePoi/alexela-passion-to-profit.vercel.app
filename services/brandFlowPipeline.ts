export type FlowNodeId = 'strategy' | 'colors' | 'typography' | 'logos' | 'guidelines' | 'calendar' | 'emails' | 'social' | 'ads';
export type FlowNodeStatus = 'idle' | 'running' | 'done' | 'stale' | 'error';

export interface FlowNode {
  id: FlowNodeId;
  label: string;
  depends: FlowNodeId[];
  status: FlowNodeStatus;
}

export interface FlowState {
  nodes: Record<FlowNodeId, FlowNode>;
  isAutoFlowEnabled: boolean;
  lastRunAt: number | null;
}

export const FLOW_GRAPH: Record<FlowNodeId, { label: string; depends: FlowNodeId[] }> = {
  strategy:   { label: 'Strategy',    depends: [] },
  colors:     { label: 'Colors',      depends: ['strategy'] },
  typography: { label: 'Typography',  depends: ['strategy'] },
  logos:      { label: 'Logos',        depends: ['strategy', 'colors', 'typography'] },
  guidelines: { label: 'Guidelines',  depends: ['colors', 'typography', 'logos'] },
  calendar:   { label: 'Calendar',    depends: ['strategy'] },
  emails:     { label: 'Emails',      depends: ['strategy', 'colors', 'typography'] },
  social:     { label: 'Social',      depends: ['strategy', 'colors', 'logos'] },
  ads:        { label: 'Ads',         depends: ['strategy', 'colors', 'logos', 'social'] },
};

export const NODE_TAB_MAP: Record<FlowNodeId, string> = {
  strategy:   'identity',
  colors:     'identity',
  typography: 'identity',
  logos:      'identity',
  guidelines: 'identity',
  calendar:   'marketing',
  emails:     'marketing',
  social:     'marketing',
  ads:        'marketing',
};

export const createInitialFlowState = (): FlowState => {
  const nodes = {} as Record<FlowNodeId, FlowNode>;
  for (const [id, def] of Object.entries(FLOW_GRAPH)) {
    nodes[id as FlowNodeId] = {
      id: id as FlowNodeId,
      label: def.label,
      depends: def.depends,
      status: 'idle',
    };
  }
  return { nodes, isAutoFlowEnabled: false, lastRunAt: null };
};

export const getExecutionOrder = (): FlowNodeId[] => {
  const visited = new Set<FlowNodeId>();
  const order: FlowNodeId[] = [];

  const visit = (id: FlowNodeId) => {
    if (visited.has(id)) return;
    visited.add(id);
    for (const dep of FLOW_GRAPH[id].depends) {
      visit(dep);
    }
    order.push(id);
  };

  for (const id of Object.keys(FLOW_GRAPH) as FlowNodeId[]) {
    visit(id);
  }

  return order;
};

export const getRunnableNodes = (state: FlowState): FlowNodeId[] => {
  return (Object.keys(FLOW_GRAPH) as FlowNodeId[]).filter((id) => {
    const node = state.nodes[id];
    if (node.status !== 'idle' && node.status !== 'stale') return false;
    return node.depends.every((dep) => state.nodes[dep].status === 'done');
  });
};

export const getStaleNodes = (changedNodeId: FlowNodeId, state: FlowState): FlowNodeId[] => {
  const stale = new Set<FlowNodeId>();

  const propagate = (id: FlowNodeId) => {
    for (const [nodeId, def] of Object.entries(FLOW_GRAPH)) {
      if (def.depends.includes(id) && !stale.has(nodeId as FlowNodeId)) {
        const node = state.nodes[nodeId as FlowNodeId];
        if (node.status === 'done') {
          stale.add(nodeId as FlowNodeId);
          propagate(nodeId as FlowNodeId);
        }
      }
    }
  };

  propagate(changedNodeId);
  return Array.from(stale);
};

export const getTabForNode = (nodeId: FlowNodeId): string => {
  return NODE_TAB_MAP[nodeId];
};
