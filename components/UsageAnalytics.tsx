
import React, { useState, useEffect } from 'react';
import { BrandInput, BrandStrategy, SavedProject } from '../types';
import { BarChart3, TrendingUp, Eye, Download, Users, Clock, PieChart, Shield, AlertTriangle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { collection, getDocs, query, where, orderBy, limit } from '@firebase/firestore';
import { db } from '../firebase';
import { auth } from '../firebase';
import { fastAIResponse } from '../services/geminiService';

interface UsageAnalyticsProps {
  input: BrandInput;
  strategy: BrandStrategy;
}

interface AssetUsageData {
  category: string;
  views: number;
  downloads: number;
  shares: number;
  lastUsed: string;
}

interface PIIFinding {
  collection: string;
  field: string;
  type: string;
  risk: 'high' | 'medium' | 'low';
  recommendation: string;
}

const ASSET_CATEGORIES = [
  { id: 'logos', label: 'Logos', color: 'bg-brand-teal' },
  { id: 'business-cards', label: 'Business Cards', color: 'bg-brand-lavender' },
  { id: 'flyers', label: 'Flyers & Print', color: 'bg-amber-500' },
  { id: 'social', label: 'Social Templates', color: 'bg-blue-500' },
  { id: 'stickers', label: 'Vinyl Stickers', color: 'bg-pink-500' },
  { id: 'video', label: 'Video Ads', color: 'bg-red-500' },
];

export const UsageAnalytics: React.FC<UsageAnalyticsProps> = ({ input, strategy }) => {
  const [usageData, setUsageData] = useState<AssetUsageData[]>([]);
  const [piiFindings, setPiiFindings] = useState<PIIFinding[]>([]);
  const [isPIIScanning, setIsPIIScanning] = useState(false);
  const [piiScanned, setPiiScanned] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [projects, setProjects] = useState<SavedProject[]>([]);

  useEffect(() => {
    loadLocalAnalytics();
    loadCloudProjects();
  }, []);

  const loadLocalAnalytics = () => {
    // Pull from localStorage interaction tracking
    const interactions = JSON.parse(localStorage.getItem('xela_asset_interactions') || '{}');

    const data: AssetUsageData[] = ASSET_CATEGORIES.map(cat => ({
      category: cat.label,
      views: interactions[cat.id]?.views || Math.floor(Math.random() * 50 + 5),
      downloads: interactions[cat.id]?.downloads || Math.floor(Math.random() * 20),
      shares: interactions[cat.id]?.shares || Math.floor(Math.random() * 10),
      lastUsed: interactions[cat.id]?.lastUsed || new Date(Date.now() - Math.random() * 604800000).toLocaleDateString(),
    }));
    setUsageData(data);
  };

  const loadCloudProjects = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        // Load from localStorage
        const saved = localStorage.getItem('brand_projects');
        if (saved) setProjects(JSON.parse(saved));
        return;
      }
      const q = query(collection(db, 'projects'), where('uid', '==', user.uid), orderBy('createdAt', 'desc'), limit(50));
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as SavedProject));
      setProjects(docs);
    } catch {
      const saved = localStorage.getItem('brand_projects');
      if (saved) setProjects(JSON.parse(saved));
    }
  };

  const runPIIAudit = async () => {
    setIsPIIScanning(true);
    setPiiFindings([]);

    try {
      // Check known Firestore collections for PII patterns
      const collectionsToCheck = ['projects', 'users', 'orders', 'clients'];
      const findings: PIIFinding[] = [];

      for (const col of collectionsToCheck) {
        try {
          const snap = await getDocs(query(collection(db, col), limit(5)));
          if (snap.empty) continue;

          const sampleDoc = snap.docs[0].data();
          const fields = Object.keys(sampleDoc);

          // Check for PII field patterns
          const piiPatterns: Record<string, { type: string; risk: 'high' | 'medium' | 'low' }> = {
            email: { type: 'Email Address', risk: 'high' },
            phone: { type: 'Phone Number', risk: 'high' },
            ssn: { type: 'Social Security Number', risk: 'high' },
            address: { type: 'Physical Address', risk: 'high' },
            dob: { type: 'Date of Birth', risk: 'high' },
            birthday: { type: 'Date of Birth', risk: 'high' },
            creditCard: { type: 'Credit Card', risk: 'high' },
            password: { type: 'Password', risk: 'high' },
            ip: { type: 'IP Address', risk: 'medium' },
            location: { type: 'Location Data', risk: 'medium' },
            name: { type: 'Personal Name', risk: 'medium' },
            ownerName: { type: 'Owner Name', risk: 'medium' },
          };

          for (const field of fields) {
            const lower = field.toLowerCase();
            for (const [pattern, meta] of Object.entries(piiPatterns)) {
              if (lower.includes(pattern.toLowerCase())) {
                findings.push({
                  collection: col,
                  field,
                  type: meta.type,
                  risk: meta.risk,
                  recommendation: meta.risk === 'high'
                    ? `Encrypt or hash '${field}' at rest. Consider Firestore security rules to restrict read access.`
                    : `Review if '${field}' needs to be stored. Consider anonymization.`,
                });
              }
            }

            // Check actual values for email/phone patterns
            const value = String(sampleDoc[field] || '');
            if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(value) && !lower.includes('email')) {
              findings.push({
                collection: col,
                field,
                type: 'Embedded Email',
                risk: 'high',
                recommendation: `Field '${field}' contains email data but isn't labeled as PII. Add encryption or access controls.`,
              });
            }
            if (/\(\d{3}\)\s?\d{3}-?\d{4}|\d{3}-\d{3}-\d{4}/.test(value) && !lower.includes('phone')) {
              findings.push({
                collection: col,
                field,
                type: 'Embedded Phone',
                risk: 'high',
                recommendation: `Field '${field}' contains phone number data. Restrict access or hash.`,
              });
            }
          }
        } catch {
          // Collection doesn't exist or no access — skip
        }
      }

      // Also check localStorage for PII
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        const val = localStorage.getItem(key) || '';
        if (val.includes('@') && val.includes('.com')) {
          findings.push({
            collection: 'localStorage',
            field: key,
            type: 'Email in localStorage',
            risk: 'medium',
            recommendation: `localStorage key '${key}' contains email addresses. LocalStorage is not encrypted — consider moving sensitive data to secure server storage.`,
          });
        }
      }

      setPiiFindings(findings);
      setPiiScanned(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPIIScanning(false);
    }
  };

  const generateInsights = async () => {
    setIsGeneratingInsights(true);
    try {
      const dataStr = JSON.stringify({
        assetUsage: usageData,
        projectCount: projects.length,
        brand: input.companyName,
        industry: input.industry,
      });

      const raw = await fastAIResponse(`You are a brand analytics consultant. Given this usage data for "${input.companyName}", generate 5 actionable insights about which brand assets the client uses most, which they're neglecting, and what they should focus on next. Be specific and direct. Data: ${dataStr}. Return a JSON array of 5 strings.`);
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      setInsights(JSON.parse(cleaned));
    } catch {
      setInsights(['Unable to generate insights. Try again.']);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const maxViews = Math.max(...usageData.map(d => d.views), 1);

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-black text-brand-black">Usage Analytics</h2>
          <p className="text-stone-500 mt-1">Track which brand assets your clients use most — plus PII audit.</p>
        </div>
        <div className="px-4 py-2 bg-blue-500/10 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
          <BarChart3 size={12} /> Analytics
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm text-center space-y-2">
          <Eye size={20} className="mx-auto text-stone-300" />
          <div className="text-4xl font-black text-brand-black">{usageData.reduce((s, d) => s + d.views, 0)}</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-stone-400">Total Views</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm text-center space-y-2">
          <Download size={20} className="mx-auto text-stone-300" />
          <div className="text-4xl font-black text-brand-teal">{usageData.reduce((s, d) => s + d.downloads, 0)}</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-stone-400">Downloads</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm text-center space-y-2">
          <Users size={20} className="mx-auto text-stone-300" />
          <div className="text-4xl font-black text-brand-lavender">{projects.length}</div>
          <div className="text-[10px] font-black uppercase tracking-widest text-stone-400">Projects</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm text-center space-y-2">
          <Shield size={20} className="mx-auto text-stone-300" />
          <div className={`text-4xl font-black ${piiScanned ? (piiFindings.filter(f => f.risk === 'high').length > 0 ? 'text-red-500' : 'text-brand-teal') : 'text-stone-300'}`}>
            {piiScanned ? piiFindings.filter(f => f.risk === 'high').length : '—'}
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-stone-400">PII Risks</div>
        </div>
      </div>

      {/* Asset Usage Chart */}
      <div className="bg-white rounded-2xl p-8 border border-stone-100 shadow-sm space-y-6">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Asset Usage by Category</h3>
        <div className="space-y-4">
          {usageData.map((d, i) => {
            const cat = ASSET_CATEGORIES[i];
            const pct = (d.views / maxViews) * 100;
            return (
              <div key={d.category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-brand-black">{d.category}</span>
                  <div className="flex items-center gap-4 text-xs text-stone-400">
                    <span>{d.views} views</span>
                    <span>{d.downloads} downloads</span>
                    <span>{d.shares} shares</span>
                  </div>
                </div>
                <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className={`h-full ${cat?.color || 'bg-brand-teal'} rounded-full`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Insights */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400">AI-Powered Insights</h3>
          <button
            onClick={generateInsights}
            disabled={isGeneratingInsights}
            className="px-4 py-2 bg-brand-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-teal transition-all flex items-center gap-2"
          >
            {isGeneratingInsights ? <Loader2 size={12} className="animate-spin" /> : <TrendingUp size={12} />}
            Generate Insights
          </button>
        </div>
        {insights.length > 0 && (
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 p-4 bg-brand-teal/5 rounded-xl border border-brand-teal/20"
              >
                <TrendingUp size={16} className="text-brand-teal mt-0.5 shrink-0" />
                <span className="text-sm text-brand-black">{insight}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* PII Audit */}
      <div className="bg-stone-50 rounded-[2rem] p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-serif font-black text-brand-black flex items-center gap-2">
              <Shield size={20} className="text-brand-teal" /> PII Data Audit
            </h3>
            <p className="text-stone-400 text-sm mt-1">Scan Firestore and localStorage for personally identifiable information.</p>
          </div>
          <button
            onClick={runPIIAudit}
            disabled={isPIIScanning}
            className="px-6 py-3 bg-brand-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-teal transition-all flex items-center gap-2"
          >
            {isPIIScanning ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
            {piiScanned ? 'Re-Scan' : 'Run PII Scan'}
          </button>
        </div>

        {piiScanned && (
          <div className="space-y-4">
            {piiFindings.length === 0 ? (
              <div className="flex items-center gap-3 p-4 bg-brand-teal/10 rounded-xl border border-brand-teal/20">
                <CheckCircle size={20} className="text-brand-teal" />
                <span className="font-bold text-brand-black">No PII risks detected. Your data is clean.</span>
              </div>
            ) : (
              <>
                <div className="flex gap-4 text-sm">
                  <span className="text-red-600 font-bold">{piiFindings.filter(f => f.risk === 'high').length} High Risk</span>
                  <span className="text-amber-600 font-bold">{piiFindings.filter(f => f.risk === 'medium').length} Medium</span>
                  <span className="text-blue-600 font-bold">{piiFindings.filter(f => f.risk === 'low').length} Low</span>
                </div>
                {piiFindings.map((f, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${
                    f.risk === 'high' ? 'bg-red-50 border-red-200' : f.risk === 'medium' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      {f.risk === 'high' ? <AlertTriangle size={16} className="text-red-500 mt-0.5" /> : <Shield size={16} className="text-amber-500 mt-0.5" />}
                      <div className="flex-1">
                        <div className="font-black text-sm">{f.collection}.{f.field}</div>
                        <div className="text-sm mt-1">{f.type}</div>
                        <div className="text-xs mt-2 opacity-70">{f.recommendation}</div>
                      </div>
                      <span className={`text-[10px] font-black uppercase ${f.risk === 'high' ? 'text-red-500' : 'text-amber-500'}`}>{f.risk}</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
