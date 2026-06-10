import { getVitalityCard } from '@rn-terrain/core';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('RN Terrain extension is active');

  // Register hover provider for package.json files
  const hoverProvider = vscode.languages.registerHoverProvider(
    { pattern: '**/package.json' },
    {
      async provideHover(document: vscode.TextDocument, position: vscode.Position) {
        const lineText = document.lineAt(position.line).text;

        // Match standard dependency declaration: "package-name": "version-range"
        const match = lineText.match(/"([^"]+)"\s*:\s*"([^"]+)"/);
        if (!match) {
          return null;
        }

        const packageName = match[1];
        if (!packageName) {
          return null;
        }

        // Query our core registry
        const card = await getVitalityCard(packageName);
        if (!card) {
          return null;
        }

        // Render hover tooltip markdown
        const md = new vscode.MarkdownString();
        md.isTrusted = true;

        const scoreColor =
          card.vitality_score >= 80
            ? '🟢'
            : card.vitality_score >= 60
              ? '🟡'
              : card.vitality_score >= 40
                ? '🟠'
                : '🔴';

        md.appendMarkdown(
          `### 🏔️ RN Terrain: **${card.display_name || card.package_name}** v${card.version.current}\n`,
        );
        md.appendMarkdown(`*${card.category} · ${card.vendor} · Layer ${card.topology_layer}*\n\n`);

        md.appendMarkdown(
          `#### ${scoreColor} Vitality Score: **${card.vitality_score}/100** (${card.radar_status})\n`,
        );

        // Warnings
        if (card.warnings.length > 0) {
          md.appendMarkdown(`**⚠️  Signals Requiring Attention:**\n`);
          for (const w of card.warnings) {
            md.appendMarkdown(`- *${w.message}*\n`);
          }
          md.appendMarkdown('\n');
        }

        // Platforms & New Arch
        md.appendMarkdown(`| iOS | Android | Web | Expo Go | New Arch |\n`);
        md.appendMarkdown(`| :---: | :---: | :---: | :---: | :---: |\n`);

        const check = (val: boolean) => (val ? '✅' : '❌');
        md.appendMarkdown(
          `| ${check(card.compatibility.ios)} | ${check(card.compatibility.android)} | ${check(card.compatibility.web)} | ${check(card.compatibility.expo_go)} | \`${card.compatibility.new_architecture}\` |\n\n`,
        );

        // V1 Readiness
        const v1StatusSymbol = card.v1_readiness.status === 'READY' ? '🟢' : '🟡';
        md.appendMarkdown(
          `#### ${v1StatusSymbol} RN 1.0 Readiness: **${card.v1_readiness.status}**\n`,
        );
        if (card.v1_readiness.migration_notes) {
          md.appendMarkdown(`*Notes: ${card.v1_readiness.migration_notes}*\n\n`);
        }

        // Links
        md.appendMarkdown(`[NPM](${card.links.npm})`);
        if (card.links.github) {
          md.appendMarkdown(` · [GitHub](${card.links.github})`);
        }
        md.appendMarkdown('\n');

        return new vscode.Hover(md);
      },
    },
  );

  context.subscriptions.push(hoverProvider);
}

export function deactivate() {}
