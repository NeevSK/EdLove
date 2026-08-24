---
title: "Gurudevi â€” Library Feature"
status: "active"
created: 2026-03-02
updated: 2026-05-25
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Gurudevi — Library Feature
### Product & Technical Specification for IDE Agent

---

## What You Are Building

The Library is one of five sections in Gurudevi.
Bottom nav: Community | Classroom | Library | Profile | (5th)

The Library is not a content list.
It is a **navigable epistemic universe** —
a living map of knowledge for Sri Lankan teachers,
students, and principals.

Every decision should serve one question:
**Did something emerge in this person
that couldn't have emerged without this encounter?**

---

## Current State

```
EXISTS:
  - Empty library screen
  - Search bar (non-functional)
  - Filter UI (non-functional)
  - Collection list (empty)
  - FAB to add resources
  - Some DB tables (flexible, can extend)
  - Bottom nav with Library as one section
  - Auth flow working
  - Supabase connected
  - pnpm monorepo with turbo
  - @repo/library package exists (partial)

DOES NOT EXIST:
  - Real content flowing
  - Working search
  - Map view
  - Any recommendation logic
  - ETL pipeline
  - Offline support wired up
```

---

## Monorepo Structure

```
Gurudevi/
  apps/
    gurudevi-mobile/     ← Expo 55, RN 0.83
                            iOS + Android
                            React Navigation / Metro web
    gurudevi-marketingWeb/        ← separate web app or web shell
                            OR React + Vite (TBD)
                            keep components compatible
  packages/
    library/             ← @repo/library
                            shared between mobile + web
                            THIS is the primary build target
    core/                ← @repo/core
    ui/                  ← @repo/ui
    community/           ← @repo/community
    classroom/           ← @repo/classroom
    profile/             ← @repo/profile
    scanner-kit/         ← @repo/scanner-kit
    self/                ← @repo/self
```

---

## Tech Stack

```
RUNTIME
  React Native 0.83.2
  Expo SDK 55
  React Navigation (navigation)
  New Architecture enabled (both iOS + Android)
  Hermes engine

STATE
  Zustand — global state
  React Query (@tanstack/react-query) — server state
  MMKV (react-native-mmkv) — persistent cache

BACKEND
  Supabase — database + auth + realtime
  pgvector — semantic search + embeddings
  Supabase Edge Functions — serverless processing

STORAGE
  Cloudinary — media files (images, PDFs, video metadata)

UI
  @gluestack-ui/themed — component library
  react-native-svg — map rendering
  expo-image — optimized image loading
  FlashList (@shopify/flash-list) — virtualized lists
  react-native-reanimated — animations
  react-native-gesture-handler — gestures

PERFORMANCE
  React Compiler (enable if not already)
  expo-updates — OTA with bytecode diffing
  MMKV — offline first cache

MONOREPO
  pnpm workspaces
  Turbo
  TypeScript throughout
```

---

## Database Schema

Build or extend these tables in Supabase.
Existing tables are flexible — extend don't break.

```sql
-- KNOWLEDGE NODES
-- Everything is a node — concepts AND content
create table if not exists nodes (
  id uuid primary key default gen_random_uuid(),
  type text check (type in (
    'concept', 'resource', 'curriculum',
    'person', 'institution'
  )),
  title_si text,
  title_ta text,
  title_en text,
  description_si text,
  description_ta text,
  description_en text,
  embedding vector(1024),
  map_x float,
  map_y float,
  map_z float,
  is_published boolean default false,
  created_at timestamptz default now()
);

-- RESOURCES (extends nodes)
create table if not exists resources (
  id uuid primary key references nodes(id),
  content_type text check (content_type in (
    'book', 'lesson_plan', 'circular',
    'video', 'documentary', 'trailer',
    'infographic', 'mindmap', 'map',
    'syllabus', 'guide', 'short_note',
    'pedagogy', 'research', 'story',
    'podcast', 'image', 'article'
  )),
  cloudinary_url text,
  cloudinary_public_id text,
  file_hash text unique,
  file_size_bytes bigint,
  duration_seconds int,
  language text[],
  grade_levels text[],
  subjects text[],
  source_url text,
  source_name text,
  published_year int,
  target_roles text[],
  is_ministry_official boolean default false,
  is_curated boolean default false,
  view_count bigint default 0,
  created_at timestamptz default now()
);

-- EDGES (the map's relationships)
create table if not exists edges (
  id uuid primary key default gen_random_uuid(),
  from_node uuid references nodes(id),
  to_node uuid references nodes(id),
  relationship text check (relationship in (
    'prerequisite', 'related', 'part_of',
    'leads_to', 'contradicts', 'supports',
    'wrong_path_to', 'authored_by', 'issued_by'
  )),
  weight float default 1.0,
  is_ai_generated boolean default false,
  is_verified boolean default false,
  created_at timestamptz default now(),
  unique(from_node, to_node, relationship)
);

-- TAGS
create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  name_si text,
  name_ta text,
  name_en text,
  category text check (category in (
    'subject', 'grade', 'topic', 'pedagogy',
    'skill', 'role', 'format',
    'curriculum_area', 'reform', 'custom'
  )),
  embedding vector(1024)
);

create table if not exists resource_tags (
  resource_id uuid references resources(id),
  tag_id uuid references tags(id),
  is_ai_suggested boolean default false,
  is_verified boolean default false,
  primary key (resource_id, tag_id)
);

-- COLLECTIONS
create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  title_si text,
  title_ta text,
  title_en text,
  description_si text,
  description_ta text,
  description_en text,
  curated_by uuid references auth.users(id),
  target_roles text[],
  is_official boolean default false,
  embedding vector(1024),
  created_at timestamptz default now()
);

create table if not exists collection_nodes (
  collection_id uuid references collections(id),
  node_id uuid references nodes(id),
  position int,
  primary key (collection_id, node_id)
);

-- USER JOURNEYS (feeds recommendations)
create table if not exists journeys (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references auth.users(id),
  node_id uuid references nodes(id),
  action text check (action in (
    'viewed', 'completed', 'saved',
    'shared', 'abandoned', 'returned_to'
  )),
  duration_seconds int,
  came_from_node uuid references nodes(id),
  went_to_node uuid references nodes(id),
  was_redirected boolean default false,
  created_at timestamptz default now()
);

-- MAP UNLOCK STATE (per user)
create table if not exists map_access (
  profile_id uuid references auth.users(id) primary key,
  is_unlocked boolean default false,
  unlocked_at timestamptz,
  nodes_explored_count int default 0
);

-- STAGING (ETL pipeline, separate from production)
create table if not exists staging (
  id uuid primary key default gen_random_uuid(),
  url text,
  title text,
  description text,
  content_type text,
  source_type text check (source_type in (
    'ministry', 'youtube', 'archive',
    'ai_search', 'community', 'manual'
  )),
  ai_score float,
  ai_reasoning text,
  suggested_tags jsonb,
  suggested_content_type text,
  suggested_roles text[],
  suggested_language text[],
  embedding vector(1024),
  suggested_edges jsonb,
  map_x float,
  map_y float,
  cloudinary_url text,
  file_hash text,
  file_acquired boolean default false,
  enrichment_complete boolean default false,
  status text check (status in (
    'pending_review', 'approved',
    'rejected', 'published'
  )) default 'pending_review',
  published_node_id uuid references nodes(id),
  auto_approve boolean default false,
  created_at timestamptz default now(),
  published_at timestamptz
);
```

Enable pgvector extension:
```sql
create extension if not exists vector;
```

---

## @repo/library Package Structure

Build this package. It is consumed by both mobile and web.

```
packages/library/
  src/
    types/
      index.ts           ← all TypeScript types
      node.types.ts
      resource.types.ts
      collection.types.ts
      journey.types.ts
      
    api/
      nodes.api.ts       ← Supabase node queries
      resources.api.ts   ← resource queries
      collections.api.ts ← collection queries
      search.api.ts      ← semantic + text search
      journeys.api.ts    ← journey recording
      map.api.ts         ← map data queries
      
    hooks/
      useLibrary.ts      ← main library hook
      useNode.ts         ← single node
      useSearch.ts       ← search with debounce
      useCollections.ts  ← collections list
      useMap.ts          ← map neighbourhood
      useJourney.ts      ← record user journey
      useMapAccess.ts    ← unlock state
      
    store/
      library.store.ts   ← Zustand store
      
    cache/
      library.cache.ts   ← MMKV cache layer
      
    utils/
      language.utils.ts  ← si/ta/en helpers
      content.utils.ts   ← type helpers
      
  index.ts               ← public exports
```

---

## Core Types

```typescript
// packages/library/src/types/index.ts

export type Language = 'si' | 'ta' | 'en'
export type UserRole = 'teacher' | 'student' | 'principal'

export type ContentType =
  | 'book' | 'lesson_plan' | 'circular'
  | 'video' | 'documentary' | 'trailer'
  | 'infographic' | 'mindmap' | 'map'
  | 'syllabus' | 'guide' | 'short_note'
  | 'pedagogy' | 'research' | 'story'
  | 'podcast' | 'image' | 'article'

export type NodeType =
  | 'concept' | 'resource'
  | 'curriculum' | 'person' | 'institution'

export type EdgeRelationship =
  | 'prerequisite' | 'related' | 'part_of'
  | 'leads_to' | 'contradicts' | 'supports'
  | 'wrong_path_to' | 'authored_by' | 'issued_by'

export interface LocalizedText {
  si?: string
  ta?: string
  en?: string
}

export interface Node {
  id: string
  type: NodeType
  title: LocalizedText
  description: LocalizedText
  map_x?: number
  map_y?: number
  map_z?: number
  is_published: boolean
  created_at: string
}

export interface Resource extends Node {
  content_type: ContentType
  cloudinary_url?: string
  language: Language[]
  grade_levels: string[]
  subjects: string[]
  source_url?: string
  source_name?: string
  target_roles: UserRole[]
  is_ministry_official: boolean
  is_curated: boolean
  view_count: number
  tags?: Tag[]
}

export interface Edge {
  id: string
  from_node: string
  to_node: string
  relationship: EdgeRelationship
  weight: number
}

export interface Tag {
  id: string
  name: LocalizedText
  category: string
}

export interface Collection {
  id: string
  title: LocalizedText
  description: LocalizedText
  target_roles: UserRole[]
  is_official: boolean
  nodes?: Resource[]
}

export interface MapNeighbourhood {
  center_node: Node
  nodes: Node[]
  edges: Edge[]
  user_visited: string[] // node ids
}

export interface LibraryFilters {
  content_type?: ContentType[]
  language?: Language[]
  grade_levels?: string[]
  subjects?: string[]
  target_roles?: UserRole[]
  is_ministry_official?: boolean
  is_curated?: boolean
}
```

---

## Zustand Store

```typescript
// packages/library/src/store/library.store.ts

interface LibraryStore {
  // Search
  searchQuery: string
  setSearchQuery: (q: string) => void
  
  // Filters
  filters: LibraryFilters
  setFilters: (f: LibraryFilters) => void
  clearFilters: () => void
  
  // Active node
  activeNodeId: string | null
  setActiveNodeId: (id: string | null) => void
  
  // View mode — door open for AB testing
  viewMode: 'list' | 'map' | 'collection'
  setViewMode: (mode: 'list' | 'map' | 'collection') => void
  
  // Map access
  mapUnlocked: boolean
  nodesExplored: number
  setMapUnlocked: (v: boolean) => void
  incrementNodesExplored: () => void
  
  // User language preference
  preferredLanguage: Language
  setPreferredLanguage: (l: Language) => void
}
```

---

## MMKV Cache Layer

```typescript
// packages/library/src/cache/library.cache.ts

// Cache keys
const KEYS = {
  NODES_LIST: 'library:nodes:list',
  COLLECTIONS: 'library:collections',
  MAP_NEIGHBOURHOOD: (id: string) => `library:map:${id}`,
  NODE_DETAIL: (id: string) => `library:node:${id}`,
  SEARCH_RESULTS: (q: string) => `library:search:${q}`,
  MAP_ACCESS: 'library:map:access',
  USER_JOURNEY: 'library:journey',
}

// Strategy:
// 1. Read from cache immediately — zero wait
// 2. Fetch fresh in background
// 3. Update cache silently
// 4. User always sees something instantly

// Cache TTL
const TTL = {
  NODES_LIST: 1000 * 60 * 15,    // 15 minutes
  NODE_DETAIL: 1000 * 60 * 60,   // 1 hour
  COLLECTIONS: 1000 * 60 * 30,   // 30 minutes
  MAP: 1000 * 60 * 60 * 24,      // 24 hours
  SEARCH: 1000 * 60 * 5,         // 5 minutes
}
```

---

## Library Screen Architecture

Three views. Same data. Same hooks.
Door open for AB testing or user preference.

```
LibraryScreen
  ├── LibraryHeader
  │     ├── SearchBar (functional, debounced)
  │     └── FilterSheet (bottom sheet)
  │
  ├── ViewToggle (list | map | collections)
  │     └── subtle — not primary UI
  │
  ├── [viewMode === 'list']
  │     └── ResourceList (FlashList)
  │           └── ResourceCard
  │                 ├── Thumbnail (expo-image)
  │                 ├── Title (localized)
  │                 ├── ContentTypeBadge
  │                 ├── LanguageBadge
  │                 └── SaveButton
  │
  ├── [viewMode === 'collections']
  │     └── CollectionList (FlashList)
  │           └── CollectionCard
  │
  └── [viewMode === 'map']
        └── MapView (react-native-svg)
              ├── MapCanvas (pan + zoom)
              ├── EdgeLayer (SVG paths)
              ├── NodeLayer (SVG circles)
              ├── FogOfWarLayer (SVG opacity)
              └── MapDoorButton
                    └── appears when unlocked
```

---

## Map View Specifics

```
RENDERING
  react-native-svg only
  No Skia (black screen on low-end known issue)
  No WebGL on mobile
  D3 force layout computed SERVER SIDE
  Coordinates stored in nodes.map_x / map_y
  Client only renders — never computes layout

MAX NODES RENDERED
  30 nodes maximum at any time
  Local neighbourhood only
  Fog of war for unexplored nodes
  Lazy expand as user navigates

PAN AND ZOOM
  react-native-gesture-handler
  PinchGestureHandler + PanGestureHandler
  Animated with react-native-reanimated

MAP UNLOCK
  Threshold: user has explored 5+ nodes
  (viewed for > 30 seconds each)
  On unlock: subtle animation, no fanfare
  Door appears in library as island on horizon
  Tap door → transition to map view
  
NODE STATES
  unexplored   → dim circle, fog overlay
  visited      → full color, glowing edge
  saved        → bookmark indicator
  recommended  → gentle pulse animation
  wrong_path   → different texture/color
                 "many came here first"
                 honest, not shameful
```

---

## Search Implementation

```
TWO MODES (seamless to user):

Text search (fast, always works offline):
  Supabase full text search
  title_si, title_ta, title_en
  Cached in MMKV

Semantic search (when online):
  pgvector cosine similarity
  User query → embedding → nearest nodes
  Falls back to text search if offline
  
DEBOUNCE: 300ms
MINIMUM QUERY LENGTH: 2 characters
RESULTS LIMIT: 20 per page
```

---

## Localization

```typescript
// Every piece of content has three language fields
// Helper to get best available text for user

export const getLocalizedText = (
  text: LocalizedText,
  preferred: Language,
  fallback: Language = 'en'
): string => {
  return text[preferred] 
    || text[fallback] 
    || text.si 
    || text.ta 
    || text.en 
    || ''
}
```

---

## Performance Rules

```
MANDATORY FOR EVERY LIST:
  Use FlashList, never FlatList
  estimatedItemSize must be set
  
MANDATORY FOR EVERY IMAGE:
  Use expo-image, never Image
  Set blurhash placeholder
  contentFit="cover"
  
MANDATORY FOR EVERY SCREEN:
  Read MMKV cache first
  Show cached data immediately
  Fetch fresh in background
  Update silently
  
MANDATORY FOR MAP:
  Never render more than 30 nodes
  Never compute layout on device
  Always use pre-computed coordinates
  
MANDATORY FOR ANIMATIONS:
  useNativeDriver: true always
  No JS-thread animations
  Reanimated worklets only
  
FORBIDDEN:
  FlatList (use FlashList)
  Image from react-native (use expo-image)
  Skia for map rendering
  Layout computation on device
  Blocking the JS thread
```

---

## Web Compatibility

```
The @repo/library package must work on:
  - React Native (mobile)
  - React (web, Vite)
  - Expo Router web target

Rules for shared components:
  - No react-native-svg on web
    → use regular SVG elements
  - No MMKV on web
    → use localStorage or memory
  - No FlashList on web  
    → use windowed list or virtual scroll
  - expo-image works on web ✅
  - Zustand works everywhere ✅
  - React Query works everywhere ✅

Strategy:
  Platform checks where needed:
  import { Platform } from 'react-native'
  
  Or separate implementations:
  ResourceList.native.tsx
  ResourceList.web.tsx
  Same props, different internals
```

---

## FAB — Add Resource

```
Existing FAB to add resources.
For now — simple manual entry form.
Later — ETL pipeline feeds staging.
Admin reviews staging → publishes to library.

FAB opens bottom sheet with:
  - URL input (auto-fetches metadata)
  - Title (localized fields)
  - Content type selector
  - Language selector
  - Grade level multi-select
  - Subject multi-select
  - Target roles multi-select
  - Submit → goes to staging table
             not directly to production
```

---

## What NOT To Build Yet

```
NOT YET:
  - ETL pipeline (separate spec)
  - AI guide/companion
  - Recommendation engine
  - Telegram bot intake
  - Full semantic search
    (text search first, semantic later)
  - 3D map
  - Community features in library
  - Admin review UI

KEEP DOOR OPEN FOR:
  - Multiple view modes (list/map/collection)
  - AB testing infrastructure
  - Web-specific rich map (WebGL)
  - AI companion integration point
  - Recommendation hooks (stub them)
```

---

## Definition of Done

Library feature is complete when:

```
✓ @repo/library package builds cleanly
✓ TypeScript types complete, no any
✓ Supabase tables created with RLS policies
✓ Search works (text, debounced, cached)
✓ Filters work (content type, language, grade)
✓ FlashList renders resources smoothly
✓ expo-image loads with blurhash placeholder
✓ Collections display correctly
✓ Offline shows cached content instantly
✓ Map view renders with SVG (30 nodes max)
✓ Map unlock works after 5 explored nodes
✓ Journey recording works silently
✓ FAB opens add resource sheet
✓ Localization helper works (si/ta/en)
✓ Works on Android 2GB RAM device
✓ Web builds without errors
✓ No FlatList, no Image, no Skia for map
```

---

## Seed Data

Add at least 10 real resources before testing UI.
Without real content the Trübe doesn't work.

Suggested seed sources (all free and legal):
- NIE Sri Lanka (nie.lk) — curriculum documents
- Ministry of Education Sri Lanka — circulars
- UNESCO open educational resources
- Internet Archive — Sri Lanka education texts

---

*The library is not a feature.*
*It is the Trübe made navigable.*
*Build it accordingly.*
