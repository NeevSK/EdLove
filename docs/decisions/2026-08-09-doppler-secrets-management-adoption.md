---
title: "Doppler Secrets Management Adoption"
status: "active"
created: 2026-08-09
updated: 2026-08-09
author: "Naveen"
scribe: "Antigravity"
tags: [secrets, infrastructure, security, adr]
---

# ADR: Doppler Secrets Management Adoption

## Status

**Accepted**

## Context

The Polymath Platform currently manages secrets and environment configuration through a combination of:
- `.env` files checked into git (with placeholder values)
- `.env.example` files as templates
- Manual environment variable management in CI/CD
- Local development using hardcoded or manually managed .env files

This approach presents several challenges:
- **Security Risk**: Potential for accidental commits of real secrets
- **Inconsistency**: Different environments may have mismatched secret configurations
- **No Audit Trail**: Limited visibility into who accessed/modified secrets
- **Access Control**: Difficulty managing who has access to production secrets
- **Secret Sprawl**: Secrets scattered across multiple locations and services
- **Rotation Difficulty**: No automated secret rotation capabilities
- **Onboarding Friction**: New developers must manually configure multiple .env files

Additionally, the platform requires environment isolation across:
- **dev**: Local development and feature development
- **staging**: Pre-production testing and QA
- **prod**: Live production deployments
- **next**: Next-generation features and experimental deployments

## Decision

We will adopt **Doppler Secrets Manager** as the centralized secrets management solution for the Polymath Platform.

### Key Aspects of the Decision

1. **Centralized Secret Storage**: All secrets will be stored in Doppler with project-level organization
2. **Environment Isolation**: Separate Doppler environments (dev, staging, prod, next) with hierarchical configs
3. **CLI Integration**: Use Doppler CLI for local development and CI/CD secret injection
4. **Access Control**: Implement granular permissions and service tokens for different use cases
5. **Audit Logging**: Enable comprehensive logging of secret access and modifications
6. **Git Integration**: Remove .env files from git, use Doppler for all secret management

## Alternatives Considered

### 1. Continue with Current Approach (.env files)
**Pros**:
- No migration effort required
- Familiar to developers
- No additional tooling cost

**Cons**:
- Security risks from potential secret commits
- No audit trail or access control
- Difficult to manage across multiple environments
- High risk of secret exposure

**Rejected**: Security and operational risks outweigh convenience

### 2. AWS Secrets Manager
**Pros**:
- Native AWS integration
- Strong security features
- AWS service integration

**Cons**:
- AWS platform lock-in
- Higher cost for extensive usage
- More complex setup for non-AWS environments
- Less developer-friendly CLI experience

**Rejected**: Platform lock-in and complexity for mixed infrastructure

### 3. HashiCorp Vault
**Pros**:
- Highly customizable
- Strong security features
- Enterprise-grade capabilities

**Cons**:
- High operational complexity
- Requires infrastructure maintenance
- Steeper learning curve
- Overkill for current needs

**Rejected**: Operational complexity and maintenance overhead

### 4. SOPS (Mozilla Secrets Operations)
**Pros**:
- Open source
- Git-native workflow
- No external service dependency

**Cons**:
- Still requires encrypted files in git
- Limited access control capabilities
- No centralized dashboard
- More complex for team collaboration

**Rejected**: Limited access control and still requires git storage

### 5. Doppler (Chosen Solution)
**Pros**:
- Developer-friendly CLI and dashboard
- Strong access control and audit logging
- Environment isolation with hierarchical configs
- Excellent CI/CD integration
- AI agent support (MCP server)
- Reasonable pricing model
- No platform lock-in

**Cons**:
- External service dependency
- Learning curve for team
- Migration effort required

**Accepted**: Best balance of security, developer experience, and operational efficiency

## Consequences

### Positive

1. **Enhanced Security**: Centralized secret storage with access controls and audit logging
2. **Improved Developer Experience**: Single source of truth for secrets across environments
3. **Better Compliance**: Audit trails for secret access and modifications
4. **Reduced Risk**: Elimination of accidental secret commits to git
5. **Operational Efficiency**: Easier secret rotation and management
6. **Environment Isolation**: Clear separation between dev, staging, prod, and next environments
7. **AI Agent Support**: Doppler's MCP server enables secure secret access for AI agents
8. **Cost Effective**: User-based pricing with no additional cost for non-human identities

### Negative

1. **Migration Effort**: Initial work to migrate existing secrets to Doppler
2. **Learning Curve**: Team needs to learn Doppler CLI and workflows
3. **External Dependency**: reliance on Doppler service availability
4. **Cost**: Subscription cost for Doppler service (though reasonable)

### Mitigation Strategies

1. **Migration**: Use Doppler's import functionality to bulk-import existing .env files
2. **Training**: Comprehensive documentation and team training sessions
3. **Backup**: Maintain export of critical secrets during transition period
4. **Cost**: Doppler's user-based pricing scales with team size, not secret count

## Implementation Plan

### Phase 1: Setup and Configuration (Week 1)
- [ ] Create Doppler account and workspace
- [ ] Set up project structure (polymath-platform)
- [ ] Configure environments (dev, staging, prod, next)
- [ ] Create hierarchical configs for each environment
- [ ] Install Doppler CLI on developer machines

### Phase 2: Secret Migration (Week 2)
- [ ] Audit existing .env files across all apps
- [ ] Import secrets to Doppler using bulk upload
- [ ] Configure secret visibility and access controls
- [ ] Remove .env files from git (add to .gitignore)
- [ ] Update .env.example files with Doppler instructions

### Phase 3: Local Development Integration (Week 3)
- [ ] Create doppler.yaml configuration files
- [ ] Update package.json scripts to use `doppler run`
- [ ] Configure per-app Doppler setup for monorepo
- [ ] Test local development workflows

### Phase 4: CI/CD Integration (Week 4)
- [ ] Create Doppler service tokens for each environment
- [ ] Add service tokens to GitHub Actions secrets
- [ ] Update GitHub Actions workflows to use Doppler
- [ ] Test staging deployment with Doppler
- [ ] Test production deployment with Doppler

### Phase 5: App-Specific Integration (Week 5)
- [ ] Update Gurudevi Mobile Expo configuration
- [ ] Update Sanctuary API environment loading
- [ ] Update web applications (Next.js, etc.)
- [ ] Test all apps with Doppler secrets

### Phase 6: Documentation and Training (Week 6)
- [ ] Create comprehensive integration guide
- [ ] Document environment-specific workflows
- [ ] Train team on Doppler usage
- [ ] Create troubleshooting documentation

## References

- [Doppler Documentation](https://docs.doppler.com)
- [Doppler CLI GitHub](https://github.com/DopplerHQ/cli)
- [Security Best Practices](https://docs.doppler.com/docs/security-best-practices)
- [Doppler Integration Guide](/docs/infra/doppler-secrets-management-guide.md)

## Related Decisions

- [docs-source-of-truth-and-feature-rollout-boundaries](../decisions/2026-06-20-docs-source-of-truth-and-feature-rollout-boundaries.md) - Establishes documentation authority and rollout boundaries
- [route-onboarding-through-api](../decisions/2026-06-26-route-onboarding-through-api.md) - API-driven onboarding approach

## Review Schedule

This ADR should be reviewed:
- **3 months after implementation** (2026-11-09) - Assess adoption and identify issues
- **6 months after implementation** (2027-02-09) - Full effectiveness review
- **Annually** (2027-08-09) - Strategic review of secrets management approach

---

**Decision Date**: 2026-08-09  
**Decision Maker**: Naveen  
**Status**: Accepted and Active
