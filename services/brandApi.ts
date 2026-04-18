/**
 * Brand API Service — XELA Creative Branding Studio
 *
 * Client-side wrapper for the /api/brand/* serverless functions.
 * Gemini API key lives server-side only — never exposed to the browser.
 */

import { BrandInput } from '../types';

async function callBrandApi<T>(action: string, params: Record<string, unknown>): Promise<T> {
  const res = await fetch('/api/brand/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...params }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'AI generation failed' }));
    throw new Error(error.error || `Brand API error: ${res.status}`);
  }

  return res.json();
}

export const generateBusinessNames = (industry: string, vibe: string, location: string, keywords?: string) =>
  callBrandApi<string[]>('names', { industry, vibe, location, keywords });

export const generateMottos = (industry: string, vibe: string, companyName: string, context?: string) =>
  callBrandApi<string[]>('mottos', { industry, vibe, companyName, context });

export const generateStickerSlogans = (industry: string, companyName: string) =>
  callBrandApi<string[]>('slogans', { industry, companyName });

export const generateBrandStrategy = (input: BrandInput) =>
  callBrandApi<Record<string, unknown>>('strategy', {
    companyName: input.companyName,
    industry: input.industry,
    vibe: input.vibe,
    location: input.location,
    audience: input.audience,
    additionalNotes: input.additionalNotes,
  });

export const generateLogoConcepts = (companyName: string, industry: string, vibe: string, colorPalette?: string[]) =>
  callBrandApi<Array<{ name: string; description: string; style: string; iconSuggestion: string; layoutSuggestion: string }>>('logos', {
    companyName,
    industry,
    vibe,
    colorPalette,
  });
