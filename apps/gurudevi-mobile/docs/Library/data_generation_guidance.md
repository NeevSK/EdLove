---
title: "AI Data Generation Guidance: GuruDevi Epistemic Universe"
status: "active"
created: 2026-03-13
updated: 2026-03-13
author: "Naveen"
scribe: "opencode"
tags: [apps, gurudevi-mobile]
---

# AI Data Generation Guidance: GuruDevi Epistemic Universe

To populate the library with rich, interconnected data using AI, follow this schema and ingestion strategy.

## 1. Targeted JSON Structure for AI
Use the following structure for prompting your LLM (e.g., GPT-4o or Claude 3.5 Sonnet).

```json
{
  "nodes": [
    {
      "id": "intro-to-breath-001",
      "type": "lesson",
      "title": "Introduction to Diaphragmatic Breathing",
      "title_si": "මහාප්‍රාණ ස්වසනය පිළිබඳ හැඳින්වීම",
      "title_ta": "உதரவிதான சுவாசம் பற்றிய அறிமுகம்",
      "description": "Learn the foundation of effective breathing for stress reduction.",
      "description_si": "ආතතිය අවම කර ගැනීම සඳහා නිවැරදි ස්වසන ක්‍රම පිළිබඳ ඉගෙන ගන්න.",
      "description_en": "Learn the foundation of effective breathing for stress reduction.",
      "subjects": ["Mindfulness", "Internal Science"],
      "topics": ["Stress Management", "Breathwork"],
      "language": ["en", "si", "ta"],
      "difficulty": "beginner",
      "is_community": false,
      "verified": true,
      "creator_name": "Architect",
      "creator_role": "admin",
      "tags": ["core", "breath", "intro"]
    }
  ],
  "edges": [
    {
      "source_id": "intro-to-breath-001",
      "target_id": "advanced-breath-002",
      "relationship": "prerequisite",
      "weight": 1.0
    }
  ]
}
```

## 2. Table Mappings & Logic
Ensure AI understands the distinction between Core and Community content:

| Field | Core (AI/Staff) | Community (User) |
|-------|-----------------|------------------|
| `is_community` | `false` | `true` |
| `verified` | `true` | `false` (until curated) |
| `creator_name`| "Architect" | Actual User Name |
| `points` | 0 | +50 on upload |

### Technical Specs:
- **Subjects**: `TEXT[]` array (e.g., "Math", "Health").
- **Local Language**: Provide `title_si`, `title_ta`, etc.
- **Embeddings**: Handled automatically by the `library-etl` Edge Function (1536 dimensions).

## 3. Data Ingestion Flow (The ETL Pipeline)

1. **Step 1: Raw Generation**. Generate JSON clusters of 10-20 interconnected nodes.
2. **Step 2: Database Insert**. Push to the `nodes` and `edges` tables via Supabase API or SQL.
3. **Step 3: Trigger Enrichment**. Call the `library-etl` edge function for each new node:
   ```bash
   curl -X POST https://[project].supabase.co/functions/v1/library-etl \
     -H "Authorization: Bearer [key]" \
     -d '{"action": "enrich", "resourceId": "[uuid]"}'
   ```
   *This generates vector embeddings and extracts additional SEO topics.*

## 4. Prompting Strategy
> "You are the GuruDevi Epistemic Architect. Your task is to design a cluster of 15 interconnected nodes about 'Oceanic Biology'. Provide output in the defined JSON format, ensuring 'is_community' is false and 'verified' is true. Include prerequisites and localized headers for si/ta."

---
*Last Updated: March 2026 | Part of the GuruDevi Documentation Series*
