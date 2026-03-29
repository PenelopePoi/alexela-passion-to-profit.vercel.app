
import React, { useState, useEffect } from 'react';
import { BrandInput, BrandStrategy, ContentCalendarDay, EmailTemplate, BrandGuidelines } from '../types';
import { Calendar, Mail, FileText, Download, Loader2, ChevronRight, ChevronDown, Sparkles, Share2, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateContentCalendar, generateEmailTemplates, generateBrandGuidelines } from '../services/geminiService';

interface BrandAssetsProps {
  input: BrandInput;
  strategy: BrandStrategy;
  onUpdateStrategy: (updated: Partial<BrandStrategy>) => void;
}

export const BrandAssets: React.FC<BrandAssetsProps> = ({ input, strategy, onUpdateStrategy }) => {
  const [activeSubTab, setActiveSubTab] = useState<'calendar' | 'emails' | 'guidelines'>('calendar');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!strategy.contentCalendar && activeSubTab === 'calendar') {
      handleGenerateCalendar();
    }
    if (!strategy.emailTemplates && activeSubTab === 'emails') {
      handleGenerateEmails();
    }
    if (!strategy.brandGuidelines && activeSubTab === 'guidelines') {
      handleGenerateGuidelines();
    }
  }, [activeSubTab]);

  const handleGenerateCalendar = async () => {
    setIsLoading(true);
    try {
      const calendar = await generateContentCalendar(input, strategy);
      onUpdateStrategy({ contentCalendar: calendar });
    } catch (error) {
      console.error("Failed to generate calendar", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateEmails = async () => {
    setIsLoading(true);
    try {
      const emails = await generateEmailTemplates(input, strategy);
      onUpdateStrategy({ emailTemplates: emails });
    } catch (error) {
      console.error("Failed to generate emails", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateGuidelines = async () => {
    setIsLoading(true);
    try {
      const guidelines = await generateBrandGuidelines(input, strategy);
      onUpdateStrategy({ brandGuidelines: guidelines });
    } catch (error) {
      console.error("Failed to generate guidelines", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderCalendar = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black text-brand-black">30-Day Content Calendar</h3>
          <p className="text-stone-500 text-sm font-medium">Strategic social media roadmap for your brand.</p>
        </div>
        <button 
          onClick={handleGenerateCalendar}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-brand-lavender text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-black transition-all disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
          Regenerate
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {strategy.contentCalendar?.map((day) => (
          <motion.div 
            key={day.day}
            layout
            className="glass p-6 rounded-3xl border border-white shadow-sm hover:shadow-md transition-all cursor-pointer group"
            onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center text-brand-teal font-black">
                {day.day}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 bg-stone-100 px-2 py-1 rounded-full">
                {day.platform}
              </span>
            </div>
            <h4 className="font-black text-brand-black mb-2 group-hover:text-brand-lavender transition-colors">{day.topic}</h4>
            
            <AnimatePresence>
              {expandedDay === day.day && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 mt-4 border-t border-stone-100 space-y-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 block mb-1">Caption</span>
                      <p className="text-xs text-stone-600 leading-relaxed italic">"{day.caption}"</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 block mb-1">Visual Idea</span>
                      <p className="text-xs text-stone-600 leading-relaxed">{day.visualIdea}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderEmails = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black text-brand-black">Email Marketing Suite</h3>
          <p className="text-stone-500 text-sm font-medium">High-conversion templates for every customer touchpoint.</p>
        </div>
        <button 
          onClick={handleGenerateEmails}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-brand-teal text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-black transition-all disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
          Regenerate
        </button>
      </div>

      <div className="space-y-4">
        {strategy.emailTemplates?.map((email) => (
          <div 
            key={email.type}
            className="glass rounded-[2rem] border border-white overflow-hidden shadow-sm"
          >
            <button 
              onClick={() => setExpandedEmail(expandedEmail === email.type ? null : email.type)}
              className="w-full flex items-center justify-between p-8 hover:bg-white/50 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-brand-teal/10 text-brand-teal">
                  <Mail size={20} />
                </div>
                <div className="text-left">
                  <h4 className="font-black text-brand-black">{email.type}</h4>
                  <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Subject: {email.subject}</p>
                </div>
              </div>
              {expandedEmail === email.type ? <ChevronDown size={20} className="text-stone-300" /> : <ChevronRight size={20} className="text-stone-300" />}
            </button>

            <AnimatePresence>
              {expandedEmail === email.type && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="p-8 pt-0 border-t border-stone-100 bg-stone-50/50">
                    <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-inner mt-4">
                      <pre className="text-xs text-stone-700 whitespace-pre-wrap font-mono leading-relaxed">
                        {email.body}
                      </pre>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                      <button className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-stone-200 transition-all">
                        <Download size={14} /> Copy HTML
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-brand-black text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-brand-lavender transition-all">
                        <Share2 size={14} /> Send Test
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGuidelines = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black text-brand-black">Official Brand Guidelines</h3>
          <p className="text-stone-500 text-sm font-medium">The definitive rulebook for your brand's visual and verbal identity.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleGenerateGuidelines}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-stone-100 text-stone-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-stone-200 transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
            Update
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-brand-black text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-lavender transition-all">
            <Printer size={16} /> Export PDF
          </button>
        </div>
      </div>

      {strategy.brandGuidelines ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[
            { title: 'Logo Usage', icon: <Sparkles />, content: strategy.brandGuidelines.logoUsage, color: 'bg-brand-lavender' },
            { title: 'Color Theory', icon: <FileText />, content: strategy.brandGuidelines.colorUsage, color: 'bg-brand-teal' },
            { title: 'Typography', icon: <FileText />, content: strategy.brandGuidelines.typographyUsage, color: 'bg-orange-500' },
            { title: 'Voice & Tone', icon: <Mail />, content: strategy.brandGuidelines.voiceAndTone, color: 'bg-brand-black' },
            { title: 'Imagery Style', icon: <Sparkles />, content: strategy.brandGuidelines.imageryStyle, color: 'bg-stone-500', full: true }
          ].map((section, i) => (
            <div 
              key={i} 
              className={`glass p-10 rounded-[3rem] border border-white shadow-xl ${section.full ? 'lg:col-span-2' : ''}`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-4 rounded-2xl ${section.color} text-white shadow-lg`}>
                  {section.icon}
                </div>
                <h4 className="text-xl font-black text-brand-black uppercase tracking-tight">{section.title}</h4>
              </div>
              <p className="text-stone-600 leading-relaxed font-medium">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-stone-50 rounded-[3rem] border-2 border-dashed border-stone-200">
          <Loader2 className="animate-spin text-stone-300 mb-4" size={48} />
          <p className="text-stone-400 font-black uppercase tracking-widest text-xs">Generating Guidelines...</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-10">
      {/* Sub-navigation */}
      <div className="flex gap-2 p-2 bg-stone-100 rounded-[2rem] w-fit">
        {[
          { id: 'calendar', label: 'Content Calendar', icon: <Calendar size={16} /> },
          { id: 'emails', label: 'Email Suite', icon: <Mail size={16} /> },
          { id: 'guidelines', label: 'Brand Guidelines', icon: <FileText size={16} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === tab.id ? 'bg-white text-brand-black shadow-md' : 'text-stone-400 hover:text-stone-600'}`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeSubTab === 'calendar' && renderCalendar()}
          {activeSubTab === 'emails' && renderEmails()}
          {activeSubTab === 'guidelines' && renderGuidelines()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const RefreshCw = ({ size, className }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);
