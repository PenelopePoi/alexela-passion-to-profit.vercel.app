import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package, Sparkles, Share2, FileText, Trash2, ChevronDown, Percent, ShoppingCart,
} from 'lucide-react';
import { ServiceGrid } from './ServiceGrid';
import { AddOnSelector } from './AddOnSelector';
import {
  MAIN_SERVICES, calculateBundleTotal, CATEGORY_LABELS,
  type Service, type ServiceCategory,
} from './services-data';

interface ServiceBundleBuilderProps {
  onGenerateProposal?: (services: Service[], total: number) => void;
  onShareBundle?: (services: Service[]) => void;
  industry?: string;
}

const INDUSTRY_RECOMMENDATIONS: Record<string, string[]> = {
  'lawn-care': ['cardcut-calibrated', 'yard-sign-kit', 'google-business-setup', 'nextdoor-domination', 'vehicle-wrap-design'],
  'cleaning': ['promotion-pal', 'flyer-factory', 'google-business-setup', 'nextdoor-domination', 'referral-program'],
  'beauty': ['promotion-pal', 'social-starter', 'instagram-overhaul', 'booking-system', 'content-calendar'],
  'construction': ['sticker-system', 'vehicle-wrap-design', 'google-business-setup', 'yard-sign-kit', 'landing-page'],
  'food': ['promotion-pal', 'social-starter', 'tiktok-strategy', 'reel-templates', 'google-business-setup'],
  'consulting': ['brand-bible', 'linkedin-setup', 'landing-page', 'email-templates', 'presentation-deck'],
  'fitness': ['social-starter', 'booking-system', 'reel-templates', 'content-calendar', 'tiktok-strategy'],
  'general': ['promotion-pal', 'google-business-setup', 'social-starter', 'content-calendar', 'selling-sales-set'],
};

export const ServiceBundleBuilder: React.FC<ServiceBundleBuilderProps> = ({
  onGenerateProposal,
  onShareBundle,
  industry = 'general',
}) => {
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<Service[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(true);

  const allSelected = useMemo(() => [...selectedServices, ...selectedAddOns], [selectedServices, selectedAddOns]);

  const { subtotal, discount, discountPercent, total } = useMemo(
    () => calculateBundleTotal(allSelected),
    [allSelected],
  );

  const recommendations = useMemo(() => {
    const recIds = INDUSTRY_RECOMMENDATIONS[industry] || INDUSTRY_RECOMMENDATIONS.general;
    return MAIN_SERVICES.filter(s => recIds.includes(s.id));
  }, [industry]);

  const handleSelectService = useCallback((service: Service) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.id === service.id);
      if (exists) return prev.filter(s => s.id !== service.id);
      return [...prev, service];
    });
  }, []);

  const handleSelectAddOn = useCallback((addOn: Service) => {
    setSelectedAddOns(prev => {
      const exists = prev.find(s => s.id === addOn.id);
      if (exists) return prev.filter(s => s.id !== addOn.id);
      return [...prev, addOn];
    });
  }, []);

  const handleRemove = useCallback((service: Service) => {
    setSelectedServices(prev => prev.filter(s => s.id !== service.id));
    setSelectedAddOns(prev => prev.filter(s => s.id !== service.id));
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedServices([]);
    setSelectedAddOns([]);
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8">
        {/* ── Left: Service Browser ── */}
        <div className="space-y-8">
          {/* Recommendations */}
          {showRecommendations && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-brand-teal/5 to-brand-lavender/5 rounded-[2rem] p-6 sm:p-8 border border-brand-teal/10"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-brand-teal" />
                  <h3 className="font-serif text-lg font-bold text-brand-black">
                    Recommended for Your Industry
                  </h3>
                </div>
                <button
                  onClick={() => setShowRecommendations(false)}
                  className="text-xs text-stone-400 hover:text-stone-600"
                >
                  Dismiss
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recommendations.map(service => {
                  const isSelected = selectedServices.some(s => s.id === service.id);
                  return (
                    <button
                      key={service.id}
                      onClick={() => handleSelectService(service)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-brand-teal text-white shadow-lg shadow-brand-teal/20'
                          : 'bg-white text-brand-black border border-stone-200 hover:border-brand-teal'
                      }`}
                    >
                      <span>{service.name}</span>
                      <span className="opacity-60">{service.displayPrice}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Full service grid */}
          <ServiceGrid
            showFilters={true}
            selectedServices={selectedServices}
            onSelectService={handleSelectService}
          />
        </div>

        {/* ── Right: Cart / Summary ── */}
        <div className="xl:sticky xl:top-8 xl:self-start">
          <motion.div
            layout
            className="bg-white rounded-[2rem] border-2 border-stone-100 shadow-xl overflow-hidden"
          >
            {/* Cart header */}
            <div className="p-6 border-b border-stone-100 bg-stone-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={18} className="text-brand-teal" />
                  <h3 className="font-serif text-lg font-bold text-brand-black">Your Package</h3>
                </div>
                {allSelected.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-stone-400 hover:text-red-500 transition-colors flex items-center gap-1"
                  >
                    <Trash2 size={12} /> Clear
                  </button>
                )}
              </div>
              <p className="text-xs text-stone-400 mt-1">
                {allSelected.length === 0
                  ? 'Add services to build your package'
                  : `${allSelected.length} item${allSelected.length !== 1 ? 's' : ''} selected`}
              </p>
            </div>

            {/* Selected items */}
            <div className="max-h-[40vh] overflow-y-auto">
              <AnimatePresence>
                {allSelected.map(service => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    className="flex items-center justify-between px-6 py-3 border-b border-stone-50 hover:bg-stone-50/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="text-sm font-semibold text-brand-black truncate">{service.name}</p>
                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-stone-400">
                        {CATEGORY_LABELS[service.category]}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-bold text-brand-black tabular-nums">
                        {service.displayPrice}
                      </span>
                      <button
                        onClick={() => handleRemove(service)}
                        className="p-1 rounded-lg hover:bg-red-50 text-stone-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Add-ons */}
            {selectedServices.length > 0 && (
              <div className="px-6 py-4 border-t border-stone-100">
                <AddOnSelector
                  selectedServices={selectedServices}
                  selectedAddOns={selectedAddOns}
                  onToggleAddOn={handleSelectAddOn}
                  compact
                />
              </div>
            )}

            {/* Totals */}
            <div className="p-6 bg-stone-50/50 border-t border-stone-100 space-y-3">
              <div className="flex justify-between text-sm text-stone-500">
                <span>Subtotal</span>
                <span className="font-semibold tabular-nums">${subtotal.toLocaleString()}</span>
              </div>

              {discountPercent > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex justify-between text-sm"
                >
                  <span className="flex items-center gap-1.5 text-brand-teal font-semibold">
                    <Percent size={13} />
                    Bundle Discount ({Math.round(discountPercent * 100)}%)
                  </span>
                  <span className="font-bold text-brand-teal tabular-nums">
                    -${discount.toLocaleString()}
                  </span>
                </motion.div>
              )}

              <div className="flex justify-between items-end pt-3 border-t border-stone-200">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Total</span>
                <span className="text-3xl font-black text-brand-black tabular-nums">
                  ${total.toLocaleString()}
                </span>
              </div>

              {allSelected.length >= 3 && discountPercent < 0.15 && (
                <p className="text-xs text-brand-teal font-medium text-center">
                  Add {5 - allSelected.length} more for 15% off!
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="p-6 space-y-3">
              <button
                onClick={() => onGenerateProposal?.(allSelected, total)}
                disabled={allSelected.length === 0}
                className="w-full py-3.5 bg-brand-black text-white rounded-2xl font-bold text-sm uppercase tracking-widest transition-all hover:bg-brand-teal active:scale-[0.97] disabled:opacity-30 disabled:hover:bg-brand-black disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FileText size={16} />
                Generate Proposal
              </button>
              <button
                onClick={() => onShareBundle?.(allSelected)}
                disabled={allSelected.length === 0}
                className="w-full py-3.5 bg-white text-brand-black border-2 border-stone-200 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all hover:border-brand-teal active:scale-[0.97] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Share2 size={16} />
                Share Bundle
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
