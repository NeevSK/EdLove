/**
 * Gurudevi Web Domain Layer
 *
 * Exposes core domain services, driving hooks, and domain modules.
 */

// Consolidated Domain Modules
export * from './classroomDomain';
export * from './guardianDomain';
export * from './principalDomain';

// Core Substrate Services & Adapters
export * from './adapters/academic/academicHexagonalService';
export * from './adapters/editorial/editorialHexagonalService';
export * from './adapters/erp/erpHexagonalService';
export * from './adapters/school/schoolHexagonalService';
export * from './adapters/tuition/tuitionHexagonalService';
export * from './adapters/workspace/workspaceHexagonalService';

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
