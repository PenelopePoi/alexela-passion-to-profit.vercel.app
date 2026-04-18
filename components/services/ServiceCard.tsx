import React from 'react';
import { motion } from 'motion/react';
import { Check, Zap, Clock, Plus } from 'lucide-react';
import type { Service } from './services-data';

export interface ServiceCardProps {
  service: Service;
  selected?: boolean;
  onSelect: (service: Service) => void;
  ctaLabel?: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  selected = false,
  onSelect,
  ctaLabel,
}) => {
  const tierColors = {
    budget: 'border-stone-200 hover:border-brand-teal/40',
    premium: 'border-stone-200 hover:border-brand-lavender/40',
    elite: 'border-brand-black/10 hover:border-brand-lavender/40',
  };

  const tierBadge = {
    budget: 'bg-brand-teal/10 text-brand-teal',
    premium: 'bg-brand-lavender/10 text-brand-lavender',
    elite: 'bg-brand-black text-white',
  };

  const tierCta = {
    budget: 'bg-brand-black text-white hover:bg-brand-teal',
    premium: 'bg-brand-lavender text-white hover:bg-brand-black',
    elite: 'bg-brand-black text-white hover:bg-brand-lavender',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={`
        relative bg-white rounded-[2rem] p-6 sm:p-8 border-2 transition-shadow duration-300
        ${tierColors[service.tier]}
        ${selected ? 'ring-2 ring-brand-teal shadow-2xl shadow-brand-teal/10' : 'shadow-lg hover:shadow-xl'}
      `}
    >
      {/* Popular badge */}
      {service.popular && (
        <div className="absolute -top-3 left-6 px-4 py-1 bg-brand-teal text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg">
          Most Popular
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <span className={`inline-block text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-3 ${tierBadge[service.tier]}`}>
            {service.tier}
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-brand-black leading-tight truncate">
            {service.name}
          </h3>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl sm:text-3xl font-black text-brand-black tracking-tight">
            {service.displayPrice}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="text-stone-500 text-sm font-medium leading-relaxed mb-5">
        {service.description}
      </p>

      {/* Deliverables checklist */}
      <ul className="space-y-2.5 mb-6">
        {service.deliverables.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-brand-ink">
            <Check size={15} className="text-brand-teal shrink-0 mt-0.5" strokeWidth={3} />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {/* Meta row: time + automation */}
      <div className="flex items-center gap-4 mb-6 text-xs text-stone-400">
        <div className="flex items-center gap-1.5">
          <Clock size={12} />
          <span>{service.timeToDeliver}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-1">
          <Zap size={12} className="text-brand-teal" />
          <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${service.automationLevel}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-full bg-gradient-to-r from-brand-teal to-brand-teal-dark rounded-full"
            />
          </div>
          <span className="tabular-nums">{service.automationLevel}%</span>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => onSelect(service)}
        className={`
          w-full py-3.5 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all duration-200
          active:scale-[0.97]
          ${selected
            ? 'bg-brand-teal text-white shadow-lg shadow-brand-teal/20'
            : tierCta[service.tier]
          }
        `}
      >
        {selected ? (
          <span className="flex items-center justify-center gap-2">
            <Check size={16} strokeWidth={3} /> Added
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Plus size={16} strokeWidth={2.5} />
            {ctaLabel || (service.addOn ? 'Add This' : 'Add to Package')}
          </span>
        )}
      </button>
    </motion.div>
  );
};
