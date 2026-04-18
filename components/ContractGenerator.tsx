import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Loader2, Download, Copy, Check, Scale, Shield, Briefcase } from 'lucide-react';
import { BrandInput, BrandStrategy, ContractTemplate } from '../types';
import { generateContract } from '../services/geminiService';

interface ContractGeneratorProps {
  input: BrandInput;
  strategy: BrandStrategy;
}

const CONTRACT_TYPES: Array<{ type: ContractTemplate['type']; label: string; icon: React.ReactNode; description: string }> = [
  { type: 'branding', label: 'Branding Agreement', icon: <FileText className="w-5 h-5" />, description: 'Full branding service contract with scope, deliverables, and IP terms.' },
  { type: 'nda', label: 'NDA', icon: <Shield className="w-5 h-5" />, description: 'Non-disclosure agreement to protect confidential brand information.' },
  { type: 'license', label: 'License Agreement', icon: <Scale className="w-5 h-5" />, description: 'License brand assets for third-party use with defined restrictions.' },
  { type: 'retainer', label: 'Retainer Contract', icon: <Briefcase className="w-5 h-5" />, description: 'Monthly retainer for ongoing branding and marketing services.' },
  { type: 'custom', label: 'Custom', icon: <FileText className="w-5 h-5" />, description: 'Build a custom contract from scratch with your own terms.' },
];

export const ContractGenerator: React.FC<ContractGeneratorProps> = ({ input, strategy }) => {
  const [contractType, setContractType] = useState<ContractTemplate['type']>('branding');
  const [clientName, setClientName] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [customTerms, setCustomTerms] = useState('');
  const [generatedContract, setGeneratedContract] = useState<ContractTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!clientName.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const pkg = strategy.packages?.find(p => p.name === selectedPackage);
      const contract = await generateContract(
        input,
        contractType,
        clientName.trim(),
        selectedPackage || undefined,
        pkg?.price || undefined,
        customTerms || undefined,
      );
      setGeneratedContract(contract);
    } catch {
      setError('Contract generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getFullText = () => {
    if (!generatedContract) return '';
    const lines = ['DISCLAIMER: This is an AI-generated template, not legal advice. Have an attorney review before signing.', '', generatedContract.title, '', `Provider: ${generatedContract.parties.provider}`, `Client: ${generatedContract.parties.client}`, `Date: ${new Date(generatedContract.generatedAt).toLocaleDateString()}`, ''];
    for (const section of generatedContract.sections) {
      lines.push(`--- ${section.heading} ---`, '', section.body, '');
    }
    return lines.join('\n');
  };

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(getFullText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([getFullText()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${input.companyName.replace(/\s+/g, '-').toLowerCase()}-${contractType}-contract.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="bg-gradient-to-br from-brand-black to-stone-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
        <Scale className="absolute top-8 right-8 w-48 h-48 text-white/5" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="w-6 h-6 text-brand-teal" />
            <h2 className="text-3xl font-black tracking-widest uppercase">Contract Generator</h2>
          </div>
          <p className="text-stone-400 text-lg">AI-powered legal documents for your brand</p>
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl px-6 py-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800 font-medium leading-relaxed">
          <span className="font-black">Disclaimer:</span> These are AI-generated templates, not legal advice. Have an attorney review before signing.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-6 py-4 flex items-center justify-between">
          <span className="text-sm font-bold">{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 font-black text-xs uppercase tracking-widest">Dismiss</button>
        </div>
      )}

      {/* Contract Type Selector */}
      <div className="space-y-4">
        <h3 className="font-black text-sm tracking-widest uppercase text-brand-black px-2">Contract Type</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {CONTRACT_TYPES.map((ct) => (
            <button
              key={ct.type}
              onClick={() => setContractType(ct.type)}
              className={`rounded-[2rem] p-6 text-left transition-all border-2 ${
                contractType === ct.type
                  ? 'border-brand-lavender bg-brand-lavender/5 shadow-lg'
                  : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'
              }`}
            >
              <div className={contractType === ct.type ? 'text-brand-lavender' : 'text-stone-400'}>{ct.icon}</div>
              <div className="mt-3 font-black text-xs tracking-widest uppercase text-brand-black">{ct.label}</div>
              <p className="mt-1 text-[11px] text-stone-500 leading-relaxed">{ct.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Input Fields */}
      <div className="bg-white rounded-[2.5rem] p-8 border border-stone-200 shadow-sm space-y-6">
        {/* Client Name */}
        <div>
          <label className="font-black text-[10px] tracking-widest uppercase text-stone-400 block mb-2">Client Name</label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Enter client's full name or business name"
            className="w-full bg-stone-50 rounded-xl px-5 py-3 text-sm border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-lavender/50 focus:border-brand-lavender transition-all"
          />
        </div>

        {/* Package Dropdown */}
        {strategy.packages && strategy.packages.length > 0 && (
          <div>
            <label className="font-black text-[10px] tracking-widest uppercase text-stone-400 block mb-2">Package Reference</label>
            <select
              value={selectedPackage}
              onChange={(e) => setSelectedPackage(e.target.value)}
              className="w-full bg-stone-50 rounded-xl px-5 py-3 text-sm border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-lavender/50 focus:border-brand-lavender transition-all"
            >
              <option value="">None</option>
              {strategy.packages.map((pkg) => (
                <option key={pkg.id} value={pkg.name}>{pkg.name} — {pkg.price} ({pkg.tier})</option>
              ))}
            </select>
          </div>
        )}

        {/* Custom Terms */}
        <div>
          <label className="font-black text-[10px] tracking-widest uppercase text-stone-400 block mb-2">Custom Terms (Optional)</label>
          <textarea
            value={customTerms}
            onChange={(e) => setCustomTerms(e.target.value)}
            placeholder="Add any specific clauses, payment schedules, or special conditions..."
            rows={4}
            className="w-full bg-stone-50 rounded-xl px-5 py-3 text-sm border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-lavender/50 focus:border-brand-lavender transition-all resize-none"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !clientName.trim()}
          className="w-full bg-brand-lavender hover:bg-brand-lavender/90 text-white font-bold py-4 px-8 rounded-2xl transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Contract...
            </>
          ) : (
            <>
              <Scale className="w-5 h-5" />
              Generate Contract
            </>
          )}
        </button>
      </div>

      {/* Generated Contract Display */}
      {generatedContract && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="bg-white rounded-[2.5rem] p-10 border-2 border-brand-lavender/20 shadow-2xl">
            {/* Title */}
            <div className="text-center mb-10">
              <Shield className="w-10 h-10 text-brand-lavender mx-auto mb-3" />
              <h3 className="text-2xl font-black tracking-widest uppercase text-brand-black">{generatedContract.title}</h3>
              <div className="w-24 h-1 bg-brand-teal mx-auto mt-3 rounded-full" />
            </div>

            {/* Parties */}
            <div className="grid grid-cols-2 gap-4 text-sm mb-8 bg-stone-50 rounded-2xl p-6">
              <div>
                <span className="font-black text-[10px] tracking-widest uppercase text-stone-400 block mb-1">Provider</span>
                <span className="font-bold text-brand-black">{generatedContract.parties.provider}</span>
              </div>
              <div>
                <span className="font-black text-[10px] tracking-widest uppercase text-stone-400 block mb-1">Client</span>
                <span className="font-bold text-brand-black">{generatedContract.parties.client}</span>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-8">
              {generatedContract.sections.map((section, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 * i }}
                >
                  <h4 className="font-black text-sm tracking-widest uppercase text-brand-black mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand-lavender/10 text-brand-lavender text-xs flex items-center justify-center font-bold">{i + 1}</span>
                    {section.heading}
                  </h4>
                  <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-wrap pl-8">{section.body}</p>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-10 pt-6 border-t border-stone-200 text-xs text-stone-400 text-center">
              Generated {new Date(generatedContract.generatedAt).toLocaleString()} — {input.companyName}
              {generatedContract.packageRef && <span> — Package: {generatedContract.packageRef}</span>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleCopyAll}
              className="bg-brand-black hover:bg-stone-800 text-white font-bold py-4 px-8 rounded-2xl transition-colors flex items-center justify-center gap-3"
            >
              {copied ? <><Check className="w-5 h-5" /> Copied</> : <><Copy className="w-5 h-5" /> Copy All</>}
            </button>
            <button
              onClick={handleDownload}
              className="bg-brand-lavender hover:bg-brand-lavender/90 text-white font-bold py-4 px-8 rounded-2xl transition-colors flex items-center justify-center gap-3"
            >
              <Download className="w-5 h-5" />
              Download as Text
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
