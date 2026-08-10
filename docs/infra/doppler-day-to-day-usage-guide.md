---
title: "Doppler CLI Day-to-Day Usage Guide"
status: "active"
created: 2026-08-09
updated: 2026-08-09
author: "Naveen"
scribe: "Antigravity"
tags: [secrets, doppler, cli, daily-usage]
---

# Doppler CLI Day-to-Day Usage Guide

This guide covers the most common Doppler CLI commands and workflows you'll use in daily development for the Polymath Platform.

---

## Essential Commands

### Authentication & Setup

```bash
# Login to Doppler (opens browser for authentication)
doppler login

# Configure project and config for current directory
doppler setup

# View current configuration
doppler configure --scope $(pwd)

# View all configurations
doppler configure --all

# Set project/config manually
doppler configure set project gurudevi-mobile
doppler configure set config dev
```

### Running Commands with Secrets

```bash
# Run a single command with Doppler secrets
doppler run -- npm run dev

# Run multiple commands
doppler run --command "npm install && npm run dev"

# Run with specific config (staging/prod)
doppler run --config staging -- npm run dev
doppler run --config prod -- npm run start

# Run with specific project
doppler run --project gurudevi-mobile --config dev -- npm run dev
```

### Managing Secrets

```bash
# Set a secret
doppler secrets set API_KEY "your-api-key"

# Set multiline secret (e.g., private key)
doppler secrets set PRIVATE_KEY <<EOF
-----BEGIN PRIVATE KEY-----
your-private-key-content
-----END PRIVATE KEY-----
EOF

# Get a secret value
doppler secrets get API_KEY

# Delete a secret
doppler secrets delete API_KEY

# List all secrets (names only)
doppler secrets download --format json | jq 'keys'

# Download secrets to file
doppler secrets download --format env > .env
doppler secrets download --format json > secrets.json
```

### Environment Management

```bash
# Switch to different environment
doppler run --config staging -- npm run dev
doppler run --config prod -- npm run start

# View available configs
doppler configs

# Create a new config
doppler configs create my-feature-branch

# Clone existing config
doppler configs clone dev my-feature-branch
```

---

## Daily Development Workflows

### Starting Development

```bash
# Option 1: Using doppler run (recommended)
cd apps/gurudevi-mobile
doppler run -- npm run dev

# Option 2: Using the setup script (Expo)
cd apps/gurudevi-mobile
npm run setup:env  # Loads Doppler secrets to .env
npm run dev       # Normal Expo start

# Option 3: Sanctuary API with automatic fallback
cd apps/sanctuary-api
npm run dev       # Automatically tries Doppler, falls back to .env
```

### Testing Different Environments

```bash
# Test with staging secrets
doppler run --config staging -- npm run test

# Test with production secrets (careful!)
doppler run --config prod -- npm run test

# Create personal dev config
doppler configs create dev-naveen
doppler run --config dev-naveen -- npm run dev
```

### Building for Deployment

```bash
# Build for staging
doppler run --config staging -- npm run build

# Build for production
doppler run --config prod -- npm run build

# EAS build with Doppler
cd apps/gurudevi-mobile
doppler run -- eas build --profile production --platform android
```

### Updating Secrets

```bash
# Quick secret update
doppler secrets set NEW_FEATURE_FLAG "true"

# Update multiple secrets from file
doppler secrets upload .env.staging

# Update secret for specific environment
doppler secrets set --config staging API_KEY "staging-key"

# View secret history
doppler secrets log API_KEY

# Rollback to previous version
doppler secrets rollback API_KEY --version 3
```

---

## Troubleshooting Common Issues

### "Doppler not available" Error

**Problem**: Your fallback logic shows Doppler isn't working.

**Solutions**:
```bash
# Check if Doppler CLI is installed
doppler --version

# Check authentication
doppler configure

# Re-authenticate if needed
doppler login

# Check project/config setup
doppler configure --scope $(pwd)

# Verify secrets exist
doppler secrets get DATABASE_URL
```

### Secrets Not Loading in Application

**Problem**: Your app isn't seeing the secrets.

**Solutions**:
```bash
# Test Doppler run directly
doppler run -- node -e "console.log(process.env.DATABASE_URL)"

# Check if secrets exist in Doppler
doppler secrets download --format json | jq

# Verify correct project/config
doppler configure --scope $(pwd)

# Try with explicit flags
doppler run --project gurudevi-mobile --config dev -- npm run dev
```

### "Token not found in system keyring" Error

**Problem**: CLI token out of sync with system keyring.

**Solution**:
```bash
# Reset CLI configuration (last resort)
doppler configure reset

# Re-authenticate
doppler login
doppler setup
```

### Inherited Configs Not Showing

**Problem**: Some inherited secrets don't appear in `doppler run`.

**Solution**:
```bash
# This is a known Doppler bug. Workaround:
# Add a dummy secret to trigger refresh
doppler secrets set SAVE_STUB "timestamp"

# Remove it after config refresh
doppler secrets delete SAVE_STUB
```

### Wrong Environment Being Used

**Problem**: Using dev secrets when you wanted staging.

**Solution**:
```bash
# Check current config
doppler configure --scope $(pwd)

# Explicitly specify environment
doppler run --config staging -- npm run dev

# Or change default for directory
doppler configure set config staging
```

---

## Best Practices

### Security

1. **Never commit .env files**: They're gitignored for a reason
2. **Use doppler run**: Prefer injection over downloading when possible
3. **Service tokens for CI/CD**: Never use personal tokens in automation
4. **Regular rotation**: Rotate sensitive keys periodically
5. **Audit access**: Review who has access to production secrets

### Workflow

1. **Personal configs**: Create personal dev configs for testing
2. **Feature branches**: Clone dev config for feature work
3. **Staging first**: Always test in staging before production
4. **Document changes**: Note secret changes in PR descriptions
5. **Monitor usage**: Check Doppler dashboard for unusual access

### Monorepo Management

```bash
# Root-level configuration
cd /path/to/polymath-platform
doppler setup  # Configure for entire workspace

# Per-app configuration
cd apps/gurudevi-mobile
doppler setup  # App-specific override

# Use explicit flags when needed
doppler run --project gurudevi-mobile --config dev -- npm run dev
```

---

## Quick Reference

### Common Command Patterns

```bash
# Development
doppler run -- npm run dev
doppler run -- pnpm run dev
doppler run -- yarn dev

# Testing
doppler run -- npm test
doppler run -- npm run test:watch

# Building
doppler run -- npm run build
doppler run -- npm run build:prod

# Deployment
doppler run -- npm run deploy
doppler run --config staging -- npm run deploy
doppler run --config prod -- npm run deploy
```

### Environment Switching

```bash
# Development
doppler run --config dev -- npm run dev

# Staging
doppler run --config staging -- npm run dev

# Production
doppler run --config prod -- npm run start

# Custom environment
doppler run --config my-feature -- npm run dev
```

### Secret Management

```bash
# Quick check
doppler secrets get DATABASE_URL

# List all
doppler secrets download --format json | jq 'keys'

# Update
doppler secrets set NEW_VALUE "test"

# Delete
doppler secrets delete OLD_VALUE
```

---

## Integration-Specific Notes

### Gurudevi Mobile (Expo)

```bash
# Standard development
cd apps/gurudevi-mobile
npm run dev  # Uses load-doppler-env.js script

# Manual Doppler run
doppler run -- npx expo start

# EAS builds
doppler run -- eas build --profile production --platform all
```

### Sanctuary API (Node.js)

```bash
# Standard development (automatic Doppler fallback)
cd apps/sanctuary-api
npm run dev

# Manual Doppler run
doppler run -- node dist/entry-node.js

# Testing
doppler run -- npm test
```

### Web Applications

```bash
# Standard development
cd apps/edlove-web
doppler run -- npm run dev

# Building
doppler run -- npm run build

# Production preview
doppler run --config staging -- npm run build
```

---

## Emergency Procedures

### Secret Leak Response

1. **Immediately rotate**: `doppler secrets set LEAKED_KEY "new-value"`
2. **Check access logs**: Review Doppler dashboard for unusual access
3. **Audit integrations**: Check where the leaked key was used
4. **Update dependencies**: Regenerate any dependent credentials
5. **Document incident**: Note what happened and how it was fixed

### Doppler Service Outage

1. **Fallback to .env**: Use local .env files temporarily
2. **Monitor status**: Check https://status.doppler.com
3. **Communication**: Alert team about fallback procedures
4. **Recovery**: When service is back, `doppler secrets download --format env > .env`

### Accidental Secret Deletion

1. **Check history**: `doppler secrets log DELETED_SECRET`
2. **Rollback**: `doppler secrets rollback DELETED_SECRET --version X`
3. **Verify**: `doppler secrets get DELETED_SECRET`
4. **Test**: Ensure application works with restored secret

---

## Additional Resources

- [Doppler CLI Documentation](https://docs.doppler.com/docs/cli)
- [Accessing Secrets Guide](https://docs.doppler.com/docs/accessing-secrets)
- [CLI Troubleshooting](https://docs.doppler.com/docs/cli-troubleshooting)
- [Secrets Setup Guide](https://docs.doppler.com/docs/secrets-setup-guide)
- [Doppler Dashboard](https://dashboard.doppler.com)

---

## Getting Help

If you encounter issues not covered here:

1. **Check documentation**: Start with Doppler's official docs
2. **Community forum**: https://community.doppler.com
3. **Status page**: https://status.doppler.com
4. **Contact support**: Through Doppler dashboard

---

**Last Updated**: 2026-08-09  
**Project**: Polymath Platform  
**Doppler Project**: gurudevi-mobile
