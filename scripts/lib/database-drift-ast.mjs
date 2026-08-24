import fs from 'node:fs';

import { loadDocument } from '@zenstackhq/language';
import { isDataField, isDataModel, isDataModelAttribute, isEnum, isTypeDef } from '@zenstackhq/language/ast';

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export async function parseZModelAst(schemaFile) {
  const result = await loadDocument(schemaFile, [], true, true);
  if (!result.success) {
    return {
      success: false,
      errors: result.errors,
      warnings: result.warnings,
    };
  }

  const model = result.model;
  const models = {};

  for (const decl of model.declarations) {
    if (!isDataModel(decl) && !isTypeDef(decl) && !isEnum(decl)) continue;

    const tableName = getTableName(decl);
    if (!tableName) continue;

    const fields = {};
    if (isDataModel(decl)) {
      for (const field of decl.fields) {
        if (!isDataField(field)) continue;
        if (isRelationField(field)) continue;
        const mapAttr = field.attributes?.find(
          (attr) => attr.decl?.$refText === '@map',
        );
        const mappedName = mapAttr?.args?.[0]?.value?.value;
        const typeName = String(field.type?.type ?? field.type?.$refText ?? 'Unknown');
        fields[field.name] = {
          dbName: typeof mappedName === 'string' ? mappedName : field.name,
          type: typeName,
          isArray: Boolean(field.type?.array),
          isOptional: Boolean(field.type?.optional),
        };
      }
    }

    models[tableName] = {
      name: decl.name,
      fields,
    };
  }

  return {
    success: true,
    warnings: result.warnings,
    model,
    models,
  };
}

export function getTableName(decl) {
  const mapAttr = decl.attributes?.find((attr) => isDataModelAttribute(attr) && attr.decl?.$refText === '@@map');
  if (!mapAttr) return decl.name;
  const firstArg = mapAttr.args?.[0];
  const literal = firstArg?.value;
  if (literal?.$type === 'StringLiteral') {
    return literal.value;
  }
  return decl.name;
}

export function isRelationField(field) {
  const fieldType = field.type;
  if (!fieldType || fieldType.$type !== 'DataFieldType') return false;
  if (fieldType.reference) return true;
  const typeName = String(fieldType.type ?? '');
  return Boolean(typeName && /^[A-Z]/.test(typeName) && !['String', 'Boolean', 'Int', 'BigInt', 'Float', 'Decimal', 'DateTime', 'Json', 'Bytes'].includes(typeName));
}

export function loadDbSnapshot(dbColumnsRows, dbPoliciesRows, dbTablesRows, ignorePatterns = []) {
  const dbSchema = {};
  for (const row of dbColumnsRows) {
    if (!dbSchema[row.table_name]) dbSchema[row.table_name] = {};
    dbSchema[row.table_name][row.column_name] = {
      type: row.data_type,
      isNullable: row.is_nullable === 'YES',
    };
  }

  const dbPolicies = {};
  for (const row of dbPoliciesRows) {
    if (!dbPolicies[row.tablename]) dbPolicies[row.tablename] = [];
    dbPolicies[row.tablename].push(row);
  }

  const ignoredTables = [];
  const shouldIgnoreTable = (tableName) => ignorePatterns.some((entry) => entry.regex.test(tableName));

  return {
    dbSchema,
    dbPolicies,
    dbTablesRows,
    ignoredTables,
    shouldIgnoreTable,
  };
}

export function loadIgnorePatterns(ignorePath) {
  if (!fs.existsSync(ignorePath)) return [];
  const patterns = [];

  for (const rawLine of fs.readFileSync(ignorePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const regexStr = '^' + line
      .replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&')
      .replace(/\*/g, '.*') + '$';
    patterns.push({ raw: line, regex: new RegExp(regexStr) });
  }

  return patterns;
}

export function loadStructuredIgnoreManifest(manifestPath) {
  if (!fs.existsSync(manifestPath)) {
    return { entries: [], warnings: [`Missing ignore manifest at ${manifestPath}`] };
  }

  const manifest = readJson(manifestPath);
  const entries = Array.isArray(manifest.entries) ? manifest.entries : [];
  const warnings = [];
  const compiled = entries.map((entry) => {
    const issues = [];
    if (!entry.table) issues.push('missing table');
    if (!entry.reason) issues.push('missing reason');
    if (!entry.owner) issues.push('missing owner');
    if (!entry.reviewedAt) issues.push('missing reviewedAt');
    if (!entry.reviewer) issues.push('missing reviewer');
    if (!entry.mode) issues.push('missing mode');
    if (entry.mode && !['exact', 'glob'].includes(entry.mode)) issues.push(`invalid mode: ${entry.mode}`);
    if (entry.mode === 'glob' && /(^\*|.*\*$)/.test(String(entry.table || ''))) {
      warnings.push(`Broad glob ignore pattern: ${entry.table}`);
    }
    if (issues.length > 0) {
      warnings.push(`Ignore entry ${entry.table || '<unknown>'}: ${issues.join(', ')}`);
    }

    const regex = entry.mode === 'glob'
      ? new RegExp('^' + String(entry.table || '').replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&').replace(/\*/g, '.*') + '$')
      : new RegExp('^' + String(entry.table || '').replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&') + '$');

    return { ...entry, regex };
  });

  return { entries: compiled, warnings };
}

export function classifyDrift(models, dbSchema, dbTablesRows, dbPolicies, ignorePatterns = []) {
  const structuralDrifts = [];
  const policyDrifts = [];
  const perTable = [];
  const ignoredTables = [];

  const stats = {
    TABLE_MISSING: 0,
    EXTRA_TABLE_IN_DB: 0,
    EXTRA_VIEW_IN_DB: 0,
    COLUMN_MISSING_IN_DB: 0,
    EXTRA_COLUMN_IN_DB: 0,
    NULLABILITY_MISMATCH: 0,
    RLS_LOCKOUT: 0,
  };

  let totalChecks = 0;
  let passedChecks = 0;

  const shouldIgnoreTable = (tableName) => ignorePatterns.some((entry) => entry.regex.test(tableName));

  for (const [tableName, zmodel] of Object.entries(models)) {
    const dbTable = dbSchema[tableName];
    const tableRow = dbTablesRows.find((row) => (row.tablename ?? row.object_name) === tableName);
    const policyCount = (dbPolicies[tableName] || []).length;
    const rlsEnabled = Boolean(tableRow?.rowsecurity);

    const tableInfo = { table: tableName, model: zmodel.name, issues: [] };
    totalChecks += 1;

    if (!dbTable) {
      structuralDrifts.push({
        table: tableName,
        type: 'TABLE_MISSING',
        severity: 'high',
        confidence: 'high',
        message: `Table "${tableName}" exists in ZModel but not in the remote database.`,
      });
      stats.TABLE_MISSING += 1;
      tableInfo.issues.push('missing_table');
      perTable.push(tableInfo);
      continue;
    }
    passedChecks += 1;

    for (const [fieldName, field] of Object.entries(zmodel.fields)) {
      totalChecks += 1;
      const dbName = field.dbName ?? fieldName;
      const dbField = dbTable[dbName];
      if (!dbField) {
        structuralDrifts.push({
          table: tableName,
          type: 'COLUMN_MISSING_IN_DB',
          severity: 'high',
          confidence: 'high',
          message: `Column "${dbName}" (ZModel field "${fieldName}") is declared in ZModel but missing in "${tableName}".`,
        });
        stats.COLUMN_MISSING_IN_DB += 1;
        tableInfo.issues.push(`missing_column:${dbName}`);
        continue;
      }
      passedChecks += 1;

      totalChecks += 1;
      if (field.isOptional !== dbField.isNullable) {
        structuralDrifts.push({
          table: tableName,
          type: 'NULLABILITY_MISMATCH',
          severity: 'medium',
          confidence: 'high',
          message: `Column "${dbName}" (ZModel field "${fieldName}") on "${tableName}" differs in nullability: ZModel optional=${field.isOptional}, DB nullable=${dbField.isNullable}.`,
        });
        stats.NULLABILITY_MISMATCH += 1;
        tableInfo.issues.push(`nullability:${dbName}`);
        continue;
      }
      passedChecks += 1;
    }

    for (const columnName of Object.keys(dbTable)) {
      totalChecks += 1;
      const modeledField = Object.values(zmodel.fields).find(
        (field) => (field.dbName ?? '') === columnName,
      );
      if (!zmodel.fields[columnName] && !modeledField) {
        structuralDrifts.push({
          table: tableName,
          type: 'EXTRA_COLUMN_IN_DB',
          severity: 'medium',
          confidence: 'high',
          message: `Column "${columnName}" exists in the remote DB but is not modeled in ZModel for "${tableName}".`,
        });
        stats.EXTRA_COLUMN_IN_DB += 1;
        tableInfo.issues.push(`extra_column:${columnName}`);
        continue;
      }
      passedChecks += 1;
    }

    totalChecks += 1;
    if (rlsEnabled && policyCount === 0) {
      policyDrifts.push({
        table: tableName,
        type: 'RLS_LOCKOUT',
        severity: 'critical',
        confidence: 'high',
        message: `RLS is enabled on "${tableName}" but there are no policies.`,
      });
      stats.RLS_LOCKOUT += 1;
      tableInfo.issues.push('rls_lockout');
    } else {
      passedChecks += 1;
    }

    perTable.push(tableInfo);
  }

  for (const tableName of Object.keys(dbSchema)) {
    if (models[tableName]) continue;
    if (shouldIgnoreTable(tableName)) {
      ignoredTables.push(tableName);
      continue;
    }
    totalChecks += 1;
    const relationRow = dbTablesRows.find((row) => (row.tablename ?? row.object_name) === tableName);
    const relationKind = relationRow?.relkind;
    const isView = relationKind === 'v' || relationKind === 'm';
    structuralDrifts.push({
      table: tableName,
      type: isView ? 'EXTRA_VIEW_IN_DB' : 'EXTRA_TABLE_IN_DB',
      severity: isView ? 'low' : 'critical',
      confidence: 'high',
      message: isView
        ? `View "${tableName}" exists in the remote database but is not modeled in ZModel.`
        : `Table "${tableName}" exists in the remote database but is not modeled in ZModel.`,
    });
    stats[isView ? 'EXTRA_VIEW_IN_DB' : 'EXTRA_TABLE_IN_DB'] += 1;
  }

  const score = totalChecks === 0 ? 100 : Math.max(0, Math.round((passedChecks / totalChecks) * 100));

  return {
    score,
    totalChecks,
    passedChecks,
    stats,
    structuralDrifts,
    policyDrifts,
    perTable,
    ignoredTables,
  };
}

export function renderDriftReport({
  today,
  score,
  counts,
  stats,
  structuralDrifts,
  policyDrifts,
  snapshotPath,
  summaryPath,
  ignoreManifestPath,
  ignoreWarnings = [],
}) {
  const structuralSection = structuralDrifts.length
    ? structuralDrifts
        .map((item) => `* **[${item.type}]** [${item.table}] severity=${item.severity}, confidence=${item.confidence}: ${item.message}`)
        .join('\n')
    : '*No structural drift detected in the audited scope.*';

  const policySection = policyDrifts.length
    ? policyDrifts
        .map((item) => `* **[${item.type}]** [${item.table}] severity=${item.severity}, confidence=${item.confidence}: ${item.message}`)
        .join('\n')
    : '*No policy drift detected in the audited scope.*';

  let warningsSection = '';
  if (ignoreWarnings && ignoreWarnings.length > 0) {
    warningsSection = `\n## Ignore Manifest Warnings\n\n${ignoreWarnings.map((w) => `* ⚠️ ${w}`).join('\n')}\n`;
  }

  return `---
title: "Database and ZenStack Drift Scorecard"
status: "active"
created: ${today}
updated: ${today}
author: "Sovereign Audit System"
scribe: "Antigravity"
tags: [architecture, database, score, audit]
---

# Database and ZenStack Drift Scorecard

## Provenance

- ZModel source: \`packages/schema/schema.zmodel\`
- DB source: linked Supabase via CLI
- Ignore source: \`.driftignore.ast.json\`

## Confidence Model

- Structural checks: high confidence
- RLS presence check: high confidence
- Policy equivalence: partial confidence unless manually reviewed
- Ignore decisions: require explicit governance

## Summary

| Metric | Value |
| :--- | ---: |
| Score | ${score}/100 |
| ZModel tables | ${counts.zmodelTables} |
| DB tables | ${counts.dbTables} |
| Ignored DB tables | ${counts.ignoredTables} |
| Total checks | ${counts.totalChecks} |
| Passed checks | ${counts.passedChecks} |
| Structural drifts | ${structuralDrifts.length} |
| Policy drifts | ${policyDrifts.length} |

## Drift Counts

| Category | Count |
| :--- | :---: |
| TABLE_MISSING | ${stats.TABLE_MISSING} |
| EXTRA_TABLE_IN_DB | ${stats.EXTRA_TABLE_IN_DB} |
| EXTRA_VIEW_IN_DB | ${stats.EXTRA_VIEW_IN_DB ?? 0} |
| COLUMN_MISSING_IN_DB | ${stats.COLUMN_MISSING_IN_DB} |
| EXTRA_COLUMN_IN_DB | ${stats.EXTRA_COLUMN_IN_DB} |
| NULLABILITY_MISMATCH | ${stats.NULLABILITY_MISMATCH} |
| RLS_LOCKOUT | ${stats.RLS_LOCKOUT} |
${warningsSection}
## Structural Drift

${structuralSection}

## Policy Drift

${policySection}

## Snapshot Files

- Snapshot JSON: \`${snapshotPath}\`
- Summary JSON: \`${summaryPath}\`
- Ignore manifest: \`${ignoreManifestPath}\`
`;
}
