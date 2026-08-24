---
title: "@repo/analytics"
status: "active"
created: 2026-03-25
updated: 2026-07-28
author: "Naveen"
scribe: "opencode"
tags: [packages, analytics]
---

# @repo/analytics

Premium analytics engine for polymath-platform providing advanced student performance insights, GPA calculations, and predictive analytics.

## Purpose

This package owns all analytics, grading calculations, and performance prediction logic for the platform. It provides reusable analytics capabilities across web and mobile applications.

## Public Entry Points

- `@repo/analytics`
  - Engines, types, grading helpers, benchmarking helpers, and runtime analytics utilities
- `@repo/analytics/hooks`
  - Query and data hooks such as `useStudentPerformance`, `useClassPerformance`, and `usePredictions`
- `@repo/analytics/ui`
  - Analytics UI components, `AnalyticsProvider`, and the app-facing `useAnalytics` tracking hook

## What It Owns

- **GPA Calculation Engine**: Enhanced grading calculations with multiple grading scales
- **Student Performance Analytics**: Comprehensive performance metrics and trends
- **Predictive Analytics**: ML-powered predictions for student outcomes
- **Benchmarking**: Industry and peer comparison capabilities
- **Insights Generation**: Automated insights and recommendations
- **Analytics Components**: Reusable charts, dashboards, and visualizations exposed from `@repo/analytics/ui`

## What It Must Not Own

- Raw data storage (uses @repo/core for Supabase access)
- UI layouts specific to admin/classroom apps (provides components, not screens)
- Authentication/authorization logic
- Direct database operations (uses core APIs)
- Product event vocabulary or access decisions; those are defined by the
  Gurudevi core analytics contract and injected through `IAnalyticsPort`.

PostHog is an adapter in this package. It is not the feature-rollout authority
(GrowthBook), the authorization authority (Cedar), or the entitlement
authority. Product analytics events must use the typed core product-event API;
feature code must not import a PostHog SDK directly.

## Collaboration

- **@repo/core**: Uses for data access and authentication
- **@repo/ui**: Provides analytics components that use UI primitives
- **@repo/graphics**: Integrates for advanced visualizations
- **@repo/ai**: Leverages for ML models and predictions
- **@repo/admin**: Consumes analytics for admin dashboards
- **@repo/classroom**: Consumes analytics for classroom insights

## Platform-Specific Files

- `*.web.tsx`: Web-specific analytics components and dashboards
- `*.native.tsx`: Mobile-optimized analytics views
- `*.ts`: Shared analytics logic and calculations

## App Layer Integration

Apps may only create thin route adapters that:
- Pass user context and permissions to analytics functions
- Handle navigation-specific state
- Compose analytics components into app-specific layouts

Apps must not implement analytics logic directly.
