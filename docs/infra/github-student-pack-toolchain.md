---
title: "GitHub Student Pack toolchain"
status: "active"
created: 2026-08-13
updated: 2026-08-13
author: "Naveen"
scribe: "opencode"
tags: [docs, infra]
---

# GitHub Student Pack toolchain

This is the free-first integration map for Gurudevi Mobile. It deliberately keeps
the runtime architecture small: Doppler remains the secret authority, Supabase
remains the data/auth platform, Cloudflare remains the edge deployment target,
and Expo/EAS remains the native build path.

## Activate first

These offers directly strengthen the current repository:

| Offer | Use in this project | Integration state |
| --- | --- | --- |
| GitHub Pro | Private-repository collaboration, Actions/Codespaces allowance, PR governance | Repository workflows and Codespaces-compatible Node/pnpm contract are in place |
| GitHub Codespaces | Reproducible browser-based development on the same Node/pnpm contract as CI | Use `.nvmrc`, `mise.toml`, and `pnpm install --frozen-lockfile`; add a devcontainer when the local editor workflow is settled |
| Doppler Team | Shared dev/staging/production secret management and scoped CI service tokens | Integrated; only `DOPPLER_TOKEN` is expected in GitHub |
| Sentry | Mobile/web errors and source-map uploads | Integrated through Doppler; the Student offer is time-limited but renewable according to the Pack listing |
| GitHub Pages | Free preview/static web hosting | Existing deployment workflow remains in place |

GitHub's current billing documentation lists GitHub Pro with 3,000 Actions
minutes/month and 180 Codespaces core hours/month. These are account allowances,
not guarantees that every third-party service in a workflow is free.

## Good offers, but not automatic replacements

The Student Pack also lists DigitalOcean credit, Azure for Students, Heroku
credits, Appwrite Education, MongoDB Atlas credit, and New Relic. They may be
valuable later, but wiring all of them into this app now would create duplicated
backends, extra credentials, and migration risk. Keep them as expansion paths:

- DigitalOcean/Azure/Heroku: disaster-recovery or an isolated API worker, not a
  second production deployment yet.
- Appwrite/MongoDB: sandbox experiments only; do not split production data across
  Supabase and another backend without an explicit architecture decision.
- New Relic: compare against Sentry/PostHog only if current observability gaps are
  measured.
- TesterArmy, BrowserStack, LambdaTest, and similar hosted testing tools: use
  their trials/quotas for exploratory coverage, not as the only release gate.

## Testing lanes

| Lane | Runner | Cost/control model |
| --- | --- | --- |
| Unit/component | GitHub Actions | Existing Vitest/Jest lane |
| Web E2E | GitHub-hosted `ubuntu-latest` | Playwright installs Chromium with `--with-deps`; reports are uploaded as artifacts |
| Mobile UI | EAS Workflows or a runner with an emulator | Maestro flows already exist; cloud device quotas are separate from GitHub minutes |
| Real-device matrix | Firebase Test Lab or another device farm | Optional scheduled lane; do not block every PR on a quota-based service |
| Manual exploratory | Playwright CLI locally/Codespaces | Useful for debugging and visual inspection; not a secret-bearing CI step |

The browser workflow intentionally runs Chromium in CI first. Firefox/WebKit and
real-device testing remain opt-in expansion lanes so a normal PR does not consume
unnecessary minutes or become dependent on unavailable macOS/iOS capacity.

## Required GitHub setup

1. Create a Doppler service token scoped to `gurudevi-mobile` and the required
   config(s), then store it as `DOPPLER_TOKEN` in the GitHub `development`,
   `preview`, and `production` environments as appropriate.
2. Enable Actions read/write policy for the repository and keep workflow
   permissions least-privilege; these workflows request `contents: read`.
3. Turn on Dependabot security and version updates. `.github/dependabot.yml`
   keeps Expo/native pins out of automated minor/patch grouping because this repo
   has explicit sacred-version constraints.
4. Set GitHub Actions included-usage alerts at 90% and 100%. Student/Pro
   allowances can still be exhausted by Android builds, browser downloads, and
   artifacts.
5. Activate the Student Pack offers from the official Pack page before adding
   provider-specific credentials. Record only the provider name and expiry/renewal
   date in your private operations notes; put actual credentials in Doppler.

## Source links

- [GitHub Student Developer Pack](https://education.github.com/pack)
- [GitHub Actions billing and included usage](https://docs.github.com/en/billing/concepts/product-billing/github-actions)
- [GitHub-hosted runner reference](https://docs.github.com/en/actions/reference/runners/github-hosted-runners)
- [Playwright CI guidance](https://playwright.dev/docs/ci)
- [Expo EAS Workflows](https://docs.expo.dev/eas/workflows/introduction/)
