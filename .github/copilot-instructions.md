---
title: "Unified Developer Copilot Instructions"
status: "active"
created: 2026-05-31
updated: 2026-08-24
author: "Naveen"
scribe: "opencode"
tags: [.github, generated]
---

# Unified Developer Copilot Instructions

Generated automatically by the Polymath Platform Gateway. Do not edit directly.


<!-- START SYSTEM RULES (.cursorrules) -->

# AI Agent Rules for Polymath Platform

You are a **System 2** AI Coding Agent. Your goal is not speed, but **Ecosystem Resonance**.

## Mandatory Context
Before performing any task, you **MUST** read the following files:
1. `apps/gurudevi-mobile/docs/docs-sop.md`: The official documentation rules and standard.
2. `apps/gurudevi-mobile/docs/INDEX.md`: The index of all active guides, audits, and progress trackers.

## Persona & Behavior
- **Slow Down**: Do not rush to provide code. Spend 50% of your effort on analysis and reflection.
- **Topological Awareness**: Every change is a kernel. Before editing an app in `apps/`, check if the logic belongs in a shared package in `packages/`.
- **Reparative First**: If you see "Aesthetic Decay" (hardcoded colors, magic numbers) or "Structural Weakness" while working, propose a fix for the underlying issue before completing the requested task.
- **Verification**: Always suggest running `pnpm check-types` after logic changes to ensure monorepo-wide integrity.

## Architecture Cheat Sheet
- **Package Manager**: pnpm
- **Monorepo Tool**: Turbo
- **Operational Engine**: `apps/gurudevi-mobile` (Expo/React Native)
- **Shared Brain**: `packages/*` (Logic should live here under the "Library First" protocol).

## Aesthetic Standards
- Follow the **Glass Protocol** (translucency, blur) and **Breath-like Motion** defined in `TAIL_FIN.md`.
- No hex codes. Use theme tokens from `@repo/ui`.

## Command Line Discipline (STRICT)
- **PNPM ONLY**: You are FORBIDDEN from using `npm` or `npx`.
- Use `pnpm` for all logic/dependency changes.
- Use `pnpm exec` instead of `npx`.
- Use `pnpm dlx` for one-off tool executions.
- **BIOME SCOPING**: You are FORBIDDEN from running workspace-wide formatting/checking (e.g. `biome check --write .` or `pnpm run format:fix`). You MUST scope Biome checks/fixes specifically to the changed files (e.g., `biome check --write file1.ts file2.ts`).
- Reason: Global commands introduce huge unwanted modifications across unrelated packages in the monorepo.

## Documentation SOP Enforcement (STRICT)
Whenever you create or modify any documentation (`.md` files), you **MUST** strictly follow `apps/gurudevi-mobile/docs/docs-sop.md`:
- **App Isolation**: Place app-specific files under their respective app directory (e.g. `apps/gurudevi-mobile/docs/`). Use root `docs/` only for global repository-wide playbooks/configurations.
- **Mandatory YAML Frontmatter**: Start every `.md` file with a YAML block containing `title`, `status` ("active" | "draft" | "superseded"), `created`, `updated`, and `author`.
- **Dual Naming Convention**:
  - Reference guides must use clean static kebab-case (e.g., `ui-color-doctrine.md`).
  - Point-in-time documents (audits, RFCs, ADRs, progress files) **MUST** be prefixed with their creation date `YYYY-MM-DD-title.md` (e.g., `2026-06-08-reorganization-walkthrough.md`).
- **No Obsidian Configs**: Do not commit any `.obsidian` folders.


<!-- END SYSTEM RULES -->

---

<!-- START SKILL: cloudflare-deploy -->

---
name: cloudflare-deploy
description: Deploy applications and infrastructure to Cloudflare using Workers, Pages, and related platform services. Use when the user asks to deploy, host, publish, or set up a project on Cloudflare.
---

# Cloudflare Deploy

Consolidated skill for building on the Cloudflare platform. Use decision trees below to find the right product, then load detailed references.

## Prerequisites

- When sandboxing blocks the deployment network calls, rerun with `sandbox_permissions=require_escalated`.
- The deployment might take a few minutes. Use appropriate timeout values.

## Authentication (Required Before Deploy)

Verify auth before `wrangler deploy`, `wrangler pages deploy`, or `npm run deploy`:

```bash
npx wrangler whoami    # Shows account if authenticated
```

Not authenticated? → `references/wrangler/auth.md`
- Interactive/local: `wrangler login` (one-time OAuth)
- CI/CD: Set `CLOUDFLARE_API_TOKEN` env var

## Quick Decision Trees

### "I need to run code"

```
Need to run code?
├─ Serverless functions at the edge → workers/
├─ Full-stack web app with Git deploys → pages/
├─ Stateful coordination/real-time → durable-objects/
├─ Long-running multi-step jobs → workflows/
├─ Run containers → containers/
├─ Multi-tenant (customers deploy code) → workers-for-platforms/
├─ Scheduled tasks (cron) → cron-triggers/
├─ Lightweight edge logic (modify HTTP) → snippets/
├─ Process Worker execution events (logs/observability) → tail-workers/
└─ Optimize latency to backend infrastructure → smart-placement/
```

### "I need to store data"

```
Need storage?
├─ Key-value (config, sessions, cache) → kv/
├─ Relational SQL → d1/ (SQLite) or hyperdrive/ (existing Postgres/MySQL)
├─ Object/file storage (S3-compatible) → r2/
├─ Message queue (async processing) → queues/
├─ Vector embeddings (AI/semantic search) → vectorize/
├─ Strongly-consistent per-entity state → durable-objects/ (DO storage)
├─ Secrets management → secrets-store/
├─ Streaming ETL to R2 → pipelines/
└─ Persistent cache (long-term retention) → cache-reserve/
```

### "I need AI/ML"

```
Need AI?
├─ Run inference (LLMs, embeddings, images) → workers-ai/
├─ Vector database for RAG/search → vectorize/
├─ Build stateful AI agents → agents-sdk/
├─ Gateway for any AI provider (caching, routing) → ai-gateway/
└─ AI-powered search widget → ai-search/
```

### "I need networking/connectivity"

```
Need networking?
├─ Expose local service to internet → tunnel/
├─ TCP/UDP proxy (non-HTTP) → spectrum/
├─ WebRTC TURN server → turn/
├─ Private network connectivity → network-interconnect/
├─ Optimize routing → argo-smart-routing/
├─ Optimize latency to backend (not user) → smart-placement/
└─ Real-time video/audio → realtimekit/ or realtime-sfu/
```

### "I need security"

```
Need security?
├─ Web Application Firewall → waf/
├─ DDoS protection → ddos/
├─ Bot detection/management → bot-management/
├─ API protection → api-shield/
├─ CAPTCHA alternative → turnstile/
└─ Credential leak detection → waf/ (managed ruleset)
```

### "I need media/content"

```
Need media?
├─ Image optimization/transformation → images/
├─ Video streaming/encoding → stream/
├─ Browser automation/screenshots → browser-rendering/
└─ Third-party script management → zaraz/
```

### "I need infrastructure-as-code"

```
Need IaC? → pulumi/ (Pulumi), terraform/ (Terraform), or api/ (REST API)
```

## Product Index

### Compute & Runtime
| Product | Reference |
|---------|-----------|
| Workers | `references/workers/` |
| Pages | `references/pages/` |
| Pages Functions | `references/pages-functions/` |
| Durable Objects | `references/durable-objects/` |
| Workflows | `references/workflows/` |
| Containers | `references/containers/` |
| Workers for Platforms | `references/workers-for-platforms/` |
| Cron Triggers | `references/cron-triggers/` |
| Tail Workers | `references/tail-workers/` |
| Snippets | `references/snippets/` |
| Smart Placement | `references/smart-placement/` |

### Storage & Data
| Product | Reference |
|---------|-----------|
| KV | `references/kv/` |
| D1 | `references/d1/` |
| R2 | `references/r2/` |
| Queues | `references/queues/` |
| Hyperdrive | `references/hyperdrive/` |
| DO Storage | `references/do-storage/` |
| Secrets Store | `references/secrets-store/` |
| Pipelines | `references/pipelines/` |
| R2 Data Catalog | `references/r2-data-catalog/` |
| R2 SQL | `references/r2-sql/` |

### AI & Machine Learning
| Product | Reference |
|---------|-----------|
| Workers AI | `references/workers-ai/` |
| Vectorize | `references/vectorize/` |
| Agents SDK | `references/agents-sdk/` |
| AI Gateway | `references/ai-gateway/` |
| AI Search | `references/ai-search/` |

### Networking & Connectivity
| Product | Reference |
|---------|-----------|
| Tunnel | `references/tunnel/` |
| Spectrum | `references/spectrum/` |
| TURN | `references/turn/` |
| Network Interconnect | `references/network-interconnect/` |
| Argo Smart Routing | `references/argo-smart-routing/` |
| Workers VPC | `references/workers-vpc/` |

### Security
| Product | Reference |
|---------|-----------|
| WAF | `references/waf/` |
| DDoS Protection | `references/ddos/` |
| Bot Management | `references/bot-management/` |
| API Shield | `references/api-shield/` |
| Turnstile | `references/turnstile/` |

### Media & Content
| Product | Reference |
|---------|-----------|
| Images | `references/images/` |
| Stream | `references/stream/` |
| Browser Rendering | `references/browser-rendering/` |
| Zaraz | `references/zaraz/` |

### Real-Time Communication
| Product | Reference |
|---------|-----------|
| RealtimeKit | `references/realtimekit/` |
| Realtime SFU | `references/realtime-sfu/` |

### Developer Tools
| Product | Reference |
|---------|-----------|
| Wrangler | `references/wrangler/` |
| Miniflare | `references/miniflare/` |
| C3 | `references/c3/` |
| Observability | `references/observability/` |
| Analytics Engine | `references/analytics-engine/` |
| Web Analytics | `references/web-analytics/` |
| Sandbox | `references/sandbox/` |
| Workerd | `references/workerd/` |
| Workers Playground | `references/workers-playground/` |

### Infrastructure as Code
| Product | Reference |
|---------|-----------|
| Pulumi | `references/pulumi/` |
| Terraform | `references/terraform/` |
| API | `references/api/` |

### Other Services
| Product | Reference |
|---------|-----------|
| Email Routing | `references/email-routing/` |
| Email Workers | `references/email-workers/` |
| Static Assets | `references/static-assets/` |
| Bindings | `references/bindings/` |
| Cache Reserve | `references/cache-reserve/` |

## Troubleshooting

### Escalated Network Access

If deployment fails due to network issues (timeouts, DNS errors, connection resets), rerun the deploy with escalated permissions (use `sandbox_permissions=require_escalated`). The deploy requires escalated network access when sandbox networking blocks outbound requests.

Example guidance to the user:

```
The deploy needs escalated network access to deploy to Cloudflare. I can rerun the command with escalated permissions—want me to proceed?
```


<!-- END SKILL: cloudflare-deploy -->

<!-- START SKILL: doc -->

---
name: "doc"
description: "Use when the task involves reading, creating, or editing `.docx` documents, especially when formatting or layout fidelity matters; prefer `python-docx` plus the bundled `scripts/render_docx.py` for visual checks."
---


# DOCX Skill

## When to use
- Read or review DOCX content where layout matters (tables, diagrams, pagination).
- Create or edit DOCX files with professional formatting.
- Validate visual layout before delivery.

## Workflow
1. Prefer visual review (layout, tables, diagrams).
   - If `soffice` and `pdftoppm` are available, convert DOCX -> PDF -> PNGs.
   - Or use `scripts/render_docx.py` (requires `pdf2image` and Poppler).
   - If these tools are missing, install them or ask the user to review rendered pages locally.
2. Use `python-docx` for edits and structured creation (headings, styles, tables, lists).
3. After each meaningful change, re-render and inspect the pages.
4. If visual review is not possible, extract text with `python-docx` as a fallback and call out layout risk.
5. Keep intermediate outputs organized and clean up after final approval.

## Temp and output conventions
- Use `tmp/docs/` for intermediate files; delete when done.
- Write final artifacts under `output/doc/` when working in this repo.
- Keep filenames stable and descriptive.

## Dependencies (install if missing)
Prefer `uv` for dependency management.

Python packages:
```
uv pip install python-docx pdf2image
```
If `uv` is unavailable:
```
python3 -m pip install python-docx pdf2image
```
System tools (for rendering):
```
# macOS (Homebrew)
brew install libreoffice poppler

# Ubuntu/Debian
sudo apt-get install -y libreoffice poppler-utils
```

If installation isn't possible in this environment, tell the user which dependency is missing and how to install it locally.

## Environment
No required environment variables.

## Rendering commands
DOCX -> PDF:
```
soffice -env:UserInstallation=file:///tmp/lo_profile_$$ --headless --convert-to pdf --outdir $OUTDIR $INPUT_DOCX
```

PDF -> PNGs:
```
pdftoppm -png $OUTDIR/$BASENAME.pdf $OUTDIR/$BASENAME
```

Bundled helper:
```
python3 scripts/render_docx.py /path/to/file.docx --output_dir /tmp/docx_pages
```

## Quality expectations
- Deliver a client-ready document: consistent typography, spacing, margins, and clear hierarchy.
- Avoid formatting defects: clipped/overlapping text, broken tables, unreadable characters, or default-template styling.
- Charts, tables, and visuals must be legible in rendered pages with correct alignment.
- Use ASCII hyphens only. Avoid U+2011 (non-breaking hyphen) and other Unicode dashes.
- Citations and references must be human-readable; never leave tool tokens or placeholder strings.

## Final checks
- Re-render and inspect every page at 100% zoom before final delivery.
- Fix any spacing, alignment, or pagination issues and repeat the render loop.
- Confirm there are no leftovers (temp files, duplicate renders) unless the user asks to keep them.


<!-- END SKILL: doc -->

<!-- START SKILL: expo-rn-expert -->

# Expo & React Native Engineering Playbook (expo-rn-expert)

Authoritative engineering guidelines for building cross-platform React Native (web and mobile) applications with Expo SDK 56 and Expo Router.

---

## 1. Core Architecture & Standards

### A. Modern TypeScript & Type Safety
*   **Strict Mode**: Avoid the use of `any` types. If a type is unknown or complex, define custom interfaces, types, or use generics.
*   **Imports**: Prefer absolute path aliasing via `tsconfig.json` imports (e.g. `@repo/ui/*` or `@/components/*`) to preserve refactorability.
*   **Component Structure**: Always use functional components with explicitly typed props (`React.FC<Props>` or inline destructured types).

---

## 2. Navigation with Expo Router

*   **File-Based Conventions**: Adhere strictly to the `app/` folder routing layout rules:
    *   Shared layout primitives must reside in `_layout.tsx` wrappers.
    *   Route targets should use clean, semantic naming (e.g., `app/(auth)/login.tsx`).
*   **Link Primitives**: Utilize `<Link>` from `expo-router` instead of manual programmatic navigation hooks where possible, to enable declarative, type-safe path transitions.
*   **Query Parameters**: Define clean, validated typings for search params using Zod schemas when resolving deep-link inputs.

---

## 3. Universal Layouts & Viewport Scrolling

To eliminate viewport cutoffs and frozen scrolls on high-performance web/mobile layouts (specifically high-constrained web browsers), adhere to the following adaptive viewport layout rules:

### A. The Flexible Scrolling Principle
> [!IMPORTANT]
> Never lock layout heights in complex component shells. Avoid hardcoded `flex: 1` heights that prevent content from expanding naturally.

*   **AdaptiveScrollContainer**: Wrap scrolling lists in robust adaptive boxes using:
    ```tsx
    import { ScrollView, StyleSheet } from 'react-native';
    
    // Always supply explicit content container styles instead of top-level container styles
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {children}
    </ScrollView>
    ```
*   **Web Overrides**: For web-targeted builds, utilize CSS overrides to neutralize rigid viewport constraints and restore natural HTML document scrolling:
    ```css
    html, body, #root {
      height: auto;
      min-height: 100%;
      overflow-y: auto;
    }
    ```

---

## 4. Performance & Resource Loading

*   **Asset Preloading**: Pre-fetch all visual assets (icons, fonts, images) inside the Root Layout wrapper before releasing the native Splash Screen (`expo-splash-screen`).
*   **List Rendering**: Always implement `FlashList` from `@shopify/flash-list` rather than standard `FlatList` for long-scroll interfaces to guarantee 60fps item recycle performance on lower-tier Android and iOS mobile hardware.
*   **Inline Functions**: Prevent inline JSX arrow functions or inline object declarations inside render blocks to avoid triggering redundant garbage collection sweeps.


<!-- END SKILL: expo-rn-expert -->

<!-- START SKILL: figma -->

---
name: figma
description: Use the Figma MCP server to fetch design context, screenshots, variables, and assets from Figma, and to translate Figma nodes into production code. Trigger when a task involves Figma URLs, node IDs, design-to-code implementation, or Figma MCP setup and troubleshooting.
---

# Figma MCP

Use the Figma MCP server for Figma-driven implementation. For setup and debugging details (env vars, config, verification), see `references/figma-mcp-config.md`.

## Figma MCP Integration Rules
These rules define how to translate Figma inputs into code for this project and must be followed for every Figma-driven change.

### Required flow (do not skip)
1. Run get_design_context first to fetch the structured representation for the exact node(s).
2. If the response is too large or truncated, run get_metadata to get the high-level node map and then re-fetch only the required node(s) with get_design_context.
3. Run get_screenshot for a visual reference of the node variant being implemented.
4. Only after you have both get_design_context and get_screenshot, download any assets needed and start implementation.
5. Translate the output (usually React + Tailwind) into this project's conventions, styles and framework. Reuse the project's color tokens, components, and typography wherever possible.
6. Validate against Figma for 1:1 look and behavior before marking complete.

### Implementation rules
- Treat the Figma MCP output (React + Tailwind) as a representation of design and behavior, not as final code style.
- Replace Tailwind utility classes with the project's preferred utilities/design-system tokens when applicable.
- Reuse existing components (e.g., buttons, inputs, typography, icon wrappers) instead of duplicating functionality.
- Use the project's color system, typography scale, and spacing tokens consistently.
- Respect existing routing, state management, and data-fetch patterns already adopted in the repo.
- Strive for 1:1 visual parity with the Figma design. When conflicts arise, prefer design-system tokens and adjust spacing or sizes minimally to match visuals.
- Validate the final UI against the Figma screenshot for both look and behavior.

### Asset handling
- The Figma MCP Server provides an assets endpoint which can serve image and SVG assets.
- IMPORTANT: If the Figma MCP Server returns a localhost source for an image or an SVG, use that image or SVG source directly.
- IMPORTANT: DO NOT import/add new icon packages, all the assets should be in the Figma payload.
- IMPORTANT: do NOT use or create placeholders if a localhost source is provided.

### Link-based prompting
- The server is link-based: copy the Figma frame/layer link and give that URL to the MCP client when asking for implementation help.
- The client cannot browse the URL but extracts the node ID from the link; always ensure the link points to the exact node/variant you want.

## References
- `references/figma-mcp-config.md` — setup, verification, troubleshooting, and link-based usage reminders.
- `references/figma-tools-and-prompts.md` — tool catalog and prompt patterns for selecting frameworks/components and fetching metadata.


<!-- END SKILL: figma -->

<!-- START SKILL: figma-code-connect-components -->

---
name: figma-code-connect-components
description: Connects Figma design components to code components using Code Connect mapping tools. Use when user says "code connect", "connect this component to code", "map this component", "link component to code", "create code connect mapping", or wants to establish mappings between Figma designs and code implementations. For canvas writes via `use_figma`, use `figma-use`.
---

# Code Connect Components

## Overview

This skill helps you connect Figma design components to their corresponding code implementations using Figma's Code Connect feature. It analyzes the Figma design structure, searches your codebase for matching components, and establishes mappings that maintain design-code consistency.

## Skill Boundaries

- Use this skill for `get_code_connect_suggestions` + `send_code_connect_mappings` workflows.
- If the task requires writing to the Figma canvas with Plugin API scripts, switch to [figma-use](../figma-use/SKILL.md).
- If the task is building or updating a full-page screen in Figma from code or a description, switch to [figma-generate-design](../figma-generate-design/SKILL.md).
- If the task is implementing product code from Figma, switch to [figma-implement-design](../figma-implement-design/SKILL.md).

## Prerequisites

- Figma MCP server must be connected and accessible
- User must provide a Figma URL with node ID: `https://figma.com/design/:fileKey/:fileName?node-id=1-2`
  - **IMPORTANT:** The Figma URL must include the `node-id` parameter. Code Connect mapping will fail without it.
- **OR** when using `figma-desktop` MCP: User can select a node directly in the Figma desktop app (no URL required)
- **IMPORTANT:** The Figma component must be published to a team library. Code Connect only works with published components or component sets.
- **IMPORTANT:** Code Connect is only available on Organization and Enterprise plans.
- Access to the project codebase for component scanning

## Required Workflow

**Follow these steps in order. Do not skip steps.**

### Step 1: Get Code Connect Suggestions

Call `get_code_connect_suggestions` to identify all unmapped components in a single operation. This tool automatically:

- Fetches component info from the Figma scenegraph
- Identifies published components in the selection
- Checks existing Code Connect mappings and filters out already-connected components
- Returns component names, properties, and thumbnail images for each unmapped component

#### Option A: Using `figma-desktop` MCP (no URL provided)

If the `figma-desktop` MCP server is connected and the user has NOT provided a Figma URL, immediately call `get_code_connect_suggestions`. No URL parsing is needed — the desktop MCP server automatically uses the currently selected node from the open Figma file.

**Note:** The user must have the Figma desktop app open with a node selected. `fileKey` is not passed as a parameter — the server uses the currently open file.

#### Option B: When a Figma URL is provided

Parse the URL to extract `fileKey` and `nodeId`, then call `get_code_connect_suggestions`.

**IMPORTANT:** When extracting the node ID from a Figma URL, convert the format:

- URL format uses hyphens: `node-id=1-2`
- Tool expects colons: `nodeId=1:2`

**Parse the Figma URL:**

- URL format: `https://figma.com/design/:fileKey/:fileName?node-id=1-2`
- Extract file key: `:fileKey` (segment after `/design/`)
- Extract node ID: `1-2` from URL, then convert to `1:2` for the tool

```
get_code_connect_suggestions(fileKey=":fileKey", nodeId="1:2")
```

**Handle the response:**

- If the tool returns **"No published components found in this selection"** → inform the user and stop. The components may need to be published to a team library first.
- If the tool returns **"All component instances in this selection are already connected to code via Code Connect"** → inform the user that everything is already mapped.
- Otherwise, the response contains a list of unmapped components, each with:
  - Component name
  - Node ID
  - Component properties (JSON with prop names and values)
  - A thumbnail image of the component (for visual inspection)

### Step 2: Scan Codebase for Matching Components

For each unmapped component returned by `get_code_connect_suggestions`, search the codebase for a matching code component.

**What to look for:**

- Component names that match or are similar to the Figma component name
- Component structure that aligns with the Figma hierarchy
- Props that correspond to Figma properties (variants, text, styles)
- Files in typical component directories (`src/components/`, `components/`, `ui/`, etc.)

**Search strategy:**

1. Search for component files with matching names
2. Read candidate files to check structure and props
3. Compare the code component's props with the Figma component properties returned in Step 1
4. Detect the programming language (TypeScript, JavaScript) and framework (React, Vue, etc.)
5. Identify the best match based on structural similarity, weighing:
   - Prop names and their correspondence to Figma properties
   - Default values that match Figma defaults
   - CSS classes or style objects
   - Descriptive comments that clarify intent
6. If multiple candidates are equally good, pick the one with the closest prop-interface match and document your reasoning in a 1-2 sentence comment before your tool call

**Example search patterns:**

- If Figma component is "PrimaryButton", search for `Button.tsx`, `PrimaryButton.tsx`, `Button.jsx`
- Check common component paths: `src/components/`, `app/components/`, `lib/ui/`
- Look for variant props like `variant`, `size`, `color` that match Figma variants

### Step 3: Present Matches to User

Present your findings and let the user choose which mappings to create. The user can accept all, some, or none of the suggested mappings.

**Present matches in this format:**

```
The following components match the design:
- [ComponentName](path/to/component): DesignComponentName at nodeId [nodeId](figmaUrl?node-id=X-Y)
- [AnotherComponent](path/to/another): AnotherDesign at nodeId [nodeId2](figmaUrl?node-id=X-Y)

Would you like to connect these components? You can accept all, select specific ones, or skip.
```

**If no exact match is found for a component:**

- Show the 2 closest candidates
- Explain the differences
- Ask the user to confirm which component to use or provide the correct path

**If the user declines all mappings**, inform them and stop. No further tool calls are needed.

### Step 4: Create Code Connect Mappings

Once the user confirms their selections, call `send_code_connect_mappings` with only the accepted mappings. This tool handles batch creation of all mappings in a single call.

**Example:**

```
send_code_connect_mappings(
  fileKey=":fileKey",
  nodeId="1:2",
  mappings=[
    { nodeId: "1:2", componentName: "Button", source: "src/components/Button.tsx", label: "React" },
    { nodeId: "1:5", componentName: "Card", source: "src/components/Card.tsx", label: "React" }
  ]
)
```

**Key parameters for each mapping:**

- `nodeId`: The Figma node ID (with colon format: `1:2`)
- `componentName`: Name of the component to connect (e.g., "Button", "Card")
- `source`: Path to the code component file (relative to project root)
- `label`: The framework or language label for this Code Connect mapping. Valid values include:
  - Web: 'React', 'Web Components', 'Vue', 'Svelte', 'Storybook', 'Javascript'
  - iOS: 'Swift UIKit', 'Objective-C UIKit', 'SwiftUI'
  - Android: 'Compose', 'Java', 'Kotlin', 'Android XML Layout'
  - Cross-platform: 'Flutter'
  - Docs: 'Markdown'

**After the call:**

- On success: the tool confirms the mappings were created
- On error: the tool reports which specific mappings failed and why (e.g., "Component is already mapped to code", "Published component not found", "Insufficient permissions")

**Provide a summary** after processing:

```
Code Connect Summary:
- Successfully connected: 3
  - Button (1:2) → src/components/Button.tsx
  - Card (1:5) → src/components/Card.tsx
  - Input (1:8) → src/components/Input.tsx
- Could not connect: 1
  - CustomWidget (1:10) - No matching component found in codebase
```

## Examples

### Example 1: Connecting a Button Component

User says: "Connect this Figma button to my code: https://figma.com/design/kL9xQn2VwM8pYrTb4ZcHjF/DesignSystem?node-id=42-15"

**Actions:**

1. Parse URL: fileKey=`kL9xQn2VwM8pYrTb4ZcHjF`, nodeId=`42-15` → convert to `42:15`
2. Run `get_code_connect_suggestions(fileKey="kL9xQn2VwM8pYrTb4ZcHjF", nodeId="42:15")`
3. Response shows: Button component (unmapped) with `variant` (primary/secondary) and `size` (sm/md/lg) properties, plus a thumbnail image
4. Search codebase for Button components: Find `src/components/Button.tsx`
5. Read `Button.tsx` and confirm it has `variant` and `size` props
6. Present to user:
   ```
   I found a match:
   - [Button](src/components/Button.tsx): Button at nodeId [42:15](https://figma.com/design/kL9xQn2VwM8pYrTb4ZcHjF/DesignSystem?node-id=42-15)

   Would you like to connect this component?
   ```

7. User confirms: "Yes"
8. Detect that it's a TypeScript React component
9. Run `send_code_connect_mappings(fileKey="kL9xQn2VwM8pYrTb4ZcHjF", nodeId="42:15", mappings=[{ nodeId: "42:15", componentName: "Button", source: "src/components/Button.tsx", label: "React" }])`

**Result:** Figma button component is now connected to the code Button component.

### Example 2: Multiple Components with Partial Selection

User says: "Connect components in this frame: https://figma.com/design/pR8mNv5KqXzGwY2JtCfL4D/Components?node-id=10-50"

**Actions:**

1. Parse URL: fileKey=`pR8mNv5KqXzGwY2JtCfL4D`, nodeId=`10-50` → convert to `10:50`
2. Run `get_code_connect_suggestions(fileKey="pR8mNv5KqXzGwY2JtCfL4D", nodeId="10:50")`
3. Response shows 3 unmapped components: ProductCard, Badge, and CustomWidget
4. Search codebase:
   - ProductCard: Found `src/components/ProductCard.tsx` (props match)
   - Badge: Found `src/components/Badge.tsx` (props match)
   - CustomWidget: No matching component found
5. Present to user:
   ```
   The following components match the design:
   - [ProductCard](src/components/ProductCard.tsx): ProductCard at nodeId [10:51](https://figma.com/design/pR8mNv5KqXzGwY2JtCfL4D/Components?node-id=10-51)
   - [Badge](src/components/Badge.tsx): Badge at nodeId [10:52](https://figma.com/design/pR8mNv5KqXzGwY2JtCfL4D/Components?node-id=10-52)

   I couldn't find a match for CustomWidget (10:53).

   Would you like to connect these components? You can accept all, select specific ones, or skip.
   ```

6. User: "Just connect ProductCard, skip Badge for now"
7. Run `send_code_connect_mappings(fileKey="pR8mNv5KqXzGwY2JtCfL4D", nodeId="10:50", mappings=[{ nodeId: "10:51", componentName: "ProductCard", source: "src/components/ProductCard.tsx", label: "React" }])`

**Result:** Only ProductCard is connected, per the user's selection.

### Example 3: Component Needs Creation

User says: "Connect this icon: https://figma.com/design/8yJDMeWDyBz71EnMOSuUiw/Icons?node-id=5-20"

**Actions:**

1. Parse URL: fileKey=`8yJDMeWDyBz71EnMOSuUiw`, nodeId=`5-20` → convert to `5:20`
2. Run `get_code_connect_suggestions(fileKey="8yJDMeWDyBz71EnMOSuUiw", nodeId="5:20")`
3. Response shows: CheckIcon component (unmapped) with color and size properties
4. Search codebase for CheckIcon: No matches found
5. Search for generic Icon components: Find `src/icons/` directory with other icons
6. Report to user: "I couldn't find a CheckIcon component, but I found an icons directory at src/icons/. Would you like to:
   - Create a new CheckIcon.tsx component first, then connect it
   - Connect to a different existing icon
   - Provide the path to the CheckIcon if it exists elsewhere"
7. User provides path: "src/icons/CheckIcon.tsx"
8. Detect language and framework from the file
9. Run `send_code_connect_mappings(fileKey="8yJDMeWDyBz71EnMOSuUiw", nodeId="5:20", mappings=[{ nodeId: "5:20", componentName: "CheckIcon", source: "src/icons/CheckIcon.tsx", label: "React" }])`

**Result:** CheckIcon component is successfully connected to the Figma design.

## Best Practices

### Proactive Component Discovery

Don't just ask the user for the file path — actively search their codebase to find matching components. This provides a better experience and catches potential mapping opportunities.

### Accurate Structure Matching

When comparing Figma components to code components, look beyond just names. Check that:

- Props align (variant types, size options, etc.)
- Component hierarchy matches (nested elements)
- The component serves the same purpose

### Clear Communication

When offering to create a mapping, clearly explain:

- What you found
- Why it's a good match
- What the mapping will do
- How props will be connected

### Handle Ambiguity

If multiple components could match, present options rather than guessing. Let the user make the final decision about which component to connect.

### Graceful Degradation

If you can't find an exact match, provide helpful next steps:

- Show close candidates
- Suggest component creation
- Ask for user guidance

## Common Issues and Solutions

### Issue: "No published components found in this selection"

**Cause:** The Figma component is not published to a team library. Code Connect only works with published components.
**Solution:** The user needs to publish the component to a team library in Figma:

1. In Figma, select the component or component set
2. Right-click and choose "Publish to library" or use the Team Library publish modal
3. Publish the component
4. Once published, retry the Code Connect mapping with the same node ID

### Issue: "Code Connect is only available on Organization and Enterprise plans"

**Cause:** The user's Figma plan does not include Code Connect access.
**Solution:** The user needs to upgrade to an Organization or Enterprise plan, or contact their administrator.

### Issue: No matching component found in codebase

**Cause:** The codebase search did not find a component with a matching name or structure.
**Solution:** Ask the user if the component exists under a different name or in a different location. They may need to create the component first, or it might be located in an unexpected directory.

### Issue: "Published component not found" (CODE_CONNECT_ASSET_NOT_FOUND)

**Cause:** The source file path is incorrect, the component doesn't exist at that location, or the componentName doesn't match the actual export.
**Solution:** Verify the source path is correct and relative to the project root. Check that the component is properly exported from the file with the exact componentName specified.

### Issue: "Component is already mapped to code" (CODE_CONNECT_MAPPING_ALREADY_EXISTS)

**Cause:** A Code Connect mapping already exists for this component.
**Solution:** The component is already connected. If the user wants to update the mapping, they may need to remove the existing one first in Figma.

### Issue: "Insufficient permissions to create mapping" (CODE_CONNECT_INSUFFICIENT_PERMISSIONS)

**Cause:** The user does not have edit permissions on the Figma file or library.
**Solution:** The user needs edit access to the file containing the component. Contact the file owner or team admin.

### Issue: Code Connect mapping fails with URL errors

**Cause:** The Figma URL format is incorrect or missing the `node-id` parameter.
**Solution:** Verify the URL follows the required format: `https://figma.com/design/:fileKey/:fileName?node-id=1-2`. The `node-id` parameter is required. Also ensure you convert `1-2` to `1:2` when calling tools.

### Issue: Multiple similar components found

**Cause:** The codebase contains multiple components that could match the Figma component.
**Solution:** Present all candidates to the user with their file paths and let them choose which one to connect. Different components might be used in different contexts (e.g., `Button.tsx` vs `LinkButton.tsx`).

## Understanding Code Connect

Code Connect establishes a bidirectional link between design and code:

**For designers:** See which code component implements a Figma component
**For developers:** Navigate from Figma designs directly to the code that implements them
**For teams:** Maintain a single source of truth for component mappings

The mapping you create helps keep design and code in sync by making these connections explicit and discoverable.

## Additional Resources

For more information about Code Connect:

- [Code Connect Documentation](https://help.figma.com/hc/en-us/articles/23920389749655-Code-Connect)
- [Figma MCP Server Tools and Prompts](https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/)


<!-- END SKILL: figma-code-connect-components -->

<!-- START SKILL: figma-create-design-system-rules -->

---
name: figma-create-design-system-rules
description: Generates custom design system rules for the user's codebase. Use when user says "create design system rules", "generate rules for my project", "set up design rules", "customize design system guidelines", or wants to establish project-specific conventions for Figma-to-code workflows. Requires Figma MCP server connection.
---

# Create Design System Rules

## Overview

This skill helps you generate custom design system rules tailored to your project's specific needs. These rules guide AI coding agents to produce consistent, high-quality code when implementing Figma designs, ensuring that your team's conventions, component patterns, and architectural decisions are followed automatically.

### Supported Rule Files

| Agent | Rule File |
|-------|-----------|
| Claude Code | `CLAUDE.md` |
| Codex CLI | `AGENTS.md` |
| Cursor | `.cursor/rules/figma-design-system.mdc` |

## What Are Design System Rules?

Design system rules are project-level instructions that encode the "unwritten knowledge" of your codebase - the kind of expertise that experienced developers know and would pass on to new team members:

- Which layout primitives and components to use
- Where component files should be located
- How components should be named and structured
- What should never be hardcoded
- How to handle design tokens and styling
- Project-specific architectural patterns

Once defined, these rules dramatically reduce repetitive prompting and ensure consistent output across all Figma implementation tasks.

## Prerequisites

- Figma MCP server must be connected and accessible
- Access to the project codebase for analysis
- Understanding of your team's component conventions (or willingness to establish them)

## When to Use This Skill

Use this skill when:

- Starting a new project that will use Figma designs
- Onboarding an AI coding agent to an existing project with established patterns
- Standardizing Figma-to-code workflows across your team
- Updating or refining existing design system conventions
- Users explicitly request: "create design system rules", "set up Figma guidelines", "customize rules for my project"

## Required Workflow

**Follow these steps in order. Do not skip steps.**

### Step 1: Run the Create Design System Rules Tool

Call the Figma MCP server's `create_design_system_rules` tool to get the foundational prompt and template.

**Parameters:**

- `clientLanguages`: Comma-separated list of languages used in the project (e.g., "typescript,javascript", "python", "javascript")
- `clientFrameworks`: Framework being used (e.g., "react", "vue", "svelte", "angular", "unknown")

This tool returns guidance and a template for creating design system rules.

Structure your design system rules following the template format provided in the tool's response.

### Step 2: Analyze the Codebase

Before finalizing rules, analyze the project to understand existing patterns:

**Component Organization:**

- Where are UI components located? (e.g., `src/components/`, `app/ui/`, `lib/components/`)
- Is there a dedicated design system directory?
- How are components organized? (by feature, by type, flat structure)

**Styling Approach:**

- What CSS framework or approach is used? (Tailwind, CSS Modules, styled-components, etc.)
- Where are design tokens defined? (CSS variables, theme files, config files)
- Are there existing color, typography, or spacing tokens?

**Component Patterns:**

- What naming conventions are used? (PascalCase, kebab-case, prefixes)
- How are component props typically structured?
- Are there common composition patterns?

**Architecture Decisions:**

- How is state management handled?
- What routing system is used?
- Are there specific import patterns or path aliases?

### Step 3: Generate Project-Specific Rules

Based on your codebase analysis, create a comprehensive set of rules. Include:

#### General Component Rules

```markdown
- IMPORTANT: Always use components from `[YOUR_PATH]` when possible
- Place new UI components in `[COMPONENT_DIRECTORY]`
- Follow `[NAMING_CONVENTION]` for component names
- Components must export as `[EXPORT_PATTERN]`
```

#### Styling Rules

```markdown
- Use `[CSS_FRAMEWORK/APPROACH]` for styling
- Design tokens are defined in `[TOKEN_LOCATION]`
- IMPORTANT: Never hardcode colors - always use tokens from `[TOKEN_FILE]`
- Spacing values must use the `[SPACING_SYSTEM]` scale
- Typography follows the scale defined in `[TYPOGRAPHY_LOCATION]`
```

#### Figma MCP Integration Rules

```markdown
## Figma MCP Integration Rules

These rules define how to translate Figma inputs into code for this project and must be followed for every Figma-driven change.

### Required Flow (do not skip)

1. Run get_design_context first to fetch the structured representation for the exact node(s)
2. If the response is too large or truncated, run get_metadata to get the high-level node map, then re-fetch only the required node(s) with get_design_context
3. Run get_screenshot for a visual reference of the node variant being implemented
4. Only after you have both get_design_context and get_screenshot, download any assets needed and start implementation
5. Translate the output (usually React + Tailwind) into this project's conventions, styles, and framework
6. Validate against Figma for 1:1 look and behavior before marking complete

### Implementation Rules

- Treat the Figma MCP output (React + Tailwind) as a representation of design and behavior, not as final code style
- Replace Tailwind utility classes with `[YOUR_STYLING_APPROACH]` when applicable
- Reuse existing components from `[COMPONENT_PATH]` instead of duplicating functionality
- Use the project's color system, typography scale, and spacing tokens consistently
- Respect existing routing, state management, and data-fetch patterns
- Strive for 1:1 visual parity with the Figma design
- Validate the final UI against the Figma screenshot for both look and behavior
```

#### Asset Handling Rules

```markdown
## Asset Handling

- The Figma MCP server provides an assets endpoint which can serve image and SVG assets
- IMPORTANT: If the Figma MCP server returns a localhost source for an image or SVG, use that source directly
- IMPORTANT: DO NOT import/add new icon packages - all assets should be in the Figma payload
- IMPORTANT: DO NOT use or create placeholders if a localhost source is provided
- Store downloaded assets in `[ASSET_DIRECTORY]`
```

#### Project-Specific Conventions

```markdown
## Project-Specific Conventions

- [Add any unique architectural patterns]
- [Add any special import requirements]
- [Add any testing requirements]
- [Add any accessibility standards]
- [Add any performance considerations]
```

### Step 4: Save Rules to the Appropriate Rule File

Detect which AI coding agent the user is working with and save the generated rules to the corresponding file:

| Agent | Rule File | Notes |
|-------|-----------|-------|
| Claude Code | `CLAUDE.md` in project root | Markdown format. Can also use `.claude/rules/figma-design-system.md` for modular organization. |
| Codex CLI | `AGENTS.md` in project root | Markdown format. Append as a new section if file already exists. 32 KiB combined size limit. |
| Cursor | `.cursor/rules/figma-design-system.mdc` | Markdown with YAML frontmatter (`description`, `globs`, `alwaysApply`). |

If unsure which agent the user is working with, check for existing rule files in the project or ask the user.

For Cursor, wrap the rules with YAML frontmatter:

```markdown
---
description: Rules for implementing Figma designs using the Figma MCP server. Covers component organization, styling conventions, design tokens, asset handling, and the required Figma-to-code workflow.
globs: "src/components/**"
alwaysApply: false
---

[Generated rules here]
```

Customize the `globs` pattern to match the directories where Figma-derived code will live in the project (e.g., `"src/**/*.tsx"` or `["src/components/**", "src/pages/**"]`).

After saving, the rules will be automatically loaded by the agent and applied to all Figma implementation tasks.

### Step 5: Validate and Iterate

After creating rules:

1. Test with a simple Figma component implementation
2. Verify the agent follows the rules correctly
3. Refine any rules that aren't working as expected
4. Share with team members for feedback
5. Update rules as the project evolves

## Rule Categories and Examples

### Essential Rules (Always Include)

**Component Discovery:**

```markdown
- UI components are located in `src/components/ui/`
- Feature components are in `src/components/features/`
- Layout primitives are in `src/components/layout/`
```

**Design Token Usage:**

```markdown
- Colors are defined as CSS variables in `src/styles/tokens.css`
- Never hardcode hex colors - use `var(--color-*)` tokens
- Spacing uses the 4px base scale: `--space-1` (4px), `--space-2` (8px), etc.
```

**Styling Approach:**

```markdown
- Use Tailwind utility classes for styling
- Custom styles go in component-level CSS modules
- Theme customization is in `tailwind.config.js`
```

### Recommended Rules (Highly Valuable)

**Component Patterns:**

```markdown
- All components must accept a `className` prop for composition
- Variant props should use union types: `variant: 'primary' | 'secondary'`
- Icon components should accept `size` and `color` props
```

**Import Conventions:**

```markdown
- Use path aliases: `@/components`, `@/styles`, `@/utils`
- Group imports: React, third-party, internal, types
- No relative imports beyond parent directory
```

**Code Quality:**

```markdown
- Add JSDoc comments for exported components
- Include PropTypes or TypeScript types for all props
- Extract magic numbers to named constants
```

### Optional Rules (Project-Specific)

**Accessibility:**

```markdown
- All interactive elements must have aria-labels
- Color contrast must meet WCAG AA standards
- Keyboard navigation required for all interactions
```

**Performance:**

```markdown
- Lazy load images with the `Image` component from `@/components/Image`
- Use React.memo for components that receive complex props
- Icons should be SVG components, not icon fonts
```

**Testing:**

```markdown
- Include unit tests for new components in `__tests__/` directory
- Use Testing Library queries (getByRole, getByLabelText)
- Test all interactive states and variants
```

## Examples

### Example 1: React + Tailwind Project

User says: "Create design system rules for my React project"

**Actions:**

1. Run `create_design_system_rules(clientLanguages="typescript,javascript", clientFrameworks="react")`
2. Analyze codebase structure
3. Generate rules:

```markdown
# Figma MCP Integration Rules

## Component Organization

- UI components are in `src/components/ui/`
- Page components are in `src/app/`
- Use Tailwind for styling

## Figma Implementation Flow

1. Run get_design_context for the node
2. Run get_screenshot for visual reference
3. Map Figma colors to Tailwind colors defined in `tailwind.config.js`
4. Reuse components from `src/components/ui/` when possible
5. Validate against screenshot before completing

## Styling Rules

- IMPORTANT: Use Tailwind utility classes, not inline styles
- Colors are defined in `tailwind.config.js` theme.colors
- Spacing uses Tailwind's default scale
- Custom components go in `src/components/ui/`

## Asset Rules

- IMPORTANT: Use localhost sources from Figma MCP server directly
- Store static assets in `public/assets/`
- DO NOT install new icon libraries
```

4. Save to the appropriate rule file for the user's agent
5. Test with a simple button implementation

**Result:** The agent now consistently follows the project's conventions when implementing Figma designs.

### Example 2: Vue + Custom CSS Project

User says: "Set up Figma rules for my Vue app"

**Actions:**

1. Run `create_design_system_rules(clientLanguages="typescript,javascript", clientFrameworks="vue")`
2. Discover that project uses CSS modules and a custom design token system
3. Generate rules:

```markdown
# Figma MCP Integration Rules

## Component Organization

- Components are in `src/components/`
- Composables are in `src/composables/`
- Vue SFC structure: <script setup>, <template>, <style scoped>

## Design Tokens

- IMPORTANT: All colors defined in `src/styles/tokens.css` as CSS variables
- Use `var(--color-primary)`, `var(--color-secondary)`, etc.
- Spacing: `var(--space-xs)` through `var(--space-xl)`
- Typography: `var(--text-sm)` through `var(--text-2xl)`

## Figma Implementation Flow

1. Run get_design_context and get_screenshot
2. Translate React output to Vue 3 Composition API
3. Map Figma colors to CSS variables in `src/styles/tokens.css`
4. Use CSS Modules for component styles
5. Check for existing components in `src/components/` before creating new ones

## Styling Rules

- Use CSS Modules (`.module.css` files)
- IMPORTANT: Reference design tokens, never hardcode values
- Scoped styles with CSS modules
```

4. Save to the appropriate rule file for the user's agent
5. Validate with a card component

**Result:** The agent now correctly translates Figma designs to Vue components using the project's design token system.

### Example 3: Design System Team

User says: "Generate rules for our design system library"

**Actions:**

1. Run `create_design_system_rules(clientLanguages="typescript", clientFrameworks="react")`
2. Analyze the monorepo structure with design system package
3. Generate comprehensive rules:

```markdown
# Design System Rules

## Repository Structure

- Design system components: `packages/design-system/src/components/`
- Documentation: `packages/docs/`
- Design tokens: `packages/tokens/src/`

## Component Development

- IMPORTANT: All components must be in `packages/design-system/src/components/`
- Component file structure: `ComponentName/index.tsx`, `ComponentName.stories.tsx`, `ComponentName.test.tsx`
- Export all components from `packages/design-system/src/index.ts`

## Design Tokens

- Colors: `packages/tokens/src/colors.ts`
- Typography: `packages/tokens/src/typography.ts`
- Spacing: `packages/tokens/src/spacing.ts`
- IMPORTANT: Never hardcode values - import from tokens package

## Documentation Requirements

- Add Storybook story for every component
- Include JSDoc with @example
- Document all props with descriptions
- Add accessibility notes

## Figma Integration

1. Get design context and screenshot from Figma
2. Map Figma tokens to design system tokens
3. Create or extend component in design system package
4. Add Storybook stories showing all variants
5. Validate against Figma screenshot
6. Update documentation
```

4. Save to the appropriate rule file and share with team
5. Add to team documentation

**Result:** Entire team follows consistent patterns when adding components from Figma to the design system.

## Best Practices

### Start Simple, Iterate

Don't try to capture every rule upfront. Start with the most important conventions and add rules as you encounter inconsistencies.

### Be Specific

Instead of: "Use the design system"
Write: "Always use Button components from `src/components/ui/Button.tsx` with variant prop ('primary' | 'secondary' | 'ghost')"

### Make Rules Actionable

Each rule should tell the agent exactly what to do, not just what to avoid.

Good: "Colors are defined in `src/theme/colors.ts` - import and use these constants"
Bad: "Don't hardcode colors"

### Use IMPORTANT for Critical Rules

Prefix rules that must never be violated with "IMPORTANT:" to ensure the agent prioritizes them.

```markdown
- IMPORTANT: Never expose API keys in client-side code
- IMPORTANT: Always sanitize user input before rendering
```

### Document the Why

When rules seem arbitrary, explain the reasoning:

```markdown
- Place all data-fetching in server components (reduces client bundle size and improves performance)
- Use absolute imports with `@/` alias (makes refactoring easier and prevents broken relative paths)
```

## Common Issues and Solutions

### Issue: The agent isn't following the rules

**Cause:** Rules may be too vague or not properly loaded by the agent.
**Solution:**

- Make rules more specific and actionable
- Verify rules are saved in the correct configuration file
- Restart your agent or IDE to reload rules
- Add "IMPORTANT:" prefix to critical rules

### Issue: Rules conflict with each other

**Cause:** Contradictory or overlapping rules.
**Solution:**

- Review all rules for conflicts
- Establish a clear priority hierarchy
- Remove redundant rules
- Consolidate related rules into single, clear statements

### Issue: Too many rules increase latency

**Cause:** Excessive rules increase context size and processing time.
**Solution:**

- Focus on the 20% of rules that solve 80% of consistency issues
- Remove overly specific rules that rarely apply
- Combine related rules
- Use progressive disclosure (basic rules first, advanced rules in linked files)

### Issue: Rules become outdated as project evolves

**Cause:** Codebase changes but rules don't.
**Solution:**

- Schedule periodic rule reviews (monthly or quarterly)
- Update rules when architectural decisions change
- Version control your rule files
- Document rule changes in commit messages

## Understanding Design System Rules

Design system rules transform how AI coding agents work with your Figma designs:

**Before rules:**

- The agent makes assumptions about component structure
- Inconsistent styling approaches across implementations
- Hardcoded values that don't match design tokens
- Components created in random locations
- Repetitive explanations of project conventions

**After rules:**

- The agent automatically follows your conventions
- Consistent component structure and styling
- Proper use of design tokens from the start
- Components organized correctly
- Zero repetitive prompting

The time invested in creating good rules pays off exponentially across every Figma implementation task.

## Additional Resources

- [Figma MCP Server Documentation](https://developers.figma.com/docs/figma-mcp-server/)
- [Figma Variables and Design Tokens](https://help.figma.com/hc/en-us/articles/15339657135383-Guide-to-variables-in-Figma)


<!-- END SKILL: figma-create-design-system-rules -->

<!-- START SKILL: figma-create-new-file -->

---
name: figma-create-new-file
description: Create a new blank Figma file. Use when the user wants to create a new Figma design or FigJam file, or when you need a new file before calling use_figma. Handles plan resolution via whoami if needed. Usage — /figma-create-new-file [editorType] [fileName] (e.g. /figma-create-new-file figjam My Whiteboard)
---

# create_new_file — Create a New Figma File

Use the `create_new_file` MCP tool to create a new blank Figma file in the user's drafts folder. This is typically used before `use_figma` when you need a fresh file to work with.

## Skill Arguments

This skill accepts optional arguments: `/figma-create-new-file [editorType] [fileName]`

- **editorType**: `design` (default) or `figjam`
- **fileName**: Name for the new file (defaults to "Untitled")

Examples:
- `/figma-create-new-file` — creates a design file named "Untitled"
- `/figma-create-new-file figjam My Whiteboard` — creates a FigJam file named "My Whiteboard"
- `/figma-create-new-file design My New Design` — creates a design file named "My New Design"

Parse the arguments from the skill invocation. If editorType is not provided, default to `"design"`. If fileName is not provided, default to `"Untitled"`.

## Workflow

### Step 1: Resolve the planKey

The `create_new_file` tool requires a `planKey` parameter. Follow this decision tree:

1. **User already provided a planKey** (e.g. from a previous `whoami` call or in their prompt) → use it directly, skip to Step 2.

2. **No planKey available** → call the `whoami` tool. The response contains a `plans` array. Each plan has a `key`, `name`, `seat`, and `tier`.

   - **Single plan**: use its `key` field automatically.
   - **Multiple plans**: ask the user which team or organization they want to create the file in, then use the corresponding plan's `key`.

### Step 2: Call create_new_file

Call the `create_new_file` tool with:

| Parameter    | Required | Description |
|-------------|----------|-------------|
| `planKey`   | Yes      | The plan key from Step 1 |
| `fileName`  | Yes      | Name for the new file |
| `editorType`| Yes      | `"design"` or `"figjam"` |

Example:
```json
{
  "planKey": "team:123456",
  "fileName": "My New Design",
  "editorType": "design"
}
```

### Step 3: Use the result

The tool returns:
- `file_key` — the key of the newly created file
- `file_url` — a direct URL to open the file in Figma

Use the `file_key` for subsequent tool calls like `use_figma`.

## Important Notes

- The file is created in the user's **drafts folder** for the selected plan.
- Only `"design"` and `"figjam"` editor types are supported.
- If `use_figma` is your next step, load the `figma-use` skill before calling it.


<!-- END SKILL: figma-create-new-file -->

<!-- START SKILL: figma-generate-design -->

---
name: figma-generate-design
description: "Use this skill alongside figma-use when the task involves translating an application page, view, or multi-section layout into Figma. Triggers: 'write to Figma', 'create in Figma from code', 'push page to Figma', 'take this app/page and build it in Figma', 'create a screen', 'build a landing page in Figma', 'update the Figma screen to match code'. This is the preferred workflow skill whenever the user wants to build or update a full page, screen, or view in Figma from code or a description. Discovers design system components, variables, and styles via search_design_system, imports them, and assembles screens incrementally section-by-section using design system tokens instead of hardcoded values."
---

# Build / Update Screens from Design System

Use this skill to create or update full-page screens in Figma by **reusing the published design system** — components, variables, and styles — rather than drawing primitives with hardcoded values. The key insight: the Figma file likely has a published design system with components, color/spacing variables, and text/effect styles that correspond to the codebase's UI components and tokens. Find and use those instead of drawing boxes with hex colors.

**MANDATORY**: You MUST also load [figma-use](../figma-use/SKILL.md) before any `use_figma` call. That skill contains critical rules (color ranges, font loading, etc.) that apply to every script you write.

**Always pass `skillNames: "figma-generate-design"` when calling `use_figma` as part of this skill.** This is a logging parameter — it does not affect execution.

## Skill Boundaries

- Use this skill when the deliverable is a **Figma screen** (new or updated) composed of design system component instances.
- If the user wants to generate **code from a Figma design**, switch to [figma-implement-design](../figma-implement-design/SKILL.md).
- If the user wants to create **new reusable components or variants**, use [figma-use](../figma-use/SKILL.md) directly.
- If the user wants to write **Code Connect mappings**, switch to [figma-code-connect-components](../figma-code-connect-components/SKILL.md).

## Prerequisites

- Figma MCP server must be connected
- The target Figma file must have a published design system with components (or access to a team library)
- User should provide either:
  - A Figma file URL / file key to work in
  - Or context about which file to target (the agent can discover pages)
- Source code or description of the screen to build/update

## Parallel Workflow with generate_figma_design (Web Apps Only)

When building a screen from a **web app** that can be rendered in a browser, the best results come from running both approaches in parallel:

1. **In parallel:**
   - Start building the screen using this skill's workflow (use_figma + design system components)
   - Run `generate_figma_design` to capture a pixel-perfect screenshot of the running web app
2. **Once both complete:** Update the use_figma output to match the pixel-perfect layout from the `generate_figma_design` capture. The capture provides the exact spacing, sizing, and visual treatment to aim for, while your use_figma output has proper component instances linked to the design system.
3. **Once confirmed looking good:** Delete the `generate_figma_design` output — it was only used as a visual reference.

This combines the best of both: `generate_figma_design` gives pixel-perfect layout accuracy, while use_figma gives proper design system component instances that stay linked and updatable.

**This workflow only applies to web apps** where `generate_figma_design` can capture the running page. For non-web apps (iOS, Android, etc.) or when updating existing screens, use the standard workflow below.

## Required Workflow

**Follow these steps in order. Do not skip steps.**

### Step 1: Understand the Screen

Before touching Figma, understand what you're building:

1. If building from code, read the relevant source files to understand the page structure, sections, and which components are used.
2. Identify the major sections of the screen (e.g., Header, Hero, Content Panels, Pricing Grid, FAQ Accordion, Footer).
3. For each section, list the UI components involved (buttons, inputs, cards, navigation pills, accordions, etc.).

### Step 2: Discover Design System — Components, Variables, and Styles

You need three things from the design system: **components** (buttons, cards, etc.), **variables** (colors, spacing, radii), and **styles** (text styles, effect styles like shadows). Don't hardcode hex colors or pixel values when design system tokens exist.

#### 2a: Discover components

**Preferred: inspect existing screens first.** If the target file already contains screens using the same design system, skip `search_design_system` and inspect existing instances directly. A single `use_figma` call that walks an existing frame's instances gives you an exact, authoritative component map:

```js
const frame = figma.currentPage.findOne(n => n.name === "Existing Screen");
const uniqueSets = new Map();
frame.findAll(n => n.type === "INSTANCE").forEach(inst => {
  const mc = inst.mainComponent;
  const cs = mc?.parent?.type === "COMPONENT_SET" ? mc.parent : null;
  const key = cs ? cs.key : mc?.key;
  const name = cs ? cs.name : mc?.name;
  if (key && !uniqueSets.has(key)) {
    uniqueSets.set(key, { name, key, isSet: !!cs, sampleVariant: mc.name });
  }
});
return [...uniqueSets.values()];
```

Only fall back to `search_design_system` when the file has no existing screens to reference. When using it, **search broadly** — try multiple terms and synonyms (e.g., "button", "input", "nav", "card", "accordion", "header", "footer", "tag", "avatar", "toggle", "icon", etc.). Use `includeComponents: true` to focus on components.

**Include component properties** in your map — you need to know which TEXT properties each component exposes for text overrides. Create a temporary instance, read its `componentProperties` (and those of nested instances), then remove the temp instance.

Example component map with property info:

```
Component Map:
- Button → key: "abc123", type: COMPONENT_SET
  Properties: { "Label#2:0": TEXT, "Has Icon#4:64": BOOLEAN }
- PricingCard → key: "ghi789", type: COMPONENT_SET
  Properties: { "Device": VARIANT, "Variant": VARIANT }
  Nested "Text Heading" has: { "Text#2104:5": TEXT }
  Nested "Button" has: { "Label#2:0": TEXT }
```

#### 2b: Discover variables (colors, spacing, radii)

**Inspect existing screens first** (same as components). Or use `search_design_system` with `includeVariables: true`.

> **WARNING: Two different variable discovery methods — do not confuse them.**
>
> - `use_figma` with `figma.variables.getLocalVariableCollectionsAsync()` — returns **only local variables defined in the current file**. If this returns empty, it does **not** mean no variables exist. Remote/published library variables are invisible to this API.
> - `search_design_system` with `includeVariables: true` — searches across **all linked libraries**, including remote and published ones. This is the correct tool for discovering design system variables.
>
> **Never conclude "no variables exist" based solely on `getLocalVariableCollectionsAsync()` returning empty.** Always also run `search_design_system` with `includeVariables: true` to check for library variables before deciding to create your own.

**Query strategy:** `search_design_system` matches against **variable names** (e.g., "Gray/gray-9", "core/gray/100", "space/400"), not categories. Run multiple short, simple queries in parallel rather than one compound query:

- **Primitive colors:** "gray", "red", "blue", "green", "white", "brand"
- **Semantic colors:** "background", "foreground", "border", "surface", "text"
- **Spacing/sizing:** "space", "radius", "gap", "padding"

If initial searches return empty, try shorter fragments or different naming conventions — libraries vary widely ("grey" vs "gray", "spacing" vs "space", "color/bg" vs "background").

Inspect an existing screen's bound variables for the most authoritative results:

```js
const frame = figma.currentPage.findOne(n => n.name === "Existing Screen");
const varMap = new Map();
frame.findAll(() => true).forEach(node => {
  const bv = node.boundVariables;
  if (!bv) return;
  for (const [prop, binding] of Object.entries(bv)) {
    const bindings = Array.isArray(binding) ? binding : [binding];
    for (const b of bindings) {
      if (b?.id && !varMap.has(b.id)) {
        const v = await figma.variables.getVariableByIdAsync(b.id);
        if (v) varMap.set(b.id, { name: v.name, id: v.id, key: v.key, type: v.resolvedType, remote: v.remote });
      }
    }
  }
});
return [...varMap.values()];
```

For library variables (remote = true), import them by key with `figma.variables.importVariableByKeyAsync(key)`. For local variables, use `figma.variables.getVariableByIdAsync(id)` directly.

See [variable-patterns.md](../figma-use/references/variable-patterns.md) for binding patterns.

#### 2c: Discover styles (text styles, effect styles)

Search for styles using `search_design_system` with `includeStyles: true` and terms like "heading", "body", "shadow", "elevation". Or inspect what an existing screen uses:

```js
const frame = figma.currentPage.findOne(n => n.name === "Existing Screen");
const styles = { text: new Map(), effect: new Map() };
frame.findAll(() => true).forEach(node => {
  if ('textStyleId' in node && node.textStyleId) {
    const s = figma.getStyleById(node.textStyleId);
    if (s) styles.text.set(s.id, { name: s.name, id: s.id, key: s.key });
  }
  if ('effectStyleId' in node && node.effectStyleId) {
    const s = figma.getStyleById(node.effectStyleId);
    if (s) styles.effect.set(s.id, { name: s.name, id: s.id, key: s.key });
  }
});
return {
  textStyles: [...styles.text.values()],
  effectStyles: [...styles.effect.values()]
};
```

Import library styles with `figma.importStyleByKeyAsync(key)`, then apply with `node.textStyleId = style.id` or `node.effectStyleId = style.id`.

See [text-style-patterns.md](../figma-use/references/text-style-patterns.md) and [effect-style-patterns.md](../figma-use/references/effect-style-patterns.md) for details.

### Step 3: Create the Page Wrapper Frame First

**Do NOT build sections as top-level page children and reparent them later** — moving nodes across `use_figma` calls with `appendChild()` silently fails and produces orphaned frames. Instead, create the wrapper first, then build each section directly inside it.

Create the page wrapper in its own `use_figma` call. Position it away from existing content and return its ID:

```js
// Find clear space
let maxX = 0;
for (const child of figma.currentPage.children) {
  maxX = Math.max(maxX, child.x + child.width);
}

const wrapper = figma.createFrame();
wrapper.name = "Homepage";
wrapper.layoutMode = "VERTICAL";
wrapper.primaryAxisAlignItems = "CENTER";
wrapper.counterAxisAlignItems = "CENTER";
wrapper.resize(1440, 100);
wrapper.layoutSizingHorizontal = "FIXED";
wrapper.layoutSizingVertical = "HUG";
wrapper.x = maxX + 200;
wrapper.y = 0;

return { success: true, wrapperId: wrapper.id };
```

### Step 4: Build Each Section Inside the Wrapper

**This is the most important step.** Build one section at a time, each in its own `use_figma` call. At the start of each script, fetch the wrapper by ID and append new content directly to it.

```js
const createdNodeIds = [];
const wrapper = await figma.getNodeByIdAsync("WRAPPER_ID_FROM_STEP_3");

// Import design system components by key
const buttonSet = await figma.importComponentSetByKeyAsync("BUTTON_SET_KEY");
const primaryButton = buttonSet.children.find(c =>
  c.type === "COMPONENT" && c.name.includes("variant=primary")
) || buttonSet.defaultVariant;

// Import design system variables for colors and spacing
const bgColorVar = await figma.variables.importVariableByKeyAsync("BG_COLOR_VAR_KEY");
const spacingVar = await figma.variables.importVariableByKeyAsync("SPACING_VAR_KEY");

// Build section frame with variable bindings (not hardcoded values)
const section = figma.createFrame();
section.name = "Header";
section.layoutMode = "HORIZONTAL";
section.setBoundVariable("paddingLeft", spacingVar);
section.setBoundVariable("paddingRight", spacingVar);
const bgPaint = figma.variables.setBoundVariableForPaint(
  { type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', bgColorVar
);
section.fills = [bgPaint];

// Import and apply text/effect styles
const shadowStyle = await figma.importStyleByKeyAsync("SHADOW_STYLE_KEY");
section.effectStyleId = shadowStyle.id;

// Create component instances inside the section
const btnInstance = primaryButton.createInstance();
section.appendChild(btnInstance);
createdNodeIds.push(btnInstance.id);

// Append section to wrapper
wrapper.appendChild(section);
section.layoutSizingHorizontal = "FILL"; // AFTER appending

createdNodeIds.push(section.id);
return { success: true, createdNodeIds };
```

After each section, validate with `get_screenshot` before moving on. Look closely for cropped/clipped text (line heights cutting off content) and overlapping elements — these are the most common issues and easy to miss at a glance.

#### Override instance text with setProperties()

Component instances ship with placeholder text ("Title", "Heading", "Button"). Use the component property keys you discovered in Step 2 to override them with `setProperties()` — this is more reliable than direct `node.characters` manipulation. See [component-patterns.md](../figma-use/references/component-patterns.md#overriding-text-in-a-component-instance) for the full pattern.

For nested instances that expose their own TEXT properties, call `setProperties()` on the nested instance:

```js
const nestedHeading = cardInstance.findOne(n => n.type === "INSTANCE" && n.name === "Text Heading");
if (nestedHeading) {
  nestedHeading.setProperties({ "Text#2104:5": "Actual heading from source code" });
}
```

Only fall back to direct `node.characters` for text that is NOT managed by any component property.

#### Read source code defaults carefully

When translating code components to Figma instances, check the component's default prop values in the source code, not just what's explicitly passed. For example, `<Button size="small">Register</Button>` with no variant prop — check the component definition to find `variant = "primary"` as the default. Selecting the wrong variant (e.g., Neutral instead of Primary) produces a visually incorrect result that's easy to miss.

#### What to build manually vs. import from design system

| Build manually | Import from design system |
|----------------|--------------------------|
| Page wrapper frame | **Components**: buttons, cards, inputs, nav, etc. |
| Section container frames | **Variables**: colors (fills, strokes), spacing (padding, gap), radii |
| Layout grids (rows, columns) | **Text styles**: heading, body, caption, etc. |
| | **Effect styles**: shadows, blurs, etc. |

**Never hardcode hex colors or pixel spacing** when a design system variable exists. Use `setBoundVariable` for spacing/radii and `setBoundVariableForPaint` for colors. Apply text styles with `node.textStyleId` and effect styles with `node.effectStyleId`.

### Step 5: Validate the Full Screen

After composing all sections, call `get_screenshot` on the full page frame and compare against the source. Fix any issues with targeted `use_figma` calls — don't rebuild the entire screen.

**Screenshot individual sections, not just the full page.** A full-page screenshot at reduced resolution hides text truncation, wrong colors, and placeholder text that hasn't been overridden. Take a screenshot of each section by node ID to catch:
- **Cropped/clipped text** — line heights or frame sizing cutting off descenders, ascenders, or entire lines
- **Overlapping content** — elements stacking on top of each other due to incorrect sizing or missing auto-layout
- Placeholder text still showing ("Title", "Heading", "Button")
- Truncated content from layout sizing bugs
- Wrong component variants (e.g., Neutral vs Primary button)

### Step 6: Updating an Existing Screen

When updating rather than creating from scratch:

1. Use `get_metadata` to inspect the existing screen structure.
2. Identify which sections need updating and which can stay.
3. For each section that needs changes:
   - Locate the existing nodes by ID or name
   - Swap component instances if the design system component changed
   - Update text content, variant properties, or layout as needed
   - Remove deprecated sections
   - Add new sections
4. Validate with `get_screenshot` after each modification.

```js
// Example: Swap a button variant in an existing screen
const existingButton = await figma.getNodeByIdAsync("EXISTING_BUTTON_INSTANCE_ID");
if (existingButton && existingButton.type === "INSTANCE") {
  // Import the updated component
  const buttonSet = await figma.importComponentSetByKeyAsync("BUTTON_SET_KEY");
  const newVariant = buttonSet.children.find(c =>
    c.name.includes("variant=primary") && c.name.includes("size=lg")
  ) || buttonSet.defaultVariant;
  existingButton.swapComponent(newVariant);
}
return { success: true, mutatedNodeIds: [existingButton.id] };
```

## Reference Docs

For detailed API patterns and gotchas, load these from the [figma-use](../figma-use/SKILL.md) references as needed:

- [component-patterns.md](../figma-use/references/component-patterns.md) — importing by key, finding variants, setProperties, text overrides, working with instances
- [variable-patterns.md](../figma-use/references/variable-patterns.md) — creating/binding variables, importing library variables, scopes, aliasing, discovering existing variables
- [text-style-patterns.md](../figma-use/references/text-style-patterns.md) — creating/applying text styles, importing library text styles, type ramps
- [effect-style-patterns.md](../figma-use/references/effect-style-patterns.md) — creating/applying effect styles (shadows), importing library effect styles
- [gotchas.md](../figma-use/references/gotchas.md) — layout pitfalls (HUG/FILL interactions, counterAxisAlignItems, sizing order), paint/color issues, page context resets

## Error Recovery

Follow the error recovery process from [figma-use](../figma-use/SKILL.md#6-error-recovery--self-correction):

1. **STOP** on error — do not retry immediately.
2. **Read the error message carefully** to understand what went wrong.
3. If the error is unclear, call `get_metadata` or `get_screenshot` to inspect the current file state.
4. **Fix the script** based on the error message.
5. **Retry** the corrected script — this is safe because failed scripts are atomic (nothing is created if a script errors).

Because this skill works incrementally (one section per call), errors are naturally scoped to a single section. Previous sections from successful calls remain intact.

## Best Practices

- **Always search before building.** The design system likely has the component, variable, or style you need. Manual construction and hardcoded values should be the exception, not the rule.
- **Search broadly.** Try synonyms and partial terms. A "NavigationPill" might be found under "pill", "nav", "tab", or "chip". For variables, search "color", "spacing", "radius", etc.
- **Prefer design system tokens over hardcoded values.** Use variable bindings for colors, spacing, and radii. Use text styles for typography. Use effect styles for shadows. This keeps the screen linked to the design system.
- **Prefer component instances over manual builds.** Instances stay linked to the source component and update automatically when the design system evolves.
- **Work section by section.** Never build more than one major section per `use_figma` call.
- **Return node IDs from every call.** You'll need them to compose sections and for error recovery.
- **Validate visually after each section.** Use `get_screenshot` to catch issues early.
- **Match existing conventions.** If the file already has screens, match their naming, sizing, and layout patterns.


<!-- END SKILL: figma-generate-design -->

<!-- START SKILL: figma-generate-library -->

---
name: figma-generate-library
description: "Build or update a professional-grade design system in Figma from a codebase. Use when the user wants to create variables/tokens, build component libraries, set up theming (light/dark modes), document foundations, or reconcile gaps between code and Figma. This skill teaches WHAT to build and in WHAT ORDER — it complements the `figma-use` skill which teaches HOW to call the Plugin API. Both skills should be loaded together."
---

# Design System Builder — Figma MCP Skill

Build professional-grade design systems in Figma that match code. This skill orchestrates multi-phase workflows across 20–100+ `use_figma` calls, enforcing quality patterns from real-world design systems (Material 3, Polaris, Figma UI3, Simple DS).

**Prerequisites**: The `figma-use` skill MUST also be loaded for every `use_figma` call. It provides Plugin API syntax rules (return pattern, page reset, ID return, font loading, color range). This skill provides design system domain knowledge and workflow orchestration.

**Always pass `skillNames: "figma-generate-library"` when calling `use_figma` as part of this skill.** This is a logging parameter — it does not affect execution.

---

## 1. The One Rule That Matters Most

**This is NEVER a one-shot task.** Building a design system requires 20–100+ `use_figma` calls across multiple phases, with mandatory user checkpoints between them. Any attempt to create everything in one call WILL produce broken, incomplete, or unrecoverable results. Break every operation to the smallest useful unit, validate, get feedback, proceed.

---

## 2. Mandatory Workflow

Every design system build follows this phase order. Skipping or reordering phases causes structural failures that are expensive to undo.

```
Phase 0: DISCOVERY (always first — no use_figma writes yet)
  0a. Analyze codebase → extract tokens, components, naming conventions
  0b. Inspect Figma file → pages, variables, components, styles, existing conventions
  0c. Search subscribed libraries → use search_design_system for reusable assets
  0d. Lock v1 scope → agree on exact token set + component list before any creation
  0e. Map code → Figma → resolve conflicts (code and Figma disagree = ask user)
  ✋ USER CHECKPOINT: present full plan, await explicit approval

Phase 1: FOUNDATIONS (tokens first — always before components)
  1a. Create variable collections and modes
  1b. Create primitive variables (raw values, 1 mode)
  1c. Create semantic variables (aliased to primitives, mode-aware)
  1d. Set scopes on ALL variables
  1e. Set code syntax on ALL variables
  1f. Create effect styles (shadows) and text styles (typography)
  → Exit criteria: every token from the agreed plan exists, all scopes set, all code syntax set
  ✋ USER CHECKPOINT: show variable summary, await approval

Phase 2: FILE STRUCTURE (before components)
  2a. Create page skeleton: Cover → Getting Started → Foundations → --- → Components → --- → Utilities
  2b. Create foundations documentation pages (color swatches, type specimens, spacing bars)
  → Exit criteria: all planned pages exist, foundations docs are navigable
  ✋ USER CHECKPOINT: show page list + screenshot, await approval

Phase 3: COMPONENTS (one at a time — never batch)
  For EACH component (in dependency order: atoms before molecules):
    3a. Create dedicated page
    3b. Build base component with auto-layout + full variable bindings
    3c. Create all variant combinations (combineAsVariants + grid layout)
    3d. Add component properties (TEXT, BOOLEAN, INSTANCE_SWAP)
    3e. Link properties to child nodes
    3f. Add page documentation (title, description, usage notes)
    3g. Validate: get_metadata (structure) + get_screenshot (visual)
    3h. Optional: lightweight Code Connect mapping while context is fresh
    → Exit criteria: variant count correct, all bindings verified, screenshot looks right
    ✋ USER CHECKPOINT per component: show screenshot, await approval before next component

Phase 4: INTEGRATION + QA (final pass)
  4a. Finalize all Code Connect mappings
  4b. Accessibility audit (contrast, min touch targets, focus visibility)
  4c. Naming audit (no duplicates, no unnamed nodes, consistent casing)
  4d. Unresolved bindings audit (no hardcoded fills/strokes remaining)
  4e. Final review screenshots of every page
  ✋ USER CHECKPOINT: complete sign-off
```

---

## 3. Critical Rules

**Plugin API basics** (from use_figma skill — enforced here too):
- Use `return` to send data back (auto-serialized). Do NOT wrap in IIFE or call closePlugin.
- Return ALL created/mutated node IDs in every return value
- Page context resets each call — always `await figma.setCurrentPageAsync(page)` at start
- `figma.notify()` throws — never use it
- Colors are 0–1 range, not 0–255
- Font MUST be loaded before any text write: `await figma.loadFontAsync({family, style})`

**Design system rules**:
1. **Variables BEFORE components** — components bind to variables. No token = no component.
2. **Inspect before creating** — run read-only `use_figma` to discover existing conventions. Match them.
3. **One page per component** *(default)* — exception: tightly related families (e.g., Input + helpers) may share a page with clear section separation.
4. **Bind visual properties to variables** *(default)* — fills, strokes, padding, radius, gap. Exceptions: intentionally fixed geometry (icon pixel-grid sizes, static dividers).
5. **Scopes on every variable** — NEVER leave as `ALL_SCOPES`. Background: `FRAME_FILL, SHAPE_FILL`. Text: `TEXT_FILL`. Border: `STROKE_COLOR`. Spacing: `GAP`. Radii: `CORNER_RADIUS`. Primitives: `[]` (hidden).
6. **Code syntax on every variable** — WEB syntax MUST use the `var()` wrapper: `var(--color-bg-primary)`, not `--color-bg-primary`. Use the actual CSS variable name from the codebase. ANDROID/iOS do NOT use a wrapper.
7. **Alias semantics to primitives** — `{ type: 'VARIABLE_ALIAS', id: primitiveVar.id }`. Never duplicate raw values in semantic layer.
8. **Position variants after combineAsVariants** — they stack at (0,0). Manually grid-layout + resize.
9. **INSTANCE_SWAP for icons** — never create a variant per icon. Cap variant matrices: if Size × Style × State > 30 combinations, split into sub-component.
10. **Deterministic naming** — use consistent, unique node names for idempotent cleanup and resumability. Track created node IDs via return values and the state ledger.
11. **No destructive cleanup** — cleanup scripts identify nodes by name convention or returned IDs, not by guessing.
12. **Validate before proceeding** — never build on unvalidated work. `get_metadata` after every create, `get_screenshot` after each component.
13. **NEVER parallelize `use_figma` calls** — Figma state mutations must be strictly sequential. Even if your tool supports parallel calls, never run two use_figma calls simultaneously.
14. **Never hallucinate Node IDs** — always read IDs from the state ledger returned by previous calls. Never reconstruct or guess an ID from memory.
15. **Use the helper scripts** — embed scripts from `scripts/` into your use_figma calls. Don't write 200-line inline scripts from scratch.
16. **Explicit phase approval** — at each checkpoint, name the next phase explicitly. "looks good" is not approval to proceed to Phase 3 if you asked about Phase 1.

---

## 4. State Management (Required for Long Workflows)

> **`getPluginData()` / `setPluginData()` are NOT supported in `use_figma`.** Use `getSharedPluginData()` / `setSharedPluginData()` instead (these ARE supported), or use name-based lookups and the state ledger (returned IDs).

| Entity type | Idempotency key | How to check existence |
|-------------|----------------|----------------------|
| Scene nodes (pages, frames, components) | `setSharedPluginData('dsb', 'key', value)` or unique name | `node.getSharedPluginData('dsb', 'key')` or `page.findOne(n => n.name === 'Button')` |
| Variables | Name within collection | `(await figma.variables.getLocalVariablesAsync()).find(v => v.name === name && v.variableCollectionId === collId)` |
| Styles | Name | `getLocalTextStyles().find(s => s.name === name)` |

Tag every created **scene node** immediately after creation:
```javascript
node.setSharedPluginData('dsb', 'run_id', RUN_ID);        // identifies this build run
node.setSharedPluginData('dsb', 'phase', 'phase3');        // which phase created it
node.setSharedPluginData('dsb', 'key', 'component/button');// unique logical key
```

**State persistence**: Do NOT rely solely on conversation context for the state ledger. Write it to disk:
```
/tmp/dsb-state-{RUN_ID}.json
```
Re-read this file at the start of every turn. In long workflows, conversation context will be truncated — the file is the source of truth.

Maintain a state ledger tracking:
```json
{
  "runId": "ds-build-2024-001",
  "phase": "phase3",
  "step": "component-button",
  "entities": {
    "collections": { "primitives": "id:...", "color": "id:..." },
    "variables": { "color/bg/primary": "id:...", "spacing/sm": "id:..." },
    "pages": { "Cover": "id:...", "Button": "id:..." },
    "components": { "Button": "id:..." }
  },
  "pendingValidations": ["Button:screenshot"],
  "completedSteps": ["phase0", "phase1", "phase2", "component-avatar"]
}
```

**Idempotency check** before every create: query by name + state ledger ID. If exists, skip or update — never duplicate.

**Resume protocol**: at session start or after context truncation, run a read-only `use_figma` to scan all pages, components, variables, and styles by name to reconstruct the `{key → id}` map. Then re-read the state file from disk if available.

**Continuation prompt** (give this to the user when resuming in a new chat):
> "I'm continuing a design system build. Run ID: {RUN_ID}. Load the figma-generate-library skill and resume from the last completed step."

---

## 5. search_design_system — Reuse Decision Matrix

Search FIRST in Phase 0, then again immediately before each component creation.

```
search_design_system({ query, fileKey, includeComponents: true, includeVariables: true, includeStyles: true })
```

**Reuse if** all of these are true:
- Component property API matches your needs (same variant axes, compatible types)
- Token binding model is compatible (uses same or aliasable variables)
- Naming conventions match the target file
- Component is editable (not locked in a remote library you don't own)

**Rebuild if** any of these:
- API incompatibility (different property names, wrong variant model)
- Token model incompatible (hardcoded values, different variable schema)
- Ownership issue (can't modify the library)

**Wrap if** visual match but API incompatible:
- Import the library component as a nested instance inside a new wrapper component
- Expose a clean API on the wrapper

**Three-way priority**: local existing → subscribed library import → create new.

---

## 6. User Checkpoints

Mandatory. Design decisions require human judgment.

| After | Required artifacts | Ask |
|-------|-------------------|-----|
| Discovery + scope lock | Token list, component list, gap analysis | "Here's my plan. Approve before I create anything?" |
| Foundations | Variable summary (N collections, M vars, K modes), style list | "All tokens created. Review before file structure?" |
| File structure | Page list + screenshot | "Pages set up. Review before components?" |
| Each component | get_screenshot of component page | "Here's [Component] with N variants. Correct?" |
| Each conflict (code ≠ Figma) | Show both versions | "Code says X, Figma has Y. Which wins?" |
| Final QA | Per-page screenshots + audit report | "Complete. Sign off?" |

**If user rejects**: fix before moving on. Never build on rejected work.

---

## 7. Naming Conventions

Match existing file conventions. If starting fresh:

**Variables** (slash-separated):
```
color/bg/primary     color/text/secondary    color/border/default
spacing/xs  spacing/sm  spacing/md  spacing/lg  spacing/xl  spacing/2xl
radius/none  radius/sm  radius/md  radius/lg  radius/full
typography/body/font-size    typography/heading/line-height
```

**Primitives**: `blue/50` → `blue/900`, `gray/50` → `gray/900`

**Component names**: `Button`, `Input`, `Card`, `Avatar`, `Badge`, `Checkbox`, `Toggle`

**Variant names**: `Property=Value, Property=Value` — e.g., `Size=Medium, Style=Primary, State=Default`

**Page separators**: `---` (most common) or `——— COMPONENTS ———`

> Full naming reference: [naming-conventions.md](references/naming-conventions.md)

---

## 8. Token Architecture

| Complexity | Pattern |
|-----------|---------|
| < 50 tokens | Single collection, 2 modes (Light/Dark) |
| 50–200 tokens | **Standard**: Primitives (1 mode) + Color semantic (Light/Dark) + Spacing (1 mode) + Typography (1 mode) |
| 200+ tokens | **Advanced**: Multiple semantic collections, 4–8 modes (Light/Dark × Contrast × Brand). See M3 pattern in [token-creation.md](references/token-creation.md) |

Standard pattern (recommended starting point):
```
Collection: "Primitives"    modes: ["Value"]
  blue/500 = #3B82F6, gray/900 = #111827, ...

Collection: "Color"         modes: ["Light", "Dark"]
  color/bg/primary → Light: alias Primitives/white, Dark: alias Primitives/gray-900
  color/text/primary → Light: alias Primitives/gray-900, Dark: alias Primitives/white

Collection: "Spacing"       modes: ["Value"]
  spacing/xs = 4, spacing/sm = 8, spacing/md = 16, ...
```

---

## 9. Per-Phase Anti-Patterns

**Phase 0 anti-patterns:**
- ❌ Starting to create anything before scope is locked with user
- ❌ Ignoring existing file conventions and imposing new ones
- ❌ Skipping `search_design_system` before planning component creation

**Phase 1 anti-patterns:**
- ❌ Using `ALL_SCOPES` on any variable
- ❌ Duplicating raw values in semantic layer instead of aliasing
- ❌ Not setting code syntax (breaks Dev Mode and round-tripping)
- ❌ Creating component tokens before agreeing on token taxonomy

**Phase 2 anti-patterns:**
- ❌ Skipping the cover page or foundations docs
- ❌ Putting multiple unrelated components on one page

**Phase 3 anti-patterns:**
- ❌ Creating components before foundations exist
- ❌ Hardcoding any fill/stroke/spacing/radius value in a component
- ❌ Creating a variant per icon (use INSTANCE_SWAP instead)
- ❌ Not positioning variants after combineAsVariants (they all stack at 0,0)
- ❌ Building variant matrix > 30 without splitting (variant explosion)
- ❌ Importing remote components then immediately detaching them

**General anti-patterns:**
- ❌ Retrying a failed script without understanding the error first
- ❌ Using name-prefix matching for cleanup (deletes user-owned nodes)
- ❌ Building on unvalidated work from the previous step
- ❌ Skipping user checkpoints to "save time"
- ❌ Parallelizing use_figma calls (always sequential)
- ❌ Guessing/hallucinating node IDs from memory (always read from state ledger)
- ❌ Writing massive inline scripts instead of using the provided helper scripts
- ❌ Starting Phase 3 because the user said "build the button" without completing Phases 0-2

---

## 10. Reference Docs

Load on demand — each reference is authoritative for its phase:

Use your file reading tool to read these docs when needed. Do not assume their contents from the filename.

| Doc | Phase | Required / Optional | Load when |
|-----|-------|---------------------|-----------|
| [discovery-phase.md](references/discovery-phase.md) | 0 | **Required** | Starting any build — codebase analysis + Figma inspection |
| [token-creation.md](references/token-creation.md) | 1 | **Required** | Creating variables, collections, modes, styles |
| [documentation-creation.md](references/documentation-creation.md) | 2 | Required | Creating cover page, foundations docs, swatches |
| [component-creation.md](references/component-creation.md) | 3 | **Required** | Creating any component or variant |
| [code-connect-setup.md](references/code-connect-setup.md) | 3–4 | Required | Setting up Code Connect or variable code syntax |
| [naming-conventions.md](references/naming-conventions.md) | Any | Optional | Naming anything — variables, pages, variants, styles |
| [error-recovery.md](references/error-recovery.md) | Any | **Required on error** | Script fails, multi-step workflow recovery, cleanup of abandoned workflow state |

---

## 11. Scripts

Reusable Plugin API helper functions. Embed in `use_figma` calls:

| Script | Purpose |
|--------|---------|
| [inspectFileStructure.js](scripts/inspectFileStructure.js) | Discover all pages, components, variables, styles; returns full inventory |
| [createVariableCollection.js](scripts/createVariableCollection.js) | Create a named collection with modes; returns `{collectionId, modeIds}` |
| [createSemanticTokens.js](scripts/createSemanticTokens.js) | Create aliased semantic variables from a token map |
| [createComponentWithVariants.js](scripts/createComponentWithVariants.js) | Build a component set from a variant matrix; handles grid layout |
| [bindVariablesToComponent.js](scripts/bindVariablesToComponent.js) | Bind design tokens to all component visual properties |
| [createDocumentationPage.js](scripts/createDocumentationPage.js) | Create a page with title + description + section structure |
| [validateCreation.js](scripts/validateCreation.js) | Verify created nodes match expected counts, names, structure |
| [cleanupOrphans.js](scripts/cleanupOrphans.js) | Remove orphaned nodes by name convention or state ledger IDs |
| [rehydrateState.js](scripts/rehydrateState.js) | Scan file for all pages, components, variables by name; returns full `{key → nodeId}` map for state reconstruction |


<!-- END SKILL: figma-generate-library -->

<!-- START SKILL: figma-implement-design -->

---
name: "figma-implement-design"
description: "Translate Figma nodes into production-ready code with 1:1 visual fidelity using the Figma MCP workflow (design context, screenshots, assets, and project-convention translation). Trigger when the user provides Figma URLs or node IDs, or asks to implement designs or components that must match Figma specs. Requires a working Figma MCP server connection."
---


# Implement Design

## Overview

This skill provides a structured workflow for translating Figma designs into production-ready code with pixel-perfect accuracy. It ensures consistent integration with the Figma MCP server, proper use of design tokens, and 1:1 visual parity with designs.

## Prerequisites

- Figma MCP server must be connected and accessible
- User must provide a Figma URL in the format: `https://figma.com/design/:fileKey/:fileName?node-id=1-2`
  - `:fileKey` is the file key
  - `1-2` is the node ID (the specific component or frame to implement)
- **OR** when using `figma-desktop` MCP: User can select a node directly in the Figma desktop app (no URL required)
- Project should have an established design system or component library (preferred)

## Required Workflow

**Follow these steps in order. Do not skip steps.**

### Step 0: Set up Figma MCP (if not already configured)

If any MCP call fails because Figma MCP is not connected, pause and set it up:

1. Add the Figma MCP:
   - `codex mcp add figma --url https://mcp.figma.com/mcp`
2. Enable remote MCP client:
   - Set `[features].rmcp_client = true` in `config.toml` **or** run `codex --enable rmcp_client`
3. Log in with OAuth:
   - `codex mcp login figma`

After successful login, the user will have to restart codex. You should finish your answer and tell them so when they try again they can continue with Step 1.

### Step 1: Get Node ID

#### Option A: Parse from Figma URL

When the user provides a Figma URL, extract the file key and node ID to pass as arguments to MCP tools.

**URL format:** `https://figma.com/design/:fileKey/:fileName?node-id=1-2`

**Extract:**

- **File key:** `:fileKey` (the segment after `/design/`)
- **Node ID:** `1-2` (the value of the `node-id` query parameter)

**Note:** When using the local desktop MCP (`figma-desktop`), `fileKey` is not passed as a parameter to tool calls. The server automatically uses the currently open file, so only `nodeId` is needed.

**Example:**

- URL: `https://figma.com/design/kL9xQn2VwM8pYrTb4ZcHjF/DesignSystem?node-id=42-15`
- File key: `kL9xQn2VwM8pYrTb4ZcHjF`
- Node ID: `42-15`

#### Option B: Use Current Selection from Figma Desktop App (figma-desktop MCP only)

When using the `figma-desktop` MCP and the user has NOT provided a URL, the tools automatically use the currently selected node from the open Figma file in the desktop app.

**Note:** Selection-based prompting only works with the `figma-desktop` MCP server. The remote server requires a link to a frame or layer to extract context. The user must have the Figma desktop app open with a node selected.

### Step 2: Fetch Design Context

Run `get_design_context` with the extracted file key and node ID.

```
get_design_context(fileKey=":fileKey", nodeId="1-2")
```

This provides the structured data including:

- Layout properties (Auto Layout, constraints, sizing)
- Typography specifications
- Color values and design tokens
- Component structure and variants
- Spacing and padding values

**If the response is too large or truncated:**

1. Run `get_metadata(fileKey=":fileKey", nodeId="1-2")` to get the high-level node map
2. Identify the specific child nodes needed from the metadata
3. Fetch individual child nodes with `get_design_context(fileKey=":fileKey", nodeId=":childNodeId")`

### Step 3: Capture Visual Reference

Run `get_screenshot` with the same file key and node ID for a visual reference.

```
get_screenshot(fileKey=":fileKey", nodeId="1-2")
```

This screenshot serves as the source of truth for visual validation. Keep it accessible throughout implementation.

### Step 4: Download Required Assets

Download any assets (images, icons, SVGs) returned by the Figma MCP server.

**IMPORTANT:** Follow these asset rules:

- If the Figma MCP server returns a `localhost` source for an image or SVG, use that source directly
- DO NOT import or add new icon packages - all assets should come from the Figma payload
- DO NOT use or create placeholders if a `localhost` source is provided
- Assets are served through the Figma MCP server's built-in assets endpoint

### Step 5: Translate to Project Conventions

Translate the Figma output into this project's framework, styles, and conventions.

**Key principles:**

- Treat the Figma MCP output (typically React + Tailwind) as a representation of design and behavior, not as final code style
- Replace Tailwind utility classes with the project's preferred utilities or design system tokens
- Reuse existing components (buttons, inputs, typography, icon wrappers) instead of duplicating functionality
- Use the project's color system, typography scale, and spacing tokens consistently
- Respect existing routing, state management, and data-fetch patterns

### Step 6: Achieve 1:1 Visual Parity

Strive for pixel-perfect visual parity with the Figma design.

**Guidelines:**

- Prioritize Figma fidelity to match designs exactly
- Avoid hardcoded values - use design tokens from Figma where available
- When conflicts arise between design system tokens and Figma specs, prefer design system tokens but adjust spacing or sizes minimally to match visuals
- Follow WCAG requirements for accessibility
- Add component documentation as needed

### Step 7: Validate Against Figma

Before marking complete, validate the final UI against the Figma screenshot.

**Validation checklist:**

- [ ] Layout matches (spacing, alignment, sizing)
- [ ] Typography matches (font, size, weight, line height)
- [ ] Colors match exactly
- [ ] Interactive states work as designed (hover, active, disabled)
- [ ] Responsive behavior follows Figma constraints
- [ ] Assets render correctly
- [ ] Accessibility standards met

## Implementation Rules

### Component Organization

- Place UI components in the project's designated design system directory
- Follow the project's component naming conventions
- Avoid inline styles unless truly necessary for dynamic values

### Design System Integration

- ALWAYS use components from the project's design system when possible
- Map Figma design tokens to project design tokens
- When a matching component exists, extend it rather than creating a new one
- Document any new components added to the design system

### Code Quality

- Avoid hardcoded values - extract to constants or design tokens
- Keep components composable and reusable
- Add TypeScript types for component props
- Include JSDoc comments for exported components

## Examples

### Example 1: Implementing a Button Component

User says: "Implement this Figma button component: https://figma.com/design/kL9xQn2VwM8pYrTb4ZcHjF/DesignSystem?node-id=42-15"

**Actions:**

1. Parse URL to extract fileKey=`kL9xQn2VwM8pYrTb4ZcHjF` and nodeId=`42-15`
2. Run `get_design_context(fileKey="kL9xQn2VwM8pYrTb4ZcHjF", nodeId="42-15")`
3. Run `get_screenshot(fileKey="kL9xQn2VwM8pYrTb4ZcHjF", nodeId="42-15")` for visual reference
4. Download any button icons from the assets endpoint
5. Check if project has existing button component
6. If yes, extend it with new variant; if no, create new component using project conventions
7. Map Figma colors to project design tokens (e.g., `primary-500`, `primary-hover`)
8. Validate against screenshot for padding, border radius, typography

**Result:** Button component matching Figma design, integrated with project design system.

### Example 2: Building a Dashboard Layout

User says: "Build this dashboard: https://figma.com/design/pR8mNv5KqXzGwY2JtCfL4D/Dashboard?node-id=10-5"

**Actions:**

1. Parse URL to extract fileKey=`pR8mNv5KqXzGwY2JtCfL4D` and nodeId=`10-5`
2. Run `get_metadata(fileKey="pR8mNv5KqXzGwY2JtCfL4D", nodeId="10-5")` to understand the page structure
3. Identify main sections from metadata (header, sidebar, content area, cards) and their child node IDs
4. Run `get_design_context(fileKey="pR8mNv5KqXzGwY2JtCfL4D", nodeId=":childNodeId")` for each major section
5. Run `get_screenshot(fileKey="pR8mNv5KqXzGwY2JtCfL4D", nodeId="10-5")` for the full page
6. Download all assets (logos, icons, charts)
7. Build layout using project's layout primitives
8. Implement each section using existing components where possible
9. Validate responsive behavior against Figma constraints

**Result:** Complete dashboard matching Figma design with responsive layout.

## Best Practices

### Always Start with Context

Never implement based on assumptions. Always fetch `get_design_context` and `get_screenshot` first.

### Incremental Validation

Validate frequently during implementation, not just at the end. This catches issues early.

### Document Deviations

If you must deviate from the Figma design (e.g., for accessibility or technical constraints), document why in code comments.

### Reuse Over Recreation

Always check for existing components before creating new ones. Consistency across the codebase is more important than exact Figma replication.

### Design System First

When in doubt, prefer the project's design system patterns over literal Figma translation.

## Common Issues and Solutions

### Issue: Figma output is truncated

**Cause:** The design is too complex or has too many nested layers to return in a single response.
**Solution:** Use `get_metadata` to get the node structure, then fetch specific nodes individually with `get_design_context`.

### Issue: Design doesn't match after implementation

**Cause:** Visual discrepancies between the implemented code and the original Figma design.
**Solution:** Compare side-by-side with the screenshot from Step 3. Check spacing, colors, and typography values in the design context data.

### Issue: Assets not loading

**Cause:** The Figma MCP server's assets endpoint is not accessible or the URLs are being modified.
**Solution:** Verify the Figma MCP server's assets endpoint is accessible. The server serves assets at `localhost` URLs. Use these directly without modification.

### Issue: Design token values differ from Figma

**Cause:** The project's design system tokens have different values than those specified in the Figma design.
**Solution:** When project tokens differ from Figma values, prefer project tokens for consistency but adjust spacing/sizing to maintain visual fidelity.

## Understanding Design Implementation

The Figma implementation workflow establishes a reliable process for translating designs to code:

**For designers:** Confidence that implementations will match their designs with pixel-perfect accuracy.
**For developers:** A structured approach that eliminates guesswork and reduces back-and-forth revisions.
**For teams:** Consistent, high-quality implementations that maintain design system integrity.

By following this workflow, you ensure that every Figma design is implemented with the same level of care and attention to detail.

## Additional Resources

- [Figma MCP Server Documentation](https://developers.figma.com/docs/figma-mcp-server/)
- [Figma MCP Server Tools and Prompts](https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/)
- [Figma Variables and Design Tokens](https://help.figma.com/hc/en-us/articles/15339657135383-Guide-to-variables-in-Figma)


<!-- END SKILL: figma-implement-design -->

<!-- START SKILL: figma-use -->

---
name: figma-use
description: "**MANDATORY prerequisite** — you MUST invoke this skill BEFORE every `use_figma` tool call. NEVER call `use_figma` directly without loading this skill first. Skipping it causes common, hard-to-debug failures. Trigger whenever the user wants to perform a write action or a unique read action that requires JavaScript execution in the Figma file context — e.g. create/edit/delete nodes, set up variables or tokens, build components and variants, modify auto-layout or fills, bind variables to properties, or inspect file structure programmatically."
---

# use_figma — Figma Plugin API Skill

Use `use_figma` MCP to execute JavaScript in Figma files via the Plugin API. All detailed reference docs live in `references/`.

**Always pass `skillNames: "figma-use"` when calling `use_figma`.** This is a logging parameter used to track skill usage — it does not affect execution.

**If the task involves building or updating a full page, screen, or multi-section layout in Figma from code**, also load [figma-generate-design](../figma-generate-design/SKILL.md). It provides the workflow for discovering design system components via `search_design_system`, importing them, and assembling screens incrementally. Both skills work together: this one for the API rules, that one for the screen-building workflow.

Before anything, load [plugin-api-standalone.index.md](references/plugin-api-standalone.index.md) to understand what is possible. When you are asked to write plugin API code, use this context to grep [plugin-api-standalone.d.ts](references/plugin-api-standalone.d.ts) for relevant types, methods, and properties. This is the definitive source of truth for the API surface. It is a large typings file, so do not load it all at once, grep for relevant sections as needed.

IMPORTANT: Whenever you work with design systems, start with [working-with-design-systems/wwds.md](references/working-with-design-systems/wwds.md) to understand the key concepts, processes, and guidelines for working with design systems in Figma. Then load the more specific references for components, variables, text styles, and effect styles as needed.

## 1. Critical Rules

1.  **Use `return` to send data back.** The return value is JSON-serialized automatically (objects, arrays, strings, numbers). Do NOT call `figma.closePlugin()` or wrap code in an async IIFE — this is handled for you.
2.  **Write plain JavaScript with top-level `await` and `return`.** Code is automatically wrapped in an async context. Do NOT wrap in `(async () => { ... })()`.
3.  `figma.notify()` **throws "not implemented"** — never use it
3a. `getPluginData()` / `setPluginData()` are **not supported** in `use_figma` — do not use them. Use `getSharedPluginData()` / `setSharedPluginData()` instead (these ARE supported), or track node IDs by returning them and passing them to subsequent calls.
4.  `console.log()` is NOT returned — use `return` for output
5.  **Work incrementally in small steps.** Break large operations into multiple `use_figma` calls. Validate after each step. This is the single most important practice for avoiding bugs.
6.  Colors are **0–1 range** (not 0–255): `{r: 1, g: 0, b: 0}` = red
7.  Fills/strokes are **read-only arrays** — clone, modify, reassign
8.  Font **MUST** be loaded before any text operation: `await figma.loadFontAsync({family, style})`
9.  **Pages load incrementally** — use `await figma.setCurrentPageAsync(page)` to switch pages and load their content (see Page Rules below)
10. `setBoundVariableForPaint` returns a **NEW** paint — must capture and reassign
11. `createVariable` accepts collection **object or ID string** (object preferred)
12. **`layoutSizingHorizontal/Vertical = 'FILL'` MUST be set AFTER `parent.appendChild(child)`** — setting before append throws. Same applies to `'HUG'` on non-auto-layout nodes.
13. **Position new top-level nodes away from (0,0).** Nodes appended directly to the page default to (0,0). Scan `figma.currentPage.children` to find a clear position (e.g., to the right of the rightmost node). This only applies to page-level nodes — nodes nested inside other frames or auto-layout containers are positioned by their parent. See [Gotchas](references/gotchas.md).
14. **On `use_figma` error, STOP. Do NOT immediately retry.** Failed scripts are **atomic** — if a script errors, it is not executed at all and no changes are made to the file. Read the error message carefully, fix the script, then retry. See [Error Recovery](#6-error-recovery--self-correction).
15. **MUST `return` ALL created/mutated node IDs.** Whenever a script creates new nodes or mutates existing ones on the canvas, collect every affected node ID and return them in a structured object (e.g. `return { createdNodeIds: [...], mutatedNodeIds: [...] }`). This is essential for subsequent calls to reference, validate, or clean up those nodes.
16. **Always set `variable.scopes` explicitly when creating variables.** The default `ALL_SCOPES` pollutes every property picker — almost never what you want. Use specific scopes like `["FRAME_FILL", "SHAPE_FILL"]` for backgrounds, `["TEXT_FILL"]` for text colors, `["GAP"]` for spacing, etc. See [variable-patterns.md](references/variable-patterns.md) for the full list.
17. **`await` every Promise.** Never leave a Promise unawaited — unawaited async calls (e.g. `figma.loadFontAsync(...)` without `await`, or `figma.setCurrentPageAsync(page)` without `await`) will fire-and-forget, causing silent failures or race conditions. The script may return before the async operation completes, leading to missing data or half-applied changes.

> For detailed WRONG/CORRECT examples of each rule, see [Gotchas & Common Mistakes](references/gotchas.md).

## 2. Page Rules (Critical)

**Page context resets between `use_figma` calls** — `figma.currentPage` starts on the first page each time.

### Switching pages

Use `await figma.setCurrentPageAsync(page)` to switch pages and load their content. The sync setter `figma.currentPage = page` **throws an error** in `use_figma` runtimes.

```js
// Switch to a specific page (loads its content)
const targetPage = figma.root.children.find((p) => p.name === "My Page");
await figma.setCurrentPageAsync(targetPage);
// targetPage.children is now populated

// Iterate over all pages
for (const page of figma.root.children) {
  await figma.setCurrentPageAsync(page);
  // page.children is now loaded — read or modify them here
}
```

### Across script runs

`figma.currentPage` resets to the **first page** at the start of each `use_figma` call. If your workflow spans multiple calls and targets a non-default page, call `await figma.setCurrentPageAsync(page)` at the start of each invocation.

You can call `use_figma` multiple times to incrementally build on the file state, or to retrieve information before writing another script. For example, write a script to get metadata about existing nodes, `return` that data, then use it in a subsequent script to modify those nodes.

## 3. `return` Is Your Output Channel

The agent sees **ONLY** the value you `return`. Everything else is invisible.

- **Returning IDs (CRITICAL)**: Every script that creates or mutates canvas nodes **MUST** return all affected node IDs — e.g. `return { createdNodeIds: [...], mutatedNodeIds: [...] }`. This is a hard requirement, not optional.
- **Progress reporting**: `return { createdNodeIds: [...], count: 5, errors: [] }`
- **Error info**: Thrown errors are automatically captured and returned — just let them propagate or `throw` explicitly.
- `console.log()` output is **never** returned to the agent
- Always return actionable data (IDs, counts, status) so subsequent calls can reference created objects

## 4. Editor Mode

`use_figma` works in **design mode** (editorType `"figma"`, the default). FigJam (`"figjam"`) has a different set of available node types — most design nodes are blocked there.

Available in design mode: Rectangle, Frame, Component, Text, Ellipse, Star, Line, Vector, Polygon, BooleanOperation, Slice, Page, Section, TextPath.

**Blocked** in design mode: Sticky, Connector, ShapeWithText, CodeBlock, Slide, SlideRow, Webpage.

## 5. Incremental Workflow (How to Avoid Bugs)

The most common cause of bugs is trying to do too much in a single `use_figma` call. **Work in small steps and validate after each one.**

### The pattern

1. **Inspect first.** Before creating anything, run a read-only `use_figma` to discover what already exists in the file — pages, components, variables, naming conventions. Match what's there.
2. **Do one thing per call.** Create variables in one call, create components in the next, compose layouts in another. Don't try to build an entire screen in one script.
3. **Return IDs from every call.** Always `return` created node IDs, variable IDs, collection IDs as objects (e.g. `return { createdNodeIds: [...] }`). You'll need these as inputs to subsequent calls.
4. **Validate after each step.** Use `get_metadata` to verify structure (counts, names, hierarchy, positions). Use `get_screenshot` after major milestones to catch visual issues.
5. **Fix before moving on.** If validation reveals a problem, fix it before proceeding to the next step. Don't build on a broken foundation.

### Suggested step order for complex tasks

```
Step 1: Inspect file — discover existing pages, components, variables, conventions
Step 2: Create tokens/variables (if needed)
       → validate with get_metadata
Step 3: Create individual components
       → validate with get_metadata + get_screenshot
Step 4: Compose layouts from component instances
       → validate with get_screenshot
Step 5: Final verification
```

### What to validate at each step

| After... | Check with `get_metadata` | Check with `get_screenshot` |
|---|---|---|
| Creating variables | Collection count, variable count, mode names | — |
| Creating components | Child count, variant names, property definitions | Variants visible, not collapsed, grid readable |
| Binding variables | Node properties reflect bindings | Colors/tokens resolved correctly |
| Composing layouts | Instance nodes have mainComponent, hierarchy correct | No cropped/clipped text, no overlapping elements, correct spacing |

## 6. Error Recovery & Self-Correction

**`use_figma` is atomic — failed scripts do not execute.** If a script errors, no changes are made to the file. The file remains in the same state as before the call. This means there are no partial nodes, no orphaned elements from the failed script, and retrying after a fix is safe.

### When `use_figma` returns an error

1. **STOP.** Do not immediately fix the code and retry.
2. **Read the error message carefully.** Understand exactly what went wrong — wrong API usage, missing font, invalid property value, etc.
3. **If the error is unclear**, call `get_metadata` or `get_screenshot` to understand the current file state.
4. **Fix the script** based on the error message.
5. **Retry** the corrected script.

### Common self-correction patterns

| Error message | Likely cause | How to fix |
|---|---|---|
| `"not implemented"` | Used `figma.notify()` | Remove it — use `return` for output |
| `"node must be an auto-layout frame..."` | Set `FILL`/`HUG` before appending to auto-layout parent | Move `appendChild` before `layoutSizingX = 'FILL'` |
| `"Setting figma.currentPage is not supported"` | Used sync page setter | Use `await figma.setCurrentPageAsync(page)` |
| Property value out of range | Color channel > 1 (used 0–255 instead of 0–1) | Divide by 255 |
| `"Cannot read properties of null"` | Node doesn't exist (wrong ID, wrong page) | Check page context, verify ID |
| Script hangs / no response | Infinite loop or unresolved promise | Check for `while(true)` or missing `await`; ensure code terminates |
| `"The node with id X does not exist"` | Parent instance was implicitly detached by a child `detachInstance()`, changing IDs | Re-discover nodes by traversal from a stable (non-instance) parent frame |

### When the script succeeds but the result looks wrong

1. Call `get_metadata` to check structural correctness (hierarchy, counts, positions).
2. Call `get_screenshot` to check visual correctness. Look closely for cropped/clipped text (line heights cutting off content) and overlapping elements — these are common and easy to miss.
3. Identify the discrepancy — is it structural (wrong hierarchy, missing nodes) or visual (wrong colors, broken layout, clipped content)?
4. Write a targeted fix script that modifies only the broken parts — don't recreate everything.

> For the full validation workflow, see [Validation & Error Recovery](references/validation-and-recovery.md).

## 7. Pre-Flight Checklist

Before submitting ANY `use_figma` call, verify:

- [ ] Code uses `return` to send data back (NOT `figma.closePlugin()`)
- [ ] Code is NOT wrapped in an async IIFE (auto-wrapped for you)
- [ ] `return` value includes structured data with actionable info (IDs, counts)
- [ ] NO usage of `figma.notify()` anywhere
- [ ] NO usage of `console.log()` as output (use `return` instead)
- [ ] All colors use 0–1 range (not 0–255)
- [ ] Fills/strokes are reassigned as new arrays (not mutated in place)
- [ ] Page switches use `await figma.setCurrentPageAsync(page)` (sync setter throws)
- [ ] `layoutSizingVertical/Horizontal = 'FILL'` is set AFTER `parent.appendChild(child)`
- [ ] `loadFontAsync()` called BEFORE any text property changes
- [ ] `lineHeight`/`letterSpacing` use `{unit, value}` format (not bare numbers)
- [ ] `resize()` is called BEFORE setting sizing modes (resize resets them to FIXED)
- [ ] For multi-step workflows: IDs from previous calls are passed as string literals (not variables)
- [ ] New top-level nodes are positioned away from (0,0) to avoid overlapping existing content
- [ ] ALL created/mutated node IDs are collected and included in the `return` value
- [ ] Every async call (`loadFontAsync`, `setCurrentPageAsync`, `importComponentByKeyAsync`, etc.) is `await`ed — no fire-and-forget Promises

## 8. Discover Conventions Before Creating

**Always inspect the Figma file before creating anything.** Different files use different naming conventions, variable structures, and component patterns. Your code should match what's already there, not impose new conventions.

When in doubt about any convention (naming, scoping, structure), check the Figma file first, then the user's codebase. Only fall back to common patterns when neither exists.

### Quick inspection scripts

**List all pages and top-level nodes:**
```js
const pages = figma.root.children.map(p => `${p.name} id=${p.id} children=${p.children.length}`);
return pages.join('\n');
```

**List existing components across all pages:**
```js
const results = [];
for (const page of figma.root.children) {
  await figma.setCurrentPageAsync(page);
  page.findAll(n => {
    if (n.type === 'COMPONENT' || n.type === 'COMPONENT_SET')
      results.push(`[${page.name}] ${n.name} (${n.type}) id=${n.id}`);
    return false;
  });
}
return results.join('\n');
```

**List existing variable collections and their conventions:**
```js
const collections = await figma.variables.getLocalVariableCollectionsAsync();
const results = collections.map(c => ({
  name: c.name, id: c.id,
  varCount: c.variableIds.length,
  modes: c.modes.map(m => m.name)
}));
return results;
```

## 9. Reference Docs

Load these as needed based on what your task involves:

| Doc | When to load | What it covers |
|-----|-------------|----------------|
| [gotchas.md](references/gotchas.md) | Before any `use_figma` | Every known pitfall with WRONG/CORRECT code examples |
| [common-patterns.md](references/common-patterns.md) | Need working code examples | Script scaffolds: shapes, text, auto-layout, variables, components, multi-step workflows |
| [plugin-api-patterns.md](references/plugin-api-patterns.md) | Creating/editing nodes | Fills, strokes, Auto Layout, effects, grouping, cloning, styles |
| [api-reference.md](references/api-reference.md) | Need exact API surface | Node creation, variables API, core properties, what works and what doesn't |
| [validation-and-recovery.md](references/validation-and-recovery.md) | Multi-step writes or error recovery | `get_metadata` vs `get_screenshot` workflow, mandatory error recovery steps |
| [component-patterns.md](references/component-patterns.md) | Creating components/variants | combineAsVariants, component properties, INSTANCE_SWAP, variant layout, discovering existing components, metadata traversal |
| [variable-patterns.md](references/variable-patterns.md) | Creating/binding variables | Collections, modes, scopes, aliasing, binding patterns, discovering existing variables |
| [text-style-patterns.md](references/text-style-patterns.md) | Creating/applying text styles | Type ramps, font probing, listing styles, applying styles to nodes |
| [effect-style-patterns.md](references/effect-style-patterns.md) | Creating/applying effect styles | Drop shadows, listing styles, applying styles to nodes |
| [plugin-api-standalone.index.md](references/plugin-api-standalone.index.md) | Need to understand the full API surface | Index of all types, methods, and properties in the Plugin API |
| [plugin-api-standalone.d.ts](references/plugin-api-standalone.d.ts) | Need exact type signatures | Full typings file — grep for specific symbols, don't load all at once |

## 10. Snippet examples

You will see snippets throughout documentation here. These snippets contain useful plugin API code that can be repurposed. Use them as is, or as starter code as you go. If there are key concepts that are best documented as generic snippets, call them out and write to disk so you can reuse in the future.


<!-- END SKILL: figma-use -->

<!-- START SKILL: frontend-skill -->

---
name: frontend-skill
description: Use when the task asks for a visually strong landing page, website, app, prototype, demo, or game UI. This skill enforces restrained composition, image-led hierarchy, cohesive content structure, and tasteful motion while avoiding generic cards, weak branding, and UI clutter.
---

# Frontend Skill

Use this skill when the quality of the work depends on art direction, hierarchy, restraint, imagery, and motion rather than component count.

Goal: ship interfaces that feel deliberate, premium, and current. Default toward award-level composition: one big idea, strong imagery, sparse copy, rigorous spacing, and a small number of memorable motions.

## Working Model

Before building, write three things:

- visual thesis: one sentence describing mood, material, and energy
- content plan: hero, support, detail, final CTA
- interaction thesis: 2-3 motion ideas that change the feel of the page

Each section gets one job, one dominant visual idea, and one primary takeaway or action.

## Beautiful Defaults

- Start with composition, not components.
- Prefer a full-bleed hero or full-canvas visual anchor.
- Make the brand or product name the loudest text.
- Keep copy short enough to scan in seconds.
- Use whitespace, alignment, scale, cropping, and contrast before adding chrome.
- Limit the system: two typefaces max, one accent color by default.
- Default to cardless layouts. Use sections, columns, dividers, lists, and media blocks instead.
- Treat the first viewport as a poster, not a document.

## Landing Pages

Default sequence:

1. Hero: brand or product, promise, CTA, and one dominant visual
2. Support: one concrete feature, offer, or proof point
3. Detail: atmosphere, workflow, product depth, or story
4. Final CTA: convert, start, visit, or contact

Hero rules:

- One composition only.
- Full-bleed image or dominant visual plane.
- Canonical full-bleed rule: on branded landing pages, the hero itself must run edge-to-edge with no inherited page gutters, framed container, or shared max-width; constrain only the inner text/action column.
- Brand first, headline second, body third, CTA fourth.
- No hero cards, stat strips, logo clouds, pill soup, or floating dashboards by default.
- Keep headlines to roughly 2-3 lines on desktop and readable in one glance on mobile.
- Keep the text column narrow and anchored to a calm area of the image.
- All text over imagery must maintain strong contrast and clear tap targets.

If the first viewport still works after removing the image, the image is too weak. If the brand disappears after hiding the nav, the hierarchy is too weak.

Viewport budget:

- If the first screen includes a sticky/fixed header, that header counts against the hero. The combined header + hero content must fit within the initial viewport at common desktop and mobile sizes.
- When using `100vh`/`100svh` heroes, subtract persistent UI chrome (`calc(100svh - header-height)`) or overlay the header instead of stacking it in normal flow.

## Apps

Default to Linear-style restraint:

- calm surface hierarchy
- strong typography and spacing
- few colors
- dense but readable information
- minimal chrome
- cards only when the card is the interaction

For app UI, organize around:

- primary workspace
- navigation
- secondary context or inspector
- one clear accent for action or state

Avoid:

- dashboard-card mosaics
- thick borders on every region
- decorative gradients behind routine product UI
- multiple competing accent colors
- ornamental icons that do not improve scanning

If a panel can become plain layout without losing meaning, remove the card treatment.

## Imagery

Imagery must do narrative work.

- Use at least one strong, real-looking image for brands, venues, editorial pages, and lifestyle products.
- Prefer in-situ photography over abstract gradients or fake 3D objects.
- Choose or crop images with a stable tonal area for text.
- Do not use images with embedded signage, logos, or typographic clutter fighting the UI.
- Do not generate images with built-in UI frames, splits, cards, or panels.
- If multiple moments are needed, use multiple images, not one collage.

The first viewport needs a real visual anchor. Decorative texture is not enough.

## Copy

- Write in product language, not design commentary.
- Let the headline carry the meaning.
- Supporting copy should usually be one short sentence.
- Cut repetition between sections.
- Do not include prompt language or design commentary into the UI.
- Give every section one responsibility: explain, prove, deepen, or convert.

If deleting 30 percent of the copy improves the page, keep deleting.

## Utility Copy For Product UI

When the work is a dashboard, app surface, admin tool, or operational workspace, default to utility copy over marketing copy.

- Prioritize orientation, status, and action over promise, mood, or brand voice.
- Start with the working surface itself: KPIs, charts, filters, tables, status, or task context. Do not introduce a hero section unless the user explicitly asks for one.
- Section headings should say what the area is or what the user can do there.
- Good: "Selected KPIs", "Plan status", "Search metrics", "Top segments", "Last sync".
- Avoid aspirational hero lines, metaphors, campaign-style language, and executive-summary banners on product surfaces unless specifically requested.
- Supporting text should explain scope, behavior, freshness, or decision value in one sentence.
- If a sentence could appear in a homepage hero or ad, rewrite it until it sounds like product UI.
- If a section does not help someone operate, monitor, or decide, remove it.
- Litmus check: if an operator scans only headings, labels, and numbers, can they understand the page immediately?

## Motion

Use motion to create presence and hierarchy, not noise.

Ship at least 2-3 intentional motions for visually led work:

- one entrance sequence in the hero
- one scroll-linked, sticky, or depth effect
- one hover, reveal, or layout transition that sharpens affordance

Prefer Framer Motion when available for:

- section reveals
- shared layout transitions
- scroll-linked opacity, translate, or scale shifts
- sticky storytelling
- carousels that advance narrative, not just fill space
- menus, drawers, and modal presence effects

Motion rules:

- noticeable in a quick recording
- smooth on mobile
- fast and restrained
- consistent across the page
- removed if ornamental only

## Hard Rules

- No cards by default.
- No hero cards by default.
- No boxed or center-column hero when the brief calls for full bleed.
- No more than one dominant idea per section.
- No section should need many tiny UI devices to explain itself.
- No headline should overpower the brand on branded pages.
- No filler copy.
- No split-screen hero unless text sits on a calm, unified side.
- No more than two typefaces without a clear reason.
- No more than one accent color unless the product already has a strong system.

## Reject These Failures

- Generic SaaS card grid as the first impression
- Beautiful image with weak brand presence
- Strong headline with no clear action
- Busy imagery behind text
- Sections that repeat the same mood statement
- Carousel with no narrative purpose
- App UI made of stacked cards instead of layout

## Litmus Checks

- Is the brand or product unmistakable in the first screen?
- Is there one strong visual anchor?
- Can the page be understood by scanning headlines only?
- Does each section have one job?
- Are cards actually necessary?
- Does motion improve hierarchy or atmosphere?
- Would the design still feel premium if all decorative shadows were removed?


<!-- END SKILL: frontend-skill -->

<!-- START SKILL: gh-address-comments -->

---
name: gh-address-comments
description: Help address review/issue comments on the open GitHub PR for the current branch using gh CLI; verify gh auth first and prompt the user to authenticate if not logged in.
metadata:
  short-description: Address comments in a GitHub PR review
---

# PR Comment Handler

Guide to find the open PR for the current branch and address its comments with gh CLI. Run all `gh` commands with elevated network access.

Prereq: ensure `gh` is authenticated (for example, run `gh auth login` once), then run `gh auth status` with escalated permissions (include workflow/repo scopes) so `gh` commands succeed. If sandboxing blocks `gh auth status`, rerun it with `sandbox_permissions=require_escalated`.

## 1) Inspect comments needing attention
- Run scripts/fetch_comments.py which will print out all the comments and review threads on the PR

## 2) Ask the user for clarification
- Number all the review threads and comments and provide a short summary of what would be required to apply a fix for it
- Ask the user which numbered comments should be addressed

## 3) If user chooses comments
- Apply fixes for the selected comments

Notes:
- If gh hits auth/rate issues mid-run, prompt the user to re-authenticate with `gh auth login`, then retry.


<!-- END SKILL: gh-address-comments -->

<!-- START SKILL: gh-fix-ci -->

# CI/CD & Pipeline Synchronization Playbook (gh-fix-ci)

Core instructions for debugging failing GitHub Actions pipelines, fixing monorepo build-graph errors, and resolving CI check blockers.

---

## 1. Context & Operational Scope
Use this skill when checking or fixing files in the `.github/workflows/` directory, resolving build failures on CI, or fixing lint/test regressions before merging.

### Target Workflows:
*   `quality-gate.yml`: The central type-checking and unit-testing pipeline.
*   `pr-guard.yml`: Pull request sanity and check validations.
*   `web-deploy.yml`: Static asset compile and CDN sync actions.

---

## 2. Debugging Strategy
When a CI step fails:
1.  **Retrieve CI logs**: Do not guess what failed. Inspect the output or run the specific compiler step locally.
2.  **Reproduce locally**: Run the identical turbo task inside the workspace:
    ```powershell
    pnpm run build --filter=<affected-package>
    ```
3.  **Audit the Build Graph**: If a module resolution failure occurs, verify `package.json` exports and dependency versions in `pnpm-workspace.yaml`.

---

## 3. Resolving TypeScript & Linting Blockers
> [!IMPORTANT]
> Never bypass type checking or disable compiler rules in CI configurations. Fix the underlying type safety issues or resolve pathing discrepancies directly in code.

*   **Type Failures (`TS2307`, `TS2882`)**: Verify imports are mapped correctly inside `tsconfig.json`. Ensure absolute path aliases are cleanly resolved under Node ESM.
*   **Unused Imports / Variables**: Run our monorepo linter locally to catch unused variables before committing:
    ```powershell
    pnpm run lint --fix
    ```
*   **Turbo Cache Poisoning**: If local builds pass but CI fails with mysterious cached artifacts, clear caches locally:
    ```powershell
    pnpm exec turbo clean
    ```


<!-- END SKILL: gh-fix-ci -->

<!-- START SKILL: growthbook-feature-rollout -->

---
title: "GrowthBook Feature Rollout Developer Skill"
status: "active"
created: 2026-06-21
updated: 2026-06-21
author: "Naveen"
scribe: "Antigravity"
tags: [growthbook, feature-flags, rollout, skills]
---

# GrowthBook Feature Rollout Developer Skill

This playbook guides the implementation and extension of feature management and experiments using the GrowthBook JS SDK within the Polymath Platform.

## Core Integration Rules

### 1. Zero Native Pollution in `@repo/core`
Never import `react-native` or native storage libraries (like MMKV or AsyncStorage) directly inside packages that are shared with web/server targets.
Always map storage to the `StorageManager` proxy using custom polyfills.

```typescript
import { GrowthBook, setPolyfills } from '@growthbook/growthbook';
import { storage } from '../../lib/storage';

setPolyfills({
  localStorage: {
    getItem: (key) => storage.getString(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  }
});
```

### 2. State & Caching Architecture
* **Zustand (`useFeatureStore`)**: In-memory, reactive state engine for UI reads.
* **MMKV (`SafeZustandStorage`)**: Synchronous disk caching provider that persists resolved flags.
* **Instant Launch**: On cold-start, hydrate Zustand immediately from the MMKV-backed cache to prevent visual flickers. Do not await remote network fetches before drawing the UI.

### 3. Hexagonal Decoupling
UI components must never import `@growthbook/growthbook` or `@growthbook/growthbook-react` directly.
Always use the [IFeatureRolloutPort](file:///c:/Users/Naween/projects/polymath-platform/packages/core/src/logic/ports/featureRollout.port.ts) and evaluate flags through decoupled custom hooks (e.g. `useFeature`).

### 4. Telemetry Binding
Bind the GrowthBook `trackingCallback` to the existing analytics port (`IAnalyticsPort`) to automatically track A/B test exposures:

```typescript
const gb = new GrowthBook({
  trackingCallback: (experiment, result) => {
    analytics.track("Experiment Viewed", {
      experimentId: experiment.key,
      variationId: result.key,
    });
  }
});
```


<!-- END SKILL: growthbook-feature-rollout -->

<!-- START SKILL: imagegen -->

---
name: "imagegen"
description: "Generate or edit raster images when the task benefits from AI-created bitmap visuals such as photos, illustrations, textures, sprites, mockups, or transparent-background cutouts. Use when Codex should create a brand-new image, transform an existing image, or derive visual variants from references, and the output should be a bitmap asset rather than repo-native code or vector. Do not use when the task is better handled by editing existing SVG/vector/code-native assets, extending an established icon or logo system, or building the visual directly in HTML/CSS/canvas."
---

# Image Generation Skill

Generates or edits images for the current project (for example website assets, game assets, UI mockups, product mockups, wireframes, logo design, photorealistic images, or infographics).

## Top-level modes and rules

This skill has exactly two top-level modes:

- **Default built-in tool mode (preferred):** built-in `image_gen` tool for normal image generation and editing. Does not require `OPENAI_API_KEY`.
- **Fallback CLI mode (explicit-only):** `scripts/image_gen.py` CLI. Use only when the user explicitly asks for the CLI path. Requires `OPENAI_API_KEY`.

Within the explicit CLI fallback only, the CLI exposes three subcommands:

- `generate`
- `edit`
- `generate-batch`

Rules:
- Use the built-in `image_gen` tool by default for all normal image generation and editing requests.
- Never switch to CLI fallback automatically.
- If the built-in tool fails or is unavailable, tell the user the CLI fallback exists and that it requires `OPENAI_API_KEY`. Proceed only if the user explicitly asks for that fallback.
- If the user explicitly asks for CLI mode, use the bundled `scripts/image_gen.py` workflow. Do not create one-off SDK runners.
- Never modify `scripts/image_gen.py`. If something is missing, ask the user before doing anything else.

Built-in save-path policy:
- In built-in tool mode, Codex saves generated images under `$CODEX_HOME/*` by default.
- Do not describe or rely on OS temp as the default built-in destination.
- Do not describe or rely on a destination-path argument (if any) on the built-in `image_gen` tool. If a specific location is needed, generate first and then move or copy the selected output from `$CODEX_HOME/generated_images/...`.
- Save-path precedence in built-in mode:
  1. If the user names a destination, move or copy the selected output there.
  2. If the image is meant for the current project, move or copy the final selected image into the workspace before finishing.
  3. If the image is only for preview or brainstorming, render it inline; the underlying file can remain at the default `$CODEX_HOME/*` path.
- Never leave a project-referenced asset only at the default `$CODEX_HOME/*` path.
- Do not overwrite an existing asset unless the user explicitly asked for replacement; otherwise create a sibling versioned filename such as `hero-v2.png` or `item-icon-edited.png`.

Shared prompt guidance for both modes lives in `references/prompting.md` and `references/sample-prompts.md`.

Fallback-only docs/resources for CLI mode:
- `references/cli.md`
- `references/image-api.md`
- `references/codex-network.md`
- `scripts/image_gen.py`

## When to use
- Generate a new image (concept art, product shot, cover, website hero)
- Generate a new image using one or more reference images for style, composition, or mood
- Edit an existing image (inpainting, lighting or weather transformations, background replacement, object removal, compositing, transparent background)
- Produce many assets or variants for one task

## When not to use
- Extending or matching an existing SVG/vector icon set, logo system, or illustration library inside the repo
- Creating simple shapes, diagrams, wireframes, or icons that are better produced directly in SVG, HTML/CSS, or canvas
- Making a small project-local asset edit when the source file already exists in an editable native format
- Any task where the user clearly wants deterministic code-native output instead of a generated bitmap

## Decision tree

Think about two separate questions:

1. **Intent:** is this a new image or an edit of an existing image?
2. **Execution strategy:** is this one asset or many assets/variants?

Intent:
- If the user wants to modify an existing image while preserving parts of it, treat the request as **edit**.
- If the user provides images only as references for style, composition, mood, or subject guidance, treat the request as **generate**.
- If the user provides no images, treat the request as **generate**.

Built-in edit semantics:
- Built-in edit mode is for images already visible in the conversation context, such as attached images or images generated earlier in the thread.
- If the user wants to edit a local image file with the built-in tool, first load it with built-in `view_image` tool so the image is visible in the conversation context, then proceed with the built-in edit flow.
- Do not promise arbitrary filesystem-path editing through the built-in tool.
- If a local file still needs direct file-path control, masks, or other explicit CLI-only parameters, use the explicit CLI fallback only when the user asks for it.
- For edits, preserve invariants aggressively and save non-destructively by default.

Execution strategy:
- In the built-in default path, produce many assets or variants by issuing one `image_gen` call per requested asset or variant.
- In the explicit CLI fallback path, use the CLI `generate-batch` subcommand only when the user explicitly chose CLI mode and needs many prompts/assets.

Assume the user wants a new image unless they clearly ask to change an existing one.

## Workflow
1. Decide the top-level mode: built-in by default, fallback CLI only if explicitly requested.
2. Decide the intent: `generate` or `edit`.
3. Decide whether the output is preview-only or meant to be consumed by the current project.
4. Decide the execution strategy: single asset vs repeated built-in calls vs CLI `generate-batch`.
5. Collect inputs up front: prompt(s), exact text (verbatim), constraints/avoid list, and any input images.
6. For every input image, label its role explicitly:
   - reference image
   - edit target
   - supporting insert/style/compositing input
7. If the edit target is only on the local filesystem and you are staying on the built-in path, inspect it with `view_image` first so the image is available in conversation context.
8. If the user asked for a photo, illustration, sprite, product image, banner, or other explicitly raster-style asset, use `image_gen` rather than substituting SVG/HTML/CSS placeholders. If the request is for an icon, logo, or UI graphic that should match existing repo-native SVG/vector/code assets, prefer editing those directly instead.
9. Augment the prompt based on specificity:
   - If the user's prompt is already specific and detailed, normalize it into a clear spec without adding creative requirements.
   - If the user's prompt is generic, add tasteful augmentation only when it materially improves output quality.
10. Use the built-in `image_gen` tool by default.
11. If the user explicitly chooses the CLI fallback, then and only then use the fallback-only docs for quality, `input_fidelity`, masks, output format, output paths, and network setup.
12. Inspect outputs and validate: subject, style, composition, text accuracy, and invariants/avoid items.
13. Iterate with a single targeted change, then re-check.
14. For preview-only work, render the image inline; the underlying file may remain at the default `$CODEX_HOME/generated_images/...` path.
15. For project-bound work, move or copy the selected artifact into the workspace and update any consuming code or references. Never leave a project-referenced asset only at the default `$CODEX_HOME/generated_images/...` path.
16. For batches, persist only the selected finals in the workspace unless the user explicitly asked to keep discarded variants.
17. Always report the final saved path for any workspace-bound asset, plus the final prompt and whether the built-in tool or fallback CLI mode was used.

## Prompt augmentation

Reformat user prompts into a structured, production-oriented spec. Make the user's goal clearer and more actionable, but do not blindly add detail.

Treat this as prompt-shaping guidance, not a closed schema. Use only the lines that help, and add a short extra labeled line when it materially improves clarity.

### Specificity policy

Use the user's prompt specificity to decide how much augmentation is appropriate:

- If the prompt is already specific and detailed, preserve that specificity and only normalize/structure it.
- If the prompt is generic, you may add tasteful augmentation when it will materially improve the result.

Allowed augmentations:
- composition or framing hints
- polish level or intended-use hints
- practical layout guidance
- reasonable scene concreteness that supports the stated request

Not allowed augmentations:
- extra characters or objects that are not implied by the request
- brand names, slogans, palettes, or narrative beats that are not implied
- arbitrary side-specific placement unless the surrounding layout supports it

## Use-case taxonomy (exact slugs)

Classify each request into one of these buckets and keep the slug consistent across prompts and references.

Generate:
- photorealistic-natural — candid/editorial lifestyle scenes with real texture and natural lighting.
- product-mockup — product/packaging shots, catalog imagery, merch concepts.
- ui-mockup — app/web interface mockups and wireframes; specify the desired fidelity.
- infographic-diagram — diagrams/infographics with structured layout and text.
- logo-brand — logo/mark exploration, vector-friendly.
- illustration-story — comics, children’s book art, narrative scenes.
- stylized-concept — style-driven concept art, 3D/stylized renders.
- historical-scene — period-accurate/world-knowledge scenes.

Edit:
- text-localization — translate/replace in-image text, preserve layout.
- identity-preserve — try-on, person-in-scene; lock face/body/pose.
- precise-object-edit — remove/replace a specific element (including interior swaps).
- lighting-weather — time-of-day/season/atmosphere changes only.
- background-extraction — transparent background / clean cutout.
- style-transfer — apply reference style while changing subject/scene.
- compositing — multi-image insert/merge with matched lighting/perspective.
- sketch-to-render — drawing/line art to photoreal render.

## Shared prompt schema

Use the following labeled spec as shared prompt scaffolding for both top-level modes:

```text
Use case: <taxonomy slug>
Asset type: <where the asset will be used>
Primary request: <user's main prompt>
Input images: <Image 1: role; Image 2: role> (optional)
Scene/backdrop: <environment>
Subject: <main subject>
Style/medium: <photo/illustration/3D/etc>
Composition/framing: <wide/close/top-down; placement>
Lighting/mood: <lighting + mood>
Color palette: <palette notes>
Materials/textures: <surface details>
Text (verbatim): "<exact text>"
Constraints: <must keep/must avoid>
Avoid: <negative constraints>
```

Notes:
- `Asset type` and `Input images` are prompt scaffolding, not dedicated CLI flags.
- `Scene/backdrop` refers to the visual setting. It is not the same as the fallback CLI `background` parameter, which controls output transparency behavior.
- Fallback-only execution notes such as `Quality:`, `Input fidelity:`, masks, output format, and output paths belong in the explicit CLI path only. Do not treat them as built-in `image_gen` tool arguments.

Augmentation rules:
- Keep it short.
- Add only the details needed to improve the prompt materially.
- For edits, explicitly list invariants (`change only X; keep Y unchanged`).
- If any critical detail is missing and blocks success, ask a question; otherwise proceed.

## Examples

### Generation example (hero image)
```text
Use case: product-mockup
Asset type: landing page hero
Primary request: a minimal hero image of a ceramic coffee mug
Style/medium: clean product photography
Composition/framing: wide composition with usable negative space for page copy if needed
Lighting/mood: soft studio lighting
Constraints: no logos, no text, no watermark
```

### Edit example (invariants)
```text
Use case: precise-object-edit
Asset type: product photo background replacement
Primary request: replace only the background with a warm sunset gradient
Constraints: change only the background; keep the product and its edges unchanged; no text; no watermark
```

## Prompting best practices
- Structure prompt as scene/backdrop -> subject -> details -> constraints.
- Include intended use (ad, UI mock, infographic) to set the mode and polish level.
- Use camera/composition language for photorealism.
- Only use SVG/vector stand-ins when the user explicitly asked for vector output or a non-image placeholder.
- Quote exact text and specify typography + placement.
- For tricky words, spell them letter-by-letter and require verbatim rendering.
- For multi-image inputs, reference images by index and describe how they should be used.
- For edits, repeat invariants every iteration to reduce drift.
- Iterate with single-change follow-ups.
- If the prompt is generic, add only the extra detail that will materially help.
- If the prompt is already detailed, normalize it instead of expanding it.
- For explicit CLI fallback only, see `references/cli.md` and `references/image-api.md` for `quality`, `input_fidelity`, masks, output format, and output-path guidance.

More principles shared by both modes: `references/prompting.md`.
Copy/paste specs shared by both modes: `references/sample-prompts.md`.

## Guidance by asset type
Asset-type templates (website assets, game assets, wireframes, logo) are consolidated in `references/sample-prompts.md`.

## Fallback CLI mode only

### Temp and output conventions
These conventions apply only to the explicit CLI fallback. They do not describe built-in `image_gen` output behavior.
- Use `tmp/imagegen/` for intermediate files (for example JSONL batches); delete them when done.
- Write final artifacts under `output/imagegen/`.
- Use `--out` or `--out-dir` to control output paths; keep filenames stable and descriptive.

### Dependencies
Prefer `uv` for dependency management in this repo.

Required Python package:
```bash
uv pip install openai
```

Optional for downscaling only:
```bash
uv pip install pillow
```

Portability note:
- If you are using the installed skill outside this repo, install dependencies into that environment with its package manager.
- In uv-managed environments, `uv pip install ...` remains the preferred path.

### Environment
- `OPENAI_API_KEY` must be set for live API calls.
- Do not ask the user for `OPENAI_API_KEY` when using the built-in `image_gen` tool.
- Never ask the user to paste the full key in chat. Ask them to set it locally and confirm when ready.

If the key is missing, give the user these steps:
1. Create an API key in the OpenAI platform UI: https://platform.openai.com/api-keys
2. Set `OPENAI_API_KEY` as an environment variable in their system.
3. Offer to guide them through setting the environment variable for their OS/shell if needed.

If installation is not possible in this environment, tell the user which dependency is missing and how to install it into their active environment.

### Script-mode notes
- CLI commands + examples: `references/cli.md`
- API parameter quick reference: `references/image-api.md`
- Network approvals / sandbox settings for CLI mode: `references/codex-network.md`

## Reference map
- `references/prompting.md`: shared prompting principles for both modes.
- `references/sample-prompts.md`: shared copy/paste prompt recipes for both modes.
- `references/cli.md`: fallback-only CLI usage via `scripts/image_gen.py`.
- `references/image-api.md`: fallback-only API/CLI parameter reference.
- `references/codex-network.md`: fallback-only network/sandbox troubleshooting for CLI mode.
- `scripts/image_gen.py`: fallback-only CLI implementation. Do not load or use it unless the user explicitly chooses CLI mode.


<!-- END SKILL: imagegen -->

<!-- START SKILL: intentional-ui-design -->

---
name: intentional-ui-design
description: Elevate UI, UX, and visual craft across product surfaces without falling back to generic boilerplate styling. Use when Codex needs to redesign or refine frontend/mobile interfaces, define or extend a custom design system, improve information hierarchy, create more intentional layouts, translate a brand mood into reusable tokens/components, or evolve one shared design doctrine across multiple apps while preserving each product's own dialect across Expo React Native, React/TypeScript web apps, Astro/Svelte sites, and shared UI packages.
---

# Intentional UI Design

Build interfaces with a clear point of view, stronger hierarchy, and a reusable system rather than one-off decoration. Treat aesthetics, usability, motion, accessibility, and implementation constraints as one design problem.

## Doctrine and Dialects

When the repo contains multiple products with their own visual identity, do not force them into one identical style.

Model the system in two layers:
- shared doctrine: the deeper laws the product family shares
- app dialect: the way one app expresses those laws

Shared doctrine usually owns:
- semantic token logic
- spacing discipline
- contrast and readability rules
- component anatomy
- motion temperament
- material philosophy

App dialect usually owns:
- density
- compositional tone
- accent emphasis
- ornament level
- scenic vs operational mood
- how warm, sacred, playful, clinical, or diagrammatic the surface feels

In this repo, assume the goal is usually:
- family resemblance without cloning
- reuse without flattening
- one grammar, many expressions

Before redesigning, explicitly decide:
1. What belongs to the shared doctrine?
2. What belongs to this app's dialect?
3. What belongs only to this screen?

## Alive Interface Mode

When the user's intent points toward aliveness, scenic wonder, translucency, material depth, or nature-derived visual feeling, do not collapse the request into ordinary glassmorphism, neumorphism, or flat modern SaaS styling.

Interpret the direction as:
- living surfaces, not decorative overlays
- inner luminosity, not generic outer glow
- micro-variation, not uniform fills
- ecological color relationships, not isolated accent colors
- temporal change, not static perfection
- tactile invitation, not cold efficiency

Ask of every important surface:
"Does this feel alive or does it feel manufactured?"

If it feels manufactured, introduce system-level causes of aliveness:
- subtle warm-to-cool variation within a surface
- depth that suggests atmosphere, water, vellum, leaf, sky, or aurora
- quiet asymmetry or irregularity where appropriate
- motion that breathes, drifts, or settles rather than snaps mechanically
- detail density focused near important moments rather than everywhere

## Workflow

1. Identify the surface.
   Confirm which app or package is in scope before changing visuals.
   In the `polymath-platform` repo, read the relevant app context first, inspect `packages/ui`, and identify whether the request is about doctrine, dialect, or one surface.

2. Diagnose before designing.
   Audit the current UI for:
   - bland or default typography
   - weak hierarchy
   - token drift across screens
   - inconsistent spacing/radius/shadow rules
   - low-contrast or inaccessible states
   - motion with no meaning or no motion where orientation is needed

3. Write a compact design direction.
   Summarize:
   - shared doctrine in 1-2 lines
   - app dialect in 1-2 lines
   - brand mood in 3-5 adjectives
   - interaction tone
   - visual metaphors
   - what this surface must never feel like
   Keep the direction short enough to guide implementation decisions.

4. Convert the direction into system primitives.
   Prefer reusable primitives over page-specific styling:
   - color roles, not just colors
   - type scale, not isolated font sizes
   - spacing rhythm
   - corner radius rules
   - elevation or glass rules
   - motion tempos
   - component states

5. Map the design system to the active stack.
   - Expo React Native: use shared tokens and cross-platform primitives; respect touch targets, safe areas, and mobile ergonomics.
   - Astro/Svelte sites: preserve narrative pacing, stronger composition, and expressive visual identity; avoid generic Tailwind landing-page patterns.
   - React/TypeScript web apps: prioritize task clarity, state clarity, density control, and keyboard/accessibility support.

6. Implement at the right level.
   Prefer edits in shared tokens or shared components when the change is doctrinal. Keep dialect-specific expression in app-level composition, variants, and selective overrides. Only style locally when the surface is intentionally unique.

7. Validate visually and behaviorally.
   Check:
   - visual hierarchy at a glance
   - mobile and desktop responsiveness
   - hover/focus/pressed/disabled/loading/empty/error states
   - accessibility contrast and readable sizing
   - whether the result still feels like the product family

## Default Deliverables

When the request is exploratory or broad, provide these artifacts implicitly in the work:
1. A short design direction statement.
2. A proposed token or component change list.
3. The implementation itself when feasible.
4. A brief note on tradeoffs, especially when consistency and uniqueness compete.

## Design Heuristics

- Design from intent, not trend.
- Make one visual idea dominant; let supporting elements stay quiet.
- Use contrast in size, weight, spacing, and density before adding more color.
- Avoid flat sameness: vary rhythm, framing, and emphasis deliberately.
- Prefer scenic depth over fashionable polish when the product calls for wonder.
- Keep decorative motifs tied to meaning; do not scatter effects randomly.
- Build families of components with shared anatomy and state behavior.
- Let a product keep its own visual dialect if the underlying grammar stays coherent.
- Let accessibility improve the aesthetic by enforcing clarity.

## Anti-Patterns

- Default Tailwind dashboard or landing-page look with no brand point of view.
- Forcing every app in a monorepo to look like the same product.
- Mixing multiple visual languages on one screen.
- Adding gradients, blur, glass, or shadows without interaction purpose.
- Mistaking "alive" for "busy" and covering everything in effects.
- Hardcoding colors and spacing in leaf components when tokens should own them.
- Rebuilding new components when a variant of an existing primitive is enough.
- Making web and native look identical when they should feel related but platform-appropriate.

## Polymath Platform Guidance

When working in `C:\Users\Naween\projects\polymath-platform`, read [references/polymath-platform.md](./references/polymath-platform.md).
Use it to align with the repo's shared doctrine, app dialects, shared UI package, and app-specific context files.

When defining or extending a house design system, read [references/design-system-playbook.md](./references/design-system-playbook.md).
Use it to turn aesthetic direction into tokens, primitives, variants, and rollout steps.

When the direction is specifically Gurudevi or "alive interface" work, read [references/gurudevi-aliveness.md](./references/gurudevi-aliveness.md).
Use it to ground implementation in the repo's existing design constitution rather than generic design trends.


<!-- END SKILL: intentional-ui-design -->

<!-- START SKILL: jupyter-notebook -->

---
name: "jupyter-notebook"
description: "Use when the user asks to create, scaffold, or edit Jupyter notebooks (`.ipynb`) for experiments, explorations, or tutorials; prefer the bundled templates and run the helper script `new_notebook.py` to generate a clean starting notebook."
---


# Jupyter Notebook Skill

Create clean, reproducible Jupyter notebooks for two primary modes:

- Experiments and exploratory analysis
- Tutorials and teaching-oriented walkthroughs

Prefer the bundled templates and the helper script for consistent structure and fewer JSON mistakes.

## When to use
- Create a new `.ipynb` notebook from scratch.
- Convert rough notes or scripts into a structured notebook.
- Refactor an existing notebook to be more reproducible and skimmable.
- Build experiments or tutorials that will be read or re-run by other people.

## Decision tree
- If the request is exploratory, analytical, or hypothesis-driven, choose `experiment`.
- If the request is instructional, step-by-step, or audience-specific, choose `tutorial`.
- If editing an existing notebook, treat it as a refactor: preserve intent and improve structure.

## Skill path (set once)

```bash
export CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
export JUPYTER_NOTEBOOK_CLI="$CODEX_HOME/skills/jupyter-notebook/scripts/new_notebook.py"
```

User-scoped skills install under `$CODEX_HOME/skills` (default: `~/.codex/skills`).

## Workflow
1. Lock the intent.
Identify the notebook kind: `experiment` or `tutorial`.
Capture the objective, audience, and what "done" looks like.

2. Scaffold from the template.
Use the helper script to avoid hand-authoring raw notebook JSON.

```bash
uv run --python 3.12 python "$JUPYTER_NOTEBOOK_CLI" \
  --kind experiment \
  --title "Compare prompt variants" \
  --out output/jupyter-notebook/compare-prompt-variants.ipynb
```

```bash
uv run --python 3.12 python "$JUPYTER_NOTEBOOK_CLI" \
  --kind tutorial \
  --title "Intro to embeddings" \
  --out output/jupyter-notebook/intro-to-embeddings.ipynb
```

3. Fill the notebook with small, runnable steps.
Keep each code cell focused on one step.
Add short markdown cells that explain the purpose and expected result.
Avoid large, noisy outputs when a short summary works.

4. Apply the right pattern.
For experiments, follow `references/experiment-patterns.md`.
For tutorials, follow `references/tutorial-patterns.md`.

5. Edit safely when working with existing notebooks.
Preserve the notebook structure; avoid reordering cells unless it improves the top-to-bottom story.
Prefer targeted edits over full rewrites.
If you must edit raw JSON, review `references/notebook-structure.md` first.

6. Validate the result.
Run the notebook top-to-bottom when the environment allows.
If execution is not possible, say so explicitly and call out how to validate locally.
Use the final pass checklist in `references/quality-checklist.md`.

## Templates and helper script
- Templates live in `assets/experiment-template.ipynb` and `assets/tutorial-template.ipynb`.
- The helper script loads a template, updates the title cell, and writes a notebook.

Script path:
- `$JUPYTER_NOTEBOOK_CLI` (installed default: `$CODEX_HOME/skills/jupyter-notebook/scripts/new_notebook.py`)

## Temp and output conventions
- Use `tmp/jupyter-notebook/` for intermediate files; delete when done.
- Write final artifacts under `output/jupyter-notebook/` when working in this repo.
- Use stable, descriptive filenames (for example, `ablation-temperature.ipynb`).

## Dependencies (install only when needed)
Prefer `uv` for dependency management.

Optional Python packages for local notebook execution:

```bash
uv pip install jupyterlab ipykernel
```

The bundled scaffold script uses only the Python standard library and does not require extra dependencies.

## Environment
No required environment variables.

## Reference map
- `references/experiment-patterns.md`: experiment structure and heuristics.
- `references/tutorial-patterns.md`: tutorial structure and teaching flow.
- `references/notebook-structure.md`: notebook JSON shape and safe editing rules.
- `references/quality-checklist.md`: final validation checklist.


<!-- END SKILL: jupyter-notebook -->

<!-- START SKILL: linear -->

---
name: linear
description: Manage issues, projects & team workflows in Linear. Use when the user wants to read, create or updates tickets in Linear.
metadata:
  short-description: Manage Linear issues in Codex
---

# Linear

## Overview

This skill provides a structured workflow for managing issues, projects & team workflows in Linear. It ensures consistent integration with the Linear MCP server, which offers natural-language project management for issues, projects, documentation, and team collaboration.

## Prerequisites
- Linear MCP server must be connected and accessible via OAuth
- Confirm access to the relevant Linear workspace, teams, and projects

## Required Workflow

**Follow these steps in order. Do not skip steps.**

### Step 0: Set up Linear MCP (if not already configured)

If any MCP call fails because Linear MCP is not connected, pause and set it up:

1. Add the Linear MCP:
   - `codex mcp add linear --url https://mcp.linear.app/mcp`
2. Enable remote MCP client:
   - Set `[features] rmcp_client = true` in `config.toml` **or** run `codex --enable rmcp_client`
3. Log in with OAuth:
   - `codex mcp login linear`

After successful login, the user will have to restart codex. You should finish your answer and tell them so when they try again they can continue with Step 1.

**Windows/WSL note:** If you see connection errors on Windows, try configuring the Linear MCP to run via WSL:
```json
{"mcpServers": {"linear": {"command": "wsl", "args": ["npx", "-y", "mcp-remote", "https://mcp.linear.app/sse", "--transport", "sse-only"]}}}
```

### Step 1
Clarify the user's goal and scope (e.g., issue triage, sprint planning, documentation audit, workload balance). Confirm team/project, priority, labels, cycle, and due dates as needed.

### Step 2
Select the appropriate workflow (see Practical Workflows below) and identify the Linear MCP tools you will need. Confirm required identifiers (issue ID, project ID, team key) before calling tools.

### Step 3
Execute Linear MCP tool calls in logical batches:
- Read first (list/get/search) to build context.
- Create or update next (issues, projects, labels, comments) with all required fields.
- For bulk operations, explain the grouping logic before applying changes.

### Step 4
Summarize results, call out remaining gaps or blockers, and propose next actions (additional issues, label changes, assignments, or follow-up comments).

## Available Tools

Issue Management: `list_issues`, `get_issue`, `create_issue`, `update_issue`, `list_my_issues`, `list_issue_statuses`, `list_issue_labels`, `create_issue_label`

Project & Team: `list_projects`, `get_project`, `create_project`, `update_project`, `list_teams`, `get_team`, `list_users`

Documentation & Collaboration: `list_documents`, `get_document`, `search_documentation`, `list_comments`, `create_comment`, `list_cycles`

## Practical Workflows

- Sprint Planning: Review open issues for a target team, pick top items by priority, and create a new cycle (e.g., "Q1 Performance Sprint") with assignments.
- Bug Triage: List critical/high-priority bugs, rank by user impact, and move the top items to "In Progress."
- Documentation Audit: Search documentation (e.g., API auth), then open labeled "documentation" issues for gaps or outdated sections with detailed fixes.
- Team Workload Balance: Group active issues by assignee, flag anyone with high load, and suggest or apply redistributions.
- Release Planning: Create a project (e.g., "v2.0 Release") with milestones (feature freeze, beta, docs, launch) and generate issues with estimates.
- Cross-Project Dependencies: Find all "blocked" issues, identify blockers, and create linked issues if missing.
- Automated Status Updates: Find your issues with stale updates and add status comments based on current state/blockers.
- Smart Labeling: Analyze unlabeled issues, suggest/apply labels, and create missing label categories.
- Sprint Retrospectives: Generate a report for the last completed cycle, note completed vs. pushed work, and open discussion issues for patterns.

## Tips for Maximum Productivity

- Batch operations for related changes; consider smart templates for recurring issue structures.
- Use natural queries when possible ("Show me what John is working on this week").
- Leverage context: reference prior issues in new requests.
- Break large updates into smaller batches to avoid rate limits; cache or reuse filters when listing frequently.

## Troubleshooting

- Authentication: Clear browser cookies, re-run OAuth, verify workspace permissions, ensure API access is enabled.
- Tool Calling Errors: Confirm the model supports multiple tool calls, provide all required fields, and split complex requests.
- Missing Data: Refresh token, verify workspace access, check for archived projects, and confirm correct team selection.
- Performance: Remember Linear API rate limits; batch bulk operations, use specific filters, or cache frequent queries.


<!-- END SKILL: linear -->

<!-- START SKILL: netlify-deploy -->

---
name: netlify-deploy
description: Deploy web projects to Netlify using the Netlify CLI (`npx netlify`). Use when the user asks to deploy, host, publish, or link a site/repo on Netlify, including preview and production deploys.
---

# Netlify Deployment Skill

Deploy web projects to Netlify using the Netlify CLI with intelligent detection of project configuration and deployment context.

## Overview

This skill automates Netlify deployments by:
- Verifying Netlify CLI authentication
- Detecting project configuration and framework
- Linking to existing sites or creating new ones
- Deploying to production or preview environments

## Prerequisites

- **Netlify CLI**: Installed via npx (no global install required)
- **Authentication**: Netlify account with active login session
- **Project**: Valid web project in current directory
- When sandboxing blocks the deployment network calls, rerun with `sandbox_permissions=require_escalated`.
- The deployment might take a few minutes. Use appropriate timeout values.

## Authentication Pattern

The skill uses the **pre-authenticated Netlify CLI** approach:

1. Check authentication status with `npx netlify status`
2. If not authenticated, guide user through `npx netlify login`
3. Fail gracefully if authentication cannot be established

Authentication uses either:
- **Browser-based OAuth** (primary): `netlify login` opens browser for authentication
- **API Key** (alternative): Set `NETLIFY_AUTH_TOKEN` environment variable

## Workflow

### 1. Verify Netlify CLI Authentication

Check if the user is logged into Netlify:

```bash
npx netlify status
```

**Expected output patterns**:
- ✅ Authenticated: Shows logged-in user email and site link status
- ❌ Not authenticated: "Not logged into any site" or authentication error

**If not authenticated**, guide the user:

```bash
npx netlify login
```

This opens a browser window for OAuth authentication. Wait for user to complete login, then verify with `netlify status` again.

**Alternative: API Key authentication**

If browser authentication isn't available, users can set:

```bash
export NETLIFY_AUTH_TOKEN=your_token_here
```

Tokens can be generated at: https://app.netlify.com/user/applications#personal-access-tokens

### 2. Detect Site Link Status

From `netlify status` output, determine:
- **Linked**: Site already connected to Netlify (shows site name/URL)
- **Not linked**: Need to link or create site

### 3. Link to Existing Site or Create New

**If already linked** → Skip to step 4

**If not linked**, attempt to link by Git remote:

```bash
# Check if project is Git-based
git remote show origin

# If Git-based, extract remote URL
# Format: https://github.com/username/repo or git@github.com:username/repo.git

# Try to link by Git remote
npx netlify link --git-remote-url <REMOTE_URL>
```

**If link fails** (site doesn't exist on Netlify):

```bash
# Create new site interactively
npx netlify init
```

This guides user through:
1. Choosing team/account
2. Setting site name
3. Configuring build settings
4. Creating netlify.toml if needed

### 4. Verify Dependencies

Before deploying, ensure project dependencies are installed:

```bash
# For npm projects
npm install

# For other package managers, detect and use appropriate command
# yarn install, pnpm install, etc.
```

### 5. Deploy to Netlify

Choose deployment type based on context:

**Preview/Draft Deploy** (default for existing sites):

```bash
npx netlify deploy
```

This creates a deploy preview with a unique URL for testing.

**Production Deploy** (for new sites or explicit production deployments):

```bash
npx netlify deploy --prod
```

This deploys to the live production URL.

**Deployment process**:
1. CLI detects build settings (from netlify.toml or prompts user)
2. Builds the project locally
3. Uploads built assets to Netlify
4. Returns deployment URL

### 6. Report Results

After deployment, report to user:
- **Deploy URL**: Unique URL for this deployment
- **Site URL**: Production URL (if production deploy)
- **Deploy logs**: Link to Netlify dashboard for logs
- **Next steps**: Suggest `netlify open` to view site or dashboard

## Handling netlify.toml

If a `netlify.toml` file exists, the CLI uses it automatically. If not, the CLI will prompt for:
- **Build command**: e.g., `npm run build`, `next build`
- **Publish directory**: e.g., `dist`, `build`, `.next`

Common framework defaults:
- **Next.js**: build command `npm run build`, publish `.next`
- **React (Vite)**: build command `npm run build`, publish `dist`
- **Static HTML**: no build command, publish current directory

The skill should detect framework from `package.json` if possible and suggest appropriate settings.

## Example Full Workflow

```bash
# 1. Check authentication
npx netlify status

# If not authenticated:
npx netlify login

# 2. Link site (if needed)
# Try Git-based linking first
git remote show origin
npx netlify link --git-remote-url https://github.com/user/repo

# If no site exists, create new one:
npx netlify init

# 3. Install dependencies
npm install

# 4. Deploy (preview for testing)
npx netlify deploy

# 5. Deploy to production (when ready)
npx netlify deploy --prod
```

## Error Handling

Common issues and solutions:

**"Not logged in"**
→ Run `npx netlify login`

**"No site linked"**
→ Run `npx netlify link` or `npx netlify init`

**"Build failed"**
→ Check build command and publish directory in netlify.toml or CLI prompts
→ Verify dependencies are installed
→ Review build logs for specific errors

**"Publish directory not found"**
→ Verify build command ran successfully
→ Check publish directory path is correct

## Troubleshooting

### Escalated Network Access

If deployment fails due to network issues (timeouts, DNS errors, connection resets), rerun the deploy with escalated permissions (use `sandbox_permissions=require_escalated`). The deploy requires escalated network access when sandbox networking blocks outbound requests.

Example guidance to the user:

```
The deploy needs escalated network access to deploy to Netlify. I can rerun the command with escalated permissions—want me to proceed?
```

## Environment Variables

For secrets and configuration:

1. Never commit secrets to Git
2. Set in Netlify dashboard: Site Settings → Environment Variables
3. Access in builds via `process.env.VARIABLE_NAME`

## Tips

- Use `netlify deploy` (no `--prod`) first to test before production
- Run `netlify open` to view site in Netlify dashboard
- Run `netlify logs` to view function logs (if using Netlify Functions)
- Use `netlify dev` for local development with Netlify Functions

## Reference

- Netlify CLI Docs: https://docs.netlify.com/cli/get-started/
- netlify.toml Reference: https://docs.netlify.com/configure-builds/file-based-configuration/

## Bundled References (Load As Needed)

- [CLI commands](references/cli-commands.md)
- [Deployment patterns](references/deployment-patterns.md)
- [netlify.toml guide](references/netlify-toml.md)


<!-- END SKILL: netlify-deploy -->

<!-- START SKILL: open-source-maintainer -->

# Monorepo Integrity & Release Readiness Playbook (open-source-maintainer)

Core operational manuals for maintaining package boundaries, synchronizing dependencies, resolving schema drifts, and verifying release-readiness.

---

## 1. Context & Operational Scope
Use this skill when auditing imports across workspaces, reorganizing packages, running dependency syncs, or performing pre-release sanity checks across the monorepo.

---

## 2. Monorepo Boundaries & Dependency Management
*   **Syncpack Discipline**: Every workspace dependency must match identical version structures to prevent caching compilation errors on Turbo.
*   **Import Boundaries**: App packages (`apps/*`) must never import directly from nested folders of other app directories. Shared primitives must live in `packages/*` and be imported as clean workspace packages.
*   **Package Manifest Rules**: Ensure all package dependencies are declared inside their specific `package.json` configurations (rather than relying on root hoist allocations).

---

## 3. The Release Readiness Audit
> [!IMPORTANT]
> Before proposing a pull request merge, execute a full verification suite to ensure zero regressions are introduced.

1.  **Compile sanity check**: Build the entire workspace to check for module export conflicts:
    ```powershell
    pnpm run build
    ```
2.  **Linting & Style Checks**: Ensure code meets all standards by running biome / eslint rules:
    ```powershell
    pnpm run lint
    ```
3.  **Syncpack Audits**: Run dependency checks to catch any mismatched third-party packages:
    ```powershell
    pnpm syncpack list
    ```


<!-- END SKILL: open-source-maintainer -->

<!-- START SKILL: openai-docs -->

---
name: "openai-docs"
description: "Use when the user asks how to build with OpenAI products or APIs and needs up-to-date official documentation with citations, help choosing the latest model for a use case, or explicit GPT-5.4 upgrade and prompt-upgrade guidance; prioritize OpenAI docs MCP tools, use bundled references only as helper context, and restrict any fallback browsing to official OpenAI domains."
---


# OpenAI Docs

Provide authoritative, current guidance from OpenAI developer docs using the developers.openai.com MCP server. Always prioritize the developer docs MCP tools over web.run for OpenAI-related questions. This skill may also load targeted files from `references/` for model-selection and GPT-5.4-specific requests, but current OpenAI docs remain authoritative. Only if the MCP server is installed and returns no meaningful results should you fall back to web search.

## Quick start

- Use `mcp__openaiDeveloperDocs__search_openai_docs` to find the most relevant doc pages.
- Use `mcp__openaiDeveloperDocs__fetch_openai_doc` to pull exact sections and quote/paraphrase accurately.
- Use `mcp__openaiDeveloperDocs__list_openai_docs` only when you need to browse or discover pages without a clear query.
- Load only the relevant file from `references/` when the question is about model selection or a GPT-5.4 upgrade.

## OpenAI product snapshots

1. Apps SDK: Build ChatGPT apps by providing a web component UI and an MCP server that exposes your app's tools to ChatGPT.
2. Responses API: A unified endpoint designed for stateful, multimodal, tool-using interactions in agentic workflows.
3. Chat Completions API: Generate a model response from a list of messages comprising a conversation.
4. Codex: OpenAI's coding agent for software development that can write, understand, review, and debug code.
5. gpt-oss: Open-weight OpenAI reasoning models (gpt-oss-120b and gpt-oss-20b) released under the Apache 2.0 license.
6. Realtime API: Build low-latency, multimodal experiences including natural speech-to-speech conversations.
7. Agents SDK: A toolkit for building agentic apps where a model can use tools and context, hand off to other agents, stream partial results, and keep a full trace.

## If MCP server is missing

If MCP tools fail or no OpenAI docs resources are available:

1. Run the install command yourself: `codex mcp add openaiDeveloperDocs --url https://developers.openai.com/mcp`
2. If it fails due to permissions/sandboxing, immediately retry the same command with escalated permissions and include a 1-sentence justification for approval. Do not ask the user to run it yet.
3. Only if the escalated attempt fails, ask the user to run the install command.
4. Ask the user to restart Codex.
5. Re-run the doc search/fetch after restart.

## Workflow

1. Clarify the product scope and whether the request is general docs lookup, model selection, a GPT-5.4 upgrade, or a GPT-5.4 prompt upgrade.
2. If it is a model-selection request, load `references/latest-model.md`.
3. If it is an explicit GPT-5.4 upgrade request, load `references/upgrading-to-gpt-5p4.md`.
4. If the upgrade may require prompt changes, or the workflow is research-heavy, tool-heavy, coding-oriented, multi-agent, or long-running, also load `references/gpt-5p4-prompting-guide.md`.
5. Search docs with a precise query.
6. Fetch the best page and the exact section needed (use `anchor` when possible).
7. For GPT-5.4 upgrade reviews, always make the per-usage-site output explicit: target model, starting reasoning recommendation, `phase` assessment when relevant, prompt blocks, and compatibility status.
8. Answer with concise guidance and cite the doc source, using the reference files only as helper context.

## Reference map

Read only what you need:

- `references/latest-model.md` -> model-selection and "best/latest/current model" questions; verify every recommendation against current OpenAI docs before answering.
- `references/upgrading-to-gpt-5p4.md` -> only for explicit GPT-5.4 upgrade and upgrade-planning requests; verify the checklist and compatibility guidance against current OpenAI docs before answering.
- `references/gpt-5p4-prompting-guide.md` -> prompt rewrites and prompt-behavior upgrades for GPT-5.4; verify prompting guidance against current OpenAI docs before answering.

## Quality rules

- Treat OpenAI docs as the source of truth; avoid speculation.
- Keep quotes short and within policy limits; prefer paraphrase with citations.
- If multiple pages differ, call out the difference and cite both.
- Reference files are convenience guides only; for volatile guidance such as recommended models, upgrade instructions, or prompting advice, current OpenAI docs always win.
- If docs do not cover the user’s need, say so and offer next steps.

## Tooling notes

- Always use MCP doc tools before any web search for OpenAI-related questions.
- If the MCP server is installed but returns no meaningful results, then use web search as a fallback.
- When falling back to web search, restrict to official OpenAI domains (developers.openai.com, platform.openai.com) and cite sources.


<!-- END SKILL: openai-docs -->

<!-- START SKILL: pdf -->

---
name: "pdf"
description: "Use when tasks involve reading, creating, or reviewing PDF files where rendering and layout matter; prefer visual checks by rendering pages (Poppler) and use Python tools such as `reportlab`, `pdfplumber`, and `pypdf` for generation and extraction."
---


# PDF Skill

## When to use
- Read or review PDF content where layout and visuals matter.
- Create PDFs programmatically with reliable formatting.
- Validate final rendering before delivery.

## Workflow
1. Prefer visual review: render PDF pages to PNGs and inspect them.
   - Use `pdftoppm` if available.
   - If unavailable, install Poppler or ask the user to review the output locally.
2. Use `reportlab` to generate PDFs when creating new documents.
3. Use `pdfplumber` (or `pypdf`) for text extraction and quick checks; do not rely on it for layout fidelity.
4. After each meaningful update, re-render pages and verify alignment, spacing, and legibility.

## Temp and output conventions
- Use `tmp/pdfs/` for intermediate files; delete when done.
- Write final artifacts under `output/pdf/` when working in this repo.
- Keep filenames stable and descriptive.

## Dependencies (install if missing)
Prefer `uv` for dependency management.

Python packages:
```
uv pip install reportlab pdfplumber pypdf
```
If `uv` is unavailable:
```
python3 -m pip install reportlab pdfplumber pypdf
```
System tools (for rendering):
```
# macOS (Homebrew)
brew install poppler

# Ubuntu/Debian
sudo apt-get install -y poppler-utils
```

If installation isn't possible in this environment, tell the user which dependency is missing and how to install it locally.

## Environment
No required environment variables.

## Rendering command
```
pdftoppm -png $INPUT_PDF $OUTPUT_PREFIX
```

## Quality expectations
- Maintain polished visual design: consistent typography, spacing, margins, and section hierarchy.
- Avoid rendering issues: clipped text, overlapping elements, broken tables, black squares, or unreadable glyphs.
- Charts, tables, and images must be sharp, aligned, and clearly labeled.
- Use ASCII hyphens only. Avoid U+2011 (non-breaking hyphen) and other Unicode dashes.
- Citations and references must be human-readable; never leave tool tokens or placeholder strings.

## Final checks
- Do not deliver until the latest PNG inspection shows zero visual or formatting defects.
- Confirm headers/footers, page numbering, and section transitions look polished.
- Keep intermediate files organized or remove them after final approval.


<!-- END SKILL: pdf -->

<!-- START SKILL: playwright -->

---
name: "playwright"
description: "Use when the task requires automating a real browser from the terminal (navigation, form filling, snapshots, screenshots, data extraction, UI-flow debugging) via `playwright-cli` or the bundled wrapper script."
---


# Playwright CLI Skill

Drive a real browser from the terminal using `playwright-cli`. Prefer the bundled wrapper script so the CLI works even when it is not globally installed.
Treat this skill as CLI-first automation. Do not pivot to `@playwright/test` unless the user explicitly asks for test files.

## Prerequisite check (required)

Before proposing commands, check whether `npx` is available (the wrapper depends on it):

```bash
command -v npx >/dev/null 2>&1
```

If it is not available, pause and ask the user to install Node.js/npm (which provides `npx`). Provide these steps verbatim:

```bash
# Verify Node/npm are installed
node --version
npm --version

# If missing, install Node.js/npm, then:
npm install -g @playwright/cli@latest
playwright-cli --help
```

Once `npx` is present, proceed with the wrapper script. A global install of `playwright-cli` is optional.

## Skill path (set once)

```bash
export CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
export PWCLI="$CODEX_HOME/skills/playwright/scripts/playwright_cli.sh"
```

User-scoped skills install under `$CODEX_HOME/skills` (default: `~/.codex/skills`).

## Quick start

Use the wrapper script:

```bash
"$PWCLI" open https://playwright.dev --headed
"$PWCLI" snapshot
"$PWCLI" click e15
"$PWCLI" type "Playwright"
"$PWCLI" press Enter
"$PWCLI" screenshot
```

If the user prefers a global install, this is also valid:

```bash
npm install -g @playwright/cli@latest
playwright-cli --help
```

## Core workflow

1. Open the page.
2. Snapshot to get stable element refs.
3. Interact using refs from the latest snapshot.
4. Re-snapshot after navigation or significant DOM changes.
5. Capture artifacts (screenshot, pdf, traces) when useful.

Minimal loop:

```bash
"$PWCLI" open https://example.com
"$PWCLI" snapshot
"$PWCLI" click e3
"$PWCLI" snapshot
```

## When to snapshot again

Snapshot again after:

- navigation
- clicking elements that change the UI substantially
- opening/closing modals or menus
- tab switches

Refs can go stale. When a command fails due to a missing ref, snapshot again.

## Recommended patterns

### Form fill and submit

```bash
"$PWCLI" open https://example.com/form
"$PWCLI" snapshot
"$PWCLI" fill e1 "user@example.com"
"$PWCLI" fill e2 "password123"
"$PWCLI" click e3
"$PWCLI" snapshot
```

### Debug a UI flow with traces

```bash
"$PWCLI" open https://example.com --headed
"$PWCLI" tracing-start
# ...interactions...
"$PWCLI" tracing-stop
```

### Multi-tab work

```bash
"$PWCLI" tab-new https://example.com
"$PWCLI" tab-list
"$PWCLI" tab-select 0
"$PWCLI" snapshot
```

## Wrapper script

The wrapper script uses `npx --package @playwright/cli playwright-cli` so the CLI can run without a global install:

```bash
"$PWCLI" --help
```

Prefer the wrapper unless the repository already standardizes on a global install.

## References

Open only what you need:

- CLI command reference: `references/cli.md`
- Practical workflows and troubleshooting: `references/workflows.md`

## Guardrails

- Always snapshot before referencing element ids like `e12`.
- Re-snapshot when refs seem stale.
- Prefer explicit commands over `eval` and `run-code` unless needed.
- When you do not have a fresh snapshot, use placeholder refs like `eX` and say why; do not bypass refs with `run-code`.
- Use `--headed` when a visual check will help.
- When capturing artifacts in this repo, use `output/playwright/` and avoid introducing new top-level artifact folders.
- Default to CLI commands and workflows, not Playwright test specs.


<!-- END SKILL: playwright -->

<!-- START SKILL: playwright-interactive -->

---
name: "playwright-interactive"
description: "Persistent browser and Electron interaction through `js_repl` for fast iterative UI debugging."
---

# Playwright Interactive Skill

Use a persistent `js_repl` Playwright session to debug local web or Electron apps, keep the same handles alive across iterations, and run functional plus visual QA without restarting the whole toolchain unless the process ownership changed.

## Preconditions

- `js_repl` must be enabled for this skill.
- If `js_repl` is missing, enable it in `~/.codex/config.toml`:

```toml
[features]
js_repl = true
```

- You can also start a new session with `--enable js_repl` (equivalent to `-c features.js_repl=true`).
- After enabling `js_repl`, start a new Codex session so the tool list refreshes.
- For now, run this workflow with sandboxing disabled: start Codex with `--sandbox danger-full-access` (or the equivalent config for `sandbox_mode=danger-full-access`). This is a temporary requirement while `js_repl` + Playwright support inside the sandbox is still being completed.
- Run setup from the same project directory you need to debug.
- Treat `js_repl_reset` as a recovery tool, not routine cleanup. Resetting the kernel destroys your Playwright handles.

## One-time setup

```bash
test -f package.json || npm init -y
npm install playwright
# Web-only, for headed Chromium or mobile emulation:
# npx playwright install chromium
# Electron-only, and only if the target workspace is the app itself:
# npm install --save-dev electron
node -e "import('playwright').then(() => console.log('playwright import ok')).catch((error) => { console.error(error); process.exit(1); })"
```

If you switch to a different workspace later, repeat setup there.

## Core Workflow

1. Write a brief QA inventory before testing:
   - Build the inventory from three sources: the user's requested requirements, the user-visible features or behaviors you actually implemented, and the claims you expect to make in the final response.
   - Anything that appears in any of those three sources must map to at least one QA check before signoff.
   - List the user-visible claims you intend to sign off on.
   - List every meaningful user-facing control, mode switch, or implemented interactive behavior.
   - List the state changes or view changes each control or implemented behavior can cause.
   - Use this as the shared coverage list for both functional QA and visual QA.
   - For each claim or control-state pair, note the intended functional check, the specific state where the visual check must happen, and the evidence you expect to capture.
   - If a requirement is visually central but subjective, convert it into an observable QA check instead of leaving it implicit.
   - Add at least 2 exploratory or off-happy-path scenarios that could expose fragile behavior.
2. Run the bootstrap cell once.
3. Start or confirm any required dev server in a persistent TTY session.
4. Launch the correct runtime and keep reusing the same Playwright handles.
5. After each code change, reload for renderer-only changes or relaunch for main-process/startup changes.
6. Run functional QA with normal user input.
7. Run a separate visual QA pass.
8. Verify viewport fit and capture the screenshots needed to support your claims.
9. Clean up the Playwright session only when the task is actually finished.

## Bootstrap (Run Once)

```javascript
var chromium;
var electronLauncher;
var browser;
var context;
var page;
var mobileContext;
var mobilePage;
var electronApp;
var appWindow;

try {
  ({ chromium, _electron: electronLauncher } = await import("playwright"));
  console.log("Playwright loaded");
} catch (error) {
  throw new Error(
    `Could not load playwright from the current js_repl cwd. Run the setup commands from this workspace first. Original error: ${error}`
  );
}
```

Binding rules:

- Use `var` for the shared top-level Playwright handles because later `js_repl` cells reuse them.
- The setup cells below are intentionally short happy paths. If a handle looks stale, set that binding to `undefined` and rerun the cell instead of adding recovery logic everywhere.
- Prefer one named handle per surface you care about (`page`, `mobilePage`, `appWindow`) over repeatedly rediscovering pages from the context.

Shared web helpers:

```javascript
var resetWebHandles = function () {
  context = undefined;
  page = undefined;
  mobileContext = undefined;
  mobilePage = undefined;
};

var ensureWebBrowser = async function () {
  if (browser && !browser.isConnected()) {
    browser = undefined;
    resetWebHandles();
  }

  browser ??= await chromium.launch({ headless: false });
  return browser;
};

var reloadWebContexts = async function () {
  for (const currentContext of [context, mobileContext]) {
    if (!currentContext) continue;
    for (const p of currentContext.pages()) {
      await p.reload({ waitUntil: "domcontentloaded" });
    }
  }
  console.log("Reloaded existing web tabs");
};
```

## Choose Session Mode

For web apps, use an explicit viewport by default and treat native-window mode as a separate validation pass.

- Use an explicit viewport for routine iteration, breakpoint checks, reproducible screenshots, snapshot diffs, and model-assisted localization. This is the default because it is stable across machines and avoids host window-manager variability.
- When you need deterministic high-DPI behavior, keep the explicit viewport and add `deviceScaleFactor` rather than switching straight to native-window mode.
- Use native-window mode (`viewport: null`) for a separate headed pass when you need to validate launched window size, OS-level DPI behavior, browser chrome interactions, or bugs that may depend on the host display configuration.
- For Electron, assume native-window behavior all the time. Electron launches through Playwright with `noDefaultViewport`, so treat it like a real desktop window and check the as-launched size and layout before resizing anything.
- When signoff depends on both layout breakpoints and real desktop behavior, do both passes: explicit viewport first for deterministic QA, then native-window validation for final environment-specific checks.
- Treat switching modes as a context reset. Do not reuse a viewport-emulated `context` for a native-window pass or vice versa; close the old `page` and `context`, then create a new one for the new mode.

## Start or Reuse Web Session

Desktop and mobile web sessions share the same `browser`, helpers, and QA flow. The main difference is which context and page pair you create.

### Desktop Web Context

Set `TARGET_URL` to the app you are debugging. For local servers, prefer `127.0.0.1` over `localhost`.

```javascript
var TARGET_URL = "http://127.0.0.1:3000";

if (page?.isClosed()) page = undefined;

await ensureWebBrowser();
context ??= await browser.newContext({
  viewport: { width: 1600, height: 900 },
});
page ??= await context.newPage();

await page.goto(TARGET_URL, { waitUntil: "domcontentloaded" });
console.log("Loaded:", await page.title());
```

If `context` or `page` is stale, set `context = page = undefined` and rerun the cell.

### Mobile Web Context

Reuse `TARGET_URL` when it already exists; otherwise set a mobile target directly.

```javascript
var MOBILE_TARGET_URL = typeof TARGET_URL === "string"
  ? TARGET_URL
  : "http://127.0.0.1:3000";

if (mobilePage?.isClosed()) mobilePage = undefined;

await ensureWebBrowser();
mobileContext ??= await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
mobilePage ??= await mobileContext.newPage();

await mobilePage.goto(MOBILE_TARGET_URL, { waitUntil: "domcontentloaded" });
console.log("Loaded mobile:", await mobilePage.title());
```

If `mobileContext` or `mobilePage` is stale, set `mobileContext = mobilePage = undefined` and rerun the cell.

### Native-Window Web Pass

```javascript
var TARGET_URL = "http://127.0.0.1:3000";

await ensureWebBrowser();

await page?.close().catch(() => {});
await context?.close().catch(() => {});
page = undefined;
context = undefined;

browser ??= await chromium.launch({ headless: false });
context = await browser.newContext({ viewport: null });
page = await context.newPage();

await page.goto(TARGET_URL, { waitUntil: "domcontentloaded" });
console.log("Loaded native window:", await page.title());
```

## Start or Reuse Electron Session

Set `ELECTRON_ENTRY` to `.` when the current workspace is the Electron app and `package.json` points `main` to the right entry file. If you need to target a specific main-process file directly, use a path such as `./main.js` instead.

```javascript
var ELECTRON_ENTRY = ".";

if (appWindow?.isClosed()) appWindow = undefined;

if (!appWindow && electronApp) {
  await electronApp.close().catch(() => {});
  electronApp = undefined;
}

electronApp ??= await electronLauncher.launch({
  args: [ELECTRON_ENTRY],
});

appWindow ??= await electronApp.firstWindow();

console.log("Loaded Electron window:", await appWindow.title());
```

If `js_repl` is not already running from the Electron app workspace, pass `cwd` explicitly when launching.

If the app process looks stale, set `electronApp = appWindow = undefined` and rerun the cell.

If you already have an Electron session but need a fresh process after a main-process, preload, or startup change, use the restart cell in the next section instead of rerunning this one.

## Reuse Sessions During Iteration

Keep the same session alive whenever you can.

Web renderer reload:

```javascript
await reloadWebContexts();
```

Electron renderer-only reload:

```javascript
await appWindow.reload({ waitUntil: "domcontentloaded" });
console.log("Reloaded Electron window");
```

Electron restart after main-process, preload, or startup changes:

```javascript
await electronApp.close().catch(() => {});
electronApp = undefined;
appWindow = undefined;

electronApp = await electronLauncher.launch({
  args: [ELECTRON_ENTRY],
});

appWindow = await electronApp.firstWindow();
console.log("Relaunched Electron window:", await appWindow.title());
```

If your launch requires an explicit `cwd`, include the same `cwd` here.

Default posture:

- Keep each `js_repl` cell short and focused on one interaction burst.
- Reuse the existing top-level bindings (`browser`, `context`, `page`, `electronApp`, `appWindow`) instead of redeclaring them.
- If you need isolation, create a new page or a new context inside the same browser.
- For Electron, use `electronApp.evaluate(...)` only for main-process inspection or purpose-built diagnostics.
- Fix helper mistakes in place; do not reset the REPL unless the kernel is actually broken.

## Checklists

### Session Loop

- Bootstrap `js_repl` once, then keep the same Playwright handles alive across iterations.
- Launch the target runtime from the current workspace.
- Make the code change.
- Reload or relaunch using the correct path for that change.
- Update the shared QA inventory if exploration reveals an additional control, state, or visible claim.
- Re-run functional QA.
- Re-run visual QA.
- Capture final artifacts only after the current state is the one you are evaluating.

### Reload Decision

- Renderer-only change: reload the existing page or Electron window.
- Main-process, preload, or startup change: relaunch Electron.
- New uncertainty about process ownership or startup code: relaunch instead of guessing.

### Functional QA

- Use real user controls for signoff: keyboard, mouse, click, touch, or equivalent Playwright input APIs.
- Verify at least one end-to-end critical flow.
- Confirm the visible result of that flow, not just internal state.
- For realtime or animation-heavy apps, verify behavior under actual interaction timing.
- Work through the shared QA inventory rather than ad hoc spot checks.
- Cover every obvious visible control at least once before signoff, not only the main happy path.
- For reversible controls or stateful toggles in the inventory, test the full cycle: initial state, changed state, and return to the initial state.
- After the scripted checks pass, do a short exploratory pass using normal input for 30-90 seconds instead of following only the intended path.
- If the exploratory pass reveals a new state, control, or claim, add it to the shared QA inventory and cover it before signoff.
- `page.evaluate(...)` and `electronApp.evaluate(...)` may inspect or stage state, but they do not count as signoff input.

### Visual QA

- Treat visual QA as separate from functional QA.
- Use the same shared QA inventory defined before testing and updated during QA; do not start visual coverage from a different implicit list.
- Restate the user-visible claims and verify each one explicitly; do not assume a functional pass proves a visual claim.
- A user-visible claim is not signed off until it has been inspected in the specific state where it is meant to be perceived.
- Inspect the initial viewport before scrolling.
- Confirm that the initial view visibly supports the interface's primary claims; if a core promised element is not clearly perceptible there, treat that as a bug.
- Inspect all required visible regions, not just the main interaction surface.
- Inspect the states and modes already enumerated in the shared QA inventory, including at least one meaningful post-interaction state when the task is interactive.
- If motion or transitions are part of the experience, inspect at least one in-transition state in addition to the settled endpoints.
- If labels, overlays, annotations, guides, or highlights are meant to track changing content, verify that relationship after the relevant state change.
- For dynamic or interaction-dependent visuals, inspect long enough to judge stability, layering, and readability; do not rely on a single screenshot for signoff.
- For interfaces that can become denser after loading or interaction, inspect the densest realistic state you can reach during QA, not only the empty, loading, or collapsed state.
- If the product has a defined minimum supported viewport or window size, run a separate visual QA pass there; otherwise, choose a smaller but still realistic size and inspect it explicitly.
- Distinguish presence from implementation: if an intended affordance is technically there but not clearly perceptible because of weak contrast, occlusion, clipping, or instability, treat that as a visual failure.
- If any required visible region is clipped, cut off, obscured, or pushed outside the viewport in the state you are evaluating, treat that as a bug even if page-level scroll metrics appear acceptable.
- Look for clipping, overflow, distortion, layout imbalance, inconsistent spacing, alignment problems, illegible text, weak contrast, broken layering, and awkward motion states.
- Judge aesthetic quality as well as correctness. The UI should feel intentional, coherent, and visually pleasing for the task.
- Prefer viewport screenshots for signoff. Use full-page captures only as secondary debugging artifacts, and capture a focused screenshot when a region needs closer inspection.
- If motion makes a screenshot ambiguous, wait briefly for the UI to settle, then capture the image you are actually evaluating.
- Before signoff, explicitly ask: what visible part of this interface have I not yet inspected closely?
- Before signoff, explicitly ask: what visible defect would most likely embarrass this result if the user looked closely?

### Signoff

- The functional path passed with normal user input.
- Coverage is explicit against the shared QA inventory: note which requirements, implemented features, controls, states, and claims were exercised, and call out any intentional exclusions.
- The visual QA pass covered the whole relevant interface.
- Each user-visible claim has a matching visual check and reviewed screenshot artifact from the state and viewport or window size where that claim matters.
- The viewport-fit checks passed for the intended initial view and any required minimum supported viewport or window size.
- If the product launches in a window, the as-launched size, placement, and initial layout were checked before any manual resize or repositioning.
- The UI is not just functional; it is visually coherent and not aesthetically weak for the task.
- Functional correctness, viewport fit, and visual quality must each pass on their own; one does not imply the others.
- A short exploratory pass was completed for interactive products, and the response mentions what that pass covered.
- If screenshot review and numeric checks disagreed at any point, the discrepancy was investigated before signoff; visible clipping in screenshots is a failure to resolve, not something metrics can overrule.
- Include a brief negative confirmation of the main defect classes you checked for and did not find.
- Cleanup was executed, or you intentionally kept the session alive for further work.

## Screenshot Examples

If you plan to emit a screenshot through `codex.emitImage(...)`, use the CSS-normalized paths in the next section by default. Those are the canonical examples for screenshots that will be interpreted by the model or used for coordinate-based follow-up actions. Keep raw captures as an exception for fidelity-sensitive debugging only; the raw exception examples appear after the normalization guidance.

### Model-bound screenshots (default)

If you will emit a screenshot with `codex.emitImage(...)` for model interpretation, normalize it to CSS pixels for the exact region you captured before emitting. This keeps returned coordinates aligned with Playwright CSS pixels if the reply is later used for clicking, and it also reduces image payload size and model token cost.

Do not emit raw native-window screenshots by default. Skip normalization only when you explicitly need device-pixel fidelity, such as Retina or DPI artifact debugging, pixel-accurate rendering inspection, or another fidelity-sensitive case where raw pixels matter more than payload size. For local-only inspection that will not be emitted to the model, raw capture is fine.

Do not assume `page.screenshot({ scale: "css" })` is enough in native-window mode (`viewport: null`). In Chromium on macOS Retina displays, headed native-window screenshots can still come back at device-pixel size even when `scale: "css"` is requested. The same caveat applies to Electron windows launched through Playwright because Electron runs with `noDefaultViewport`, and `appWindow.screenshot({ scale: "css" })` may still return device-pixel output.

Use separate normalization paths for web pages and Electron windows:

- Web: prefer `page.screenshot({ scale: "css" })` directly. If native-window Chromium still returns device-pixel output, resize inside the current page with canvas; no scratch page is required.
- Electron: do not use `appWindow.context().newPage()` or `electronApp.context().newPage()` as a scratch page. Electron contexts do not support that path reliably. Capture in the main process with `BrowserWindow.capturePage(...)`, resize with `nativeImage.resize(...)`, and emit those bytes directly.

Shared helpers and conventions:

```javascript
var emitJpeg = async function (bytes) {
  await codex.emitImage({
    bytes,
    mimeType: "image/jpeg",
    detail: "original",
  });
};

var emitWebJpeg = async function (surface, options = {}) {
  await emitJpeg(await surface.screenshot({
    type: "jpeg",
    quality: 85,
    scale: "css",
    ...options,
  }));
};

var clickCssPoint = async function ({ surface, x, y, clip }) {
  await surface.mouse.click(
    clip ? clip.x + x : x,
    clip ? clip.y + y : y
  );
};

var tapCssPoint = async function ({ page, x, y, clip }) {
  await page.touchscreen.tap(
    clip ? clip.x + x : x,
    clip ? clip.y + y : y
  );
};
```

- Use `page` or `mobilePage` for web, or `appWindow` for Electron, as the `surface`.
- Treat `clip` as CSS pixels from `getBoundingClientRect()` in the renderer.
- Prefer JPEG at `quality: 85` unless lossless fidelity is specifically required.
- For full-image captures, use returned `{ x, y }` directly.
- For clipped captures, add the clip origin back when clicking.

### Web CSS normalization

Preferred web path for explicit-viewport contexts, and often for web in general:

```javascript
await emitWebJpeg(page);
```

Mobile web uses the same path; substitute `mobilePage` for `page`:

```javascript
await emitWebJpeg(mobilePage);
```

If the model returns `{ x, y }`, click it directly:

```javascript
await clickCssPoint({ surface: page, x, y });
```

Mobile web click path:

```javascript
await tapCssPoint({ page: mobilePage, x, y });
```

For web `clip` screenshots or element screenshots in this normal path, `scale: "css"` usually works directly. Add the region origin back when clicking.

- `await emitWebJpeg(page, { clip })`
- `await emitWebJpeg(mobilePage, { clip })`
- `await clickCssPoint({ surface: page, clip, x, y })`
- `await tapCssPoint({ page: mobilePage, clip, x, y })`
- `await clickCssPoint({ surface: page, clip: box, x, y })` after `const box = await locator.boundingBox()`

Web native-window fallback when `scale: "css"` still comes back at device-pixel size:

```javascript
var emitWebScreenshotCssScaled = async function ({ page, clip, quality = 0.85 } = {}) {
  var NodeBuffer = (await import("node:buffer")).Buffer;
  const target = clip
    ? { width: clip.width, height: clip.height }
    : await page.evaluate(() => ({
        width: window.innerWidth,
        height: window.innerHeight,
      }));

  const screenshotBuffer = await page.screenshot({
    type: "png",
    ...(clip ? { clip } : {}),
  });

  const bytes = await page.evaluate(
    async ({ imageBase64, targetWidth, targetHeight, quality }) => {
      const image = new Image();
      image.src = `data:image/png;base64,${imageBase64}`;
      await image.decode();

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", quality)
      );

      return new Uint8Array(await blob.arrayBuffer());
    },
    {
      imageBase64: NodeBuffer.from(screenshotBuffer).toString("base64"),
      targetWidth: target.width,
      targetHeight: target.height,
      quality,
    }
  );

  await emitJpeg(bytes);
};
```

For a full viewport fallback capture, treat returned `{ x, y }` as direct CSS coordinates:

```javascript
await emitWebScreenshotCssScaled({ page });
await clickCssPoint({ surface: page, x, y });
```

For a clipped fallback capture, add the clip origin back:

```javascript
await emitWebScreenshotCssScaled({ page, clip });
await clickCssPoint({ surface: page, clip, x, y });
```

### Electron CSS normalization

For Electron, normalize in the main process instead of opening a scratch Playwright page. The helper below returns CSS-scaled bytes for the full content area or for a clipped CSS-pixel region. Treat `clip` as content-area CSS pixels, for example values taken from `getBoundingClientRect()` in the renderer.

```javascript
var emitElectronScreenshotCssScaled = async function ({ electronApp, clip, quality = 85 } = {}) {
  const bytes = await electronApp.evaluate(async ({ BrowserWindow }, { clip, quality }) => {
    const win = BrowserWindow.getAllWindows()[0];
    const image = clip ? await win.capturePage(clip) : await win.capturePage();

    const target = clip
      ? { width: clip.width, height: clip.height }
      : (() => {
          const [width, height] = win.getContentSize();
          return { width, height };
        })();

    const resized = image.resize({
      width: target.width,
      height: target.height,
      quality: "best",
    });

    return resized.toJPEG(quality);
  }, { clip, quality });

  await emitJpeg(bytes);
};
```

Full Electron window:

```javascript
await emitElectronScreenshotCssScaled({ electronApp });
await clickCssPoint({ surface: appWindow, x, y });
```

Clipped Electron region using CSS pixels from the renderer:

```javascript
var clip = await appWindow.evaluate(() => {
  const rect = document.getElementById("board").getBoundingClientRect();
  return {
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  };
});

await emitElectronScreenshotCssScaled({ electronApp, clip });
await clickCssPoint({ surface: appWindow, clip, x, y });
```

### Raw Screenshot Exception Examples

Use these only when raw pixels matter more than CSS-coordinate alignment, such as Retina or DPI artifact debugging, pixel-accurate rendering inspection, or other fidelity-sensitive review.

Web desktop raw emit:

```javascript
await codex.emitImage({
  bytes: await page.screenshot({ type: "jpeg", quality: 85 }),
  mimeType: "image/jpeg",
  detail: "original",
});
```

Electron raw emit:

```javascript
await codex.emitImage({
  bytes: await appWindow.screenshot({ type: "jpeg", quality: 85 }),
  mimeType: "image/jpeg",
  detail: "original",
});
```

Mobile raw emit after the mobile web context is already running:

```javascript
await codex.emitImage({
  bytes: await mobilePage.screenshot({ type: "jpeg", quality: 85 }),
  mimeType: "image/jpeg",
  detail: "original",
});
```

## Viewport Fit Checks (Required)

Do not assume a screenshot is acceptable just because the main widget is visible. Before signoff, explicitly verify that the intended initial view matches the product requirement, using both screenshot review and numeric checks.

- Define the intended initial view before signoff. For scrollable pages, this is the above-the-fold experience. For app-like shells, games, editors, dashboards, or tools, this is the full interactive surface plus the controls and status needed to use it.
- Use screenshots as the primary evidence for fit. Numeric checks support the screenshots; they do not overrule visible clipping.
- Signoff fails if any required visible region is clipped, cut off, obscured, or pushed outside the viewport in the intended initial view, even if page-level scroll metrics appear acceptable.
- Scrolling is acceptable when the product is designed to scroll and the initial view still communicates the core experience and exposes the primary call to action or required starting context.
- For fixed-shell interfaces, scrolling is not an acceptable workaround if it is needed to reach part of the primary interactive surface or essential controls.
- Do not rely on document scroll metrics alone. Fixed-height shells, internal panes, and hidden-overflow containers can clip required UI while page-level scroll checks still look clean.
- Check region bounds, not just document bounds. Verify that each required visible region fits within the viewport in the startup state.
- For Electron or desktop apps, verify both the launched window size and placement and the renderer's initial visible layout before any manual resize or repositioning.
- Passing viewport-fit checks only proves that the intended initial view is visible without unintended clipping or scrolling. It does not prove that the UI is visually correct or aesthetically successful.

Web or renderer check:

```javascript
console.log(await page.evaluate(() => ({
  innerWidth: window.innerWidth,
  innerHeight: window.innerHeight,
  clientWidth: document.documentElement.clientWidth,
  clientHeight: document.documentElement.clientHeight,
  scrollWidth: document.documentElement.scrollWidth,
  scrollHeight: document.documentElement.scrollHeight,
  canScrollX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  canScrollY: document.documentElement.scrollHeight > document.documentElement.clientHeight,
})));
```

Electron check:

```javascript
console.log(await appWindow.evaluate(() => ({
  innerWidth: window.innerWidth,
  innerHeight: window.innerHeight,
  clientWidth: document.documentElement.clientWidth,
  clientHeight: document.documentElement.clientHeight,
  scrollWidth: document.documentElement.scrollWidth,
  scrollHeight: document.documentElement.scrollHeight,
  canScrollX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  canScrollY: document.documentElement.scrollHeight > document.documentElement.clientHeight,
})));
```

Augment the numeric check with `getBoundingClientRect()` checks for the required visible regions in your specific UI when clipping is a realistic failure mode; document-level metrics alone are not sufficient for fixed shells.

## Dev Server

For local web debugging, keep the app running in a persistent TTY session. Do not rely on one-shot background commands from a short-lived shell.

Use the project's normal start command, for example:

```bash
npm start
```

Before `page.goto(...)`, verify the chosen port is listening and the app responds.

For Electron debugging, launch the app from `js_repl` through `_electron.launch(...)` so the same session owns the process. If the Electron renderer depends on a separate dev server (for example Vite or Next), keep that server running in a persistent TTY session and then relaunch or reload the Electron app from `js_repl`.

## Cleanup

Only run cleanup when the task is actually finished:

- This cleanup is manual. Exiting Codex, closing the terminal, or losing the `js_repl` session does not implicitly run `electronApp.close()`, `context.close()`, or `browser.close()`.
- For Electron specifically, assume the app may keep running if you leave the session without executing the cleanup cell first.

```javascript
if (electronApp) {
  await electronApp.close().catch(() => {});
}

if (mobileContext) {
  await mobileContext.close().catch(() => {});
}

if (context) {
  await context.close().catch(() => {});
}

if (browser) {
  await browser.close().catch(() => {});
}

browser = undefined;
context = undefined;
page = undefined;
mobileContext = undefined;
mobilePage = undefined;
electronApp = undefined;
appWindow = undefined;

console.log("Playwright session closed");
```

If you plan to exit Codex immediately after debugging, run the cleanup cell first and wait for the `"Playwright session closed"` log before quitting.

## Common Failure Modes

- `Cannot find module 'playwright'`: run the one-time setup in the current workspace and verify the import before using `js_repl`.
- Playwright package is installed but the browser executable is missing: run `npx playwright install chromium`.
- `page.goto: net::ERR_CONNECTION_REFUSED`: make sure the dev server is still running in a persistent TTY session, recheck the port, and prefer `http://127.0.0.1:<port>`.
- `electron.launch` hangs, times out, or exits immediately: verify the local `electron` dependency, confirm the `args` target, and make sure any renderer dev server is already running before launch.
- `Identifier has already been declared`: reuse the existing top-level bindings, choose a new name, or wrap the code in `{ ... }`. Use `js_repl_reset` only when the kernel is genuinely stuck.
- `browserContext.newPage: Protocol error (Target.createTarget): Not supported` while working with Electron: do not use `appWindow.context().newPage()` or `electronApp.context().newPage()` as a scratch page; use the Electron-specific screenshot normalization flow in the model-bound screenshots section.
- `js_repl` timed out or reset: rerun the bootstrap cell and recreate the session with shorter, more focused cells.
- Browser launch or network operations fail immediately: confirm the session was started with `--sandbox danger-full-access` and restart that way if needed.


<!-- END SKILL: playwright-interactive -->

<!-- START SKILL: powersync-expert -->

---
title: PowerSync Sync and Offline Data Expert
description: Directives and best practices for offline-first architecture, platform-detected database factories, useLiveQuery reactivity, multi-account swaps, and Drizzle query compilation in the Polymath Platform.
triggers:
  - "powersync"
  - "useLiveQuery"
  - "offline-first"
  - "database factory"
  - "Zone A sync"
  - "SovereignBus"
  - "database.ts"
  - "WASQLiteOpenFactory"
  - "OPSqliteOpenFactory"
---

# PowerSync Sync & Offline Data Skill Playbook

Use this skill when modifying offline data storage, schema definitions, sync rules, database connectors, or lifecycle hooks within the Polymath Platform monorepo.

---

## 1. Monorepo Stack Specifications

Our PowerSync setup utilizes a unified TypeScript client layer wrapping platform-native engines:
*   **Reactivity Client**: `@powersync/react-native@1.35.3` and `@powersync/react@1.10.0`
*   **Web Engine**: `@powersync/web@1.38.3` + WebAssembly (WASQLite) + OPFS (Origin Private File System)
*   **Native Engine**: `@powersync/op-sqlite@0.9.9` (compiled C++ SQLite wrapper) with SQLCipher encryption
*   **ORM**: Drizzle ORM (`@powersync/drizzle-driver@0.7.3` via `wrapPowerSyncWithDrizzle`)
*   **Boundary**: Package `@repo/core` (`packages/core/src/adapters/powersync`) exports the database singleton and bootstrap procedures.

---

## 2. Platform-Detected Database Factory

To maintain a single codebase across Native (iOS/Android) and Web (SPA/Expo Web), the database runtime is abstracted inside `packages/core/src/adapters/powersync/database.ts`:

```typescript
// 1. SSR Guard
if (typeof window === 'undefined') {
  return null; // Client-only execution
}

// 2. Factory Detection
function createDatabaseFactory(accountId: string, encryptionKey: string) {
  if (Platform.OS === 'web') {
    const { WASQLiteOpenFactory, WASQLiteVFS } = require('@powersync/web');
    return new WASQLiteOpenFactory({
      dbFilename: `gurudevi-${accountId}.db`,
      vfs: WASQLiteVFS.OPFSCoopSyncVFS, // Multi-tab stability
      flags: {
        enableMultiTabs: typeof SharedWorker !== 'undefined'
      }
    });
  }

  const { OPSqliteOpenFactory } = require('@powersync/op-sqlite');
  return new OPSqliteOpenFactory({
    dbFilename: `gurudevi-powersync-${accountId}.db`,
    sqliteOptions: { encryptionKey }
  });
}
```

### Key Constraints:
*   **VFS Fallbacks**: On Web, `OPFSCoopSyncVFS` fallback to `IDBBatchAtomicVFS` is handled automatically. Never use `OPFSWriteAheadVFS` (insufficient testing evidence).
*   **Web Assets**: The postinstall script runs `powersync-web copy-assets` to dump WASM and workers into `public/@powersync/web/`. Browser loads fail silently if these are missing.
*   **Web Encryption**: Web sandboxing (OPFS) is origin-isolated. Do not activate web database encryption until Safari + ChaCha20 stability is fully verified.

---

## 3. Data Highways: Zone A, B, and C

All data is structured in local SQLite but synchronized differently depending on high-volume traffic and hosting cost thresholds:

| Zone | Sync Semantics | SQLite Property | Network Path |
| :--- | :--- | :--- | :--- |
| **Zone A** (Sovereign Core) | Bidirectional Sync | `local_only: false` | PowerSync Connector WAL stream |
| **Zone B** (Social Feed) | Local Reactivity | `local_only: true` | REST API (Hono) |
| **Zone C** (Messaging) | Local Reactivity | `local_only: true` | WebSocket + REST API |

### Query and Write Patterns:
*   **Reads**: Always subscribe via `useLiveQuery` on the SQLite tables (applies to all zones).
*   **Writes**:
    *   **Zone A**: Route through `SecureDrizzleProxy` to queue changes in PowerSync's local CRUD queue.
    *   **Zone B/C**: Write locally via Drizzle and execute network sync separately. Never route Zone B/C through PowerSync replication.

---

## 4. Multi-Account Swap Protocol (Drain-Before-Swap)

To prevent memory leaks and database file corruption during account switching:
1.  **Drain**: Check `uploadQueueDepth` and ensure local changes are flushed.
2.  **Disconnect**: Call `powersyncInstance.disconnect()`.
3.  **Clear**: Clear singleton reference inside `database.ts`.
4.  **Key Swap**: Fetch the new account's encryption key from Expo SecureStore.
5.  **Reboot**: Initialize and connect the new PowerSync instance.

---

## 5. State & Request Coordination (SovereignBus)

Heavy background sync activity can compete with the Metro bridge. We coordinate network requests using the `SovereignBus` Zustand slice:
*   **State fields**: `isSyncing: boolean`, `uploadQueueDepth: number`, `lastSyncComplete: Date`.
*   **Throttling**: React Query reads `isSyncing` and blocks REST refetches during active PowerSync sync phases (using TanStack Pacer).

---

## 6. Authorization & Policy Invalidation

*   **Cedar Double-Gate**: All local writes are evaluated via Cedar WASM policy engines before executing.
*   **Sync Rules**: Replicated records are filtered on the backend using Supabase RLS and PowerSync sync rules.
*   **Policy Invalidation**: A `policy_version` table is synced in Zone A. If policies change, the server increments the hash, `useLiveQuery` detects the update, invalidates capability tokens, and triggers a fresh snapshot fetch.

---

## 7. Legacy Patterns vs. New Capabilities

*   **DEPRECATED**: Legacy Sync Rules (static config).
*   **RECOMMENDED**: Sync Streams (dynamic filters based on parameters/tokens).
*   **DEPRECATED**: Direct REST API polling for Zone A data.
*   **RECOMMENDED**: Reactive subscription via `useLiveQuery`.

---

## 8. Real-time Documentation & Research Guidance

When needing to look up the latest PowerSync API features, SDK changes, or troubleshooting rules, use the following methods:

### Direct Markdown Fetch
Append `.md` to any PowerSync doc URL to retrieve the raw markdown content.
For example: `https://docs.powersync.com/usage/react-native.md`

### Jina AI Reader Ingestion
Leverage the workspace MCP Gateway tool `sovereign_discovery` with action `jina` to fetch and ingest documentation directly:
```json
{
  "action": "jina",
  "params": {
    "url": "https://docs.powersync.com/usage/sync-rules.md"
  }
}
```
*Always verify syntax and query patterns against the current codebase before applying changes.*


<!-- END SKILL: powersync-expert -->

<!-- START SKILL: render-deploy -->

---
name: render-deploy
description: Deploy applications to Render by analyzing codebases, generating render.yaml Blueprints, and providing Dashboard deeplinks. Use when the user wants to deploy, host, publish, or set up their application on Render's cloud platform.
---

# Deploy to Render

Render supports **Git-backed** services and **prebuilt Docker image** services.

This skill covers **Git-backed** flows:
1. **Blueprint Method** - Generate render.yaml for Infrastructure-as-Code deployments
2. **Direct Creation** - Create services instantly via MCP tools

Blueprints can also run a **prebuilt Docker image** by using `runtime: image`, but the `render.yaml` still must live in a Git repo.

If there is no Git remote, stop and ask the user to either:
- Create/push a Git remote (can be minimal if only the Blueprint is needed), or
- Use the Render Dashboard/API to deploy a prebuilt Docker image (MCP cannot create image-backed services).

## Prerequisites

- When sandboxing blocks the deployment network calls, rerun with `sandbox_permissions=require_escalated`.
- The deployment might take a few minutes. Use appropriate timeout values.

## When to Use This Skill

Activate this skill when users want to:
- Deploy an application to Render
- Create a render.yaml Blueprint file
- Set up Render deployment for their project
- Host or publish their application on Render's cloud platform
- Create databases, cron jobs, or other Render resources

## Happy Path (New Users)

Use this short prompt sequence before deep analysis to reduce friction:
1. Ask whether they want to deploy from a Git repo or a prebuilt Docker image.
2. Ask whether Render should provision everything the app needs (based on what seems likely from the user's description) or only the app while they bring their own infra. If dependencies are unclear, ask a short follow-up to confirm whether they need a database, workers, cron, or other services.

Then proceed with the appropriate method below.

## Choose Your Source Path

**Git Repo Path:** Required for both Blueprint and Direct Creation. The repo must be pushed to GitHub, GitLab, or Bitbucket.

**Prebuilt Docker Image Path:** Supported by Render via image-backed services. This is **not** supported by MCP; use the Dashboard/API. Ask for:
- Image URL (registry + tag)
- Registry auth (if private)
- Service type (web/worker) and port

If the user chooses a Docker image, guide them to the Render Dashboard image deploy flow or ask them to add a Git remote (so you can use a Blueprint with `runtime: image`).

## Choose Your Deployment Method (Git Repo)

Both methods require a Git repository pushed to GitHub, GitLab, or Bitbucket. (If using `runtime: image`, the repo can be minimal and only contain `render.yaml`.)

| Method | Best For | Pros |
|--------|----------|------|
| **Blueprint** | Multi-service apps, IaC workflows | Version controlled, reproducible, supports complex setups |
| **Direct Creation** | Single services, quick deployments | Instant creation, no render.yaml file needed |

### Method Selection Heuristic

Use this decision rule by default unless the user requests a specific method. Analyze the codebase first; only ask if deployment intent is unclear (e.g., DB, workers, cron).

**Use Direct Creation (MCP) when ALL are true:**
- Single service (one web app or one static site)
- No separate worker/cron services
- No attached databases or Key Value
- Simple env vars only (no shared env groups)
If this path fits and MCP isn't configured yet, stop and guide MCP setup before proceeding.

**Use Blueprint when ANY are true:**
- Multiple services (web + worker, API + frontend, etc.)
- Databases, Redis/Key Value, or other datastores are required
- Cron jobs, background workers, or private services
- You want reproducible IaC or a render.yaml committed to the repo
- Monorepo or multi-env setup that needs consistent configuration

If unsure, ask a quick clarifying question, but default to Blueprint for safety. For a single service, strongly prefer Direct Creation via MCP and guide MCP setup if needed.

## Prerequisites Check

When starting a deployment, verify these requirements in order:

**1. Confirm Source Path (Git vs Docker)**

If using Git-based methods (Blueprint or Direct Creation), the repo must be pushed to GitHub/GitLab/Bitbucket. Blueprints that reference a prebuilt image still require a Git repo with `render.yaml`.

```bash
git remote -v
```

- If no remote exists, stop and ask the user to create/push a remote **or** switch to Docker image deploy.

**2. Check MCP Tools Availability (Preferred for Single-Service)**

MCP tools provide the best experience. Check if available by attempting:
```
list_services()
```

If MCP tools are available, you can skip CLI installation for most operations.

**3. Check Render CLI Installation (for Blueprint validation)**
```bash
render --version
```
If not installed, offer to install:
- macOS: `brew install render`
- Linux/macOS: `curl -fsSL https://raw.githubusercontent.com/render-oss/cli/main/bin/install.sh | sh`

**4. MCP Setup (if MCP isn't configured)**

If `list_services()` fails because MCP isn't configured, ask whether they want to set up MCP (preferred) or continue with the CLI fallback. If they choose MCP, ask which AI tool they're using, then provide the matching instructions below. Always use their API key.

### Cursor

Walk the user through these steps:

1) Get a Render API key:
```
https://dashboard.render.com/u/*/settings#api-keys
```

2) Add this to `~/.cursor/mcp.json` (replace `<YOUR_API_KEY>`):
```json
{
  "mcpServers": {
    "render": {
      "url": "https://mcp.render.com/mcp",
      "headers": {
        "Authorization": "Bearer <YOUR_API_KEY>"
      }
    }
  }
}
```

3) Restart Cursor, then retry `list_services()`.

### Claude Code

Walk the user through these steps:

1) Get a Render API key:
```
https://dashboard.render.com/u/*/settings#api-keys
```

2) Add the MCP server with Claude Code (replace `<YOUR_API_KEY>`):
```bash
claude mcp add --transport http render https://mcp.render.com/mcp --header "Authorization: Bearer <YOUR_API_KEY>"
```

3) Restart Claude Code, then retry `list_services()`.

### Codex

Walk the user through these steps:

1) Get a Render API key:
```
https://dashboard.render.com/u/*/settings#api-keys
```

2) Set it in their shell:
```bash
export RENDER_API_KEY="<YOUR_API_KEY>"
```

3) Add the MCP server with the Codex CLI:
```bash
codex mcp add render --url https://mcp.render.com/mcp --bearer-token-env-var RENDER_API_KEY
```

4) Restart Codex, then retry `list_services()`.

### Other Tools

If the user is on another AI app, direct them to the Render MCP docs for that tool's setup steps and install method.

### Workspace Selection

After MCP is configured, have the user set the active Render workspace with a prompt like:

```
Set my Render workspace to [WORKSPACE_NAME]
```

**5. Check Authentication (CLI fallback only)**

If MCP isn't available, use the CLI instead and verify you can access your account:
```bash
# Check if user is logged in (use -o json for non-interactive mode)
render whoami -o json
```

If `render whoami` fails or returns empty data, the CLI is not authenticated. The CLI won't always prompt automatically, so explicitly prompt the user to authenticate:

If neither is configured, ask user which method they prefer:
- **API Key (CLI)**: `export RENDER_API_KEY="rnd_xxxxx"` (Get from https://dashboard.render.com/u/*/settings#api-keys)
- **Login**: `render login` (Opens browser for OAuth)

**6. Check Workspace Context**

Verify the active workspace:
```
get_selected_workspace()
```

Or via CLI:
```bash
render workspace current -o json
```

To list available workspaces:
```
list_workspaces()
```

If user needs to switch workspaces, they must do so via Dashboard or CLI (`render workspace set`).

Once prerequisites are met, proceed with deployment workflow.

---

# Method 1: Blueprint Deployment (Recommended for Complex Apps)

## Blueprint Workflow

### Step 1: Analyze Codebase

Analyze the codebase to determine framework/runtime, build and start commands, required env vars, datastores, and port binding. Use the detailed checklists in [references/codebase-analysis.md](references/codebase-analysis.md).

### Step 2: Generate render.yaml

Create a `render.yaml` Blueprint file following the Blueprint specification.

Complete specification: [references/blueprint-spec.md](references/blueprint-spec.md)

**Key Points:**
- Always use `plan: free` unless user specifies otherwise
- Include ALL environment variables the app needs
- Mark secrets with `sync: false` (user fills these in Dashboard)
- Use appropriate service type: `web`, `worker`, `cron`, `static`, or `pserv`
- Use appropriate runtime: [references/runtimes.md](references/runtimes.md)

**Basic Structure:**
```yaml
services:
  - type: web
    name: my-app
    runtime: node
    plan: free
    buildCommand: npm ci
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: postgres
          property: connectionString
      - key: JWT_SECRET
        sync: false  # User fills in Dashboard

databases:
  - name: postgres
    databaseName: myapp_db
    plan: free
```

**Service Types:**
- `web`: HTTP services, APIs, web applications (publicly accessible)
- `worker`: Background job processors (not publicly accessible)
- `cron`: Scheduled tasks that run on a cron schedule
- `static`: Static sites (HTML/CSS/JS served via CDN)
- `pserv`: Private services (internal only, within same account)

Service type details: [references/service-types.md](references/service-types.md)
Runtime options: [references/runtimes.md](references/runtimes.md)
Template examples: [assets/](assets/)

### Step 2.5: Immediate Next Steps (Always Provide)

After creating `render.yaml`, always give the user a short, explicit checklist and run validation immediately when the CLI is available:
1. **Authenticate (CLI)**: run `render whoami -o json` (if not logged in, run `render login` or set `RENDER_API_KEY`)
2. **Validate (recommended)**: run `render blueprints validate`
   - If the CLI isn't installed, offer to install it and provide the command.
3. **Commit + push**: `git add render.yaml && git commit -m "Add Render deployment configuration" && git push origin main`
4. **Open Dashboard**: Use the Blueprint deeplink and complete Git OAuth if prompted
5. **Fill secrets**: Set env vars marked `sync: false`
6. **Deploy**: Click "Apply" and monitor the deploy

### Step 3: Validate Configuration

Validate the render.yaml file to catch errors before deployment. If the CLI is installed, run the commands directly; only prompt the user if the CLI is missing:

```bash
render whoami -o json  # Ensure CLI is authenticated (won't always prompt)
render blueprints validate
```

Fix any validation errors before proceeding. Common issues:
- Missing required fields (`name`, `type`, `runtime`)
- Invalid runtime values
- Incorrect YAML syntax
- Invalid environment variable references

Configuration guide: [references/configuration-guide.md](references/configuration-guide.md)

### Step 4: Commit and Push

**IMPORTANT:** You must merge the `render.yaml` file into your repository before deploying.

Ensure the `render.yaml` file is committed and pushed to your Git remote:

```bash
git add render.yaml
git commit -m "Add Render deployment configuration"
git push origin main
```

If there is no Git remote yet, stop here and guide the user to create a GitHub/GitLab/Bitbucket repo, add it as `origin`, and push before continuing.

**Why this matters:** The Dashboard deeplink will read the render.yaml from your repository. If the file isn't merged and pushed, Render won't find the configuration and deployment will fail.

Verify the file is in your remote repository before proceeding to the next step.

### Step 5: Generate Deeplink

Get the Git repository URL:

```bash
git remote get-url origin
```

This will return a URL from your Git provider. **If the URL is SSH format, convert it to HTTPS:**

| SSH Format | HTTPS Format |
|------------|--------------|
| `git@github.com:user/repo.git` | `https://github.com/user/repo` |
| `git@gitlab.com:user/repo.git` | `https://gitlab.com/user/repo` |
| `git@bitbucket.org:user/repo.git` | `https://bitbucket.org/user/repo` |

**Conversion pattern:** Replace `git@<host>:` with `https://<host>/` and remove `.git` suffix.

Format the Dashboard deeplink using the HTTPS repository URL:
```
https://dashboard.render.com/blueprint/new?repo=<REPOSITORY_URL>
```

Example:
```
https://dashboard.render.com/blueprint/new?repo=https://github.com/username/repo-name
```

### Step 6: Guide User

**CRITICAL:** Ensure the user has merged and pushed the render.yaml file to their repository before clicking the deeplink. If the file isn't in the repository, Render cannot read the Blueprint configuration and deployment will fail.

Provide the deeplink to the user with these instructions:

1. **Verify render.yaml is merged** - Confirm the file exists in your repository on GitHub/GitLab/Bitbucket
2. Click the deeplink to open Render Dashboard
3. Complete Git provider OAuth if prompted
4. Name the Blueprint (or use default from render.yaml)
5. Fill in secret environment variables (marked with `sync: false`)
6. Review services and databases configuration
7. Click "Apply" to deploy

The deployment will begin automatically. Users can monitor progress in the Render Dashboard.

### Step 7: Verify Deployment

After the user deploys via Dashboard, verify everything is working.

**Check deployment status via MCP:**
```
list_deploys(serviceId: "<service-id>", limit: 1)
```
Look for `status: "live"` to confirm successful deployment.

**Check for runtime errors (wait 2-3 minutes after deploy):**
```
list_logs(resource: ["<service-id>"], level: ["error"], limit: 20)
```

**Check service health metrics:**
```
get_metrics(
  resourceId: "<service-id>",
  metricTypes: ["http_request_count", "cpu_usage", "memory_usage"]
)
```

If errors are found, proceed to the **Post-deploy verification and basic triage** section below.

---

# Method 2: Direct Service Creation (Quick Single-Service Deployments)

For simple deployments without Infrastructure-as-Code, create services directly via MCP tools.

## When to Use Direct Creation

- Single web service or static site
- Quick prototypes or demos
- When you don't need a render.yaml file in your repo
- Adding databases or cron jobs to existing projects

## Prerequisites for Direct Creation

**Repository must be pushed to a Git provider.** Render clones your repository to build and deploy services.

```bash
git remote -v  # Verify remote exists
git push origin main  # Ensure code is pushed
```

Supported providers: GitHub, GitLab, Bitbucket

If no remote exists, stop and ask the user to create/push a remote or switch to Docker image deploy.

**Note:** MCP does not support creating image-backed services. Use the Dashboard/API for prebuilt Docker image deploys.

## Direct Creation Workflow

Use the concise steps below, and refer to [references/direct-creation.md](references/direct-creation.md) for full MCP command examples and follow-on configuration.

### Step 1: Analyze Codebase
Use [references/codebase-analysis.md](references/codebase-analysis.md) to determine runtime, build/start commands, env vars, and datastores.

### Step 2: Create Resources via MCP
Create the service (web or static) and any required databases or key-value stores. See [references/direct-creation.md](references/direct-creation.md).

If MCP returns an error about missing Git credentials or repo access, stop and guide the user to connect their Git provider in the Render Dashboard, then retry.

### Step 3: Configure Environment Variables
Add required env vars via MCP after creation. See [references/direct-creation.md](references/direct-creation.md).

Remind the user that secrets can be set in the Dashboard if they prefer not to pass them via MCP.

### Step 4: Verify Deployment
Check deploy status, logs, and metrics. See [references/direct-creation.md](references/direct-creation.md).

---

For service discovery, configuration details, quick commands, and common issues, see [references/deployment-details.md](references/deployment-details.md).

---

# Post-deploy verification and basic triage (All Methods)

Keep this short and repeatable. If any check fails, fix it before redeploying.

1. Confirm the latest deploy is `live` and serving traffic
2. Hit the health endpoint (or root) and verify a 200 response
3. Scan recent error logs for a clear failure signature
4. Verify required env vars and port binding (`0.0.0.0:$PORT`)

Detailed checklist and commands: [references/post-deploy-checks.md](references/post-deploy-checks.md)

If the service fails to start or health checks time out, use the basic triage guide:
[references/troubleshooting-basics.md](references/troubleshooting-basics.md)

## Troubleshooting

### Escalated Network Access

If deployment fails due to network issues (timeouts, DNS errors, connection resets), rerun the deploy with escalated permissions (use `sandbox_permissions=require_escalated`). The deploy requires escalated network access when sandbox networking blocks outbound requests.

Example guidance to the user:

```
The deploy needs escalated network access to deploy to Render. I can rerun the command with escalated permissions—want me to proceed?
```

Optional: If you need deeper diagnostics (metrics/DB checks/error catalog), suggest installing the
`render-debug` skill. It is not required for the core deploy flow.


<!-- END SKILL: render-deploy -->

<!-- START SKILL: screenshot -->

---
name: "screenshot"
description: "Use when the user explicitly asks for a desktop or system screenshot (full screen, specific app or window, or a pixel region), or when tool-specific capture capabilities are unavailable and an OS-level capture is needed."
---


# Screenshot Capture

Follow these save-location rules every time:

1) If the user specifies a path, save there.
2) If the user asks for a screenshot without a path, save to the OS default screenshot location.
3) If Codex needs a screenshot for its own inspection, save to the temp directory.

## Tool priority

- Prefer tool-specific screenshot capabilities when available (for example: a Figma MCP/skill for Figma files, or Playwright/agent-browser tools for browsers and Electron apps).
- Use this skill when explicitly asked, for whole-system desktop captures, or when a tool-specific capture cannot get what you need.
- Otherwise, treat this skill as the default for desktop apps without a better-integrated capture tool.

## macOS permission preflight (reduce repeated prompts)

On macOS, run the preflight helper once before window/app capture. It checks
Screen Recording permission, explains why it is needed, and requests it in one
place.

The helpers route Swift's module cache to `$TMPDIR/codex-swift-module-cache`
to avoid extra sandbox module-cache prompts.

```bash
bash <path-to-skill>/scripts/ensure_macos_permissions.sh
```

To avoid multiple sandbox approval prompts, combine preflight + capture in one
command when possible:

```bash
bash <path-to-skill>/scripts/ensure_macos_permissions.sh && \
python3 <path-to-skill>/scripts/take_screenshot.py --app "Codex"
```

For Codex inspection runs, keep the output in temp:

```bash
bash <path-to-skill>/scripts/ensure_macos_permissions.sh && \
python3 <path-to-skill>/scripts/take_screenshot.py --app "<App>" --mode temp
```

Use the bundled scripts to avoid re-deriving OS-specific commands.

## macOS and Linux (Python helper)

Run the helper from the repo root:

```bash
python3 <path-to-skill>/scripts/take_screenshot.py
```

Common patterns:

- Default location (user asked for "a screenshot"):

```bash
python3 <path-to-skill>/scripts/take_screenshot.py
```

- Temp location (Codex visual check):

```bash
python3 <path-to-skill>/scripts/take_screenshot.py --mode temp
```

- Explicit location (user provided a path or filename):

```bash
python3 <path-to-skill>/scripts/take_screenshot.py --path output/screen.png
```

- App/window capture by app name (macOS only; substring match is OK; captures all matching windows):

```bash
python3 <path-to-skill>/scripts/take_screenshot.py --app "Codex"
```

- Specific window title within an app (macOS only):

```bash
python3 <path-to-skill>/scripts/take_screenshot.py --app "Codex" --window-name "Settings"
```

- List matching window ids before capturing (macOS only):

```bash
python3 <path-to-skill>/scripts/take_screenshot.py --list-windows --app "Codex"
```

- Pixel region (x,y,w,h):

```bash
python3 <path-to-skill>/scripts/take_screenshot.py --mode temp --region 100,200,800,600
```

- Focused/active window (captures only the frontmost window; use `--app` to capture all windows):

```bash
python3 <path-to-skill>/scripts/take_screenshot.py --mode temp --active-window
```

- Specific window id (use --list-windows on macOS to discover ids):

```bash
python3 <path-to-skill>/scripts/take_screenshot.py --window-id 12345
```

The script prints one path per capture. When multiple windows or displays match, it prints multiple paths (one per line) and adds suffixes like `-w<windowId>` or `-d<display>`. View each path sequentially with the image viewer tool, and only manipulate images if needed or requested.

### Workflow examples

- "Take a look at <App> and tell me what you see": capture to temp, then view each printed path in order.

```bash
bash <path-to-skill>/scripts/ensure_macos_permissions.sh && \
python3 <path-to-skill>/scripts/take_screenshot.py --app "<App>" --mode temp
```

- "The design from Figma is not matching what is implemented": use a Figma MCP/skill to capture the design first, then capture the running app with this skill (typically to temp) and compare the raw screenshots before any manipulation.

### Multi-display behavior

- On macOS, full-screen captures save one file per display when multiple monitors are connected.
- On Linux and Windows, full-screen captures use the virtual desktop (all monitors in one image); use `--region` to isolate a single display when needed.

### Linux prerequisites and selection logic

The helper automatically selects the first available tool:

1) `scrot`
2) `gnome-screenshot`
3) ImageMagick `import`

If none are available, ask the user to install one of them and retry.

Coordinate regions require `scrot` or ImageMagick `import`.

`--app`, `--window-name`, and `--list-windows` are macOS-only. On Linux, use
`--active-window` or provide `--window-id` when available.

## Windows (PowerShell helper)

Run the PowerShell helper:

```powershell
powershell -ExecutionPolicy Bypass -File <path-to-skill>/scripts/take_screenshot.ps1
```

Common patterns:

- Default location:

```powershell
powershell -ExecutionPolicy Bypass -File <path-to-skill>/scripts/take_screenshot.ps1
```

- Temp location (Codex visual check):

```powershell
powershell -ExecutionPolicy Bypass -File <path-to-skill>/scripts/take_screenshot.ps1 -Mode temp
```

- Explicit path:

```powershell
powershell -ExecutionPolicy Bypass -File <path-to-skill>/scripts/take_screenshot.ps1 -Path "C:\Temp\screen.png"
```

- Pixel region (x,y,w,h):

```powershell
powershell -ExecutionPolicy Bypass -File <path-to-skill>/scripts/take_screenshot.ps1 -Mode temp -Region 100,200,800,600
```

- Active window (ask the user to focus it first):

```powershell
powershell -ExecutionPolicy Bypass -File <path-to-skill>/scripts/take_screenshot.ps1 -Mode temp -ActiveWindow
```

- Specific window handle (only when provided):

```powershell
powershell -ExecutionPolicy Bypass -File <path-to-skill>/scripts/take_screenshot.ps1 -WindowHandle 123456
```

## Direct OS commands (fallbacks)

Use these when you cannot run the helpers.

### macOS

- Full screen to a specific path:

```bash
screencapture -x output/screen.png
```

- Pixel region:

```bash
screencapture -x -R100,200,800,600 output/region.png
```

- Specific window id:

```bash
screencapture -x -l12345 output/window.png
```

- Interactive selection or window pick:

```bash
screencapture -x -i output/interactive.png
```

### Linux

- Full screen:

```bash
scrot output/screen.png
```

```bash
gnome-screenshot -f output/screen.png
```

```bash
import -window root output/screen.png
```

- Pixel region:

```bash
scrot -a 100,200,800,600 output/region.png
```

```bash
import -window root -crop 800x600+100+200 output/region.png
```

- Active window:

```bash
scrot -u output/window.png
```

```bash
gnome-screenshot -w -f output/window.png
```

## Error handling

- On macOS, run `bash <path-to-skill>/scripts/ensure_macos_permissions.sh` first to request Screen Recording in one place.
- If you see "screen capture checks are blocked in the sandbox", "could not create image from display", or Swift `ModuleCache` permission errors in a sandboxed run, rerun the command with escalated permissions.
- If macOS app/window capture returns no matches, run `--list-windows --app "AppName"` and retry with `--window-id`, and make sure the app is visible on screen.
- If Linux region/window capture fails, check tool availability with `command -v scrot`, `command -v gnome-screenshot`, and `command -v import`.
- If saving to the OS default location fails with permission errors in a sandbox, rerun the command with escalated permissions.
- Always report the saved file path in the response.


<!-- END SKILL: screenshot -->

<!-- START SKILL: security-best-practices -->

# Security & Trust Boundaries Playbook (security-best-practices)

Authoritative security standards for data access, secret management, identity validation, and trust boundary protection.

---

## 1. Context & Operational Scope
Use this skill when modifying user identity checks, editing database schemas, writing Supabase policies, or handling authentication logic across the web/mobile app boundaries.

---

## 2. Row-Level Security (RLS) Standards
> [!CAUTION]
> Never leave a database table without RLS enabled. Every table MUST have explicit security policies mapping specific authenticated actions.

*   **Audit Protocol**: Before proposing any schema change, confirm RLS is active:
    ```sql
    ALTER TABLE public.target_table ENABLE ROW LEVEL SECURITY;
    ```
*   **Tenant Separation**: Always validate user identification using the system context:
    ```sql
    CREATE POLICY "Users can only read own data"
      ON public.target_table FOR SELECT
      USING (auth.uid() = user_id);
    ```

---

## 3. Secret Management
*   **Local Envs**: Absolutely never commit API keys, service roles, or database passwords to public/private Git repositories. Keep them restricted inside local `.env` files.
*   **Variable Isolation**: Validate that the gateway's `cleanEnv` sanitization cleans the process environment before spawning downstream workers, keeping secrets bounded.
*   **Git Leak Protection**: Ensure all keys and tokens conform to pattern boundaries defined in `.gitleaks.toml`.

---

## 4. Input Sanitization & Authentication Gates
*   **API Integrity**: Enforce strict compile-time Zod validations on all external-facing parameters before passing them to internal utilities.
*   **Auth Tokens**: Verify JWT claims and token signatures inside edge service environments before releasing sensitive application data.


<!-- END SKILL: security-best-practices -->

<!-- START SKILL: security-ownership-map -->

---
name: "security-ownership-map"
description: "Analyze git repositories to build a security ownership topology (people-to-file), compute bus factor and sensitive-code ownership, and export CSV/JSON for graph databases and visualization. Trigger only when the user explicitly wants a security-oriented ownership or bus-factor analysis grounded in git history (for example: orphaned sensitive code, security maintainers, CODEOWNERS reality checks for risk, sensitive hotspots, or ownership clusters). Do not trigger for general maintainer lists or non-security ownership questions."
---

# Security Ownership Map

## Overview

Build a bipartite graph of people and files from git history, then compute ownership risk and export graph artifacts for Neo4j/Gephi. Also build a file co-change graph (Jaccard similarity on shared commits) to cluster files by how they move together while ignoring large, noisy commits.

## Requirements

- Python 3
- `networkx` (required; community detection is enabled by default)

Install with:

```bash
pip install networkx
```

## Workflow

1. Scope the repo and time window (optional `--since/--until`).
2. Decide sensitivity rules (use defaults or provide a CSV config).
3. Build the ownership map with `scripts/run_ownership_map.py` (co-change graph is on by default; use `--cochange-max-files` to ignore supernode commits).
4. Communities are computed by default; graphml output is optional (`--graphml`).
5. Query the outputs with `scripts/query_ownership.py` for bounded JSON slices.
6. Persist and visualize (see `references/neo4j-import.md`).

By default, the co-change graph ignores common “glue” files (lockfiles, `.github/*`, editor config) so clusters reflect actual code movement instead of shared infra edits. Override with `--cochange-exclude` or `--no-default-cochange-excludes`. Dependabot commits are excluded by default; override with `--no-default-author-excludes` or add patterns via `--author-exclude-regex`.

If you want to exclude Linux build glue like `Kbuild` from co-change clustering, pass:

```bash
python skills/skills/security-ownership-map/scripts/run_ownership_map.py \
  --repo /path/to/linux \
  --out ownership-map-out \
  --cochange-exclude "**/Kbuild"
```

## Quick start

Run from the repo root:

```bash
python skills/skills/security-ownership-map/scripts/run_ownership_map.py \
  --repo . \
  --out ownership-map-out \
  --since "12 months ago" \
  --emit-commits
```

Defaults: author identity, author date, and merge commits excluded. Use `--identity committer`, `--date-field committer`, or `--include-merges` if needed.

Example (override co-change excludes):

```bash
python skills/skills/security-ownership-map/scripts/run_ownership_map.py \
  --repo . \
  --out ownership-map-out \
  --cochange-exclude "**/Cargo.lock" \
  --cochange-exclude "**/.github/**" \
  --no-default-cochange-excludes
```

Communities are computed by default. To disable:

```bash
python skills/skills/security-ownership-map/scripts/run_ownership_map.py \
  --repo . \
  --out ownership-map-out \
  --no-communities
```

## Sensitivity rules

By default, the script flags common auth/crypto/secret paths. Override by providing a CSV file:

```
# pattern,tag,weight
**/auth/**,auth,1.0
**/crypto/**,crypto,1.0
**/*.pem,secrets,1.0
```

Use it with `--sensitive-config path/to/sensitive.csv`.

## Output artifacts

`ownership-map-out/` contains:

- `people.csv` (nodes: people)
- `files.csv` (nodes: files)
- `edges.csv` (edges: touches)
- `cochange_edges.csv` (file-to-file co-change edges with Jaccard weight; omitted with `--no-cochange`)
- `summary.json` (security ownership findings)
- `commits.jsonl` (optional, if `--emit-commits`)
- `communities.json` (computed by default from co-change edges when available; includes `maintainers` per community; disable with `--no-communities`)
- `cochange.graph.json` (NetworkX node-link JSON with `community_id` + `community_maintainers`; falls back to `ownership.graph.json` if no co-change edges)
- `ownership.graphml` / `cochange.graphml` (optional, if `--graphml`)

`people.csv` includes timezone detection based on author commit offsets: `primary_tz_offset`, `primary_tz_minutes`, and `timezone_offsets`.

## LLM query helper

Use `scripts/query_ownership.py` to return small, JSON-bounded slices without loading the full graph into context.

Examples:

```bash
python skills/skills/security-ownership-map/scripts/query_ownership.py --data-dir ownership-map-out people --limit 10
python skills/skills/security-ownership-map/scripts/query_ownership.py --data-dir ownership-map-out files --tag auth --bus-factor-max 1
python skills/skills/security-ownership-map/scripts/query_ownership.py --data-dir ownership-map-out person --person alice@corp --limit 10
python skills/skills/security-ownership-map/scripts/query_ownership.py --data-dir ownership-map-out file --file crypto/tls
python skills/skills/security-ownership-map/scripts/query_ownership.py --data-dir ownership-map-out cochange --file crypto/tls --limit 10
python skills/skills/security-ownership-map/scripts/query_ownership.py --data-dir ownership-map-out summary --section orphaned_sensitive_code
python skills/skills/security-ownership-map/scripts/query_ownership.py --data-dir ownership-map-out community --id 3
```

Use `--community-top-owners 5` (default) to control how many maintainers are stored per community.

## Basic security queries

Run these to answer common security ownership questions with bounded output:

```bash
# Orphaned sensitive code (stale + low bus factor)
python skills/skills/security-ownership-map/scripts/query_ownership.py --data-dir ownership-map-out summary --section orphaned_sensitive_code

# Hidden owners for sensitive tags
python skills/skills/security-ownership-map/scripts/query_ownership.py --data-dir ownership-map-out summary --section hidden_owners

# Sensitive hotspots with low bus factor
python skills/skills/security-ownership-map/scripts/query_ownership.py --data-dir ownership-map-out summary --section bus_factor_hotspots

# Auth/crypto files with bus factor <= 1
python skills/skills/security-ownership-map/scripts/query_ownership.py --data-dir ownership-map-out files --tag auth --bus-factor-max 1
python skills/skills/security-ownership-map/scripts/query_ownership.py --data-dir ownership-map-out files --tag crypto --bus-factor-max 1

# Who is touching sensitive code the most
python skills/skills/security-ownership-map/scripts/query_ownership.py --data-dir ownership-map-out people --sort sensitive_touches --limit 10

# Co-change neighbors (cluster hints for ownership drift)
python skills/skills/security-ownership-map/scripts/query_ownership.py --data-dir ownership-map-out cochange --file path/to/file --min-jaccard 0.05 --limit 20

# Community maintainers (for a cluster)
python skills/skills/security-ownership-map/scripts/query_ownership.py --data-dir ownership-map-out community --id 3

# Monthly maintainers for the community containing a file
python skills/skills/security-ownership-map/scripts/community_maintainers.py \
  --data-dir ownership-map-out \
  --file network/card.c \
  --since 2025-01-01 \
  --top 5

# Quarterly buckets instead of monthly
python skills/skills/security-ownership-map/scripts/community_maintainers.py \
  --data-dir ownership-map-out \
  --file network/card.c \
  --since 2025-01-01 \
  --bucket quarter \
  --top 5
```

Notes:
- Touches default to one authored commit (not per-file). Use `--touch-mode file` to count per-file touches.
- Use `--window-days 90` or `--weight recency --half-life-days 180` to smooth churn.
- Filter bots with `--ignore-author-regex '(bot|dependabot)'`.
- Use `--min-share 0.1` to show stable maintainers only.
- Use `--bucket quarter` for calendar quarter groupings.
- Use `--identity committer` or `--date-field committer` to switch from author attribution.
- Use `--include-merges` to include merge commits (excluded by default).

### Summary format (default)

Use this structure, add fields if needed:

```json
{
  "orphaned_sensitive_code": [
    {
      "path": "crypto/tls/handshake.rs",
      "last_security_touch": "2023-03-12T18:10:04+00:00",
      "bus_factor": 1
    }
  ],
  "hidden_owners": [
    {
      "person": "alice@corp",
      "controls": "63% of auth code"
    }
  ]
}
```

## Graph persistence

Use `references/neo4j-import.md` when you need to load the CSVs into Neo4j. It includes constraints, import Cypher, and visualization tips.

## Notes

- `bus_factor_hotspots` in `summary.json` lists sensitive files with low bus factor; `orphaned_sensitive_code` is the stale subset.
- If `git log` is too large, narrow with `--since` or `--until`.
- Compare `summary.json` against CODEOWNERS to highlight ownership drift.


<!-- END SKILL: security-ownership-map -->

<!-- START SKILL: security-threat-model -->

---
name: "security-threat-model"
description: "Repository-grounded threat modeling that enumerates trust boundaries, assets, attacker capabilities, abuse paths, and mitigations, and writes a concise Markdown threat model. Trigger only when the user explicitly asks to threat model a codebase or path, enumerate threats/abuse paths, or perform AppSec threat modeling. Do not trigger for general architecture summaries, code review, or non-security design work."
---

# Threat Model Source Code Repo

Deliver an actionable AppSec-grade threat model that is specific to the repository or a project path, not a generic checklist. Anchor every architectural claim to evidence in the repo and keep assumptions explicit. Prioritizing realistic attacker goals and concrete impacts over generic checklists.

## Quick start

1) Collect (or infer) inputs:
- Repo root path and any in-scope paths.
- Intended usage, deployment model, internet exposure, and auth expectations (if known).
- Any existing repository summary or architecture spec.
- Use prompts in `references/prompt-template.md` to generate a repository summary.
- Follow the required output contract in `references/prompt-template.md`. Use it verbatim when possible.

## Workflow

### 1) Scope and extract the system model
- Identify primary components, data stores, and external integrations from the repo summary.
- Identify how the system runs (server, CLI, library, worker) and its entrypoints.
- Separate runtime behavior from CI/build/dev tooling and from tests/examples.
- Map the in-scope locations to those components and exclude out-of-scope items explicitly.
- Do not claim components, flows, or controls without evidence.

### 2) Derive boundaries, assets, and entry points
- Enumerate trust boundaries as concrete edges between components, noting protocol, auth, encryption, validation, and rate limiting.
- List assets that drive risk (data, credentials, models, config, compute resources, audit logs).
- Identify entry points (endpoints, upload surfaces, parsers/decoders, job triggers, admin tooling, logging/error sinks).

### 3) Calibrate assets and attacker capabilities
- List the assets that drive risk (credentials, PII, integrity-critical state, availability-critical components, build artifacts).
- Describe realistic attacker capabilities based on exposure and intended usage.
- Explicitly note non-capabilities to avoid inflated severity.


### 4) Enumerate threats as abuse paths
- Prefer attacker goals that map to assets and boundaries (exfiltration, privilege escalation, integrity compromise, denial of service).
- Classify each threat and tie it to impacted assets.
- Keep the number of threats small but high quality.

### 5) Prioritize with explicit likelihood and impact reasoning
- Use qualitative likelihood and impact (low/medium/high) with short justifications.
- Set overall priority (critical/high/medium/low) using likelihood x impact, adjusted for existing controls.
- State which assumptions most influence the ranking.

### 6) Validate service context and assumptions with the user
- Summarize key assumptions that materially affect threat ranking or scope, then ask the user to confirm or correct them.
- Ask 1–3 targeted questions to resolve missing context (service owner and environment, scale/users, deployment model, authn/authz, internet exposure, data sensitivity, multi-tenancy).
- Pause and wait for user feedback before producing the final report.
- If the user declines or can’t answer, state which assumptions remain and how they influence priority.

### 7) Recommend mitigations and focus paths
- Distinguish existing mitigations (with evidence) from recommended mitigations.
- Tie mitigations to concrete locations (component, boundary, or entry point) and control types (authZ checks, input validation, schema enforcement, sandboxing, rate limits, secrets isolation, audit logging).
- Prefer specific implementation hints over generic advice (e.g., "enforce schema at gateway for upload payloads" vs "validate inputs").
- Base recommendations on validated user context; if assumptions remain unresolved, mark recommendations as conditional.

### 8) Run a quality check before finalizing
- Confirm all discovered entrypoints are covered.
- Confirm each trust boundary is represented in threats.
- Confirm runtime vs CI/dev separation.
- Confirm user clarifications (or explicit non-responses) are reflected.
- Confirm assumptions and open questions are explicit.
- Confirm that the format of the report matches closely the required output format defined in prompt template: `references/prompt-template.md`
- Write the final Markdown to a file named `<repo-or-dir-name>-threat-model.md` (use the basename of the repo root, or the in-scope directory if you were asked to model a subpath).


## Risk prioritization guidance (illustrative, not exhaustive)
- High: pre-auth RCE, auth bypass, cross-tenant access, sensitive data exfiltration, key or token theft, model or config integrity compromise, sandbox escape.
- Medium: targeted DoS of critical components, partial data exposure, rate-limit bypass with measurable impact, log/metrics poisoning that affects detection.
- Low: low-sensitivity info leaks, noisy DoS with easy mitigation, issues requiring unlikely preconditions.

## References

- Output contract and full prompt template: `references/prompt-template.md`
- Optional controls/asset list: `references/security-controls-and-assets.md`

Only load the reference files you need. Keep the final result concise, grounded, and reviewable.


<!-- END SKILL: security-threat-model -->

<!-- START SKILL: sentry -->

---
name: "sentry"
description: "Use when the user asks to inspect Sentry issues or events, summarize recent production errors, or pull basic Sentry health data via the Sentry API; perform read-only queries with the bundled script and require `SENTRY_AUTH_TOKEN`."
---


# Sentry (Read-only Observability)

## Quick start

- If not already authenticated, ask the user to provide a valid `SENTRY_AUTH_TOKEN` (read-only scopes such as `project:read`, `event:read`) or to log in and create one before running commands.
- Set `SENTRY_AUTH_TOKEN` as an env var.
- Optional defaults: `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_BASE_URL`.
- Defaults: org/project `{your-org}`/`{your-project}`, time range `24h`, environment `prod`, limit 20 (max 50).
- Always call the Sentry API (no heuristics, no caching).

If the token is missing, give the user these steps:
1. Create a Sentry auth token: https://sentry.io/settings/account/api/auth-tokens/
2. Create a token with read-only scopes such as `project:read`, `event:read`, and `org:read`.
3. Set `SENTRY_AUTH_TOKEN` as an environment variable in their system.
4. Offer to guide them through setting the environment variable for their OS/shell if needed.
- Never ask the user to paste the full token in chat. Ask them to set it locally and confirm when ready.

## Core tasks (use bundled script)

Use `scripts/sentry_api.py` for deterministic API calls. It handles pagination and retries once on transient errors.

## Skill path (set once)

```bash
export CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
export SENTRY_API="$CODEX_HOME/skills/sentry/scripts/sentry_api.py"
```

User-scoped skills install under `$CODEX_HOME/skills` (default: `~/.codex/skills`).

### 1) List issues (ordered by most recent)

```bash
python3 "$SENTRY_API" \
  list-issues \
  --org {your-org} \
  --project {your-project} \
  --environment prod \
  --time-range 24h \
  --limit 20 \
  --query "is:unresolved"
```

### 2) Resolve an issue short ID to issue ID

```bash
python3 "$SENTRY_API" \
  list-issues \
  --org {your-org} \
  --project {your-project} \
  --query "ABC-123" \
  --limit 1
```

Use the returned `id` for issue detail or events.

### 3) Issue detail

```bash
python3 "$SENTRY_API" \
  issue-detail \
  1234567890
```

### 4) Issue events

```bash
python3 "$SENTRY_API" \
  issue-events \
  1234567890 \
  --limit 20
```

### 5) Event detail (no stack traces by default)

```bash
python3 "$SENTRY_API" \
  event-detail \
  --org {your-org} \
  --project {your-project} \
  abcdef1234567890
```

## API requirements

Always use these endpoints (GET only):

- List issues: `/api/0/projects/{org_slug}/{project_slug}/issues/`
- Issue detail: `/api/0/issues/{issue_id}/`
- Events for issue: `/api/0/issues/{issue_id}/events/`
- Event detail: `/api/0/projects/{org_slug}/{project_slug}/events/{event_id}/`

## Inputs and defaults

- `org_slug`, `project_slug`: default to `{your-org}`/`{your-project}` (avoid non-prod orgs).
- `time_range`: default `24h` (pass as `statsPeriod`).
- `environment`: default `prod`.
- `limit`: default 20, max 50 (paginate until limit reached).
- `search_query`: optional `query` parameter.
- `issue_short_id`: resolve via list-issues query first.

## Output formatting rules

- Issue list: show title, short_id, status, first_seen, last_seen, count, environments, top_tags; order by most recent.
- Event detail: include culprit, timestamp, environment, release, url.
- If no results, state explicitly.
- Redact PII in output (emails, IPs). Do not print raw stack traces.
- Never echo auth tokens.

## Golden test inputs

- Org: `{your-org}`
- Project: `{your-project}`
- Issue short ID: `{ABC-123}`

Example prompt: “List the top 10 open issues for prod in the last 24h.”
Expected: ordered list with titles, short IDs, counts, last seen.


<!-- END SKILL: sentry -->

<!-- START SKILL: supabase -->

---
name: supabase
description: Use when the user needs help with Supabase and no Supabase MCP is available. Covers docs-first help for schema changes, SQL migrations, RLS policies, auth, generated types, Edge Functions, local CLI workflows, and hosted project operations grounded in official Supabase docs and the repo's existing `supabase/` files.
---

# Supabase (Docs-first, no MCP)

## Overview

Use this skill to work on Supabase-backed projects without MCP by combining local repo inspection, the Supabase CLI, and official Supabase documentation. Prefer deterministic file changes and CLI workflows over dashboard-only guidance whenever the repo already contains a `supabase/` directory or migrations.

## When to use it

Trigger this skill when the user asks to:

- add or fix Supabase SQL migrations
- write or review RLS policies
- debug auth, storage, or database access issues
- generate or update Supabase types
- create or modify Edge Functions
- link or deploy to a hosted Supabase project
- answer "how do I do this in Supabase?" using official docs

## Workflow

### 1) Inspect local Supabase structure first

Start by checking which of these exist:

- `supabase/config.toml`
- `supabase/migrations/`
- `supabase/seed.sql`
- `supabase/functions/`
- app code that creates Supabase clients
- env vars such as `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

Match the existing project conventions before adding new files or commands.

### 2) Prefer safe, file-backed changes

Default to:

- SQL migration files instead of dashboard edits
- repo-local config instead of ad hoc one-off commands
- least-privilege changes for auth and RLS
- local validation before remote deploys when practical

Avoid destructive operations unless the user explicitly asks for them. Call out risk before commands such as dropping schemas, resetting remote data, or overwriting generated files used outside the requested scope.

### 3) Use official docs when product behavior may vary

When behavior, flags, limits, or APIs may have changed, browse only official Supabase documentation and release notes. Use the docs to confirm:

- current CLI commands and flags
- Management API behavior
- auth, storage, and Edge Function product details
- recommended RLS and security patterns

Load `references/official-docs.md` for the fastest routing to the right docs section.

### 4) Use the helper scripts as a two-tier toolkit

This skill now uses a two-tier helper model:

- `scripts/inspect_supabase_project.py`: main entrypoint for quick repo or monorepo discovery
- `scripts/audit_supabase_workspace.py`: deeper read-only audit for migration/function structure and risk signals

Use the inspector first, then run the audit when you need a more opinionated summary of what looks risky, duplicated, or operationally complex.

#### Main inspector

Use `scripts/inspect_supabase_project.py` for a quick, repeatable scan before making changes. It reports:

- all detected Supabase workspaces under the scan root
- config, seed, migration, archive, and Edge Function locations per workspace
- likely Supabase env vars present in the current shell
- `.env*` files that reference Supabase keys
- likely generated type files
- app files that create Supabase clients
- operational docs/scripts living beside each `supabase/` directory

Run:

```bash
python scripts/inspect_supabase_project.py .
python scripts/inspect_supabase_project.py . --json
python scripts/inspect_supabase_project.py apps/gurudevi-mobile
```

Prefer this over ad hoc manual searching when you need a fast project inventory. It does not call external services and does not print secret values.

#### Workspace audit

Use `scripts/audit_supabase_workspace.py` when you need a deeper local audit of the detected workspaces. It reports:

- migration counts and duplicate slugs
- near-duplicate migration names
- archived and legacy migration directories
- Edge Function inventory plus shared `deno.json` / `import_map.json`
- env var references inside function `index.ts` files
- operational docs/scripts beside `supabase/`

Run:

```bash
python scripts/audit_supabase_workspace.py .
python scripts/audit_supabase_workspace.py . --json
python scripts/audit_supabase_workspace.py apps/gurudevi-mobile
```

Use this when the project has many migrations, legacy folders, or multiple operational scripts and you want a fast read-only audit before changing anything.

## Common task patterns

### Schema and migrations

- Prefer `supabase migration new <name>` for schema changes that should persist in the repo.
- Put DDL, policy changes, triggers, and seed-adjacent setup in migrations instead of manual dashboard instructions.
- Review earlier migrations before adding a new one so names, helper functions, and policy patterns stay consistent.
- If the user asks to sync local and remote state, explain whether the correct next step is `db diff`, `db push`, `migration up`, or a new migration.

### Local development

Use the CLI for local workflows when the project already uses it. Common commands:

```bash
supabase start
supabase db reset
supabase gen types typescript --local
```

- `supabase db reset` is destructive for the local database; warn before running it.
- If Docker or the CLI is missing, say so briefly and continue with file-only changes where possible.

### Hosted project workflows

Use hosted operations only when the user has access configured locally. Common env vars and inputs:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_DB_PASSWORD`
- project ref from `supabase link --project-ref ...`

Typical commands:

```bash
supabase link --project-ref <project-ref>
supabase db push
supabase gen types typescript --linked
```

- Never ask the user to paste secrets into chat if they can set them locally.
- Never print service-role keys or access tokens back to the user.

### RLS and auth

For policy work:

- inspect table ownership, existing policies, helper functions, and auth usage first
- prefer explicit `to authenticated` / `to anon` scope where appropriate
- use `auth.uid()` / JWT claim helpers only when they match the project's access model
- check whether server code uses the service role, because that bypasses RLS

If changing auth flows, inspect both the database policy layer and the app code that creates browser/server/admin clients.

### Edge Functions

When working on `supabase/functions/*`:

- follow the repo's existing Deno and import conventions
- confirm secrets and environment expectations before deploy
- prefer local serve/test workflows before `supabase functions deploy`
- verify whether the function is intended to run with user JWT context or service credentials

### Type generation

Prefer generated types that match the project setup:

```bash
supabase gen types typescript --local
supabase gen types typescript --linked
```

- update only the expected generated file
- avoid editing generated types by hand unless the user explicitly wants a manual patch

## Guardrails

- Prefer repo inspection first, docs second, guesses never.
- Prefer official Supabase docs over blog posts or third-party tutorials.
- Prefer migrations and committed files over dashboard-only advice.
- Flag destructive or production-affecting commands before running them.
- Keep security-sensitive guidance conservative around RLS, service-role usage, and secret handling.

## References

- `references/official-docs.md`: doc routing for CLI, database, auth, RLS, Edge Functions, Management API, and type generation.


<!-- END SKILL: supabase -->

<!-- START SKILL: supabase-expert -->

---
title: Supabase Database and Security Expert
description: Guides the agent through safe database schema changes, SQL migrations, RLS (Row Level Security) safety audits, and generating TypeScript types.
triggers:
  - "supabase schema change"
  - "database migration"
  - "add new table to supabase"
  - "audit RLS policies"
  - "generate types for supabase"
---

# Supabase Database & Security Skill Playbook

Use this skill when implementing schema updates, modifying security policies, or writing Edge Functions in the `apps/gurudevi-mobile/supabase` directory.

## Step-by-Step Procedure

### 1. Design & Plan
- Define the minimal schema addition or modification.
- Always implement **Row Level Security (RLS)** for any new table. Do NOT leave a table without RLS.
- Choose clean, descriptive naming conventions matching the existing database (snake_case for columns/tables).

### 2. Generate and Apply SQL Migrations
- Write migrations as incremental, safe, roll-forward DDL scripts under `apps/gurudevi-mobile/supabase/migrations/`.
- Ensure migrations are repeatable and contain `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, etc.
- Use `default_api:mcp_supabase_apply_migration` to dry-run and apply migrations to the development database branch.

### 3. Row-Level Security (RLS) Safety Audit
- Write explicit `CREATE POLICY` statements.
- Never write `TO public` without strict read-only constraints.
- Run `default_api:mcp_supabase_get_advisors` with `type: "security"` to catch any missing policies.

### 4. Re-Generate TypeScript Types
- Always re-generate TypeScript types after making schema changes to maintain compile-time safety.
- Run:
  ```powershell
  pnpm --filter platform-mcp run generate-types
  ```
  or execute `default_api:mcp_supabase_generate_typescript_types` to refresh type definitions.

## Recommended Recipes

### Creating a New Table
```sql
-- 1. Table definition
CREATE TABLE IF NOT EXISTS public.new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;

-- 3. Policy definition
CREATE POLICY "Users can only manage their own records"
  ON public.new_table
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```


<!-- END SKILL: supabase-expert -->

<!-- START SKILL: ui-polisher -->

---
title: Premium UI/UX Polish and Visual Excellence
description: Guides the agent to review design hierarchy, replace generic layouts with premium components, inject micro-animations, and verify responsiveness using Playwright.
triggers:
  - "polish screen"
  - "make it look premium"
  - "improve UI aesthetics"
  - "responsive layout check"
  - "add animations or gradients"
---

# Premium UI/UX Polish & Visual Excellence Playbook

Use this skill when polishing screens, fixing visual cutoffs, adjusting responsive layouts, or updating design system components in `apps/edlove-web`, `apps/gurudevi-marketingWeb`, or `apps/gurudevi-mobile`.

## Core Guidelines for Premium Design

1. **Colors & Gradients**: Avoid boring solid primaries (plain #FF0000, #0000FF). Use rich HSL palettes, glassmorphism (`backdrop-filter: blur`), and subtle linear gradients (`bg-gradient-to-tr`).
2. **Typography**: Enforce proper visual hierarchy. Do not use browser defaults. Use curated Google Fonts (Outfit, Inter, Playfair Display) with varying weights (`font-light`, `font-semibold`).
3. **Micro-Animations**: Add subtle interactive state transitions. Use tailwind/css transitions (e.g., `transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg`).
4. **Layout & Bounding Boxes**: Do not hardcode height constraints on parent panels. Use adaptive flex boxes, safe area insets, and overflow containers to prevent layout cutoffs on mobile/small viewports.

## Step-by-Step Polish Workflow

### 1. Visual Review
- Inspect the targeted layout or component file.
- Locate static styles, hardcoded colors, and rigid heights.

### 2. Style Remediation
- Replace raw styles with design system tokens.
- Add dynamic shadows, smooth corners (`rounded-2xl` or `rounded-3xl`), and state-specific hover effects.

### 3. Verify Journey & Layout
- Start the local dev server using:
  ```powershell
  pnpm run dev
  ```
- Use the **Browser Subagent** tool to navigate to the page and visually check the layout.
- Review alignment, typography, and contrast. Confirm there are no visual glitches or overlaps.


<!-- END SKILL: ui-polisher -->

<!-- START SKILL: vercel-deploy -->

---
name: vercel-deploy
description: Deploy applications and websites to Vercel. Use when the user requests deployment actions like "deploy my app", "deploy and give me the link", "push this live", or "create a preview deployment".
---

# Vercel Deploy

Deploy any project to Vercel instantly. **Always deploy as preview** (not production) unless the user explicitly asks for production.

## Prerequisites

- Check whether the Vercel CLI is installed **without** escalated permissions (for example, `command -v vercel`).
- Only escalate the actual deploy command if sandboxing blocks the deployment network calls (`sandbox_permissions=require_escalated`).
- The deployment might take a few minutes. Use appropriate timeout values.

## Quick Start

1. Check whether the Vercel CLI is installed (no escalation for this check):

```bash
command -v vercel
```

2. If `vercel` is installed, run this (with a 10 minute timeout):
```bash
vercel deploy [path] -y
```

**Important:** Use a 10 minute (600000ms) timeout for the deploy command since builds can take a while.

3. If `vercel` is not installed, or if the CLI fails with "No existing credentials found", use the fallback method below.

## Fallback (No Auth)

If CLI fails with auth error, use the deploy script:

```bash
skill_dir="<path-to-skill>"

# Deploy current directory
bash "$skill_dir/scripts/deploy.sh"

# Deploy specific project
bash "$skill_dir/scripts/deploy.sh" /path/to/project

# Deploy existing tarball
bash "$skill_dir/scripts/deploy.sh" /path/to/project.tgz
```

The script handles framework detection, packaging, and deployment. It waits for the build to complete and returns JSON with `previewUrl` and `claimUrl`.

**Tell the user:** "Your deployment is ready at [previewUrl]. Claim it at [claimUrl] to manage your deployment."

## Production Deploys

Only if user explicitly asks:
```bash
vercel deploy [path] --prod -y
```

## Output

Show the user the deployment URL. For fallback deployments, also show the claim URL.

**Do not** curl or fetch the deployed URL to verify it works. Just return the link.

## Troubleshooting

### Escalated Network Access

If deployment fails due to network issues (timeouts, DNS errors, connection resets), rerun the actual deploy command with escalated permissions (use `sandbox_permissions=require_escalated`). Do not escalate the `command -v vercel` installation check. The deploy requires escalated network access when sandbox networking blocks outbound requests.

Example guidance to the user:

```
The deploy needs escalated network access to deploy to Vercel. I can rerun the command with escalated permissions—want me to proceed?
```


<!-- END SKILL: vercel-deploy -->

<!-- START SKILL: winui-app -->

---
name: winui-app
description: Bootstrap, develop, and design modern WinUI 3 desktop applications with C# and the Windows App SDK using official Microsoft guidance, WinUI Gallery patterns, Windows App SDK samples, and CommunityToolkit components. Use when creating a brand new app, preparing a machine for WinUI, reviewing, refactoring, planning, troubleshooting, environment-checking, or setting up WinUI 3 XAML, controls, navigation, windowing, theming, accessibility, responsiveness, performance, deployment, or related Windows app design and development work.
---

# WinUI App

Use this skill for WinUI 3 and Windows App SDK work that needs grounded setup guidance, app bootstrap, modern Windows UX decisions, or concrete implementation patterns.

## Required Flow

1. Classify the task as environment/setup, new-app bootstrap, design, implementation, review, or troubleshooting.
2. If the task is about preparing a machine for WinUI, auditing readiness, or creating a brand new app, start with the bundled setup-and-scaffold flow in this skill before broader design, implementation, or troubleshooting work:
   - Pick the app name when the request is for a new app.
   - Use the exact name the user gave when it is already a safe folder name.
   - If the user did not give a name, derive a short PascalCase name from the request and state what you chose.
   - Create the project in the user's current workspace unless they asked for another location.
   - Do not use `--force` unless the user explicitly asked to overwrite existing files.
   - Run the bundled WinGet configuration from the skill directory so the relative path stays exactly `config.yaml`:

```powershell
winget configure -f config.yaml --accept-configuration-agreements --disable-interactivity
```

   - Treat the configuration as intended to enable Developer Mode, install or update Visual Studio Community 2026, and install the Managed Desktop, Universal, and Windows App SDK C# components needed for WinUI development.
   - Assess the configuration result before continuing. Continue on success. If it fails, inspect the output instead of guessing. If the `winui` template is already available and the toolchain is usable, note the partial failure and continue. If prerequisites are still missing, stop and report the blocker clearly.
   - Verify the template is available before scaffolding:

```powershell
dotnet new list winui
```

   - For diagnostics-only environment requests, explain that the bundled bootstrap may change the machine and get confirmation before running it. If the user declines changes, use the manual verification guidance in `references/foundation-environment-audit-and-remediation.md` and summarize readiness under `present`, `missing`, `uncertain`, and `recommended optional tools`.
   - For a brand new app, scaffold with `dotnet new winui -o <name>`. Add template options only when the user asked for them. Supported options: `-f|--framework net10.0|net9.0|net8.0`, `-slnx|--use-slnx`, `-cpm|--central-pkg-mgmt`, `-mvvm|--use-mvvm`, `-imt|--include-mvvm-toolkit`, `-un|--unpackaged`, `-nsf|--no-solution-file`, `--force`. Do not invent unsupported flags. If the user asks for packaged behavior, pass `--unpackaged false`. Otherwise keep the template default.
   - Verify a new scaffold by confirming the expected project file exists and running `dotnet build` against the generated `.csproj`.
   - Launch a newly scaffolded app through the correct path for its actual packaging model and confirm there is a real top-level window instead of relying only on the launcher process exit code.
3. Read `references/_sections.md`, then load only the reference files that match the task.
4. Make the packaging model explicit before creating or refactoring the app. Default to packaged for Store-like product workflows and Visual Studio deploy/F5 flows. Default to unpackaged when the user expects repeatable CLI build-and-run loops or direct `.exe` launches after each change.
5. When the task is an opaque XAML compiler failure such as `MSB3073` or `XamlCompiler.exe`, read `references/foundation-template-first-recovery.md` and simplify back toward the current `dotnet new winui` scaffold for the chosen packaging model before inventing custom recovery structure.
6. For any work that creates or changes a WinUI app, make a complete but minimal edit set, then build the app and run it before responding to the user. Do this by default even when the user did not explicitly ask for verification. If a running app instance locks the output while more work remains, stop it, rebuild, relaunch, and continue verification. When the work is complete and launch verification succeeds, leave the final verified app instance running for the user unless they explicitly asked you not to.
7. Treat launch verification as incomplete until the app shows objective success signals such as a responsive top-level window, expected window title, or other clear startup behavior. A spawned process by itself is not enough.
8. Prefer Microsoft Learn for requirements, API expectations, and platform guidance.
9. Prefer WinUI Gallery for concrete control usage, shell composition, and design details.
10. Prefer WindowsAppSDK-Samples for scenario-level APIs such as windowing, lifecycle, notifications, deployment, and custom controls.
11. Build toward WinUI and Fluent guidance first. Treat native WinUI shells, controls, interactions, and control chrome as the default implementation path.
12. For grouped command surfaces such as document actions, editor formatting, view toggles, or page-level toolbars, favor a native `CommandBar` or other stock WinUI command surface before building a custom row with `Grid`, `StackPanel`, `Border`, or ad hoc button groupings.
13. Do not invent app-specific controls, bespoke component libraries, or custom chrome to replace stock WinUI behavior unless the user explicitly asks for that customization, the existing product design system already requires it, or a verified platform gap leaves no clean native option.
14. When customization is needed, first compose, template, or restyle built-in WinUI controls and system resources before adding CommunityToolkit dependencies or authoring a new custom control.
15. Use CommunityToolkit only when built-in WinUI controls or helpers do not cover the need cleanly.
16. Support both light and dark mode by default. Treat single-theme output as an exception that requires an explicit user request or an existing product constraint.
17. Use theme-aware resources, system brushes, and WinUI styling hooks instead of hard-coded light-only or dark-only colors when building or revising UI.
18. Make scroll ownership explicit for collection layouts. When a page already scrolls vertically, do not assume a nested `GridView` or other scroll-owning collection will still render a horizontal poster rail correctly.
19. Do not add extra `Border` wrappers around sections, lists, or cards unless the border is doing distinct work that the contained control or parent surface does not already provide. Avoid "double-card" compositions where a section `Border` wraps child items that already render as cards.
20. Treat responsiveness as a shell-plus-page problem, not only a control-resize problem. Plan explicit wide, medium, and phone-width behavior for navigation, padding, content density, and footer/tool regions, and simplify or hide nonessential UI as width shrinks.

## Common Routes

| Request | Read first |
| --- | --- |
| Check whether this PC can build WinUI apps | `references/foundation-environment-audit-and-remediation.md` |
| Install missing WinUI prerequisites | `references/foundation-environment-audit-and-remediation.md` |
| Start a new packaged or unpackaged app | `references/foundation-setup-and-project-selection.md` |
| Recover from opaque XAML compiler or startup failures while staying anchored to the template scaffold | `references/foundation-template-first-recovery.md` |
| Build, run, or verify that a WinUI app actually launched | `references/build-run-and-launch-verification.md` |
| Review app structure, pages, resources, and bindings | `references/foundation-winui-app-structure.md` |
| Choose shell, navigation, title bar, or multi-window patterns | `references/shell-navigation-and-windowing.md` |
| Choose controls or responsive layout patterns | `references/controls-layout-and-adaptive-ui.md` |
| Apply Mica, theming, typography, icons, or Fluent styling | `references/styling-theming-materials-and-icons.md` |
| Improve accessibility, keyboarding, or localization | `references/accessibility-input-and-localization.md` |
| Diagnose responsiveness or UI-thread performance | `references/performance-diagnostics-and-responsiveness.md` |
| Decide whether to use CommunityToolkit | `references/community-toolkit-controls-and-helpers.md` |
| Handle lifecycle, notifications, or deployment | `references/windows-app-sdk-lifecycle-notifications-and-deployment.md` |
| Run a review checklist | `references/testing-debugging-and-review-checklists.md` |

## Environment Rules

- Do not guess whether the machine is ready for WinUI development. Verify it.
- Use the bundled setup-and-scaffold flow in this skill for fresh setup, remediation, and first-project scaffolding instead of delegating to another skill.
- Treat `config.yaml` in this skill directory as the bundled bootstrap source of truth.
- Treat uncertain environment signals as uncertain, not as success.
- If the task is audit-only and the user declines machine changes, use the manual verification guidance in `references/foundation-environment-audit-and-remediation.md` and keep uncertain signals explicit instead of implying success.
- If `config.yaml` is missing, say so clearly and fall back to the official Microsoft workflow instead of pretending the bundled path exists.
- Keep environment readiness, packaging choice, and application startup verification as separate checks. Passing one does not prove the others.
- Fail closed on ambiguous launch results. If the app did not clearly open, keep debugging.
- After creating or editing a WinUI app, do not stop at a successful build. Launch the app, confirm objective startup behavior, and leave the final verified app instance running before returning control to the user unless they explicitly say not to run it.

## Reference Rules

- Keep C# as the primary path. Mention C++ or C++/WinRT only when the difference is material.
- Preserve the conventions of an existing codebase instead of forcing a generic sample structure onto it.
- Treat WinUI design guidance and native controls as the baseline. Do not drift into bespoke component systems or app-specific replacements for standard controls unless the user explicitly requests them or the existing codebase already depends on them.
- Support light and dark mode by default for app UI work unless the user explicitly asks for a single-theme result or the product already enforces one.
- Favor built-in WinUI controls and system styling hooks before adding CommunityToolkit dependencies, custom controls, or app-specific surface systems.
- Put detailed control, theming, shell, scrolling, responsiveness, packaging, and recovery guidance in the matching reference files instead of duplicating those rules here.


<!-- END SKILL: winui-app -->

<!-- START SKILL: workspace-documentation -->

---
name: "workspace-documentation"
description: "Use when creating, modifying, organizing, or archiving any documentation (.md files) in the workspace to ensure strict adherence to the project SOP and directory structures."
---

# Workspace Documentation Skill & SOP

This skill enforces the official standard for creating, maintaining, and organizing technical documentation (.md files) across all applications in the repository.

## When to Use
- Whenever you are asked to write a specification, plan, audit report, guide, or readme.
- Whenever you are asked to clean up, reorganize, or index the documentation folders.

## Rules & Workflow

### 1. App Isolation (Strict Boundaries)
- **App-Specific Docs**: Must reside in the app's own documentation folder (e.g. `apps/gurudevi-mobile/docs/`). Never place app-specific specifications at the root.
- **Root/Ecosystem Docs**: Root `docs/` is reserved strictly for global, platform-wide playbooks, deployment constraints, or monorepo tools.

### 2. Dual-Naming Convention

To ensure chronological clarity and prevent link breakage, use this naming convention:

| Category | Naming Convention | Description | Example |
| :--- | :--- | :--- | :--- |
| **Reference Guides** | Static Kebab-case | Continuously updated source-of-truth playbooks. Keep filenames static to avoid breaking links. | `/docs/architecture/ui-color-doctrine.md` |
| **Point-in-Time Docs** | Date Prefix (`YYYY-MM-DD-title.md`) | Audits, progress logs, RFCs, ADRs. Naturally sorts chronologically. | `/docs/architecture/2026-06-08-audit-report.md` |

### 3. Mandatory YAML Frontmatter
Every single markdown file in the workspace must start with a YAML block:

```yaml
---
title: "Clean Document Title"
status: "active" | "draft" | "superseded" | "deprecated"
created: YYYY-MM-DD
updated: YYYY-MM-DD
author: "Name"
tags: [reorganized, architecture]
superseded_by: "relative/path/to/newer-doc.md" # Optional
---
```

### 4. Lifecycle & Archiving
- Do not delete historical documents if they contain contextual history. Instead, set `status: superseded` in the YAML block, link to the replacement, and keep them in their context folder.
- Move transient/finished implementation plans to the app's `current_progress/old_docs/` folder, structured by timeframe (e.g., `old_docs/2026-Q1/`).


<!-- END SKILL: workspace-documentation -->

<!-- START SKILL: yeet -->

---
name: "yeet"
description: "Use only when the user explicitly asks to stage, commit, push, and open a GitHub pull request in one flow using the GitHub CLI (`gh`)."
---

## Prerequisites

- Require GitHub CLI `gh`. Check `gh --version`. If missing, ask the user to install `gh` and stop.
- Require authenticated `gh` session. Run `gh auth status`. If not authenticated, ask the user to run `gh auth login` (and re-run `gh auth status`) before continuing.

## Naming conventions

- Branch: `codex/{description}` when starting from main/master/default.
- Commit: `{description}` (terse).
- PR title: `[codex] {description}` summarizing the full diff.

## Workflow

- If on main/master/default, create a branch: `git checkout -b "codex/{description}"`
- Otherwise stay on the current branch.
- Confirm status, then stage everything: `git status -sb` then `git add -A`.
- Commit tersely with the description: `git commit -m "{description}"`
- Run checks if not already. If checks fail due to missing deps/tools, install dependencies and rerun once.
- Push with tracking: `git push -u origin $(git branch --show-current)`
- If git push fails due to workflow auth errors, pull from master and retry the push.
- Open a PR and edit title/body to reflect the description and the deltas: `GH_PROMPT_DISABLED=1 GIT_TERMINAL_PROMPT=0 gh pr create --draft --fill --head $(git branch --show-current)`
- Write the PR description to a temp file with real newlines (e.g. pr-body.md ... EOF) and run pr-body.md to avoid \\n-escaped markdown.
- PR description (markdown) must be detailed prose covering the issue, the cause and effect on users, the root cause, the fix, and any tests or checks used to validate.


<!-- END SKILL: yeet -->

<!-- START SKILL: zenstack-access-control -->

---
name: zenstack-access-control
description: Add access control to a ZenStack V3 schema. Use when writing access policies (@@allow / @@deny), the auth() function, field-level rules, post-update rules, or setting up the policy plugin and $setAuth runtime. (For data validation — @email/@length/@@validate — see zenstack-querying.)
---

# ZenStack V3 — Access Control

ZenStack enforces access policies declared in ZModel at the ORM layer. Policies live next to your
models (see `zenstack-schema-modeling`); enforcement is opt-in via a runtime plugin. For client/query
basics — and for **data validation** — see `zenstack-querying`.

After editing policies, run `zen generate` to regenerate the client (it also validates the schema,
policy expressions included). If you only want to validate without regenerating, run `zen check`.

## Runtime setup (required for policies to apply)

Policies do nothing until you (1) declare the plugin in the schema and (2) install it on the client.

**Schema:**

```zmodel
plugin policy {
    provider = '@zenstackhq/plugin-policy'
}
```

Install the package: `npm install @zenstackhq/plugin-policy`.

**Client:**

```ts
import { ZenStackClient } from '@zenstackhq/orm';
import { PolicyPlugin } from '@zenstackhq/plugin-policy';

const db = new ZenStackClient(schema, { dialect });   // raw, unprotected
export const authDb = db.$use(new PolicyPlugin());     // access control enforced
```

`ZenStackClient` instances are **immutable** — `$use()` and `$setAuth()` return new (cheap, shallow-
clone) instances and never mutate the original. Query with `db` to bypass policies (e.g. trusted
server code) and with the policy-enforced client for user-facing access.

## The current user — `auth()` and `$setAuth()`

Bind the authenticated user per request; `auth()` in policies resolves to it.

```ts
const userDb = authDb.$setAuth(user);   // user-bound client
await userDb.post.findMany();           // policies evaluated against `user`
```

- No `$setAuth()` → anonymous mode → `auth()` is `null`. `$setAuth(undefined)` forces anonymous.
- Read the bound user back via `client.$auth`.

**Define what `auth()` returns**, by priority: a `model`/`type` annotated `@@auth`, otherwise a
model literally named `User`, otherwise a compile error. Using a `type` decouples the auth shape
from your tables:

```zmodel
type Auth {
    id   Int
    role String
    @@auth
}
```

## Policy rules — `@@allow` / `@@deny`

```
@@allow(operation, condition)
@@deny(operation, condition)
```

**Operations** (comma-separate to combine): `create`, `read`, `update`, `delete`, `post-update`,
and `all` (= create+read+update+delete, **not** post-update).

**Evaluation** (secure by default): any matching `@@deny` → denied; else any matching `@@allow` →
allowed; else denied. `read`/`update`/`delete` silently *filter out* rows that fail, rather than
erroring; `create` is checked before insert.

```zmodel
model User {
    id    Int    @id @default(autoincrement())
    email String @unique
    posts Post[]

    @@allow('create,read', true)        // anyone can sign up; profiles public
    @@allow('all', auth().id == id)     // the user has full access to themselves
}

model Post {
    id        Int     @id @default(autoincrement())
    title     String
    published Boolean @default(false)
    author    User    @relation(fields: [authorId], references: [id])
    authorId  Int

    @@deny('all', auth() == null)       // no anonymous access
    @@allow('read', published)          // published posts readable by anyone
    @@allow('all', auth().id == authorId) // author has full access
}
```

## Policy expressions

- Operators: `==` `!=` `>` `>=` `<` `<=`, `&&` `||` `!`, and field references.
- **To-one relations**: dot access — `auth().city == profile.address.city`.
- **To-many relations**: collection predicates
  - `relation?[cond]` — **some** match
  - `relation![cond]` — **all** match
  - `relation^[cond]` — **none** match

  ```zmodel
  @@deny('delete', posts?[published == true])   // can't delete a user with published posts
  ```
- Use `this` to escape the collection scope: `comments?[author.verified && this.published]`.
- **`create` rules** can only reference *owned* relations (those whose FK the model holds) — other
  relations don't exist yet at creation time.
- **`check(relation [, op])`** delegates the check to a to-one relation's policies, avoiding
  duplication: `@@allow('read', check(user))` / `@@allow('update', check(user, 'update'))`.
- Helper functions usable in expressions: `contains`, `startsWith`, `endsWith` (each takes an
  optional case-insensitive flag), `has`, `hasSome`, `hasEvery`, `isEmpty`, `currentModel()`,
  `currentOperation()`.

## Field-level policies (v3.2.0+, preview)

Single-`@` `@allow` / `@deny` on a field, operations `read` and `update` only.

```zmodel
model User {
    id    Int    @id
    email String @allow('update', auth() == this)  // only the owner can change it
    name  String @deny('read', auth() == null)     // hidden from anonymous readers
}
```

- Failing a **read** policy *nullifies* the field (returned as `null`, still usable in SQL
  computations) — you can't distinguish a real `null` from a denied one.
- Failing an **update** policy rejects the whole update (`ORMError`, reason `REJECTED_BY_POLICY`).

## Post-update rules

`post-update` expresses conditions that must hold *after* an update; field references see the
**new** values, and `before()` reads the **old** values. (This replaces V2's `future()`.)

```zmodel
model Post {
    published Boolean @default(false)
    authorId  Int

    @@deny('post-update', published == true && auth().id != authorId)  // only author can publish
    @@deny('post-update', before().authorId != authorId)               // authorId is immutable
}
```

If a model has no `post-update` rule, an update only needs to pass `update`. If it has any, at least
one `@@allow('post-update', ...)` must pass.

## Execution order & error reasons

Per mutation, policies are checked **before** the database is touched (after any input validation —
see `zenstack-querying`). Policy-related `ORMError.reason` values: `REJECTED_BY_POLICY` (policy) and
`NOT_FOUND` (missing or filtered out by a read policy). `REJECTED_BY_POLICY` further carries
`rejectedByPolicyReason`: `NO_ACCESS`, `CANNOT_READ_BACK` (mutation allowed but result not readable
back), or `OTHER`.

## Limitations

- Database-level cascade deletes/updates and triggers are **not** policed by ZenStack.
- Raw SQL (`$queryRaw`/`$executeRaw`) and query-builder access bypass policies. Allow raw SQL while
  the policy plugin is installed only via `new PolicyPlugin({ dangerouslyAllowRawSql: true })`
  (v3.5.0+).

## Reference docs

Full ZenStack documentation for this topic is bundled under [`references/`](references/):

- [access-control-overview.md](references/access-control-overview.md) — how access control works
- [write-policies.md](references/write-policies.md) — `@@allow`/`@@deny`, `auth()`, expressions
- [enforcing-policies.md](references/enforcing-policies.md) — policy plugin + `$setAuth` runtime
- [post-update.md](references/post-update.md) — `post-update` rules and `before()`
- [field-level.md](references/field-level.md) — field-level read/update policies
- [zmodel-expression-reference.md](references/zmodel-expression-reference.md) — policy expression reference
- [policy-plugin-reference.md](references/policy-plugin-reference.md) — policy plugin options


<!-- END SKILL: zenstack-access-control -->

<!-- START SKILL: zenstack-crud-server -->

---
name: zenstack-crud-server
description: Expose ZenStack V3 data as automatic CRUD web APIs ("Query as a Service") and consume them. Use when adding REST/RPC endpoints with a server adapter (Express, Fastify, Next.js, Nuxt, SvelteKit, Hono, Elysia, TanStack Start), wiring per-request access control via getClient/$setAuth, generating an OpenAPI spec, or calling the API from a client (fetch-client, TanStack Query hooks).
---

# ZenStack V3 — Automatic CRUD Services (Query as a Service)

ZenStack turns your data model into secure CRUD web APIs with no hand-written controllers. Two
pieces combine:

- **API handler** — framework-agnostic; defines the API style (RPC or RESTful) and translates HTTP
  requests into ORM queries. From `@zenstackhq/server/api`.
- **Server adapter** — framework-specific glue that installs a handler into Express/Next.js/etc. and
  supplies a per-request, policy-enforced ORM client. From `@zenstackhq/server/<framework>`.

```
HTTP request → server adapter → API handler (RPC | REST) → ZenStack ORM (policies applied) → DB
```

This builds on the other skills: define the schema with `zenstack-schema-modeling`, secure it with
`zenstack-access-control`, and create the base client with `zenstack-querying`. Install the server
package: `npm install @zenstackhq/server`.

## API handlers

**RPC** — mirrors the ORM API 1:1. Routes look like `GET /post/findMany?q=<urlencoded-json>` and
`POST /post/create` (body `{ data: ... }`); responses are wrapped in `{ data: ... }`.

```ts
import { RPCApiHandler } from '@zenstackhq/server/api';
import { schema } from '~/zenstack/schema';

const apiHandler = new RPCApiHandler({ schema });
```

RPC endpoints: every ORM op (`findMany`, `findUnique`, `findFirst`, `count`, `aggregate`,
`groupBy`, `create`, `createMany`, `createManyAndReturn`, `upsert`, `update`, `updateMany`,
`updateManyAndReturn`, `delete`, `deleteMany`), plus `$procs/<name>` for custom procedures and
`$transaction/sequential`. Status codes: `201` create, `200` other success, `400` malformed,
`403` policy violation, `404` not found, `422` validation error, `500` unexpected.

**RESTful** — JSON:API v1.1 compliant. Routes like `GET /post`, `GET /post/:id`, `POST /post`,
`PUT|PATCH /post/:id`, `DELETE /post/:id`, plus relationship routes.

```ts
import { RestApiHandler } from '@zenstackhq/server/api'; // note: RestApiHandler, not RESTful

const apiHandler = new RestApiHandler({
    schema,
    endpoint: 'http://localhost:3000/api', // required — used to build resource links
});
```

`RestApiHandler` options: `endpoint` (required), `pageSize` (default 100; `Infinity` disables
paging), `modelNameMapping` (`{ User: 'users' }`), `externalIdMapping` (`{ Tag: 'name' }`),
`nestedRoutes` (bool). REST query params: `filter[field]=`, `filter[field$op]=` (`$lt`,`$gt`,
`$contains`,`$startsWith`,…), `sort=field,-other`, `page[offset]=`/`page[limit]=`,
`include=rel,rel.nested`, `fields[type]=a,b`.

Both handlers also accept `queryOptions` for **slicing/omitting** what the API exposes:

```ts
new RPCApiHandler({
    schema,
    queryOptions: {
        slicing: {
            includedModels: ['User', 'Post'],
            models: { post: { excludedOperations: ['delete'] } },
        },
        omit: { user: { password: true } },
    },
});
```

## Server adapters — `getClient` is where access control lives

Every adapter takes `apiHandler` and a `getClient(request) => ClientContract` callback. Return a
**policy-enforced client bound to the current user** via `$setAuth` (see `zenstack-access-control`),
so each request is isolated:

```ts
getClient: (req) => authDb.$setAuth(getSessionUser(req)),
```

`authDb` is `db.$use(new PolicyPlugin())`. Return `authDb.$setAuth(undefined)` for anonymous, or the
raw `db` to bypass policies (rarely what you want for a public API).

### Express

```ts
import { ZenStackMiddleware } from '@zenstackhq/server/express';

app.use(express.json());
app.use(
    '/api/model',
    ZenStackMiddleware({
        apiHandler,
        getClient: (req) => authDb.$setAuth(getSessionUser(req)),
    }),
);
```

(Optional `sendResponse: false` writes to `res.locals` and calls `next()` instead.)

### Fastify

```ts
import { ZenStackFastifyPlugin } from '@zenstackhq/server/fastify';

server.register(ZenStackFastifyPlugin, {
    prefix: '/api/model', // required
    apiHandler,
    getClient: (req) => authDb.$setAuth(getSessionUser(req)),
});
```

### Next.js — App Router

```ts
// src/app/api/model/[...path]/route.ts
import { NextRequestHandler } from '@zenstackhq/server/next';

const handler = NextRequestHandler({
    apiHandler,
    getClient: (req) => authDb.$setAuth(getSessionUser(req)),
    useAppDir: true,
});
export {
    handler as GET,
    handler as POST,
    handler as PUT,
    handler as PATCH,
    handler as DELETE,
};
```

### Next.js — Pages Router

```ts
// src/pages/api/model/[...path].ts
import { NextRequestHandler } from '@zenstackhq/server/next';

export default NextRequestHandler({
    apiHandler,
    getClient: (req, res) => authDb.$setAuth(getSessionUser(req, res)),
});
```

### Nuxt

```ts
// server/api/model/[...].ts
import { createEventHandler } from '@zenstackhq/server/nuxt';

export default createEventHandler({
    apiHandler,
    getClient: (event) => authDb.$setAuth(getSessionUser(event)),
});
```

### SvelteKit (API route — preferred; wildcard param must be named `path`)

```ts
// src/routes/api/model/[...path]/+server.ts
import { SvelteKitRouteHandler } from '@zenstackhq/server/sveltekit';

const handler = SvelteKitRouteHandler({
    apiHandler,
    getClient: (event) => authDb.$setAuth(getSessionUser(event)),
});
export const GET = handler,
    POST = handler,
    PUT = handler,
    PATCH = handler,
    DELETE = handler;
```

(Legacy `SvelteKitHandler` in `hooks.server.ts` with a `prefix` option is deprecated.)

### Hono

```ts
import { createHonoHandler } from '@zenstackhq/server/hono';

app.use(
    '/api/model/*',
    createHonoHandler({
        apiHandler,
        getClient: (ctx) => authDb.$setAuth(getSessionUser(ctx)),
    }),
);
```

### Elysia

```ts
import { createElysiaHandler } from '@zenstackhq/server/elysia';

app.group('/crud', (app) =>
    app.use(
        createElysiaHandler({
            apiHandler,
            basePath: '/api/model',
            getClient: (ctx) => authDb.$setAuth(getSessionUser(ctx)),
        }),
    ),
);
```

### TanStack Start

```ts
// app/routes/api/$.ts
import { TanStackStartHandler } from '@zenstackhq/server/tanstack-start';

const handler = TanStackStartHandler({
    apiHandler,
    getClient: (req) => authDb.$setAuth(getSessionUser(req)),
});
export const Route = createFileRoute('/api/$')({
    server: {
        handlers: {
            GET: handler,
            POST: handler,
            PUT: handler,
            PATCH: handler,
            DELETE: handler,
        },
    },
});
```

## Data type serialization

Handlers use **superjson** so non-JSON types survive the wire: `DateTime` → ISO string, `Bytes` →
base64, `BigInt`/`Decimal` → string. The generated client SDKs handle this automatically. If you
hand-craft requests, include the superjson `meta` under a `serialization` key
(`{ "data": ..., "meta": { "serialization": <meta> } }`); responses carry the same.

## Consuming the API

### Fetch client (v3.7.0+, RPC APIs only)

```ts
import { createClient } from '@zenstackhq/fetch-client';
import { schema } from '~/zenstack/schema';

const client = createClient(schema, {
    endpoint: 'https://example.com/api/model',
});
const users = await client.user.findMany({ include: { posts: true } });
await client.post.create({ data: { title: 'Hello' } });
```

Add auth via a custom `fetch`:

```ts
import type { FetchFn } from '@zenstackhq/fetch-client';
const fetchFn: FetchFn = (url, init) =>
    fetch(url, {
        ...init,
        headers: { ...init?.headers, authorization: `Bearer ${getToken()}` },
    });
createClient(schema, { endpoint, fetch: fetchFn });
```

Custom procedures: `client.$procs.getStats.query()` / `client.$procs.send.mutate({ args })`.
Sequential tx: `client.$transaction([{ model, op, args }, ...])`.

### TanStack Query hooks (RPC APIs only; React 18+/Vue 3+/Svelte 5.25+)

Install `@zenstackhq/tanstack-query` and the matching `@tanstack/*-query`. Provide settings near the
root (React shown; Vue uses `provideQuerySettingsContext`, Svelte `setQuerySettingsContext`):

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QuerySettingsProvider } from '@zenstackhq/tanstack-query/react';

<QueryClientProvider client={new QueryClient()}>
    <QuerySettingsProvider value={{ endpoint: '/api/model' }}>
        {children}
    </QuerySettingsProvider>
</QueryClientProvider>;
```

Hooks mirror the ORM client via `useClientQueries(schema)`:

```ts
import { useClientQueries } from '@zenstackhq/tanstack-query/react';

const client = useClientQueries(schema);
const { data } = client.user.useFindMany({ include: { posts: true } });
const create = client.post.useCreate();
create.mutate({ data: { title: 'New post' } });
```

- **Auto invalidation**: mutations invalidate affected queries automatically (respects nested
  reads/writes and cascades). Opt out per mutation with `{ invalidateQueries: false }`.
- **Optimistic updates**: `client.post.useCreate({ optimisticUpdate: true })`; customize with
  `optimisticUpdateProvider`.
- Also: `useInfiniteFindMany`, `$procs.<name>.useQuery()/useMutation()`,
  `$transaction.useSequential()`, and `DbNull`/`JsonNull`/`AnyNull` exports for JSON nulls.

A community **Pinia Colada** integration exists as `zenstack-pinia-colada` (Vue 3).

## OpenAPI spec

Both handlers can emit an OpenAPI spec via `generateSpec()` (RPC v3.6.0+, REST v3.5.0+):

```ts
import type { OpenApiSpecOptions } from '@zenstackhq/server/api';

app.get('/api/openapi.json', async (_req, res) => {
    const spec = await apiHandler.generateSpec({
        title: 'My Blog API',
        version: '2.0.0',
        respectAccessPolicies: true, // emit 403 responses for policy-protected models
    });
    res.json(spec);
});
```

Options: `title` (default `'ZenStack Generated API'`), `version` (default `'1.0.0'`), `description`,
`summary`, `respectAccessPolicies` (default false). `queryOptions.slicing`/`omit` on the handler
also shape what appears in the spec.

## Reference docs

Full ZenStack documentation for this topic is bundled under [`references/`](references/):

- [service-overview.md](references/service-overview.md) — automatic CRUD service overview
- [server-adapter.md](references/server-adapter.md) — server adapter concepts
- [api-handler-overview.md](references/api-handler-overview.md) — API handlers overview
- [api-handler-rpc.md](references/api-handler-rpc.md) — RPC API handler
- [api-handler-rest.md](references/api-handler-rest.md) — RESTful API handler
- [client-sdk-overview.md](references/client-sdk-overview.md) — client SDK overview
- [fetch-client.md](references/fetch-client.md) — fetch client
- [tanstack-query.md](references/tanstack-query.md) — TanStack Query hooks
- [openapi-overview.md](references/openapi-overview.md) — OpenAPI overview
- [openapi-rpc.md](references/openapi-rpc.md) — OpenAPI for RPC
- [openapi-restful.md](references/openapi-restful.md) — OpenAPI for REST
- [api-reference.md](references/api-reference.md) — server API reference
- Server adapters: [express](references/adapter-express.md), [fastify](references/adapter-fastify.md), [next](references/adapter-next.md), [nuxt](references/adapter-nuxt.md), [sveltekit](references/adapter-sveltekit.md), [hono](references/adapter-hono.md), [elysia](references/adapter-elysia.md), [tanstack-start](references/adapter-tanstack-start.md)


<!-- END SKILL: zenstack-crud-server -->

<!-- START SKILL: zenstack-db-migration -->

---
name: zenstack-db-migration
description: Manage database schema migrations in ZenStack V3. Use when creating/applying migrations (zen migrate dev/deploy/reset/status/resolve), prototyping with zen db push, introspecting an existing database with zen db pull, seeding, handling unsupported features (views) with --create-only, or wiring migrations into a deployment pipeline.
---

# ZenStack V3 — Database Migrations

ZenStack keeps your database schema in sync with your ZModel data model. Migration is built on top
of [Prisma Migrate](https://www.prisma.io/docs/orm/prisma-migrate): the `zen` CLI generates a Prisma
schema from your ZModel under the hood and wraps the corresponding Prisma command. If you know Prisma
Migrate, the workflow is identical — just swap `prisma` for `zen`. Existing migration history keeps
working once moved into ZenStack's layout (`prisma/migrations` → `zenstack/migrations`, the default
location next to `zenstack/schema.zmodel`).

This skill assumes a project is already set up (see `zenstack-project-setup`). Schema authoring is in
`zenstack-schema-modeling`. `@zenstackhq/cli` carries a peer dependency on `prisma`, installed
automatically when needed.

> Run `zen generate` after schema changes to refresh generated types; migration commands operate on
> the schema independently of the generated client.

## Two ways to evolve the schema

| Approach | Command | When |
| -------- | ------- | ---- |
| **Schema prototyping** | `zen db push` | Local dev/experimentation — syncs the DB to the schema with **no migration file**. Fast, but loses history. **Never in production.** |
| **Tracked migrations** | `zen migrate dev` → `zen migrate deploy` | Anything you ship — generates reviewable, committed SQL migration files applied deterministically across environments. |

Typical loop: prototype with `db push` while iterating, then create a migration with `migrate dev`
once the shape settles.

## Commands

All migration/db commands accept `--schema <file>` (defaults to `zenstack/schema.zmodel`) and
`--migrations <path>` (the directory holding `migrations/`).

### `zen migrate dev` — create + apply a migration (development)

Diffs the schema against migration history, generates a new timestamped migration file, and applies
it to the dev database. Prompts if a full reset is required (e.g. drift).

```bash
zen migrate dev --name add_published_flag
```

- `-n, --name <name>` — name the migration (otherwise you're prompted).
- `--create-only` — generate the migration file **without applying it**. Use this to hand-edit SQL,
  or to implement features the migration engine doesn't generate yet (e.g. database views — create
  an empty migration and write the SQL manually), then apply later with `zen migrate dev`.

Review the generated SQL before committing it to source control.

### `zen migrate deploy` — apply pending migrations (production)

Applies all not-yet-applied migrations. Idempotent and non-interactive — this is the command for
your **deployment pipeline**. It never generates new migrations or resets data.

```bash
zen migrate deploy
```

### `zen migrate status` — inspect migration state

Shows which migrations are applied vs. pending. Useful in CI before deploying.

```bash
zen migrate status
```

### `zen migrate resolve` — fix history without touching the schema

Marks a migration as applied or rolled back — for manual recovery (e.g. a migration applied
out-of-band, or a failed one). Does not change the database schema.

```bash
zen migrate resolve --applied 20240101120000_add_users
zen migrate resolve --rolled-back 20240101120000_add_users
```

### `zen migrate reset` — wipe and reapply (development)

Drops all tables and replays every migration from scratch. Destructive — **dev/testing only, never
production**.

```bash
zen migrate reset --force   # --force skips the confirmation prompt
```

If a seed script is configured, it runs after reset (use `--skip-seed` to skip).

### `zen db push` — sync schema, no migration file (development)

Pushes the schema straight to the database. Great for rapid prototyping; no history is recorded.

```bash
zen db push
zen db push --accept-data-loss   # proceed despite data-loss warnings
zen db push --force-reset        # reset the DB before pushing
```

### `zen db pull` — introspect an existing database (v3.4.0+, experimental)

Loads the database schema, diffs it against your ZModel, and updates the ZModel to match. Useful for
adopting ZenStack on an existing DB, or re-syncing after out-of-band DB changes. This has its own
implementation (not Prisma's introspection engine).

```bash
zen db pull
```

Options: `-o, --output <path>`, `--model-casing <pascal|camel|snake|none>` (default `pascal`),
`--field-casing <...>` (default `camel`), `--always-map` (always emit `@map`/`@@map`),
`--quote <double|single>` (default `single`), `--indent <number>` (default `4`).

> **Warning:** `zen db pull` can overwrite your schema file. Commit or back it up first.

### `zen db seed` — seed the database

Runs the seed script declared in `package.json` under `zenstack.seed`:

```json
{ "zenstack": { "seed": "tsx ./zenstack/seed.ts" } }
```

```bash
zen db seed
zen db seed -- --users 10   # args after -- are forwarded to the seed script
```

## Workflows

**Development**

1. Edit `zenstack/schema.zmodel`.
2. `zen db push` to try it instantly while iterating (optionally `zen db seed`).
3. When the shape is final, `zen migrate dev --name <change>` to create the migration.
4. Review the SQL, commit the migration file.

**Production / CI deployment**

```bash
zen migrate deploy
```

Run it in the release pipeline. Optionally gate on `zen migrate status` first. Do **not** run
`db push`, `migrate dev`, or `migrate reset` against production.

**Adopt an existing database**

`zen init` → set the datasource `url` → `zen db pull` → refine the schema (policies, computed
fields) → `zen generate`. See `zenstack-project-setup`.

## Adopting from Prisma

Because migration wraps Prisma Migrate, your existing migration history keeps working once you move
the `prisma/migrations` directory to `zenstack/migrations` (ZenStack's default, next to
`zenstack/schema.zmodel`) and replace the `prisma migrate ...` / `prisma db ...` scripts with the
`zen` equivalents. Full framework migration is covered by `zenstack-migrate-from-prisma`.

## Reference docs

Full ZenStack documentation for this topic is bundled under [`references/`](references/):

- [migration.md](references/migration.md) — migration concepts and workflows
- [introspection.md](references/introspection.md) — `zen db pull` introspection
- [cli-reference.md](references/cli-reference.md) — complete `migrate`/`db` command + option reference


<!-- END SKILL: zenstack-db-migration -->

<!-- START SKILL: zenstack-migrate-from-prisma -->

---
name: zenstack-migrate-from-prisma
description: Migrate an existing Prisma project to ZenStack V3. Use when replacing Prisma/@prisma/client with ZenStack, converting schema.prisma to ZModel, swapping PrismaClient for ZenStackClient, updating generate/migrate scripts, mapping Prisma custom generators and client extensions, or keeping Prisma migrate tooling working.
---

# Migrating from Prisma to ZenStack V3

ZenStack V3 is designed as a drop-in upgrade path for Prisma: it keeps a Prisma-compatible query API
and a schema language (ZModel) that is a superset of the Prisma schema. Most apps migrate with
mechanical changes and no query rewrites. Supported databases: **PostgreSQL, MySQL, SQLite**.

For general setup/CLI details see `zenstack-project-setup`; for the client/dialect see
`zenstack-querying`; for schema syntax see `zenstack-schema-modeling`.

## At a glance

| Prisma | ZenStack V3 |
| ------ | ----------- |
| `prisma`, `@prisma/client` | `@zenstackhq/cli` (dev), `@zenstackhq/schema`, `@zenstackhq/orm` |
| `schema.prisma` | `zenstack/schema.zmodel` (Prisma schema is valid ZModel) |
| `prisma generate` | `zen generate` |
| `prisma db push` / `migrate dev` / `migrate deploy` | `zen db push` / `zen migrate dev` / `zen migrate deploy` |
| `new PrismaClient()` | `new ZenStackClient(schema, { dialect })` |
| bundled DB engine | you install a DB driver (`pg` / `mysql2` / `better-sqlite3`) |

## Step 1 — Swap dependencies

```bash
npm uninstall prisma @prisma/client
npm install @zenstackhq/schema @zenstackhq/orm
npm install --save-dev @zenstackhq/cli
```

ZenStack does **not** bundle a database engine — install the driver for your database:

| Database   | Install |
| ---------- | ------- |
| PostgreSQL | `npm install pg` + `npm install -D @types/pg` |
| MySQL      | `npm install mysql2` |
| SQLite     | `npm install better-sqlite3` + `npm install -D @types/better-sqlite3` |

> `@zenstackhq/cli` has a peer dependency on `prisma`, which is installed automatically when needed
> for migration commands (ZenStack's migrate commands wrap Prisma Migrate).

## Step 2 — Move and rename the schema

Move `schema.prisma` → `zenstack/schema.zmodel`. **No edits are required** — every valid Prisma
schema is valid ZModel. Optional cleanup:

- Drop the `generator client { ... }` block (no effect in ZenStack — code gen is driven by
  `zen generate`).
- The `datasource` block is kept; its `url` is used by the migration engine (the ORM runtime gets
  its connection from the driver/dialect instead).
- If you used Prisma's multi-file/multi-schema feature, merge files using ZModel `import`
  statements.

Run **`zen check`** to confirm the converted schema is valid (syntax + semantics) before moving on.

Once moved, you can start adding ZenStack-only features that Prisma lacks — access policies
(`zenstack-access-control`), `@@delegate` polymorphism, typed JSON, mixins, computed fields
(`zenstack-schema-modeling`).

## Step 3 — Update the generate script

```json
{ "scripts": { "generate": "zen generate" } }
```

Run `zen generate` after every schema change, before using the client.

## Step 4 — Replace the client

Swap `new PrismaClient()` for `new ZenStackClient(schema, { dialect })`, supplying a Kysely dialect
for your driver (see `zenstack-querying` for all dialects). PostgreSQL example:

```ts
import { ZenStackClient } from '@zenstackhq/orm';
import { PostgresDialect } from '@zenstackhq/orm/dialects/postgres';
import { schema } from './zenstack/schema';
import { Pool } from 'pg';

export const db = new ZenStackClient(schema, {
    dialect: new PostgresDialect({
        pool: new Pool({ connectionString: process.env.DATABASE_URL }),
    }),
});
```

Your existing `findMany`/`create`/`update`/etc. calls keep working — the ORM API is
Prisma-compatible.

## Step 5 — Update type references

- Model types (e.g. `User`) — import from the generated `models`.
- Input/argument types (e.g. `UserCreateArgs`) — import from the generated `input`.

Most code relies on inferred types and needs no explicit imports.

## Step 6 — Update migration scripts

```json
{
  "scripts": {
    "db:push": "zen db push",
    "migrate:dev": "zen migrate dev",
    "migrate:deploy": "zen migrate deploy"
  }
}
```

Move your existing migration history from `prisma/migrations` to `zenstack/migrations` (ZenStack's
default location, next to `zenstack/schema.zmodel`). It continues to work unchanged since ZenStack
migrate wraps Prisma Migrate. See the `zenstack-db-migration` skill for the full migration workflow.

## Special case — Prisma custom generators

If you depend on Prisma custom generators (e.g. zod, ERD, type generators) that read a
`schema.prisma`, keep emitting one with the `@core/prisma` plugin and chain the commands:

```zmodel
plugin prisma {
    provider = '@core/prisma'
    output = './schema.prisma'
}
```

```json
{ "scripts": { "generate": "zen generate && prisma generate --schema=zenstack/schema.prisma" } }
```

## Mapping Prisma Client extensions

| Prisma extension | ZenStack equivalent |
| ---------------- | ------------------- |
| **Query** extension (intercept calls) | A runtime plugin via `db.$use(...)` with an `onQuery` hook |
| **Result** extension (computed fields) | `@computed` field in ZModel + the `computedFields` option on `ZenStackClient` (see `zenstack-schema-modeling`) |

## After migrating

Verify with: `zen generate` → typecheck → run your test suite / app. Then incrementally adopt
ZenStack's value-add features (access control, query builder escape hatch, auto CRUD APIs via
`zenstack-crud-server`).

> Already on **ZenStack V2**? Start here (V2 was Prisma-based), then apply the V2→V3 deltas in
> `zenstack-project-setup` (package renames, policy plugin, `post-update`/`before()`, types+mixins,
> grouped hooks).

## Reference docs

Full ZenStack documentation for this topic is bundled under [`references/`](references/):

- [migrate-prisma.md](references/migrate-prisma.md) — official "Migrating from Prisma" guide


<!-- END SKILL: zenstack-migrate-from-prisma -->

<!-- START SKILL: zenstack-migrate-from-v2 -->

---
name: zenstack-migrate-from-v2
description: Upgrade an existing ZenStack V2 project to V3. Use when renaming V2 packages (zenstack, @zenstackhq/runtime), moving access control to the policy plugin, converting future() to post-update/before(), replacing abstract models with types+mixins, updating server adapters (getPrisma → getClient), and migrating client-side TanStack Query hooks.
---

# Migrating from ZenStack V2 to V3

ZenStack V3 is a major rewrite: the Prisma ORM engine is replaced with ZenStack's own engine built
on [Kysely](https://kysely.dev), while the ZModel schema stays largely compatible and the query API
stays PrismaClient-compatible. Supported databases: **PostgreSQL, MySQL, SQLite**.

Because V2 was Prisma-based, the migration has two layers: the generic Prisma→ZenStack changes, then
the V2-specific deltas below. For general setup/CLI see `zenstack-project-setup`.

## Step 1 — Do the Prisma migration first

V2 ran on Prisma, so start with the **`zenstack-migrate-from-prisma`** skill (swap deps, move the
schema to `zenstack/schema.zmodel`, replace the client with `ZenStackClient`, update generate/migrate
scripts). Then apply the V2-specific steps below.

## Step 2 — Rename ZenStack packages

```bash
npm uninstall zenstack @zenstackhq/runtime
npm install @zenstackhq/schema @zenstackhq/orm
npm install --save-dev @zenstackhq/cli
```

| V2 | V3 |
| -- | -- |
| `zenstack` (CLI) | `@zenstackhq/cli` |
| `@zenstackhq/runtime` | `@zenstackhq/orm` |
| — | `@zenstackhq/schema` (new) |

The CLI command moves from `zenstack <cmd>` to `zen <cmd>` (e.g. `zen generate`).

## Step 3 — Access control is now a plugin

In V2 access control was built into the runtime (`enhance(prisma)`). In V3 it's an opt-in plugin.

1. Install it: `npm install @zenstackhq/plugin-policy`
2. Declare it in the schema:
   ```zmodel
   plugin policy {
       provider = '@zenstackhq/plugin-policy'
   }
   ```
3. Wrap the client and bind the user per request:
   ```ts
   import { ZenStackClient } from '@zenstackhq/orm';
   import { PolicyPlugin } from '@zenstackhq/plugin-policy';

   export const db = new ZenStackClient(schema, { dialect });
   export const authDb = db.$use(new PolicyPlugin());   // was: enhance(prisma, { user })
   // per request:
   const userDb = authDb.$setAuth(user);                // was: passing { user } to enhance()
   ```

See `zenstack-access-control` for the full policy/runtime model.

## Step 4 — Post-update policies: `future()` → `post-update` + `before()`

V2 expressed post-update conditions with `future()` inside an `update` rule. V3 uses a dedicated
`post-update` operation, where bare field references mean the **new** values and `before()` reads the
**old** ones.

```zmodel
// V2
@@deny('update', future().ownerId != ownerId)

// V3
@@deny('post-update', ownerId != before().ownerId)
```

## Step 5 — Abstract models → types + mixins

V2's `abstract model` + `extends` becomes a `type` applied with `with` (see
`zenstack-schema-modeling`).

```zmodel
// V2
abstract model Timestamped {
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
}
model Post extends Timestamped { title String }

// V3
type Timestamped {
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
}
model Post with Timestamped { title String }
```

(Note: `extends` still exists in V3, but for **polymorphism** via `@@delegate`, which is a different
feature — don't use it as a plain mixin replacement.)

## Step 6 — Server adapters

V3 requires you to pass an explicit `apiHandler` (`RPCApiHandler` or `RestApiHandler`), and the
client-supplying callback is renamed `getPrisma` → `getClient`:

```ts
// V2
ZenStackMiddleware({ getPrisma: (req) => enhance(prisma, { user: getUser(req) }) });

// V3
ZenStackMiddleware({
    apiHandler: new RPCApiHandler({ schema }),
    getClient: (req) => authDb.$setAuth(getUser(req)),
});
```

See `zenstack-crud-server` for all frameworks and both API styles.

## Step 7 — Client-side hooks (TanStack Query)

Flat hook names are replaced by hooks grouped under a client that mirrors the ORM:

```ts
// V2
import { useFindManyUser } from '~/hooks';
const { data } = useFindManyUser({ where: { ... } });

// V3
import { useClientQueries } from '@zenstackhq/tanstack-query/react';
import { schema } from '~/zenstack/schema';

const client = useClientQueries(schema);
const { data } = client.user.useFindMany({ where: { ... } });
```

**SWR support was dropped** in V3. See `zenstack-crud-server` for the full TanStack Query setup.

## Step 8 — Other plugin/utility migrations

- **Zod**: now a utility rather than a plugin (see the zod utility docs).
- **OpenAPI**: folded into the automatic CRUD API handlers — generate a spec via
  `apiHandler.generateSpec()` (see `zenstack-crud-server`).
- **Custom plugins**: the V3 plugin system is revised; consult the current plugin docs.

## After upgrading

Run `zen generate`, typecheck, and exercise your test suite / app. Confirm access control behaves as
expected now that it's an explicit `$use(new PolicyPlugin())` + `$setAuth()` flow rather than V2's
implicit `enhance()`.

## Reference docs

Full ZenStack documentation for this topic is bundled under [`references/`](references/):

- [migrate-v2.md](references/migrate-v2.md) — official "Migrating from ZenStack v2" guide


<!-- END SKILL: zenstack-migrate-from-v2 -->

<!-- START SKILL: zenstack-plugin-dev -->

---
name: zenstack-plugin-dev
description: Develop ZenStack V3 plugins. Use when building or declaring a plugin — custom ZModel attributes/functions, CLI code generators (CliPlugin with a generate callback for `zen generate`), or runtime plugins installed via $use/definePlugin (onQuery, onKyselyQuery, onEntityMutation hooks, extending the client, custom query args, computed result fields).
---

# ZenStack V3 — Plugin Development

> Plugins are a **preview** feature and may change in future releases.

A ZenStack plugin can extend the toolkit at **three levels**, independently or together:

1. **Schema (ZModel)** — contribute custom attributes (e.g. `@password`) and functions to the
   schema language.
2. **CLI (code generation)** — participate in `zen generate` to emit artifacts from the schema.
3. **Runtime (ORM)** — install on the client to intercept queries, hook CRUD lifecycle events,
   transform SQL, add custom methods, or compute fields.

ZenStack's `plugin` replaces Prisma's `generator`. To declare/consume plugins in a schema see
`zenstack-schema-modeling`; this skill is about *authoring* them.

Packages: `@zenstackhq/orm` (runtime plugin types), `@zenstackhq/sdk` (CLI plugin types + ZModel
AST). Install the SDK as a dev dependency: `npm install -D @zenstackhq/sdk`.

## Declaring a plugin in ZModel

```zmodel
plugin myPlugin {
    provider = './my-plugin'   // local .ts/.js/.mts/.mjs file, a folder with an index, or an npm package
    output   = './generated'   // arbitrary key=value options, readable by the plugin
}
```

`provider` resolution order: local file path → folder with an index → npm package. CLI plugins must
be **ESM**; TypeScript providers are loaded via [jiti](https://github.com/unjs/jiti). The built-in
`@core/typescript` plugin runs automatically; `@core/prisma` emits a Prisma schema.

## Runtime plugins

A runtime plugin is an object implementing `RuntimePlugin` from `@zenstackhq/orm`. Define it three
ways; `definePlugin` gives the best type inference:

```ts
import { definePlugin, type RuntimePlugin } from '@zenstackhq/orm';

// plain object / definePlugin (recommended)
const plugin = definePlugin({ id: 'my-plugin', /* hooks… */ });

// or a class
class MyPlugin implements RuntimePlugin<typeof schema> {
    id = 'my-plugin';
    /* hooks… */
}
```

Install on the client (immutable — returns a new client, original unchanged); remove with
`$unuse(id)` / `$unuseAll()`. You can also pass `plugins: [...]` to the `ZenStackClient` constructor.

```ts
const db = new ZenStackClient(schema, { dialect });
const withPlugin = db.$use(plugin);              // new client
const plain = withPlugin.$unuse('my-plugin');    // remove by id
// or: new ZenStackClient(schema, { dialect, plugins: [plugin] });
```

Every plugin needs a unique `id`. Add any combination of the hooks below.

### `onQuery` — intercept ORM operations

Fires for ORM API calls only (`findMany`, `create`, …), **not** the query builder. Wrap, modify
args, short-circuit, or post-process results via `proceed`.

```ts
definePlugin({
    id: 'timing',
    onQuery: async ({ model, operation, args, proceed }) => {
        const start = Date.now();
        const result = await proceed(args);
        console.log(`${model}.${operation} took ${Date.now() - start}ms`);
        return result;
    },
});
```

### `onKyselyQuery` — intercept/transform SQL

The lowest-level hook: every DB access (ORM *and* query builder) flows through Kysely here, so you
can inspect or rewrite the SQL AST (`OperationNode`) before `proceed`. Good for soft-deletes,
injected filters, column transforms.

```ts
import type { OnKyselyQueryCallback } from '@zenstackhq/orm';

const hook: OnKyselyQueryCallback<typeof schema> = async ({ query, proceed }) => {
    // inspect/transform `query` (a Kysely OperationNode), e.g. with an OperationNodeTransformer
    return proceed(query);
};
definePlugin({ id: 'sql-rewrite', onKyselyQuery: hook });
```

### `onEntityMutation` — before/after create·update·delete

Lifecycle hooks around entity mutations, with lazy loaders for the affected rows.

```ts
definePlugin({
    id: 'audit',
    onEntityMutation: {
        runAfterMutationWithinTransaction: false, // default: run after the tx commits
        async beforeEntityMutation({ model, action, loadBeforeMutationEntities }) {
            // action: 'create' | 'update' | 'delete'
            if (model === 'Post' && action === 'update') {
                const before = await loadBeforeMutationEntities();
            }
        },
        async afterEntityMutation({ model, action, loadAfterMutationEntities }) {
            const after = await loadAfterMutationEntities();
        },
    },
});
```

Set `runAfterMutationWithinTransaction: true` to run the after-hook atomically inside the mutation's
transaction. Note: mutations triggered by DB cascades are **not** captured, and the loaders can be
expensive on bulk mutations.

### Extending the client (`client`)

Add custom methods/properties under `client`. Names **must be `$`-prefixed** so they don't shadow
model accessors; grouping under one `$namespace` object is recommended.

```ts
const cacheDb = db.$use(definePlugin({
    id: 'cache',
    client: {
        $cache: {
            get stats() { return { hits: 0, misses: 0 }; },
            async invalidate() { /* … */ },
        },
    },
}));
await cacheDb.$cache.invalidate();
```

### Custom query args (`queryArgs`)

Accept extra options on ORM calls, validated with a Zod schema. Target `$all`, the
`$create`/`$read`/`$update`/`$delete` groups, or specific operations.

```ts
import { z } from 'zod';

definePlugin({
    id: 'cache',
    queryArgs: {
        $read: z.object({ cache: z.strictObject({ ttl: z.number().positive().optional() }).optional() }),
    },
    onQuery: ({ args, proceed }) => proceed(args), // read (args as any).cache
});
// await db.user.findMany({ where: {...}, cache: { ttl: 60 } });
```

### Computed result fields (`result`, v3.5.0+)

Add virtual fields computed after a query from declared `needs` fields.

```ts
definePlugin({
    id: 'full-name',
    result: {
        user: {
            fullName: {
                needs: { firstName: true, lastName: true },
                compute: (user) => `${user.firstName} ${user.lastName}`,
            },
        },
    },
});
```

## CLI plugins (code generation)

A CLI plugin is an ESM module whose **default export** is a `CliPlugin` with a `generate` callback.
It runs during `zen generate`, receiving the parsed ZModel AST.

```ts
import type { CliPlugin } from '@zenstackhq/sdk';
import { isDataModel, type InvocationExpr } from '@zenstackhq/sdk/ast';
import fs from 'node:fs';

const plugin: CliPlugin = {
    name: 'Password Report',
    // statusText is optional
    generate: ({ model, defaultOutputPath, pluginOptions }) => {
        if (pluginOptions['report'] !== true) return;       // options come from the ZModel plugin block
        let out = '# Password Fields\n\n';
        for (const dm of model.declarations.filter(isDataModel)) {
            for (const field of dm.fields) {
                const attr = field.attributes.find((a) => a.decl.$refText === '@password');
                if (attr) out += `- ${dm.name}.${field.name}\n`;
            }
        }
        fs.writeFileSync(`${defaultOutputPath}/password-fields.md`, out, 'utf-8');
    },
};
export default plugin;
```

`generate` receives `{ model, defaultOutputPath, pluginOptions }` — the ZModel AST, the resolved
output directory (the `output` option or a default), and the options from the `plugin` block.

## Schema plugins (custom attributes & functions)

Declare new ZModel attributes/functions in a `.zmodel` the plugin ships, then use them in the app
schema. `@@@targetField` constrains where an attribute applies.

```zmodel
// my-plugin/plugin.zmodel
attribute @password(hasher: Any) @@@targetField([StringField])
function bcryptHasher(rounds: Int): Any {}
```

```zmodel
// app schema
model User {
    id       Int    @id @default(autoincrement())
    password String @password(hasher: bcryptHasher(10))
}
```

## End-to-end pattern: password hasher

The docs' worked example combines all three levels into one plugin package:

1. **Schema** — `plugin.zmodel` defines `@password` + `bcryptHasher()`; the app schema applies
   `@password(hasher: bcryptHasher(10))` to a field.
2. **CLI** — a `CliPlugin.generate` walks the AST and emits a "password fields" report when the
   `report` option is set.
3. **Runtime** — a `RuntimePlugin` with `onKyselyQuery` uses a Kysely `OperationNodeTransformer` to
   detect `@password` fields (via `schema.models[...].fields[...].attributes`) and hash values on
   `INSERT`/`UPDATE` before they hit the database.

Install with `db.$use(new PasswordHasherPlugin())` (or the `plugins` constructor option), then
`npm install -D @zenstackhq/sdk` and `zen generate` to run the CLI side.

> Use **Zod v4** for `queryArgs` schemas to match ZenStack's bundled version.

## Reference docs

Full ZenStack documentation for this topic is bundled under [`references/`](references/):

- [plugin-dev.md](references/plugin-dev.md) — end-to-end plugin development guide
- [runtime-plugins-overview.md](references/runtime-plugins-overview.md) — runtime plugin model
- [extending-orm-client.md](references/extending-orm-client.md) — client methods, query args, computed fields
- [entity-mutation-hooks.md](references/entity-mutation-hooks.md) — before/after mutation hooks
- [kysely-query-hooks.md](references/kysely-query-hooks.md) — `onKyselyQuery` SQL transformation
- [query-api-hooks.md](references/query-api-hooks.md) — `onQuery` ORM interception
- [zmodel-plugin.md](references/zmodel-plugin.md) — declaring plugins in ZModel
- [zmodel-plugin-reference.md](references/zmodel-plugin-reference.md) — `plugin` block reference


<!-- END SKILL: zenstack-plugin-dev -->

<!-- START SKILL: zenstack-project-setup -->

---
name: zenstack-project-setup
description: Set up, configure, and manage a ZenStack V3 project. Use when installing ZenStack, scaffolding a new project, or running the `zen` CLI (generate). (For database schema migrations use zenstack-db-migration; to migrate a Prisma project use zenstack-migrate-from-prisma; to upgrade from ZenStack V2 use zenstack-migrate-from-v2.)
---

# ZenStack V3 — Project Setup & Migrations

ZenStack V3 is a TypeScript database toolkit with a Prisma-compatible ORM API built on
[Kysely](https://kysely.dev) (no Rust/WASM). The schema is written in **ZModel** (`.zmodel`), a
superset of the Prisma schema language. This skill covers installing, scaffolding, the CLI, and
migrations. For schema syntax see `zenstack-schema-modeling`; for queries see `zenstack-querying`;
for access control see `zenstack-access-control`.

> Always confirm exact package versions and commands against the live docs at
> https://zenstack.dev/docs when something looks off — V3 evolves quickly.

## Prerequisites

- **Node.js** v20+
- **TypeScript** v5.8.0+
- VSCode extension: "ZenStack V3" (language id `zmodel-v3`) — distinct from the V2 extension.

## Installing

### Scaffold a new project (recommended)

```bash
npm create zenstack my-project
```

### Initialize ZenStack in an existing project

```bash
npx @zenstackhq/cli zen init
```

Then create `zenstack/schema.zmodel` and run `zen generate`.

### Manual install

```bash
npm install @zenstackhq/schema @zenstackhq/orm
npm install --save-dev @zenstackhq/cli
```

ZenStack does **not** bundle database drivers — install one yourself:

| Database   | Install |
| ---------- | ------- |
| PostgreSQL | `npm install pg` + `npm install -D @types/pg` |
| MySQL      | `npm install mysql2` |
| SQLite     | `npm install better-sqlite3` + `npm install -D @types/better-sqlite3` |

Add access control only if needed: `npm install @zenstackhq/plugin-policy` (see
`zenstack-access-control`).

## Project structure

- **Schema**: `zenstack/schema.zmodel` (default; override with `--schema`).
- **Generated output**: emitted next to the schema (override with `--output`). Import it as
  `import { schema } from './zenstack/schema'`.
- You may commit the generated TypeScript, or `.gitignore` it and run `zen generate` in CI.

## The `zen` CLI

The CLI is invoked as `zen` (or `zenstack` — equivalent). Add scripts to `package.json`:

```json
{
  "scripts": {
    "generate": "zen generate",
    "db:push": "zen db push",
    "migrate:dev": "zen migrate dev",
    "migrate:deploy": "zen migrate deploy"
  }
}
```

| Command | Purpose |
| ------- | ------- |
| `zen check` | **Only** validate `schema.zmodel` for syntax and semantic errors — does not regenerate anything. Use when you just want to confirm the schema is valid. |
| `zen generate` | Compile `schema.zmodel` → TypeScript (regenerate the database client); also validates the schema as it compiles. **Run after every schema change**, before using the client. Flags: `--schema <path>`, `--output <path>`. |
| `zen db push` | Push schema to the DB **without** a migration file. Dev/testing only — never in production. |
| `zen db pull` | Introspect an existing DB and update the ZModel schema (v3.4.0+, experimental). Can overwrite your schema — back up / use source control first. |
| `zen migrate dev` | Create a migration from schema changes and apply it (dev only). `--create-only` makes an empty migration to edit by hand (e.g. for views). |
| `zen migrate deploy` | Apply all pending migrations. Use this in your production/deploy pipeline. |
| `zen migrate reset` | Drop all tables and reapply migrations. Dev/testing only. |
| `zen migrate status` | Show applied vs. pending migrations. |
| `zen migrate resolve` | Mark a migration applied/rolled-back without changing the schema (manual recovery). |

> Migration commands wrap Prisma Migrate; `@zenstackhq/cli` has a peer dependency on `prisma` that
> is installed automatically when needed.

For the full migration story — `migrate dev`/`deploy`/`reset`/`status`/`resolve`, `db push`/`pull`,
seeding, `--create-only`, and deployment-pipeline guidance — see the `zenstack-db-migration` skill.

## Workflows

**Development loop**

1. Edit `zenstack/schema.zmodel`.
2. `zen generate` (regenerate types).
3. `zen db push` to try changes locally without a migration, *or* `zen migrate dev` to create a
   reviewable, committable migration file.
4. Review the migration SQL, then commit it.

**Production deploy**

```bash
zen migrate deploy
```

**Adopt ZenStack on an existing database**

1. `zen init`
2. Set the datasource `url` in `zenstack/schema.zmodel`.
3. `zen db pull` to generate the schema from the DB.
4. Refine it (add access policies, computed fields, etc.).
5. `zen generate`.

## Migrating from Prisma

See the dedicated `zenstack-migrate-from-prisma` skill — it walks through swapping dependencies,
converting `schema.prisma` to ZModel, replacing `PrismaClient` with `ZenStackClient`, updating the
generate/migrate scripts, and mapping Prisma custom generators and client extensions.

## Migrating from ZenStack V2

See the dedicated `zenstack-migrate-from-v2` skill — it covers the package renames, moving access
control to the policy plugin, the `future()` → `post-update`/`before()` change, abstract models →
types+mixins, the `getPrisma` → `getClient` server-adapter change, and the client-side hook
migration.

## Reference docs

Full ZenStack documentation for this topic is bundled under [`references/`](references/):

- [prerequisite.md](references/prerequisite.md) — supported Node/TypeScript versions, IDE setup
- [quick-start.md](references/quick-start.md) — scaffolding and the install paths
- [cli.md](references/cli.md) — overview of every `zen` CLI command
- [cli-reference.md](references/cli-reference.md) — full CLI reference
- [migration.md](references/migration.md) — dev/production migration workflow
- [introspection.md](references/introspection.md) — `zen db pull` from an existing database


<!-- END SKILL: zenstack-project-setup -->

<!-- START SKILL: zenstack-querying -->

---
name: zenstack-querying
description: Query and mutate data with the ZenStack V3 client. Use when creating a ZenStackClient (SQLite/Postgres/MySQL dialect), using the Prisma-compatible ORM API (findMany/create/update/etc.), relation queries (select/include), computed fields, polymorphic models, strongly-typed JSON, data validation on writes (@email/@length/@@validate), transactions, the Kysely query-builder escape hatch ($qb / $expr), custom procedures, raw SQL, logging, or handling ORMError.
---

# ZenStack V3 — Querying

The ZenStack client exposes a **Prisma-compatible ORM API** for everyday queries plus a **Kysely
query builder** (`$qb`) for anything SQL-shaped that the ORM API can't express. Schema syntax is in
`zenstack-schema-modeling`; access control in `zenstack-access-control`.

## Creating the client

Import `ZenStackClient` from `@zenstackhq/orm`, pass the generated `schema` plus a Kysely `dialect`.
Install the matching driver yourself (see `zenstack-project-setup`).

**SQLite** (`better-sqlite3`):

```ts
import { ZenStackClient } from '@zenstackhq/orm';
import { SqliteDialect } from '@zenstackhq/orm/dialects/sqlite';
import SQLite from 'better-sqlite3';
import { schema } from './zenstack/schema';

export const db = new ZenStackClient(schema, {
    dialect: new SqliteDialect({ database: new SQLite('./dev.db') }),
});
```

**PostgreSQL** (`pg`):

```ts
import { ZenStackClient } from '@zenstackhq/orm';
import { PostgresDialect } from '@zenstackhq/orm/dialects/postgres';
import { schema } from './zenstack/schema';
import { Pool } from 'pg';

export const db = new ZenStackClient(schema, {
    dialect: new PostgresDialect({ pool: new Pool({ connectionString: process.env.DATABASE_URL }) }),
});
```

**MySQL** (`mysql2`):

```ts
import { MysqlDialect } from '@zenstackhq/orm/dialects/mysql';
import { createPool } from 'mysql2';

export const db = new ZenStackClient(schema, {
    dialect: new MysqlDialect({ pool: createPool(process.env.DATABASE_URL) }),
});
```

Types are fully inferred from the schema — no separate model imports needed for most code. When you
need an explicit type: `ClientContract<SchemaType>` for the client, or import generated `models` /
`input` types, or use the `ModelResult` generic from `@zenstackhq/orm` to compute a row type from a
given `select`/`include`.

To enforce access policies, wrap this client with the policy plugin — see
`zenstack-access-control`.

## ORM API

Model accessors live on the client (`db.user`, `db.post`, …). The API matches Prisma Client.

**Read**: `findMany`, `findUnique`, `findUniqueOrThrow`, `findFirst`, `findFirstOrThrow`,
`exists` (v3.2.0+, cheaper than `findFirst`/`count`), `count`, `aggregate`, `groupBy`.

```ts
const users = await db.user.findMany({
    where: { age: { gt: 18 }, email: { endsWith: '@acme.com' } },
    orderBy: { createdAt: 'desc' },
    skip: 0,
    take: 20,
});
const user = await db.user.findUnique({ where: { id: 1 } });
const n = await db.user.count({ where: { age: { gte: 18 } } });
```

**Filter operators**: `equals`, `not`, `in`, `notIn`, `contains`, `startsWith`, `endsWith`, `lt`,
`lte`, `gt`, `gte`, `between`; logical `AND`/`OR`/`NOT`; list `has`/`hasEvery`/`hasSome`/`isEmpty`
(Postgres). For to-many relations filter with `some`/`every`/`none`; for to-one, filter fields
directly.

**Aggregate / groupBy** support `_count`, `_sum`, `_avg`, `_min`, `_max`; `groupBy` filters
aggregates via `having`:

```ts
await db.post.groupBy({ by: 'authorId', _count: true, having: { viewCount: { _sum: { gt: 100 } } } });
```

**Create**: `create` (supports nested writes, runs in a transaction), `createMany` (no nested
relations; returns a count), `createManyAndReturn`.

```ts
await db.user.create({
    data: { email: 'a@b.com', posts: { create: [{ title: 'Hello' }] } },
});
```

**Update**: `update`, `updateMany` / `updateManyAndReturn` (scalar fields only), `upsert`. List
fields use `push` / `set`:

```ts
await db.post.update({ where: { id: 1 }, data: { topics: { push: 'webdev' } } });
await db.post.upsert({
    where: { id: 1 },
    create: { id: 1, title: 'New' },
    update: { title: 'Updated' },
});
```

**Delete**: `delete`, `deleteMany`, `deleteManyAndReturn`.

## Relation queries — `select` / `include` / `omit`

- `select`: pick specific fields; for a relation pass a nested object. Mutually exclusive with
  `include`/`omit`.
- `include`: pull in relations (`true` for all fields, or an object to filter/`where` the relation).
  Mutually exclusive with `select`.
- `omit`: drop specific scalar fields. Mutually exclusive with `select`.

```ts
await db.user.findMany({
    include: { posts: { where: { published: true }, select: { id: true, title: true } } },
});
```

Nested writes inside `create`/`update`/`upsert` can `create`, `connect`, `disconnect`, update, and
delete related records (deeply), all within a transaction.

## Computed fields

A field declared `@computed` in ZModel (see `zenstack-schema-modeling`) is evaluated **on the
database side**. Provide its implementation as a Kysely expression in the `computedFields` client
option; thereafter it behaves like a regular field — returned by queries, and usable in `select`,
`where`, `orderBy`, and `aggregate`.

```ts
const db = new ZenStackClient(schema, {
    dialect,
    computedFields: {
        User: {
            // SQL: (SELECT COUNT(*) FROM "Post" WHERE "Post"."authorId" = "User"."id")
            postCount: (eb) =>
                eb.selectFrom('Post')
                    .whereRef('Post.authorId', '=', 'id')
                    .select(({ fn }) => fn.countAll<number>().as('count')), // selection must be named
        },
    },
});

await db.user.findFirst();                                   // postCount included
await db.user.findFirst({ select: { email: true, postCount: true } });
await db.user.findMany({ where: { postCount: { gt: 1 } }, orderBy: { postCount: 'desc' } });
await db.user.aggregate({ _avg: { postCount: true } });
```

The callback's second arg is a `context` with `modelAlias` — use `sql.ref(\`${modelAlias}.id\`)`
(import `sql` from `@zenstackhq/orm/helpers`) to qualify the containing model's columns on conflicts.

## Polymorphic models

For models using `@@delegate` inheritance (see `zenstack-schema-modeling`), query via the usual model
accessors:

- **Create** concrete models (`db.video.create(...)`) — the base row is created automatically. Base
  models **cannot** be created directly.
- **Query a base** model (`db.content.findMany()`) and each result includes the concrete model's
  fields (unless you narrow with `select`). Querying a concrete model returns base + concrete fields.
- **Delete** either side and the counterpart row is removed too.

```ts
const user = await db.user.create({ data: { email: 'u1@test.com' } });
await db.post.create({ data: { name: 'Post1', content: 'Hi', ownerId: user.id } });
await db.video.create({ data: { name: 'Video1', url: 'http://v/1', ownerId: user.id } });

const content = await db.content.findFirstOrThrow();   // includes concrete fields
await db.user.findFirstOrThrow({ include: { contents: true } });
```

The discriminator value is typed as a string literal (or enum member), so checking it **narrows** the
result type to the matching concrete model:

```ts
const c = await db.content.findUniqueOrThrow({ where: { id: 1 } });
if (c.type === 'video') console.log(c.url);    // narrowed to Video
else if (c.type === 'image') console.log(c.data);
```

## Strongly-typed JSON

A field typed with a custom `type` + `@json` (see `zenstack-schema-modeling`) is returned **strongly
typed** (derived from the ZModel type), and inputs are validated against that type on
create/update. Validation is *loose* — extra fields not in the type are allowed.

```ts
// query results are typed: user.profile.age / user.profile.gender
const user = await db.user.create({
    data: { email: 'u1@test.com', profile: { gender: 'male', age: 20 } },
});

await db.user.update({
    where: { id: user.id },
    data: { profile: { ...user.profile, tag: 'vip' } }, // extra `tag` is allowed
});
```

## Data validation

Validation rules are declared in ZModel and enforced by the ORM on `create`/`update` inputs (not on
the query builder / raw SQL). Failures throw `ORMError` with reason `INVALID_INPUT`. Each attribute
takes an optional trailing `message`.

**Field attributes**

- String length / lists: `@length(min?, max?)`
- String content: `@startsWith`, `@endsWith`, `@contains`, `@email`, `@url`, `@phone` (E.164),
  `@datetime` (ISO 8601), `@regex(pattern)`
- String transforms (applied before save): `@lower`, `@upper`, `@trim`
- Numbers: `@gt`, `@gte`, `@lt`, `@lte`

```zmodel
model User {
    email    String  @email("Invalid email")
    password String  @length(8, 128)
    age      Int     @gte(0) @lte(150)
    website  String? @url
}
```

**Model-level `@@validate(condition, message?, path?)`** for cross-field rules, with helper
functions: `now()`, `length()`, `startsWith`/`endsWith`/`contains`, `isEmail`/`isUrl`/`isPhone`/
`isDateTime`, `regex()`, `has`/`hasSome`/`hasEvery`/`isEmpty`.

```zmodel
model Event {
    startDate DateTime
    endDate   DateTime
    tags      String[]
    @@validate(endDate > startDate, "End date must be after start date")
    @@validate(!isEmpty(tags), "At least one tag is required")
}
```

Validation runs before access policies and before the database is touched. For access control see
`zenstack-access-control`. After editing validation rules (or any ZModel — including `procedure`
declarations), run `zen generate` to regenerate the client (it also validates the schema); run
`zen check` if you only want to validate without regenerating.

## Transactions — `$transaction`

**Sequential** — array of operations, executed in order, no cross-access:

```ts
const [a, b] = await db.$transaction([
    db.user.create({ data: { name: 'Alice' } }),
    db.user.create({ data: { name: 'Bob' } }),
]);
```

**Interactive** — callback receiving a transaction client; results feed later steps. Keep it short.

```ts
const post = await db.$transaction(async (tx) => {
    const user = await tx.user.create({ data: { name: 'Alice' } });
    return tx.post.create({ data: { title: 'Hi', authorId: user.id } });
});
```

> ORM call results are lazy promises — they don't run until awaited (directly or inside
> `$transaction`).

## Kysely query builder — `$qb` and `$expr`

Use the full Kysely API (typed from the schema) when the ORM API isn't enough. See
https://kysely.dev for the builder API.

```ts
const rows = await db.$qb
    .selectFrom('User')
    .select(['id', 'name'])
    .where('age', '>', 18)
    .execute();
```

Inject a Kysely expression into an ORM `where` with `$expr` to mix the two:

```ts
await db.post.findMany({
    where: {
        published: true,
        $expr: (eb) => eb('viewCount', '>', 100),
    },
});
```

> The query builder bypasses access policies and ORM-level validation — keep that in mind when a
> policy plugin is installed.

## Custom procedures (v3.2.0+)

Declare typed operations in ZModel, implement them at client construction, call via `$procs`.

```zmodel
procedure getUserFeeds(userId: Int, limit: Int?) : Post[]
mutation procedure signUp(email: String) : User
```

```ts
const db = new ZenStackClient(schema, {
    dialect,
    procedures: {
        getUserFeeds: ({ client, args }) =>
            client.post.findMany({ where: { authorId: args.userId }, take: args.limit }),
        signUp: ({ client, args }) => client.user.create({ data: { email: args.email } }),
    },
});

const user = await db.$procs.signUp({ args: { email: 'alice@example.com' } });
const feeds = await db.$procs.getUserFeeds({ args: { userId: user.id, limit: 20 } });
```

Args are validated against the ZModel types before the callback runs; return values are not — match
them yourself. Throw `ORMError` for failures.

## Raw SQL

`$queryRaw` / `$executeRaw` use tagged templates (parameterized, safe); the `*Unsafe` variants take
plain strings and are injection-prone.

```ts
const users = await db.$queryRaw<{ id: number; email: string }[]>`
    SELECT id, email FROM "User" WHERE role = ${role}`;
const affected = await db.$executeRaw`UPDATE "User" SET name = ${name} WHERE id = ${id}`;
```

Raw SQL bypasses access control; with the policy plugin installed it requires
`dangerouslyAllowRawSql`.

## Logging

Pass a `log` option to `ZenStackClient` — an array of levels, or a function. It's forwarded to the
underlying Kysely instance.

```ts
const db = new ZenStackClient(schema, {
    dialect,
    log: ['query', 'error'],
    // or a function:
    // log: (event) => console.log(`[${event.level}] ${event.queryDurationMillis}ms`),
});
```

## Error handling

All ORM errors are `ORMError`. Inspect `error.reason` (`CONFIG_ERROR`, `INVALID_INPUT`, `NOT_FOUND`,
`REJECTED_BY_POLICY`, `DB_QUERY_ERROR`, `NOT_SUPPORTED`, `INTERNAL_ERROR`); other fields include
`model`, `dbErrorCode`, `dbErrorMessage`, `rejectedByPolicyReason`, and (for `DB_QUERY_ERROR`)
`sql`/`sqlParams`.

```ts
import { ORMError } from '@zenstackhq/orm';

try {
    await userDb.post.create({ data: { title: '' } });
} catch (e) {
    if (e instanceof ORMError && e.reason === 'REJECTED_BY_POLICY') {
        // handle access-denied
    }
}
```

## Reference docs

Full ZenStack documentation for this topic is bundled under [`references/`](references/):

- [client.md](references/client.md) — creating the `ZenStackClient` (SQLite/Postgres/MySQL dialects)
- [orm-overview.md](references/orm-overview.md) — ORM overview
- [api-overview.md](references/api-overview.md) — ORM API overview
- [api-find.md](references/api-find.md) — find operations
- [api-create.md](references/api-create.md) — create / nested writes
- [api-update.md](references/api-update.md) — update / upsert / nested writes
- [api-delete.md](references/api-delete.md) — delete operations
- [api-filter.md](references/api-filter.md) — filter operators
- [api-aggregate.md](references/api-aggregate.md) — aggregate
- [api-count.md](references/api-count.md) — count
- [api-group-by.md](references/api-group-by.md) — groupBy
- [api-transaction.md](references/api-transaction.md) — `$transaction`
- [api-raw-sql.md](references/api-raw-sql.md) — raw SQL
- [query-builder.md](references/query-builder.md) — the Kysely `$qb` escape hatch
- [custom-procedures.md](references/custom-procedures.md) — custom procedures
- [computed-fields.md](references/computed-fields.md) — computed fields at runtime
- [polymorphism.md](references/polymorphism.md) — querying polymorphic models
- [typed-json.md](references/typed-json.md) — strongly-typed JSON fields at runtime
- [validation.md](references/validation.md) — data validation
- [input-validation-reference.md](references/input-validation-reference.md) — validation attribute reference
- [inferred-types.md](references/inferred-types.md) — inferred model/input types
- [logging.md](references/logging.md) — client logging configuration
- [errors.md](references/errors.md) — `ORMError` and error reasons


<!-- END SKILL: zenstack-querying -->

<!-- START SKILL: zenstack-schema-modeling -->

---
name: zenstack-schema-modeling
description: Author ZModel (.zmodel) data schemas for ZenStack V3. Use when defining models, fields, field/model attributes, relations (1-1, 1-many, many-many, self), enums, custom types & mixins, polymorphic models (@@delegate), strongly-typed JSON fields, or computed fields.
---

# ZenStack — Schema Modeling (ZModel)

ZModel is ZenStack's schema language — a superset of Prisma's schema. The schema lives at
`zenstack/schema.zmodel` by default. For access policies/validation use `zenstack-access-control`;
for queries use `zenstack-querying`.

After editing the schema:

```bash
zen check      # only validate the schema for syntax/semantic errors (use --schema <file> for a non-default path)
zen generate   # regenerate the database client — also validates the schema as it compiles
```

Run `zen check` when you just want to confirm the schema is valid; run `zen generate` when you want
to regenerate the client (the normal step after a schema change).

Strings accept both single and double quotes. **Every valid Prisma schema is valid ZModel**, so
existing Prisma knowledge transfers directly — the sections below cover both the basics and the
additions ZModel layers on top.

## Datasource

Exactly one `datasource` block per schema. The ORM runtime doesn't use `url` (the driver carries
the connection); the migration engine does.

```zmodel
datasource db {
    provider = 'postgresql'        // 'postgresql' | 'mysql' | 'sqlite'
    url      = env('DATABASE_URL') // or 'file:./dev.db' for SQLite
}
```

> ZModel has **no `generator` block**. Code generation is driven by `zen generate`; optional behavior
> is configured with `plugin` blocks (e.g. `plugin policy`, `plugin prisma`).

## Models & fields

```zmodel
model User {
    id        Int      @id @default(autoincrement())
    email     String   @unique
    name      String?              // optional
    role      Role     @default(USER)
    tags      String[]             // list
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
}
```

**Scalar types**: `String`, `Boolean`, `Int`, `BigInt`, `Float`, `Decimal`, `DateTime`, `Json`,
`Bytes`, `Unsupported("...")`.

**Modifiers**: `?` optional, `[]` list. A field cannot be both optional *and* a list.

### Field attributes (`@`)

`@id`, `@unique`, `@default(...)`, `@updatedAt`, `@map('col')`, `@relation(...)`, `@db.*` (native
type, e.g. `@db.VarChar(64)`), `@json` (typed-JSON field), `@computed` (virtual field).

### Model attributes (`@@`)

`@@id([a, b])` (composite PK), `@@unique([a, b])`, `@@index([a, b])`, `@@map('table')`,
`@@delegate(field)` (polymorphism), plus `@@allow` / `@@deny` / `@@validate` (see
`zenstack-access-control`).

```zmodel
model City {
    country String
    name    String
    @@id([country, name])     // composite primary key
    @@map('cities')
}
```

A model needs an identifier: a `@id` field, an `@@id([...])`, or — failing those — a `@unique`
field / `@@unique([...])`.

### Default value functions

`autoincrement()`, `now()`, `cuid()`, `uuid()` / `uuid(4)`, `ulid()`, `nanoid()`,
`dbgenerated("...")`, plus literals and enum values.

Since v3.1.0, string ID generators accept a `format` with `%s`:

```zmodel
id String @id @default(uuid(4, "user_%s"))   // -> "user_<uuid>"
```

## Enums

```zmodel
enum Role {
    USER
    ADMIN
}
```

Enum value names are global and must not collide.

## Relations

The **owner** side holds the foreign key (`@relation(fields: [...], references: [...])`).

**One-to-one** — FK is `@unique`; the non-owner side is optional:

```zmodel
model User {
    id      Int      @id
    profile Profile?
}
model Profile {
    id     Int  @id
    user   User @relation(fields: [userId], references: [id])
    userId Int  @unique
}
```

**One-to-many** — list on the non-owner side:

```zmodel
model User {
    id    Int    @id
    posts Post[]
}
model Post {
    id       Int  @id
    author   User @relation(fields: [authorId], references: [id])
    authorId Int
}
```

**Many-to-many (implicit)** — list on both sides; the migration engine creates the join table:

```zmodel
model User { id Int @id  posts Post[] }
model Post { id Int @id  editors User[] }
```

**Many-to-many (explicit)** — model the join table yourself when it needs extra fields:

```zmodel
model UserPost {
    user   User @relation(fields: [userId], references: [id])
    userId Int
    post   Post @relation(fields: [postId], references: [id])
    postId Int
    @@id([userId, postId])
}
```

**Named relations** disambiguate multiple relations between the same two models (give both ends the
same name): `@relation('UserPosts', ...)`.

**Self-relations** use a named relation, e.g. a one-to-many manager/reports tree:

```zmodel
model Employee {
    id           Int        @id
    managerId    Int?
    manager      Employee?  @relation('Mgmt', fields: [managerId], references: [id])
    subordinates Employee[] @relation('Mgmt')
}
```

**Referential actions** on the owner side: `onDelete` / `onUpdate` with `Cascade`, `Restrict`,
`NoAction`, `SetNull`, `SetDefault`.

```zmodel
author User @relation(fields: [authorId], references: [id], onDelete: Cascade)
```

## Custom types & mixins

A `type` declaration is **not** backed by a table. Use it for typed JSON (below) or as a **mixin**
of reusable fields, applied with `with`:

```zmodel
type BaseFields {
    id        String   @id @default(cuid())
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
}

model User with BaseFields {
    email String @unique
}
model Post with BaseFields {
    title String
}
```

Mixin fields are inlined into the model. Multiple mixins are allowed if names don't conflict. This is
ZModel's mechanism for sharing fields across models (use it instead of an abstract base model).

A type may even carry relation fields (v3.6.0+), but then it can only be used as a mixin, not as a
JSON field:

```zmodel
type AuditMixin {
    createdBy   User   @relation('CreatedBy', fields: [createdById], references: [id])
    createdById String
}
model Post with AuditMixin { title String }
```

## Polymorphism — `@@delegate`

Multi-table inheritance: a base model with a discriminator field and `@@delegate`, concrete models
using `extends`. Concrete and base rows share the same id; you create concrete models, never the
base directly.

```zmodel
model Content {
    id        Int      @id @default(autoincrement())
    createdAt DateTime @default(now())
    owner     User     @relation(fields: [ownerId], references: [id])
    ownerId   Int
    type      String   // discriminator
    @@delegate(type)
}

model Post extends Content {
    content String
}
model Image extends Content {
    data Bytes
}
```

Customize the stored discriminator value with `@@delegateMap` (v3.7.1+), which also works with enum
discriminators:

```zmodel
model Video extends Content {
    url String
    @@delegateMap("video")
}
```

## Strongly-typed JSON

Define a `type`, use it as a field type, and mark the field `@json`. The column is plain JSON in the
database, but ZenStack validates writes and returns a typed value.

```zmodel
type Address {
    street  String
    city    String
    zip     Int
}
model User {
    id      Int     @id
    address Address @json
}
```

## Computed fields

Declare a virtual field with `@computed`; implement it with a Kysely expression in the client
config. It can be selected, filtered, sorted, and referenced in policies.

```zmodel
model User {
    id        Int @id
    postCount Int @computed
}
```

```ts
const db = new ZenStackClient(schema, {
    dialect,
    computedFields: {
        User: {
            postCount: (eb) =>
                eb.selectFrom('Post')
                    .whereRef('Post.authorId', '=', 'id')
                    .select(({ fn }) => fn.countAll<number>().as('count')),
        },
    },
});
```

## ZModel additions over Prisma

- No `generator` block (use `zen generate` + `plugin`s).
- `type` declarations + `with` mixins, `@@delegate` polymorphism, `@json` typed JSON, and
  `@computed` fields are ZenStack additions Prisma lacks.
- Single or double quotes are both fine.

## Reference docs

Full ZenStack documentation for this topic is bundled under [`references/`](references/):

- [modeling-overview.md](references/modeling-overview.md) — data modeling concepts
- [datasource.md](references/datasource.md) — the `datasource` block
- [model.md](references/model.md) — models, fields, ids, defaults
- [attribute.md](references/attribute.md) — field & model attributes
- [relation.md](references/relation.md) — 1-1, 1-many, many-many, self relations
- [enum.md](references/enum.md) — enums
- [custom-type.md](references/custom-type.md) — `type` declarations
- [mixin.md](references/mixin.md) — reusable field mixins (`with`)
- [polymorphism.md](references/polymorphism.md) — `@@delegate` polymorphic models
- [typed-json.md](references/typed-json.md) — strongly-typed JSON fields
- [computed-fields.md](references/computed-fields.md) — `@computed` fields
- [zmodel-attribute-reference.md](references/zmodel-attribute-reference.md) — complete attribute reference
- [zmodel-function-reference.md](references/zmodel-function-reference.md) — attribute-function reference


<!-- END SKILL: zenstack-schema-modeling -->
