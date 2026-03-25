import fs from 'node:fs';
import path from 'node:path';
import { PRINCIPAL_FEATURE_REGISTRY } from '../../../../../packages/classroom/src/screens/principal/PrincipalFeatureRegistry';
import { PRINCIPAL_FEATURE_SCOPE_MAP } from '../../../../../packages/classroom/src/screens/principal/PrincipalIAScope';

const APP_ROOT = path.resolve(__dirname, '../../..');
const WORKSPACE_ROOT = path.resolve(APP_ROOT, '..', '..');
const INSTITUTIONAL_ARC_CARD = path.join(WORKSPACE_ROOT, 'packages', 'classroom', 'src', 'screens', 'principal', 'InstitutionalArcCard.tsx');
const COMMAND_CENTER = path.join(WORKSPACE_ROOT, 'packages', 'classroom', 'src', 'screens', 'principal', 'CommandCenter.tsx');
const DASHBOARD_CONTENT = path.join(WORKSPACE_ROOT, 'packages', 'classroom', 'src', 'screens', 'principal', 'DashboardContent.tsx');
const EN_LOCALE = path.join(APP_ROOT, 'src', 'i18n', 'locales', 'en.json');

function get(obj: any, keyPath: string): any {
  return keyPath.split('.').reduce((acc, key) => acc?.[key], obj);
}

describe('Principal IA coherence', () => {
  it('covers every feature registry item with scope metadata', () => {
    const featureIds = Object.keys(PRINCIPAL_FEATURE_REGISTRY);
    for (const featureId of featureIds) {
      expect(PRINCIPAL_FEATURE_SCOPE_MAP[featureId]).toBeDefined();
      expect(PRINCIPAL_FEATURE_REGISTRY[featureId]?.scope).toBeDefined();
      expect(PRINCIPAL_FEATURE_REGISTRY[featureId]?.scopeBadgeLabelKey).toMatch(/^principal\.ia\.scope\./);
      expect(PRINCIPAL_FEATURE_REGISTRY[featureId]?.scopeHelpTextKey).toMatch(/^principal\.ia\.help\./);
    }
  });

  it('keeps the requested scope split for key features', () => {
    expect(PRINCIPAL_FEATURE_SCOPE_MAP.hierarchy?.scope).toBe('institutional');
    expect(PRINCIPAL_FEATURE_SCOPE_MAP.invites?.scope).toBe('institutional');
    expect(PRINCIPAL_FEATURE_SCOPE_MAP.pending_approvals?.scope).toBe('institutional');
    expect(PRINCIPAL_FEATURE_SCOPE_MAP.institutional_calendar?.scope).toBe('institutional');

    expect(PRINCIPAL_FEATURE_SCOPE_MAP.student_pulse?.scope).toBe('classroom');
    expect(PRINCIPAL_FEATURE_SCOPE_MAP.curriculum_pulse?.scope).toBe('classroom');
    expect(PRINCIPAL_FEATURE_SCOPE_MAP.resource_needs?.scope).toBe('classroom');

    expect(PRINCIPAL_FEATURE_SCOPE_MAP.ecosystem_resonance?.scope).toBe('ecology_crosscutting');
    expect(PRINCIPAL_FEATURE_SCOPE_MAP.open_commons?.scope).toBe('ecology_crosscutting');
  });

  it('renders badges and scope helper semantics on principal web cards/actions', () => {
    const arcCardSource = fs.readFileSync(INSTITUTIONAL_ARC_CARD, 'utf8');
    const commandCenterSource = fs.readFileSync(COMMAND_CENTER, 'utf8');
    const dashboardSource = fs.readFileSync(DASHBOARD_CONTENT, 'utf8');

    expect(arcCardSource.includes('scopeBadgeLabelKey')).toBe(true);
    expect(arcCardSource.includes('scopeHelpTextKey')).toBe(true);
    expect(commandCenterSource.includes('getPrincipalFeatureScopeMeta')).toBe(true);
    expect(commandCenterSource.includes('scopeBadgeLabelKey')).toBe(true);
    expect(dashboardSource.includes('renderScopeBadge')).toBe(true);
    expect(dashboardSource.includes("renderScopeBadge('hierarchy')")).toBe(true);
    expect(dashboardSource.includes("renderScopeBadge('invites')")).toBe(true);
    expect(dashboardSource.includes("renderScopeBadge('open_commons')")).toBe(true);
  });

  it('has i18n keys for IA scope labels and helper copy', () => {
    const en = JSON.parse(fs.readFileSync(EN_LOCALE, 'utf8'));
    const requiredKeys = [
      'principal.ia.scope.institutional',
      'principal.ia.scope.classroom',
      'principal.ia.scope.crossEcosystem',
      'principal.ia.help.institutional',
      'principal.ia.help.classroom',
      'principal.ia.help.crossEcosystem',
    ];

    for (const keyPath of requiredKeys) {
      expect(get(en, keyPath)).toBeTruthy();
    }
  });
});
