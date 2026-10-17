// Generate OpenAPI spec from oRPC router using OpenAPIGenerator
import { OpenAPIGenerator } from '@orpc/openapi';
import { unlazyRouter } from '@orpc/server';
import { writeFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function generateOpenAPISpec() {
  // Import the router dynamically
  const { router } = await import('../src/core/router.ts');

  // Unlazy the router to resolve all lazy procedures
  const unlaziedRouter = await unlazyRouter(router);

  const generator = new OpenAPIGenerator();

  const spec = await generator.generate(unlaziedRouter as any, {
    version: '3.1.0',
    base: {
      info: {
        title: 'Sanctuary API',
        version: '2026.1.0',
        description: 'Sovereign API Gateway (ZenStack v3.6.4 + Zod v4 + oRPC v2)',
      },
      servers: [
        { url: 'http://localhost:3000', description: 'Local development' },
        { url: 'https://api.gurudevi.app', description: 'Production' },
        { url: 'https://api.sanctuary.gurudevi.app', description: 'Production Sanctuary' },
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
    },
    // Include all procedures
    filter: () => true,
  });

  // Write to docs folder
  const outputPath = __dirname.replace('scripts', 'docs/api/openapi.json');
  writeFileSync(outputPath, JSON.stringify(spec, null, 2));

  console.log(`✅ OpenAPI spec generated at: ${outputPath}`);
  console.log(`📊 Paths: ${Object.keys(spec.paths || {}).length}`);
  console.log(`🏷️  Tags: ${spec.tags?.map((t) => t.name).join(', ')}`);

  return spec;
}

generateOpenAPISpec().catch(console.error);
