---
title: "ðŸ—ï¸ Production Readiness Assessment & Tooling Guide"
status: "active"
created: 2026-02-25
updated: 2026-05-07
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile, historical]
---

# 🏗️ Production Readiness Assessment & Tooling Guide
**Gurudevi Mobile App - Complete Infrastructure Overview**

**Date:** February 10, 2026
**Status:** Comprehensive analysis for production deployment

---

## Executive Summary

This document provides a complete production-readiness assessment for the Gurudevi Mobile app, covering:
- Testing infrastructure
- Telemetry & observability
- Security hardening
- Error handling
- Accessibility compliance
- Internationalization (en/si/ta)
- Recommended tools with generous free tiers

**Current State:** The app has solid architectural foundations but lacks production-grade observability, testing, and security measures.

---

## 1. Testing Infrastructure

### 1.1 Current State
- ❌ **Zero test coverage** (confirmed in `BETA_RELEASE_ASSESSMENT.md`)
- ❌ No Jest configuration
- ❌ No E2E test setup
- ❌ No accessibility testing

### 1.2 Recommended Testing Stack (All Free)

#### **Unit & Integration Testing: Jest + React Native Testing Library**
- **Cost:** Free, open-source
- **Setup Time:** 1-2 days
- **Coverage Goal:** 70%+ for critical paths

```bash
# Install dependencies
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
```

**Why This Stack:**
- Jest comes pre-configured with React Native
- RNTL focuses on user interaction testing
- Massive community support
- Fast test execution

#### **E2E Testing: Detox**
- **Cost:** Free, open-source
- **Setup Time:** 2-3 days
- **Use Case:** Critical user flows (auth, classroom creation, content upload)

```bash
npm install --save-dev detox jest
```

**Why Detox:**
- Specifically built for React Native
- Eliminates test flakiness through synchronization
- Runs on iOS and Android simulators
- CI/CD ready

#### **Accessibility Testing: @axe-core/react-native**
- **Cost:** Free
- **Purpose:** Automated a11y testing

### 1.3 Testing Priority Matrix

| Test Type | Priority | Effort | Coverage Target |
|-----------|----------|--------|-----------------|
| **Unit Tests** | 🔴 Critical | 2 weeks | 70% core logic |
| **Component Tests** | 🔴 Critical | 2 weeks | 60% UI components |
| **E2E Tests** | 🟡 High | 1 week | 5 critical flows |
| **Accessibility** | 🟡 High | 3 days | 100% screens |
| **Integration** | 🟢 Medium | 1 week | API layer |

---

## 2. Telemetry & Observability

### 2.1 Recommended: PostHog (Free Tier)
**Winner for Gurudevi's needs**

#### **Free Tier Includes:**
- 1 million events/month (product analytics)
- 5,000 session recordings/month
- 100,000 exceptions/month (error tracking)
- 1 million feature flags/month
- Unlimited team members

#### **Why PostHog > Sentry for This Project:**
1. **Holistic View:** Combines analytics + errors + session replay in one tool
2. **User Behavior:** Critical for understanding how teachers/students use the app
3. **Feature Flags:** Perfect for gradual rollout of Alpha features
4. **Generous Free Tier:** 5,000 recordings vs Sentry's 50
5. **Open Source:** Can self-host if needed

#### **Implementation:**
```bash
npm install posthog-react-native
```

```typescript
// src/lib/posthog.ts
import PostHog from 'posthog-react-native';

export const posthog = new PostHog(
  'YOUR_API_KEY',
  { host: 'https://app.posthog.com' }
);

// Track events
posthog.capture('lesson_created', {
  classroom_id: classroomId,
  content_type: 'video',
  user_role: 'teacher'
});

// Session recording (automatic)
posthog.startSessionRecording();
```

### 2.2 Alternative: Sentry (If Error-Focused)
**Use if error tracking is the #1 priority**

#### **Free Tier:**
- 5,000 errors/month
- 50 session replays/month
- Performance monitoring
- 1 user limit

#### **When to Choose Sentry:**
- App is already stable, just need crash reporting
- Don't need product analytics
- Solo developer project

#### **Cost Comparison:**

| Tool | Free Events | Session Replays | Analytics | Team Size | Best For |
|------|-------------|-----------------|-----------|-----------|----------|
| **PostHog** | 1M | 5,000 | ✅ Full suite | Unlimited | Product teams |
| **Sentry** | 5K errors | 50 | ❌ Limited | 1 user | Solo devs |

**Recommendation:** Start with **PostHog** for Alpha, can add Sentry later if needed.

---

## 3. Media Storage: Cloudinary vs Supabase

### 3.1 Why Cloudinary is Essential for Gurudevi
For an educational app with lessons, images, and videos, standard storage is NOT enough. You need **Media Optimization**.

| Feature | Supabase Storage (Free) | Cloudinary (Free) |
| :--- | :--- | :--- |
| **Storage Limit** | 1 GB | **Up to 25 GB** (using 25 credits) |
| **Bandwidth** | 5 GB | **Up to 25 GB** |
| **Auto-Compression**| ❌ No | ✅ Yes (saves 60-80% bandwidth) |
| **Video Transcoding**| ❌ No | ✅ Yes (optimizes for mobile data) |
| **Image Resizing** | ❌ No | ✅ Yes (on-the-fly) |

### 3.2 Recommendation: Hybrid Storage
1. **Cloudinary:** All lessons, images, and videos. Use their "Auto-format" and "Auto-quality" features to keep the app fast on Sri Lankan 4G networks.
2. **Supabase:** Profile pictures and small user-generated assets (low volume).

---

## 4. Security Hardening

### 3.1 Current Security Gaps (from `SECURITY_ARCHITECTURE_REVIEW.md`)
- ❌ No input validation
- ❌ No rate limiting
- ❌ XSS protection missing
- ⚠️ Authorization checks incomplete

### 3.2 Security Tools & Practices

#### **A. Input Validation: Zod**
```bash
npm install zod
```

```typescript
import { z } from 'zod';

const lessonSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().max(1000),
  content_url: z.string().url()
});
```

#### **B. XSS Protection: DOMPurify**
```bash
npm install isomorphic-dompurify
```

**C. Rate Limiting: Upstash Redis (Free Tier)**
- 10,000 requests/day free
- Global edge network
- Perfect for mobile API rate limiting

#### **D. Secrets Management: Expo Secrets**
```bash
# .env (never commit)
SUPABASE_URL=xxx
SUPABASE_PUBLISHABLE_KEY=xxx
POSTHOG_API_KEY=xxx
```

```typescript
// Use expo-constants
import Constants from 'expo-constants';
const { SUPABASE_URL } = Constants.expoConfig.extra;
```

### 3.3 Security Checklist

- [ ] All user inputs validated with Zod
- [ ] XSS sanitization on rich text
- [ ] SQL injection protection (Supabase handles this)
- [ ] Authorization checks on all API endpoints
- [ ] Secrets in environment variables
- [ ] HTTPS enforced
- [ ] Rate limiting implemented

---

## 4. Error Handling & Logging

### 4.1 Current State
- ⚠️ APIError class exists but incomplete
- ❌ No global error boundary
- ❌ Console.log statements in production

### 4.2 Recommended Pattern

#### **Global Error Boundary**
```typescript
// src/components/ErrorBoundary.tsx
import { ErrorBoundary } from 'react-error-boundary';
import { posthog } from '@/lib/posthog';

function ErrorFallback({ error }) {
  posthog.capture('app_crashed', { error: error.message });
  
  return (
    <View>
      <Text>Something went wrong</Text>
      <Button onPress={() => window.location.reload()}>
        Reload App
      </Button>
    </View>
  );
}

// Wrap app
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <App />
</ErrorBoundary>
```

#### **Async Error Handler**
```typescript
// src/lib/errorHandler.ts
import { posthog } from '@/lib/posthog';

export async function handleAsyncError(error: Error, context: string) {
  // Log to PostHog
  posthog.capture('async_error', {
    error: error.message,
    context,
    stack: error.stack
  });
  
  // Show user-friendly message
  Alert.alert('Oops!', 'Something went wrong. Please try again.');
}
```

### 4.3 Production Logging Policy
- ❌ Remove all `console.log` before production
- ✅ Use PostHog events for tracking
- ✅ Use Sentry/PostHog for errors
- ✅ Redact sensitive data (passwords, tokens)

---

## 5. Accessibility (a11y)

### 5.1 Current State
- 🔴 **0% compliance** (from `BETA_RELEASE_ASSESSMENT.md`)
- ❌ No `accessibilityLabel` on any component
- ❌ No screen reader testing

### 5.2 Tools & Implementation

#### **Testing: @axe-core/react-native**
```bash
npm install --save-dev @axe-core/react-native
```

#### **Implementation Checklist**

**Every Interactive Element Needs:**
```typescript
<Pressable
  onPress={handlePress}
  accessibilityRole="button"
  accessibilityLabel="Create new classroom"
  accessibilityHint="Double tap to create a new classroom"
  accessibilityState={{ disabled: isDisabled }}
>
  <Text>Create Classroom</Text>
</Pressable>
```

**Form Inputs:**
```typescript
<Input
  value={email}
  accessibilityLabel="Email address"
  accessibilityHint="Enter your email to sign in"
  accessible={true}
/>
```

### 5.3 Accessibility Audit Plan
1. **Automated:** Run axe-core on all screens (2 days)
2. **Manual:** Test with VoiceOver (iOS) and TalkBack (Android) (1 week)
3. **Fixes:** Add labels to all 39 components (2 weeks)

**Goal:** WCAG 2.1 AA compliance before Beta launch

---

## 6. Internationalization (i18n)

### 6.1 Current Stack (from GURUDEVI_STACK_v3_1_FINAL.md)
✅ **Already configured:**
- react-i18next
- i18next
- Supports: Sinhala (si), Tamil (ta), English (en)

### 6.2 Current Implementation Status
```typescript
// i18n/config.ts (already exists)
i18n.use(initReactI18next).init({
  resources: {
    si: { translation: require('./locales/si.json') },
    ta: { translation: require('./locales/ta.json') },
    en: { translation: require('./locales/en.json') }
  },
  lng: 'si',  // Default Sinhala
  fallbackLng: 'en'
});
```

### 6.3 Translation Workflow

#### **Tool Recommendation: Lokalise (Free Tier)**
- 500 translation keys free
- Collaborative translation interface
- Git integration
- Export to JSON

#### **Alternative: i18nexus (Free Tier)**
- Unlimited keys
- 1 project free
- Direct integration with i18next

### 6.4 Missing Translations Audit
```bash
# Check for missing keys
npm install -g i18next-scanner
i18next-scanner --config i18next-scanner.config.js
```

---

## 7. Performance Monitoring

### 7.1 Tools Included in PostHog Free Tier
- ✅ App start time
- ✅ Screen load times
- ✅ Slow network requests
- ✅ Session duration

### 7.2 Additional: Expo Performance Monitoring
```typescript
// Built into Expo, free
import { PerformanceObserver } from 'expo-performance';

const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    posthog.capture('performance_metric', {
      name: entry.name,
      duration: entry.duration
    });
  });
});

observer.observe({ entryTypes: ['navigation', 'measure'] });
```

---

## 8. Recommended Tools Matrix

### 8.1 Essential Tools (All Free Tier)

| Category | Tool | Free Tier | Why |
|----------|------|-----------|-----|
| **Testing** | Jest + RNTL | Unlimited | Industry standard |
| **E2E Testing** | Detox | Unlimited | React Native optimized |
| **Observability** | PostHog | 1M events | All-in-one solution |
| **Error Tracking** | PostHog | 100K exceptions | Included in analytics |
| **Security** | Zod | Unlimited | Type-safe validation |
| **i18n** | i18nexus | Unlimited keys | Easy integration |
| **Performance** | Expo built-in | Free | No setup needed |

### 8.2 Nice-to-Have Tools

| Tool | Free Tier | Use Case |
|------|-----------|----------|
| **Upstash Redis** | 10K requests/day | Rate limiting |
| **Lokalise** | 500 keys | Translation management |
| **@axe-core** | Unlimited | Accessibility testing |

---

## 9. Implementation Roadmap

### Phase 1: Critical (Week 1-2)
- [ ] Install  & configure PostHog
- [ ] Set up Jest + RNTL
- [ ] Add ErrorBoundary to App.tsx
- [ ] Implement input validation with Zod
- [ ] Add accessibility labels to top 10 screens

### Phase 2: Important (Week 3-4)
- [ ] Write unit tests for API modules
- [ ] Set up Detox for E2E tests
- [ ] Complete accessibility audit
- [ ] Remove all console.log statements
- [ ] Audit translation completeness

### Phase 3: Polish (Week 5-6)
- [ ] Achieve 70% test coverage
- [ ] Write 5 E2E test flows
- [ ] Set up CI/CD with testing
- [ ] Performance benchmarking
- [ ] Security penetration testing

---

## 10. 💰 The "Zero-Cost" Beta Strategy

You can absolutely run a Beta with **hundreds of users** for **$0/month**. The $50-100 estimate was for "enterprise-grade" scale, but for your launch, we can stay free.

### 🛡️ How to Stay $0 Forever:

| Tool | Risk of Cost | Prevention Strategy |
| :--- | :--- | :--- |
| **PostHog** | 🟢 Very Low | 1 million events is massive. Even with 500 active users, you won't hit this. |
| **Cloudinary** | 🟢 Low | **25GB units** is very generous for educational content if we use auto-optimization. |
| **Supabase** | 🟡 Medium | 500MB database is plenty. By moving media to Cloudinary, we save Supabase storage. |
| **Sentry** | 🟢 Low | 5,000 errors is a lot unless the app is "looping" an error. If we fix bugs fast, this is always free. |
| **Upstash (Redis)** | 🟡 Medium | 10k requests/day is safe for Auth/Security limits. |
| **AI (Claude)** | 🔴 High | This is the only real cost. Keep as "Pro-only" or use free-tier models. |

### 🚀 Zero-Cost Implementation Rules:
1. **Compress Images:** Never upload 5MB mobile photos. We'll add a compression step to the "Mixed Way" code.
2. **Aggressive Sampling:** If you ever get "too popular," we tell PostHog to only record 50% of sessions.
3. **No 'Heavy' Data:** We store pointers to files, not the files themselves, in the database.

---

## 11. Cost Projections (Revised for $0 Budget)

| Phase | Est. Users | Monthly Cost | Why? |
| :--- | :--- | :--- | :--- |
| **Alpha** | 10-50 | **$0** | Well within all free tiers. |
| **Beta** | 100-500 | **$0** | PostHog (1M) and Supabase (500MB) can handle this user load easily for free. |
| **Scale** | 1000+ | **$0 - $25** | Only Supabase ($25) might move to "Pro" if you store a lot of data. Everything else stays free. |

---

## 12. Next Steps

1. ✅ **Review this document**
2. **Decide on tooling** (recommend: PostHog + Jest + Detox)
3. **Install core tools** (PostHog, Jest, Zod)
4. **Fix TypeScript errors** (prerequisite for testing)
5. **Implement testing infrastructure**
6. **Begin accessibility fixes**

---

**Status:** Updated with Zero-Cost strategy  
**Recommendation:** Proceed with TypeScript fixes; they cost nothing and save you from data corruption!

