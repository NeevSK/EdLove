import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = path.resolve(__dirname, '..');
const BACKUPS_DIR = path.join(APP_DIR, 'supabase', 'backups');
const OUTPUT_FILE = path.join(BACKUPS_DIR, 'remote_schema_backup.sql');

function runQuery(sql) {
  const tempFile = path.join(APP_DIR, `.temp_backup_query_${Date.now()}.sql`);
  fs.writeFileSync(tempFile, sql, 'utf8');
  try {
    const output = execFileSync(
      'npx.cmd',
      ['supabase', 'db', 'query', '--linked', '-o', 'json', '-f', tempFile],
      {
        cwd: APP_DIR,
        encoding: 'utf8',
        shell: process.platform === 'win32',
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    ).trim();

    if (!output) return [];
    const parsed = JSON.parse(output);
    if (parsed && !Array.isArray(parsed) && Array.isArray(parsed.rows)) {
      return parsed.rows;
    }
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    let stderrStr = '';
    if (error.stderr) stderrStr = error.stderr.toString();
    throw new Error(`${error.message}\n${stderrStr}`);
  } finally {
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
  }
}

async function main() {
  console.log('🔌 Connecting to linked database and generating full schema backup...');
  fs.mkdirSync(BACKUPS_DIR, { recursive: true });

  const sqlSections = [];
  sqlSections.push('-- ==========================================');
  sqlSections.push('-- Supabase Remote Database Schema Backup');
  sqlSections.push(`-- Generated: ${new Date().toISOString()}`);
  sqlSections.push('-- ==========================================\n');

  // 1. Extensions
  console.log('📦 Fetching database extensions...');
  try {
    const extensions = runQuery(`
      SELECT extname, extversion 
      FROM pg_extension 
      ORDER BY extname;
    `);
    if (extensions.length > 0) {
      sqlSections.push('-- ─── Extensions ───');
      for (const ext of extensions) {
        sqlSections.push(`CREATE EXTENSION IF NOT EXISTS "${ext.extname}" WITH SCHEMA public VERSION '${ext.extversion}';`);
      }
      sqlSections.push('');
    }
  } catch (err) {
    console.warn('⚠️  Could not fetch extensions:', err.message);
  }

  // 2. Custom Types / Enums
  console.log('🏷️  Fetching custom types and enums...');
  try {
    const enums = runQuery(`
      SELECT t.typname AS enum_name,
             string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) AS enum_values
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      GROUP BY t.typname
      ORDER BY t.typname;
    `);
    if (enums.length > 0) {
      sqlSections.push('-- ─── Custom Types / Enums ───');
      for (const en of enums) {
        const valList = en.enum_values.split(', ').map(v => `'${v}'`).join(', ');
        sqlSections.push(`CREATE TYPE public."${en.enum_name}" AS ENUM (${valList});`);
      }
      sqlSections.push('');
    }
  } catch (err) {
    console.warn('⚠️  Could not fetch custom types/enums:', err.message);
  }

  // 3. User-defined Functions (Functions and Procedures)
  console.log('⚙️  Fetching user-defined functions and procedures...');
  try {
    const functions = runQuery(`
      SELECT p.proname AS name, pg_get_functiondef(p.oid) AS definition
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' AND p.prokind <> 'a'
      ORDER BY p.proname;
    `);
    if (functions.length > 0) {
      sqlSections.push('-- ─── Functions and Triggers ───');
      for (const fn of functions) {
        sqlSections.push(`${fn.definition};\n`);
      }
    }
  } catch (err) {
    console.warn('⚠️  Could not fetch user-defined functions:', err.message);
  }

  // 4. Tables and Columns
  console.log('📋 Fetching tables and columns...');
  try {
    const columns = runQuery(`
      SELECT table_name, column_name, data_type, character_maximum_length, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `);

    // Group columns by table
    const tableColumns = {};
    for (const col of columns) {
      if (!tableColumns[col.table_name]) {
        tableColumns[col.table_name] = [];
      }
      tableColumns[col.table_name].push(col);
    }

    // Also get view names to filter them out of table creations
    const views = runQuery(`
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = 'public';
    `);
    const viewNames = new Set(views.map(v => v.table_name));

    sqlSections.push('-- ─── Tables ───');
    for (const [tableName, cols] of Object.entries(tableColumns)) {
      if (viewNames.has(tableName)) continue; // View schema is generated separately

      sqlSections.push(`CREATE TABLE public."${tableName}" (`);
      const colDefs = [];
      for (const col of cols) {
        let typeStr = col.data_type;
        if (typeStr === 'character varying' && col.character_maximum_length) {
          typeStr = `varchar(${col.character_maximum_length})`;
        } else if (typeStr === 'USER-DEFINED') {
          // If user defined, it's likely a custom type/enum
          typeStr = `public."${col.column_name}_type"`; // fallback, try to get actual typname if needed
        }
        
        let defStr = '';
        if (col.column_default) {
          defStr = ` DEFAULT ${col.column_default}`;
        }
        
        const nullStr = col.is_nullable === 'YES' ? '' : ' NOT NULL';
        colDefs.push(`    "${col.column_name}" ${typeStr}${defStr}${nullStr}`);
      }
      sqlSections.push(colDefs.join(',\n'));
      sqlSections.push(');\n');
    }
  } catch (err) {
    console.error('❌ Could not fetch tables and columns:', err.message);
  }

  // 5. Constraints (Primary Keys, Foreign Keys, Unique)
  console.log('⛓️  Fetching table constraints...');
  try {
    const constraints = runQuery(`
      SELECT con.conname AS constraint_name,
             con.contype AS constraint_type,
             rel.relname AS table_name,
             pg_get_constraintdef(con.oid) AS definition
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      JOIN pg_namespace nsp ON nsp.oid = con.connamespace
      WHERE nsp.nspname = 'public'
      ORDER BY con.contype DESC, con.conname;
    `);
    if (constraints.length > 0) {
      sqlSections.push('-- ─── Constraints ───');
      for (const con of constraints) {
        sqlSections.push(`ALTER TABLE ONLY public."${con.table_name}" ADD CONSTRAINT "${con.constraint_name}" ${con.definition};`);
      }
      sqlSections.push('');
    }
  } catch (err) {
    console.warn('⚠️  Could not fetch constraints:', err.message);
  }

  // 6. Views
  console.log('🖼️  Fetching views...');
  try {
    const views = runQuery(`
      SELECT table_name AS view_name, view_definition
      FROM information_schema.views
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    if (views.length > 0) {
      sqlSections.push('-- ─── Views ───');
      for (const view of views) {
        if (view.view_definition) {
          sqlSections.push(`CREATE OR REPLACE VIEW public."${view.view_name}" AS\n${view.view_definition.trim()};\n`);
        } else {
          sqlSections.push(`-- View: public."${view.view_name}" (Definition empty/not accessible)`);
        }
      }
    }
  } catch (err) {
    console.warn('⚠️  Could not fetch views:', err.message);
  }

  // 7. Indexes
  console.log('🔍 Fetching indexes...');
  try {
    const indexes = runQuery(`
      SELECT tablename, indexname, indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND indexname NOT IN (SELECT conname FROM pg_constraint)
      ORDER BY tablename, indexname;
    `);
    if (indexes.length > 0) {
      sqlSections.push('-- ─── Indexes ───');
      for (const idx of indexes) {
        sqlSections.push(`${idx.indexdef};`);
      }
      sqlSections.push('');
    }
  } catch (err) {
    console.warn('⚠️  Could not fetch indexes:', err.message);
  }

  // 8. Triggers
  console.log('⚡ Fetching triggers...');
  try {
    const triggers = runQuery(`
      SELECT tgname AS trigger_name,
             rel.relname AS table_name,
             pg_get_triggerdef(tg.oid) AS definition
      FROM pg_trigger tg
      JOIN pg_class rel ON rel.oid = tg.tgrelid
      JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
      WHERE nsp.nspname = 'public' AND NOT tg.tgisinternal
      ORDER BY rel.relname, tgname;
    `);
    if (triggers.length > 0) {
      sqlSections.push('-- ─── Triggers ───');
      for (const trig of triggers) {
        sqlSections.push(`${trig.definition};`);
      }
      sqlSections.push('');
    }
  } catch (err) {
    console.warn('⚠️  Could not fetch triggers:', err.message);
  }

  // 9. RLS Policies
  console.log('🔒 Fetching RLS policies...');
  try {
    const policies = runQuery(`
      SELECT policyname, tablename, permissive, roles, cmd, qual, with_check
      FROM pg_policies
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname;
    `);
    if (policies.length > 0) {
      sqlSections.push('-- ─── Row Level Security Policies ───');
      for (const pol of policies) {
        let sql = `CREATE POLICY "${pol.policyname}" ON public."${pol.tablename}"`;
        if (pol.permissive === 'RESTRICTIVE') sql += ' AS RESTRICTIVE';
        sql += ` FOR ${pol.cmd}`;
        
        if (pol.roles) {
          let rolesList = '';
          if (Array.isArray(pol.roles)) {
            rolesList = pol.roles.join(', ');
          } else if (typeof pol.roles === 'string') {
            rolesList = pol.roles.replace(/[{}]/g, '').split(',').map(r => r.trim()).join(', ');
          }
          if (rolesList && rolesList !== 'public') {
            sql += ` TO ${rolesList}`;
          }
        }
        
        if (pol.qual) sql += ` USING (${pol.qual})`;
        if (pol.with_check) sql += ` WITH CHECK (${pol.with_check})`;
        sqlSections.push(`${sql};`);
      }
      sqlSections.push('');
    }
  } catch (err) {
    console.warn('⚠️  Could not fetch RLS policies:', err.message);
  }

  // 10. Enable RLS on Tables
  console.log('🔑 Enabling RLS on tables...');
  try {
    const rlsTables = runQuery(`
      SELECT c.relname AS table_name
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' 
        AND c.relkind = 'r' 
        AND c.relrowsecurity = true
      ORDER BY c.relname;
    `);
    if (rlsTables.length > 0) {
      sqlSections.push('-- ─── Enable RLS ───');
      for (const tab of rlsTables) {
        sqlSections.push(`ALTER TABLE public."${tab.table_name}" ENABLE ROW LEVEL SECURITY;`);
      }
      sqlSections.push('');
    }
  } catch (err) {
    console.warn('⚠️  Could not fetch RLS table status:', err.message);
  }

  fs.writeFileSync(OUTPUT_FILE, sqlSections.join('\n'), 'utf8');
  console.log(`\n🎉 Backup successfully saved to ${path.relative(APP_DIR, OUTPUT_FILE)}`);
}

main().catch(err => {
  console.error('Fatal backup error:', err);
  process.exit(1);
});
