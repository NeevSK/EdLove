---
title: "ðŸ›ï¸ Gurudevi Mobile"
status: "active"
created: 2026-02-05
updated: 2026-03-20
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# 🏛️ Gurudevi Mobile

**The Operational Engine** - Mobile app for teachers, students, and principals

> **Stack**: Expo SDK 54, React Native 0.81, Gluestack UI, Supabase  
> **Status**: 6.5/10 - Production-Ready After Critical Fixes (40 hours)

---

## Web platform (React Native Web)

The Gurudevi **platform web app** is built from this same codebase (React Native Web via Expo/Metro).

- Local dev: `pnpm web` (or `pnpm --filter gurudevi-mobile web` from repo root)
- Build export: `pnpm build:web` (outputs to `dist/`)
- Hosting/domain: `platform.gurudevi.edlove.org` on GitHub Pages
- CI deploy: `.github/workflows/web-deploy.yml` uploads `apps/gurudevi-mobile/dist/` to Pages
- Web-specific UI/files: use `*.web.tsx` (and `*.web.ts`) where needed

More details: [docs/web/WEB_GUIDE.md](docs/web/WEB_GUIDE.md)

---

## Branch flow (solo, pipeline)

Promotion pipeline:

`main-innovate` -> `main-dev` -> `main-QA` -> `main-preview` -> `main`

Guidelines:

- Merge forward only (avoid back-merges from `main` unless it's a critical hotfix sync).
- Keep each branch buildable so promotion is always possible.

Reference: `docs/BRANCHING_MODEL.md` (repo root)

---

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
pnpm start

# Run on device
pnpm android  # or pnpm ios
```

---

## 📚 **NEW: Comprehensive Documentation**

We've completed a full architecture review and analysis. **Start here:**

### 🎯 **[DOCS_INDEX.md](DOCS_INDEX.md)** - Documentation Hub
**Your starting point for all documentation.**

Quick Links by Role:
- 👨‍💻 **New Developer?** → [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- 🏗️ **Solution Architect?** → [COMPREHENSIVE_APP_ANALYSIS.md](COMPREHENSIVE_APP_ANALYSIS.md)
- 🔧 **Fixing Issues?** → [ACTION_ITEMS.md](ACTION_ITEMS.md)

---

## 📊 Current Assessment

| Category | Score | Status |
|----------|-------|--------|
| Architecture | 8/10 | ✅ Excellent |
| TypeScript | 9/10 | ✅ Excellent |
| Design System | 9/10 | ✅ Excellent |
| Features | 7/10 | ✅ Good |
| **Security** | **5/10** | ⚠️ **Needs Work** |
| **Accessibility** | **1/10** | 🔴 **Critical** |
| **Performance** | **4/10** | 🔴 **Issues** |
| **Overall** | **6.5/10** | ⚠️ **Fix Critical Issues** |

---

## 🚨 Critical Issues (Fix This Week)

**6 Production Blockers - 40 hours to fix:**

1. 🔴 **13 TypeScript compilation errors** (4h)
2. 🔴 **Zero accessibility features** (16h) 
3. 🔴 **No authorization checks** (8h)
4. 🔴 **ScrollView performance issues** (3h)
5. 🔴 **No input validation** (6h)
6. 🔴 **Missing error boundaries** (3h)

**See [ACTION_ITEMS.md](ACTION_ITEMS.md) for detailed fix strategies.**

---

## ✨ What's Been Documented

**4 comprehensive documents (83KB, 3,556 lines):**

### 1. [COMPREHENSIVE_APP_ANALYSIS.md](COMPREHENSIVE_APP_ANALYSIS.md) (42KB)
- Complete architecture review
- Feature inventory (7 major areas)
- API inventory (14 modules, 80+ functions)
- UI/Design system documentation
- 21 issues identified with fix strategies
- Security assessment (5/10)
- Quality assessment (7/10)
- 12-week implementation roadmap
- 15 future feature recommendations

### 2. [QUICK_REFERENCE.md](QUICK_REFERENCE.md) (8KB)
- Quick start guide
- Design system cheat sheet
- API reference with examples
- Common patterns
- Debugging tips

### 3. [ACTION_ITEMS.md](ACTION_ITEMS.md) (26KB)
- 21 issues tracked
- Step-by-step fixes
- 50+ code examples
- Effort estimates

### 4. [DOCS_INDEX.md](DOCS_INDEX.md) (9KB)
- Navigation hub
- 4-week learning path
- Quick links by role

---

## 📖 Architecture Overview

```
src/
├── screens/          # 5 main tabs + nested views
├── components/       # 39 components (11 shared + 28 feature)
├── lib/
│   ├── api/         # 14 API modules (80+ functions)
│   └── supabase.ts  # Backend client
├── navigation/      # Tab navigator
├── store/          # Zustand state
├── constants/      # Theme, fonts
└── i18n/           # Translations
```

**Tech Stack:**
- **Expo 54** - Managed platform
- **React Native 0.81** - Mobile framework
- **GluestackUI** - Component library
- **Supabase** - Backend (Auth + PostgreSQL)
- **React Navigation** - Bottom tabs
- **Zustand** - State management
- **TanStack Query** - Data fetching

---

## 🎨 "Sanctuary" Design System

**Primary Colors:**
- `sanctuarySaffron` #E67E22 - Brand orange
- `sageGreen` #8FBC8F - Success
- `emberRed` #FF6347 - Error
- `voidIndigo` #1A1A2E - Dark background

**Usage:**
```typescript
import { Theme } from '@/constants/Theme'

<Box sx={{ backgroundColor: Theme.colors.voidIndigo }}>
  <Text sx={{ color: Theme.colors.sanctuarySaffron }}>
    Hello World
  </Text>
</Box>
```

---

## 🔌 API Quick Reference

```typescript
import { auth, classroom, attendance, grading, self } from '@/lib/api'

// Authentication
await auth.signIn(email, password)
await auth.signOut()

// Classroom Management
const lessons = await classroom.lessons.getAll(teacherId)
await attendance.record(classroomId, studentId, 'present', date)

// Grading
await grading.submitGrade(studentId, classroomId, marks)

// Wellbeing
await self.logMood(userId, 4, 'Feeling great!')
```

**See [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for complete API reference.**

---

## 🎯 Next Steps

### For New Developers
1. Read [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
2. Set up environment
3. Pick an issue from [ACTION_ITEMS.md](ACTION_ITEMS.md)

### For Architects
1. Read [COMPREHENSIVE_APP_ANALYSIS.md](COMPREHENSIVE_APP_ANALYSIS.md)
2. Review security and performance sections
3. Plan sprint based on implementation roadmap

### For Project Managers
1. Review [ACTION_ITEMS.md](ACTION_ITEMS.md)
2. Prioritize critical issues (40 hours)
3. Schedule security and accessibility reviews

---

## 🤝 Contributing

**Before committing:**
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No console.log statements
- [ ] Added accessibility attributes
- [ ] Tested on device
- [ ] Updated documentation if needed

**See [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for full checklist.**

---

## �� Support

- **Documentation:** See [DOCS_INDEX.md](DOCS_INDEX.md)
- **Issues:** See [ACTION_ITEMS.md](ACTION_ITEMS.md)
- **Questions:** Ask in team chat

---

## 📝 License

Private - All rights reserved

---

**Last Updated:** February 5, 2026  
**Documentation Version:** 1.0  
**Next Review:** March 5, 2026
