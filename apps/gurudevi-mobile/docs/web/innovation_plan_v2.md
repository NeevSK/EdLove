# Phase 2 Innovation Implementation Plan

This document outlines the technical implementation of **Local Seed** and **Community Aura** in the Gurudevi platform.

## 1. Local Seed (SQLite Sync)
Extends the unidirectional sync to include map layers and advanced coordinate metadata for offline-first map exploration.

### Changes:
- **`database.ts`**: Updated `knowledge_index` with `latitude`, `longitude`, `parent_id`, and `island_id`. Added `map_layers_index`.
- **`sync.ts`**: Refined `performSync` to fetch `map_layers` and resources with full coordinate data.
- **Dependency**: Added `expo-location` to `@repo/library`.

## 2. Community Aura (Realtime Map Presence)
Visualizes active community members on the map using Supabase Realtime Presence.

### Changes:
- **`useMapPresence.ts`**: New hook for tracking and syncing user location via presence channels. Includes privacy rounding (3 decimal places).
- **`MapScreen.tsx`**: Integrated location tracking and "Aura" visualization. pulsing effects and vibe-based coloring.

## 3. Benefits:
- **Privacy First**: Locations are never stored in the database; they only exist in ephemeral realtime channels.
- **Offline Resilience**: Local Seed ensures the map structure is navigable without a connection.
- **Sense of Togetherness**: Community Aura turns a static map into a living trübe of shared wisdom.
