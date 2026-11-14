import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_ROOT = path.resolve(__dirname, '../../..');
const WORKSPACE_DIR = path.join(APP_ROOT, 'app/(tabs)/workspace');

describe('Mobile Workspace Sanctuary, ERP & Local Mesh Routes', () => {
  it('registers events, inventory, welfare, and peers screens in workspace _layout.tsx', () => {
    const layoutPath = path.join(WORKSPACE_DIR, '_layout.tsx');
    expect(fs.existsSync(layoutPath)).toBe(true);

    const layoutSource = fs.readFileSync(layoutPath, 'utf8');
    expect(layoutSource).toContain('name="events"');
    expect(layoutSource).toContain('name="inventory"');
    expect(layoutSource).toContain('name="welfare"');
    expect(layoutSource).toContain('name="peers"');
  });

  it('verifies that events, inventory, welfare, and peers route files exist', () => {
    expect(fs.existsSync(path.join(WORKSPACE_DIR, 'events.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(WORKSPACE_DIR, 'inventory.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(WORKSPACE_DIR, 'welfare.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(WORKSPACE_DIR, 'peers.tsx'))).toBe(true);
  });

  it('strictly enforces Quiet Sanctuary Doctrine: zero public sponsor or crowdfunding noise', () => {
    const routeFiles = ['events.tsx', 'inventory.tsx', 'welfare.tsx', 'peers.tsx'];

    routeFiles.forEach((file) => {
      const filePath = path.join(WORKSPACE_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8').toLowerCase();

      // Ensure no public commercial crowdfunding noise
      expect(content).not.toContain('crowdfunding');
      expect(content).not.toContain('patreon');
      expect(content).not.toContain('buy me a coffee');
      expect(content).not.toContain('sponsor tier');
    });
  });

  it('ensures institutional inventory route uses parseInstitutionalQR from scanner-kit', () => {
    const inventorySource = fs.readFileSync(path.join(WORKSPACE_DIR, 'inventory.tsx'), 'utf8');
    expect(inventorySource).toContain('parseInstitutionalQR');
    expect(inventorySource).toContain('@repo/scanner-kit');
  });
});
