import fs from 'node:fs';
import path from 'node:path';

describe('public manifest and icon assets', () => {
  const repoRoot = process.cwd();
  const manifestPath = path.join(repoRoot, 'public', 'manifest.json');
  const iconPath = path.join(repoRoot, 'public', 'icon.svg');

  it('manifest.json exists and contains the expected PWA metadata', () => {
    expect(fs.existsSync(manifestPath)).toBe(true);

    const raw = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(raw);

    expect(manifest).toEqual({
      name: 'Analyst Dashboard',
      short_name: 'Analyst',
      description: 'Browse analyst transcript summaries and thesis tracking',
      start_url: '/',
      display: 'standalone',
      background_color: '#020617',
      theme_color: '#020617',
      icons: [
        { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      ],
    });
  });

  it('manifest icon points to an existing SVG asset', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const iconSrc = manifest.icons?.[0]?.src;

    expect(iconSrc).toBe('/icon.svg');
    expect(fs.existsSync(path.join(repoRoot, 'public', iconSrc.replace(/^\//, '')))).toBe(true);
  });

  it('icon.svg exists and contains the expected SVG structure and branding', () => {
    expect(fs.existsSync(iconPath)).toBe(true);

    const svg = fs.readFileSync(iconPath, 'utf8');

    expect(svg).toContain('<svg');
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('viewBox="0 0 512 512"');
    expect(svg).toContain('<rect width="512" height="512" rx="64" ry="64" fill="#0f172a"/>');
    expect(svg).toContain('text-anchor="middle"');
    expect(svg).toContain('font-size="320"');
    expect(svg).toContain('font-weight="600"');
    expect(svg).toContain('fill="white">A</text>');
  });
});

import { metadata } from '@/app/layout';

describe('app layout metadata', () => {
  it('exports metadata aligned with manifest and icon assets', () => {
    expect(metadata.title).toBe('Analyst Dashboard');
    expect(metadata.description).toBe('Browse analyst transcript summaries and thesis tracking');
    expect(metadata.manifest).toBe('/manifest.json');
    expect(metadata.icons).toEqual({ icon: '/icon.svg' });
    expect(metadata.other).toEqual({
      'theme-color': '#020617',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
    });
  });
});
