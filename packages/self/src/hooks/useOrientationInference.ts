/**
 * useOrientationInference
 *
 * Derives a soft orientation fingerprint from signals that are ALREADY
 * collected by the app — no quiz, no onboarding, no labels.
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Signal priority (highest → lowest confidence):
 *
 *  1. Explicit seeds from onboarding orientation step (stored on user)
 *  2. Behavioral signals from existing app data:
 *       mood_logs     → timing (morning/night), variability, valence
 *       energy_logs   → average level, consistency
 *  3. Role-based defaults (role + grade_number when available)
 *       — this is the fallback that fires even for brand-new users
 *       — based on well-established educational psychology research:
 *         • Students (especially junior grades) tend to be more
 *           social and action-oriented (solo_social high, reflect_act high)
 *         • Experienced teachers tend toward depth + reflection
 *         • Principals/senior staff: depth + steady rhythm
 *  4. Absolute neutral fallback (all 50) — only if even role is unknown
 *
 * The returned seeds are EPHEMERAL — computed on-device each render
 * cycle, never persisted unless the user explicitly completes the
 * orientation step.  This means:
 *   • Privacy: no behavioral fingerprint is ever stored without intent
 *   • Freshness: re-computed from latest data on each mount
 *   • No schema migration needed for inference signals
 *
 * The hook is designed to be called by ResonancePatternCard directly
 * so that the card "just works" regardless of whether the user
 * completed onboarding.
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import { useMemo } from 'react';
import type { UserRole } from '@repo/core';
import type { MoodLog, EnergyForecast } from '../types';
import type { OrientationSeeds } from '@repo/profile';

// ============================================================================
// ROLE-BASED DEFAULTS
//
// These capture the modal tendency of each role based on educational
// psychology (Vygotsky, Kolb, Big Five / teaching literature).
// They are NOT stereotypes — they are population-level starting points
// that get overridden as soon as behavioral signals accumulate.
//
// Dimensions (all 0–100, neutral = 50):
//   depth_breadth  — deep focus (low) ↔ wide exploration (high)
//   reflect_act    — reflect first (low) ↔ act/try first (high)
//   solo_social    — solo processing (low) ↔ social energy (high)
//   steady_surge   — steady rhythm (low) ↔ burst energy (high)
// ============================================================================

interface RoleDefaults {
    depth_breadth: number;
    reflect_act: number;
    solo_social: number;
    steady_surge: number;
}

const ROLE_DEFAULTS: Record<string, RoleDefaults> = {
    // Students: curious, action-oriented, social, energetic bursts
    // Junior grades lean more social + active; adjusted further below by grade
    student: { depth_breadth: 60, reflect_act: 65, solo_social: 65, steady_surge: 60 },

    // Teachers: depth-seekers, reflective, enjoy both solo prep and social delivery
    teacher: { depth_breadth: 35, reflect_act: 35, solo_social: 55, steady_surge: 40 },

    // Grade head / section head: deeper responsibility, more reflective
    grade_head:   { depth_breadth: 30, reflect_act: 30, solo_social: 55, steady_surge: 35 },
    section_head: { depth_breadth: 30, reflect_act: 30, solo_social: 55, steady_surge: 35 },

    // Principal: systemic thinker, steady leadership rhythm, both solo and social
    principal: { depth_breadth: 25, reflect_act: 25, solo_social: 60, steady_surge: 30 },

    // Founder / admin: wide thinkers, action-oriented, social
    founder: { depth_breadth: 65, reflect_act: 60, solo_social: 70, steady_surge: 65 },
    admin:   { depth_breadth: 50, reflect_act: 50, solo_social: 55, steady_surge: 50 },
};

// For students: grade_number nudges defaults
// Junior (1-5): high social, high action
// Middle (6-9): transitional, mixed
// Senior (10-13): more reflective, more depth
function studentGradeAdjustment(gradeNumber: number | null | undefined): Partial<RoleDefaults> {
    if (!gradeNumber) return {};
    if (gradeNumber <= 5)  return { solo_social: 75, reflect_act: 72, depth_breadth: 68 };
    if (gradeNumber <= 9)  return { solo_social: 65, reflect_act: 60, depth_breadth: 58 };
    return                         { solo_social: 55, reflect_act: 50, depth_breadth: 48 }; // 10-13
}

// ============================================================================
// BEHAVIORAL INFERENCE
// ============================================================================

interface BehavioralSignals {
    moodLogs: MoodLog[];
    energyForecasts: EnergyForecast[];
}

function deriveFromBehavior(signals: BehavioralSignals): Partial<RoleDefaults> {
    const { moodLogs, energyForecasts } = signals;
    const result: Partial<RoleDefaults> = {};

    // ── Mood signals ────────────────────────────────────────────────
    if (moodLogs.length >= 5) {
        const scores = moodLogs.map(l => l.mood_score);
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

        // Variance: high variance → surge tendency; low variance → steady
        const variance = scores.reduce((acc, s) => acc + (s - avg) ** 2, 0) / scores.length;
        if (variance > 1.5) result.steady_surge = 65;  // variable mood → surge
        if (variance < 0.5) result.steady_surge = 38;  // very consistent → steady

        // High average mood → more action-oriented
        if (avg >= 4.0) result.reflect_act = 58;
        if (avg <= 2.5) result.reflect_act = 42;  // low mood → more withdrawn/reflective

        // Log timing: morning logs → steady person; late-night logs → surge person
        const hours = moodLogs
            .map(l => new Date(l.created_at).getHours())
            .filter(h => !isNaN(h));
        if (hours.length > 0) {
            const avgHour = hours.reduce((a, b) => a + b, 0) / hours.length;
            if (avgHour < 9)  result.steady_surge = Math.min(result.steady_surge ?? 50, 40); // morning → steady
            if (avgHour > 21) result.steady_surge = Math.max(result.steady_surge ?? 50, 62); // late-night → surge
        }
    }

    // ── Energy signals ───────────────────────────────────────────────
    if (energyForecasts.length >= 3) {
        const levels = energyForecasts.map(f => f.energy_level);
        const avgEnergy = levels.reduce((a, b) => a + b, 0) / levels.length;

        // High sustained energy → more social + action
        if (avgEnergy >= 4.0) {
            result.solo_social = 62;
            result.reflect_act = Math.max(result.reflect_act ?? 50, 58);
        }
        // Low sustained energy → more solo + reflective
        if (avgEnergy <= 2.5) {
            result.solo_social = 40;
            result.reflect_act = Math.min(result.reflect_act ?? 50, 40);
        }
    }

    return result;
}

// ============================================================================
// MERGE UTILITY
// ============================================================================

function clamp(v: number): number {
    return Math.max(0, Math.min(100, Math.round(v)));
}

/**
 * Layered merge: start from explicit seeds (highest confidence) →
 * behavioral deltas → role defaults → neutral 50.
 * Later layers only fill gaps; they never override higher-confidence data.
 */
function mergeLayers(
    explicit: OrientationSeeds | null | undefined,
    behavioral: Partial<RoleDefaults>,
    roleDefaults: RoleDefaults,
): OrientationSeeds {
    const dims = ['depth_breadth', 'reflect_act', 'solo_social', 'steady_surge'] as const;

    const merged: Record<string, number> = {};
    for (const dim of dims) {
        if (explicit) {
            // Explicit seeds win — but blend with behavioral drift (10% weight)
            const behavioralValue = behavioral[dim];
            if (behavioralValue !== undefined) {
                merged[dim] = clamp(explicit[dim] * 0.9 + behavioralValue * 0.1);
            } else {
                merged[dim] = explicit[dim];
            }
        } else if (behavioral[dim] !== undefined) {
            // Behavioral signal blended with role default (60/40)
            merged[dim] = clamp((behavioral[dim]! * 0.6) + (roleDefaults[dim] * 0.4));
        } else {
            // Role default alone
            merged[dim] = roleDefaults[dim];
        }
    }

    const source: OrientationSeeds['source'] = explicit
        ? (Object.keys(behavioral).length > 0 ? 'mixed' : 'seeded')
        : 'inferred';

    return {
        depth_breadth: merged.depth_breadth,
        reflect_act:   merged.reflect_act,
        solo_social:   merged.solo_social,
        steady_surge:  merged.steady_surge,
        source,
        seeded_at:     explicit?.seeded_at,
        last_updated:  new Date().toISOString(),
    };
}

// ============================================================================
// HOOK
// ============================================================================

export interface UseOrientationInferenceInput {
    /** Explicit seeds from onboarding — null/undefined if skipped */
    explicitSeeds?: OrientationSeeds | null;
    /** Recent mood logs from useMoodLogs */
    moodLogs?: MoodLog[];
    /** Recent energy forecasts from useEnergyForecast */
    energyForecasts?: EnergyForecast[];
    /** User's role — used for role defaults */
    role?: UserRole | null;
    /** Student grade number — narrows student defaults */
    gradeNumber?: number | null;
}

export interface UseOrientationInferenceResult {
    seeds: OrientationSeeds;
    /** True if based purely on role defaults — no behavioral data yet */
    isDefault: boolean;
    /** Confidence 0–1: how much behavioral data contributed */
    confidence: number;
}

export function useOrientationInference(
    input: UseOrientationInferenceInput,
): UseOrientationInferenceResult {
    const {
        explicitSeeds,
        moodLogs = [],
        energyForecasts = [],
        role,
        gradeNumber,
    } = input;

    return useMemo(() => {
        // 1. Determine role defaults.
        // When role is unknown (guest, not-yet-set) we use truly neutral values (50)
        // rather than defaulting to a specific role's biases.
        const NEUTRAL: RoleDefaults = { depth_breadth: 50, reflect_act: 50, solo_social: 50, steady_surge: 50 };
        const base: RoleDefaults = role ? (ROLE_DEFAULTS[role] ?? NEUTRAL) : NEUTRAL;

        // 2. Grade adjustment for students
        const roleDefaults: RoleDefaults = role === 'student'
            ? { ...base, ...studentGradeAdjustment(gradeNumber) }
            : base;

        // 3. Derive behavioral signals
        const behavioral = deriveFromBehavior({ moodLogs, energyForecasts });

        // 4. Merge layers
        const seeds = mergeLayers(explicitSeeds ?? null, behavioral, roleDefaults);

        // 5. Compute metadata
        const hasBehavioral = Object.keys(behavioral).length > 0;
        const hasExplicit = !!explicitSeeds;
        const confidence = hasExplicit ? 0.9 : hasBehavioral
            ? Math.min(0.7, 0.3 + (moodLogs.length + energyForecasts.length) * 0.04)
            : 0.2; // role-only baseline

        return {
            seeds,
            isDefault: !hasExplicit && !hasBehavioral,
            confidence,
        };
    }, [
        explicitSeeds,
        moodLogs,
        energyForecasts,
        role,
        gradeNumber,
    ]);
}
