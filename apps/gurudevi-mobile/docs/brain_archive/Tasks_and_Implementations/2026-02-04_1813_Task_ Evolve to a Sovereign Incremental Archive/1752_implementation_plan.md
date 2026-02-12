# Documentation Consolidation & Sync Strategy

This plan outlines how to move and organize all your research/brain files from the system-managed Gemini directory into your project, while maintaining their chronological and chat-based context.

## User Review Required

> [!IMPORTANT]
> **Switching to "Sovereign Archiving"**: 
> Previously, the script acted as a "mirror" (deleting the old archive and re-ranking everything). This is not optimal because links break and old sessions could be lost if the brain folder is cleared.
> 
> **The New "Optimal" Strategy**:
> 1. **Incremental Sync**: The script will **never** delete your archive files. It only adds or updates them.
> 2. **Stable Naming**: We will use `YYYY-MM-DD_HHmm_` prefixes. These are permanent and will not change when new sessions are added.
> 3. **Recent-First Dashboard**: To provide the "recent items top" view you want, the script will now generate a `00_RECENT_DASHBOARD.md` file at the root of your archive, listing everything in reverse order with direct links.

## Proposed Changes

We will create a consolidation script that does the following:
1. Loops through each "Session" folder in your Brain directory.
2. Identifies the primary task or topic of that session (by reading `task.md`).
3. Copies all files (including `.resolved` and `task.md`) into a structured folder in `apps/gurudevi-mobile/Docs v 3.0/brain_archive/`.

### [Documentation]

#### [MODIFY] [consolidate_docs.ps1](file:///c:/Users/Naween/projects/polymath-platform/apps/gurudevi-mobile/Docs%20v%203.0/consolidate_docs.ps1)
Updated to handle the four-category sorting logic.
- **Categorization Logic**: Uses keyword matching on file names (e.g., `*walkthrough*` -> `Learning`).
- **Archive Structure**: `brain_archive / [Category] / [Session_Name] / [Files]`.

## Verification Plan

### Automated Verification
- I will run the script once to demonstrate the organization.
- I will verify that the files in the new `brain_archive` folder match the ones in the system brain folder.

### Manual Verification
- The user can inspect the `brain_archive` folder to ensure it is organized logically (e.g., folders named like `2026-02-04_Implementing-Auth`).
