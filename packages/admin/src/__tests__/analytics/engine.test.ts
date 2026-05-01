import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { multiTenantAnalyticsEngine } from '../../analytics/engine';
import type { CustomReportConfig, EducationSector, MetricDefinition } from '../../analytics/types';
// Mock Supabase
jest.mock("@repo/core/api", () => ({
    supabase: {
        from: jest.fn(() => ({
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    gte: jest.fn(() => ({
                        lt: jest.fn(() => ({
                            single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
                        })),
                    })),
                })),
            })),
            order: jest.fn(() => Promise.resolve({ data: [], error: null })),
            insert: jest.fn(() => Promise.resolve({ data: {}, error: null })),
        })),
    },
}));
describe('MultiTenantAnalyticsEngine', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    describe('Data Aggregation', () => {
        it('should aggregate tenant metrics correctly', async () => {
            const tenantIds = ['tenant-1', 'tenant-2'];
            const timeRange = {
                startDate: '2024-01-01',
                endDate: '2024-03-31',
            };
            const result = await multiTenantAnalyticsEngine.aggregateTenantMetrics(tenantIds, timeRange);
            expect(result).toHaveLength(2);
            expect(result[0]!).toHaveProperty('tenantId');
            expect(result[0]!).toHaveProperty('metrics');
            expect(result[0]!).toHaveProperty('period');
        });
        it('should calculate tenant metrics with proper structure', async () => {
            const tenantIds = ['tenant-1'];
            const timeRange = {
                startDate: '2024-01-01',
                endDate: '2024-03-31',
            };
            const result = await multiTenantAnalyticsEngine.aggregateTenantMetrics(tenantIds, timeRange);
            const metrics = result[0]!.metrics;
            expect(metrics).toHaveProperty('attendance_rate');
            expect(metrics).toHaveProperty('grade_average');
            expect(metrics).toHaveProperty('enrollment_count');
            expect(typeof metrics.attendance_rate).toBe('number');
        });
    });
    describe('Tenant Comparison', () => {
        it('should compare tenant performance across metrics', async () => {
            const tenantIds = ['tenant-1', 'tenant-2', 'tenant-3'];
            const metrics = ['attendance_rate', 'grade_average'];
            const industry = 'elementary';
            const result = await multiTenantAnalyticsEngine.compareTenantPerformance(tenantIds, metrics as MetricDefinition[], industry as EducationSector);
            expect(result).toHaveLength(2); // One comparison per metric
            expect(result[0]!).toHaveProperty('metric');
            expect(result[0]!).toHaveProperty('tenants');
            expect(result[0]!.tenants).toHaveLength(3);
        });
        it('should calculate rankings and percentiles correctly', async () => {
            const tenantIds = ['tenant-1', 'tenant-2', 'tenant-3'];
            const metrics = ['attendance_rate'];
            const industry = 'elementary';
            const result = await multiTenantAnalyticsEngine.compareTenantPerformance(tenantIds, metrics as MetricDefinition[], industry as EducationSector);
            const comparison = result[0]!;
            const tenants = comparison.tenants;
            // Check that rankings are calculated
            tenants.forEach((tenant, _index) => {
                expect(tenant.rank).toBeGreaterThan(0);
                expect(tenant.rank).toBeLessThanOrEqual(3);
                expect(tenant.percentile).toBeGreaterThanOrEqual(0);
                expect(tenant.percentile).toBeLessThanOrEqual(100);
            });
        });
    });
    describe('Live Metrics', () => {
        it('should retrieve live metrics for a tenant', async () => {
            const tenantId = 'tenant-1';
            const result = await multiTenantAnalyticsEngine.getLiveMetrics(tenantId);
            expect(result).toHaveProperty('timestamp');
            expect(result).toHaveProperty('active_users');
            expect(result).toHaveProperty('concurrent_sessions');
            expect(result).toHaveProperty('api_requests_per_minute');
            expect(result).toHaveProperty('error_rate');
            expect(result).toHaveProperty('system_health');
            expect(result).toHaveProperty('resource_usage');
            expect(result!.active_users).toBeDefined();
        });
        it('should calculate system health correctly', async () => {
            const tenantId = 'tenant-1';
            const result = await multiTenantAnalyticsEngine.getLiveMetrics(tenantId);
            expect(['healthy', 'warning', 'critical']).toContain(result!.system_health);
        });
        it('should include resource usage metrics', async () => {
            const tenantId = 'tenant-1';
            const result = await multiTenantAnalyticsEngine.getLiveMetrics(tenantId);
            expect(result!.resource_usage).toHaveProperty('cpu');
            expect(result!.resource_usage).toHaveProperty('memory');
            expect(result!.resource_usage).toHaveProperty('storage');
            expect(typeof result!.resource_usage.cpu).toBe('number');
            expect(typeof result!.resource_usage.memory).toBe('number');
            expect(typeof result!.resource_usage.storage).toBe('number');
        });
    });
    describe('Custom Reports', () => {
        it('should create custom report with specified configuration', async () => {
            const config: CustomReportConfig = {
                id: 'report-1',
                name: 'Test Report',
                description: 'Test Description',
                metrics: ['attendance_rate', 'grade_average'],
                filters: [],
                chartType: 'line',
            };
            const result = await multiTenantAnalyticsEngine.createCustomReport(config);
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('configId');
            expect(result).toHaveProperty('data');
            expect(result).toHaveProperty('metadata');
            expect(result).toHaveProperty('visualizations');
            expect(result.configId).toBe(config.id);
        });
        it('should generate appropriate visualizations based on chart type', async () => {
            const config: CustomReportConfig = {
                id: 'report-1',
                name: 'Test Report',
                description: 'Test Description',
                metrics: ['attendance_rate'],
                filters: [],
                chartType: 'bar',
            };
            const result = await multiTenantAnalyticsEngine.createCustomReport(config);
            expect(result.visualizations).toHaveLength(1);
            expect(result.visualizations[0]!.type).toBe('bar');
            expect(result.visualizations[0]!).toHaveProperty('data');
            expect(result.visualizations[0]!).toHaveProperty('config');
        });
        it('should handle different chart types correctly', async () => {
            const chartTypes = ['line', 'bar', 'pie', 'scatter', 'heatmap'] as const;
            for (const chartType of chartTypes) {
                const config: CustomReportConfig = {
                    id: `report-${chartType}`,
                    name: `${chartType} Report`,
                    description: `Test ${chartType} chart`,
                    metrics: ['attendance_rate'],
                    filters: [],
                    chartType,
                };
                const result = await multiTenantAnalyticsEngine.createCustomReport(config);
                expect(result.visualizations[0]!.type).toBe(chartType);
            }
        });
    });
    describe('Pattern Recognition', () => {
        it('should detect anomalies in metrics', async () => {
            const tenantId = 'tenant-1';
            const metrics = ['attendance_rate', 'grade_average'] as MetricDefinition[];
            const result = await multiTenantAnalyticsEngine.detectAnomalies(tenantId, metrics);
            expect(Array.isArray(result)).toBe(true);
            // Each anomaly should have required properties
            result.forEach((anomaly) => {
                expect(anomaly).toHaveProperty('id');
                expect(anomaly).toHaveProperty('tenantId');
                expect(anomaly).toHaveProperty('metric');
                expect(anomaly).toHaveProperty('type');
                expect(anomaly).toHaveProperty('severity');
                expect(anomaly).toHaveProperty('description');
                expect(anomaly).toHaveProperty('detectedAt');
                expect(anomaly).toHaveProperty('value');
                expect(anomaly).toHaveProperty('expected_range');
                expect(anomaly).toHaveProperty('recommendations');
            });
        });
        it('should identify trends in data', async () => {
            const tenantId = 'tenant-1';
            const timeRange = {
                startDate: '2024-01-01',
                endDate: '2024-03-31',
            };
            const result = await multiTenantAnalyticsEngine.identifyTrends(tenantId, timeRange);
            expect(Array.isArray(result)).toBe(true);
            result.forEach((trend) => {
                expect(trend).toHaveProperty('metric');
                expect(trend).toHaveProperty('direction');
                expect(trend).toHaveProperty('strength');
                expect(trend).toHaveProperty('period');
                expect(trend).toHaveProperty('confidence');
                expect(['increasing', 'decreasing', 'stable']).toContain(trend.direction);
                expect(trend.strength).toBeGreaterThanOrEqual(0);
                expect(trend.strength).toBeLessThanOrEqual(1);
            });
        });
        it('should generate predictions based on historical data', async () => {
            const historicalData = {
                attendance_rate: [90, 92, 88, 91, 93],
                grade_average: [85, 87, 84, 86, 88],
            };
            const tenantId = 'tenant-1';
            const result = await multiTenantAnalyticsEngine.predictOutcomes(tenantId, historicalData);
            expect(Array.isArray(result)).toBe(true);
            result.forEach((prediction) => {
                expect(prediction).toHaveProperty('metric');
                expect(prediction).toHaveProperty('model');
                expect(prediction).toHaveProperty('accuracy');
                expect(prediction).toHaveProperty('confidence');
                expect(prediction).toHaveProperty('timeframe');
                expect(prediction).toHaveProperty('prediction');
                expect(prediction).toHaveProperty('factors');
                expect(prediction).toHaveProperty('generatedAt');
            });
        });
    });
    describe('Recommendations Engine', () => {
        it('should generate insights based on metrics', async () => {
            const tenantId = 'tenant-1';
            const context = { userRole: 'admin' };
            const _options = { limit: 10 };
            const result = await multiTenantAnalyticsEngine.generateRecommendations(tenantId, context);
            expect(Array.isArray(result)).toBe(true);
            result.forEach((insight) => {
                expect(insight).toHaveProperty('id');
                expect(insight).toHaveProperty('tenantId');
                expect(insight).toHaveProperty('type');
                expect(insight).toHaveProperty('priority');
                expect(insight).toHaveProperty('title');
                expect(insight).toHaveProperty('description');
                expect(insight).toHaveProperty('impact');
                expect(insight).toHaveProperty('recommendations');
                expect(insight).toHaveProperty('supporting_data');
                expect(insight).toHaveProperty('generatedAt');
                expect(['low', 'medium', 'high', 'critical']).toContain(insight.priority);
            });
        });
        it('should benchmark performance against industry standards', async () => {
            const tenantId = 'tenant-1';
            const industry = 'elementary';
            const result = await multiTenantAnalyticsEngine.benchmarkPerformance(tenantId, industry);
            expect(result).toHaveProperty('industry');
            expect(result).toHaveProperty('tenant_performance');
            expect(result).toHaveProperty('industry_trends');
            expect(result).toHaveProperty('recommendations');
            expect(result.tenant_performance).toHaveProperty('overall_rank');
            expect(result.tenant_performance).toHaveProperty('total_tenants');
            expect(result.tenant_performance).toHaveProperty('percentile');
            expect(result.tenant_performance).toHaveProperty('strengths');
            expect(result.tenant_performance).toHaveProperty('weaknesses');
            expect(result.tenant_performance).toHaveProperty('opportunities');
        });
    });
    describe('Performance', () => {
        it('should handle large datasets efficiently', async () => {
            const tenantIds = Array(100)
                .fill(null)
                .map((_, i) => `tenant-${i}`);
            const timeRange = {
                startDate: '2024-01-01',
                endDate: '2024-03-31',
            };
            const startTime = performance.now();
            const result = await multiTenantAnalyticsEngine.aggregateTenantMetrics(tenantIds, timeRange);
            const endTime = performance.now();
            expect(result).toHaveLength(100);
            expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
        });
        it('should handle concurrent requests', async () => {
            const tenantIds = ['tenant-1', 'tenant-2', 'tenant-3'];
            const timeRange = {
                startDate: '2024-01-01',
                endDate: '2024-03-31',
            };
            const promises = tenantIds.map((tenantId) => multiTenantAnalyticsEngine.aggregateTenantMetrics([tenantId], timeRange));
            const startTime = performance.now();
            const results = await Promise.all(promises);
            const endTime = performance.now();
            expect(results).toHaveLength(3);
            expect(endTime - startTime).toBeLessThan(3000); // Should complete within 3 seconds
        });
    });
    describe('Error Handling', () => {
        it('should handle database errors gracefully', async () => {
            // Mock a database error
            const { supabase } = require("@repo/core/api");
            supabase.from.mockImplementation(() => ({
                select: jest.fn(() => ({
                    eq: jest.fn(() => ({
                        single: jest.fn(() => Promise.resolve({
                            data: null,
                            error: { message: 'Database connection failed' },
                        })),
                    })),
                })),
            }));
            await expect(multiTenantAnalyticsEngine.aggregateTenantMetrics(['tenant-1'], {
                startDate: '2024-01-01',
                endDate: '2024-03-31',
            })).rejects.toThrow();
        });
        it('should validate input parameters', async () => {
            const invalidTenantIds = '';
            const timeRange = {
                startDate: '2024-01-01',
                endDate: '2024-03-31',
            };
            await expect(multiTenantAnalyticsEngine.aggregateTenantMetrics([invalidTenantIds], timeRange)).rejects.toThrow();
        });
    });
});
