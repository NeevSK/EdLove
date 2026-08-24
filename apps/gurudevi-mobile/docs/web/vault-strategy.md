---
title: "Vault Strategy: Resource Preservation"
status: "active"
created: 2026-03-04
updated: 2026-03-04
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# Vault Strategy: Resource Preservation

The vault strategy ensures that critical community resources (documents, videos, etc.) are permanently preserved by hosting them within Supabase Storage and syncing metadata to the local "Local Seed" database.

## 1. Storage Tiers
- **Ephemeral**: External links that may expire.
- **Archival**: Resources downloaded and re-hosted in the Gurudevi Vault (Supabase Storage).
- **Seed**: Critical resources bundled with the app for initial offline access.

## 2. Preserved Links
The `link_status` and `last_checked_at` fields in `library_resources` track the reliability of resources.
Resources marked as 'Preserved' are served directly from the Vault.

## 3. Local Sync
The `knowledgeSync` engine ensures that the most relevant 'Vaulted' resource metadata is always available in the local SQLite database.
