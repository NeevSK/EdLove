#!/usr/bin/env node
import { getVitalityCard, scanProject } from '@rn-terrain/core';
import { cac } from 'cac';
import chalk from 'chalk';
import { consola } from 'consola';

const cli = cac('rn-eval');

cli
  .command('<package-name>', 'Evaluate a React Native package')
  .option('--breakdown', 'Show detailed score breakdown')
  .option('--full', 'Show full package capabilities card')
  .option('--json', 'Output raw JSON for machine consumption')
  .action(async (packageName, options) => {
    try {
      const card = await getVitalityCard(packageName);

      if (!card) {
        consola.warn(`Package ${chalk.yellow(packageName)} not found in RN Terrain registry.`);
        consola.info('Manual review recommended before installing.');
        return;
      }

      if (options.json) {
        console.log(JSON.stringify(card, null, 2));
        return;
      }

      // Render Layer 0/1: Summary Header
      console.log(`\n${chalk.bold.underline(`${card.display_name} v${card.version.current}`)}`);
      console.log(chalk.dim(`${card.category} · ${card.vendor} · Layer ${card.topology_layer}`));
      console.log('');

      // Verdict Badge
      const scoreColor =
        card.vitality_score >= 80
          ? chalk.green
          : card.vitality_score >= 60
            ? chalk.yellow
            : card.vitality_score >= 40
              ? chalk.yellow
              : chalk.red;

      const verdictSymbol =
        card.radar_status === 'ADOPT'
          ? '✓'
          : card.radar_status === 'TRIAL'
            ? '◎'
            : card.radar_status === 'ASSESS'
              ? '?'
              : '✗';

      console.log(
        scoreColor(
          `  ${verdictSymbol} ${chalk.bold(card.radar_status)}   ${card.vitality_score}/100`,
        ),
      );
      console.log('');

      // Render Warnings
      if (card.warnings.length > 0) {
        console.log(chalk.yellow('⚠️  SIGNALS REQUIRING ATTENTION:'));
        card.warnings.forEach((w) => {
          const prefix =
            w.severity === 'critical' ? chalk.red('  • [CRITICAL] ') : chalk.yellow('  • ');
          console.log(`${prefix}${w.message}`);
        });
        console.log('');
      }

      // Render Layer 2: Score Breakdown (if requested)
      if (options.breakdown || options.full) {
        console.log(chalk.bold('VITALITY BREAKDOWN'));
        console.log(chalk.dim('────────────────────────────────────────'));

        const renderBar = (score: number, max: number) => {
          const filled = Math.round((score / max) * 10);
          return '█'.repeat(filled) + '░'.repeat(10 - filled);
        };

        const bd = card.score_breakdown;
        console.log(
          `  Maintenance Health   ${renderBar(bd.maintenance.score, bd.maintenance.max)}  ${bd.maintenance.score}/${bd.maintenance.max}`,
        );
        console.log(
          `  Architectural Safety ${renderBar(bd.architecture.score, bd.architecture.max)}  ${bd.architecture.score}/${bd.architecture.max}`,
        );
        console.log(
          `  Temporal Stamina     ${renderBar(bd.temporal.score, bd.temporal.max)}  ${bd.temporal.score}/${bd.temporal.max}`,
        );
        console.log(
          `  Ecosystem Position   ${renderBar(bd.ecosystem.score, bd.ecosystem.max)}  ${bd.ecosystem.score}/${bd.ecosystem.max}`,
        );
        console.log(
          `  Cost Factors         ${renderBar(bd.cost.score, bd.cost.max)}  ${bd.cost.score}/${bd.cost.max}`,
        );
        console.log('');
      }

      // Render Capabilities (Layer 3)
      if (options.full && card.capability) {
        console.log(chalk.bold('CAPABILITIES & FIT'));
        console.log(chalk.dim('────────────────────────────────────────'));
        console.log(`  Primary: ${card.capability.primary_purpose}`);
        console.log(`  Capabilities: ${card.capability.key_capabilities.join(', ')}`);
        console.log(`  Limitations: ${card.capability.known_limitations.join(', ')}`);
        console.log('');
      }

      // Render Links
      console.log(chalk.bold('LINKS'));
      console.log(`  npm:    ${chalk.blue(card.links.npm)}`);
      if (card.links.github) console.log(`  github: ${chalk.blue(card.links.github)}`);
      console.log('');
    } catch (error: any) {
      consola.error('Error evaluating package:', error.message);
    }
  });

cli
  .command('scan [package-json]', 'Scan package.json dependencies')
  .action(async (packageJsonPath = './package.json') => {
    try {
      consola.info(`Auditing project dependencies: ${chalk.cyan(packageJsonPath)}`);
      const audit = await scanProject(packageJsonPath);

      console.log(`\n${chalk.bold('PROJECT VITALITY SUMMARY')}`);
      console.log(chalk.dim('────────────────────────────────────────'));
      console.log(`  SOLID ROCK (ADOPT):   ${chalk.green(audit.summary.adopt)}`);
      console.log(`  STABLE TRAIL (TRIAL): ${chalk.yellow(audit.summary.trial)}`);
      console.log(`  ASSESS FIRST:         ${chalk.yellow(audit.summary.assess)}`);
      console.log(`  HOLD (DECAYED):       ${chalk.red(audit.summary.hold)}`);
      console.log(`  UNVETTED/UNKNOWN:     ${chalk.dim(audit.summary.unknown)}`);
      console.log('');

      if (audit.critical_warnings.length > 0) {
        consola.warn(
          `${chalk.red(audit.critical_warnings.length)} critical warnings found during scan.`,
        );
      } else {
        consola.success('Scan complete. No critical compatibility warnings.');
      }
      console.log('');
    } catch (e: any) {
      consola.error('Failed to audit project:', e.message);
    }
  });

cli
  .command(
    'v1-check [package-json]',
    'Evaluate React Native 1.0 readiness for project dependencies',
  )
  .action(async (packageJsonPath = './package.json') => {
    try {
      consola.info(
        `Auditing project for React Native 1.0 compatibility: ${chalk.cyan(packageJsonPath)}`,
      );
      const audit = await scanProject(packageJsonPath);

      console.log(`\n${chalk.bold('REACT NATIVE 1.0 COMPATIBILITY REPORT')}`);
      console.log(chalk.dim('────────────────────────────────────────'));

      for (const card of audit.packages) {
        const v1 = card.v1_readiness;
        let statusColor = chalk.gray;
        if (v1.status === 'READY') statusColor = chalk.green;
        else if (v1.status === 'ADAPTING') statusColor = chalk.yellow;
        else if (v1.status === 'AT_RISK') statusColor = chalk.yellow;
        else if (v1.status === 'INCOMPATIBLE') statusColor = chalk.red;

        console.log(`  ${chalk.bold(card.package_name)}`);
        console.log(`    Status:     ${statusColor(v1.status)} (Score: ${v1.score}/100)`);
        console.log(`    New Arch:   ${card.compatibility.new_architecture}`);
        if (v1.migration_notes) {
          console.log(`    Notes:      ${chalk.dim(v1.migration_notes)}`);
        }
        console.log('');
      }

      console.log(chalk.dim('────────────────────────────────────────'));
      console.log(`  V1.0 Ready:   ${chalk.green(audit.v1_ready_count)}`);
      console.log(`  At Risk:      ${chalk.yellow(audit.v1_at_risk_count)}`);
      console.log('');

      if (audit.v1_at_risk_count > 0) {
        consola.warn(
          `${chalk.yellow(audit.v1_at_risk_count)} packages are at risk or incompatible with RN 1.0.`,
        );
      } else {
        consola.success('All checked dependencies are compatible with React Native 1.0!');
      }
      console.log('');
    } catch (e: any) {
      consola.error('Failed to run V1.0 compatibility check:', e.message);
    }
  });

cli.help();

cli.parse();
