// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const walk = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
  entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]);

describe('approved AleXelA identity across public entry points', () => {
  it('preserves the approved master artwork byte for byte', () => {
    expect(createHash('sha256').update(readFileSync('public/alexela-actual-logo-transparent.png')).digest('hex'))
      .toBe('08a402ed755cf014a25f41f213e859fd70df58bbaaa50a5562f43a214a48d135');
  });
  it('removes retired logo references and the retired domain from runtime pages', () => {
    const files = ['App.tsx', 'index.html', ...walk('components'), ...walk('src'), ...walk('services'), ...walk('public')]
      .filter(path => /\.(tsx?|html|css|json|xml|txt)$/.test(path));
    const offenders = files.filter(path => /xela-logo-(?:new|clean|final|cropped)\.png|xela-branding-sheet\.png|xela-creative-branding\.vercel\.app/.test(readFileSync(path, 'utf8')));
    expect(offenders).toEqual([]);
  });
  it('gives every standalone page the shared identity stylesheet and master favicon', () => {
    for (const path of walk('public').filter(path => path.endsWith('.html'))) {
      const html = readFileSync(path, 'utf8');
      expect(html, path).toContain('href="/alexela-brand.css"');
      expect(html, path).toContain('href="/alexela-actual-logo-transparent.png"');
    }
  });
});
