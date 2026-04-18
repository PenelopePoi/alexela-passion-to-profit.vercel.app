import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Plus, Sparkles } from 'lucide-react';
import { ADD_ONS, getAddOnsForService, type Service } from './services-data';

interface AddOnSelectorProps {
  selectedServices: Service[];
  selectedAddOns: Service[];
  onToggleAddOn: (addOn: Service) => void;
  compact?: boolean;
}

const POPULAR_ADDON_IDS = ['addon-rush-delivery', 'addon-spanish-translation', 'addon-brand-photography'];

export const AddOnSelector: React.FC<AddOnSelectorProps> = ({
  selectedServices,
  selectedAddOns,
  onToggleAddOn,
  compact = false,
}) => {
  const relevantAddOns = useMemo(() => {
    if (selectedServices.length === 0) return ADD_ONS;

    const addOnSet = new Map<string, Service>();
    for (const service of selectedServices) {
      for (const addOn of getAddOnsForService(service)) {
        addOnSet.set(addOn.id, addOn);
      }
    }
    return Array.from(addOnSet.values());
  }, [selectedServices]);

  const popularAddOns = useMemo(
    () => relevantAddOns.filter(a => POPULAR_ADDON_IDS.includes(a.id)),
    [relevantAddOns],
  );

  const selectedIds = new Set(selectedAddOns.map(a => a.id));

  const runningTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);

  if (compact) {
    return (
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 flex items-center gap-1.5">
          <Sparkles size={10} className="text-brand-teal" />
          Most clients also add
        </p>
        <div className="space-y-1.5">
          {relevantAddOns.slice(0, 4).map(addOn => {
            const isSelected = selectedIds.has(addOn.id);
            return (
              <button
                key={addOn.id}
                onClick={() => onToggleAddOn(addOn)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                  isSelected
                    ? 'bg-brand-teal/10 border border-brand-teal/20'
                    : 'bg-stone-50 border border-transparent hover:border-stone-200'
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                    isSelected ? 'bg-brand-teal border-brand-teal' : 'border-stone-300'
                  }`}>
                    {isSelected && <Check size={10} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className="text-xs font-semibold text-brand-black truncate">{addOn.name}</span>
                </div>
                <span className="text-xs font-bold text-stone-500 shrink-0 ml-2">{addOn.displayPrice}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-2xl font-bold text-brand-black">Add-Ons</h3>
          <p className="text-sm text-stone-400 mt-1">Enhance your package with extras</p>
        </div>
        {selectedAddOns.length > 0 && (
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Add-on total</p>
            <p className="text-xl font-black text-brand-black tabular-nums">+${runningTotal}</p>
          </div>
        )}
      </div>

      {/* Popular recommendation */}
      {popularAddOns.length > 0 && (
        <div className="bg-gradient-to-r from-brand-teal/5 to-brand-lavender/5 rounded-2xl p-5 border border-brand-teal/10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-teal mb-3 flex items-center gap-1.5">
            <Sparkles size={11} />
            Most clients also add...
          </p>
          <div className="flex flex-wrap gap-2">
            {popularAddOns.map(addOn => {
              const isSelected = selectedIds.has(addOn.id);
              return (
                <button
                  key={addOn.id}
                  onClick={() => onToggleAddOn(addOn)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-brand-teal text-white shadow-lg shadow-brand-teal/20'
                      : 'bg-white text-brand-black border border-stone-200 hover:border-brand-teal'
                  }`}
                >
                  {isSelected ? <Check size={12} strokeWidth={3} /> : <Plus size={12} />}
                  {addOn.name} <span className="opacity-60">{addOn.displayPrice}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Full add-on list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AnimatePresence>
          {relevantAddOns.map((addOn, i) => {
            const isSelected = selectedIds.has(addOn.id);
            return (
              <motion.button
                key={addOn.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => onToggleAddOn(addOn)}
                className={`flex items-start gap-3 p-4 rounded-2xl text-left transition-all border-2 ${
                  isSelected
                    ? 'bg-brand-teal/5 border-brand-teal/20 shadow-md'
                    : 'bg-white border-stone-100 hover:border-stone-200 hover:shadow-sm'
                }`}
              >
                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  isSelected ? 'bg-brand-teal border-brand-teal' : 'border-stone-300'
                }`}>
                  {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-brand-black">{addOn.name}</p>
                    <p className="text-sm font-black text-brand-black shrink-0 tabular-nums">
                      {addOn.displayPrice}
                    </p>
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">{addOn.description}</p>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
