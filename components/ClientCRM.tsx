import React, { useState, useEffect, useCallback } from 'react';
import { BrandInput, BrandStrategy } from '../types';
import {
  ClientContact, Deal, Activity, ClientDocument,
  ClientStatus, DealStage, ActivityType, CommunicationChannel,
  PipelineMetrics, CRMFilters
} from '../types/crm';
import {
  createClient, getClient, updateClient, deleteClient, listClients,
  createDeal, updateDeal, listDeals, deleteDeal,
  createActivity, listActivities, deleteActivity,
  calculatePipelineMetrics
} from '../services/crmService';
import {
  Users, UserPlus, Search, Filter, MoreVertical, Phone, Mail, MapPin,
  DollarSign, Calendar, Clock, Tag, Edit3, Trash2, Plus, X, Check,
  ChevronRight, ChevronDown, ArrowUpDown, Building2, Globe, FileText,
  MessageSquare, Briefcase, TrendingUp, AlertCircle, Star, Loader2,
  Shield, Eye, PhoneCall, Send, Handshake
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ─── Types ─────────────────────────────────────────────────────────────────

interface ClientCRMProps {
  input: BrandInput;
  strategy: BrandStrategy;
}

type CRMView = 'clients' | 'pipeline' | 'detail' | 'add' | 'metrics';

// ─── Helpers ───────────────────────────────────────────────────────────────

const cents = (v: number) => `$${(v / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
const centsShort = (v: number) => {
  const d = v / 100;
  if (d >= 1000) return `$${(d / 1000).toFixed(1)}k`;
  return `$${d.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
};
const fmtDate = (ts: number | null) => ts ? new Date(ts).toLocaleDateString() : '—';
const fmtDateTime = (ts: number | null) => ts ? new Date(ts).toLocaleString() : '—';
const initials = (f: string, l: string) => `${(f || '?')[0]}${(l || '?')[0]}`.toUpperCase();

const STATUS_COLORS: Record<ClientStatus, string> = {
  [ClientStatus.LEAD]: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  [ClientStatus.PROSPECT]: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  [ClientStatus.ACTIVE]: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  [ClientStatus.COMPLETED]: 'bg-stone-500/20 text-stone-300 border-stone-500/30',
  [ClientStatus.CHURNED]: 'bg-red-500/20 text-red-300 border-red-500/30',
  [ClientStatus.VIP]: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
};

const STATUS_LABELS: Record<ClientStatus, string> = {
  [ClientStatus.LEAD]: 'Lead',
  [ClientStatus.PROSPECT]: 'Prospect',
  [ClientStatus.ACTIVE]: 'Active',
  [ClientStatus.COMPLETED]: 'Completed',
  [ClientStatus.CHURNED]: 'Churned',
  [ClientStatus.VIP]: 'VIP',
};

const STAGE_LABELS: Record<DealStage, string> = {
  [DealStage.INQUIRY]: 'Inquiry',
  [DealStage.CONSULTATION]: 'Consultation',
  [DealStage.PROPOSAL_SENT]: 'Proposal Sent',
  [DealStage.NEGOTIATION]: 'Negotiation',
  [DealStage.CLOSED_WON]: 'Closed Won',
  [DealStage.CLOSED_LOST]: 'Closed Lost',
};

const STAGE_ORDER: DealStage[] = [
  DealStage.INQUIRY, DealStage.CONSULTATION, DealStage.PROPOSAL_SENT,
  DealStage.NEGOTIATION, DealStage.CLOSED_WON, DealStage.CLOSED_LOST,
];

const STAGE_COLORS: Record<DealStage, string> = {
  [DealStage.INQUIRY]: 'border-blue-500/40',
  [DealStage.CONSULTATION]: 'border-brand-teal/40',
  [DealStage.PROPOSAL_SENT]: 'border-yellow-500/40',
  [DealStage.NEGOTIATION]: 'border-orange-500/40',
  [DealStage.CLOSED_WON]: 'border-emerald-500/40',
  [DealStage.CLOSED_LOST]: 'border-red-500/40',
};

const ACTIVITY_ICONS: Record<ActivityType, React.ReactNode> = {
  [ActivityType.NOTE]: <FileText className="w-4 h-4" />,
  [ActivityType.EMAIL]: <Mail className="w-4 h-4" />,
  [ActivityType.CALL]: <PhoneCall className="w-4 h-4" />,
  [ActivityType.MEETING]: <Handshake className="w-4 h-4" />,
  [ActivityType.PAYMENT]: <DollarSign className="w-4 h-4" />,
  [ActivityType.DELIVERY]: <Send className="w-4 h-4" />,
  [ActivityType.FOLLOW_UP]: <Clock className="w-4 h-4" />,
  [ActivityType.CONTRACT]: <Briefcase className="w-4 h-4" />,
};

const SOURCES = ['Referral', 'Google', 'Social Media', 'Website', 'Cold Call', 'Event', 'Other'];
const TIERS: Array<ClientContact['packageTier']> = ['budget', 'premium', 'elite', 'custom'];

const emptyClientForm = (): Partial<ClientContact> => ({
  firstName: '', lastName: '', companyName: '', email: '', phone: '',
  address: '', city: '', state: '', zip: '', industry: '', website: '',
  source: 'Website', assignedTo: '', packageTier: null, notes: '',
  tags: [], status: ClientStatus.LEAD, socialLinks: {},
  totalRevenue: 0, totalPaid: 0, outstandingBalance: 0,
  lastPaymentDate: null, currentPackage: null,
  lastContactedAt: null, nextFollowUp: null,
});

// ─── Component ─────────────────────────────────────────────────────────────

export const ClientCRM: React.FC<ClientCRMProps> = ({ input, strategy }) => {
  // ── State ──
  const [view, setView] = useState<CRMView>('metrics');
  const [clients, setClients] = useState<ClientContact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientContact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<CRMFilters>({ status: 'all', search: '', sortBy: 'created', sortDir: 'desc', tags: [] });
  const [metrics, setMetrics] = useState<PipelineMetrics | null>(null);
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [editingClient, setEditingClient] = useState<Partial<ClientContact> | null>(null);
  const [detailTab, setDetailTab] = useState<'activities' | 'deals' | 'documents'>('activities');
  const [clientDeals, setClientDeals] = useState<Deal[]>([]);
  const [clientActivities, setClientActivities] = useState<Activity[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Deal form
  const [dealForm, setDealForm] = useState({
    clientId: '', title: '', description: '', value: '',
    stage: DealStage.INQUIRY, probability: 50, expectedCloseDate: '',
  });

  // Activity form
  const [activityForm, setActivityForm] = useState({
    type: ActivityType.NOTE as ActivityType, title: '', description: '',
    channel: CommunicationChannel.EMAIL as CommunicationChannel,
  });

  // ── Data Loading ──
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [c, d] = await Promise.all([listClients(filters), listDeals()]);
      setClients(c);
      setDeals(d);
      setMetrics(calculatePipelineMetrics(c, d));
    } catch {
      // Firestore unavailable — keep existing local state
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadData(); }, [loadData]);

  const loadClientDetail = useCallback(async (client: ClientContact) => {
    setSelectedClient(client);
    setView('detail');
    setDetailTab('activities');
    try {
      const [a, d] = await Promise.all([listActivities(client.id), listDeals(client.id)]);
      setClientActivities(a);
      setClientDeals(d);
    } catch {
      setClientActivities([]);
      setClientDeals([]);
    }
  }, []);

  // ── Mutations ──
  const handleSaveClient = async () => {
    if (!editingClient) return;
    const data = editingClient;
    try {
      if (data.id) {
        await updateClient(data.id, data);
        setClients(prev => prev.map(c => c.id === data.id ? { ...c, ...data } as ClientContact : c));
      } else {
        const created = await createClient(data as Omit<ClientContact, 'id' | 'createdAt' | 'updatedAt' | 'encrypted'>);
        setClients(prev => [created, ...prev]);
      }
    } catch {
      // Firestore down — apply locally
      if (data.id) {
        setClients(prev => prev.map(c => c.id === data.id ? { ...c, ...data } as ClientContact : c));
      } else {
        const localClient: ClientContact = {
          ...emptyClientForm(), ...data,
          id: crypto.randomUUID(), createdAt: Date.now(), updatedAt: Date.now(), encrypted: false,
        } as ClientContact;
        setClients(prev => [localClient, ...prev]);
      }
    }
    setEditingClient(null);
    setView('clients');
    setMetrics(calculatePipelineMetrics(clients, deals));
  };

  const handleDeleteClient = async (id: string) => {
    try { await deleteClient(id); } catch { /* local fallback */ }
    setClients(prev => prev.filter(c => c.id !== id));
    if (selectedClient?.id === id) { setSelectedClient(null); setView('clients'); }
  };

  const handleSaveDeal = async () => {
    const d = dealForm;
    if (!d.title || !d.clientId) return;
    const clientName = clients.find(c => c.id === d.clientId)?.firstName || 'Unknown';
    const payload = {
      clientId: d.clientId, clientName, title: d.title, description: d.description,
      stage: d.stage, value: Math.round(parseFloat(d.value || '0') * 100),
      probability: d.probability, expectedCloseDate: d.expectedCloseDate ? new Date(d.expectedCloseDate).getTime() : Date.now(),
      actualCloseDate: null, packageTier: null as ClientContact['packageTier'], lostReason: null,
    };
    try {
      const created = await createDeal(payload);
      setDeals(prev => [created, ...prev]);
      if (selectedClient?.id === d.clientId) setClientDeals(prev => [created, ...prev]);
    } catch {
      const local: Deal = { ...payload, id: crypto.randomUUID(), createdAt: Date.now(), updatedAt: Date.now() };
      setDeals(prev => [local, ...prev]);
      if (selectedClient?.id === d.clientId) setClientDeals(prev => [local, ...prev]);
    }
    setShowAddDeal(false);
    setDealForm({ clientId: selectedClient?.id || '', title: '', description: '', value: '', stage: DealStage.INQUIRY, probability: 50, expectedCloseDate: '' });
  };

  const handleMoveDeal = async (dealId: string, newStage: DealStage) => {
    try { await updateDeal(dealId, { stage: newStage }); } catch { /* local */ }
    const updater = (prev: Deal[]) => prev.map(d => d.id === dealId ? { ...d, stage: newStage, updatedAt: Date.now() } : d);
    setDeals(updater);
    setClientDeals(updater);
  };

  const handleSaveActivity = async () => {
    const a = activityForm;
    if (!a.title || !selectedClient) return;
    const payload = {
      clientId: selectedClient.id, type: a.type, title: a.title,
      description: a.description, channel: a.channel,
      scheduledAt: null, completedAt: Date.now(),
    };
    try {
      const created = await createActivity(payload);
      setClientActivities(prev => [created, ...prev]);
      setActivities(prev => [created, ...prev]);
    } catch {
      const local: Activity = { ...payload, id: crypto.randomUUID(), createdAt: Date.now(), createdBy: 'local' };
      setClientActivities(prev => [local, ...prev]);
      setActivities(prev => [local, ...prev]);
    }
    setShowAddActivity(false);
    setActivityForm({ type: ActivityType.NOTE, title: '', description: '', channel: CommunicationChannel.EMAIL });
  };

  // ── Filtered & sorted clients ──
  const filteredClients = clients.filter(c => {
    if (filters.status !== 'all' && c.status !== filters.status) return false;
    if (filters.search) {
      const s = filters.search.toLowerCase();
      if (!(c.firstName + ' ' + c.lastName + ' ' + c.companyName + ' ' + c.email).toLowerCase().includes(s)) return false;
    }
    return true;
  }).sort((a, b) => {
    const dir = filters.sortDir === 'asc' ? 1 : -1;
    switch (filters.sortBy) {
      case 'name': return dir * a.firstName.localeCompare(b.firstName);
      case 'revenue': return dir * (a.totalRevenue - b.totalRevenue);
      case 'lastContact': return dir * ((a.lastContactedAt || 0) - (b.lastContactedAt || 0));
      default: return dir * (a.createdAt - b.createdAt);
    }
  });

  // ── Glass card wrapper ──
  const Glass: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
    <motion.div
      whileHover={{ scale: onClick ? 1.01 : 1 }}
      onClick={onClick}
      className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-6 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );

  // ─── TAB NAV ─────────────────────────────────────────────────────────────

  const TabNav = () => (
    <div className="flex items-center gap-2 mb-8">
      {(['metrics', 'clients', 'pipeline'] as CRMView[]).map(tab => (
        <button
          key={tab}
          onClick={() => setView(tab)}
          className={`px-5 py-2.5 rounded-full font-black uppercase tracking-widest text-xs transition-all ${
            view === tab
              ? 'bg-brand-lavender text-brand-black'
              : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
          }`}
        >
          {tab === 'metrics' && <TrendingUp className="w-3.5 h-3.5 inline mr-2" />}
          {tab === 'clients' && <Users className="w-3.5 h-3.5 inline mr-2" />}
          {tab === 'pipeline' && <Briefcase className="w-3.5 h-3.5 inline mr-2" />}
          {tab}
        </button>
      ))}
      <div className="ml-auto text-xs text-white/30 font-black uppercase tracking-widest">
        XELA CRM
      </div>
    </div>
  );

  // ─── METRICS VIEW ────────────────────────────────────────────────────────

  const MetricsView = () => {
    const m = metrics || { totalLeads: 0, totalActive: 0, totalRevenue: 0, avgDealValue: 0, conversionRate: 0, pipelineValue: 0, monthlyRecurring: 0, overdueFollowUps: 0 };
    const metricCards = [
      { label: 'Total Clients', value: clients.length.toString(), icon: <Users className="w-5 h-5" />, color: 'text-brand-lavender' },
      { label: 'Active Clients', value: m.totalActive.toString(), icon: <Star className="w-5 h-5" />, color: 'text-emerald-400' },
      { label: 'Pipeline Value', value: centsShort(m.pipelineValue), icon: <TrendingUp className="w-5 h-5" />, color: 'text-brand-teal' },
      { label: 'Total Revenue', value: centsShort(m.totalRevenue), icon: <DollarSign className="w-5 h-5" />, color: 'text-yellow-400' },
    ];

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Top metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricCards.map((mc, i) => (
            <motion.div
              key={mc.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Glass>
                <div className="flex items-center justify-between mb-3">
                  <span className={`${mc.color}`}>{mc.icon}</span>
                  <span className="font-black uppercase tracking-widest text-[10px] text-white/40">{mc.label}</span>
                </div>
                <p className="text-3xl font-black text-white">{mc.value}</p>
              </Glass>
            </motion.div>
          ))}
        </div>

        {/* Second row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Glass>
            <p className="font-black uppercase tracking-widest text-xs text-white/40 mb-4">Conversion Rate</p>
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor"
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${m.conversionRate * 2.51} 251`}
                    className="text-brand-teal" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xl font-black text-white">
                  {m.conversionRate}%
                </span>
              </div>
              <div>
                <p className="text-white/60 text-sm">Won deals vs total closed</p>
                <p className="text-white/40 text-xs mt-1">Avg deal: {centsShort(m.avgDealValue)}</p>
              </div>
            </div>
          </Glass>

          <Glass>
            <div className="flex items-center justify-between mb-4">
              <p className="font-black uppercase tracking-widest text-xs text-white/40">Overdue Follow-ups</p>
              {m.overdueFollowUps > 0 && (
                <span className="flex items-center gap-1 text-red-400 text-xs font-bold">
                  <AlertCircle className="w-3.5 h-3.5" /> {m.overdueFollowUps} overdue
                </span>
              )}
            </div>
            {m.overdueFollowUps === 0 ? (
              <p className="text-white/40 text-sm">All follow-ups are current.</p>
            ) : (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {clients.filter(c => c.nextFollowUp && c.nextFollowUp < Date.now()).slice(0, 5).map(c => (
                  <div key={c.id} className="flex items-center justify-between text-sm">
                    <span className="text-white/80">{c.firstName} {c.lastName}</span>
                    <span className="text-red-400 text-xs">{fmtDate(c.nextFollowUp)}</span>
                  </div>
                ))}
              </div>
            )}
          </Glass>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3">
          <button onClick={() => { setEditingClient(emptyClientForm()); setView('add'); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-lavender text-brand-black font-black uppercase tracking-widest text-xs hover:brightness-110 transition">
            <UserPlus className="w-4 h-4" /> Add Client
          </button>
          <button onClick={() => { setDealForm(prev => ({ ...prev, clientId: '' })); setShowAddDeal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-teal text-brand-black font-black uppercase tracking-widest text-xs hover:brightness-110 transition">
            <Plus className="w-4 h-4" /> New Deal
          </button>
          <button onClick={() => setView('pipeline')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white/20 transition">
            <Eye className="w-4 h-4" /> View Pipeline
          </button>
        </div>

        {/* Recent activity */}
        <Glass>
          <p className="font-black uppercase tracking-widest text-xs text-white/40 mb-4">Recent Activity</p>
          {activities.length === 0 && clients.length === 0 ? (
            <p className="text-white/30 text-sm">No activity yet. Add a client to get started.</p>
          ) : (
            <div className="space-y-3">
              {clients.slice(0, 5).map(c => (
                <div key={c.id} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-brand-lavender/20 flex items-center justify-center text-brand-lavender text-xs font-black">
                    {initials(c.firstName, c.lastName)}
                  </div>
                  <div className="flex-1">
                    <span className="text-white/80">{c.firstName} {c.lastName}</span>
                    <span className="text-white/40 ml-2">{c.companyName}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${STATUS_COLORS[c.status]}`}>
                    {STATUS_LABELS[c.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Glass>
      </motion.div>
    );
  };

  // ─── CLIENTS VIEW ────────────────────────────────────────────────────────

  const ClientsView = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text" placeholder="Search clients..."
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-brand-lavender/50"
          />
        </div>
        <select
          value={filters.status}
          onChange={e => setFilters(prev => ({ ...prev, status: e.target.value as CRMFilters['status'] }))}
          className="px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white text-sm focus:outline-none appearance-none cursor-pointer"
        >
          <option value="all">All Statuses</option>
          {Object.values(ClientStatus).map(s => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <select
          value={`${filters.sortBy}-${filters.sortDir}`}
          onChange={e => {
            const [sortBy, sortDir] = e.target.value.split('-') as [CRMFilters['sortBy'], CRMFilters['sortDir']];
            setFilters(prev => ({ ...prev, sortBy, sortDir }));
          }}
          className="px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-white text-sm focus:outline-none appearance-none cursor-pointer"
        >
          <option value="created-desc">Newest First</option>
          <option value="created-asc">Oldest First</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
          <option value="revenue-desc">Revenue High</option>
          <option value="revenue-asc">Revenue Low</option>
        </select>
        <button
          onClick={() => { setEditingClient(emptyClientForm()); setView('add'); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-lavender text-brand-black font-black uppercase tracking-widest text-xs hover:brightness-110 transition"
        >
          <UserPlus className="w-4 h-4" /> Add Client
        </button>
      </div>

      {/* Client grid */}
      {filteredClients.length === 0 ? (
        <Glass className="text-center py-16">
          <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 text-sm">No clients found. Add your first client to get started.</p>
        </Glass>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredClients.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
              >
                <Glass onClick={() => loadClientDetail(c)} className="hover:border-brand-lavender/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-brand-lavender/20 flex items-center justify-center text-brand-lavender font-black text-sm shrink-0">
                      {initials(c.firstName, c.lastName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-bold text-sm truncate">{c.firstName} {c.lastName}</h3>
                        {c.encrypted && (
                          <span className="flex items-center gap-1 text-[10px] text-brand-teal">
                            <Shield className="w-3 h-3" /> Encrypted
                          </span>
                        )}
                      </div>
                      {c.companyName && (
                        <p className="text-white/50 text-xs flex items-center gap-1 mb-2">
                          <Building2 className="w-3 h-3" /> {c.companyName}
                        </p>
                      )}
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${STATUS_COLORS[c.status]}`}>
                        {STATUS_LABELS[c.status]}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-white/40">
                    {c.phone && <span className="flex items-center gap-1 truncate"><Phone className="w-3 h-3 shrink-0" /> {c.phone}</span>}
                    {c.email && <span className="flex items-center gap-1 truncate"><Mail className="w-3 h-3 shrink-0" /> {c.email}</span>}
                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {centsShort(c.totalRevenue)}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {fmtDate(c.lastContactedAt)}</span>
                  </div>
                  {c.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {c.tags.slice(0, 4).map(t => (
                        <span key={t} className="px-2 py-0.5 rounded-full bg-white/5 text-white/40 text-[10px]">{t}</span>
                      ))}
                      {c.tags.length > 4 && <span className="text-white/20 text-[10px]">+{c.tags.length - 4}</span>}
                    </div>
                  )}
                </Glass>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );

  // ─── PIPELINE VIEW ───────────────────────────────────────────────────────

  const PipelineView = () => {
    const grouped = STAGE_ORDER.reduce<Record<DealStage, Deal[]>>((acc, stage) => {
      acc[stage] = deals.filter(d => d.stage === stage);
      return acc;
    }, {} as Record<DealStage, Deal[]>);

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="font-black uppercase tracking-widest text-xs text-white/40">{deals.length} deals in pipeline</p>
          <button
            onClick={() => { setDealForm(prev => ({ ...prev, clientId: '' })); setShowAddDeal(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand-teal text-brand-black font-black uppercase tracking-widest text-xs hover:brightness-110 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Deal
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {STAGE_ORDER.map(stage => (
            <div key={stage} className={`rounded-[2rem] border-2 ${STAGE_COLORS[stage]} bg-white/[0.02] p-4`}>
              <div className="mb-4">
                <p className="font-black uppercase tracking-widest text-[10px] text-white/50">{STAGE_LABELS[stage]}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-white/30 text-xs">{grouped[stage].length} deals</span>
                  <span className="text-white/50 text-xs font-bold">
                    {centsShort(grouped[stage].reduce((s, d) => s + d.value, 0))}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <AnimatePresence>
                  {grouped[stage].map(deal => (
                    <motion.div
                      key={deal.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-white/5 rounded-2xl p-3 border border-white/5"
                    >
                      <p className="text-white text-sm font-bold truncate">{deal.title}</p>
                      <p className="text-white/40 text-xs truncate">{deal.clientName}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-brand-teal text-xs font-bold">{centsShort(deal.value)}</span>
                        <span className="text-white/30 text-[10px]">{deal.probability}%</span>
                      </div>
                      <p className="text-white/20 text-[10px] mt-1">{fmtDate(deal.expectedCloseDate)}</p>
                      {/* Stage mover */}
                      <select
                        value={deal.stage}
                        onChange={e => handleMoveDeal(deal.id, e.target.value as DealStage)}
                        className="mt-2 w-full px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-[10px] focus:outline-none appearance-none cursor-pointer"
                      >
                        {STAGE_ORDER.map(s => (
                          <option key={s} value={s}>{STAGE_LABELS[s]}</option>
                        ))}
                      </select>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {grouped[stage].length === 0 && (
                  <p className="text-white/10 text-xs text-center py-4">No deals</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  // ─── DETAIL VIEW ─────────────────────────────────────────────────────────

  const DetailView = () => {
    if (!selectedClient) return null;
    const c = selectedClient;

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Back button */}
        <button
          onClick={() => { setSelectedClient(null); setView('clients'); }}
          className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition"
        >
          <ChevronRight className="w-4 h-4 rotate-180" /> Back to Clients
        </button>

        {/* Client header */}
        <Glass>
          <div className="flex flex-wrap items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-brand-lavender/20 flex items-center justify-center text-brand-lavender font-black text-2xl">
              {initials(c.firstName, c.lastName)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-black text-white">{c.firstName} {c.lastName}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${STATUS_COLORS[c.status]}`}>
                  {STATUS_LABELS[c.status]}
                </span>
                {c.encrypted && (
                  <span className="flex items-center gap-1 text-xs text-brand-teal">
                    <Shield className="w-3.5 h-3.5" /> Encrypted
                  </span>
                )}
              </div>
              {c.companyName && <p className="text-white/50 mt-1">{c.companyName}</p>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setEditingClient({ ...c }); setView('add'); }}
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteClient(c.id)}
                className="p-2.5 rounded-full bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Glass>

        {/* Info grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Glass>
            <p className="font-black uppercase tracking-widest text-[10px] text-white/40 mb-3">Contact Info</p>
            <div className="space-y-2 text-sm">
              {c.email && <p className="flex items-center gap-2 text-white/70"><Mail className="w-4 h-4 text-brand-lavender" /> {c.email}</p>}
              {c.phone && <p className="flex items-center gap-2 text-white/70"><Phone className="w-4 h-4 text-brand-lavender" /> {c.phone}</p>}
              {(c.address || c.city) && (
                <p className="flex items-center gap-2 text-white/70">
                  <MapPin className="w-4 h-4 text-brand-lavender" />
                  {[c.address, c.city, c.state, c.zip].filter(Boolean).join(', ')}
                </p>
              )}
              {c.website && <p className="flex items-center gap-2 text-white/70"><Globe className="w-4 h-4 text-brand-lavender" /> {c.website}</p>}
            </div>
          </Glass>
          <Glass>
            <p className="font-black uppercase tracking-widest text-[10px] text-white/40 mb-3">Business Details</p>
            <div className="space-y-2 text-sm">
              {c.industry && <p className="flex items-center gap-2 text-white/70"><Building2 className="w-4 h-4 text-brand-teal" /> {c.industry}</p>}
              {c.source && <p className="flex items-center gap-2 text-white/70"><Globe className="w-4 h-4 text-brand-teal" /> Source: {c.source}</p>}
              {c.assignedTo && <p className="flex items-center gap-2 text-white/70"><Users className="w-4 h-4 text-brand-teal" /> Assigned: {c.assignedTo}</p>}
              {c.packageTier && (
                <p className="flex items-center gap-2 text-white/70">
                  <Star className="w-4 h-4 text-brand-teal" /> Tier: <span className="capitalize">{c.packageTier}</span>
                </p>
              )}
            </div>
          </Glass>
        </div>

        {/* Tags */}
        {c.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Tag className="w-4 h-4 text-white/30" />
            {c.tags.map(t => (
              <span key={t} className="px-3 py-1 rounded-full bg-white/5 text-white/50 text-xs border border-white/10">{t}</span>
            ))}
          </div>
        )}

        {/* Financial summary */}
        <Glass>
          <p className="font-black uppercase tracking-widest text-[10px] text-white/40 mb-4">Financial Summary</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-white/30 text-[10px] uppercase tracking-wider">Total Revenue</p>
              <p className="text-white text-lg font-black">{cents(c.totalRevenue)}</p>
            </div>
            <div>
              <p className="text-white/30 text-[10px] uppercase tracking-wider">Total Paid</p>
              <p className="text-emerald-400 text-lg font-black">{cents(c.totalPaid)}</p>
            </div>
            <div>
              <p className="text-white/30 text-[10px] uppercase tracking-wider">Outstanding</p>
              <p className={`text-lg font-black ${c.outstandingBalance > 0 ? 'text-red-400' : 'text-white/50'}`}>{cents(c.outstandingBalance)}</p>
            </div>
            <div>
              <p className="text-white/30 text-[10px] uppercase tracking-wider">Last Payment</p>
              <p className="text-white/60 text-sm">{fmtDate(c.lastPaymentDate)}</p>
            </div>
          </div>
        </Glass>

        {/* Sub-tabs */}
        <div className="flex gap-2">
          {(['activities', 'deals', 'documents'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setDetailTab(tab)}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition ${
                detailTab === tab ? 'bg-brand-lavender/20 text-brand-lavender border border-brand-lavender/30' : 'bg-white/5 text-white/40 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Sub-tab content */}
        {detailTab === 'activities' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-black uppercase tracking-widest text-xs text-white/40">{clientActivities.length} Activities</p>
              <button
                onClick={() => setShowAddActivity(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand-teal/20 text-brand-teal text-xs font-black uppercase tracking-widest hover:bg-brand-teal/30 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add Activity
              </button>
            </div>
            {clientActivities.length === 0 ? (
              <Glass><p className="text-white/30 text-sm text-center py-4">No activities recorded yet.</p></Glass>
            ) : (
              <div className="space-y-3">
                {clientActivities.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Glass className="!p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-brand-lavender shrink-0">
                          {ACTIVITY_ICONS[a.type]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-white text-sm font-bold">{a.title}</p>
                            <span className="text-white/20 text-[10px] uppercase">{a.type.replace('_', ' ')}</span>
                          </div>
                          {a.description && <p className="text-white/40 text-xs mt-1">{a.description}</p>}
                          <p className="text-white/20 text-[10px] mt-1">{fmtDateTime(a.createdAt)}</p>
                        </div>
                        <button
                          onClick={async () => {
                            try { await deleteActivity(a.id); } catch { /* local */ }
                            setClientActivities(prev => prev.filter(x => x.id !== a.id));
                          }}
                          className="text-white/20 hover:text-red-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </Glass>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {detailTab === 'deals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-black uppercase tracking-widest text-xs text-white/40">{clientDeals.length} Deals</p>
              <button
                onClick={() => { setDealForm(prev => ({ ...prev, clientId: c.id })); setShowAddDeal(true); }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand-teal/20 text-brand-teal text-xs font-black uppercase tracking-widest hover:bg-brand-teal/30 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add Deal
              </button>
            </div>
            {clientDeals.length === 0 ? (
              <Glass><p className="text-white/30 text-sm text-center py-4">No deals for this client.</p></Glass>
            ) : (
              <div className="space-y-3">
                {clientDeals.map(d => (
                  <Glass key={d.id} className="!p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm font-bold">{d.title}</p>
                        <p className="text-white/40 text-xs">{d.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-brand-teal font-black">{centsShort(d.value)}</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase mt-1 border ${STAGE_COLORS[d.stage]} text-white/60`}>
                          {STAGE_LABELS[d.stage]}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-[10px] text-white/30">
                      <span>Probability: {d.probability}%</span>
                      <span>Close: {fmtDate(d.expectedCloseDate)}</span>
                    </div>
                  </Glass>
                ))}
              </div>
            )}
          </div>
        )}

        {detailTab === 'documents' && (
          <Glass>
            <p className="font-black uppercase tracking-widest text-xs text-white/40 mb-4">Documents</p>
            <p className="text-white/30 text-sm text-center py-8">
              <FileText className="w-8 h-8 mx-auto mb-2 text-white/10" />
              Documents are managed via the Contract Generator and Invoice system.
            </p>
          </Glass>
        )}
      </motion.div>
    );
  };

  // ─── ADD/EDIT FORM ───────────────────────────────────────────────────────

  const AddEditView = () => {
    if (!editingClient) return null;
    const isEditing = !!editingClient.id;
    const set = (field: string, value: any) => setEditingClient(prev => prev ? { ...prev, [field]: value } : prev);

    const handleAddTag = () => {
      if (!tagInput.trim()) return;
      const newTags = tagInput.split(',').map(t => t.trim()).filter(Boolean);
      set('tags', [...(editingClient.tags || []), ...newTags]);
      setTagInput('');
    };

    const handleRemoveTag = (tag: string) => {
      set('tags', (editingClient.tags || []).filter(t => t !== tag));
    };

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-white uppercase tracking-widest">
            {isEditing ? 'Edit Client' : 'Add New Client'}
          </h2>
          <button
            onClick={() => { setEditingClient(null); setView('clients'); }}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <Glass>
          {/* Status selector */}
          <p className="font-black uppercase tracking-widest text-[10px] text-white/40 mb-3">Status</p>
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.values(ClientStatus).map(s => (
              <button
                key={s}
                onClick={() => set('status', s)}
                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border transition ${
                  editingClient.status === s
                    ? STATUS_COLORS[s]
                    : 'border-white/10 text-white/30 hover:border-white/20'
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>

          {/* Two-column form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="First Name" value={editingClient.firstName || ''} onChange={v => set('firstName', v)} />
            <FormField label="Last Name" value={editingClient.lastName || ''} onChange={v => set('lastName', v)} />
            <FormField label="Company Name" value={editingClient.companyName || ''} onChange={v => set('companyName', v)} />
            <FormField label="Email" value={editingClient.email || ''} onChange={v => set('email', v)} type="email" />
            <FormField label="Phone" value={editingClient.phone || ''} onChange={v => set('phone', v)} type="tel" />
            <FormField label="Website" value={editingClient.website || ''} onChange={v => set('website', v)} />
            <FormField label="Address" value={editingClient.address || ''} onChange={v => set('address', v)} />
            <FormField label="City" value={editingClient.city || ''} onChange={v => set('city', v)} />
            <FormField label="State" value={editingClient.state || ''} onChange={v => set('state', v)} />
            <FormField label="Zip" value={editingClient.zip || ''} onChange={v => set('zip', v)} />
            <FormField label="Industry" value={editingClient.industry || ''} onChange={v => set('industry', v)} />
            <div>
              <label className="font-black uppercase tracking-widest text-[10px] text-white/40 block mb-1">Source</label>
              <select
                value={editingClient.source || 'Website'}
                onChange={e => set('source', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-lavender/50 appearance-none"
              >
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="font-black uppercase tracking-widest text-[10px] text-white/40 block mb-1">Package Tier</label>
              <select
                value={editingClient.packageTier || ''}
                onChange={e => set('packageTier', e.target.value || null)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-lavender/50 appearance-none"
              >
                <option value="">None</option>
                {TIERS.map(t => t && <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <FormField label="Assigned To" value={editingClient.assignedTo || ''} onChange={v => set('assignedTo', v)} />
          </div>

          {/* Notes */}
          <div className="mt-4">
            <label className="font-black uppercase tracking-widest text-[10px] text-white/40 block mb-1">Notes</label>
            <textarea
              value={editingClient.notes || ''}
              onChange={e => set('notes', e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-brand-lavender/50 resize-none"
              placeholder="Internal notes about this client..."
            />
          </div>

          {/* Tags */}
          <div className="mt-4">
            <label className="font-black uppercase tracking-widest text-[10px] text-white/40 block mb-1">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(editingClient.tags || []).map(t => (
                <span key={t} className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 text-white/50 text-xs border border-white/10">
                  {t}
                  <button onClick={() => handleRemoveTag(t)} className="text-white/30 hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                placeholder="Add tags (comma-separated)"
                className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-brand-lavender/50"
              />
              <button onClick={handleAddTag} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white text-sm transition">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => { setEditingClient(null); setView('clients'); }}
              className="px-6 py-2.5 rounded-full bg-white/5 text-white/50 font-black uppercase tracking-widest text-xs hover:bg-white/10 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveClient}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-lavender text-brand-black font-black uppercase tracking-widest text-xs hover:brightness-110 transition"
            >
              <Check className="w-4 h-4" /> {isEditing ? 'Update' : 'Save Client'}
            </button>
          </div>
        </Glass>
      </motion.div>
    );
  };

  // ─── FORM FIELD ──────────────────────────────────────────────────────────

  const FormField: React.FC<{ label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }> = ({
    label, value, onChange, type = 'text', placeholder,
  }) => (
    <div>
      <label className="font-black uppercase tracking-widest text-[10px] text-white/40 block mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || label}
        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-brand-lavender/50"
      />
    </div>
  );

  // ─── ADD DEAL MODAL ──────────────────────────────────────────────────────

  const AddDealModal = () => (
    <AnimatePresence>
      {showAddDeal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowAddDeal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg bg-brand-black/95 border border-white/10 rounded-[2.5rem] p-8 space-y-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-black text-white uppercase tracking-widest">New Deal</h3>
              <button onClick={() => setShowAddDeal(false)} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div>
              <label className="font-black uppercase tracking-widest text-[10px] text-white/40 block mb-1">Client</label>
              <select
                value={dealForm.clientId}
                onChange={e => setDealForm(prev => ({ ...prev, clientId: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none appearance-none"
              >
                <option value="">Select client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName} — {c.companyName}</option>)}
              </select>
            </div>

            <FormField label="Title" value={dealForm.title} onChange={v => setDealForm(prev => ({ ...prev, title: v }))} />

            <div>
              <label className="font-black uppercase tracking-widest text-[10px] text-white/40 block mb-1">Description</label>
              <textarea
                value={dealForm.description}
                onChange={e => setDealForm(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Value ($)" value={dealForm.value} onChange={v => setDealForm(prev => ({ ...prev, value: v }))} type="number" placeholder="0.00" />
              <div>
                <label className="font-black uppercase tracking-widest text-[10px] text-white/40 block mb-1">Stage</label>
                <select
                  value={dealForm.stage}
                  onChange={e => setDealForm(prev => ({ ...prev, stage: e.target.value as DealStage }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none appearance-none"
                >
                  {STAGE_ORDER.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="font-black uppercase tracking-widest text-[10px] text-white/40 block mb-1">
                Probability: {dealForm.probability}%
              </label>
              <input
                type="range" min="0" max="100" value={dealForm.probability}
                onChange={e => setDealForm(prev => ({ ...prev, probability: parseInt(e.target.value) }))}
                className="w-full accent-brand-teal"
              />
            </div>

            <FormField
              label="Expected Close Date"
              value={dealForm.expectedCloseDate}
              onChange={v => setDealForm(prev => ({ ...prev, expectedCloseDate: v }))}
              type="date"
            />

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowAddDeal(false)} className="px-6 py-2.5 rounded-full bg-white/5 text-white/50 font-black uppercase tracking-widest text-xs hover:bg-white/10 transition">
                Cancel
              </button>
              <button onClick={handleSaveDeal} className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-teal text-brand-black font-black uppercase tracking-widest text-xs hover:brightness-110 transition">
                <Check className="w-4 h-4" /> Save Deal
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ─── ADD ACTIVITY MODAL ──────────────────────────────────────────────────

  const AddActivityModal = () => (
    <AnimatePresence>
      {showAddActivity && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowAddActivity(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg bg-brand-black/95 border border-white/10 rounded-[2.5rem] p-8 space-y-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-black text-white uppercase tracking-widest">New Activity</h3>
              <button onClick={() => setShowAddActivity(false)} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div>
              <label className="font-black uppercase tracking-widest text-[10px] text-white/40 block mb-1">Type</label>
              <select
                value={activityForm.type}
                onChange={e => setActivityForm(prev => ({ ...prev, type: e.target.value as ActivityType }))}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none appearance-none"
              >
                {Object.values(ActivityType).map(t => (
                  <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                ))}
              </select>
            </div>

            <FormField label="Title" value={activityForm.title} onChange={v => setActivityForm(prev => ({ ...prev, title: v }))} />

            <div>
              <label className="font-black uppercase tracking-widest text-[10px] text-white/40 block mb-1">Description</label>
              <textarea
                value={activityForm.description}
                onChange={e => setActivityForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="font-black uppercase tracking-widest text-[10px] text-white/40 block mb-1">Channel</label>
              <select
                value={activityForm.channel}
                onChange={e => setActivityForm(prev => ({ ...prev, channel: e.target.value as CommunicationChannel }))}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none appearance-none"
              >
                {Object.values(CommunicationChannel).map(ch => (
                  <option key={ch} value={ch}>{ch.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowAddActivity(false)} className="px-6 py-2.5 rounded-full bg-white/5 text-white/50 font-black uppercase tracking-widest text-xs hover:bg-white/10 transition">
                Cancel
              </button>
              <button onClick={handleSaveActivity} className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-teal text-brand-black font-black uppercase tracking-widest text-xs hover:brightness-110 transition">
                <Check className="w-4 h-4" /> Save Activity
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ─── LOADING STATE ───────────────────────────────────────────────────────

  if (isLoading && clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-brand-lavender animate-spin mb-4" />
        <p className="text-white/40 text-sm font-black uppercase tracking-widest">Loading CRM...</p>
      </div>
    );
  }

  // ─── RENDER ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-2">
      <TabNav />

      <AnimatePresence mode="wait">
        {view === 'metrics' && <MetricsView key="metrics" />}
        {view === 'clients' && <ClientsView key="clients" />}
        {view === 'pipeline' && <PipelineView key="pipeline" />}
        {view === 'detail' && <DetailView key="detail" />}
        {view === 'add' && <AddEditView key="add" />}
      </AnimatePresence>

      <AddDealModal />
      <AddActivityModal />
    </div>
  );
};
