// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { inspectCutSvg, inspectPdf, inspectPng } from '../services/productionPreflight';

const png = (width: number, height: number) => {
  const b = new Uint8Array(48);
  b.set([137,80,78,71,13,10,26,10],0);
  b.set([0,0,0,13,73,72,68,82],8);
  const v = new DataView(b.buffer);
  v.setUint32(16,width); v.setUint32(20,height);
  return b;
};

describe('production preflight: truthful first-pass checks', () => {
  it('checks landscape business-card pixel dimensions without claiming DPI', () => {
    expect(inspectPng(png(2100,1200),2100,1200).ok).toBe(true);
    expect(inspectPng(png(1200,2100),2100,1200).ok).toBe(false);
  });
  it('rejects non-PNG files', () => expect(inspectPng(new Uint8Array([1,2,3])).ok).toBe(false));
  it('checks PDF page box dimensions at 3.5 x 2 inches', () => {
    const pdf = new TextEncoder().encode('%PDF-1.4\n<< /Type /Page /MediaBox [0 0 252 144] >>\n%%EOF');
    expect(inspectPdf(pdf,252,144).ok).toBe(true);
    expect(inspectPdf(pdf,144,252).ok).toBe(false);
  });
  it('rejects embedded raster, gradients and open SVG paths', () => {
    expect(inspectCutSvg('<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0 L10 0 L10 10 Z"/></svg>').ok).toBe(true);
    expect(inspectCutSvg('<svg><image href="data:image/png;base64,AA=="/></svg>').ok).toBe(false);
    expect(inspectCutSvg('<svg><linearGradient id="g"/><path d="M0 0 L2 2 Z"/></svg>').ok).toBe(false);
    expect(inspectCutSvg('<svg><path d="M0 0 L10 10"/></svg>').ok).toBe(false);
  });
  it('warns when geometry and physical production cannot be proven', () => {
    expect(inspectCutSvg('<svg><path d="M0 0 L1 0 Z"/></svg>').warnings.join(' ')).toMatch(/weedability/);
  });
});
