import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail, Phone, CheckCircle, Clock, Download, RefreshCw,
  Sparkles, Inbox, TrendingUp, User, MapPin, Briefcase, Zap,
  MessageSquare, AlertCircle, Archive, Eye
} from 'lucide-react';
import {
  getSubmissions,
  getSubmissionStats,
  updateSubmissionStatus,
  exportSubmissions,
} from '../services/submissionLog';
import type { SubmissionRecord, SubmissionStatus } from '../services/submissionLog';

type FilterType = 'all' | SubmissionStatus;

const STATUS_CONFIG: Record<SubmissionStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  'new': { label: 'New', color: 'text-brand-teal', bg: 'bg-brand-teal/10 border-brand-teal/30', icon: <Sparkles size={12} /> },
  'reviewed': { label: 'Reviewed', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30', icon: <Eye size={12} /> },
  'contacted': { label: 'Contacted', color: 'text-brand-lavender', bg: 'bg-brand-lavender/10 border-brand-lavender/30', icon: <MessageSquare size={12} /> },
  'quoted': { label: 'Quoted', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/30', icon: <AlertCircle size={12} /> },
  'closed-won': { label: 'Closed Won', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30', icon: <CheckCircle size={12} /> },
  'closed-lost': { label: 'Closed Lost', color: 'text-stone-400', bg: 'bg-stone-400/10 border-stone-400/30', icon: <Archive size={12} /> },
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const SubmissionsInbox: React.FC = () => {
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setSubmissions(getSubmissions());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => getSubmissionStats(), [submissions]);

  const filtered = useMemo(() => {
    if (filter === 'all') return submissions;
    return submissions.filter(s => s.status === filter);
  }, [submissions, filter]);

  const selected = useMemo(() => submissions.find(s => s.id === selectedId), [submissions, selectedId]);

  const handleStatusChange = useCallback((id: string, status: SubmissionStatus) => {
    updateSubmissionStatus(id, status);
    loadData();
  }, [loadData]);

  return (
    <div className="w-full min-h-screen bg-brand-black p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-black text-white">Submissions Inbox</h1>
            <p className="text-white/60 mt-1">Every lead, every action item, every opportunity</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadData}
              className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={exportSubmissions}
              className="flex items-center gap-2 px-4 py-3 bg-brand-teal text-brand-black rounded-xl font-bold text-sm hover:scale-105 transition-all"
            >
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Today', value: stats.today, icon: <TrendingUp size={20} />, color: 'text-brand-teal' },
            { label: 'This Week', value: stats.thisWeek, icon: <Clock size={20} />, color: 'text-brand-lavender' },
            { label: 'New', value: stats.new, icon: <Sparkles size={20} />, color: 'text-amber-400' },
            { label: 'Total', value: stats.total, icon: <Inbox size={20} />, color: 'text-white' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-5"
            >
              <div className={`${stat.color} mb-2`}>{stat.icon}</div>
              <p className="text-3xl font-black text-white">{stat.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'new', 'reviewed', 'contacted', 'quoted', 'closed-won', 'closed-lost'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === f
                  ? 'bg-brand-teal text-brand-black'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {f === 'all' ? 'All' : STATUS_CONFIG[f as SubmissionStatus].label}
              {f !== 'all' && ` (${(stats as any)[f] || 0})`}
            </button>
          ))}
        </div>

        {/* Main Layout: List + Detail */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* List */}
          <div className="lg:col-span-2 space-y-3 max-h-[70vh] overflow-y-auto pr-2">
            {filtered.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <Inbox size={32} className="mx-auto text-white/30 mb-3" />
                <p className="text-white/60 font-medium">No submissions yet</p>
                <p className="text-white/40 text-sm mt-1">New leads will appear here automatically</p>
              </div>
            ) : (
              <AnimatePresence>
                {filtered.map((sub, i) => {
                  const statusCfg = STATUS_CONFIG[sub.status];
                  return (
                    <motion.button
                      key={sub.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => setSelectedId(sub.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${
                        selectedId === sub.id
                          ? 'bg-white/10 border-brand-teal shadow-lg shadow-brand-teal/10'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-black text-white text-sm truncate flex-1">
                          {sub.data.companyName || 'Untitled'}
                        </p>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${statusCfg.bg} ${statusCfg.color} shrink-0 ml-2 flex items-center gap-1`}>
                          {statusCfg.icon}
                          {statusCfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-white/60 truncate">{sub.data.industry || sub.data.ownerName || '—'}</p>
                      <div className="flex items-center justify-between mt-2 text-[10px] text-white/40">
                        <span>{sub.source.replace('-', ' ')}</span>
                        <span>{timeAgo(sub.timestamp)}</span>
                      </div>
                      {sub.actionItems.length > 0 && (
                        <div className="mt-2 text-[10px] text-brand-teal font-bold">
                          {sub.actionItems.length} action item{sub.actionItems.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-3">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6 sticky top-6"
              >
                {/* Header */}
                <div>
                  <h2 className="text-2xl font-serif font-black text-white">{selected.data.companyName || 'Untitled'}</h2>
                  <p className="text-white/60 text-sm mt-1">Received {timeAgo(selected.timestamp)} via {selected.source.replace('-', ' ')}</p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3">
                  {selected.data.phone && (
                    <a
                      href={`tel:${encodeURIComponent(String(selected.data.phone).replace(/[^\d+]/g, ''))}`}
                      className="flex items-center justify-center gap-2 p-3 bg-brand-teal text-brand-black rounded-xl font-bold text-sm hover:scale-105 transition-all"
                    >
                      <Phone size={16} /> Call
                    </a>
                  )}
                  {selected.data.email && (
                    <a
                      href={`mailto:${encodeURIComponent(String(selected.data.email))}?subject=${encodeURIComponent('Your XELA Brand Quote')}&body=${encodeURIComponent(`Hi ${selected.data.ownerName || 'there'}!`)}`}
                      className="flex items-center justify-center gap-2 p-3 bg-brand-lavender text-white rounded-xl font-bold text-sm hover:scale-105 transition-all"
                    >
                      <Mail size={16} /> Email
                    </a>
                  )}
                </div>

                {/* Data fields */}
                <div className="space-y-3">
                  {[
                    { icon: <User size={14} />, label: 'Owner', value: selected.data.ownerName },
                    { icon: <Briefcase size={14} />, label: 'Industry', value: selected.data.industry },
                    { icon: <MapPin size={14} />, label: 'Location', value: selected.data.location },
                    { icon: <Zap size={14} />, label: 'Vibe', value: selected.data.vibe },
                    { icon: <Phone size={14} />, label: 'Phone', value: selected.data.phone },
                    { icon: <Mail size={14} />, label: 'Email', value: selected.data.email },
                  ].filter(f => f.value).map(field => (
                    <div key={field.label} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                      <div className="text-brand-teal">{field.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/40">{field.label}</p>
                        <p className="text-white font-medium truncate">{field.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Items */}
                {selected.actionItems.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-lavender mb-3">Action Items</p>
                    <div className="space-y-2">
                      {selected.actionItems.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-white/80">
                          <span className="text-brand-teal shrink-0 mt-0.5">✦</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Actions */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Change Status</p>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(STATUS_CONFIG) as SubmissionStatus[]).map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(selected.id, status)}
                        className={`px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                          selected.status === status
                            ? 'bg-white text-brand-black'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {STATUS_CONFIG[status].label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-[2rem] p-12 text-center">
                <Eye size={32} className="mx-auto text-white/30 mb-3" />
                <p className="text-white/60 font-medium">Select a submission to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionsInbox;
