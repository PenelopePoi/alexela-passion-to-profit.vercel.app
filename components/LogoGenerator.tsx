
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { BrandInput, LogoCandidate } from '../types';
import { Download, RefreshCw, Heart, ThumbsDown, Sparkles, Check, Palette, Star, Grid3X3, List, Shuffle, Loader2, Image } from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface LogoGeneratorProps {
  brandInput: BrandInput;
  primaryColor: string;
  candidates: LogoCandidate[];
  onUpdateCandidates: React.Dispatch<React.SetStateAction<LogoCandidate[]>>;
}

type LogoStyle =
  | 'luxury-monogram'
  | 'modern-wordmark'
  | 'emblem-badge'
  | 'abstract-icon'
  | 'minimal-line'
  | 'stacked-type'
  | 'letterform'
  | 'seal-stamp'
  | 'split-color'
  | 'gradient-wave'
  | 'diamond-crest'
  | 'nature-inspired';

interface LogoStyleConfig {
  id: LogoStyle;
  label: string;
  description: string;
}

interface LogoMeta {
  style: LogoStyle;
  variation: number;
  styleName: string;
  variationName: string;
  rating: number;
}

const LOGO_STYLES: LogoStyleConfig[] = [
  { id: 'luxury-monogram', label: 'Luxury Monogram', description: 'Ornate initials with gold accents' },
  { id: 'modern-wordmark', label: 'Modern Wordmark', description: 'Bold geometric type with highlighted letter' },
  { id: 'emblem-badge', label: 'Emblem Badge', description: 'Circular badge with curved text' },
  { id: 'abstract-icon', label: 'Abstract Icon', description: 'Geometric icon with clean wordmark' },
  { id: 'minimal-line', label: 'Minimal Line', description: 'Ultra-thin continuous line drawing' },
  { id: 'stacked-type', label: 'Stacked Type', description: 'Dramatic size contrast typography' },
  { id: 'letterform', label: 'Letterform', description: 'Single letter transformed into icon' },
  { id: 'seal-stamp', label: 'Seal / Stamp', description: 'Vintage circular seal with stars' },
  { id: 'split-color', label: 'Split Color', description: 'Two-tone split wordmark' },
  { id: 'gradient-wave', label: 'Gradient Wave', description: 'Flowing ribbon with brand gradient' },
  { id: 'diamond-crest', label: 'Diamond Crest', description: 'Rhombus frame with decorative corners' },
  { id: 'nature-inspired', label: 'Nature Inspired', description: 'Organic shape integrated with letter' },
];

const VARIATION_NAMES = ['Classic', 'Bold', 'Refined'];

// =============================================================================
// COLOR UTILITIES
// =============================================================================

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.substring(0, 2), 16) || 100,
    g: parseInt(clean.substring(2, 4), 16) || 100,
    b: parseInt(clean.substring(4, 6), 16) || 100,
  };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

interface ColorPalette {
  primary: string;
  accent: string;
  dark: string;
  light: string;
  gold: string;
  mid: string;
  complement: string;
  primaryHsl: { h: number; s: number; l: number };
}

function deriveColors(primary: string): ColorPalette {
  const rgb = hexToRgb(primary);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const accent = `hsl(${(hsl.h + 30) % 360}, ${Math.min(hsl.s + 10, 100)}%, ${Math.min(hsl.l + 5, 60)}%)`;
  const light = `hsl(${hsl.h}, ${Math.max(hsl.s - 30, 10)}%, 95%)`;
  const dark = `hsl(${hsl.h}, ${Math.min(hsl.s + 5, 80)}%, ${Math.max(hsl.l - 30, 10)}%)`;
  const mid = `hsl(${hsl.h}, ${hsl.s}%, ${Math.min(hsl.l + 15, 70)}%)`;
  const complement = `hsl(${(hsl.h + 180) % 360}, ${hsl.s}%, ${hsl.l}%)`;
  const gold = '#D4A947';
  return { primary, accent, light, dark, mid, complement, gold, primaryHsl: hsl };
}

function getInitials(name: string): string {
  return name
    .split(/[\s\-&]+/)
    .filter(w => w.length > 0)
    .map(w => w[0].toUpperCase())
    .slice(0, 3)
    .join('');
}

function nameHash(name: string, salt: number): number {
  let h = salt;
  for (let i = 0; i < name.length; i++) {
    h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// =============================================================================
// SHARED SVG BUILDING BLOCKS
// =============================================================================

function svgDefs(id: string, c: ColorPalette, extras: string = ''): string {
  return `<defs>
    <linearGradient id="grad-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c.primary}"/>
      <stop offset="50%" stop-color="${c.accent}"/>
      <stop offset="100%" stop-color="${c.dark}"/>
    </linearGradient>
    <linearGradient id="gold-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F5E6B8"/>
      <stop offset="30%" stop-color="${c.gold}"/>
      <stop offset="60%" stop-color="#C4993D"/>
      <stop offset="100%" stop-color="#F5E6B8"/>
    </linearGradient>
    <radialGradient id="rglow-${id}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${c.primary}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${c.primary}" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow-${id}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="${c.dark}" flood-opacity="0.2"/>
    </filter>
    <filter id="emboss-${id}" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur"/>
      <feOffset in="blur" dx="1" dy="1" result="offsetBlur"/>
      <feFlood flood-color="white" flood-opacity="0.4" result="white"/>
      <feComposite in="white" in2="offsetBlur" operator="in" result="highlight"/>
      <feOffset in="blur" dx="-1" dy="-1" result="offsetBlur2"/>
      <feFlood flood-color="${c.dark}" flood-opacity="0.3" result="dark"/>
      <feComposite in="dark" in2="offsetBlur2" operator="in" result="lowlight"/>
      <feMerge>
        <feMergeNode in="highlight"/>
        <feMergeNode in="lowlight"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="glow-${id}" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur"/>
      <feFlood flood-color="${c.primary}" flood-opacity="0.15"/>
      <feComposite in2="blur" operator="in"/>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    ${extras}
  </defs>`;
}

function decorativeDots(cx: number, cy: number, r: number, count: number, color: string, dotR: number = 1.5): string {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${dotR}" fill="${color}" opacity="0.5"/>`;
  }).join('');
}

function decorativeCorners(x: number, y: number, w: number, h: number, color: string, size: number = 12): string {
  return `
    <path d="M${x},${y + size} L${x},${y} L${x + size},${y}" fill="none" stroke="${color}" stroke-width="1.5"/>
    <path d="M${x + w - size},${y} L${x + w},${y} L${x + w},${y + size}" fill="none" stroke="${color}" stroke-width="1.5"/>
    <path d="M${x + w},${y + h - size} L${x + w},${y + h} L${x + w - size},${y + h}" fill="none" stroke="${color}" stroke-width="1.5"/>
    <path d="M${x + size},${y + h} L${x},${y + h} L${x},${y + h - size}" fill="none" stroke="${color}" stroke-width="1.5"/>
  `;
}

function starShape(cx: number, cy: number, outerR: number, innerR: number, points: number = 5): string {
  const pts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    pts.push(`${(cx + Math.cos(angle) * r).toFixed(1)},${(cy + Math.sin(angle) * r).toFixed(1)}`);
  }
  return pts.join(' ');
}

// =============================================================================
// 12 LOGO STYLE GENERATORS — 3 VARIATIONS EACH
// =============================================================================

function genLuxuryMonogram(name: string, c: ColorPalette, v: number): string {
  const id = `lm${v}`;
  const initials = getInitials(name) || name.substring(0, 2).toUpperCase();
  const frames = [
    // V0: Circle with ornate gold frame
    () => `<circle cx="200" cy="160" r="90" fill="none" stroke="url(#gold-${id})" stroke-width="2.5"/>
      <circle cx="200" cy="160" r="83" fill="none" stroke="url(#gold-${id})" stroke-width="0.5"/>
      <circle cx="200" cy="160" r="78" fill="${c.light}" opacity="0.3"/>
      ${decorativeDots(200, 160, 87, 24, c.gold, 1.2)}
      <text x="200" y="178" text-anchor="middle" font-family="Georgia,serif" font-size="72" font-weight="400" letter-spacing="12" fill="url(#gold-${id})" filter="url(#emboss-${id})">${initials}</text>`,
    // V1: Diamond shield
    () => `<g transform="translate(200,155)">
        <rect x="-72" y="-72" width="144" height="144" fill="none" stroke="url(#gold-${id})" stroke-width="2.5" transform="rotate(45)"/>
        <rect x="-62" y="-62" width="124" height="124" fill="${c.light}" opacity="0.2" stroke="url(#gold-${id})" stroke-width="0.5" transform="rotate(45)"/>
        ${decorativeCorners(-52, -52, 104, 104, c.gold, 14)}
      </g>
      <text x="200" y="173" text-anchor="middle" font-family="Georgia,serif" font-size="60" font-weight="400" letter-spacing="10" fill="url(#gold-${id})" filter="url(#emboss-${id})">${initials}</text>`,
    // V2: Shield with laurel
    () => `<path d="M200,60 L290,100 L290,200 Q290,280 200,310 Q110,280 110,200 L110,100 Z" fill="${c.light}" opacity="0.15" stroke="url(#gold-${id})" stroke-width="2"/>
      <path d="M200,72 L282,108 L282,198 Q282,272 200,300 Q118,272 118,198 L118,108 Z" fill="none" stroke="url(#gold-${id})" stroke-width="0.5"/>
      <path d="M140,230 Q140,140 170,100 Q150,150 155,210 Q158,240 140,230Z" fill="url(#gold-${id})" opacity="0.4"/>
      <path d="M260,230 Q260,140 230,100 Q250,150 245,210 Q242,240 260,230Z" fill="url(#gold-${id})" opacity="0.4"/>
      <text x="200" y="195" text-anchor="middle" font-family="Georgia,serif" font-size="68" font-weight="400" letter-spacing="8" fill="url(#gold-${id})" filter="url(#emboss-${id})">${initials}</text>`,
  ];
  const frame = frames[v % 3]();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 360" width="400" height="360">
    ${svgDefs(id, c)}
    <rect width="400" height="360" fill="white"/>
    <rect width="400" height="360" fill="url(#rglow-${id})"/>
    ${frame}
    <line x1="140" y1="285" x2="260" y2="285" stroke="url(#gold-${id})" stroke-width="0.5"/>
    <text x="200" y="310" text-anchor="middle" font-family="Georgia,serif" font-size="11" letter-spacing="8" fill="${c.dark}" opacity="0.7">${name.toUpperCase()}</text>
    <text x="200" y="335" text-anchor="middle" font-family="Helvetica,sans-serif" font-size="8" letter-spacing="4" fill="${c.gold}" opacity="0.6">PREMIUM QUALITY</text>
  </svg>`;
}

function genModernWordmark(name: string, c: ColorPalette, v: number): string {
  const id = `mw${v}`;
  const words = name.split(/\s+/);
  const first = words[0] || name;
  const rest = words.slice(1).join(' ');
  const highlightIdx = Math.floor(first.length / 2);
  const before = first.substring(0, highlightIdx).toUpperCase();
  const hl = first[highlightIdx]?.toUpperCase() || '';
  const after = first.substring(highlightIdx + 1).toUpperCase();
  const layouts = [
    // V0: Highlighted letter, underline accent
    () => `<text x="200" y="155" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="56" font-weight="900" letter-spacing="6" fill="${c.dark}">
        <tspan>${before}</tspan><tspan fill="${c.primary}">${hl}</tspan><tspan>${after}</tspan>
      </text>
      ${rest ? `<text x="200" y="190" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="18" font-weight="300" letter-spacing="12" fill="${c.mid}">${rest.toUpperCase()}</text>` : ''}
      <rect x="120" y="205" width="160" height="3" rx="1.5" fill="url(#grad-${id})"/>`,
    // V1: Vertical bar accent + left-aligned
    () => `<rect x="40" y="100" width="4" height="80" rx="2" fill="url(#grad-${id})"/>
      <text x="56" y="150" font-family="Helvetica,Arial,sans-serif" font-size="52" font-weight="900" letter-spacing="4" fill="${c.dark}">
        <tspan>${before}</tspan><tspan fill="${c.primary}">${hl}</tspan><tspan>${after}</tspan>
      </text>
      ${rest ? `<text x="56" y="180" font-family="Helvetica,Arial,sans-serif" font-size="16" font-weight="300" letter-spacing="10" fill="${c.mid}">${rest.toUpperCase()}</text>` : ''}`,
    // V2: Circle accent behind highlighted letter
    () => {
      const approxX = 200 + (highlightIdx - first.length / 2) * 28;
      return `<circle cx="${approxX}" cy="138" r="28" fill="${c.primary}" opacity="0.12"/>
      <text x="200" y="155" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="52" font-weight="900" letter-spacing="5" fill="${c.dark}">
        <tspan>${before}</tspan><tspan fill="${c.primary}">${hl}</tspan><tspan>${after}</tspan>
      </text>
      ${rest ? `<text x="200" y="192" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="16" font-weight="300" letter-spacing="10" fill="${c.mid}">${rest.toUpperCase()}</text>` : ''}
      <line x1="140" y1="205" x2="260" y2="205" stroke="${c.primary}" stroke-width="1" opacity="0.3"/>`;
    },
  ];
  const layout = layouts[v % 3]();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
    ${svgDefs(id, c)}
    <rect width="400" height="300" fill="white"/>
    ${layout}
    <text x="200" y="265" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="8" letter-spacing="5" fill="${c.mid}" opacity="0.5">EST. ${new Date().getFullYear()}</text>
  </svg>`;
}

function genEmblemBadge(name: string, c: ColorPalette, v: number): string {
  const id = `eb${v}`;
  const initials = getInitials(name) || name.substring(0, 2).toUpperCase();
  const year = new Date().getFullYear();
  const arcText = name.toUpperCase().substring(0, 22);
  const layouts = [
    // V0: Classic circular badge
    () => `<circle cx="200" cy="180" r="130" fill="${c.primary}"/>
      <circle cx="200" cy="180" r="122" fill="none" stroke="white" stroke-width="0.8" opacity="0.3"/>
      <circle cx="200" cy="180" r="115" fill="none" stroke="white" stroke-width="0.8" opacity="0.3"/>
      <circle cx="200" cy="180" r="100" fill="white"/>
      <circle cx="200" cy="180" r="95" fill="${c.light}" opacity="0.3"/>
      ${decorativeDots(200, 180, 108, 36, 'white', 1.2)}
      <text x="200" y="175" text-anchor="middle" font-family="Georgia,serif" font-size="48" fill="${c.primary}" filter="url(#shadow-${id})">${initials}</text>
      <line x1="155" y1="195" x2="245" y2="195" stroke="${c.gold}" stroke-width="1"/>
      <text x="200" y="215" text-anchor="middle" font-family="Helvetica,sans-serif" font-size="9" letter-spacing="4" fill="${c.dark}">EST. ${year}</text>
      <path d="M200,52 A130,130 0 0,1 320,120" fill="none" id="ta-${id}"/>
      <text font-family="Helvetica,sans-serif" font-size="10" letter-spacing="5" fill="white">
        <textPath href="#ta-${id}" startOffset="50%" text-anchor="middle">${arcText}</textPath>
      </text>
      <polygon points="${starShape(142, 280, 5, 2.2)}" fill="white"/>
      <polygon points="${starShape(200, 305, 5, 2.2)}" fill="white"/>
      <polygon points="${starShape(258, 280, 5, 2.2)}" fill="white"/>`,
    // V1: Shield emblem
    () => `<path d="M200,45 L320,100 L320,220 Q320,310 200,350 Q80,310 80,220 L80,100 Z" fill="${c.primary}" filter="url(#shadow-${id})"/>
      <path d="M200,58 L310,108 L310,218 Q310,300 200,338 Q90,300 90,218 L90,108 Z" fill="none" stroke="white" stroke-width="0.8" opacity="0.3"/>
      <path d="M200,70 L300,116 L300,216 Q300,290 200,326 Q100,290 100,216 L100,116 Z" fill="white"/>
      <path d="M200,82 L290,124 L290,214 Q290,280 200,314 Q110,280 110,214 L110,124 Z" fill="${c.light}" opacity="0.2"/>
      <text x="200" y="195" text-anchor="middle" font-family="Georgia,serif" font-size="56" fill="${c.primary}" filter="url(#shadow-${id})">${initials}</text>
      <line x1="150" y1="215" x2="250" y2="215" stroke="${c.gold}" stroke-width="1"/>
      <text x="200" y="240" text-anchor="middle" font-family="Helvetica,sans-serif" font-size="10" letter-spacing="4" fill="${c.dark}">${name.split(/\s+/)[0]?.toUpperCase()}</text>
      <text x="200" y="265" text-anchor="middle" font-family="Helvetica,sans-serif" font-size="8" letter-spacing="3" fill="${c.mid}">EST. ${year}</text>`,
    // V2: Rectangular badge with inner frame
    () => `<rect x="55" y="50" width="290" height="260" rx="16" fill="${c.primary}" filter="url(#shadow-${id})"/>
      <rect x="63" y="58" width="274" height="244" rx="12" fill="none" stroke="white" stroke-width="0.6" opacity="0.3"/>
      <rect x="75" y="70" width="250" height="220" rx="8" fill="white"/>
      ${decorativeCorners(82, 77, 236, 206, c.gold, 16)}
      <text x="200" y="170" text-anchor="middle" font-family="Georgia,serif" font-size="46" letter-spacing="6" fill="${c.primary}" filter="url(#shadow-${id})">${initials}</text>
      <line x1="130" y1="190" x2="270" y2="190" stroke="${c.gold}" stroke-width="0.8"/>
      <text x="200" y="215" text-anchor="middle" font-family="Helvetica,sans-serif" font-size="12" letter-spacing="4" fill="${c.dark}">${name.toUpperCase().substring(0, 20)}</text>
      <text x="200" y="240" text-anchor="middle" font-family="Helvetica,sans-serif" font-size="8" letter-spacing="3" fill="${c.mid}">PREMIUM QUALITY &bull; EST. ${year}</text>`,
  ];
  const layout = layouts[v % 3]();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 380" width="400" height="380">
    ${svgDefs(id, c)}
    <rect width="400" height="380" fill="white"/>
    ${layout}
  </svg>`;
}

function genAbstractIcon(name: string, c: ColorPalette, v: number): string {
  const id = `ai${v}`;
  const first = name.split(/\s+/)[0] || name;
  const rest = name.split(/\s+/).slice(1).join(' ');
  const icons = [
    // V0: Overlapping circles (golden ratio)
    () => `<circle cx="175" cy="120" r="50" fill="${c.primary}" opacity="0.7"/>
      <circle cx="225" cy="120" r="50" fill="${c.accent}" opacity="0.5"/>
      <circle cx="200" cy="80" r="50" fill="${c.mid}" opacity="0.3"/>
      <circle cx="200" cy="110" r="18" fill="white" filter="url(#glow-${id})"/>
      <circle cx="200" cy="110" r="12" fill="url(#grad-${id})" opacity="0.8"/>`,
    // V1: Hexagonal grid
    () => {
      const hexes: string[] = [];
      const pts = [[200, 80], [230, 97], [230, 131], [200, 148], [170, 131], [170, 97]];
      pts.forEach(([x, y], i) => {
        hexes.push(`<circle cx="${x}" cy="${y}" r="22" fill="${i === 0 ? c.primary : c.accent}" opacity="${0.15 + i * 0.12}"/>`);
      });
      return hexes.join('') + `
        <polygon points="200,65 225,79 225,107 200,121 175,107 175,79" fill="none" stroke="${c.primary}" stroke-width="2"/>
        <polygon points="200,78 215,86 215,102 200,110 185,102 185,86" fill="url(#grad-${id})" opacity="0.6"/>`;
    },
    // V2: Concentric arcs
    () => `<path d="M150,150 A60,60 0 0,1 250,150" fill="none" stroke="${c.primary}" stroke-width="3" stroke-linecap="round"/>
      <path d="M160,145 A50,50 0 0,1 240,145" fill="none" stroke="${c.accent}" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
      <path d="M170,140 A40,40 0 0,1 230,140" fill="none" stroke="${c.mid}" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/>
      <circle cx="200" cy="105" r="20" fill="url(#grad-${id})"/>
      <circle cx="200" cy="105" r="12" fill="white"/>
      <circle cx="200" cy="105" r="6" fill="${c.primary}"/>`,
  ];
  const icon = icons[v % 3]();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
    ${svgDefs(id, c)}
    <rect width="400" height="300" fill="white"/>
    <rect width="400" height="300" fill="url(#rglow-${id})"/>
    ${icon}
    <text x="200" y="215" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="32" font-weight="800" letter-spacing="3" fill="${c.dark}" filter="url(#shadow-${id})">${first.toUpperCase()}</text>
    ${rest ? `<text x="200" y="242" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="12" font-weight="300" letter-spacing="8" fill="${c.mid}">${rest.toUpperCase()}</text>` : ''}
    <line x1="155" y1="255" x2="245" y2="255" stroke="${c.primary}" stroke-width="0.5" opacity="0.3"/>
  </svg>`;
}

function genMinimalLine(name: string, c: ColorPalette, v: number): string {
  const id = `ml${v}`;
  const firstLetter = name[0]?.toUpperCase() || 'X';
  const icons = [
    // V0: Continuous line forming a lightbulb (creativity)
    () => `<path d="M180,60 Q180,40 200,40 Q220,40 220,60 L220,80 Q230,95 230,110 Q230,130 210,140 L210,150 L190,150 L190,140 Q170,130 170,110 Q170,95 180,80 Z" fill="none" stroke="${c.primary}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="190" y1="155" x2="210" y2="155" stroke="${c.primary}" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="192" y1="162" x2="208" y2="162" stroke="${c.primary}" stroke-width="1.5" stroke-linecap="round"/>`,
    // V1: Continuous line pen/pencil
    () => `<path d="M175,45 L175,125 L200,155 L225,125 L225,45" fill="none" stroke="${c.primary}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="175" y1="65" x2="225" y2="65" stroke="${c.primary}" stroke-width="1" opacity="0.4"/>
      <line x1="175" y1="125" x2="225" y2="125" stroke="${c.primary}" stroke-width="1" opacity="0.4"/>
      <circle cx="200" cy="92" r="12" fill="none" stroke="${c.primary}" stroke-width="1"/>`,
    // V2: Continuous line infinity/loop
    () => `<path d="M150,100 Q150,60 180,60 Q210,60 210,100 Q210,140 240,140 Q270,140 270,100 Q270,60 240,60 Q210,60 210,100 Q210,140 180,140 Q150,140 150,100 Z" fill="none" stroke="${c.primary}" stroke-width="1.5" stroke-linecap="round"/>`,
  ];
  const icon = icons[v % 3]();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="400" height="280">
    ${svgDefs(id, c)}
    <rect width="400" height="280" fill="white"/>
    ${icon}
    <text x="200" y="210" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="14" font-weight="300" letter-spacing="10" fill="${c.dark}">${name.toUpperCase()}</text>
    <line x1="130" y1="225" x2="270" y2="225" stroke="${c.primary}" stroke-width="0.5" opacity="0.3"/>
  </svg>`;
}

function genStackedType(name: string, c: ColorPalette, v: number): string {
  const id = `st${v}`;
  const words = name.split(/\s+/);
  const topWord = words[0] || name;
  const bottomWords = words.slice(1).join(' ') || '';
  const layouts = [
    // V0: Huge top word, tiny bottom
    () => `<text x="200" y="155" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="72" font-weight="900" fill="${c.primary}" filter="url(#shadow-${id})">${topWord.toUpperCase()}</text>
      <rect x="120" y="170" width="160" height="1.5" fill="url(#grad-${id})"/>
      ${bottomWords ? `<text x="200" y="200" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="14" font-weight="300" letter-spacing="12" fill="${c.mid}">${bottomWords.toUpperCase()}</text>` : ''}`,
    // V1: Top small, bottom huge
    () => `${bottomWords ? `<text x="200" y="110" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="13" font-weight="400" letter-spacing="12" fill="${c.mid}">${topWord.toUpperCase()}</text>` : ''}
      <rect x="130" y="120" width="140" height="1" fill="${c.gold}" opacity="0.6"/>
      <text x="200" y="180" text-anchor="middle" font-family="Georgia,serif" font-size="64" font-weight="400" fill="${c.primary}" filter="url(#shadow-${id})">${(bottomWords || topWord).toUpperCase()}</text>`,
    // V2: Vertical stack with decorative elements
    () => {
      const allWords = words.length > 1 ? words : [topWord.substring(0, Math.ceil(topWord.length / 2)), topWord.substring(Math.ceil(topWord.length / 2))];
      let y = 110;
      const textEls = allWords.map((w, i) => {
        const size = i === 0 ? 58 : 22;
        const weight = i === 0 ? '900' : '300';
        const spacing = i === 0 ? '4' : '10';
        const el = `<text x="200" y="${y}" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="${size}" font-weight="${weight}" letter-spacing="${spacing}" fill="${i === 0 ? c.primary : c.dark}">${w.toUpperCase()}</text>`;
        y += i === 0 ? 50 : 30;
        return el;
      }).join('');
      return `${textEls}
        <rect x="150" y="${y - 20}" width="100" height="2" rx="1" fill="url(#grad-${id})"/>`;
    },
  ];
  const layout = layouts[v % 3]();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="400" height="280">
    ${svgDefs(id, c)}
    <rect width="400" height="280" fill="white"/>
    ${layout}
    <text x="200" y="250" text-anchor="middle" font-family="Helvetica,sans-serif" font-size="8" letter-spacing="4" fill="${c.mid}" opacity="0.5">BRAND IDENTITY</text>
  </svg>`;
}

function genLetterform(name: string, c: ColorPalette, v: number): string {
  const id = `lf${v}`;
  const letter = name[0]?.toUpperCase() || 'X';
  const layouts = [
    // V0: 3D depth letterform with gradient fill
    () => `<text x="205" y="198" text-anchor="middle" font-family="Georgia,serif" font-size="160" font-weight="700" fill="${c.dark}" opacity="0.1">${letter}</text>
      <text x="200" y="195" text-anchor="middle" font-family="Georgia,serif" font-size="160" font-weight="700" fill="url(#grad-${id})" filter="url(#shadow-${id})">${letter}</text>
      <text x="200" y="195" text-anchor="middle" font-family="Georgia,serif" font-size="160" font-weight="700" fill="url(#gold-${id})" opacity="0.15">${letter}</text>`,
    // V1: Letter with circular crop and negative space
    () => `<circle cx="200" cy="165" r="85" fill="${c.primary}"/>
      <circle cx="200" cy="165" r="80" fill="url(#grad-${id})"/>
      <text x="200" y="195" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="120" font-weight="900" fill="white" filter="url(#emboss-${id})">${letter}</text>
      <circle cx="200" cy="165" r="88" fill="none" stroke="${c.gold}" stroke-width="1" opacity="0.4"/>`,
    // V2: Split letterform
    () => `<clipPath id="clip-top-${id}"><rect x="100" y="60" width="200" height="100"/></clipPath>
      <clipPath id="clip-bot-${id}"><rect x="100" y="160" width="200" height="100"/></clipPath>
      <text x="200" y="200" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="150" font-weight="900" fill="${c.primary}" clip-path="url(#clip-top-${id})">${letter}</text>
      <text x="200" y="200" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="150" font-weight="900" fill="${c.accent}" clip-path="url(#clip-bot-${id})">${letter}</text>
      <line x1="110" y1="160" x2="290" y2="160" stroke="white" stroke-width="3"/>`,
  ];
  const layout = layouts[v % 3]();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 340" width="400" height="340">
    ${svgDefs(id, c)}
    <rect width="400" height="340" fill="white"/>
    ${layout}
    <text x="200" y="300" text-anchor="middle" font-family="Helvetica,sans-serif" font-size="12" font-weight="300" letter-spacing="10" fill="${c.dark}">${name.toUpperCase()}</text>
  </svg>`;
}

function genSealStamp(name: string, c: ColorPalette, v: number): string {
  const id = `ss${v}`;
  const initials = getInitials(name) || name.substring(0, 2).toUpperCase();
  const year = new Date().getFullYear();
  const arcText = name.toUpperCase().substring(0, 18);
  const layouts = [
    // V0: Classic double-ring seal
    () => `<circle cx="200" cy="185" r="120" fill="none" stroke="${c.primary}" stroke-width="3"/>
      <circle cx="200" cy="185" r="112" fill="none" stroke="${c.primary}" stroke-width="1"/>
      <circle cx="200" cy="185" r="95" fill="none" stroke="${c.primary}" stroke-width="1" stroke-dasharray="2,4"/>
      <circle cx="200" cy="185" r="80" fill="none" stroke="${c.primary}" stroke-width="1"/>
      ${decorativeDots(200, 185, 103, 24, c.primary, 2)}
      <polygon points="${starShape(130, 185, 6, 2.5)}" fill="${c.primary}"/>
      <polygon points="${starShape(270, 185, 6, 2.5)}" fill="${c.primary}"/>
      <text x="200" y="190" text-anchor="middle" font-family="Georgia,serif" font-size="40" fill="${c.primary}">${initials}</text>
      <text x="200" y="212" text-anchor="middle" font-family="Helvetica,sans-serif" font-size="9" letter-spacing="3" fill="${c.dark}">EST. ${year}</text>
      <path d="M200,65 A120,120 0 0,1 310,130" fill="none" id="seal-top-${id}"/>
      <text font-family="Helvetica,sans-serif" font-size="10" letter-spacing="5" fill="${c.primary}" font-weight="700">
        <textPath href="#seal-top-${id}" startOffset="50%" text-anchor="middle">${arcText}</textPath>
      </text>`,
    // V1: Ink stamp style with rougher edges
    () => `<circle cx="200" cy="185" r="115" fill="${c.primary}" opacity="0.08"/>
      <circle cx="200" cy="185" r="115" fill="none" stroke="${c.primary}" stroke-width="4"/>
      <circle cx="200" cy="185" r="105" fill="none" stroke="${c.primary}" stroke-width="1.5"/>
      <line x1="120" y1="175" x2="280" y2="175" stroke="${c.primary}" stroke-width="1"/>
      <line x1="120" y1="200" x2="280" y2="200" stroke="${c.primary}" stroke-width="1"/>
      <text x="200" y="196" text-anchor="middle" font-family="Helvetica,sans-serif" font-size="18" font-weight="900" letter-spacing="6" fill="${c.primary}">${name.toUpperCase().substring(0, 14)}</text>
      <text x="200" y="225" text-anchor="middle" font-family="Helvetica,sans-serif" font-size="10" letter-spacing="3" fill="${c.primary}">ESTABLISHED ${year}</text>
      <polygon points="${starShape(145, 148, 5, 2)}" fill="${c.primary}"/>
      <polygon points="${starShape(200, 140, 5, 2)}" fill="${c.primary}"/>
      <polygon points="${starShape(255, 148, 5, 2)}" fill="${c.primary}"/>`,
    // V2: Minimalist stamp
    () => `<circle cx="200" cy="185" r="110" fill="none" stroke="${c.primary}" stroke-width="2.5"/>
      <circle cx="200" cy="185" r="100" fill="none" stroke="${c.primary}" stroke-width="0.5"/>
      <text x="200" y="178" text-anchor="middle" font-family="Georgia,serif" font-size="52" font-weight="400" fill="${c.primary}">${initials}</text>
      <rect x="145" y="195" width="110" height="0.5" fill="${c.primary}"/>
      <text x="200" y="215" text-anchor="middle" font-family="Helvetica,sans-serif" font-size="10" letter-spacing="6" fill="${c.dark}" font-weight="300">${name.toUpperCase().substring(0, 16)}</text>
      <text x="200" y="240" text-anchor="middle" font-family="Helvetica,sans-serif" font-size="8" letter-spacing="3" fill="${c.mid}">${year}</text>`,
  ];
  const layout = layouts[v % 3]();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 380" width="400" height="380">
    ${svgDefs(id, c)}
    <rect width="400" height="380" fill="white"/>
    ${layout}
  </svg>`;
}

function genSplitColor(name: string, c: ColorPalette, v: number): string {
  const id = `sc${v}`;
  const displayName = name.toUpperCase();
  const mid = Math.ceil(displayName.length / 2);
  const part1 = displayName.substring(0, mid);
  const part2 = displayName.substring(mid);
  const layouts = [
    // V0: Horizontal split
    () => `<clipPath id="left-${id}"><rect x="0" y="0" width="200" height="300"/></clipPath>
      <clipPath id="right-${id}"><rect x="200" y="0" width="200" height="300"/></clipPath>
      <rect x="0" y="0" width="200" height="300" fill="${c.primary}" opacity="0.04"/>
      <rect x="200" y="0" width="200" height="300" fill="${c.accent}" opacity="0.04"/>
      <line x1="200" y1="80" x2="200" y2="220" stroke="${c.mid}" stroke-width="0.5" opacity="0.3"/>
      <text x="200" y="165" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="48" font-weight="900" letter-spacing="4">
        <tspan fill="${c.primary}">${part1}</tspan><tspan fill="${c.accent}">${part2}</tspan>
      </text>`,
    // V1: Diagonal split
    () => `<clipPath id="diag-a-${id}"><polygon points="0,0 400,0 0,300"/></clipPath>
      <clipPath id="diag-b-${id}"><polygon points="400,0 400,300 0,300"/></clipPath>
      <text x="200" y="165" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="48" font-weight="900" letter-spacing="4" fill="${c.primary}" clip-path="url(#diag-a-${id})">${displayName}</text>
      <text x="200" y="165" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="48" font-weight="900" letter-spacing="4" fill="${c.accent}" clip-path="url(#diag-b-${id})">${displayName}</text>
      <line x1="0" y1="300" x2="400" y2="0" stroke="white" stroke-width="2" opacity="0.6"/>`,
    // V2: Top/bottom split
    () => `<clipPath id="top-${id}"><rect x="0" y="0" width="400" height="150"/></clipPath>
      <clipPath id="bot-${id}"><rect x="0" y="150" width="400" height="150"/></clipPath>
      <rect x="0" y="0" width="400" height="150" fill="${c.primary}" opacity="0.03"/>
      <text x="200" y="165" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="52" font-weight="900" letter-spacing="3" fill="${c.primary}" clip-path="url(#top-${id})">${displayName}</text>
      <text x="200" y="165" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="52" font-weight="900" letter-spacing="3" fill="${c.accent}" clip-path="url(#bot-${id})">${displayName}</text>
      <line x1="80" y1="150" x2="320" y2="150" stroke="${c.gold}" stroke-width="1" opacity="0.4"/>`,
  ];
  const layout = layouts[v % 3]();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
    ${svgDefs(id, c)}
    <rect width="400" height="300" fill="white"/>
    ${layout}
    <text x="200" y="245" text-anchor="middle" font-family="Helvetica,sans-serif" font-size="8" letter-spacing="5" fill="${c.mid}" opacity="0.5">BRAND IDENTITY</text>
  </svg>`;
}

function genGradientWave(name: string, c: ColorPalette, v: number): string {
  const id = `gw${v}`;
  const first = name.split(/\s+/)[0] || name;
  const rest = name.split(/\s+/).slice(1).join(' ');
  const waves = [
    // V0: Flowing ribbon
    () => `<path d="M40,160 Q100,80 200,140 Q300,200 360,120" fill="none" stroke="url(#grad-${id})" stroke-width="40" stroke-linecap="round" opacity="0.2"/>
      <path d="M40,160 Q100,80 200,140 Q300,200 360,120" fill="none" stroke="url(#grad-${id})" stroke-width="4" stroke-linecap="round"/>
      <path d="M60,170 Q120,100 200,150 Q280,200 340,130" fill="none" stroke="${c.accent}" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/>`,
    // V1: Wave stack
    () => `<path d="M0,120 Q100,70 200,120 Q300,170 400,120" fill="url(#grad-${id})" opacity="0.08"/>
      <path d="M0,140 Q100,90 200,140 Q300,190 400,140" fill="url(#grad-${id})" opacity="0.06"/>
      <path d="M0,160 Q100,110 200,160 Q300,210 400,160" fill="url(#grad-${id})" opacity="0.04"/>
      <path d="M0,120 Q100,70 200,120 Q300,170 400,120" fill="none" stroke="url(#grad-${id})" stroke-width="2"/>
      <circle cx="200" cy="120" r="6" fill="${c.primary}"/>`,
    // V2: Circular flowing shape
    () => `<path d="M130,100 Q200,40 270,100 Q300,140 270,170 Q200,220 130,170 Q100,140 130,100Z" fill="url(#grad-${id})" opacity="0.15" filter="url(#glow-${id})"/>
      <path d="M130,100 Q200,40 270,100 Q300,140 270,170 Q200,220 130,170 Q100,140 130,100Z" fill="none" stroke="url(#grad-${id})" stroke-width="2"/>
      <path d="M155,110 Q200,65 245,110 Q265,140 245,160 Q200,195 155,160 Q135,140 155,110Z" fill="url(#grad-${id})" opacity="0.1"/>`,
  ];
  const wave = waves[v % 3]();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
    ${svgDefs(id, c)}
    <rect width="400" height="300" fill="white"/>
    ${wave}
    <text x="200" y="235" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="30" font-weight="800" letter-spacing="3" fill="${c.dark}" filter="url(#shadow-${id})">${first.toUpperCase()}</text>
    ${rest ? `<text x="200" y="260" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="12" font-weight="300" letter-spacing="8" fill="${c.mid}">${rest.toUpperCase()}</text>` : ''}
  </svg>`;
}

function genDiamondCrest(name: string, c: ColorPalette, v: number): string {
  const id = `dc${v}`;
  const initials = getInitials(name) || name.substring(0, 2).toUpperCase();
  const layouts = [
    // V0: Diamond with inner diamond and initials
    () => `<g transform="translate(200,160)">
        <rect x="-80" y="-80" width="160" height="160" fill="none" stroke="url(#gold-${id})" stroke-width="2" transform="rotate(45)"/>
        <rect x="-70" y="-70" width="140" height="140" fill="${c.light}" opacity="0.15" transform="rotate(45)"/>
        <rect x="-60" y="-60" width="120" height="120" fill="none" stroke="url(#gold-${id})" stroke-width="0.5" transform="rotate(45)"/>
        ${decorativeCorners(-40, -40, 80, 80, c.gold, 10)}
      </g>
      <text x="200" y="175" text-anchor="middle" font-family="Georgia,serif" font-size="48" fill="url(#gold-${id})" filter="url(#emboss-${id})">${initials}</text>`,
    // V1: Tall diamond with vertical text
    () => `<g transform="translate(200,160)">
        <rect x="-55" y="-85" width="110" height="170" fill="none" stroke="${c.primary}" stroke-width="2" transform="rotate(45)" rx="2"/>
        <rect x="-45" y="-75" width="90" height="150" fill="${c.light}" opacity="0.1" transform="rotate(45)" rx="2"/>
      </g>
      <text x="200" y="148" text-anchor="middle" font-family="Georgia,serif" font-size="36" fill="${c.primary}" filter="url(#shadow-${id})">${initials[0] || ''}</text>
      <line x1="180" y1="158" x2="220" y2="158" stroke="${c.gold}" stroke-width="0.8"/>
      <text x="200" y="178" text-anchor="middle" font-family="Georgia,serif" font-size="20" fill="${c.primary}">${initials.substring(1)}</text>`,
    // V2: Double diamond
    () => `<g transform="translate(200,155)">
        <rect x="-75" y="-75" width="150" height="150" fill="none" stroke="${c.primary}" stroke-width="2" transform="rotate(45)"/>
        <rect x="-50" y="-50" width="100" height="100" fill="none" stroke="${c.accent}" stroke-width="1.5" transform="rotate(45)"/>
        <rect x="-30" y="-30" width="60" height="60" fill="url(#grad-${id})" opacity="0.1" transform="rotate(45)"/>
      </g>
      <text x="200" y="170" text-anchor="middle" font-family="Georgia,serif" font-size="42" fill="${c.primary}" filter="url(#shadow-${id})">${initials}</text>`,
  ];
  const layout = layouts[v % 3]();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 360" width="400" height="360">
    ${svgDefs(id, c)}
    <rect width="400" height="360" fill="white"/>
    ${layout}
    <line x1="130" y1="300" x2="270" y2="300" stroke="url(#gold-${id})" stroke-width="0.5"/>
    <text x="200" y="325" text-anchor="middle" font-family="Helvetica,sans-serif" font-size="11" letter-spacing="8" fill="${c.dark}" opacity="0.7">${name.toUpperCase()}</text>
  </svg>`;
}

function genNatureInspired(name: string, c: ColorPalette, v: number): string {
  const id = `ni${v}`;
  const letter = name[0]?.toUpperCase() || 'X';
  const layouts = [
    // V0: Letter with leaf growing from it
    () => `<text x="170" y="190" text-anchor="middle" font-family="Georgia,serif" font-size="110" font-weight="400" fill="${c.primary}" filter="url(#shadow-${id})">${letter}</text>
      <path d="M220,100 Q260,60 280,80 Q300,100 270,130 Q250,150 230,140 Q215,130 220,100Z" fill="url(#grad-${id})" opacity="0.7"/>
      <path d="M220,100 Q250,110 270,130" fill="none" stroke="white" stroke-width="0.8" opacity="0.5"/>
      <path d="M240,90 Q255,100 260,115" fill="none" stroke="white" stroke-width="0.5" opacity="0.4"/>
      <circle cx="225" cy="108" r="3" fill="white" opacity="0.3"/>`,
    // V1: Tree/roots growing from letter base
    () => `<text x="200" y="180" text-anchor="middle" font-family="Georgia,serif" font-size="90" font-weight="400" fill="${c.primary}" filter="url(#shadow-${id})">${letter}</text>
      <path d="M200,195 Q190,220 175,240" fill="none" stroke="${c.primary}" stroke-width="1.5" opacity="0.5"/>
      <path d="M200,195 Q210,225 230,240" fill="none" stroke="${c.primary}" stroke-width="1.5" opacity="0.5"/>
      <path d="M200,195 Q200,230 200,245" fill="none" stroke="${c.primary}" stroke-width="1.5" opacity="0.5"/>
      <path d="M200,100 Q185,75 175,60" fill="none" stroke="${c.accent}" stroke-width="1" opacity="0.4"/>
      <path d="M200,100 Q215,70 230,55" fill="none" stroke="${c.accent}" stroke-width="1" opacity="0.4"/>
      <circle cx="175" cy="58" r="4" fill="${c.accent}" opacity="0.3"/>
      <circle cx="230" cy="53" r="5" fill="${c.accent}" opacity="0.3"/>
      <circle cx="200" cy="68" r="3" fill="${c.accent}" opacity="0.2"/>`,
    // V2: Circular wreath around initial
    () => {
      const leaves = Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const x = 200 + Math.cos(angle) * 75;
        const y = 160 + Math.sin(angle) * 75;
        const rot = (angle * 180) / Math.PI + 90;
        return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="8" ry="16" fill="${c.accent}" opacity="${0.3 + (i % 3) * 0.1}" transform="rotate(${rot.toFixed(0)},${x.toFixed(1)},${y.toFixed(1)})"/>`;
      }).join('');
      return `${leaves}
        <circle cx="200" cy="160" r="55" fill="white"/>
        <circle cx="200" cy="160" r="52" fill="${c.light}" opacity="0.3"/>
        <text x="200" y="180" text-anchor="middle" font-family="Georgia,serif" font-size="60" font-weight="400" fill="${c.primary}" filter="url(#shadow-${id})">${letter}</text>`;
    },
  ];
  const layout = layouts[v % 3]();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 340" width="400" height="340">
    ${svgDefs(id, c)}
    <rect width="400" height="340" fill="white"/>
    <rect width="400" height="340" fill="url(#rglow-${id})"/>
    ${layout}
    <text x="200" y="290" text-anchor="middle" font-family="Helvetica,sans-serif" font-size="12" font-weight="300" letter-spacing="8" fill="${c.dark}">${name.toUpperCase()}</text>
    <line x1="140" y1="300" x2="260" y2="300" stroke="${c.accent}" stroke-width="0.5" opacity="0.4"/>
  </svg>`;
}

// =============================================================================
// MAIN GENERATOR DISPATCH
// =============================================================================

function generateSVGLogo(style: LogoStyle, name: string, primaryColor: string, _industry: string, variation: number): string {
  const colors = deriveColors(primaryColor);
  const v = variation % 3;
  switch (style) {
    case 'luxury-monogram': return genLuxuryMonogram(name, colors, v);
    case 'modern-wordmark': return genModernWordmark(name, colors, v);
    case 'emblem-badge': return genEmblemBadge(name, colors, v);
    case 'abstract-icon': return genAbstractIcon(name, colors, v);
    case 'minimal-line': return genMinimalLine(name, colors, v);
    case 'stacked-type': return genStackedType(name, colors, v);
    case 'letterform': return genLetterform(name, colors, v);
    case 'seal-stamp': return genSealStamp(name, colors, v);
    case 'split-color': return genSplitColor(name, colors, v);
    case 'gradient-wave': return genGradientWave(name, colors, v);
    case 'diamond-crest': return genDiamondCrest(name, colors, v);
    case 'nature-inspired': return genNatureInspired(name, colors, v);
  }
}

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

// =============================================================================
// LOGO META STORE (parallel to LogoCandidate array, keyed by id)
// =============================================================================

const logoMetaStore = new Map<string, LogoMeta>();

// =============================================================================
// COMPONENT
// =============================================================================

export const LogoGenerator: React.FC<LogoGeneratorProps> = ({ brandInput, primaryColor, candidates, onUpdateCandidates }) => {
  const [batchIndex, setBatchIndex] = useState(0);
  const [selectedStyleFilter, setSelectedStyleFilter] = useState<LogoStyle | 'all'>('all');
  const [customColor, setCustomColor] = useState(primaryColor || '#1a1a2e');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [isGenerating, setIsGenerating] = useState(false);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const effectiveColor = customColor || primaryColor || '#1a1a2e';
  const companyName = brandInput.companyName || 'Brand';
  const industry = brandInput.industry || '';

  // ---- Generate Batch ----
  const generateBatch = useCallback(() => {
    setIsGenerating(true);
    // Use setTimeout to allow the loading state to render
    setTimeout(() => {
      const newCandidates: LogoCandidate[] = [];
      const stylesToGenerate: LogoStyle[] = selectedStyleFilter === 'all'
        ? LOGO_STYLES.map(s => s.id)
        : [selectedStyleFilter];

      const variationsPerStyle = selectedStyleFilter === 'all' ? 3 : 3;

      for (const style of stylesToGenerate) {
        const styleCfg = LOGO_STYLES.find(s => s.id === style);
        for (let v = 0; v < variationsPerStyle; v++) {
          const variation = batchIndex * 100 + v;
          const svg = generateSVGLogo(style, companyName, effectiveColor, industry, variation);
          const dataUrl = svgToDataUrl(svg);
          const cid = `svg-${style}-${Date.now()}-${v}-${batchIndex}`;
          newCandidates.push({
            id: cid,
            imageUrl: dataUrl,
            status: 'neutral',
            description: `${styleCfg?.label || style} \u2014 ${VARIATION_NAMES[v % 3]}`,
          });
          logoMetaStore.set(cid, {
            style,
            variation: v,
            styleName: styleCfg?.label || style,
            variationName: VARIATION_NAMES[v % 3],
            rating: 0,
          });
        }
      }

      onUpdateCandidates(prev => [...newCandidates, ...prev]);
      setBatchIndex(prev => prev + 1);
      setIsGenerating(false);
    }, 300);
  }, [batchIndex, companyName, effectiveColor, industry, onUpdateCandidates, selectedStyleFilter]);

  // ---- Randomize All ----
  const randomizeAll = useCallback(() => {
    setIsGenerating(true);
    setTimeout(() => {
      const newCandidates: LogoCandidate[] = [];
      for (const style of LOGO_STYLES) {
        const v = Math.floor(Math.random() * 3);
        const variation = Math.floor(Math.random() * 10000);
        const svg = generateSVGLogo(style.id, companyName, effectiveColor, industry, variation);
        const dataUrl = svgToDataUrl(svg);
        const cid = `svg-rand-${style.id}-${Date.now()}-${v}`;
        newCandidates.push({
          id: cid,
          imageUrl: dataUrl,
          status: 'neutral',
          description: `${style.label} \u2014 ${VARIATION_NAMES[v % 3]}`,
        });
        logoMetaStore.set(cid, {
          style: style.id,
          variation: v,
          styleName: style.label,
          variationName: VARIATION_NAMES[v % 3],
          rating: 0,
        });
      }
      onUpdateCandidates(newCandidates);
      setIsGenerating(false);
    }, 300);
  }, [companyName, effectiveColor, industry, onUpdateCandidates]);

  // ---- Generate More from liked ----
  const generateMoreFromLiked = useCallback(() => {
    const liked = candidates.filter(c => c.status === 'liked');
    if (liked.length === 0) return;
    setIsGenerating(true);
    setTimeout(() => {
      const newCandidates: LogoCandidate[] = [];
      for (const c of liked) {
        const meta = logoMetaStore.get(c.id);
        const style = meta?.style || 'luxury-monogram';
        const styleCfg = LOGO_STYLES.find(s => s.id === style);
        for (let v = 0; v < 3; v++) {
          const variation = batchIndex * 200 + v + Date.now() % 100;
          const svg = generateSVGLogo(style, companyName, effectiveColor, industry, variation);
          const cid = `svg-iter-${Date.now()}-${v}-${Math.random().toString(36).substring(7)}`;
          newCandidates.push({
            id: cid,
            imageUrl: svgToDataUrl(svg),
            status: 'neutral',
            description: `${styleCfg?.label || 'Logo'} \u2014 ${VARIATION_NAMES[v % 3]}`,
          });
          logoMetaStore.set(cid, {
            style,
            variation: v,
            styleName: styleCfg?.label || style,
            variationName: VARIATION_NAMES[v % 3],
            rating: 0,
          });
        }
      }
      onUpdateCandidates(prev => [...newCandidates, ...prev]);
      setBatchIndex(prev => prev + 1);
      setIsGenerating(false);
    }, 300);
  }, [batchIndex, candidates, companyName, effectiveColor, industry, onUpdateCandidates]);

  const handleStatusChange = (id: string, status: 'liked' | 'disliked') => {
    onUpdateCandidates(prev => prev.map(c =>
      c.id === id
        ? { ...c, status: c.status === status ? 'neutral' : status }
        : c
    ));
  };

  // ---- Download SVG ----
  const handleDownloadSVG = useCallback((candidate: LogoCandidate) => {
    const safeName = companyName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    let svgContent: string;
    try {
      const base64 = candidate.imageUrl.split(',')[1];
      svgContent = decodeURIComponent(escape(atob(base64)));
    } catch {
      const link = document.createElement('a');
      link.href = candidate.imageUrl;
      link.download = `logo-${safeName}-${candidate.id}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logo-${safeName}-${candidate.id}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [companyName]);

  // ---- Download PNG (canvas conversion) ----
  const handleDownloadPNG = useCallback((candidate: LogoCandidate) => {
    const safeName = companyName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const targetWidth = 2000;
      const scale = targetWidth / img.width;
      canvas.width = targetWidth;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `logo-${safeName}-${candidate.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
    img.src = candidate.imageUrl;
  }, [companyName]);

  // ---- Star Rating ----
  const setRating = useCallback((id: string, stars: number) => {
    setRatings(prev => ({ ...prev, [id]: prev[id] === stars ? 0 : stars }));
  }, []);

  // ---- Filtered candidates ----
  const filteredCandidates = useMemo(() => {
    if (selectedStyleFilter === 'all') return candidates;
    return candidates.filter(c => {
      const meta = logoMetaStore.get(c.id);
      return meta?.style === selectedStyleFilter;
    });
  }, [candidates, selectedStyleFilter]);

  const hasLikes = candidates.some(c => c.status === 'liked');

  return (
    <div className="glass rounded-3xl shadow-lg border-white/50 overflow-hidden h-full flex flex-col group hover:shadow-xl transition-all duration-500">
      {/* Hidden canvas for PNG export */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="p-5 border-b border-stone-100 bg-white/40">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <h3 className="font-bold text-forest-900 flex items-center gap-2">
              <div className="p-1.5 bg-forest-100 text-forest-600 rounded-lg">
                <Sparkles size={18} />
              </div>
              Logo Designer Pro
            </h3>
            <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest mt-1">
              12 Styles &bull; 36 Variations &bull; SVG + PNG Export
            </p>
          </div>
          {/* Color picker + Layout toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLayout(l => l === 'grid' ? 'list' : 'grid')}
              className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
              title={layout === 'grid' ? 'Switch to list' : 'Switch to grid'}
            >
              {layout === 'grid' ? <List size={14} className="text-stone-400" /> : <Grid3X3 size={14} className="text-stone-400" />}
            </button>
            <label className="flex items-center gap-1.5 cursor-pointer group/color" title="Change brand color">
              <Palette size={14} className="text-stone-400 group-hover/color:text-forest-600 transition-colors" />
              <input
                type="color"
                value={effectiveColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-7 h-7 rounded-lg border border-stone-200 cursor-pointer p-0.5 shadow-sm"
              />
            </label>
          </div>
        </div>

        {/* Style Filter Pills */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          <button
            onClick={() => setSelectedStyleFilter('all')}
            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border transition-all ${
              selectedStyleFilter === 'all'
                ? 'bg-forest-800 text-white border-forest-800 shadow-md'
                : 'bg-white text-stone-500 border-stone-200 hover:border-forest-300'
            }`}
          >
            All Styles
          </button>
          {LOGO_STYLES.map(style => (
            <button
              key={style.id}
              onClick={() => setSelectedStyleFilter(style.id)}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border transition-all ${
                selectedStyleFilter === style.id
                  ? 'bg-forest-800 text-white border-forest-800 shadow-md'
                  : 'bg-white text-stone-500 border-stone-200 hover:border-forest-300'
              }`}
              title={style.description}
            >
              {style.label}
            </button>
          ))}
        </div>

        {/* Action Toolbar */}
        {candidates.length > 0 && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={generateBatch}
              disabled={isGenerating}
              className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg bg-forest-600 text-white hover:bg-forest-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Generate More
            </button>
            <button
              onClick={randomizeAll}
              disabled={isGenerating}
              className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <Shuffle size={12} /> Randomize All
            </button>
            {hasLikes && (
              <button
                onClick={generateMoreFromLiked}
                disabled={isGenerating}
                className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg bg-white border border-forest-300 text-forest-700 hover:bg-forest-50 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <Heart size={12} /> Iterate Liked
              </button>
            )}
            <button
              onClick={() => onUpdateCandidates(prev => prev.filter(c => c.status !== 'disliked'))}
              className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg bg-white border border-stone-200 text-stone-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors flex items-center gap-1.5 ml-auto"
            >
              Clear Disliked
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-5 overflow-y-auto bg-white/60 min-h-[400px] relative scrollbar-thin">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

        {/* Loading Overlay */}
        {isGenerating && (
          <div className="absolute inset-0 z-30 bg-white/70 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="animate-spin text-forest-600" />
              <p className="text-sm font-bold text-forest-700">Generating logos...</p>
            </div>
          </div>
        )}

        {filteredCandidates.length === 0 && !isGenerating ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-sm mx-auto z-10 py-12">
            <div className="w-20 h-20 mx-auto bg-white rounded-2xl rotate-3 flex items-center justify-center shadow-md border border-stone-100 group-hover:rotate-6 transition-transform duration-500">
              <Sparkles className="text-stone-300 group-hover:text-forest-400 transition-colors" size={32} />
            </div>
            <div className="space-y-2">
              <p className="text-stone-800 font-bold text-lg font-serif">Design Your Brand Mark</p>
              <p className="text-sm text-stone-500">
                Generate 36 professional SVG logos for <span className="font-semibold text-forest-700">{companyName}</span> across 12 premium styles.
              </p>
              <p className="text-xs text-stone-400">
                Each logo features gradients, shadows, layered elements, and production-ready SVG output.
              </p>
            </div>
            <button
              onClick={generateBatch}
              className="w-full py-3 bg-gradient-to-r from-forest-600 to-forest-500 text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all hover:scale-[1.02] shadow-forest-200 flex items-center justify-center gap-2"
            >
              <Sparkles size={16} /> Generate 36 Logo Concepts
            </button>
          </div>
        ) : (
          <div className={`${
            layout === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'flex flex-col gap-4'
          } pb-4 relative z-10`}>
            {filteredCandidates.map((candidate) => {
              const meta = logoMetaStore.get(candidate.id);
              const starRating = ratings[candidate.id] || 0;
              return (
                <div
                  key={candidate.id}
                  className={`
                    group/card relative bg-white rounded-2xl border p-3 transition-all duration-300 hover:shadow-lg
                    ${layout === 'list' ? 'flex gap-4 items-center' : 'flex flex-col'}
                    ${candidate.status === 'liked' ? 'ring-2 ring-forest-500 border-forest-500 shadow-md' : 'border-stone-200 hover:border-forest-200'}
                    ${candidate.status === 'disliked' ? 'opacity-30 grayscale scale-95' : 'opacity-100'}
                  `}
                >
                  {/* Liked badge */}
                  {candidate.status === 'liked' && (
                    <div className="absolute top-2 right-2 z-10 bg-forest-500 text-white rounded-full p-1 shadow-lg">
                      <Check size={12} />
                    </div>
                  )}

                  {/* SVG Preview */}
                  <div className={`relative ${layout === 'list' ? 'w-48 h-36 shrink-0' : 'w-full min-h-[200px]'} flex items-center justify-center bg-stone-50 rounded-xl overflow-hidden border border-stone-100`}>
                    <img
                      src={candidate.imageUrl}
                      alt={candidate.description || 'Logo concept'}
                      className="max-w-full max-h-full object-contain p-2 transition-transform duration-500 group-hover/card:scale-105"
                    />

                    {/* Hover overlay with download buttons */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-end justify-center pb-3 gap-2">
                      <button
                        onClick={() => handleDownloadSVG(candidate)}
                        className="px-3 py-1.5 bg-white text-stone-700 rounded-lg hover:bg-forest-50 hover:text-forest-700 shadow-lg transition-colors text-xs font-bold flex items-center gap-1.5"
                        title="Download SVG"
                      >
                        <Download size={13} /> SVG
                      </button>
                      <button
                        onClick={() => handleDownloadPNG(candidate)}
                        className="px-3 py-1.5 bg-white text-stone-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 shadow-lg transition-colors text-xs font-bold flex items-center gap-1.5"
                        title="Download PNG (2000px)"
                      >
                        <Image size={13} /> PNG
                      </button>
                    </div>
                  </div>

                  {/* Info + Actions */}
                  <div className={`${layout === 'list' ? 'flex-1 flex items-center justify-between' : 'mt-2'}`}>
                    <div className="px-1">
                      {/* Style + variation name */}
                      {candidate.description && (
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-1.5">
                          {candidate.description}
                        </p>
                      )}

                      {/* Star Rating */}
                      <div className="flex items-center gap-0.5 mb-1.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <button
                            key={s}
                            onClick={() => setRating(candidate.id, s)}
                            className="transition-colors"
                          >
                            <Star
                              size={13}
                              fill={s <= starRating ? '#D4A947' : 'none'}
                              stroke={s <= starRating ? '#D4A947' : '#d1d5db'}
                              strokeWidth={1.5}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center justify-between px-1">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleStatusChange(candidate.id, 'disliked')}
                          className={`p-1.5 rounded-lg transition-all ${
                            candidate.status === 'disliked'
                              ? 'bg-red-100 text-red-600'
                              : 'text-stone-300 hover:bg-stone-100 hover:text-red-400'
                          }`}
                          title="Dislike"
                        >
                          <ThumbsDown size={14} />
                        </button>
                        <button
                          onClick={() => handleStatusChange(candidate.id, 'liked')}
                          className={`p-1.5 rounded-lg transition-all ${
                            candidate.status === 'liked'
                              ? 'bg-forest-100 text-forest-600'
                              : 'text-stone-300 hover:bg-stone-100 hover:text-forest-400'
                          }`}
                          title="Use This Logo"
                        >
                          <Heart size={14} fill={candidate.status === 'liked' ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDownloadSVG(candidate)}
                          className="text-[10px] text-stone-400 hover:text-forest-600 font-black uppercase tracking-widest flex items-center gap-1 px-2 py-1 rounded-md hover:bg-forest-50 transition-colors"
                        >
                          <Download size={10} /> SVG
                        </button>
                        <button
                          onClick={() => handleDownloadPNG(candidate)}
                          className="text-[10px] text-stone-400 hover:text-blue-600 font-black uppercase tracking-widest flex items-center gap-1 px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
                        >
                          <Image size={10} /> PNG
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-white/80 backdrop-blur border-t border-stone-100 flex gap-3 z-20">
        <button
          onClick={generateBatch}
          disabled={isGenerating}
          className="flex-1 py-3 px-4 rounded-xl border border-stone-200 text-stone-600 text-sm font-bold hover:bg-stone-50 transition-colors disabled:opacity-50"
        >
          <div className="flex items-center justify-center gap-2">
            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            <span>New Logos</span>
          </div>
        </button>

        <button
          onClick={generateMoreFromLiked}
          disabled={!hasLikes || isGenerating}
          className={`flex-[2] py-3 px-4 rounded-xl text-sm font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
            hasLikes ? 'bg-forest-800 hover:bg-forest-900' : 'bg-stone-300'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Sparkles size={16} />
            <span>Iterate on Liked</span>
          </div>
        </button>
      </div>
    </div>
  );
};
