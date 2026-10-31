import React from 'react';

interface AleXelALogoProps {
  className?: string;
  color?: string;
}

/** Shared AleXelA brand mark. Uses the approved master artwork when available. */
export const AleXelALogo: React.FC<AleXelALogoProps> = ({ className = 'h-10' }) => (
  <img src="/xela-logo-new.png" alt="AleXelA Passion to Profit Creative Branding Studio" className={className} style={{objectFit:'contain'}} />
);

/** Compatibility alias for existing imports; not customer-facing branding. */
export const XelaLogo = AleXelALogo;
