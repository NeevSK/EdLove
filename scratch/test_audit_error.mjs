import { AuditService } from './packages/platform-mcp/src/services/AuditService.js';
import { DocumentService } from './packages/platform-mcp/src/services/DocumentService.js';

const doc = new DocumentService();
const audit = new AuditService(doc);

try {
  console.log('Testing handleAuditPackageArchitecture with empty params...');
  const result = audit.handleAuditPackageArchitecture({});
  console.log('Result:', JSON.stringify(result, null, 2));
} catch (e) {
  console.error('Caught error:', e);
}

try {
  console.log('Testing handleAuditPackageArchitecture with package param...');
  const result = audit.handleAuditPackageArchitecture({
    package: 'platform-mcp',
  });
  console.log('Result:', JSON.stringify(result, null, 2));
} catch (e) {
  console.error('Caught error:', e);
}
