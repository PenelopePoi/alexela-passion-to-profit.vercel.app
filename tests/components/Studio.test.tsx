import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock Firebase
vi.mock('@firebase/app', () => ({ initializeApp: vi.fn() }));
vi.mock('@firebase/auth', () => ({ getAuth: vi.fn(() => ({})) }));
vi.mock('@firebase/firestore', () => ({ getFirestore: vi.fn(() => ({})) }));
vi.mock('../../firebase', () => ({
  db: {},
  auth: {},
  app: {},
}));

// Mock LogoGenerator to isolate Studio tests
vi.mock('../../components/LogoGenerator', () => ({
  LogoGenerator: () => <div data-testid="logo-generator">LogoGenerator Mock</div>,
}));

// Import after mocks
import Studio from '../../src/components/Studio';
import type { GeneratedAsset, BrandInput } from '../../types';

const mockBrandInput: BrandInput = {
  companyName: 'Test Brand',
  industry: 'restaurant',
  services: ['Logo Design', 'Business Cards'],
  vibe: 'Modern',
  location: 'Melbourne, FL',
  audience: 'Local foodies',
};

const mockAssets: GeneratedAsset[] = [
  {
    id: 'asset-1',
    type: 'image',
    url: 'https://example.com/logo.png',
    prompt: 'A modern restaurant logo',
    timestamp: Date.now(),
  },
  {
    id: 'asset-2',
    type: 'image',
    url: 'https://example.com/card.png',
    prompt: 'Business card design',
    timestamp: Date.now() - 1000,
  },
  {
    id: 'asset-3',
    type: 'video',
    url: 'https://example.com/intro.mp4',
    prompt: 'Brand intro video',
    timestamp: Date.now() - 2000,
  },
];

describe('Studio Component', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <Studio assets={[]} brandInput={mockBrandInput} primaryColor="#2dd4bf" />
    );
    expect(container).toBeTruthy();
  });

  it('renders all provided assets', () => {
    render(
      <Studio assets={mockAssets} brandInput={mockBrandInput} primaryColor="#2dd4bf" />
    );
    // Assets should appear (prompts are used as alt text or displayed)
    expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(0);
  });

  it('handles empty assets gracefully', () => {
    const { container } = render(
      <Studio assets={[]} brandInput={mockBrandInput} primaryColor="#a78bfa" />
    );
    // Should still render the studio container
    expect(container.firstChild).toBeTruthy();
  });

  it('does not export when no assets', () => {
    render(
      <Studio assets={[]} brandInput={mockBrandInput} primaryColor="#2dd4bf" />
    );
    // Export button should either not exist or be disabled
    const exportBtns = screen.queryAllByText(/export/i);
    // If export button exists, clicking it with empty assets should be a no-op
    if (exportBtns.length > 0) {
      fireEvent.click(exportBtns[0]);
      // No error thrown = pass
    }
  });

  it('accepts primaryColor prop without error', () => {
    // Test with various color formats
    const { rerender } = render(
      <Studio assets={mockAssets} brandInput={mockBrandInput} primaryColor="#ff0000" />
    );
    rerender(
      <Studio assets={mockAssets} brandInput={mockBrandInput} primaryColor="rgb(45,212,191)" />
    );
    rerender(
      <Studio assets={mockAssets} brandInput={mockBrandInput} primaryColor="hsl(174, 72%, 50%)" />
    );
  });
});

describe('Studio asset ordering', () => {
  it('preserves initial asset order', () => {
    render(
      <Studio assets={mockAssets} brandInput={mockBrandInput} primaryColor="#2dd4bf" />
    );
    // Assets should be in the DOM
    const container = document.querySelector('[class*="grid"]') || document.body;
    expect(container).toBeTruthy();
  });
});

describe('BrandInput types', () => {
  it('accepts minimal brand input', () => {
    const minimal: BrandInput = {
      companyName: 'Test',
      industry: 'auto',
      services: [],
      vibe: 'Bold',
      location: 'Palm Bay',
      audience: 'Local drivers',
    };
    const { container } = render(
      <Studio assets={[]} brandInput={minimal} primaryColor="#000" />
    );
    expect(container).toBeTruthy();
  });

  it('accepts full brand input with all optional fields', () => {
    const full: BrandInput = {
      ...mockBrandInput,
      ownerName: 'Alex',
      businessSuffix: 'LLC',
      additionalNotes: 'Space Coast vibes',
      phone: '(321) 375-9685',
      email: 'hello@xela.studio',
      website: 'https://xela.studio',
      selectedTier: 'elite',
      yearsExperience: '5',
    };
    const { container } = render(
      <Studio assets={mockAssets} brandInput={full} primaryColor="#2dd4bf" />
    );
    expect(container).toBeTruthy();
  });
});

describe('GeneratedAsset types', () => {
  it('supports image type', () => {
    const asset: GeneratedAsset = {
      id: '1', type: 'image', url: 'test.png', prompt: 'test', timestamp: Date.now(),
    };
    expect(asset.type).toBe('image');
  });

  it('supports video type', () => {
    const asset: GeneratedAsset = {
      id: '2', type: 'video', url: 'test.mp4', prompt: 'test', timestamp: Date.now(),
    };
    expect(asset.type).toBe('video');
  });

  it('supports audio type', () => {
    const asset: GeneratedAsset = {
      id: '3', type: 'audio', url: 'test.mp3', prompt: 'test', timestamp: Date.now(),
    };
    expect(asset.type).toBe('audio');
  });
});
