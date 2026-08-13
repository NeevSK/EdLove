---
title: "Doppler Secrets Management Integration Guide"
status: "active"
created: 2026-08-09
updated: 2026-08-09
author: "Naveen"
scribe: "Antigravity"
tags: [secrets, infrastructure, security, doppler]
---

# Doppler Secrets Management Integration Guide

This guide provides background documentation for integrating Doppler Secrets Manager across the Polymath Platform environments. The current operational source of truth is [`doppler-toolchain.md`](./doppler-toolchain.md); examples below that download files are migration or emergency procedures only.

---

## Overview

Doppler provides centralized secrets management with:
- **Environment isolation**: Separate configs for dev, staging, prod, and next environments
- **Audit logging**: Full traceability of secret access and changes
- **Version control**: Rollback capabilities for secret changes
- **Access control**: Granular permissions for team members and service accounts
- **CI/CD integration**: Native support for GitHub Actions and other deployment pipelines
- **Local development**: Secure local development without committing .env files

---

## Architecture

### Environment Hierarchy

```
polymath-platform (Doppler Project)
├── dev (Environment)
│   ├── prd (Config - Production-like development)
│   ├── dev (Config - Standard development)
│   └── [developer-name] (Config - Personal dev configs)
├── staging (Environment)
│   ├── prd (Config - Staging production)
│   └── stg (Config - Staging testing)
├── prod (Environment)
│   ├── prd (Config - Production)
│   └── dr (Config - Disaster recovery)
└── next (Environment)
    ├── prd (Config - Next environment production)
    └── exp (Config - Experimental features)
```

### Secret Categories

1. **Database Secrets**: Connection strings, credentials, SSL certificates
2. **API Keys**: Third-party service integrations (Supabase, PowerSync, GrowthBook, etc.)
3. **Authentication**: OAuth client IDs, JWT secrets, signing keys
4. **Infrastructure**: Cloud provider credentials, deployment tokens
5. **Application-specific**: Feature flags, configuration values

---

## Installation & Setup

### 1. Install Doppler CLI

#### Windows (PowerShell)
```powershell
# Using PowerShell
iex (iwr -useb https://cli.doppler.com/install.ps1)

# Or using winget
winget install Doppler.Doppler
```

#### macOS/Linux
```bash
# Using curl
curl -fsSL https://cli.doppler.com/install.sh | sh

# Or using homebrew
brew install dopplerhq/cli/doppler
```

### 2. Authenticate with Doppler

```bash
# Login to Doppler (opens browser for authentication)
doppler login

# Scope authentication to specific directory (recommended for monorepos)
doppler login --scope=./
```

### 3. Configure Project Access

```bash
# Navigate to project root
cd C:\Users\Naween\projects\polymath-platform

# Setup Doppler project and config
doppler setup

# Or configure manually with specific project/config
doppler configure set project polymath-platform
doppler configure set config dev
```

### 4. Create doppler.yaml (Optional but Recommended)

Create `doppler.yaml` at the monorepo root for automated setup:

```yaml
setup:
  - project: polymath-platform
    config: dev
```

For per-app configuration in monorepo:

```yaml
# apps/gurudevi-mobile/doppler.yaml
setup:
  - project: polymath-platform
    config: dev

# apps/sanctuary-api/doppler.yaml  
setup:
  - project: polymath-platform
    config: dev
```

---

## Environment Configuration Strategy

### Development Environment (dev)

**Purpose**: Local development and feature development

**Config Structure**:
- `dev` - Default development config shared across team
- `[developer-name]` - Personal development configs (one per developer)

**Key Secrets**:
- Local database connections
- Development API keys
- Feature flags for testing
- Mock service credentials

**Access**: All developers have read/write access to their personal configs, read access to shared dev config.

### Staging Environment (staging)

**Purpose**: Pre-production testing and QA

**Config Structure**:
- `stg` - Staging configuration
- `prd` - Production-like staging configuration

**Key Secrets**:
- Staging database connections
- Staging API keys (Supabase staging project, etc.)
- Real service credentials with staging scopes
- Analytics and monitoring (staging environments)

**Access**: Limited to core team, QA engineers, and automated deployment systems.

### Production Environment (prod)

**Purpose**: Live production deployments

**Config Structure**:
- `prd` - Production configuration
- `dr` - Disaster recovery configuration

**Key Secrets**:
- Production database connections
- Production API keys and certificates
- Payment processing credentials
- High-value secrets with strict access controls

**Access**: Highly restricted. Only deployment systems and on-call engineers. Requires approval for access changes.

### Next Environment (next)

**Purpose**: Next-generation features and experimental deployments

**Config Structure**:
- `exp` - Experimental configuration
- `prd` - Next environment production configuration

**Key Secrets**:
- Next environment database connections
- Beta service credentials
- Experimental feature flags
- A/B testing configurations

**Access**: Development team and product stakeholders for experimental features.

---

## Secret Management Workflows

### 1. Adding New Secrets

#### Via CLI
```bash
# Set a secret
doppler secrets set API_KEY "your-api-key-here"

# Set multiline secret (e.g., private key)
doppler secrets set PRIVATE_KEY <<EOF
-----BEGIN PRIVATE KEY-----
your-private-key-content
-----END PRIVATE KEY-----
EOF

# Set secret for specific environment
doppler secrets set --config staging API_KEY "staging-api-key"
```

#### Via Dashboard
1. Navigate to https://dashboard.doppler.com
2. Select project: `polymath-platform`
3. Select environment and config
4. Click "Add Secret" and enter name/value
5. Set visibility and access controls

### 2. Importing Existing Secrets

#### From .env File
```bash
# Import from existing .env file
doppler secrets upload .env

# Import for specific config
doppler secrets upload --config staging .env.staging
```

#### From JSON/YAML
```bash
# Import from JSON
doppler secrets upload secrets.json

# Import from YAML
doppler secrets upload secrets.yaml
```

### 3. Accessing Secrets in Development

#### Running Commands with Secrets
```bash
# Run a command with secrets injected as environment variables
doppler run -- npm run dev

# Run with specific config
doppler run --config staging -- npm run test

# Run with mounted .env file (more secure)
doppler run --mount .env -- npm start
```

#### Downloading Secrets
Normal development should use `doppler run -- <command>` and should not write
secret values to the filesystem. If a one-time migration requires a file,
use a temporary location, keep it outside the repository, and remove it after
the import.

### 4. Managing Secret Versions

```bash
# View secret history
doppler secrets log API_KEY

# Rollback to previous version
doppler secrets rollback API_KEY --version 3

# Compare versions
doppler secrets diff API_KEY --version 3 --version 5
```

---

## CI/CD Integration

### GitHub Actions

#### 1. Create Doppler Service Token

1. Go to Doppler Dashboard → Project → Settings → Service Tokens
2. Create token for specific environment/config (e.g., `staging-stg`)
3. Copy the token (format: `dp.st.token-name.random-string`)

#### 2. Add to GitHub Secrets

1. Go to Repository → Settings → Secrets and variables → Actions
2. Add secret: `DOPPLER_TOKEN_STAGING` with the service token value
3. Repeat for each environment: `DOPPLER_TOKEN_PROD`, `DOPPLER_TOKEN_DEV`

#### 3. Update GitHub Actions Workflow

```yaml
name: Deploy to Staging

on:
  push:
    branches: [main-dev]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Doppler CLI
        run: |
          curl -fsSL https://cli.doppler.com/install.sh | sh
          
      - name: Deploy with Doppler
        run: |
          doppler run --config staging -- npm run deploy
        env:
          DOPPLER_TOKEN: ${{ secrets.DOPPLER_TOKEN_STAGING }}
```

### Environment-Specific Deployment Scripts

```bash
# scripts/deploy-staging.sh
#!/bin/bash
doppler run --config staging -- npm run build
doppler run --config staging -- npm run deploy

# scripts/deploy-prod.sh  
#!/bin/bash
doppler run --config prod -- npm run build
doppler run --config prod -- npm run deploy
```

---

## App-Specific Integration

### Gurudevi Mobile (React Native/Expo)

#### 1. Update .env.example
Remove placeholder values and add Doppler instructions:

```bash
# Supabase Configuration
# These secrets are managed in Doppler
# Run: doppler run -- npx expo start
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

# Other secrets...
```

#### 2. Update package.json Scripts
```json
{
  "scripts": {
    "start": "doppler run -- npx expo start",
    "start:staging": "doppler run --config staging -- npx expo start",
    "start:prod": "doppler run --config prod -- npx expo start",
    "build:ios": "doppler run -- npx expo run:ios",
    "build:android": "doppler run -- npx expo run:android"
  }
}
```

#### 3. EAS Build Integration
```bash
# Build with Doppler secrets
doppler run -- eas build --platform ios --profile production
```

### Sanctuary API (Node.js/Hono)

#### 1. Environment Loading
```typescript
// src/load-env.ts
import { config } from 'dotenv';

// Load from Doppler or fallback to .env
if (process.env.DOPPLER_TOKEN) {
  // In CI/CD, secrets are injected by doppler run
  config();
} else {
  // Local development - attempt Doppler CLI
  const { execSync } = require('child_process');
  try {
    const envOutput = execSync('doppler secrets download --format json', { encoding: 'utf-8' });
    const envVars = JSON.parse(envOutput);
    Object.entries(envVars).forEach(([key, value]) => {
      process.env[key] = value;
    });
  } catch (error) {
    console.warn('Doppler CLI not available, falling back to .env');
    config();
  }
}
```

#### 2. Server Startup
```typescript
// src/index.ts
import './load-env';
import { serve } from '@hono/node-server';

// Your app will now have access to Doppler secrets
const port = parseInt(process.env.PORT || '3000');
serve(app, port);
```

### Web Applications

#### 1. Next.js Integration
```javascript
// next.config.js
const { execSync } = require('child_process');

let env = {};
try {
  const envOutput = execSync('doppler secrets download --format json', { encoding: 'utf-8' });
  env = JSON.parse(envOutput);
} catch (error) {
  console.warn('Not using Doppler, falling back to local .env');
}

module.exports = {
  env: {
    // Map Doppler secrets to Next.js env vars
    NEXT_PUBLIC_API_URL: env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL,
    DATABASE_URL: env.DATABASE_URL || process.env.DATABASE_URL,
  },
};
```

---

## Security Best Practices

### 1. Access Control

- **Principle of Least Privilege**: Grant minimum required access
- **Service Tokens**: Use scoped service tokens for CI/CD, not personal tokens
- **Regular Audits**: Review access logs monthly
- **Token Rotation**: Rotate service tokens quarterly or after security incidents

### 2. Secret Visibility

- **Human-Readable**: Secrets developers need to see (API endpoints, config values)
- **Machine-Only**: Secrets consumed by AI agents or automated systems (never visible to humans)
- **Restricted**: High-value secrets (production keys) with limited visibility

### 3. Secret Rotation

- **Automated Rotation**: Enable for services that support it (database credentials, API keys)
- **Manual Rotation**: For services without automated rotation
- **Rollback Plan**: Always have rollback capability before rotation

### 4. Audit Logging

- **Monitor Access**: Regular review of secret access logs
- **Anomaly Detection**: Alert on unusual access patterns
- **Compliance**: Maintain logs for required retention periods

---

## Troubleshooting

### Common Issues

#### 1. "doppler: command not found"
**Solution**: Ensure Doppler CLI is installed and in your PATH

#### 2. "Authentication failed"
**Solution**: Run `doppler login` again to refresh authentication

#### 3. "Config not found"
**Solution**: Run `doppler setup` to configure project/config, or specify manually with `--project` and `--config` flags

#### 4. Secrets not loading in app
**Solution**: 
- Verify secret names match between Doppler and app
- Check that `doppler run` is being used (not just running the command directly)
- Ensure correct config is selected with `--config` flag

#### 5. CI/CD deployment fails
**Solution**:
- Verify service token is correct and has proper permissions
- Check that GitHub secret is properly configured
- Ensure Doppler CLI is installed in the workflow

### Debug Mode

```bash
# Enable debug output
doppler run --debug -- npm run dev

# Verbose output for troubleshooting
doppler secrets download --debug --format json
```

---

## Migration Checklist

### From .env Files to Doppler

- [ ] Install Doppler CLI locally
- [ ] Create Doppler project and environments
- [ ] Import existing .env files to Doppler
- [ ] Remove .env files from git (add to .gitignore if not already)
- [ ] Update local development scripts to use `doppler run`
- [ ] Create service tokens for CI/CD
- [ ] Update GitHub Actions workflows
- [ ] Test staging deployment with Doppler
- [ ] Test production deployment with Doppler
- [ ] Remove hardcoded secrets from code
- [ ] Update documentation
- [ ] Train team on Doppler workflows

---

## Additional Resources

- [Doppler Documentation](https://docs.doppler.com)
- [Doppler CLI GitHub](https://github.com/DopplerHQ/cli)
- [Doppler Dashboard](https://dashboard.doppler.com)
- [Security Best Practices](https://docs.doppler.com/docs/security-best-practices)
- [CI/CD Integration Guide](https://docs.doppler.com/docs/ci-cd)

---

## Maintenance

This document should be updated when:
- New environments are added
- Secret management workflows change
- New security practices are implemented
- Integration patterns are updated for apps
- Troubleshooting sections need expansion

Last reviewed: 2026-08-09
Next review: 2026-11-09
