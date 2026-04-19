import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Server, Copy, Check, Code, Loader2, Globe, Key, Shield } from 'lucide-react';
import { BrandInput, BrandStrategy, MCPToolExport } from '../types';

interface MCPClientPortalProps {
  input: BrandInput;
  strategy: BrandStrategy;
}

const MCP_TOOLS: MCPToolExport[] = [
  {
    toolName: 'get-brand-colors',
    description: 'Returns the full color palette including primary, secondary, accent, and background with explanations.',
    inputSchema: { type: 'object', properties: { format: { type: 'string', enum: ['hex', 'rgb', 'hsl'] } } },
    endpoint: '/mcp/v1/brand-colors',
  },
  {
    toolName: 'get-brand-voice',
    description: 'Returns voice and tone guidelines including keywords, sample phrases, and style rules.',
    inputSchema: { type: 'object', properties: { section: { type: 'string', enum: ['tone', 'keywords', 'phrases', 'all'] } } },
    endpoint: '/mcp/v1/brand-voice',
  },
  {
    toolName: 'get-logo-assets',
    description: 'Returns logo URLs in all available formats and variations for use in any context.',
    inputSchema: { type: 'object', properties: { variant: { type: 'string', enum: ['primary', 'icon', 'wordmark', 'all'] } } },
    endpoint: '/mcp/v1/logo-assets',
  },
  {
    toolName: 'get-brand-guidelines',
    description: 'Returns the complete brand guideline document including logo usage, color, typography, and imagery rules.',
    inputSchema: { type: 'object', properties: {} },
    endpoint: '/mcp/v1/brand-guidelines',
  },
  {
    toolName: 'get-content-calendar',
    description: 'Returns the social media content calendar with daily topics, platforms, captions, and visual ideas.',
    inputSchema: { type: 'object', properties: { month: { type: 'number' }, platform: { type: 'string' } } },
    endpoint: '/mcp/v1/content-calendar',
  },
  {
    toolName: 'search-brand-knowledge',
    description: 'Semantic search over all brand data — strategy, guidelines, assets, content, and competitor intelligence.',
    inputSchema: { type: 'object', properties: { query: { type: 'string' }, limit: { type: 'number', default: 5 } }, required: ['query'] },
    endpoint: '/mcp/v1/search',
  },
];

export const MCPClientPortal: React.FC<MCPClientPortalProps> = ({ input, strategy }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [copiedTool, setCopiedTool] = useState<string>('');
  const [showConfig, setShowConfig] = useState(false);

  const generateApiKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const key = 'xela_mcp_' + Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setApiKey(key);
  };

  const copyToClipboard = async (text: string, toolName: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedTool(toolName);
    setTimeout(() => setCopiedTool(''), 2000);
  };

  const configSnippet = JSON.stringify({
    mcpServers: {
      [`${input.companyName.toLowerCase().replace(/\s+/g, '-')}-brand`]: {
        url: `https://xela-creative-branding.vercel.app/api/mcp/v1/${input.companyName.toLowerCase().replace(/\s+/g, '-')}`,
        apiKey: apiKey || '<YOUR_API_KEY>',
        tools: MCP_TOOLS.map(t => t.toolName),
      }
    }
  }, null, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-brand-black to-stone-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
        <Globe className="absolute top-8 right-8 w-48 h-48 text-white/5" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Server className="w-6 h-6 text-brand-teal" />
            <h2 className="text-3xl font-black tracking-widest uppercase">MCP Client Portal</h2>
          </div>
          <p className="text-stone-400 text-lg">Expose brand assets to any AI agent</p>

          {/* Connection Status */}
          <div className="mt-6 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
            </span>
            <span className="text-green-400 text-sm font-bold tracking-widest uppercase">Ready</span>
          </div>
        </div>
      </div>

      {/* API Key Section */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-stone-200 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-brand-lavender" />
          <h3 className="font-black text-sm tracking-widest uppercase text-brand-black">API Key</h3>
        </div>
        {apiKey ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <code className="flex-1 font-mono text-xs bg-stone-100 rounded-xl p-4 break-all text-brand-teal">{apiKey}</code>
              <button
                onClick={() => copyToClipboard(apiKey, 'api-key')}
                className="shrink-0 p-3 rounded-xl bg-stone-100 hover:bg-stone-200 transition-colors"
              >
                {copiedTool === 'api-key' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-stone-600" />}
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <Shield className="w-3 h-3" />
              <span>Keep this key secret. Rotate if compromised.</span>
            </div>
          </div>
        ) : (
          <button
            onClick={generateApiKey}
            className="w-full bg-brand-lavender hover:bg-brand-lavender/90 text-white font-bold py-4 px-8 rounded-2xl transition-colors flex items-center justify-center gap-3"
          >
            <Key className="w-5 h-5" />
            Generate API Key
          </button>
        )}
      </div>

      {/* MCP Tools Grid */}
      <div className="space-y-4">
        <h3 className="font-black text-sm tracking-widest uppercase text-brand-black px-2">Available Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MCP_TOOLS.map((tool, i) => (
            <motion.div
              key={tool.toolName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-[2.5rem] p-8 border border-stone-200 shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <code className="text-sm font-mono font-bold text-brand-teal">{tool.toolName}</code>
                <button
                  onClick={() => copyToClipboard(tool.endpoint, tool.toolName)}
                  className="shrink-0 p-2 rounded-lg bg-stone-100 hover:bg-stone-200 transition-colors"
                >
                  {copiedTool === tool.toolName ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
                </button>
              </div>
              <p className="text-stone-600 text-sm leading-relaxed mb-4">{tool.description}</p>
              <div className="bg-stone-50 rounded-xl p-3">
                <span className="font-black text-[10px] tracking-widest uppercase text-stone-400 block mb-1">Input Schema</span>
                <code className="text-[11px] font-mono text-stone-500 break-all">
                  {JSON.stringify(tool.inputSchema.properties)}
                </code>
              </div>
              <div className="mt-3 text-[11px] font-mono text-stone-400">{tool.endpoint}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Config Snippet */}
      <div className="space-y-4">
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center gap-3 font-black text-sm tracking-widest uppercase text-brand-black px-2 hover:text-brand-lavender transition-colors"
        >
          <Code className="w-5 h-5" />
          {showConfig ? 'Hide' : 'Show'} Client Config
        </button>
        {showConfig && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-brand-black rounded-[2.5rem] p-8 relative"
          >
            <button
              onClick={() => copyToClipboard(configSnippet, 'config')}
              className="absolute top-6 right-6 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              {copiedTool === 'config' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white/60" />}
            </button>
            <pre className="font-mono text-xs text-brand-teal overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {configSnippet}
            </pre>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
