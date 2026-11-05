// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const walk = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
  entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]);

describe('approved AleXelA identity across public entry points', () => {
  it('preserves the approved master artwork byte for byte', () => {
    expect(createHash('sha256').update(readFileSync('public/alexela-logo-cutout.png')).digest('hex'))
      .toBe('62f6c783c98fe42393ed318cb4073f05e546c49721ec2d0f532c56e6022a4da9');
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
      expect(html, path).toContain('href="/alexela-logo-cutout.png"');
    }
  });
});
