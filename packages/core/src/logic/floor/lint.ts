import { type FloorConfig, floorConfigWith } from './config';
import { PATTERNS } from './patterns';
import type { FloorNode, FloorSpace, FloorTree } from './types';

export interface FloorFinding {
  rule:
    | 'target-size'
    | 'one-lit'
    | 'task-hidden'
    | 'tooltip-words'
    | 'unnamed-part'
    | 'over-budget'
    | 'focus-covered';
  severity: 'error' | 'warning';
  id: string;
  message: string;
}

function walk(
  node: FloorNode,
  visit: (n: FloorNode, parent?: FloorNode) => void,
  parent?: FloorNode,
) {
  visit(node, parent);
  for (const c of node.children) walk(c, visit, node);
}

/**
 * Checks a laid-out floor against the rules every layout must keep (the
 * accessibility table and the screen-audit method). Runs in tests and in the
 * inspector; the same tree always gives the same findings.
 */
export function lintFloor(
  tree: FloorTree,
  space?: FloorSpace,
  overrides: Partial<FloorConfig> = {},
): FloorFinding[] {
  const config = floorConfigWith(overrides);
  const out: FloorFinding[] = [];
  let lit = 0;
  walk(tree.root, (n, parent) => {
    const p = n.piece;
    if (!p) return;
    if (p.lit) lit += 1;
    if (p.fit.interactive && p.fit.min.h < config.touchMin) {
      out.push({
        rule: 'target-size',
        severity: 'error',
        id: p.id,
        message: `${p.label} is ${p.fit.min.h} tall; a finger needs ${config.touchMin}`,
      });
    }
    for (const part of p.parts ?? []) {
      if (part.interactive && (part.height ?? config.touchMin) < config.touchMin) {
        out.push({
          rule: 'target-size',
          severity: 'error',
          id: p.id,
          message: `A ${part.kind} in ${p.label} takes a finger but is ${part.height} tall`,
        });
      }
      if (part.kind === 'tooltip' && part.carriesNeededWords) {
        out.push({
          rule: 'tooltip-words',
          severity: 'error',
          id: p.id,
          message: `${p.label} keeps needed words only in a tooltip`,
        });
      }
      if (
        (part.kind === 'emoji' || part.kind === 'picture') &&
        part.carriesNeededWords &&
        !part.spoken
      ) {
        out.push({
          rule: 'unnamed-part',
          severity: 'error',
          id: p.id,
          message: `A meaningful ${part.kind} in ${p.label} has no spoken name`,
        });
      }
    }
    if (p.task) {
      const hidden = parent?.pattern ? PATTERNS[parent.pattern].hidesPastFirst : false;
      if (n.placement === 'folded' || hidden) {
        out.push({
          rule: 'task-hidden',
          severity: 'error',
          id: p.id,
          message: `${p.label} is a task but lives only ${n.placement === 'folded' ? 'behind See all' : `in a ${parent?.pattern}`}`,
        });
      }
    }
  });
  if (lit > 1) {
    out.push({
      rule: 'one-lit',
      severity: 'error',
      id: tree.room,
      message: `${lit} pieces are lit; one at most`,
    });
  }
  if (tree.totalCost.views > tree.budget) {
    out.push({
      rule: 'over-budget',
      severity: 'warning',
      id: tree.room,
      message: `${tree.totalCost.views} views against a budget of ${tree.budget}`,
    });
  }
  if (space?.keyboard && tree.root.footprint.h < config.touchMin * 2) {
    out.push({
      rule: 'focus-covered',
      severity: 'error',
      id: tree.room,
      message: `With the keyboard up only ${Math.round(tree.root.footprint.h)} is left; the focused field may be covered`,
    });
  }
  return out;
}

/** The floor tree as plain lines, for snapshots and the lab screen. */
export function printFloor(tree: FloorTree): string {
  const lines: string[] = [
    `${tree.room}: ${tree.widthClass} ${tree.orientation}, ${tree.tier}, cost ${tree.totalCost.views}/${tree.budget}`,
  ];
  if (tree.chrome.hidden.length > 0) lines.push(`  gave way: ${tree.chrome.hidden.join(', ')}`);
  walk(tree.root, (n) => {
    if (n.level === 'floor') return;
    const depth = { area: 1, group: 2, piece: 3, part: 4, screen: 0, floor: 0 }[n.level];
    const pattern = n.pattern ? ` [${n.pattern}]` : '';
    const where = n.placement === 'first-screen' ? '' : ` (${n.placement})`;
    lines.push(
      `${'  '.repeat(depth)}${n.label}${pattern} ${Math.round(n.footprint.h)}h w${n.weight}${where}`,
    );
  });
  return lines.join('\n');
}
