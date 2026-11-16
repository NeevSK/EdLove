import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from '../../utils/constants.js';
import { DiscoveryService } from '../../services/DiscoveryService.js';
import { AuditService } from '../../services/AuditService.js';
import { DocumentService } from '../../services/DocumentService.js';
import type { GroundedSymbol, PipelineStateType } from '../types/state.js';

export async function groundingNode(state: PipelineStateType): Promise<Partial<PipelineStateType>> {
  const groundedSymbols: GroundedSymbol[] = [];
  const document = new DocumentService();
  const discovery = new DiscoveryService();
  const audit = new AuditService(document);

  // 1. Audit Live Deprecations using AuditService
  audit.handleAuditDeprecations({ target: state.targetPackage });
  const deprecationsPath = path.join(ROOT_DIR, 'reports', 'live-deprecations.json');
  let blacklistedNames = new Set<string>();

  if (fs.existsSync(deprecationsPath)) {
    try {
      const raw = fs.readFileSync(deprecationsPath, 'utf8');
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        for (const item of data) {
          if (item?.symbol) blacklistedNames.add(item.symbol);
        }
      }
    } catch {
      // Fallback
    }
  }

  // 2. Discover Blast Radius using DiscoveryService
  let blastRadiusSymbols: string[] = [];
  try {
    const blastRes = discovery.handleSimulateImpact({ symbol: state.targetPackage });
    const blastText = blastRes?.content?.[0]?.text || '';
    if (blastText) {
      blastRadiusSymbols.push(state.targetPackage);
    }
  } catch {
    // Non-blocking
  }

  // 3. Ground against physical substrate
  const candidates: Array<{ name: string; signature: string; source: string }> = [
    { name: 'scheduleOnRN', signature: '(fn: (...args: any[]) => void, ...args: any[]) => void', source: 'react-native-worklets' },
    { name: 'scheduleOnUI', signature: '(worklet: (...args: any[]) => void, ...args: any[]) => void', source: 'react-native-worklets' },
    { name: 'Gesture.Pan', signature: '() => PanGesture', source: 'react-native-gesture-handler' },
    { name: 'runOnJS', signature: '@deprecated in Reanimated 4/Worklets', source: 'react-native-reanimated' },
    { name: 'runOnUI', signature: '@deprecated in Reanimated 4/Worklets', source: 'react-native-reanimated' },
  ];

  for (const c of candidates) {
    const isDeprecated = blacklistedNames.has(c.name) || c.signature.includes('@deprecated');
    groundedSymbols.push({
      name: c.name,
      signature: c.signature,
      source: c.source,
      deprecated: isDeprecated,
    });
  }

  return {
    groundedSymbols,
  };
}
