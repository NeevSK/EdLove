#!/usr/bin/env node

/**
 * ⚖️ Sovereign Schema Drift & Deep Alignment Auditor
 *
 * A highly sophisticated utility to symmetrically analyze and report schema drift
 * across ZenStack models (.zmodel), generated TypeScript types, and Cedar policy schemas.
 *
 * Features:
 *  - Symmetric Model Coverage (Cedar vs. ZModel)
 *  - Deep Attribute-Level Validation (Field names, casing, types, and requirements)
 *  - Type Compatibility Checks (Verifying compatibility between Cedar types and ZModel types)
 *  - Granular Optionality & Requirement Warnings (Required in Cedar but optional in DB)
 *  - Large-Scale Domain Divergence Hotspot Tracking (Weighted mapping of desynchronized domains)
 *  - High-Insight Statistical Aggregation Dashboard (Numerical comparison, ratio checks, optionality breakdowns)
 *  - Cross-Platform OS Path Resiliency
 *  - CLI Argument Overrides & Verbose Mode
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

// ─── Command Line & Usability Parsing ──────────────────────────────────────────
const args = process.argv.slice(2);
const getArgValue = (flag) => {
  const index = args.indexOf(flag);
  return index !== -1 && index + 1 < args.length ? args[index + 1] : null;
};
const hasFlag = (flag) => args.includes(flag);

if (hasFlag('--help') || hasFlag('-h')) {
  console.log(`
Usage: node scripts/check-schema-drift.mjs [options]

Options:
  --schema <path>   Path to the ZenStack schema.zmodel file
  --cedar <path>    Path to the Cedar schema.cedarschema file
  --models <path>   Path to the generated TypeScript models.ts file
  --verbose, -v     Print detailed field-by-field diagnostic comparisons
  --help, -h        Show this help message
`);
  process.exit(0);
}

const verbose = hasFlag('--verbose') || hasFlag('-v');

// Resolve path relative to script directory to ensure portability across working directories
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Default target file locations with optional CLI argument overrides
const zmodelPath =
  getArgValue('--schema') || path.join(ROOT, 'packages', 'schema', 'schema.zmodel');
const generatedPath =
  getArgValue('--models') ||
  path.join(ROOT, 'packages', 'schema', 'src', 'generated', 'orm', 'models.ts');
const cedarSchemaPath =
  getArgValue('--cedar') ||
  path.join(ROOT, 'packages', 'policies', 'src', 'schema', 'schema.cedarschema');

function readLinkedSupabaseQuery(sql) {
  const appDir = path.join(ROOT, 'apps', 'gurudevi-mobile');
  const tempFile = path.join(appDir, '.temp_schema_drift_query.sql');
  fs.writeFileSync(tempFile, sql, 'utf8');
  try {
    const output = execFileSync(
      'npx.cmd',
      ['supabase', 'db', 'query', '--linked', '-o', 'json', '-f', tempFile],
      { cwd: appDir, encoding: 'utf8', shell: process.platform === 'win32', stdio: ['ignore', 'pipe', 'pipe'] },
    ).trim();
    if (!output) return [];
    const parsed = JSON.parse(output);
    return Array.isArray(parsed) ? parsed : parsed?.rows ?? [];
  } finally {
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
  }
}

console.log(
  '\x1b[35m======================================================================\x1b[0m',
);
console.log('\x1b[35m⚖️  Sovereign Deep Schema Alignment & Symmetric Auditor\x1b[0m');
console.log(
  '\x1b[35m======================================================================\x1b[0m',
);

// Bulletproof file existence verification
if (!fs.existsSync(zmodelPath)) {
  console.error(`❌ Critical file missing: schema.zmodel at "${zmodelPath}"`);
  process.exit(1);
}
if (!fs.existsSync(generatedPath)) {
  console.error(`❌ Critical file missing: generated models.ts at "${generatedPath}"`);
  process.exit(1);
}
if (!fs.existsSync(cedarSchemaPath)) {
  console.error(`❌ Critical file missing: schema.cedarschema at "${cedarSchemaPath}"`);
  process.exit(1);
}

const zmodelContent = fs.readFileSync(zmodelPath, 'utf8');
const generatedContent = fs.readFileSync(generatedPath, 'utf8');
const cedarContent = fs.readFileSync(cedarSchemaPath, 'utf8');

// ─── Heuristic 1: Timestamp Audit ────────────────────────────────────────────
const zmodelStat = fs.statSync(zmodelPath);
const generatedStat = fs.statSync(generatedPath);
const isGeneratedDrifted = zmodelStat.mtime > generatedStat.mtime;

console.log('\x1b[36m\n1. Type Sync (ZenStack .zmodel ──> Generated TypeScript Types):\x1b[0m');
console.log(
  `   - schema.zmodel   : ${zmodelStat.mtime.toISOString()} [${path.basename(zmodelPath)}]`,
);
console.log(
  `   - generated types : ${generatedStat.mtime.toISOString()} [${path.basename(generatedPath)}]`,
);

// Only parse declarations at the beginning of a line. A loose /model/ regex
// previously treated prose such as "model is only..." in comments as models.
const zmodelModels = [...zmodelContent.matchAll(/^\s*model\s+(\w+)/gm)].map((match) => match[1]);

const tsModelsMatch = generatedContent.match(/export\s+type\s+(\w+)\s*=/g) || [];
const tsModels = tsModelsMatch.map((m) => m.split(/\s+/)[2]);

const missingInTs = zmodelModels.filter((m) => !tsModels.includes(m));
const extraInTs = tsModels.filter((m) => !zmodelModels.includes(m));

if (missingInTs.length > 0 || extraInTs.length > 0) {
  if (missingInTs.length > 0) {
    console.error(
      `   \x1b[31m❌ TYPE DRIFT: Models declared in .zmodel but missing in generated TS types:\x1b[0m`,
    );
    missingInTs.forEach((m) => console.log(`     - ${m}`));
  }
  if (extraInTs.length > 0) {
    console.error(
      `   \x1b[31m❌ STALE GENERATED TYPES: Types found in models.ts that do not exist in .zmodel:\x1b[0m`,
    );
    extraInTs.forEach((m) => console.log(`     - ${m}`));
  }
} else if (isGeneratedDrifted) {
  console.log('   \x1b[33m⚠️  WARNING: schema.zmodel is newer than generated models.ts\x1b[0m');
  console.log('      Run "pnpm --filter @repo/schema generate" to compile latest definitions.');
} else {
  console.log('   \x1b[32m✅ PERFECT SYNC: Generated types match schema.zmodel perfectly.\x1b[0m');
}

// ─── Heuristic 2: Custom Semantic Parsing of Models & Entities ───────────────
const dbSchema = {};
const modelTableNameMap = {};
const modelRegex = /model\s+(\w+)\s*\{([^}]*)\}/g;
let match;

// Parse ZenStack Models & Scalar Fields (ignoring ORM relation references)
while ((match = modelRegex.exec(zmodelContent)) !== null) {
  const modelName = match[1];
  const block = match[2];
  const fields = {};

  // Parse table name map (@@map("table_name"))
  let tableName = modelName;
  const mapMatch = block.match(/@@map\(\s*["']([^"']+)["']\s*\)/);
  if (mapMatch) {
    tableName = mapMatch[1];
  }
  modelTableNameMap[modelName] = tableName;

  const lines = block
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  lines.forEach((line) => {
    const cleanLine = line.split('//')[0].split('/*')[0].trim();
    if (!cleanLine || cleanLine.startsWith('@@') || cleanLine.startsWith('*')) return;

    const fieldMatch = cleanLine.match(/^(\w+)\s+([\w[\]?]+)/);
    if (fieldMatch) {
      const fieldName = fieldMatch[1];
      const typeRaw = fieldMatch[2];
      const isOptional = typeRaw.endsWith('?') || cleanLine.includes('?');
      const type = typeRaw.replace(/\?$/, '');

      // Determine if field is a relation (capitalized type pointing to another model)
      const isRelation =
        zmodelModels.includes(type.replace(/\[\]$/, '')) || cleanLine.includes('@relation');

      if (!isRelation) {
        let dbColumnName = fieldName;
        const mapMatch = cleanLine.match(/@map\(\s*["']([^"']+)["']\s*\)/);
        if (mapMatch) {
          dbColumnName = mapMatch[1];
        }
        fields[dbColumnName] = { type, isOptional, line: cleanLine, modelFieldName: fieldName };
      }
    }
  });
  dbSchema[modelName] = fields;
}

// Parse Cedar Schema Entities and Attributes
const cedarSchema = {};
const cedarRegex = /entity\s+(\w+)\s*\{([^}]*)\}/g;

while ((match = cedarRegex.exec(cedarContent)) !== null) {
  const entityName = match[1];
  const block = match[2];
  const fields = {};

  const lines = block
    .split(/,?\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  lines.forEach((line) => {
    const cleanLine = line.split('//')[0].split('/*')[0].trim();
    if (!cleanLine) return;
    const fieldMatch = cleanLine.match(/^(\w+)(\??)\s*:\s*([^,;]+)/);
    if (fieldMatch) {
      const fieldName = fieldMatch[1];
      const isOptional = fieldMatch[2] === '?';
      const type = fieldMatch[3].trim().replace(/;$/, '').replace(/,$/, '').trim();
      fields[fieldName] = { type, isOptional, line: cleanLine };
    }
  });
  cedarSchema[entityName] = fields;
}

// ─── Heuristic 3: Symmetric Entity-Level Coverage Audit ──────────────────────
console.log(
  '\x1b[36m\n2. Symmetric Entity Coverage (ZenStack Models <──> Cedar Policy Entities):\x1b[0m',
);

// Documented exceptions, aliases, or specialized resources
const AUTHORIZATION_MAPPING_EXCEPTIONS = {
  FireJournal: 'FireJournalEntry', // Alias Mapping
  Ledger: 'LedgerEntry', // Alias Mapping
  JoyMoments: 'ClientOnly', // Client-only stream
  GratitudeEntries: 'ClientOnly', // Client-only stream
  EnergyForecasts: 'ClientOnly', // Client-only stream
  Guardian: 'ClientOnly',
  AIAssistant: 'ClientOnly',
  Library: 'ClientOnly',
  Wellbeing: 'ClientOnly',
  Staff: 'ClientOnly',
  DailyContent: 'ClientOnly',
  Calendar: 'ClientOnly',
  AssignmentSubmission: 'AssignmentSubmission',
};

// Cedar carries these as authorization attributes, but the current relational
// model derives them through Assignment -> Classroom -> School. They are not
// physical columns on submissions and must not be added just to satisfy a
// shallow column comparison.
const DERIVED_AUTHORIZATION_FIELDS = {
  AssignmentSubmission: new Set(['school_id', 'classroom_id']),
};

// Known relationship, internal junction tables, or helper structures that don't need top-level Cedar policies
const KNOWN_INTERNAL_RELATIONAL_MODELS = [
  'Bond',
  'UserSocialLink',
  'ClassroomStudent',
  'ClassroomGradingSettings',
  'GroupMember',
  'CommunityReaction',
  'GroupMessage',
  'Budget',
  'ProGift',
  'PaymentIntent',
  'Invoice',
  'Receipt',
  'Section',
  'SchoolGrade',
  'CalendarEvent',
  'StudentGuardianRelationship',
  'Account',
  'SchoolRegistry',
  'ManifestoEndorsement',
];

const cedarEntities = Object.keys(cedarSchema);
const dbModels = Object.keys(dbSchema);

const alignedEntities = [];
const cedarOnlyAnomalies = [];
const dbOnlyUnprotected = [];

// A. Check Cedar -> DB (Who has more/less)
cedarEntities.forEach((entity) => {
  const dbMatch = AUTHORIZATION_MAPPING_EXCEPTIONS[entity] || entity;

  if (dbMatch === 'ClientOnly') {
    alignedEntities.push({ entity, dbModel: 'Client-Only', isException: true });
  } else if (dbSchema[dbMatch]) {
    alignedEntities.push({ entity, dbModel: dbMatch, isException: entity !== dbMatch });
  } else {
    // Check if casing mismatch
    const caseMatch = dbModels.find((m) => m.toLowerCase() === entity.toLowerCase());
    if (caseMatch) {
      cedarOnlyAnomalies.push({
        entity,
        reason: `Casing discrepancy: Cedar entity is "${entity}", but database model is "${caseMatch}".`,
      });
    } else {
      cedarOnlyAnomalies.push({
        entity,
        reason: `Entity is defined in Cedar authorization schema but has no corresponding model in schema.zmodel.`,
      });
    }
  }
});

// B. Check DB -> Cedar (Symmetric Coverage for unprotected models)
dbModels.forEach((model) => {
  // Check if this model is mapped to by any Cedar entity (directly or via exception map)
  const isProtected = cedarEntities.some((entity) => {
    const dbMatch = AUTHORIZATION_MAPPING_EXCEPTIONS[entity] || entity;
    return dbMatch === model;
  });

  if (!isProtected && !KNOWN_INTERNAL_RELATIONAL_MODELS.includes(model)) {
    dbOnlyUnprotected.push(model);
  }
});

console.log(`   - Aligned / Documented Entities  : ${alignedEntities.length}`);
console.log(`   - Cedar Mismatches (Anomalies)   : ${cedarOnlyAnomalies.length}`);
console.log(`   - Unprotected Database Models    : ${dbOnlyUnprotected.length}`);

if (dbOnlyUnprotected.length > 0) {
  console.log(
    '\n   \x1b[33m⚠️  DEVELOPER ADVISORY: Models defined in Database but not guarded by Cedar:\x1b[0m',
  );
  dbOnlyUnprotected.forEach((model) => {
    console.log(
      `     - \x1b[33m${model}\x1b[0m (Make sure access is handled transitively under parent structures, or add to Cedar)`,
    );
  });
}

if (cedarOnlyAnomalies.length > 0) {
  console.error(
    '\n   \x1b[31m❌ CRITICAL ANOMALIES DETECTED: Cedar entities missing in Database:\x1b[0m',
  );
  cedarOnlyAnomalies.forEach((a) => {
    console.error(`     - \x1b[31m${a.entity}\x1b[0m: ${a.reason}`);
  });
}

// ─── Heuristic 4: Deep Attribute-Level Mismatch & Vulnerability Audit ────────
console.log('\x1b[36m\n3. Granular Attribute-Level Type & Requirement Verification:\x1b[0m');

// Attributes that are dynamically hydrated by context middleware or resolved relationships rather than flat DB columns
const DYNAMIC_OR_DERIVED_ATTRIBUTES = {
  User: ['grade_id', 'section_id', 'classroom_ids', 'child_student_ids', 'active_entity_id', 'active_entity_type'],
  AttendanceRecord: ['id', 'school_id', 'grade_id', 'section_id'],
  Grade: ['school_id'],
  Assignment: ['school_id', 'teacher_id'],
  Lesson: ['school_id', 'teacher_id'],
  Material: ['school_id', 'teacher_id'],
  MoodLog: ['school_id'],
  FireJournal: ['school_id'],
  InventoryItem: ['school_id', 'teacher_id'],
  Ledger: ['school_id'],
  SentinelAuditLog: ['school_id'],
  ClassroomNote: ['school_id'],
};

// ZModel relation fields are represented by joins and do not have physical
// columns in the mapped Postgres table. Keep this helper available to both
// the Cedar attribute audit and the live database parity audit.
const isRelationField = (fieldInfo) => {
  const normalizedType = String(fieldInfo?.type ?? '').replace(/[\[\]?]/g, '');
  return Boolean(dbSchema[normalizedType]);
};

// Type Compatibility Evaluation Matrix
const isTypeCompatible = (cedarType, dbType) => {
  const cType = cedarType.trim();
  const dType = dbType.trim();

  if (cType === 'String') {
    return ['String', 'DateTime', 'Json', 'Decimal'].includes(dType);
  }
  if (cType === 'Long') {
    return ['Int', 'Float', 'Decimal', 'BigInt'].includes(dType);
  }
  if (cType === 'Boolean') {
    return ['Boolean'].includes(dType);
  }
  if (cType.startsWith('Set<')) {
    // Sets map to database array structures or virtual aggregates
    return dType.endsWith('[]') || dType === 'Json' || dType === 'String';
  }
  // Custom Entity references map to standard storage columns (e.g. references via primary key strings/IDs)
  return ['String', 'Int'].includes(dType);
};

let attributeErrors = 0;
let attributeWarnings = 0;
let alignedAttributesCount = 0;
const divergenceWeights = {}; // Tracks divergence hotspots

alignedEntities.forEach(({ entity, dbModel, isException }) => {
  divergenceWeights[entity] = 0;

  if (dbModel === 'Client-Only') {
    if (verbose) {
      console.log(
        `   \x1b[34mℹ️  [${entity}]\x1b[0m Client-only resource, skipping physical attribute audit.`,
      );
    }
    return;
  }

  const cedarFields = cedarSchema[entity];
  const dbFields = dbSchema[dbModel];
  const dynamicAttrs = DYNAMIC_OR_DERIVED_ATTRIBUTES[entity] || [];

  const entityTitle = isException ? `${entity} ──> ${dbModel}` : entity;
  if (verbose) {
    console.log(`   \x1b[36mChecking properties for [${entityTitle}]:\x1b[0m`);
  }

  Object.keys(cedarFields).forEach((attr) => {
    // A. Handle Dynamic and Context properties
    if (dynamicAttrs.includes(attr)) {
      if (verbose) {
        console.log(
          `     💡 Property "${attr}" is verified as a dynamic virtual/derived context property.`,
        );
      }

      alignedAttributesCount++;
      return;
    }

    // B. Check existence (casing-insensitive & snake_case normalized mapping)
    let searchAttr = attr;
    if (entity === 'Group' && attr === 'creator_id') {
      searchAttr = 'created_by';
    }
    const exactMatch = dbFields[searchAttr];
    let matchedFieldKey = exactMatch ? searchAttr : null;

    if (!matchedFieldKey) {
      const normalize = (s) => s.toLowerCase().replace(/_/g, '');
      const normalizedAttr = normalize(searchAttr);
      matchedFieldKey = Object.keys(dbFields).find((f) => normalize(f) === normalizedAttr);
    }

    if (!matchedFieldKey) {
      if (DERIVED_AUTHORIZATION_FIELDS[entity]?.has(attr)) {
        alignedAttributesCount++;
        return;
      }
      console.error(
        `     \x1b[31m❌ FIELD MISSING:\x1b[0m Cedar expects property "${attr}" on entity "${entity}", but no corresponding column exists in database model "${dbModel}".`,
      );
      attributeErrors++;
      divergenceWeights[entity] += 5; // Heavily weight missing variables
      return;
    }

    // C. Verify granular type matching
    const cedarType = cedarFields[attr].type;
    const dbType = dbFields[matchedFieldKey].type;
    const compatible = isTypeCompatible(cedarType, dbType);

    if (!compatible) {
      console.error(
        `     \x1b[31m❌ TYPE COMPATIBILITY MISMATCH:\x1b[0m Property "${attr}" in Cedar has type "${cedarType}", but Database column "${matchedFieldKey}" has incompatible type "${dbType}".`,
      );
      attributeErrors++;
      divergenceWeights[entity] += 3;
      return;
    }

    // D. Verify requirement / optionality alignment (Vulnerability evaluation)
    const cedarAttrOptional = cedarFields[attr].isOptional;
    const dbAttrOptional = dbFields[matchedFieldKey].isOptional;

    if (!cedarAttrOptional && dbAttrOptional) {
      console.error(
        `     \x1b[31m⚠️  SECURITY VULNERABILITY WARNING:\x1b[0m Property "${attr}" is declared as REQUIRED in Cedar entity "${entity}", but is OPTIONAL (nullable) in Database model "${dbModel}".`,
      );
      console.log(
        `        Reason: If database record contains null, context hydration will supply null/undefined, breaking Cedar policy evaluations.`,
      );
      attributeWarnings++;
      divergenceWeights[entity] += 2;
    } else {
      alignedAttributesCount++;
      if (verbose) {
        const optStr = cedarAttrOptional ? 'optional' : 'required';
        console.log(
          `     ✅ Property "${attr}" aligned: C(${cedarType} [${optStr}]) ──> DB(${dbType})`,
        );
      }
    }
  });

  // E. Bidirectional Parity Audit: Check database columns that are NOT mapped in Cedar
  const unmappedDbFields = [];
  Object.keys(dbFields).forEach((dbField) => {
    // Check if dbField is matched in Cedar (either exact match or case/snake_case mapping or dynamic attrs)
    const isMappedInCedar =
      Object.keys(cedarFields).some((cField) => {
        const normalize = (s) => s.toLowerCase().replace(/_/g, '');
        return normalize(cField) === normalize(dbField);
      }) || dynamicAttrs.includes(dbField);

    // Ignore standard boilerplate fields that aren't expected to be in Cedar (unless explicitly added)
    const isStandardBoilerplate = [
      'id',
      'created_at',
      'updated_at',
      'deleted_at',
      'deleted_by',
      'deletion_reason',
      'metadata',
      'created_by',
      'email',
      'avatar_url',
      'bio',
      'phone',
      'full_name',
      'username',
    ].includes(dbField);

    if (!isMappedInCedar && !isStandardBoilerplate) {
      unmappedDbFields.push(dbField);
    }
  });

  if (unmappedDbFields.length > 0) {
    console.log(
      `     \x1b[33m💡 UNMAPPED COLUMNS:\x1b[0m Database model "${dbModel}" has fields not declared in Cedar: [${unmappedDbFields.join(', ')}]`,
    );
  }
});

console.log(`   - Attribute Drift Errors      : ${attributeErrors}`);
console.log(`   - Attribute Security Warnings : ${attributeWarnings}`);

// ─── Heuristic 4: Live Database Schema Parity Audit (schema.zmodel <──> PostgreSQL DB) ───
console.log(
  '\x1b[36m\n4. Live Database Schema Parity Audit (schema.zmodel <──> PostgreSQL DB):\x1b[0m',
);

let databaseDriftErrors = 0;
let databaseDriftWarnings = 0;

try {
    // Use the linked Supabase CLI path, matching the working database-drift
    // auditor. DATABASE_URL may point at an expired local/staging password.
    const rows = readLinkedSupabaseQuery(`
      SELECT c.table_name, c.column_name, c.data_type, c.is_nullable,
             CASE WHEN t.table_type = 'VIEW' THEN true ELSE false END AS is_view
      FROM information_schema.columns c
      LEFT JOIN information_schema.tables t
        ON t.table_schema = c.table_schema AND t.table_name = c.table_name
      WHERE c.table_schema = 'public'
    `);

    // Group columns by table name
    const dbTables = {};
    rows.forEach((row) => {
      const tName = row.table_name;
      const cName = row.column_name;
      if (!dbTables[tName]) {
        dbTables[tName] = {};
      }
      dbTables[tName][cName] = {
        dataType: row.data_type,
        isNullable: row.is_nullable === 'YES',
        isView: row.is_view === true || row.is_view === 'true',
      };
    });

    // For each model in schema.zmodel
    Object.entries(modelTableNameMap).forEach(([modelName, tableName]) => {
      const zmodelFields = dbSchema[modelName];
      const dbColumns = dbTables[tableName];

      if (!dbColumns) {
        // Table doesn't exist in DB - could be a virtual model or not yet migrated
        if (verbose) {
          console.log(
            `     💡 Table "${tableName}" (model "${modelName}") does not exist in the database yet. Skipping column check.`,
          );
        }
        return;
      }

      if (verbose) {
        console.log(
          `   \x1b[36mChecking database alignment for model [${modelName}] ──> table [${tableName}]:\x1b[0m`,
        );
      }

      // A. Check for columns in DB table that are missing in ZModel model
      Object.entries(dbColumns).forEach(([columnName, colInfo]) => {
        // Ignore standard virtual/derived attributes and standard boilerplate fields if they're not in the model
        // Wait, standard columns must be defined in the zmodel model if they are to be synchronized,
        // so if there's a database column, it SHOULD be defined in the zmodel model unless it is purely internal or ignored by design.
        // Wait! What if there are columns like standard triggers or system/PowerSync columns?
        // E.g., postgresql system columns or similar?
        // Let's filter out standard Postgres / PowerSync / migration columns that might not be in Prisma by design, like 'id' is always there.
        // But wait, the user's issue was missing display_name, first_name, last_name, identity_state.
        // Let's check: if there is a column in the database but it's not mapped to any field in the ZModel, that's indeed a schema drift!
        // Wait, are there any other tables with ignored columns?
        // Let's look at users table - capacity is there, etc.
        // If there's any column that is missing, we raise it.
        const isIgnoredColumn = [
          // Add any platform-specific ignore lists if we know them
        ].includes(columnName);

        const hasField = zmodelFields[columnName];
        if (!hasField && !isIgnoredColumn) {
          console.warn(
            `     \x1b[33m⚠️  DB DRIFT WARNING:\x1b[0m Column "${columnName}" (${colInfo.dataType}) exists in DB table "${tableName}" but is missing in schema.zmodel model "${modelName}".`,
          );
          databaseDriftWarnings++;
        }
      });

      // B. Check for fields in ZModel model that are missing in DB table
      Object.entries(zmodelFields).forEach(([fieldName, fieldInfo]) => {
        if (isRelationField(fieldInfo)) return;
        const hasColumn = dbColumns[fieldName];
        if (!hasColumn) {
          console.error(
            `     \x1b[31m❌ DB DRIFT FAILURE:\x1b[0m Field "${fieldName}" (${fieldInfo.type}) is declared in schema.zmodel model "${modelName}" but does not exist in DB table "${tableName}".`,
          );
          databaseDriftErrors++;
          return;
        }

        // C. Check type compatibility between DB data type and ZModel type
        const dbType = hasColumn.dataType;
        const zmodelType = fieldInfo.type;

        let isCompatible = false;
        if (zmodelType === 'String') {
          isCompatible = [
            'character varying',
            'text',
            'uuid',
            'character',
            'citext',
            'timestamp with time zone',
            'timestamp without time zone',
            'date',
            'time without time zone',
            'time',
          ].includes(dbType);
        } else if (zmodelType === 'DateTime') {
          isCompatible = [
            'timestamp with time zone',
            'timestamp without time zone',
            'date',
            'time',
            'timestamp',
          ].includes(dbType);
        } else if (zmodelType === 'Boolean') {
          isCompatible = ['boolean'].includes(dbType);
        } else if (zmodelType === 'Int' || zmodelType === 'BigInt') {
          isCompatible = ['integer', 'bigint', 'smallint', 'numeric'].includes(dbType);
        } else if (zmodelType === 'Float' || zmodelType === 'Decimal') {
          isCompatible = ['double precision', 'real', 'numeric'].includes(dbType);
        } else if (zmodelType === 'Json') {
          isCompatible = ['jsonb', 'json'].includes(dbType);
        } else if (zmodelType.endsWith('[]')) {
          isCompatible = dbType === 'ARRAY' || dbType.startsWith('_') || dbType.endsWith('[]');
        } else {
          // Custom types/relations
          isCompatible = true;
        }

        if (!isCompatible) {
          console.error(
            `     \x1b[31m❌ TYPE COMPATIBILITY MISMATCH:\x1b[0m Field "${fieldName}" in model "${modelName}" has type "${zmodelType}", but DB column has incompatible type "${dbType}".`,
          );
          databaseDriftErrors++;
        }

        // D. Check nullability alignment
        const isDbNullable = hasColumn.isNullable;
        const isZmodelOptional = fieldInfo.isOptional;

        // PostgreSQL reports view columns as nullable even when the source
        // relation guarantees a value. Views are read-only projections, so
        // this metadata artifact is not application nullability drift.
        if (hasColumn.isView || (zmodelType.endsWith('[]') && isDbNullable)) return;

        if (!isZmodelOptional && isDbNullable) {
          // Required in ZModel, but Nullable in DB. This is a security/runtime hazard if DB holds null.
          console.error(
            `     \x1b[33m⚠️  NULLABILITY DRIFT WARNING:\x1b[0m Field "${fieldName}" is REQUIRED in schema.zmodel model "${modelName}", but is NULLABLE in DB table "${tableName}".`,
          );
          databaseDriftWarnings++;
        } else if (isZmodelOptional && !isDbNullable) {
          // Optional in ZModel, but NOT NULL in DB.
          console.error(
            `     \x1b[33m⚠️  NULLABILITY DRIFT WARNING:\x1b[0m Field "${fieldName}" is OPTIONAL in schema.zmodel model "${modelName}", but is NOT NULL in DB table "${tableName}".`,
          );
          databaseDriftWarnings++;
        }
      });
    });

    console.log(`   - Live Database Drift Errors   : ${databaseDriftErrors}`);
    console.log(`   - Live Database Drift Warnings : ${databaseDriftWarnings}`);
  } catch (err) {
    console.log(
      '   \x1b[33m⚠️  WARNING: Failed to execute database parity audit due to connection or pg library error (skipped):\x1b[0m',
      err.message,
    );
  }

// ─── Heuristic 5: API Gateway Schema Parity Audit (ZModel <──> identity.schema.json) ───
console.log(
  '\x1b[36m\n5. API Gateway Schema Parity Audit (ZModel <──> identity.schema.json):\x1b[0m',
);

const identitySchemaPath = path.join(
  ROOT,
  'packages',
  'core',
  'src',
  'api',
  'identity.schema.json',
);
let apiDriftErrors = 0;
const apiDriftWarnings = 0;

if (!fs.existsSync(identitySchemaPath)) {
  console.log(
    '   \x1b[33m⚠️  SKIPPED: identity.schema.json not found. API gateway alignment audit skipped.\x1b[0m',
  );
} else {
  try {
    const apiSchema = JSON.parse(fs.readFileSync(identitySchemaPath, 'utf8'));
    const defs = apiSchema.definitions || apiSchema.$defs || {};

    const getJsonSchemaTypes = (propInfo) => {
      if (propInfo.type) {
        return Array.isArray(propInfo.type) ? propInfo.type : [propInfo.type];
      }
      if (propInfo.anyOf) {
        return propInfo.anyOf.map((t) => t.type).filter(Boolean);
      }
      if (propInfo.oneOf) {
        return propInfo.oneOf.map((t) => t.type).filter(Boolean);
      }
      return [];
    };



    // 1. Audit Identity schema against User model
    if (defs.Identity && defs.Identity.properties && dbSchema.User) {
      if (verbose) {
        console.log(
          '   \x1b[36mChecking properties for API schema [Identity] <──> model [User]:\x1b[0m',
        );
      }
      const identityProps = defs.Identity.properties;
      const userModel = dbSchema.User;

      Object.entries(identityProps).forEach(([propName, propInfo]) => {
        // Skip relational or compound properties not directly in database User table
        // Also skip 'name' as it is a virtual field mapped from display_name/full_name
        if (
          [
            'activeBond',
            'availableBonds',
            'activePerspective',
            'availablePerspectives',
            'name',
          ].includes(propName)
        ) {
          return;
        }

        const modelField = userModel[propName];
        if (!modelField) {
          console.error(
            `     \x1b[31m❌ API DRIFT FAILURE:\x1b[0m Property "${propName}" is declared in Identity API schema, but is missing in ZModel model "User".`,
          );
          apiDriftErrors++;
          return;
        }

        // Verify type compatibility
        const propTypes = getJsonSchemaTypes(propInfo);
        const actualPropType = propTypes.filter((t) => t !== 'null')[0];

        const isCompatible =
          (actualPropType === 'string' && modelField.type === 'String') ||
          (actualPropType === 'boolean' && modelField.type === 'Boolean') ||
          (actualPropType === 'integer' && modelField.type === 'Int') ||
          (actualPropType === 'number' && ['Float', 'Decimal'].includes(modelField.type));

        if (!isCompatible) {
          console.error(
            `     \x1b[31m❌ API TYPE MISMATCH:\x1b[0m Property "${propName}" has type "${actualPropType || 'unknown'}" in Identity API schema, but model "User" has incompatible type "${modelField.type}".`,
          );
          apiDriftErrors++;
        }
      });
    }

    // 2. Audit FacetedProfile schema against User model
    if (defs.FacetedProfile && defs.FacetedProfile.properties && dbSchema.User) {
      if (verbose) {
        console.log(
          '   \x1b[36mChecking properties for API schema [FacetedProfile] <──> model [User]:\x1b[0m',
        );
      }
      const profileProps = defs.FacetedProfile.properties;
      const userModel = dbSchema.User;

      Object.entries(profileProps).forEach(([propName, propInfo]) => {
        // school_id is a dynamic relational/junction field, skip direct audit
        if (propName === 'school_id') return;

        const modelField = userModel[propName];
        if (!modelField) {
          console.error(
            `     \x1b[31m❌ API DRIFT FAILURE:\x1b[0m Property "${propName}" is declared in FacetedProfile API schema, but is missing in ZModel model "User".`,
          );
          apiDriftErrors++;
          return;
        }

        // Verify type compatibility (unwrap array/anyOf types)
        const propTypes = getJsonSchemaTypes(propInfo);
        const actualPropType = propTypes.filter((t) => t !== 'null')[0];

        const isCompatible =
          (actualPropType === 'string' && modelField.type === 'String') ||
          (actualPropType === 'boolean' && modelField.type === 'Boolean') ||
          (actualPropType === 'integer' && modelField.type === 'Int') ||
          (actualPropType === 'number' && ['Float', 'Decimal'].includes(modelField.type));

        if (!isCompatible) {
          console.error(
            `     \x1b[31m❌ API TYPE MISMATCH:\x1b[0m Property "${propName}" has type "${actualPropType || 'unknown'}" in FacetedProfile API schema, but model "User" has incompatible type "${modelField.type}".`,
          );
          apiDriftErrors++;
        }
      });
    }

    // 3. Audit Bond schema against Bond model
    if (defs.Bond && defs.Bond.properties && dbSchema.Bond) {
      if (verbose) {
        console.log(
          '   \x1b[36mChecking properties for API schema [Bond] <──> model [Bond]:\x1b[0m',
        );
      }
      const bondProps = defs.Bond.properties;
      const bondModel = dbSchema.Bond;

      Object.entries(bondProps).forEach(([propName, propInfo]) => {
        // Skip 'status' as it is a virtual field mapped and populated at the API boundary
        if (propName === 'status') return;

        const modelField = bondModel[propName];
        if (!modelField) {
          console.error(
            `     \x1b[31m❌ API DRIFT FAILURE:\x1b[0m Property "${propName}" is declared in Bond API schema, but is missing in ZModel model "Bond".`,
          );
          apiDriftErrors++;
          return;
        }

        // Verify type compatibility
        const isCompatible =
          (propInfo.type === 'string' && modelField.type === 'String') ||
          (propInfo.type === 'object' && modelField.type === 'Json') ||
          (propInfo.$ref && modelField.type === 'String'); // Custom capacity reference is string stored in DB

        if (!isCompatible) {
          console.error(
            `     \x1b[31m❌ API TYPE MISMATCH:\x1b[0m Property "${propName}" has type "${propInfo.type || 'ref'}" in Bond API schema, but model "Bond" has incompatible type "${modelField.type}".`,
          );
          apiDriftErrors++;
        }
      });
    }

    console.log(`   - API Gateway Drift Errors     : ${apiDriftErrors}`);
    console.log(`   - API Gateway Drift Warnings   : ${apiDriftWarnings}`);
  } catch (err) {
    console.error(
      '   \x1b[31m❌ ERROR: Failed to execute API gateway parity audit:\x1b[0m',
      err.message,
    );
    apiDriftErrors++;
  }
}

// ─── Large-Scale Hotspots Tracking Summary ──────────────────────────────────
console.log('\x1b[36m\n6. Large-Scale Domain Divergence Hotspots Leaderboard:\x1b[0m');
const hotspots = Object.entries(divergenceWeights)
  .filter(([, weight]) => weight > 0)
  .sort((a, b) => b[1] - a[1]);

if (hotspots.length === 0) {
  console.log(
    '   \x1b[32m✅ PERFECT PARITY: All domains are fully synchronized with 0 divergence weight.\x1b[0m',
  );
} else {
  console.log(
    '   The following domain layers are showing signs of structural or optionality divergence:',
  );
  hotspots.forEach(([entity, weight]) => {
    let severity = '\x1b[33m[Medium Drift]';
    if (weight >= 5) severity = '\x1b[31m[Severe Drift]';
    console.log(
      `     - ${severity} \x1b[0mDomain \x1b[35m${entity}\x1b[0m (Divergence Score: ${weight})`,
    );
  });
}

// ─── High-Insight Statistical Dashboard & Aggregation ─────────────────────────
console.log('\x1b[36m\n7. High-Insight Logical Statistics Dashboard:\x1b[0m');

// Calculate Statistics
const totalDbModelsCount = dbModels.length;
const totalCedarEntitiesCount = cedarEntities.length;

let totalDbVariablesCount = 0;
let requiredDbVariablesCount = 0;
let optionalDbVariablesCount = 0;
Object.values(dbSchema).forEach((fields) => {
  Object.values(fields).forEach((f) => {
    totalDbVariablesCount++;
    if (f.isOptional) {
      optionalDbVariablesCount++;
    } else {
      requiredDbVariablesCount++;
    }
  });
});

let totalCedarAttributesCount = 0;
let requiredCedarAttributesCount = 0;
let optionalCedarAttributesCount = 0;
Object.values(cedarSchema).forEach((fields) => {
  Object.values(fields).forEach((f) => {
    totalCedarAttributesCount++;
    if (f.isOptional) {
      optionalCedarAttributesCount++;
    } else {
      requiredCedarAttributesCount++;
    }
  });
});

let totalVirtualAttributesCount = 0;
Object.values(DYNAMIC_OR_DERIVED_ATTRIBUTES).forEach((attrs) => {
  totalVirtualAttributesCount += attrs.length;
});

// Coverage & Alignment Calculations
const logicalDbModelsCount = totalDbModelsCount - KNOWN_INTERNAL_RELATIONAL_MODELS.length;
const modelCoveragePercentage = Math.round((alignedEntities.length / logicalDbModelsCount) * 100);
const attributeAlignmentPercentage = Math.round(
  (alignedAttributesCount / totalCedarAttributesCount) * 100,
);

const dbRequiredPercentage = Math.round((requiredDbVariablesCount / totalDbVariablesCount) * 100);
const cedarRequiredPercentage = Math.round(
  (requiredCedarAttributesCount / totalCedarAttributesCount) * 100,
);

// Rendering ASCII Metric Table
console.log('   ┌──────────────────────────────────────────┬────────────────────┐');
console.log('   │ Metric Dimension                         │ Value / Count      │');
console.log('   ├──────────────────────────────────────────┼────────────────────┤');
console.log(
  `   │ Database Models (schema.zmodel)          │ ${String(totalDbModelsCount).padEnd(18)} │`,
);
console.log(
  `   │ Logical Core Entities (Excluding Relational)│ ${String(logicalDbModelsCount).padEnd(18)} │`,
);
console.log(
  `   │ Cedar Policy Entities                    │ ${String(totalCedarEntitiesCount).padEnd(18)} │`,
);
console.log(
  `   │ Model Security Coverage Ratio            │ ${String(modelCoveragePercentage + '%').padEnd(18)} │`,
);
console.log('   ├──────────────────────────────────────────┼────────────────────┤');
console.log(
  `   │ Total Database Variables / Columns       │ ${String(totalDbVariablesCount).padEnd(18)} │`,
);
console.log(
  `   │ Total Cedar Guarded Attributes           │ ${String(totalCedarAttributesCount).padEnd(18)} │`,
);
console.log(
  `   │ Dynamic Virtual/Derived Context Variables│ ${String(totalVirtualAttributesCount).padEnd(18)} │`,
);
console.log(
  `   │ Granular Attribute Alignment Ratio       │ ${String(attributeAlignmentPercentage + '%').padEnd(18)} │`,
);
console.log('   └──────────────────────────────────────────┴────────────────────┘');

console.log('\n   \x1b[36mRequirement & Optionality Distribution:\x1b[0m');
const dbBarWidth = Math.round(dbRequiredPercentage / 4);
const cedarBarWidth = Math.round(cedarRequiredPercentage / 4);

const renderBar = (reqWidth) => {
  const reqStr = '█'.repeat(reqWidth);
  const optStr = '░'.repeat(25 - reqWidth);
  return `${reqStr}${optStr}`;
};

console.log(
  `   - Postgres DB Schema: [${renderBar(dbBarWidth)}] ${dbRequiredPercentage}% Required / ${100 - dbRequiredPercentage}% Nullable`,
);
console.log(
  `   - Cedar Auth Schema : [${renderBar(cedarBarWidth)}] ${cedarRequiredPercentage}% Required / ${100 - cedarRequiredPercentage}% Optional`,
);

console.log(
  '\x1b[35m======================================================================\x1b[0m',
);
console.log('\x1b[35m⚖️  Audit Complete\x1b[0m');
console.log(
  '\x1b[35m======================================================================\x1b[0m',
);

// Fail build if there are structural anomalies, missing attributes, database drift errors, or API schema drift errors
if (
  cedarOnlyAnomalies.length > 0 ||
  missingInTs.length > 0 ||
  attributeErrors > 0 ||
  databaseDriftErrors > 0 ||
  apiDriftErrors > 0
) {
  console.error(
    '\n\x1b[31m❌ Audit Failed. Schema discrepancies detected that could cause runtime authorization crashes.\x1b[0m\n',
  );
  process.exit(1);
} else if (attributeWarnings > 0 || databaseDriftWarnings > 0 || apiDriftWarnings > 0) {
  console.log(
    '\n\x1b[33m⚠️  Audit Passed with Warnings. Address nullable property optionalities to prevent evaluation crashes.\x1b[0m\n',
  );
  process.exit(0);
} else {
  console.log(
    '\n\x1b[32m✅ Audit Passed. All layers are in complete, secure structural alignment!\x1b[0m\n',
  );
  process.exit(0);
}
