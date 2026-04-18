/**
 * Provenance Tracer — Autoregressive Origin Chain
 *
 * Every AI generation gets a provenance record:
 * - Input hash (what went in)
 * - Output hash (what came out)
 * - Model ID (which model generated it)
 * - Timestamp
 * - Previous record hash (autoregressive chain)
 *
 * The chain is append-only — tampering with any record
 * invalidates everything after it.
 */

export interface ProvenanceRecord {
  id: string;
  timestamp: string;
  model: string;
  functionName: string;
  inputHash: string;
  outputHash: string;
  previousHash: string | null;  // autoregressive link
  chainHash: string;            // hash of this entire record
  metadata?: {
    inputSize: number;
    outputSize: number;
    latencyMs?: number;
  };
}

export interface ProvenanceChain {
  records: ProvenanceRecord[];
  genesisHash: string;
  lastHash: string;
  integrity: boolean;
}

// SHA-256 helper
const sha256 = async (data: string): Promise<string> => {
  const encoded = new TextEncoder().encode(data);
  const hash = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
};

// Storage key
const CHAIN_KEY = 'xela-provenance-chain';

/**
 * Get the current provenance chain from localStorage
 */
export const getChain = (): ProvenanceChain => {
  try {
    const stored = localStorage.getItem(CHAIN_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { records: [], genesisHash: '', lastHash: '', integrity: true };
};

/**
 * Save chain to localStorage
 */
const saveChain = (chain: ProvenanceChain): void => {
  localStorage.setItem(CHAIN_KEY, JSON.stringify(chain));
};

/**
 * Record a new AI generation in the provenance chain.
 * Call this AFTER every geminiService function returns.
 */
export const traceGeneration = async (params: {
  model: string;
  functionName: string;
  input: any;
  output: any;
  latencyMs?: number;
}): Promise<ProvenanceRecord> => {
  const chain = getChain();

  const inputStr = typeof params.input === 'string' ? params.input : JSON.stringify(params.input);
  const outputStr = typeof params.output === 'string' ? params.output : JSON.stringify(params.output);

  const inputHash = await sha256(inputStr);
  const outputHash = await sha256(outputStr);
  const timestamp = new Date().toISOString();
  const previousHash = chain.lastHash || null;

  // Autoregressive chain hash: H(previous + input + output + timestamp + model)
  const chainInput = `${previousHash || 'GENESIS'}:${inputHash}:${outputHash}:${timestamp}:${params.model}:${params.functionName}`;
  const chainHash = await sha256(chainInput);

  const record: ProvenanceRecord = {
    id: chainHash.slice(0, 16),
    timestamp,
    model: params.model,
    functionName: params.functionName,
    inputHash,
    outputHash,
    previousHash,
    chainHash,
    metadata: {
      inputSize: inputStr.length,
      outputSize: outputStr.length,
      latencyMs: params.latencyMs,
    }
  };

  chain.records.push(record);
  if (!chain.genesisHash) chain.genesisHash = chainHash;
  chain.lastHash = chainHash;
  chain.integrity = true;

  saveChain(chain);
  return record;
};

/**
 * Verify the integrity of the entire chain.
 * Recomputes every hash from genesis to tip.
 * If ANY record was tampered with, returns false + the broken index.
 */
export const verifyChain = async (): Promise<{ valid: boolean; brokenAt?: number; totalRecords: number }> => {
  const chain = getChain();
  if (chain.records.length === 0) return { valid: true, totalRecords: 0 };

  for (let i = 0; i < chain.records.length; i++) {
    const record = chain.records[i];
    const expectedPrevious = i === 0 ? null : chain.records[i - 1].chainHash;

    // Verify autoregressive link
    if (record.previousHash !== expectedPrevious) {
      return { valid: false, brokenAt: i, totalRecords: chain.records.length };
    }

    // Recompute chain hash
    const chainInput = `${record.previousHash || 'GENESIS'}:${record.inputHash}:${record.outputHash}:${record.timestamp}:${record.model}:${record.functionName}`;
    const expectedHash = await sha256(chainInput);

    if (record.chainHash !== expectedHash) {
      return { valid: false, brokenAt: i, totalRecords: chain.records.length };
    }
  }

  return { valid: true, totalRecords: chain.records.length };
};

/**
 * Export the full chain as a verifiable JSON document
 */
export const exportChain = (): { content: string; filename: string } => {
  const chain = getChain();
  const doc = {
    _type: 'xela-provenance-chain',
    _version: '1.0',
    exportedAt: new Date().toISOString(),
    genesisHash: chain.genesisHash,
    lastHash: chain.lastHash,
    totalRecords: chain.records.length,
    records: chain.records
  };
  return {
    content: JSON.stringify(doc, null, 2),
    filename: `xela-provenance-chain-${Date.now()}.json`
  };
};

/**
 * Get chain statistics
 */
export const getChainStats = (): {
  totalGenerations: number;
  modelBreakdown: Record<string, number>;
  functionBreakdown: Record<string, number>;
  totalInputBytes: number;
  totalOutputBytes: number;
  firstGeneration: string | null;
  lastGeneration: string | null;
} => {
  const chain = getChain();
  const stats = {
    totalGenerations: chain.records.length,
    modelBreakdown: {} as Record<string, number>,
    functionBreakdown: {} as Record<string, number>,
    totalInputBytes: 0,
    totalOutputBytes: 0,
    firstGeneration: chain.records[0]?.timestamp || null,
    lastGeneration: chain.records[chain.records.length - 1]?.timestamp || null,
  };

  for (const r of chain.records) {
    stats.modelBreakdown[r.model] = (stats.modelBreakdown[r.model] || 0) + 1;
    stats.functionBreakdown[r.functionName] = (stats.functionBreakdown[r.functionName] || 0) + 1;
    stats.totalInputBytes += r.metadata?.inputSize || 0;
    stats.totalOutputBytes += r.metadata?.outputSize || 0;
  }

  return stats;
};

/**
 * Clear the chain (with deletion proof)
 */
export const clearChain = async (): Promise<string> => {
  const chain = getChain();
  const chainData = JSON.stringify(chain);
  const deletionHash = await sha256(`DELETED:${chainData}:${new Date().toISOString()}`);
  localStorage.removeItem(CHAIN_KEY);
  return deletionHash;
};
