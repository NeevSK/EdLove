# ADR-008: Ghost Curriculum Observation Layer

## Status
Accepted

## Context
Capturing "hidden" educational signals without pre-deciding features.

## Decision
We chose an **Observation First** strategy. Add `gc_signals` (JSONB) to `student_longitudinal_events` today. No logic builds on it yet; signals accumulate history for later AI analysis.

## Date: 2026-04-22
