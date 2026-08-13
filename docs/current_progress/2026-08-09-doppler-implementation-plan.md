---
title: "Doppler Secrets Management Implementation Plan"
status: "active"
created: 2026-08-09
updated: 2026-08-09
author: "Naveen"
scribe: "Antigravity"
tags: [secrets, implementation, infrastructure, doppler]
---

# Doppler Secrets Management Implementation Plan

**Status**: Ready for Phase 1 - Setup and Configuration  
**Timeline**: 6 weeks  
**Priority**: High  

---

## Overview

This document outlines the step-by-step implementation plan for adopting Doppler Secrets Manager across the Polymath Platform. The implementation follows the phases outlined in the ADR `2026-08-09-doppler-secrets-management-adoption.md`.

---

## Phase 1: Doppler Account and Project Setup (Week 1)

### Objectives
- Create Doppler workspace and project structure
- Configure environments and hierarchical configs
- Set up initial access controls

### Tasks

#### 1.1 Create Doppler Workspace
- [ ] Sign up for Doppler account at https://dashboard.doppler.com
- [ ] Create workspace named "Polymath Platform"
- [ ] Configure workspace settings and team permissions
- [ ] Enable audit logging and security features

#### 1.2 Create Project Structure
- [ ] Create project `polymath-platform`
- [ ] Set up environments:
  - [ ] `dev` - Development environment
  - [ ] `staging` - Staging environment  
  - [ ] `prod` - Production environment
  - [ ] `next` - Next/experimental environment

#### 1.3 Configure Hierarchical Configs
For each environment, create the following config structure:

**Dev Environment:**
- [ ] `dev` - Shared development config
- [ ] `prd` - Production-like development config
- [ ] `[developer-name]` - Personal configs (one per developer)

**Staging Environment:**
- [ ] `stg` - Staging config
- [ ] `prd` - Production-like staging config

**Prod Environment:**
- [ ] `prd` - Production config
- [ ] `dr` - Disaster recovery config

**Next Environment:**
- [ ] `exp` - Experimental config
- [ ] `prd` - Next environment production config

#### 1.4 Configure Access Controls
- [ ] Set up team roles and permissions
- [ ] Configure who can access each environment
- [ ] Set up service token permissions for CI/CD
- [ ] Enable audit logging for all environments

### Completion Criteria
- Doppler workspace and project created
- All environments and configs configured
- Team members have appropriate access
- Audit logging enabled

---

## Phase 2: Secret Migration (Week 2)

### Objectives
- Audit existing secrets across all apps
- Import secrets to Doppler
- Configure secret visibility and access controls
- Remove .env files from git

### Tasks

#### 2.1 Audit Existing Secrets
- [ ] Collect all .env.example files from apps:
  - [ ] `apps/gurudevi-mobile/.env.example`
  - [ ] `apps/sanctuary-api/.env.example`
  - [ ] `apps/edlove-web/.env.example`
  - [ ] `apps/gurudevi-marketingWeb/.env.example`
  - [ ] `packages/platform-mcp/.env.example`
- [ ] Document all secret names and purposes
- [ ] Identify which secrets are environment-specific
- [ ] Create secret mapping document

#### 2.2 Import Secrets to Doppler
- [ ] Import secrets to `dev` config using bulk upload:
  ```bash
  doppler secrets upload .env.example --project polymath-platform --config dev
  ```
- [ ] Repeat for each environment's config
- [ ] Verify all secrets imported correctly
- [ ] Update secret values from placeholders to actual values

#### 2.3 Configure Secret Categories
Organize secrets by category with appropriate visibility:

**Database Secrets:**
- [ ] EXPO_PUBLIC_SUPABASE_URL
- [ ] EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- [ ] DATABASE_URL (for Sanctuary API)
- [ ] Set visibility as "restricted" for production

**API Keys:**
- [ ] EXPO_PUBLIC_INNGEST_EVENT_KEY
- [ ] EXPO_PUBLIC_POWERSYNC_URL
- [ ] EXPO_PUBLIC_GROWTHBOOK_CLIENT_KEY
- [ ] EXPO_PUBLIC_POSTHOG_API_KEY
- [ ] EXPO_PUBLIC_SENTRY_DSN
- [ ] Set visibility based on sensitivity

**Authentication:**
- [ ] EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
- [ ] EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
- [ ] EXPO_PUBLIC_SNAPSHOT_SIGNING_PUBLIC_KEY
- [ ] Set visibility as "restricted"

**Infrastructure:**
- [ ] Any cloud provider credentials
- [ ] Deployment tokens
- [ ] Set visibility as "machine-only" where appropriate

#### 2.4 Clean Up Git Repository
- [ ] Remove any real .env files from git history (if accidentally committed)
- [ ] Ensure .env is in .gitignore (already present)
- [ ] Update .env.example files with Doppler instructions
- [ ] Add comment to .env.example files:
  ```bash
  # These secrets are managed in Doppler
  # Run: doppler run -- <your-command>
  # Normal development: doppler run -- <your-command>
  ```

### Completion Criteria
- All existing secrets migrated to Doppler
- Secret visibility and access controls configured
- .env files removed from git
- .env.example files updated with Doppler instructions

---

## Phase 3: Local Development Integration (Week 3)

### Objectives
- Test Doppler CLI authentication
- Update local development workflows
- Configure per-app Doppler setup

### Tasks

#### 3.1 Developer Authentication
- [ ] Run `doppler login` for each developer
- [ ] Test authentication with `doppler configure view`
- [ ] Verify project access with `doppler setup`

#### 3.2 Test doppler.yaml Configuration
- [ ] Test root-level doppler.yaml:
  ```bash
  cd C:\Users\Naween\projects\polymath-platform
  doppler setup
  ```
- [ ] Test per-app doppler.yaml files:
  ```bash
  cd apps/gurudevi-mobile
  doppler setup
  ```
- [ ] Verify correct project/config selection

#### 3.3 Update Package.json Scripts
Update package.json scripts to use `doppler run`:

**Root package.json:**
- [ ] Update dev scripts to use Doppler
- [ ] Add environment-specific scripts:
  ```json
  {
    "scripts": {
      "dev": "doppler run -- turbo run dev",
      "dev:staging": "doppler run --config staging -- turbo run dev",
      "dev:prod": "doppler run --config prod -- turbo run dev"
    }
  }
  ```

**Gurudevi Mobile package.json:**
- [ ] Update Expo scripts:
  ```json
  {
    "scripts": {
      "start": "doppler run -- npx expo start",
      "start:staging": "doppler run --config staging -- npx expo start",
      "ios": "doppler run -- npx expo run:ios",
      "android": "doppler run -- npx expo run:android"
    }
  }
  ```

**Sanctuary API package.json:**
- [ ] Update server scripts:
  ```json
  {
    "scripts": {
      "dev": "doppler run -- tsx watch src/index.ts",
      "dev:staging": "doppler run --config staging -- tsx watch src/index.ts"
    }
  }
  ```

#### 3.4 Test Local Development
- [ ] Test starting Gurudevi Mobile with Doppler
- [ ] Test starting Sanctuary API with Doppler
- [ ] Test starting web applications with Doppler
- [ ] Verify all secrets are loaded correctly

### Completion Criteria
- All developers can authenticate with Doppler
- doppler.yaml files work correctly
- Package.json scripts updated and tested
- Local development works with Doppler secrets

---

## Phase 4: CI/CD Integration (Week 4)

### Objectives
- Create Doppler service tokens
- Integrate with GitHub Actions
- Test staging and production deployments

### Tasks

#### 4.1 Create Service Tokens
- [ ] Create service token for staging: `dp.st.staging.stg`
- [ ] Create service token for production: `dp.st.prod.prd`
- [ ] Create service token for next environment: `dp.st.next.exp`
- [ ] Copy tokens and add to GitHub repository secrets

#### 4.2 Update GitHub Actions Workflows
Identify and update GitHub Actions workflows:

**Existing Workflows:**
- [ ] Find all `.github/workflows/*.yml` files
- [ ] Identify workflows that need secrets
- [ ] Add Doppler setup step:
  ```yaml
  - name: Install Doppler CLI
    run: |
      curl -fsSL https://cli.doppler.com/install.sh | sh
  ```
- [ ] Replace secret references with Doppler run:
  ```yaml
  - name: Deploy
    run: doppler run --config staging -- npm run deploy
    env:
      DOPPLER_TOKEN: ${{ secrets.DOPPLER_TOKEN_STAGING }}
  ```

#### 4.3 Test Staging Deployment
- [ ] Deploy to staging using Doppler secrets
- [ ] Verify all services start correctly
- [ ] Test API endpoints with staging secrets
- [ ] Verify database connections work

#### 4.4 Test Production Deployment
- [ ] Deploy to production using Doppler secrets
- [ ] Verify all services start correctly
- [ ] Test API endpoints with production secrets
- [ ] Monitor for any issues

#### 4.5 Configure Environment Protection
- [ ] Set up branch protection rules
- [ ] Require approval for production deployments
- [ ] Configure Doppler environment restrictions
- [ ] Enable Doppler audit alerts

### Completion Criteria
- Service tokens created and configured
- GitHub Actions workflows updated
- Staging deployment tested and working
- Production deployment tested and working
- Environment protection rules configured

---

## Phase 5: App-Specific Integration (Week 5)

### Objectives
- Update app-specific configuration files
- Test all applications with Doppler
- Handle special cases for each app

### Tasks

#### 5.1 Gurudevi Mobile Integration
- [ ] Update Expo configuration to work with Doppler
- [ ] Test EAS builds with Doppler:
  ```bash
  doppler run -- eas build --platform ios --profile production
  ```
- [ ] Update environment loading in React Native code
- [ ] Test on physical device with Doppler secrets

#### 5.2 Sanctuary API Integration
- [ ] Update environment loading code (`src/load-env.ts`)
- [ ] Implement Doppler fallback logic:
  ```typescript
  // Fallback to Doppler CLI if DOPPLER_TOKEN not set
  try {
    const envOutput = execSync('doppler secrets download --format json');
    // Parse and load environment variables
  } catch (error) {
    // Fallback to .env
  }
  ```
- [ ] Test API with Doppler secrets
- [ ] Verify database connections

#### 5.3 Web Applications Integration
- [ ] Update Next.js configuration for web apps
- [ ] Update environment loading for non-Next.js apps
- [ ] Test all web applications with Doppler
- [ ] Verify API integrations work

#### 5.4 Platform MCP Integration
- [ ] Update MCP server configuration
- [ ] Test MCP server with Doppler secrets
- [ ] Verify AI agent access to secrets

### Completion Criteria
- All apps updated to work with Doppler
- EAS builds work with Doppler
- All apps tested and working
- MCP server integration verified

---

## Phase 6: Documentation and Training (Week 6)

### Objectives
- Complete documentation
- Train team members
- Create troubleshooting guides

### Tasks

#### 6.1 Complete Documentation
- [ ] Verify `docs/infra/doppler-secrets-management-guide.md` is complete
- [ ] Add app-specific examples to guide
- [ ] Create quick start guide for developers
- [ ] Document common workflows

#### 6.2 Team Training
- [ ] Schedule team training session
- [ ] Walk through Doppler dashboard
- [ ] Demonstrate CLI usage
- [ ] Show CI/CD integration
- [ ] Provide hands-on practice

#### 6.3 Create Troubleshooting Guide
- [ ] Document common issues and solutions
- [ ] Create debugging procedures
- [ ] Add contact information for support
- [ ] Document emergency procedures

#### 6.4 Security Review
- [ ] Conduct security review of implementation
- [ ] Verify access controls are appropriate
- [ ] Review audit logs
- [ ] Test secret rotation procedures

#### 6.5 Go-Live Preparation
- [ ] Create rollback plan
- [ ] Prepare emergency contacts
- [ ] Set up monitoring and alerts
- [ ] Document handoff procedures

### Completion Criteria
- Documentation complete and reviewed
- Team trained on Doppler usage
- Troubleshooting guide created
- Security review completed
- Ready for production use

---

## Rollback Plan

If issues arise during implementation, use this rollback plan:

### Phase 1-2 Rollback
- If Doppler setup fails: Continue using .env files
- If secret migration fails: Restore from exported secrets backup

### Phase 3 Rollback
- If local development breaks: Remove `doppler run` from package.json scripts
- If authentication fails: Use manual .env files temporarily

### Phase 4 Rollback
- If CI/CD breaks: Revert GitHub Actions workflows
- If deployment fails: Use manual secrets in GitHub

### Phase 5 Rollback
- If app integration fails: Revert app-specific changes
- If builds fail: Use manual secret injection

### Phase 6 Rollback
- If training issues: Provide additional training sessions
- If documentation issues: Update based on feedback

---

## Success Metrics

- **Security**: No secrets in git repository
- **Efficiency**: Reduced time to onboard new developers
- **Reliability**: Consistent secrets across environments
- **Compliance**: Audit trail for all secret access
- **Adoption**: All team members using Doppler for local development

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Doppler service outage | Low | High | Maintain local backup of critical secrets |
| Team resistance to change | Medium | Medium | Provide comprehensive training and support |
| CI/CD integration issues | Medium | High | Thorough testing in staging before production |
| Secret migration errors | Low | High | Export and backup secrets before migration |
| Cost overruns | Low | Medium | Monitor usage and optimize as needed |

---

## Next Steps

1. **Immediate**: Create Doppler account and workspace
2. **Week 1**: Complete Phase 1 setup
3. **Week 2**: Begin secret migration
4. **Ongoing**: Monitor progress and adjust timeline as needed

---

**Last Updated**: 2026-08-09  
**Owner**: Naveen  
**Status**: Ready for Phase 1 Execution
