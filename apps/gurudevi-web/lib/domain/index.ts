/**
 * Gurudevi Web Domain Layer
 *
 * Exposes core domain services, driving hooks, and domain modules.
 */

// Consolidated Domain Modules
export * from './classroomDomain';
export * from './guardianDomain';
export * from './principalDomain';

// Core Substrate Adapters (Tier 3)
export * from './adapters/academic/academic.adapter';
export * from './adapters/editorial/editorial.adapter';
export * from './adapters/erp/erp.adapter';
export * from './adapters/school/school.adapter';
export * from './adapters/tuition/tuition.adapter';
export * from './adapters/workspace/workspace.adapter';

// Driving Hooks
export * from './hooks/useAcademicDomain';
export * from './hooks/useTuitionDomain';
export * from './hooks/useWorkspaceDomain';

// Substrate Inbound Ports
export * from './ports/academic.port';
export * from './ports/editorial.port';
export * from './ports/erp.port';
export * from './ports/school.port';
export * from './ports/tuition.port';
export * from './ports/workspace.port';
