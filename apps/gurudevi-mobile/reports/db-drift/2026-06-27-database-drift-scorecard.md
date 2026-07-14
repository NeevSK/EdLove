---
title: "Database and ZenStack Drift Scorecard"
status: "active"
created: 2026-06-27
updated: 2026-06-27
author: "Sovereign Audit System"
scribe: "Antigravity"
tags: [architecture, database, score, audit]
---

# Database and ZenStack Drift Scorecard

## Provenance

- ZModel source: `packages/schema/schema.zmodel`
- DB source: linked Supabase via CLI
- Ignore source: `.driftignore.ast.json`

## Confidence Model

- Structural checks: high confidence
- RLS presence check: high confidence
- Policy equivalence: partial confidence unless manually reviewed
- Ignore decisions: require explicit governance

## Summary

| Metric | Value |
| :--- | ---: |
| Score | 77/100 |
| ZModel tables | 50 |
| DB tables | 158 |
| Ignored DB tables | 1 |
| Total checks | 1480 |
| Passed checks | 1138 |
| Structural drifts | 341 |
| Policy drifts | 1 |

## Drift Counts

| Category | Count |
| :--- | :---: |
| TABLE_MISSING | 11 |
| EXTRA_TABLE_IN_DB | 118 |
| COLUMN_MISSING_IN_DB | 26 |
| EXTRA_COLUMN_IN_DB | 89 |
| NULLABILITY_MISMATCH | 97 |
| RLS_LOCKOUT | 1 |

## Ignore Manifest Warnings

* ⚠️ Broad glob ignore pattern: pg_*

## Structural Drift

* **[NULLABILITY_MISMATCH]** [users] severity=medium, confidence=high: Column "subjects_taught" on "users" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [users] severity=medium, confidence=high: Column "qualifications" on "users" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [classroom_students] severity=medium, confidence=high: Column "student_id" on "classroom_students" differs in nullability: ZModel optional=false, DB nullable=true.
* **[COLUMN_MISSING_IN_DB]** [classroom_students] severity=high, confidence=high: Column "status" is declared in ZModel but missing in "classroom_students".
* **[COLUMN_MISSING_IN_DB]** [classroom_students] severity=high, confidence=high: Column "joined_at" is declared in ZModel but missing in "classroom_students".
* **[EXTRA_COLUMN_IN_DB]** [classroom_students] severity=medium, confidence=high: Column "full_name" exists in the remote DB but is not modeled in ZModel for "classroom_students".
* **[EXTRA_COLUMN_IN_DB]** [classroom_students] severity=medium, confidence=high: Column "invite_code" exists in the remote DB but is not modeled in ZModel for "classroom_students".
* **[EXTRA_COLUMN_IN_DB]** [classroom_students] severity=medium, confidence=high: Column "roll_number" exists in the remote DB but is not modeled in ZModel for "classroom_students".
* **[EXTRA_COLUMN_IN_DB]** [classroom_students] severity=medium, confidence=high: Column "enrolled_at" exists in the remote DB but is not modeled in ZModel for "classroom_students".
* **[EXTRA_COLUMN_IN_DB]** [classroom_students] severity=medium, confidence=high: Column "claimed_at" exists in the remote DB but is not modeled in ZModel for "classroom_students".
* **[NULLABILITY_MISMATCH]** [assignments] severity=medium, confidence=high: Column "max_points" on "assignments" differs in nullability: ZModel optional=false, DB nullable=true.
* **[COLUMN_MISSING_IN_DB]** [assignments] severity=high, confidence=high: Column "updated_at" is declared in ZModel but missing in "assignments".
* **[NULLABILITY_MISMATCH]** [student_grades] severity=medium, confidence=high: Column "classroom_id" on "student_grades" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [student_grades] severity=medium, confidence=high: Column "student_id" on "student_grades" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [student_grades] severity=medium, confidence=high: Column "graded_by" on "student_grades" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [student_grades] severity=medium, confidence=high: Column "marks" on "student_grades" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [student_grades] severity=medium, confidence=high: Column "grade" on "student_grades" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [student_grades] severity=medium, confidence=high: Column "gpa" on "student_grades" differs in nullability: ZModel optional=false, DB nullable=true.
* **[COLUMN_MISSING_IN_DB]** [student_grades] severity=high, confidence=high: Column "publication_state" is declared in ZModel but missing in "student_grades".
* **[COLUMN_MISSING_IN_DB]** [student_grades] severity=high, confidence=high: Column "published_at" is declared in ZModel but missing in "student_grades".
* **[COLUMN_MISSING_IN_DB]** [student_grades] severity=high, confidence=high: Column "published_by" is declared in ZModel but missing in "student_grades".
* **[COLUMN_MISSING_IN_DB]** [student_grades] severity=high, confidence=high: Column "publication_action" is declared in ZModel but missing in "student_grades".
* **[COLUMN_MISSING_IN_DB]** [student_grades] severity=high, confidence=high: Column "created_at" is declared in ZModel but missing in "student_grades".
* **[NULLABILITY_MISMATCH]** [student_grades] severity=medium, confidence=high: Column "updated_at" on "student_grades" differs in nullability: ZModel optional=false, DB nullable=true.
* **[EXTRA_COLUMN_IN_DB]** [student_grades] severity=medium, confidence=high: Column "graded_at" exists in the remote DB but is not modeled in ZModel for "student_grades".
* **[EXTRA_COLUMN_IN_DB]** [student_grades] severity=medium, confidence=high: Column "deleted_at" exists in the remote DB but is not modeled in ZModel for "student_grades".
* **[EXTRA_COLUMN_IN_DB]** [student_grades] severity=medium, confidence=high: Column "idempotency_key" exists in the remote DB but is not modeled in ZModel for "student_grades".
* **[TABLE_MISSING]** [classroom_grading_settings] severity=high, confidence=high: Table "classroom_grading_settings" exists in ZModel but not in the remote database.
* **[NULLABILITY_MISMATCH]** [community_groups] severity=medium, confidence=high: Column "created_at" on "community_groups" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [community_group_members] severity=medium, confidence=high: Column "user_id" on "community_group_members" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [community_group_members] severity=medium, confidence=high: Column "group_id" on "community_group_members" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [community_group_members] severity=medium, confidence=high: Column "role" on "community_group_members" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [community_group_members] severity=medium, confidence=high: Column "status" on "community_group_members" differs in nullability: ZModel optional=false, DB nullable=true.
* **[EXTRA_COLUMN_IN_DB]** [community_group_members] severity=medium, confidence=high: Column "joined_at" exists in the remote DB but is not modeled in ZModel for "community_group_members".
* **[NULLABILITY_MISMATCH]** [community_posts] severity=medium, confidence=high: Column "group_id" on "community_posts" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [community_posts] severity=medium, confidence=high: Column "author_id" on "community_posts" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [community_posts] severity=medium, confidence=high: Column "created_at" on "community_posts" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [community_posts] severity=medium, confidence=high: Column "updated_at" on "community_posts" differs in nullability: ZModel optional=false, DB nullable=true.
* **[EXTRA_COLUMN_IN_DB]** [group_messages] severity=medium, confidence=high: Column "updated_at" exists in the remote DB but is not modeled in ZModel for "group_messages".
* **[EXTRA_COLUMN_IN_DB]** [group_messages] severity=medium, confidence=high: Column "deleted_at" exists in the remote DB but is not modeled in ZModel for "group_messages".
* **[EXTRA_COLUMN_IN_DB]** [group_messages] severity=medium, confidence=high: Column "idempotency_key" exists in the remote DB but is not modeled in ZModel for "group_messages".
* **[NULLABILITY_MISMATCH]** [community_reactions] severity=medium, confidence=high: Column "post_id" on "community_reactions" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [community_reactions] severity=medium, confidence=high: Column "user_id" on "community_reactions" differs in nullability: ZModel optional=false, DB nullable=true.
* **[EXTRA_COLUMN_IN_DB]** [community_reactions] severity=medium, confidence=high: Column "created_at" exists in the remote DB but is not modeled in ZModel for "community_reactions".
* **[NULLABILITY_MISMATCH]** [lessons] severity=medium, confidence=high: Column "order_index" on "lessons" differs in nullability: ZModel optional=false, DB nullable=true.
* **[COLUMN_MISSING_IN_DB]** [lessons] severity=high, confidence=high: Column "updated_at" is declared in ZModel but missing in "lessons".
* **[NULLABILITY_MISMATCH]** [lesson_materials] severity=medium, confidence=high: Column "is_pinned" on "lesson_materials" differs in nullability: ZModel optional=false, DB nullable=true.
* **[COLUMN_MISSING_IN_DB]** [attendance] severity=high, confidence=high: Column "id" is declared in ZModel but missing in "attendance".
* **[COLUMN_MISSING_IN_DB]** [attendance] severity=high, confidence=high: Column "created_at" is declared in ZModel but missing in "attendance".
* **[COLUMN_MISSING_IN_DB]** [attendance] severity=high, confidence=high: Column "updated_at" is declared in ZModel but missing in "attendance".
* **[COLUMN_MISSING_IN_DB]** [attendance] severity=high, confidence=high: Column "occurred_at" is declared in ZModel but missing in "attendance".
* **[COLUMN_MISSING_IN_DB]** [attendance] severity=high, confidence=high: Column "academic_cycle_id" is declared in ZModel but missing in "attendance".
* **[EXTRA_COLUMN_IN_DB]** [attendance] severity=medium, confidence=high: Column "idempotency_key" exists in the remote DB but is not modeled in ZModel for "attendance".
* **[NULLABILITY_MISMATCH]** [schools] severity=medium, confidence=high: Column "created_at" on "schools" differs in nullability: ZModel optional=false, DB nullable=true.
* **[COLUMN_MISSING_IN_DB]** [inventory_items] severity=high, confidence=high: Column "classroom_id" is declared in ZModel but missing in "inventory_items".
* **[NULLABILITY_MISMATCH]** [inventory_items] severity=medium, confidence=high: Column "condition" on "inventory_items" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [inventory_items] severity=medium, confidence=high: Column "created_at" on "inventory_items" differs in nullability: ZModel optional=false, DB nullable=true.
* **[COLUMN_MISSING_IN_DB]** [inventory_items] severity=high, confidence=high: Column "updated_at" is declared in ZModel but missing in "inventory_items".
* **[EXTRA_COLUMN_IN_DB]** [inventory_items] severity=medium, confidence=high: Column "school_id" exists in the remote DB but is not modeled in ZModel for "inventory_items".
* **[EXTRA_COLUMN_IN_DB]** [inventory_items] severity=medium, confidence=high: Column "unit" exists in the remote DB but is not modeled in ZModel for "inventory_items".
* **[EXTRA_COLUMN_IN_DB]** [inventory_items] severity=medium, confidence=high: Column "location" exists in the remote DB but is not modeled in ZModel for "inventory_items".
* **[EXTRA_COLUMN_IN_DB]** [inventory_items] severity=medium, confidence=high: Column "last_audit_at" exists in the remote DB but is not modeled in ZModel for "inventory_items".
* **[EXTRA_COLUMN_IN_DB]** [inventory_items] severity=medium, confidence=high: Column "local_sync_id" exists in the remote DB but is not modeled in ZModel for "inventory_items".
* **[EXTRA_COLUMN_IN_DB]** [inventory_items] severity=medium, confidence=high: Column "is_pending_sync" exists in the remote DB but is not modeled in ZModel for "inventory_items".
* **[EXTRA_COLUMN_IN_DB]** [inventory_items] severity=medium, confidence=high: Column "valid_from" exists in the remote DB but is not modeled in ZModel for "inventory_items".
* **[EXTRA_COLUMN_IN_DB]** [inventory_items] severity=medium, confidence=high: Column "valid_to" exists in the remote DB but is not modeled in ZModel for "inventory_items".
* **[EXTRA_COLUMN_IN_DB]** [mood_logs] severity=medium, confidence=high: Column "idempotency_key" exists in the remote DB but is not modeled in ZModel for "mood_logs".
* **[NULLABILITY_MISMATCH]** [fire_journal] severity=medium, confidence=high: Column "content_preview" on "fire_journal" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [fire_journal] severity=medium, confidence=high: Column "is_burned" on "fire_journal" differs in nullability: ZModel optional=false, DB nullable=true.
* **[EXTRA_COLUMN_IN_DB]** [fire_journal] severity=medium, confidence=high: Column "burned_at" exists in the remote DB but is not modeled in ZModel for "fire_journal".
* **[NULLABILITY_MISMATCH]** [user_preferences] severity=medium, confidence=high: Column "favorite_features" on "user_preferences" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [user_preferences] severity=medium, confidence=high: Column "hidden_features" on "user_preferences" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [user_preferences] severity=medium, confidence=high: Column "enable_contextual_prompts" on "user_preferences" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [user_preferences] severity=medium, confidence=high: Column "enable_usage_tracking" on "user_preferences" differs in nullability: ZModel optional=false, DB nullable=true.
* **[EXTRA_COLUMN_IN_DB]** [user_preferences] severity=medium, confidence=high: Column "language" exists in the remote DB but is not modeled in ZModel for "user_preferences".
* **[EXTRA_COLUMN_IN_DB]** [user_preferences] severity=medium, confidence=high: Column "theme" exists in the remote DB but is not modeled in ZModel for "user_preferences".
* **[EXTRA_COLUMN_IN_DB]** [user_preferences] severity=medium, confidence=high: Column "data_saver_mode" exists in the remote DB but is not modeled in ZModel for "user_preferences".
* **[EXTRA_COLUMN_IN_DB]** [user_preferences] severity=medium, confidence=high: Column "orientation_seeds" exists in the remote DB but is not modeled in ZModel for "user_preferences".
* **[EXTRA_COLUMN_IN_DB]** [user_preferences] severity=medium, confidence=high: Column "deleted_at" exists in the remote DB but is not modeled in ZModel for "user_preferences".
* **[NULLABILITY_MISMATCH]** [nodes] severity=medium, confidence=high: Column "type" on "nodes" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [nodes] severity=medium, confidence=high: Column "format" on "nodes" differs in nullability: ZModel optional=false, DB nullable=true.
* **[COLUMN_MISSING_IN_DB]** [nodes] severity=high, confidence=high: Column "file_path" is declared in ZModel but missing in "nodes".
* **[NULLABILITY_MISMATCH]** [nodes] severity=medium, confidence=high: Column "subjects" on "nodes" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [nodes] severity=medium, confidence=high: Column "topics" on "nodes" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [nodes] severity=medium, confidence=high: Column "grades" on "nodes" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [nodes] severity=medium, confidence=high: Column "language" on "nodes" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [nodes] severity=medium, confidence=high: Column "visibility" on "nodes" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [nodes] severity=medium, confidence=high: Column "creator_id" on "nodes" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [nodes] severity=medium, confidence=high: Column "creator_role" on "nodes" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [nodes] severity=medium, confidence=high: Column "verified" on "nodes" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [nodes] severity=medium, confidence=high: Column "is_community" on "nodes" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [nodes] severity=medium, confidence=high: Column "views" on "nodes" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [nodes] severity=medium, confidence=high: Column "uses_count" on "nodes" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [nodes] severity=medium, confidence=high: Column "endorsements" on "nodes" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [nodes] severity=medium, confidence=high: Column "bookmarks" on "nodes" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [nodes] severity=medium, confidence=high: Column "created_at" on "nodes" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [nodes] severity=medium, confidence=high: Column "updated_at" on "nodes" differs in nullability: ZModel optional=false, DB nullable=true.
* **[EXTRA_COLUMN_IN_DB]** [nodes] severity=medium, confidence=high: Column "school_id" exists in the remote DB but is not modeled in ZModel for "nodes".
* **[EXTRA_COLUMN_IN_DB]** [nodes] severity=medium, confidence=high: Column "thumbnail_url" exists in the remote DB but is not modeled in ZModel for "nodes".
* **[EXTRA_COLUMN_IN_DB]** [nodes] severity=medium, confidence=high: Column "creator_name" exists in the remote DB but is not modeled in ZModel for "nodes".
* **[EXTRA_COLUMN_IN_DB]** [nodes] severity=medium, confidence=high: Column "tags" exists in the remote DB but is not modeled in ZModel for "nodes".
* **[EXTRA_COLUMN_IN_DB]** [nodes] severity=medium, confidence=high: Column "verified_by" exists in the remote DB but is not modeled in ZModel for "nodes".
* **[EXTRA_COLUMN_IN_DB]** [nodes] severity=medium, confidence=high: Column "curriculum_aligned" exists in the remote DB but is not modeled in ZModel for "nodes".
* **[EXTRA_COLUMN_IN_DB]** [nodes] severity=medium, confidence=high: Column "copyright_notice" exists in the remote DB but is not modeled in ZModel for "nodes".
* **[EXTRA_COLUMN_IN_DB]** [nodes] severity=medium, confidence=high: Column "embedding" exists in the remote DB but is not modeled in ZModel for "nodes".
* **[EXTRA_COLUMN_IN_DB]** [nodes] severity=medium, confidence=high: Column "search_vector" exists in the remote DB but is not modeled in ZModel for "nodes".
* **[EXTRA_COLUMN_IN_DB]** [nodes] severity=medium, confidence=high: Column "is_geographic" exists in the remote DB but is not modeled in ZModel for "nodes".
* **[EXTRA_COLUMN_IN_DB]** [nodes] severity=medium, confidence=high: Column "latitude" exists in the remote DB but is not modeled in ZModel for "nodes".
* **[EXTRA_COLUMN_IN_DB]** [nodes] severity=medium, confidence=high: Column "longitude" exists in the remote DB but is not modeled in ZModel for "nodes".
* **[EXTRA_COLUMN_IN_DB]** [nodes] severity=medium, confidence=high: Column "map_x" exists in the remote DB but is not modeled in ZModel for "nodes".
* **[EXTRA_COLUMN_IN_DB]** [nodes] severity=medium, confidence=high: Column "map_y" exists in the remote DB but is not modeled in ZModel for "nodes".
* **[EXTRA_COLUMN_IN_DB]** [nodes] severity=medium, confidence=high: Column "parent_node_id" exists in the remote DB but is not modeled in ZModel for "nodes".
* **[EXTRA_COLUMN_IN_DB]** [nodes] severity=medium, confidence=high: Column "island_id" exists in the remote DB but is not modeled in ZModel for "nodes".
* **[EXTRA_COLUMN_IN_DB]** [nodes] severity=medium, confidence=high: Column "link_status" exists in the remote DB but is not modeled in ZModel for "nodes".
* **[EXTRA_COLUMN_IN_DB]** [nodes] severity=medium, confidence=high: Column "last_checked_at" exists in the remote DB but is not modeled in ZModel for "nodes".
* **[EXTRA_COLUMN_IN_DB]** [nodes] severity=medium, confidence=high: Column "fail_count" exists in the remote DB but is not modeled in ZModel for "nodes".
* **[EXTRA_COLUMN_IN_DB]** [nodes] severity=medium, confidence=high: Column "title_si" exists in the remote DB but is not modeled in ZModel for "nodes".
* **[EXTRA_COLUMN_IN_DB]** [nodes] severity=medium, confidence=high: Column "title_ta" exists in the remote DB but is not modeled in ZModel for "nodes".
* **[EXTRA_COLUMN_IN_DB]** [nodes] severity=medium, confidence=high: Column "title_en" exists in the remote DB but is not modeled in ZModel for "nodes".
* **[EXTRA_COLUMN_IN_DB]** [nodes] severity=medium, confidence=high: Column "description_si" exists in the remote DB but is not modeled in ZModel for "nodes".
* **[EXTRA_COLUMN_IN_DB]** [nodes] severity=medium, confidence=high: Column "description_ta" exists in the remote DB but is not modeled in ZModel for "nodes".
* **[EXTRA_COLUMN_IN_DB]** [nodes] severity=medium, confidence=high: Column "description_en" exists in the remote DB but is not modeled in ZModel for "nodes".
* **[EXTRA_COLUMN_IN_DB]** [nodes] severity=medium, confidence=high: Column "license" exists in the remote DB but is not modeled in ZModel for "nodes".
* **[EXTRA_COLUMN_IN_DB]** [nodes] severity=medium, confidence=high: Column "is_ministry_official" exists in the remote DB but is not modeled in ZModel for "nodes".
* **[EXTRA_COLUMN_IN_DB]** [nodes] severity=medium, confidence=high: Column "media" exists in the remote DB but is not modeled in ZModel for "nodes".
* **[NULLABILITY_MISMATCH]** [collections] severity=medium, confidence=high: Column "creator_id" on "collections" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [collections] severity=medium, confidence=high: Column "visibility" on "collections" differs in nullability: ZModel optional=false, DB nullable=true.
* **[COLUMN_MISSING_IN_DB]** [collections] severity=high, confidence=high: Column "topics" is declared in ZModel but missing in "collections".
* **[NULLABILITY_MISMATCH]** [collections] severity=medium, confidence=high: Column "created_at" on "collections" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [collections] severity=medium, confidence=high: Column "updated_at" on "collections" differs in nullability: ZModel optional=false, DB nullable=true.
* **[EXTRA_COLUMN_IN_DB]** [collections] severity=medium, confidence=high: Column "is_public" exists in the remote DB but is not modeled in ZModel for "collections".
* **[EXTRA_COLUMN_IN_DB]** [collections] severity=medium, confidence=high: Column "icon_emoji" exists in the remote DB but is not modeled in ZModel for "collections".
* **[EXTRA_COLUMN_IN_DB]** [collections] severity=medium, confidence=high: Column "metadata" exists in the remote DB but is not modeled in ZModel for "collections".
* **[EXTRA_COLUMN_IN_DB]** [collections] severity=medium, confidence=high: Column "verified" exists in the remote DB but is not modeled in ZModel for "collections".
* **[EXTRA_COLUMN_IN_DB]** [collections] severity=medium, confidence=high: Column "type" exists in the remote DB but is not modeled in ZModel for "collections".
* **[EXTRA_COLUMN_IN_DB]** [collections] severity=medium, confidence=high: Column "subject" exists in the remote DB but is not modeled in ZModel for "collections".
* **[EXTRA_COLUMN_IN_DB]** [collections] severity=medium, confidence=high: Column "resource_ids" exists in the remote DB but is not modeled in ZModel for "collections".
* **[EXTRA_COLUMN_IN_DB]** [collections] severity=medium, confidence=high: Column "sequence_order" exists in the remote DB but is not modeled in ZModel for "collections".
* **[EXTRA_COLUMN_IN_DB]** [collections] severity=medium, confidence=high: Column "is_official" exists in the remote DB but is not modeled in ZModel for "collections".
* **[EXTRA_COLUMN_IN_DB]** [collections] severity=medium, confidence=high: Column "forks" exists in the remote DB but is not modeled in ZModel for "collections".
* **[EXTRA_COLUMN_IN_DB]** [collections] severity=medium, confidence=high: Column "used_by_count" exists in the remote DB but is not modeled in ZModel for "collections".
* **[EXTRA_COLUMN_IN_DB]** [collections] severity=medium, confidence=high: Column "endorsements" exists in the remote DB but is not modeled in ZModel for "collections".
* **[EXTRA_COLUMN_IN_DB]** [collections] severity=medium, confidence=high: Column "estimated_duration" exists in the remote DB but is not modeled in ZModel for "collections".
* **[EXTRA_COLUMN_IN_DB]** [collections] severity=medium, confidence=high: Column "school_id" exists in the remote DB but is not modeled in ZModel for "collections".
* **[EXTRA_COLUMN_IN_DB]** [collections] severity=medium, confidence=high: Column "original_collection_id" exists in the remote DB but is not modeled in ZModel for "collections".
* **[NULLABILITY_MISMATCH]** [resource_engagements] severity=medium, confidence=high: Column "resource_id" on "resource_engagements" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [resource_engagements] severity=medium, confidence=high: Column "user_id" on "resource_engagements" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [resource_engagements] severity=medium, confidence=high: Column "created_at" on "resource_engagements" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [thuthimal_gifts] severity=medium, confidence=high: Column "gifter_name" on "thuthimal_gifts" differs in nullability: ZModel optional=true, DB nullable=false.
* **[NULLABILITY_MISMATCH]** [thuthimal_gifts] severity=medium, confidence=high: Column "recipient_role" on "thuthimal_gifts" differs in nullability: ZModel optional=true, DB nullable=false.
* **[COLUMN_MISSING_IN_DB]** [thuthimal_gifts] severity=high, confidence=high: Column "gift_message" is declared in ZModel but missing in "thuthimal_gifts".
* **[EXTRA_COLUMN_IN_DB]** [thuthimal_gifts] severity=medium, confidence=high: Column "deleted_at" exists in the remote DB but is not modeled in ZModel for "thuthimal_gifts".
* **[NULLABILITY_MISMATCH]** [impact_ripples] severity=medium, confidence=high: Column "actor_user_id" on "impact_ripples" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [impact_ripples] severity=medium, confidence=high: Column "warm_message_en" on "impact_ripples" differs in nullability: ZModel optional=true, DB nullable=false.
* **[NULLABILITY_MISMATCH]** [impact_ripples] severity=medium, confidence=high: Column "delivered" on "impact_ripples" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [impact_ripples] severity=medium, confidence=high: Column "created_at" on "impact_ripples" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [whispered_moments] severity=medium, confidence=high: Column "awarded_at" on "whispered_moments" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [growth_events] severity=medium, confidence=high: Column "created_at" on "growth_events" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [user_growth_state] severity=medium, confidence=high: Column "presence_signals" on "user_growth_state" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [user_growth_state] severity=medium, confidence=high: Column "nourishing_signals" on "user_growth_state" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [user_growth_state] severity=medium, confidence=high: Column "witnessing_signals" on "user_growth_state" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [user_growth_state] severity=medium, confidence=high: Column "weaving_signals" on "user_growth_state" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [user_growth_state] severity=medium, confidence=high: Column "blooming_signals" on "user_growth_state" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [user_growth_state] severity=medium, confidence=high: Column "peer_mentored_count" on "user_growth_state" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [user_growth_state] severity=medium, confidence=high: Column "circles_facilitated_count" on "user_growth_state" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [user_growth_state] severity=medium, confidence=high: Column "lessons_completed_count" on "user_growth_state" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [user_growth_state] severity=medium, confidence=high: Column "reflections_submitted_count" on "user_growth_state" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [user_growth_state] severity=medium, confidence=high: Column "crystals_found_count" on "user_growth_state" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [user_growth_state] severity=medium, confidence=high: Column "fractal_moments_count" on "user_growth_state" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [user_growth_state] severity=medium, confidence=high: Column "last_seen_at" on "user_growth_state" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [user_growth_state] severity=medium, confidence=high: Column "created_at" on "user_growth_state" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [user_growth_state] severity=medium, confidence=high: Column "updated_at" on "user_growth_state" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [sanctuary_manifestos] severity=medium, confidence=high: Column "status" on "sanctuary_manifestos" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [sanctuary_manifestos] severity=medium, confidence=high: Column "created_at" on "sanctuary_manifestos" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [sanctuary_manifestos] severity=medium, confidence=high: Column "updated_at" on "sanctuary_manifestos" differs in nullability: ZModel optional=false, DB nullable=true.
* **[COLUMN_MISSING_IN_DB]** [sanctuary_manifestos] severity=high, confidence=high: Column "endorsement_count" is declared in ZModel but missing in "sanctuary_manifestos".
* **[NULLABILITY_MISMATCH]** [manifesto_endorsements] severity=medium, confidence=high: Column "created_at" on "manifesto_endorsements" differs in nullability: ZModel optional=false, DB nullable=true.
* **[COLUMN_MISSING_IN_DB]** [sections] severity=high, confidence=high: Column "updated_at" is declared in ZModel but missing in "sections".
* **[EXTRA_COLUMN_IN_DB]** [sections] severity=medium, confidence=high: Column "name_si" exists in the remote DB but is not modeled in ZModel for "sections".
* **[EXTRA_COLUMN_IN_DB]** [sections] severity=medium, confidence=high: Column "name_ta" exists in the remote DB but is not modeled in ZModel for "sections".
* **[EXTRA_COLUMN_IN_DB]** [sections] severity=medium, confidence=high: Column "grade_range" exists in the remote DB but is not modeled in ZModel for "sections".
* **[EXTRA_COLUMN_IN_DB]** [sections] severity=medium, confidence=high: Column "section_head_id" exists in the remote DB but is not modeled in ZModel for "sections".
* **[EXTRA_COLUMN_IN_DB]** [sections] severity=medium, confidence=high: Column "deleted_at" exists in the remote DB but is not modeled in ZModel for "sections".
* **[NULLABILITY_MISMATCH]** [grade_levels] severity=medium, confidence=high: Column "section_id" on "grade_levels" differs in nullability: ZModel optional=false, DB nullable=true.
* **[COLUMN_MISSING_IN_DB]** [grade_levels] severity=high, confidence=high: Column "number" is declared in ZModel but missing in "grade_levels".
* **[COLUMN_MISSING_IN_DB]** [grade_levels] severity=high, confidence=high: Column "updated_at" is declared in ZModel but missing in "grade_levels".
* **[EXTRA_COLUMN_IN_DB]** [grade_levels] severity=medium, confidence=high: Column "school_id" exists in the remote DB but is not modeled in ZModel for "grade_levels".
* **[EXTRA_COLUMN_IN_DB]** [grade_levels] severity=medium, confidence=high: Column "grade_number" exists in the remote DB but is not modeled in ZModel for "grade_levels".
* **[EXTRA_COLUMN_IN_DB]** [grade_levels] severity=medium, confidence=high: Column "grade_head_id" exists in the remote DB but is not modeled in ZModel for "grade_levels".
* **[EXTRA_COLUMN_IN_DB]** [grade_levels] severity=medium, confidence=high: Column "deleted_at" exists in the remote DB but is not modeled in ZModel for "grade_levels".
* **[NULLABILITY_MISMATCH]** [staff_leaves] severity=medium, confidence=high: Column "status" on "staff_leaves" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [staff_leaves] severity=medium, confidence=high: Column "created_at" on "staff_leaves" differs in nullability: ZModel optional=false, DB nullable=true.
* **[TABLE_MISSING]** [calendar_events] severity=high, confidence=high: Table "calendar_events" exists in ZModel but not in the remote database.
* **[TABLE_MISSING]** [accounts] severity=high, confidence=high: Table "accounts" exists in ZModel but not in the remote database.
* **[TABLE_MISSING]** [ledger_entries] severity=high, confidence=high: Table "ledger_entries" exists in ZModel but not in the remote database.
* **[TABLE_MISSING]** [financial_transactions] severity=high, confidence=high: Table "financial_transactions" exists in ZModel but not in the remote database.
* **[TABLE_MISSING]** [budgets] severity=high, confidence=high: Table "budgets" exists in ZModel but not in the remote database.
* **[TABLE_MISSING]** [pro_gifts] severity=high, confidence=high: Table "pro_gifts" exists in ZModel but not in the remote database.
* **[TABLE_MISSING]** [payment_intents] severity=high, confidence=high: Table "payment_intents" exists in ZModel but not in the remote database.
* **[TABLE_MISSING]** [invoices] severity=high, confidence=high: Table "invoices" exists in ZModel but not in the remote database.
* **[TABLE_MISSING]** [receipts] severity=high, confidence=high: Table "receipts" exists in ZModel but not in the remote database.
* **[COLUMN_MISSING_IN_DB]** [student_longitudinal_events] severity=high, confidence=high: Column "metadata" is declared in ZModel but missing in "student_longitudinal_events".
* **[COLUMN_MISSING_IN_DB]** [student_longitudinal_events] severity=high, confidence=high: Column "created_at" is declared in ZModel but missing in "student_longitudinal_events".
* **[COLUMN_MISSING_IN_DB]** [student_longitudinal_events] severity=high, confidence=high: Column "updated_at" is declared in ZModel but missing in "student_longitudinal_events".
* **[EXTRA_COLUMN_IN_DB]** [student_longitudinal_events] severity=medium, confidence=high: Column "school_id" exists in the remote DB but is not modeled in ZModel for "student_longitudinal_events".
* **[EXTRA_COLUMN_IN_DB]** [student_longitudinal_events] severity=medium, confidence=high: Column "grade_id" exists in the remote DB but is not modeled in ZModel for "student_longitudinal_events".
* **[EXTRA_COLUMN_IN_DB]** [student_longitudinal_events] severity=medium, confidence=high: Column "classroom_id" exists in the remote DB but is not modeled in ZModel for "student_longitudinal_events".
* **[EXTRA_COLUMN_IN_DB]** [student_longitudinal_events] severity=medium, confidence=high: Column "source_table" exists in the remote DB but is not modeled in ZModel for "student_longitudinal_events".
* **[EXTRA_COLUMN_IN_DB]** [student_longitudinal_events] severity=medium, confidence=high: Column "snapshot" exists in the remote DB but is not modeled in ZModel for "student_longitudinal_events".
* **[EXTRA_COLUMN_IN_DB]** [student_longitudinal_events] severity=medium, confidence=high: Column "effective_from" exists in the remote DB but is not modeled in ZModel for "student_longitudinal_events".
* **[EXTRA_COLUMN_IN_DB]** [student_longitudinal_events] severity=medium, confidence=high: Column "recorded_by" exists in the remote DB but is not modeled in ZModel for "student_longitudinal_events".
* **[TABLE_MISSING]** [sentinel_audit_logs] severity=high, confidence=high: Table "sentinel_audit_logs" exists in ZModel but not in the remote database.
* **[NULLABILITY_MISMATCH]** [feature_flags] severity=medium, confidence=high: Column "tenant_kinds" on "feature_flags" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [feature_flags] severity=medium, confidence=high: Column "citizenships" on "feature_flags" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [feature_flags] severity=medium, confidence=high: Column "pricing_tiers" on "feature_flags" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [feature_flags] severity=medium, confidence=high: Column "capacities" on "feature_flags" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [feature_flags] severity=medium, confidence=high: Column "created_at" on "feature_flags" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [feature_flags] severity=medium, confidence=high: Column "updated_at" on "feature_flags" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [school_registry] severity=medium, confidence=high: Column "id" on "school_registry" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [school_registry] severity=medium, confidence=high: Column "census_id" on "school_registry" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [school_registry] severity=medium, confidence=high: Column "name" on "school_registry" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [school_registry] severity=medium, confidence=high: Column "created_at" on "school_registry" differs in nullability: ZModel optional=false, DB nullable=true.
* **[NULLABILITY_MISMATCH]** [school_registry] severity=medium, confidence=high: Column "updated_at" on "school_registry" differs in nullability: ZModel optional=false, DB nullable=true.
* **[EXTRA_TABLE_IN_DB]** [academic_cycles] severity=critical, confidence=high: Table "academic_cycles" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [active_classrooms] severity=critical, confidence=high: Table "active_classrooms" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [active_timetable] severity=critical, confidence=high: Table "active_timetable" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [announcements] severity=critical, confidence=high: Table "announcements" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [audit_log] severity=critical, confidence=high: Table "audit_log" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [audit_logs] severity=critical, confidence=high: Table "audit_logs" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [auth_identities] severity=critical, confidence=high: Table "auth_identities" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [classroom_join_requests] severity=critical, confidence=high: Table "classroom_join_requests" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [classroom_legacy_records] severity=critical, confidence=high: Table "classroom_legacy_records" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [classroom_note_events] severity=critical, confidence=high: Table "classroom_note_events" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [classroom_photos] severity=critical, confidence=high: Table "classroom_photos" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [collection_node_events] severity=critical, confidence=high: Table "collection_node_events" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [collection_nodes] severity=critical, confidence=high: Table "collection_nodes" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [community_comments] severity=critical, confidence=high: Table "community_comments" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [community_entity_versions] severity=critical, confidence=high: Table "community_entity_versions" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [community_poll_votes] severity=critical, confidence=high: Table "community_poll_votes" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [community_posts_with_counts] severity=critical, confidence=high: Table "community_posts_with_counts" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [community_profile_versions] severity=critical, confidence=high: Table "community_profile_versions" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [community_reports] severity=critical, confidence=high: Table "community_reports" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [contextual_challenges] severity=critical, confidence=high: Table "contextual_challenges" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [contextual_moments] severity=critical, confidence=high: Table "contextual_moments" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [conversation_settings] severity=critical, confidence=high: Table "conversation_settings" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [daily_content] severity=critical, confidence=high: Table "daily_content" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [daily_prep_items] severity=critical, confidence=high: Table "daily_prep_items" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [device_accounts] severity=critical, confidence=high: Table "device_accounts" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [device_registry] severity=critical, confidence=high: Table "device_registry" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [direct_conversations] severity=critical, confidence=high: Table "direct_conversations" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [direct_messages] severity=critical, confidence=high: Table "direct_messages" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [districts] severity=critical, confidence=high: Table "districts" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [ecosystem_events] severity=critical, confidence=high: Table "ecosystem_events" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [edges] severity=critical, confidence=high: Table "edges" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [edu_school_climate] severity=critical, confidence=high: Table "edu_school_climate" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [edu_school_contacts] severity=critical, confidence=high: Table "edu_school_contacts" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [edu_school_pulse_logs] severity=critical, confidence=high: Table "edu_school_pulse_logs" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [edu_school_registry_stats] severity=critical, confidence=high: Table "edu_school_registry_stats" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [edu_schools] severity=critical, confidence=high: Table "edu_schools" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [energy_forecasts] severity=critical, confidence=high: Table "energy_forecasts" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [feature_usage_log] severity=critical, confidence=high: Table "feature_usage_log" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [form_responses] severity=critical, confidence=high: Table "form_responses" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [form_templates] severity=critical, confidence=high: Table "form_templates" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [geo_datasets] severity=critical, confidence=high: Table "geo_datasets" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [geo_districts] severity=critical, confidence=high: Table "geo_districts" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [geo_ds_divisions] severity=critical, confidence=high: Table "geo_ds_divisions" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [geo_features] severity=critical, confidence=high: Table "geo_features" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [geo_gn_divisions] severity=critical, confidence=high: Table "geo_gn_divisions" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [geo_postal_towns] severity=critical, confidence=high: Table "geo_postal_towns" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [geo_provinces] severity=critical, confidence=high: Table "geo_provinces" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [geography_columns] severity=critical, confidence=high: Table "geography_columns" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [geometry_columns] severity=critical, confidence=high: Table "geometry_columns" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [gift_codes] severity=critical, confidence=high: Table "gift_codes" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [gratitude_entries] severity=critical, confidence=high: Table "gratitude_entries" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [gratitude_gifts] severity=critical, confidence=high: Table "gratitude_gifts" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [group_reports] severity=critical, confidence=high: Table "group_reports" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [institutional_calendar] severity=critical, confidence=high: Table "institutional_calendar" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [inventory_requests] severity=critical, confidence=high: Table "inventory_requests" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [invite_codes] severity=critical, confidence=high: Table "invite_codes" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [journal_entries] severity=critical, confidence=high: Table "journal_entries" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [journeys] severity=critical, confidence=high: Table "journeys" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [joy_moments] severity=critical, confidence=high: Table "joy_moments" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [key_persons] severity=critical, confidence=high: Table "key_persons" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [library_entity_versions] severity=critical, confidence=high: Table "library_entity_versions" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [map_layers] severity=critical, confidence=high: Table "map_layers" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [mapping_topologies] severity=critical, confidence=high: Table "mapping_topologies" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [node_tags] severity=critical, confidence=high: Table "node_tags" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [notifications] severity=critical, confidence=high: Table "notifications" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [package_alternatives] severity=critical, confidence=high: Table "package_alternatives" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [package_companions] severity=critical, confidence=high: Table "package_companions" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [package_conflicts] severity=critical, confidence=high: Table "package_conflicts" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [packages] severity=critical, confidence=high: Table "packages" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [personal_compasses] severity=critical, confidence=high: Table "personal_compasses" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [pricing_subscriptions] severity=critical, confidence=high: Table "pricing_subscriptions" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [principal_governance_events] severity=critical, confidence=high: Table "principal_governance_events" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [principal_governance_records] severity=critical, confidence=high: Table "principal_governance_records" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [principal_notes] severity=critical, confidence=high: Table "principal_notes" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [principal_observations] severity=critical, confidence=high: Table "principal_observations" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [principal_profiles] severity=critical, confidence=high: Table "principal_profiles" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [privacy_ledger_entries] severity=critical, confidence=high: Table "privacy_ledger_entries" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [profile_completion] severity=critical, confidence=high: Table "profile_completion" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [provinces] severity=critical, confidence=high: Table "provinces" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [public_site_stats] severity=critical, confidence=high: Table "public_site_stats" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [relief_assignments] severity=critical, confidence=high: Table "relief_assignments" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [reminders] severity=critical, confidence=high: Table "reminders" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [resource_needs] severity=critical, confidence=high: Table "resource_needs" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [school_forest_state] severity=critical, confidence=high: Table "school_forest_state" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [school_join_requests] severity=critical, confidence=high: Table "school_join_requests" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [school_legacy_records] severity=critical, confidence=high: Table "school_legacy_records" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [school_memberships] severity=critical, confidence=high: Table "school_memberships" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [school_registry_legacy] severity=critical, confidence=high: Table "school_registry_legacy" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [security_audit_logs] severity=critical, confidence=high: Table "security_audit_logs" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [sleep_logs] severity=critical, confidence=high: Table "sleep_logs" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [snapshot_moments] severity=critical, confidence=high: Table "snapshot_moments" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [staff_attendance] severity=critical, confidence=high: Table "staff_attendance" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [staging] severity=critical, confidence=high: Table "staging" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [student_academic_records] severity=critical, confidence=high: Table "student_academic_records" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [student_observations] severity=critical, confidence=high: Table "student_observations" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [student_potential_analysis] severity=critical, confidence=high: Table "student_potential_analysis" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [student_profiles] severity=critical, confidence=high: Table "student_profiles" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [student_record_access_grants] severity=critical, confidence=high: Table "student_record_access_grants" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [students] severity=critical, confidence=high: Table "students" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [submissions] severity=critical, confidence=high: Table "submissions" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [subscriptions] severity=critical, confidence=high: Table "subscriptions" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [tags] severity=critical, confidence=high: Table "tags" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [teacher_insight_events] severity=critical, confidence=high: Table "teacher_insight_events" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [teacher_professional_records] severity=critical, confidence=high: Table "teacher_professional_records" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [teacher_profiles] severity=critical, confidence=high: Table "teacher_profiles" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [temporal_summaries] severity=critical, confidence=high: Table "temporal_summaries" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [tier_features] severity=critical, confidence=high: Table "tier_features" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [tiers] severity=critical, confidence=high: Table "tiers" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [timetable] severity=critical, confidence=high: Table "timetable" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [user_blocks] severity=critical, confidence=high: Table "user_blocks" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [user_growth_state_versions] severity=critical, confidence=high: Table "user_growth_state_versions" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [user_profile_versions] severity=critical, confidence=high: Table "user_profile_versions" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [user_push_tokens] severity=critical, confidence=high: Table "user_push_tokens" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [user_rewards] severity=critical, confidence=high: Table "user_rewards" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [user_rewards_versions] severity=critical, confidence=high: Table "user_rewards_versions" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [user_social_state] severity=critical, confidence=high: Table "user_social_state" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [user_workspace_layouts] severity=critical, confidence=high: Table "user_workspace_layouts" exists in the remote database but is not modeled in ZModel.
* **[EXTRA_TABLE_IN_DB]** [wisdom_notes] severity=critical, confidence=high: Table "wisdom_notes" exists in the remote database but is not modeled in ZModel.

## Policy Drift

* **[RLS_LOCKOUT]** [inventory_items] severity=critical, confidence=high: RLS is enabled on "inventory_items" but there are no policies.

## Snapshot Files

- Snapshot JSON: `C:\Users\Naween\projects\polymath-platform\apps\gurudevi-mobile\reports\db-drift\2026-06-27T18-03-42-647Z-database-snapshot.json`
- Summary JSON: `C:\Users\Naween\projects\polymath-platform\apps\gurudevi-mobile\reports\db-drift\2026-06-27T18-03-42-647Z-database-drift-summary.json`
- Ignore manifest: `C:\Users\Naween\projects\polymath-platform\.driftignore.ast.json`
