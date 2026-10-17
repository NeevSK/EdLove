/**
 * Gurudevi Web Hexagonal Domain Layer
 *
 * Exposes inbound ports, driving hooks, and domain services.
 */

export * from './adapters/academic/academicHexagonalService';
export * from './adapters/tuition/tuitionHexagonalService';
export * from './hooks/useAcademicDomain';
export * from './hooks/useTuitionDomain';
export * from './ports/academic.port';
export * from './ports/tuition.port';
