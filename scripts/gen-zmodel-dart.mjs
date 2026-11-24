import fs from 'node:fs';
import path from 'node:path';

const schemaPath = path.resolve('packages/schema/schema.zmodel');
const outputDir = path.resolve('apps/gurudevi-flutter/lib/core/models/generated');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log(`[gen-zmodel-dart] Reading ${schemaPath}...`);
const zmodelContent = fs.readFileSync(schemaPath, 'utf8');

const TARGET_MODELS = ['User', 'Bond', 'School', 'Classroom', 'ClassroomStudent'];

function dartType(zType, isOptional) {
  let baseType = 'String';
  if (zType === 'String') baseType = 'String';
  else if (zType === 'Int') baseType = 'int';
  else if (zType === 'Float') baseType = 'double';
  else if (zType === 'Boolean') baseType = 'bool';
  else if (zType === 'DateTime') baseType = 'DateTime';
  else if (zType === 'Json') baseType = 'Map<String, dynamic>';
  else if (zType.endsWith('[]')) baseType = `List<${dartType(zType.slice(0, -2), false)}>`;
  else baseType = 'String';

  return isOptional ? `${baseType}?` : baseType;
}

const modelRegex = /model\s+(\w+)\s+\{([^}]+)\}/g;
let match;
const extractedModels = {};

while ((match = modelRegex.exec(zmodelContent)) !== null) {
  const modelName = match[1];
  if (!TARGET_MODELS.includes(modelName)) continue;

  const body = match[2];
  const fields = [];

  const lines = body.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('@@') || trimmed.startsWith('/*')) continue;
    // Skip multi-line policy attributes or conditions
    if (trimmed.includes('auth()') || trimmed.includes('(') || trimmed.includes(')') || trimmed.includes('==') || trimmed.includes('||') || trimmed.includes('&&')) continue;

    const tokens = trimmed.split(/\s+/);
    if (tokens.length >= 2) {
      const fieldName = tokens[0];
      const rawType = tokens[1];
      const isOptional = rawType.endsWith('?');
      const cleanType = isOptional ? rawType.slice(0, -1) : rawType;

      // Skip relational models
      const KNOWN_RELATIONS = [
        'User', 'School', 'Classroom', 'Student', 'ClassroomStudent', 'Post',
        'GroupMember', 'Assignment', 'Grade', 'Lesson', 'Material', 'AttendanceRecord',
        'InventoryItem', 'ClassroomNote', 'PrincipalNote', 'ClassroomJoinRequest',
        'ClassroomLegacyRecord', 'ClassroomGradeClass', 'UserPreferences', 'SchoolGrade',
        'SchoolMembership', 'SchoolJoinRequest', 'SchoolRegistryClaim', 'SchoolModePolicy',
        'SchoolModeUsageDaily', 'SchoolNoticeEvent', 'SchoolEvent', 'SchoolInviteCode',
        'PersonalClassroom', 'ClassroomGradingSettings'
      ];
      if (KNOWN_RELATIONS.includes(cleanType) || KNOWN_RELATIONS.includes(cleanType.replace('[]', ''))) {
        continue;
      }

      // Valid identifier check
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(fieldName)) continue;

      fields.push({
        name: fieldName,
        type: dartType(cleanType, isOptional),
        rawType: cleanType,
        isOptional,
      });
    }
  }

  extractedModels[modelName] = fields;
}

// Generate Dart files
for (const [modelName, fields] of Object.entries(extractedModels)) {
  const fileName = `${modelName.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()}.g.dart`;
  const filePath = path.join(outputDir, fileName);

  let dart = `// GENERATED FROM packages/schema/schema.zmodel - DO NOT MODIFY DIRECTLY\n\n`;
  dart += `class ${modelName}Model {\n`;
  for (const f of fields) {
    dart += `  final ${f.type} ${f.name};\n`;
  }

  dart += `\n  const ${modelName}Model({\n`;
  for (const f of fields) {
    dart += `    ${f.isOptional ? '' : 'required '}this.${f.name},\n`;
  }
  dart += `  });\n\n`;

  // fromJson
  dart += `  factory ${modelName}Model.fromJson(Map<String, dynamic> json) {\n`;
  dart += `    return ${modelName}Model(\n`;
  for (const f of fields) {
    if (f.rawType === 'DateTime') {
      if (f.isOptional) {
        dart += `      ${f.name}: json['${f.name}'] != null ? DateTime.parse(json['${f.name}'] as String) : null,\n`;
      } else {
        dart += `      ${f.name}: DateTime.parse(json['${f.name}'] as String),\n`;
      }
    } else {
      dart += `      ${f.name}: json['${f.name}'] as ${f.type},\n`;
    }
  }
  dart += `    );\n  }\n\n`;

  // toJson
  dart += `  Map<String, dynamic> toJson() {\n    return {\n`;
  for (const f of fields) {
    if (f.rawType === 'DateTime') {
      dart += `      '${f.name}': ${f.name}${f.isOptional ? '?' : ''}.toIso8601String(),\n`;
    } else {
      dart += `      '${f.name}': ${f.name},\n`;
    }
  }
  dart += `    };\n  }\n}\n`;

  fs.writeFileSync(filePath, dart);
  console.log(`[gen-zmodel-dart] Wrote ${filePath}`);
}

console.log('[gen-zmodel-dart] Generation completed successfully.');
