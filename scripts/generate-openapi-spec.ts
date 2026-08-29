import { OpenAPIGenerator } from '@orpc/openapi/dist/index.mjs';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function generateOpenAPISpec() {
  // Import the router dynamically
  const { router } = await import(resolve(__dirname, '../apps/sanctuary-api/src/core/router.ts'));
  
  const generator = new OpenAPIGenerator(router, {
    info: {
      title: 'Sanctuary API',
      version: '2026.1.0',
      description: 'Sovereign API Gateway (ZenStack v3.6.4 + Zod v4 + oRPC)',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local development' },
      { url: 'https://api.sanctuary.gurudevi.edlove.org', description: 'Production' },
    ],
    tags: [
      { name: 'self', description: 'Personal wellbeing & profile' },
      { name: 'identity', description: 'Authentication & onboarding' },
      { name: 'library', description: 'Content library & resources' },
      { name: 'educational', description: 'Classrooms, assignments, materials' },
      { name: 'community', description: 'Groups, posts, comments, polls' },
      { name: 'attendance', description: 'Attendance tracking' },
      { name: 'grading', description: 'Grades & assessments' },
      { name: 'dailyContent', description: 'Daily content delivery' },
      { name: 'mapping', description: 'Knowledge topology & school pulse' },
      { name: 'rewards', description: 'Growth signals & whispered moments' },
      { name: 'privacy', description: 'Privacy ledger & consent' },
      { name: 'sync', description: 'PowerSync offline-first sync' },
      { name: 'ai', description: 'AI Assistant (SSE streaming)' },
      { name: 'admin', description: 'Platform administration' },
      { name: 'erp', description: 'Inventory, accounting, payments' },
      { name: 'tracking', description: 'Feature usage analytics' },
      { name: 'agent', description: 'Durable agents & system status' },
    ],
    // Only include procedures that have explicit OpenAPI metadata
    filter: ({ contract }) => {
      const policy = (contract['~orpc']?.meta as any)?.policy;
      return policy?.action === 'read' && [
        'Classroom', 'Material', 'Assignment', 'AssignmentSubmission',
        'Group', 'Post', 'School', 'User', 'Wellbeing', 'Library'
      ].includes(policy?.subject);
    },
  });

  const spec = await generator.generate();
  
  // Write to docs folder
  const outputPath = resolve(__dirname, '../apps/sanctuary-api/docs/api/openapi.json');
  writeFileSync(outputPath, JSON.stringify(spec, null, 2));
  
  console.log(`✅ OpenAPI spec generated at: ${outputPath}`);
  console.log(`📊 Paths: ${Object.keys(spec.paths).length}`);
  console.log(`🏷️  Tags: ${spec.tags?.map(t => t.name).join(', ')}`);
  
  return spec;
}

generateOpenAPISpec().catch(console.error);