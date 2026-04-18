import React, { useState } from 'react';
import { BrandInput, BrandStrategy } from '../types';
import {
  Users, UserPlus, Shield, Heart, HandCoins, Scale, Star, AlertTriangle,
  Check, X, Loader2, Search, TrendingUp, Award, Handshake
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ─── Types ─────────────────────────────────────────────────────────────────

interface BrotherhoodAllianceProps {
  input: BrandInput;
  strategy: BrandStrategy;
}

type AllianceView = 'overview' | 'members' | 'needs' | 'ledger';
type MemberTier = 'Seeker' | 'Brother' | 'Elder' | 'Founder';
type NeedType = 'financial' | 'technical' | 'creative' | 'legal' | 'emotional' | 'spiritual';
type NeedStatus = 'open' | 'responding' | 'resolved';

interface AllianceMember {
  id: string;
  firstName: string;
  lastName: string;
  business: string;
  tier: MemberTier;
  alignmentScore: number;
  capabilities: string[];
  givingCount: number;
  receivingCount: number;
  joinedAt: number;
}

interface AllianceNeed {
  id: string;
  type: NeedType;
  description: string;
  requesterId: string;
  requesterName: string;
  matchedHelpers: number;
  status: NeedStatus;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  createdAt: number;
}

interface SharingEvent {
  id: string;
  giverId: string;
  giverName: string;
  receiverId: string;
  receiverName: string;
  description: string;
  value: number;
  timestamp: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

const initials = (f: string, l: string) => `${(f || '?')[0]}${(l || '?')[0]}`.toUpperCase();
const fmtDate = (ts: number) => new Date(ts).toLocaleDateString();
const fmtCurrency = (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

const TIER_COLORS: Record<MemberTier, string> = {
  Seeker: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Brother: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Elder: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Founder: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
};

const NEED_TYPE_COLORS: Record<NeedType, string> = {
  financial: 'bg-green-500/20 text-green-300',
  technical: 'bg-blue-500/20 text-blue-300',
  creative: 'bg-pink-500/20 text-pink-300',
  legal: 'bg-amber-500/20 text-amber-300',
  emotional: 'bg-red-500/20 text-red-300',
  spiritual: 'bg-purple-500/20 text-purple-300',
};

const STATUS_COLORS: Record<NeedStatus, string> = {
  open: 'bg-yellow-500/20 text-yellow-300',
  responding: 'bg-blue-500/20 text-blue-300',
  resolved: 'bg-emerald-500/20 text-emerald-300',
};

// ─── Demo Data ─────────────────────────────────────────────────────────────

const DEMO_MEMBERS: AllianceMember[] = [
  { id: 'm1', firstName: 'Marcus', lastName: 'Rivera', business: 'Rivera Digital Labs', tier: 'Founder', alignmentScore: 97, capabilities: ['Web Dev', 'AI Integration', 'Strategy'], givingCount: 24, receivingCount: 8, joinedAt: Date.now() - 86400000 * 365 },
  { id: 'm2', firstName: 'Jasmine', lastName: 'Cole', business: 'Cole Creative Co', tier: 'Elder', alignmentScore: 91, capabilities: ['Brand Design', 'Print', 'Photography'], givingCount: 18, receivingCount: 12, joinedAt: Date.now() - 86400000 * 200 },
  { id: 'm3', firstName: 'Darius', lastName: 'Knox', business: 'Knox Legal Group', tier: 'Brother', alignmentScore: 84, capabilities: ['Business Law', 'Contracts', 'IP'], givingCount: 15, receivingCount: 10, joinedAt: Date.now() - 86400000 * 120 },
  { id: 'm4', firstName: 'Tiana', lastName: 'Osei', business: 'Osei Wellness', tier: 'Brother', alignmentScore: 78, capabilities: ['Coaching', 'Content', 'Events'], givingCount: 9, receivingCount: 14, joinedAt: Date.now() - 86400000 * 90 },
  { id: 'm5', firstName: 'Elijah', lastName: 'Watts', business: 'Watts Financial', tier: 'Seeker', alignmentScore: 65, capabilities: ['Accounting', 'Tax Strategy', 'Bookkeeping'], givingCount: 4, receivingCount: 7, joinedAt: Date.now() - 86400000 * 30 },
  { id: 'm6', firstName: 'Sage', lastName: 'Moreno', business: 'Moreno Music', tier: 'Elder', alignmentScore: 88, capabilities: ['Audio Branding', 'Production', 'Licensing'], givingCount: 20, receivingCount: 6, joinedAt: Date.now() - 86400000 * 180 },
];

const DEMO_NEEDS: AllianceNeed[] = [
  { id: 'n1', type: 'technical', description: 'Need help migrating e-commerce platform to headless CMS', requesterId: 'm4', requesterName: 'Tiana Osei', matchedHelpers: 2, status: 'responding', urgency: 'medium', createdAt: Date.now() - 86400000 * 2 },
  { id: 'n2', type: 'legal', description: 'Trademark filing for new product line — need IP guidance', requesterId: 'm5', requesterName: 'Elijah Watts', matchedHelpers: 1, status: 'open', urgency: 'high', createdAt: Date.now() - 86400000 },
  { id: 'n3', type: 'creative', description: 'Brand refresh — logo and collateral redesign for Q3 launch', requesterId: 'm1', requesterName: 'Marcus Rivera', matchedHelpers: 3, status: 'resolved', urgency: 'low', createdAt: Date.now() - 86400000 * 7 },
  { id: 'n4', type: 'financial', description: 'Short-term bridge capital for equipment lease', requesterId: 'm6', requesterName: 'Sage Moreno', matchedHelpers: 0, status: 'open', urgency: 'critical', createdAt: Date.now() - 3600000 * 6 },
];

const DEMO_EVENTS: SharingEvent[] = [
  { id: 'e1', giverId: 'm1', giverName: 'Marcus Rivera', receiverId: 'm4', receiverName: 'Tiana Osei', description: 'Website audit & migration roadmap', value: 2500, timestamp: Date.now() - 86400000 * 2 },
  { id: 'e2', giverId: 'm2', giverName: 'Jasmine Cole', receiverId: 'm1', receiverName: 'Marcus Rivera', description: 'Full brand refresh — logo + collateral', value: 4000, timestamp: Date.now() - 86400000 * 5 },
  { id: 'e3', giverId: 'm3', giverName: 'Darius Knox', receiverId: 'm5', receiverName: 'Elijah Watts', description: 'Trademark consultation & filing prep', value: 1200, timestamp: Date.now() - 86400000 * 3 },
  { id: 'e4', giverId: 'm6', giverName: 'Sage Moreno', receiverId: 'm2', receiverName: 'Jasmine Cole', description: 'Audio logo + jingle production', value: 1800, timestamp: Date.now() - 86400000 * 8 },
  { id: 'e5', giverId: 'm4', giverName: 'Tiana Osei', receiverId: 'm6', receiverName: 'Sage Moreno', description: 'Wellness retreat event planning', value: 900, timestamp: Date.now() - 86400000 * 12 },
  { id: 'e6', giverId: 'm1', giverName: 'Marcus Rivera', receiverId: 'm3', receiverName: 'Darius Knox', description: 'Legal tech platform prototype', value: 3200, timestamp: Date.now() - 86400000 * 15 },
];

// ─── Component ─────────────────────────────────────────────────────────────

export const BrotherhoodAlliance: React.FC<BrotherhoodAllianceProps> = ({ input, strategy }) => {
  const [view, setView] = useState<AllianceView>('overview');
  const [members] = useState<AllianceMember[]>(DEMO_MEMBERS);
  const [needs] = useState<AllianceNeed[]>(DEMO_NEEDS);
  const [events] = useState<SharingEvent[]>(DEMO_EVENTS);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showSignalNeed, setShowSignalNeed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<MemberTier | 'all'>('all');
  const [needType, setNeedType] = useState<NeedType>('technical');
  const [needDesc, setNeedDesc] = useState('');
  const [needUrgency, setNeedUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');

  const filteredMembers = members.filter(m => {
    const matchesSearch = searchQuery === '' || `${m.firstName} ${m.lastName} ${m.business}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === 'all' || m.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const totalShared = events.reduce((sum, e) => sum + e.value, 0);
  const avgAlignment = Math.round(members.reduce((sum, m) => sum + m.alignmentScore, 0) / members.length);
  const activeNeeds = needs.filter(n => n.status !== 'resolved').length;

  // ─── Circular Progress ─────────────────────────────────────────────────

  const CircularScore = ({ score, size = 48 }: { score: number; size?: number }) => {
    const r = (size - 6) / 2;
    const c = 2 * Math.PI * r;
    const offset = c - (score / 100) * c;
    const color = score >= 80 ? '#34d399' : score >= 60 ? '#fbbf24' : '#f87171';
    return (
      <svg width={size} height={size} className="flex-shrink-0">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={3} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={3} strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fill="white" fontSize={size * 0.26} fontWeight="900">{score}</text>
      </svg>
    );
  };

  // ─── Overview ──────────────────────────────────────────────────────────

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <Handshake className="text-amber-400" size={32} />
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-white">Brotherhood Alliance</h2>
        </div>
        <p className="text-stone-400 text-sm tracking-wide">Brothers of X — Those Aligned in the Moment of Need</p>
      </motion.div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Members', value: members.length.toString(), icon: Users, color: 'text-brand-lavender' },
          { label: 'Active Needs', value: activeNeeds.toString(), icon: AlertTriangle, color: 'text-amber-400' },
          { label: 'Sharing Score', value: `${avgAlignment}%`, icon: Heart, color: 'text-rose-400' },
          { label: 'Network Revenue', value: fmtCurrency(totalShared), icon: TrendingUp, color: 'text-brand-teal' },
        ].map((metric, i) => (
          <motion.div key={metric.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white/5 backdrop-blur-sm rounded-[2.5rem] p-6 border border-white/10 text-center space-y-2">
            <metric.icon className={metric.color} size={24} />
            <p className="text-2xl font-black text-white">{metric.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-500">{metric.label}</p>
          </motion.div>
        ))}
      </div>

      {/* The Covenant */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-stone-500">The Covenant</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { title: 'Share in Need', desc: 'When a brother signals, the network answers. Resources flow to where they are needed most.', icon: HandCoins, color: 'text-brand-teal' },
            { title: 'Profit Ethically', desc: 'Every transaction strengthens the whole. Fair pricing, transparent terms, mutual benefit.', icon: Scale, color: 'text-brand-lavender' },
            { title: 'Penalize Betrayal', desc: 'Trust is earned and enforced. Those who exploit the network face alignment reduction and exile.', icon: Shield, color: 'text-red-400' },
          ].map((principle, i) => (
            <motion.div key={principle.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="bg-white/5 backdrop-blur-sm rounded-[2.5rem] p-6 border border-white/10 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                <principle.icon className={principle.color} size={22} />
              </div>
              <h4 className="font-black text-sm uppercase tracking-widest text-white">{principle.title}</h4>
              <p className="text-stone-400 text-sm leading-relaxed">{principle.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        {[
          { label: 'Signal Need', action: () => { setView('needs'); setShowSignalNeed(true); }, icon: AlertTriangle, color: 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30' },
          { label: 'Add Member', action: () => { setView('members'); setShowAddMember(true); }, icon: UserPlus, color: 'bg-brand-teal/20 text-brand-teal hover:bg-brand-teal/30' },
          { label: 'View Network', action: () => setView('members'), icon: Users, color: 'bg-brand-lavender/20 text-brand-lavender hover:bg-brand-lavender/30' },
        ].map((btn) => (
          <button key={btn.label} onClick={btn.action} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${btn.color}`}>
            <btn.icon size={16} />
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );

  // ─── Members View ──────────────────────────────────────────────────────

  const renderMembers = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 w-full md:max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" size={16} />
          <input type="text" placeholder="Search members..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm placeholder-stone-500 focus:outline-none focus:border-brand-teal/50" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'Seeker', 'Brother', 'Elder', 'Founder'] as const).map(t => (
            <button key={t} onClick={() => setTierFilter(t)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tierFilter === t ? 'bg-white text-brand-black' : 'bg-white/5 text-stone-400 hover:bg-white/10'}`}>
              {t === 'all' ? 'All' : t}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAddMember(!showAddMember)} className="flex items-center gap-2 px-5 py-3 bg-brand-teal/20 text-brand-teal rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-teal/30 transition-all">
          <UserPlus size={16} />
          Invite Member
        </button>
      </div>

      <AnimatePresence>
        {showAddMember && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white/5 rounded-[2.5rem] p-6 border border-white/10 space-y-4 overflow-hidden">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm uppercase tracking-widest text-white">Invite New Member</h3>
              <button onClick={() => setShowAddMember(false)} className="text-stone-500 hover:text-white"><X size={18} /></button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <input type="text" placeholder="First Name" className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-stone-500 focus:outline-none focus:border-brand-teal/50" />
              <input type="text" placeholder="Last Name" className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-stone-500 focus:outline-none focus:border-brand-teal/50" />
              <input type="text" placeholder="Business Name" className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-stone-500 focus:outline-none focus:border-brand-teal/50" />
              <select className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-stone-400 text-sm focus:outline-none focus:border-brand-teal/50">
                <option value="Seeker">Seeker</option>
                <option value="Brother">Brother</option>
              </select>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-brand-teal text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">
              <Check size={16} /> Send Invitation
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredMembers.map((m, i) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white/5 backdrop-blur-sm rounded-[2.5rem] p-6 border border-white/10 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-lavender/20 flex items-center justify-center text-brand-lavender font-black text-sm flex-shrink-0">
                {initials(m.firstName, m.lastName)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-white text-sm truncate">{m.firstName} {m.lastName}</h4>
                <p className="text-stone-500 text-xs truncate">{m.business}</p>
              </div>
              <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${TIER_COLORS[m.tier]}`}>
                {m.tier}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <CircularScore score={m.alignmentScore} />
              <div className="flex-1 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-500">Alignment</p>
                <div className="flex gap-4 text-xs text-stone-400">
                  <span className="text-emerald-400">{m.givingCount} given</span>
                  <span className="text-blue-400">{m.receivingCount} received</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {m.capabilities.map(cap => (
                <span key={cap} className="px-2.5 py-1 bg-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-stone-400">{cap}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // ─── Needs Board ───────────────────────────────────────────────────────

  const renderNeeds = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-sm uppercase tracking-widest text-white">Active Needs Board</h3>
        <button onClick={() => setShowSignalNeed(!showSignalNeed)} className="flex items-center gap-2 px-5 py-3 bg-amber-500/20 text-amber-300 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-500/30 transition-all">
          <AlertTriangle size={16} /> Signal Need
        </button>
      </div>

      <AnimatePresence>
        {showSignalNeed && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white/5 rounded-[2.5rem] p-6 border border-white/10 space-y-4 overflow-hidden">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm uppercase tracking-widest text-white">Signal a Need</h3>
              <button onClick={() => setShowSignalNeed(false)} className="text-stone-500 hover:text-white"><X size={18} /></button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <select value={needType} onChange={e => setNeedType(e.target.value as NeedType)} className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-stone-300 text-sm focus:outline-none focus:border-brand-teal/50">
                <option value="financial">Financial</option>
                <option value="technical">Technical</option>
                <option value="creative">Creative</option>
                <option value="legal">Legal</option>
                <option value="emotional">Emotional</option>
                <option value="spiritual">Spiritual</option>
              </select>
              <select value={needUrgency} onChange={e => setNeedUrgency(e.target.value as 'low' | 'medium' | 'high' | 'critical')} className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-stone-300 text-sm focus:outline-none focus:border-brand-teal/50">
                <option value="low">Low Urgency</option>
                <option value="medium">Medium Urgency</option>
                <option value="high">High Urgency</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <textarea value={needDesc} onChange={e => setNeedDesc(e.target.value)} placeholder="Describe what you need..." rows={3} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-stone-500 focus:outline-none focus:border-brand-teal/50 resize-none" />
            <button className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">
              <Check size={16} /> Broadcast Need
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {needs.map((n, i) => (
          <motion.div key={n.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="bg-white/5 backdrop-blur-sm rounded-[2.5rem] p-6 border border-white/10">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest flex-shrink-0 ${NEED_TYPE_COLORS[n.type]}`}>
                  {n.type}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{n.description}</p>
                  <p className="text-stone-500 text-xs">Requested by {n.requesterName} — {fmtDate(n.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-stone-400 text-xs">{n.matchedHelpers} helper{n.matchedHelpers !== 1 ? 's' : ''}</span>
                <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${STATUS_COLORS[n.status]}`}>
                  {n.status}
                </span>
                {n.urgency === 'critical' && <AlertTriangle className="text-red-400" size={16} />}
                {n.urgency === 'high' && <AlertTriangle className="text-amber-400" size={14} />}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // ─── Sharing Ledger ────────────────────────────────────────────────────

  const renderLedger = () => {
    const memberTotals = members.map(m => {
      const given = events.filter(e => e.giverId === m.id).reduce((s, e) => s + e.value, 0);
      const received = events.filter(e => e.receiverId === m.id).reduce((s, e) => s + e.value, 0);
      return { name: `${m.firstName} ${m.lastName}`, given, received };
    });

    return (
      <div className="space-y-8">
        {/* Network Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Shared', value: fmtCurrency(totalShared) },
            { label: 'Transactions', value: events.length.toString() },
            { label: 'Avg / Transaction', value: fmtCurrency(Math.round(totalShared / events.length)) },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white/5 rounded-[2.5rem] p-5 border border-white/10 text-center">
              <p className="text-xl font-black text-white">{s.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-500 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Per-Member Totals */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-stone-500">Member Balances</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {memberTotals.map((mt, i) => (
              <div key={mt.name} className="bg-white/5 rounded-2xl p-4 border border-white/10 flex items-center justify-between">
                <span className="text-white text-sm font-semibold">{mt.name}</span>
                <div className="flex gap-4 text-xs">
                  <span className="text-emerald-400">{fmtCurrency(mt.given)} given</span>
                  <span className="text-blue-400">{fmtCurrency(mt.received)} recv</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-stone-500">Sharing Timeline</h3>
          <div className="space-y-3">
            {events.sort((a, b) => b.timestamp - a.timestamp).map((ev, i) => (
              <motion.div key={ev.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }} className="bg-white/5 rounded-[2.5rem] p-5 border border-white/10 flex flex-col md:flex-row md:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-teal/20 flex items-center justify-center flex-shrink-0">
                  <HandCoins className="text-brand-teal" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm"><span className="font-bold">{ev.giverName}</span> <span className="text-stone-500">→</span> <span className="font-bold">{ev.receiverName}</span></p>
                  <p className="text-stone-500 text-xs truncate">{ev.description}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-brand-teal font-black text-sm">{fmtCurrency(ev.value)}</span>
                  <span className="text-stone-600 text-xs">{fmtDate(ev.timestamp)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ─── Main Render ───────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* View Nav */}
      <div className="flex flex-wrap gap-2">
        {([
          { id: 'overview' as const, label: 'Overview', icon: Handshake },
          { id: 'members' as const, label: 'Members', icon: Users },
          { id: 'needs' as const, label: 'Needs Board', icon: AlertTriangle },
          { id: 'ledger' as const, label: 'Sharing Ledger', icon: HandCoins },
        ]).map(tab => (
          <button key={tab.id} onClick={() => setView(tab.id)} className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${view === tab.id ? 'bg-white text-brand-black shadow-lg' : 'bg-white/5 text-stone-400 hover:bg-white/10 hover:text-white'}`}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active View */}
      <AnimatePresence mode="wait">
        <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          {view === 'overview' && renderOverview()}
          {view === 'members' && renderMembers()}
          {view === 'needs' && renderNeeds()}
          {view === 'ledger' && renderLedger()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default BrotherhoodAlliance;
