/**
 * Gurudevi Web Hexagonal Domain Layer
 *
 * Exposes inbound ports, driving hooks, and domain services.
 */

export * from './adapters/academic/academicHexagonalService';
export * from './adapters/editorial/editorialHexagonalService';
export * from './adapters/erp/erpHexagonalService';
export * from './adapters/school/schoolHexagonalService';
export * from './adapters/tuition/tuitionHexagonalService';
export * from './adapters/workspace/workspaceHexagonalService';
export * from './hooks/useAcademicDomain';
export * from './hooks/useTuitionDomain';
export * from './hooks/useWorkspaceDomain';
export * from './ports/academic.port';
export * from './ports/editorial.port';
export * from './ports/erp.port';
export * from './ports/school.port';
export * from './ports/tuition.port';
export * from './ports/workspace.port';
