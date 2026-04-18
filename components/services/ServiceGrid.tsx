import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { ServiceCard } from './ServiceCard';
import { MAIN_SERVICES, CATEGORY_LABELS, type Service, type ServiceCategory } from './services-data';

export interface ServiceGridProps {
  category?: ServiceCategory;
  maxItems?: number;
  showFilters?: boolean;
  selectedServices?: Service[];
  onSelectService?: (service: Service) => void;
}

type SortMode = 'default' | 'price-asc' | 'price-desc';

const SORT_LABELS: Record<SortMode, string> = {
  default: 'Default',
  'price-asc': 'Price: Low → High',
  'price-desc': 'Price: High → Low',
};

export const ServiceGrid: React.FC<ServiceGridProps> = ({
  category: initialCategory,
  maxItems,
  showFilters = true,
  selectedServices = [],
  onSelectService = () => {},
}) => {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | 'all'>(initialCategory || 'all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortMode>('default');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const categories = useMemo(() => {
    const cats = [...new Set(MAIN_SERVICES.map(s => s.category))] as ServiceCategory[];
    return cats;
  }, []);

  const filteredServices = useMemo(() => {
    let result = MAIN_SERVICES;

    if (activeCategory !== 'all') {
      result = result.filter(s => s.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.deliverables.some(d => d.toLowerCase().includes(q))
      );
    }

    if (sort === 'price-asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    if (maxItems) {
      result = result.slice(0, maxItems);
    }

    return result;
  }, [activeCategory, search, sort, maxItems]);

  const selectedIds = new Set(selectedServices.map(s => s.id));

  return (
    <div className="w-full">
      {showFilters && (
        <div className="mb-8 space-y-4">
          {/* Search + Sort row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search services..."
                className="w-full pl-11 pr-4 py-3 bg-white border-2 border-stone-100 rounded-2xl text-sm font-medium text-brand-black placeholder:text-stone-400 focus:border-brand-teal focus:outline-none transition-colors"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-stone-100 rounded-2xl text-sm font-bold text-brand-black hover:border-brand-teal transition-colors whitespace-nowrap"
              >
                <ArrowUpDown size={14} />
                {SORT_LABELS[sort]}
              </button>
              <AnimatePresence>
                {showSortMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden z-20 min-w-[180px]"
                  >
                    {(Object.keys(SORT_LABELS) as SortMode[]).map(mode => (
                      <button
                        key={mode}
                        onClick={() => { setSort(mode); setShowSortMenu(false); }}
                        className={`block w-full text-left px-5 py-3 text-sm font-medium transition-colors ${
                          sort === mode ? 'bg-brand-teal/10 text-brand-teal' : 'text-brand-black hover:bg-stone-50'
                        }`}
                      >
                        {SORT_LABELS[mode]}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.15em] transition-all ${
                activeCategory === 'all'
                  ? 'bg-brand-black text-white shadow-lg'
                  : 'bg-white text-stone-500 border border-stone-200 hover:border-brand-teal hover:text-brand-teal'
              }`}
            >
              All Services
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.15em] transition-all ${
                  activeCategory === cat
                    ? 'bg-brand-black text-white shadow-lg'
                    : 'bg-white text-stone-500 border border-stone-200 hover:border-brand-teal hover:text-brand-teal'
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredServices.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <ServiceCard
                service={service}
                selected={selectedIds.has(service.id)}
                onSelect={onSelectService}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty state */}
      {filteredServices.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <SlidersHorizontal size={40} className="mx-auto mb-4 text-stone-300" />
          <p className="text-stone-400 font-medium">No services match your filters.</p>
          <button
            onClick={() => { setSearch(''); setActiveCategory('all'); }}
            className="mt-3 text-brand-teal text-sm font-bold hover:underline"
          >
            Clear filters
          </button>
        </motion.div>
      )}
    </div>
  );
};
