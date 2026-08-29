# Runbook Template

> **Purpose**: Standard template for operational runbooks. Every feature must have a runbook before deployment.

---

## Feature: {{FEATURE_NAME}}

### Quick Reference
- **Owner**: {{TEAM}}
- **Feature Flag**: `{{FLAG_KEY}}`
- **Rollback**: `growthbook.updateFeature('{{FLAG_KEY}}', { defaultValue: false })`
- **Contacts**: {{PRIMARY_ONCALL}}, {{SECONDARY_ONCALL}}

---

## Architecture Overview
```
{{ARCHITECTURE_DIAGRAM}}
```

### Key Components
| Component | Technology | Health Check |
|-----------|------------|--------------|
| API | Hono + oRPC | `GET /health/ready` |
| Database | Supabase + ZenStack | `SELECT 1` |
| Auth | Supabase JWT + Cedar | `GET /health/live` |
| Offline | PowerSync | `/api/sync/status` |

---

## Deployment

### Pre-Deploy Checklist
- [ ] TypeScript compiles: `pnpm exec tsc --noEmit`
- [ ] All tests pass: `pnpm test`
- [ ] Feature flag created in GrowthBook
- [ ] Runbook reviewed by {{REVIEWER}}

### Deploy Steps
1. Merge PR to main
2. GitHub Actions builds and deploys to staging
3. Run smoke tests against staging
4. Enable feature flag for 5% (canary)
3. Monitor for 30 minutes
4. Gradually increase: 25% → 50% → 100%

### Rollback Procedure
```bash
# Immediate rollback (< 30 seconds)
growthbook.updateFeature('{{FLAG_KEY}}', { defaultValue: false })

# Or via CLI
gh workflow run rollback.yml -f feature={{FLAG_KEY}}
```

---

## Health Checks

| Endpoint | Expected | Alert Threshold |
|----------|----------|-----------------|
| `GET /health/live` | 200 OK | N/A (liveness) |
| `GET /health/ready` | 200 OK | 503 = unhealthy |
| `GET /doc` | 200 OK, valid JSON | N/A |

### Key Metrics to Monitor
| Metric | Baseline | Alert Threshold |
|--------|----------|-----------------|
| Latency p95 | {{BASELINE_P95}}ms | > {{ALERT_P95}}ms |
| Error Rate | {{BASELINE_ERROR}}% | > {{ALERT_ERROR}}% |
| Cedar Eval Time | {{BASELINE_CEDAR}}ms | > {{ALERT_CEDAR}}ms |

---

## Debugging Guide

### Common Issues

| Symptom | Likely Cause | Investigation |
|---------|--------------|---------------|
| {{SYMPTOM_1}} | {{CAUSE_1}} | {{INVESTIGATION_1}} |
| {{SYMPTOM_2}} | {{CAUSE_2}} | {{INVESTIGATION_2}} |

### Debugging Queries
```sql
-- Recent errors for this feature
SELECT * FROM audit_logs 
WHERE action LIKE '{{FEATURE_PREFIX}}.%' 
  AND created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC LIMIT 50;

-- Cedar denials
SELECT * FROM audit_logs 
WHERE action LIKE '{{FEATURE_PREFIX}}.%' 
  AND status = 403
ORDER BY created_at DESC LIMIT 20;
```

### Log Search
```bash
# Search by trace ID
grep "{{TRACE_ID}}" /var/log/sanctuary-api.log

# Search by feature
grep "{{FEATURE_PREFIX}}" /var/log/sanctuary-api.log | tail -50
```

### Sentry/PostHog Queries
- **Sentry**: Filter by `tag:feature={{FEATURE_NAME}}`
- **PostHog**: Event `orpc_procedure_called` with `procedure:{{FEATURE_PREFIX}}.*`

---

## Rollback Scenarios

| Scenario | Action | Time |
|----------|--------|------|
| High error rate | Disable feature flag | < 30s |
| High latency | Disable feature flag | < 30s |
| Data corruption | Disable + DB restore | < 1hr |
| Security issue | Disable + patch | < 1hr |

---

## Contacts

| Role | Name | Contact |
|------|------|---------|
| Primary On-Call | {{PRIMARY_ONCALL}} | {{PRIMARY_CONTACT}} |
| Secondary On-Call | {{SECONDARY_ONCALL}} | {{SECONDARY_CONTACT}} |
| Feature Owner | {{FEATURE_OWNER}} | {{OWNER_CONTACT}} |
| Platform Lead | {{PLATFORM_LEAD}} | {{LEAD_CONTACT}} |

---

## Post-Incident Process

1. **Immediate**: Disable feature flag, document timeline
2. **Within 1hr**: Root cause analysis, create incident report
3. **Within 24hr**: Post-mortem, action items, preventative measures
4. **Follow-up**: Implement fixes, update runbook, verify fix

---

*Last updated: {{DATE}} | Next review: {{NEXT_REVIEW}}*