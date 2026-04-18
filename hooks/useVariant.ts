import { useState, useEffect } from 'react';
import { getActiveVariant, getActiveVariantConfig, VariantConfig, SiteVariant } from '../services/variantRouter';

export function useVariant(): { variant: SiteVariant; config: VariantConfig } {
  const [variant, setVariant] = useState<SiteVariant>(() => getActiveVariant());
  const [config, setConfig] = useState<VariantConfig>(() => getActiveVariantConfig());

  useEffect(() => {
    const active = getActiveVariant();
    setVariant(active);
    setConfig(getActiveVariantConfig());
  }, []);

  return { variant, config };
}
