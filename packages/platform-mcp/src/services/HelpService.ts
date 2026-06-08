import fs from 'node:fs';
import path from 'node:path';
import { ROOT_DIR } from '../utils/constants.js';

/**
 * --- Standardized Knowledge Layer ---
 * Manages documentation, philosophy, and tool inventory for the MCP.
 */
export class HelpService {
  private getDocContent(fileName: string, fallbackTitle: string) {
    const docPath = path.join(ROOT_DIR, 'packages', 'platform-mcp', 'docs', fileName);
    if (fs.existsSync(docPath)) {
      return fs.readFileSync(docPath, 'utf-8');
    }
    return `# ${fallbackTitle}\n\nDocumentation file missing.`;
  }

  private getPhilosophyContent() {
    return this.getDocContent('mcp-philosophy.md', 'MCP Philosophy');
  }

  private getRunbyteContent() {
    return this.getDocContent('runbyte-integration.md', 'Runbyte Integration Guide');
  }

  handleGetHelpOverview() {
    const overview = `
# Polymath Platform MCP: Sovereign Support Service

Welcome to the **Sovereign Support Service**. This is the primary asset for engineering agents working within the Polymath ecosystem. It is designed to be the "best place for work" by providing orchestrated intelligence, automated healing, and high-performance tools.

## The Gateway Pattern
This server uses a **Gateway Pattern** to organize a massive set of specialized tools while staying within model context limits.

## The Four Core Gateways
Access all functionality through these four primary entry points:

1. **sovereign_audit**: Hygiene, architecture, compliance, and quality checks.
2. **sovereign_discovery**: Search, intelligence, scouting, and code statistics.
3. **sovereign_maintenance**: Refactoring, healing, imports normalization, and git checkpoints.
4. **sovereign_guide**: Philosophy, orientation, tool inventory, and integration guidance.

## 🌟 The Shiny Toolchain
We integrate industry-leading Rust-based tools for extreme performance:
- **Ripgrep (grep)**: 100x faster content search.
- **fd (find)**: Intuitive filename discovery.
- **bat (view)**: Syntax-highlighted, Git-aware file viewing.
- **tokei (stats)**: Instant LOC and language analysis.
- **dust (disk_usage)**: Visual disk usage analysis.
- **typos (spellcheck)**: Source code spell checking.

## Quick Access
- Run \`sovereign_guide(action: 'inventory')\` to see the full list of specialized actions.
- Run \`sovereign_guide(action: 'architecture')\` to learn about the Gateway design.
- Run \`sovereign_guide(action: 'philosophy')\` to understand our Sovereign Engineering goals.

---
**Tip for Agents:** Always start your task by scouting the territory with \`sovereign_discovery(action: 'scout')\`.
    `;
    return { content: [{ type: 'text' as const, text: overview }] };
  }

  handleGetArchitectureDoc() {
    const doc = `
# Polymath MCP Architecture: The Gateway Pattern

## The Challenge: The 100-Tool Limit
Most LLM interfaces have a practical limit for the number of tools a single MCP server can expose. Once you exceed this:
1. Performance degrades as prompt context grows.
2. The model gets confused by subtle differences between many similar tools.
3. Adding new tools forces painful tradeoffs.

## The Solution: The Sovereign Gateway
Instead of exposing a large set of individual tools, we use **Gateways**. Each gateway is a single tool that takes an \`action\` parameter. This turns the MCP into a **Support Service** that orchestrates complex workflows.

### Current Gateways
- **sovereign_audit**: Quality, hygiene, and compliance checks.
- **sovereign_discovery**: Search, intelligence, and scouting.
- **sovereign_maintenance**: Refactoring, healing, and synchronization.
- **sovereign_guide**: Help, docs, and orientation.

## Adding New Tools
1. **Don't** add a new top-level tool in \`ListToolsRequestSchema\` unless it is a genuinely new domain.
2. **Do** add a new \`action\` to the relevant service.
3. **Do** register the routing in the \`CallToolRequestSchema\` handler in \`index.ts\`.

## Optional Runbyte Layer
If you want token-efficient orchestration across multiple MCP servers, place Runbyte **in front of** this server. See \`sovereign_guide(action: 'runbyte')\` for the supported pattern.
    `;
    return { content: [{ type: 'text' as const, text: doc }] };
  }

  handleGetToolInventory() {
    const inventory = `
# Master Tool Index

## Primary Commands
| Tool | Function |
| :--- | :--- |
| **help** | Get a high-level overview of the Sovereign Support Service. |
| **info** | Get detailed architectural background and philosophy. |

## Discovery Gateway (\`sovereign_discovery\`)
| Action | Legacy Name | Function |
| :--- | :--- | :--- |
| **grep** | \`grep_code\` | High-speed text search using ripgrep. |
| **scout** | \`sovereign_scout\` | Orchestrated dossier combining files, docs, and code heatmap. |
| **docs** | \`search_docs\` | Specialized search for markdown and internal guides. |
| **inventory** | \`get_inventory\` | Tree-view of files and packages. |
| **view** | \`shiny_view\` | Syntax-highlighted file viewing using bat. |
| **find** | \`shiny_find\` | Fast filename search using fd. |
| **lens** | [NEW] | Matrix-style visualization of boundaries (Skeleton) and Technical Debt. |
| **simulate** | [NEW] | Forecasts the blast radius and "ripple" of a code change. |
| **structural** | \`structural_search\` | Semantic pattern matching. |
| **stats** | \`shiny_stats\` | LOC and language statistics using tokei. |
| **spellcheck** | \`shiny_spellcheck\` | Source code spell checker using typos. |
| **disk_usage** | \`shiny_disk_usage\` | Visualizes directory size using dust. |
| **component_api** | \`get_component_api\` | Extracts Props/API for a React component. |
| **imports** | \`audit_imports\` | Detects dependency leaks. |
| **ui_report** | \`audit_ui_components\` | Full component API docs for @repo/ui. |
| **native_leaks** | \`find_native_leaks\` | Detects RN primitives in web-only shells. |
| **metro_debug** | \`debug_metro\` | Debugs Metro ID resolution. |
| **jina** | [NEW] | Free web-to-markdown ingestion using Jina AI Reader. |
| **impact** | \`trace_deletion_impact\` | Traces impact of symbol deletion. |

## Audit Gateway (\`sovereign_audit\`)
| Action | Legacy Name | Function |
| :--- | :--- | :--- |
| **hygiene** | \`audit_monorepo_hygiene\` | Circular deps, unused code, and boundary checks. |
| **legacy_ui** | \`audit_legacy_ui\` | Detects Gluestack and RN usage in Zero-Legacy areas. |
| **architecture** | \`audit_package_architecture\` | Checks platform agnosticism and integrity. |
| **a11y** | \`audit_accessibility\` | Targeted accessibility linting. |
| **dependency_health** | \`audit_dependency_health\` | Combined SDK compatibility and health report. |
| **i18n** | \`audit_i18n\` | Key coverage and fallback policy compliance. |
| **colors** | \`check_contrast\` | WCAG and APCA contrast calculations. |
| **features** | \`audit_feature_fidelity\` | Gap analysis between docs and implementation. |
| **exports** | \`audit_export_integrity\` | Barrel export and deep-import violation detection. |
| **lint** | \`lint_package\` | High-speed Biome linting for packages. |
| **check** | \`format:fix\` | Primary Biome check/format/fix tool. |
| **syncpack_fix** | \`maintenance:fix\` | Fixes package.json version mismatches monorepo-wide. |
| **types** | \`check_package_types\` | Targeted TypeScript audits. |
| **hooks** | [NEW] | Hook hygiene and policy checks (React Compiler prep). |
| **deprecations** | [NEW] | Audits for React 19, RN 0.83, and Expo 55 deprecations. |
| **memory_sinks** | [NEW] | Detects leaks (setInterval/addEventListener without cleanup). |
| **cognitive_load**| [NEW] | Measures "God Files" and refactoring priority based on complexity. |

## Maintenance Gateway (\`sovereign_maintenance\`)
| Action | Legacy Name | Function |
| :--- | :--- | :--- |
| **heal** | \`heal_codebase\` | Repairs JSX and TS syntax corruption. |
| **sync** | \`sync_identity_schema\` | Aligns DB profiles with identity schemas. |
| **checkpoint** | \`create_checkpoint\` | Atomic git commit with smart ledger categorization. |
| **refactor** | \`shiny_refactor\` | Project-wide find and replace using sd. |
| **normalize** | \`normalize_imports\` | Relative-to-workspace alias transformation. |
| **heal_architecture** | [NEW] | Resolves root-to-subpath import violations. |
| **scaffold** | \`scaffold_feature_context\` | Intelligence scout for feature keywords. |
| **runbyte_config** | [NEW] | Generates a ready-to-use Runbyte configuration. |

## Guide Gateway (\`sovereign_guide\`)
| Action | Function |
| :--- | :--- |
| **architecture** | Explains the 100-tool limit and Gateway Pattern. |
| **inventory** | Returns the action inventory. |
| **philosophy** | Deep dive into Sovereign Engineering goals. |
| **soul** | Returns the Project Soul Ledger (metaphors & non-negotiables). |
| **mistakes** | Returns the Mistake Ledger (architectural dead-ends & learnings). |
| **refusal** | Returns the Senior Refusal Protocol (rules for saying "No"). |
| **recent_evolutions** | Summary of the latest God Mode tools added in this session. |
| **runbyte** | Integration guidance for Runbyte. |
    `;
    return { content: [{ type: 'text' as const, text: inventory }] };
  }

  handleGetPhilosophy() {
    return {
      content: [{ type: 'text' as const, text: this.getPhilosophyContent() }],
    };
  }

  handleGetSoul() {
    return {
      content: [
        {
          type: 'text' as const,
          text: this.getDocContent('project-soul.md', 'Project Soul Ledger'),
        },
      ],
    };
  }

  handleGetRunbyteGuide() {
    return {
      content: [{ type: 'text' as const, text: this.getRunbyteContent() }],
    };
  }

  handleGetRecentEvolutions() {
    const content = `
# Recent Evolutions: The Sovereign Upgrade (May 2026)

This session focused on evolving the Polymath Platform MCP into an **Absolute God Mode** support service, bridging the gap between raw tools and senior architectural oversight.

## 🏛️ New Architectural Lenses
We've added "X-Ray Vision" for the monorepo:
- **Debt Lens**: Identifies "God Files" and high-complexity "Scar Tissue" based on TODO density and SLOC.
- **Skeleton Lens**: Visualizes monorepo boundaries and flags **Headless Core** violations (illegal imports from UI).
- *Action*: \`sovereign_discovery(action: 'lens')\`

## ☢️ Impact Simulation (Blast Radius)
Before changing a "Project Pillar" component (like \`Button\` or \`Tag\`), you can now forecast the ripple effect across all 40+ packages.
- Uses high-speed \`git grep\` to trace recursive usage.
- Categorizes impact by domain and generates Mermaid visualizations.
- **Strategic Scenarios**: Automatically presents multiple remediation paths (Tactical Patch vs. Sovereign Refactor) for systemic changes.
- *Action*: \`sovereign_discovery(action: 'simulate', params: { symbol: 'ComponentName' })\`

## 🛡️ Performance & Hygiene Sentinels
Respecting the constraints of memory, network, and human cognitive load:
- **Memory Sinks**: Detects event listener and interval leaks.
- **Cognitive Load**: Measures per-file complexity to prioritize refactoring.
- **Deprecation Auditor**: Prepares the codebase for React 19 and Expo 55.
- *Action*: \`sovereign_audit(action: 'memory_sinks' | 'cognitive_load' | 'deprecations')\`

## ✨ Philosophical Anchoring (Project Soul)
We established the **Project Soul Ledger**, ensuring every agent understands the "Why" behind the "How" (e.g., The Sanctuary metaphor vs. The Factory).
- *Action*: \`sovereign_guide(action: 'soul')\`

## 🛡️ Senior Refusal Protocol
Logic and guidance for agents to protect the architecture by refusing "dirty" changes.
- *Action*: \`sovereign_guide(action: 'refusal')\`

## 📓 Mistake Ledger
A persistent record of architectural dead-ends to prevent recursive failures.
- *Action*: \`sovereign_guide(action: 'mistakes')\`

---
*Status: Phase 1-4 Core Foundation is now LIVE.*
    `;
    return { content: [{ type: 'text' as const, text: content }] };
  }

  handleGetMistakeLedger() {
    return {
      content: [
        {
          type: 'text' as const,
          text: this.getDocContent('mistake-ledger.md', 'Mistake Ledger'),
        },
      ],
    };
  }

  handleGetSeniorRefusal() {
    return {
      content: [
        {
          type: 'text' as const,
          text: this.getDocContent('senior-refusal-protocol.md', 'Senior Refusal Protocol'),
        },
      ],
    };
  }
}
