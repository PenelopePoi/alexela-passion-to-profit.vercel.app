/**
 * First-pass production format checks. These are necessary checks, not a substitute
 * for visual inspection, PDF rendering, SVG geometry analysis or physical test cuts.
 */
export type ProductionCheck = { ok: boolean; errors: string[]; warnings: string[] };
const result = (errors: string[], warnings: string[] = []): ProductionCheck => ({ok: errors.length === 0, errors, warnings});

export function inspectPng(bytes: Uint8Array, expectedWidth?: number, expectedHeight?: number): ProductionCheck {
  const errors: string[] = [], warnings: string[] = [];
  const signature = [137,80,78,71,13,10,26,10];
  if (bytes.length < 24 || !signature.every((n,i) => bytes[i] === n)) return result(['Invalid PNG signature or missing IHDR']);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (String.fromCharCode(...bytes.slice(12,16)) !== 'IHDR') errors.push('PNG IHDR missing');
  const w=view.getUint32(16), h=view.getUint32(20);
  if (!w || !h) errors.push('PNG dimensions must be nonzero');
  if (expectedWidth !== undefined && w !== expectedWidth) errors.push(`Expected width ${expectedWidth}px, got ${w}px`);
  if (expectedHeight !== undefined && h !== expectedHeight) errors.push(`Expected height ${expectedHeight}px, got ${h}px`);
  if (bytes.length < 45) warnings.push('PNG too short for full image integrity to be established');
  warnings.push('Pixel resolution does not prove print DPI or safe margins');
  return result(errors,warnings);
}

export function inspectPdf(bytes: Uint8Array, expectedWidthPt?: number, expectedHeightPt?: number): ProductionCheck {
  const errors: string[] = [], warnings: string[] = [];
  const text=new TextDecoder('latin1').decode(bytes);
  if (!text.startsWith('%PDF-')) return result(['PDF header missing']);
  const m=text.match(/\/MediaBox\s*\[\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\]/);
  if (!m) {warnings.push('MediaBox not directly readable (may be compressed or inherited)');return result(errors,warnings);}
  const w=Number(m[3])-Number(m[1]), h=Number(m[4])-Number(m[2]);
  if (expectedWidthPt !== undefined && Math.abs(w-expectedWidthPt)>0.1) errors.push(`Expected width ${expectedWidthPt}pt, got ${w}pt`);
  if (expectedHeightPt !== undefined && Math.abs(h-expectedHeightPt)>0.1) errors.push(`Expected height ${expectedHeightPt}pt, got ${h}pt`);
  warnings.push('MediaBox check does not verify every page, fonts, bleed, trim or rendering');
  return result(errors,warnings);
}

export function inspectCutSvg(svg: string): ProductionCheck {
  const errors: string[]=[], warnings: string[]=[];
  if (!/<svg\b/i.test(svg) || !/<\/svg\s*>/i.test(svg)) return result(['SVG root missing or unclosed']);
  if (/<(?:image|foreignObject)\b/i.test(svg) || /data:image\//i.test(svg)) errors.push('Raster or foreign content not allowed in cut-ready SVG');
  if (/<(?:linearGradient|radialGradient|filter|pattern)\b/i.test(svg)) errors.push('Gradients, patterns or filters are not cuttable flat colors');
  if (/<text\b/i.test(svg)) warnings.push('Live text should be converted to paths before cutting');
  const paths=[...svg.matchAll(/<path\b[^>]*\bd\s*=\s*["']([^"']+)["']/gi)];
  if (!paths.length) warnings.push('No path elements found; inspect shape primitives and text manually');
  for (const [,d] of paths) {
    const segments=d.split(/(?=[Mm])/).filter(Boolean);
    if (segments.some(s=>!/[Zz]\s*$/.test(s))) errors.push('At least one SVG path subpath is not explicitly closed');
  }
  warnings.push('Check cut feasibility, dimensions, node smoothness, color layers, self-intersections and weedability in a vector editor');
  return result(errors,warnings);
}
