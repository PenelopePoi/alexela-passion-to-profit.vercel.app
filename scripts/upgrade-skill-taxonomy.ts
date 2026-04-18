#!/usr/bin/env node
/**
 * Skill Taxonomy Upgrader
 * Adds faceted classification fields to all existing SKILL.md files.
 * Run: npx tsx scripts/upgrade-skill-taxonomy.ts
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const SKILLS_DIR = join(process.env.HOME || '', '.claude/skills');

interface SkillFrontmatter {
  name: string;
  description: string;
  intent?: string;
  domain?: string;
  modality?: string;
  lifecycle?: string;
  version?: string;
  bloom_level?: string;
  requires?: string[];
  composes_with?: string[];
  extends?: string[];
}

// Auto-classify intent from description keywords
function classifyIntent(desc: string): string {
  const d = desc.toLowerCase();
  if (d.includes('generate') || d.includes('create') || d.includes('build') || d.includes('write')) return 'generate';
  if (d.includes('detect') || d.includes('classify') || d.includes('identify')) return 'classify';
  if (d.includes('extract') || d.includes('parse') || d.includes('scrape')) return 'extract';
  if (d.includes('analyze') || d.includes('audit') || d.includes('review') || d.includes('assess')) return 'analyze';
  if (d.includes('evaluate') || d.includes('score') || d.includes('rate') || d.includes('judge')) return 'evaluate';
  if (d.includes('transform') || d.includes('convert') || d.includes('translate') || d.includes('optimize')) return 'transform';
  return 'analyze'; // default
}

// Auto-classify domain from description keywords
function classifyDomain(name: string, desc: string): string {
  const text = (name + ' ' + desc).toLowerCase();
  if (text.includes('security') || text.includes('hack') || text.includes('exploit') || text.includes('detect-') || text.includes('pentest') || text.includes('malware') || text.includes('forensic')) return 'security';
  if (text.includes('brand') || text.includes('creative') || text.includes('design') || text.includes('logo') || text.includes('music') || text.includes('audio') || text.includes('video') || text.includes('art')) return 'creativity';
  if (text.includes('learn') || text.includes('teach') || text.includes('course') || text.includes('literacy') || text.includes('curriculum')) return 'education';
  if (text.includes('health') || text.includes('life-platform') || text.includes('wellness')) return 'health';
  if (text.includes('ethical') || text.includes('guardian') || text.includes('doctrine') || text.includes('governance') || text.includes('sos')) return 'ethics';
  if (text.includes('business') || text.includes('revenue') || text.includes('invoice') || text.includes('payment') || text.includes('client') || text.includes('crm') || text.includes('proposal') || text.includes('seo') || text.includes('marketing')) return 'business';
  if (text.includes('skill') || text.includes('meta') || text.includes('prompt') || text.includes('agent') || text.includes('pipeline') || text.includes('context') || text.includes('loop')) return 'meta';
  if (text.includes('code') || text.includes('api') || text.includes('deploy') || text.includes('container') || text.includes('cloud') || text.includes('mcp')) return 'engineering';
  return 'meta';
}

function classifyModality(desc: string): string {
  const d = desc.toLowerCase();
  if (d.includes('image') || d.includes('video') || d.includes('audio') || d.includes('visual')) return 'multimodal';
  if (d.includes('code') || d.includes('script') || d.includes('binary')) return 'code';
  if (d.includes('json') || d.includes('structured') || d.includes('schema') || d.includes('yaml')) return 'text-to-structured';
  if (d.includes('conversation') || d.includes('chat') || d.includes('interview') || d.includes('dialogue')) return 'multi-turn';
  return 'text-to-text';
}

function classifyBloomLevel(desc: string): string {
  const d = desc.toLowerCase();
  if (d.includes('create') || d.includes('generate') || d.includes('build') || d.includes('design') || d.includes('compose')) return 'Create';
  if (d.includes('evaluate') || d.includes('judge') || d.includes('assess') || d.includes('audit')) return 'Evaluate';
  if (d.includes('analyze') || d.includes('detect') || d.includes('investigate') || d.includes('compare')) return 'Analyze';
  if (d.includes('apply') || d.includes('implement') || d.includes('execute') || d.includes('deploy')) return 'Apply';
  if (d.includes('explain') || d.includes('describe') || d.includes('interpret')) return 'Understand';
  return 'Apply';
}

function parseFrontmatter(content: string): { frontmatter: Record<string, any>; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const fm: Record<string, any> = {};
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map(v => v.trim()) as any;
    }
    fm[key] = value;
  }
  return { frontmatter: fm, body: match[2] };
}

function serializeFrontmatter(fm: Record<string, any>): string {
  const lines: string[] = ['---'];
  const order = ['name', 'description', 'intent', 'domain', 'modality', 'lifecycle', 'version', 'bloom_level', 'type', 'requires', 'composes_with', 'extends'];
  const written = new Set<string>();

  for (const key of order) {
    if (key in fm) {
      const val = fm[key];
      if (Array.isArray(val)) {
        lines.push(`${key}: [${val.join(', ')}]`);
      } else {
        lines.push(`${key}: ${val}`);
      }
      written.add(key);
    }
  }
  // Write remaining keys not in order
  for (const [key, val] of Object.entries(fm)) {
    if (written.has(key)) continue;
    if (Array.isArray(val)) {
      lines.push(`${key}: [${val.join(', ')}]`);
    } else {
      lines.push(`${key}: ${val}`);
    }
  }
  lines.push('---');
  return lines.join('\n');
}

// Main
const skillDirs = readdirSync(SKILLS_DIR).filter(d => {
  const skillPath = join(SKILLS_DIR, d, 'SKILL.md');
  return existsSync(skillPath);
});

let upgraded = 0;
let skipped = 0;

for (const dir of skillDirs) {
  const filePath = join(SKILLS_DIR, dir, 'SKILL.md');
  const content = readFileSync(filePath, 'utf-8');
  const { frontmatter, body } = parseFrontmatter(content);

  if (!frontmatter.name) {
    console.log(`SKIP: ${dir} — no frontmatter`);
    skipped++;
    continue;
  }

  let changed = false;
  const name = frontmatter.name || dir;
  const desc = frontmatter.description || '';

  if (!frontmatter.intent) { frontmatter.intent = classifyIntent(desc); changed = true; }
  if (!frontmatter.domain) { frontmatter.domain = classifyDomain(name, desc); changed = true; }
  if (!frontmatter.modality) { frontmatter.modality = classifyModality(desc); changed = true; }
  if (!frontmatter.lifecycle) { frontmatter.lifecycle = 'stable'; changed = true; }
  if (!frontmatter.version) { frontmatter.version = '1.0.0'; changed = true; }
  if (!frontmatter.bloom_level) { frontmatter.bloom_level = classifyBloomLevel(desc); changed = true; }

  if (changed) {
    const newContent = serializeFrontmatter(frontmatter) + '\n' + body;
    writeFileSync(filePath, newContent);
    console.log(`UPGRADED: ${dir} → intent:${frontmatter.intent} domain:${frontmatter.domain} modality:${frontmatter.modality}`);
    upgraded++;
  } else {
    console.log(`OK: ${dir} — already has taxonomy fields`);
    skipped++;
  }
}

console.log(`\nDone: ${upgraded} upgraded, ${skipped} skipped, ${upgraded + skipped} total`);
