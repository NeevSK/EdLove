# Sovereign Surgical Error Analysis: core
> **Mode:** Local Only Filtering

> **Timestamp:** 2026-04-26 19:41:20
> **Target:** C:\Users\Naween\projects\polymath-platform\packages\core
> **Filtered:** 0 external errors hidden
> **Total Errors:** 3

## Executive Summary

| File Path | Errors | Common Codes |
| :--- | :---: | :--- |
| src/index.ts | 3 | TS2308, TS2300 |

## Error Distribution

| Code | Count | Description (Heuristic) |
| :--- | :---: | :--- |
| TS2300 | 2 | Duplicate identifier 'PublishedSchoolGradingCompletion'. |
| TS2308 | 1 | Module './types' has already exported a member named 'Use... |

## Detailed Findings

### File: src/index.ts
Total errors in file: 3

- [ ] **Line 161, Col 45** | TS2300
  > Duplicate identifier 'PublishedSchoolGradingCompletion'.
- [ ] **Line 162, Col 8** | TS2300
  > Duplicate identifier 'PublishedSchoolGradingCompletion'.
- [ ] **Line 175, Col 1** | TS2308
  > Module './types' has already exported a member named 'User'. Consider explicitly re-exporting to resolve the ambiguity.

---
