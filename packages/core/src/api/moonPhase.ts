/**
 * Moon Phase API — Chandra Kala (चन्द्र कला)
 *
 * The Moon Path is different from all other nature paths in this system:
 * it is CYCLICAL, not progressive. The full moon becomes new again — not as
 * failure, but as the completion of one cycle and the beginning of the next.
 *
 * Every "new moon" is a new breath.
 *
 * This module:
 *   1. Computes the real current lunar phase (Jean Meeus algorithm)
 *   2. Maps moon phases to Sri Lankan calendar events (Poya days, New Year, seasons)
 *   3. Returns the "school season context" — what the app should feel like right now
 *   4. Provides the moon calendar for a given month
 *
 * USAGE:
 *   The moon phase is read by the UI layer to adjust:
 *   - Background tints (new moon is deep, full moon is warm ivory)
 *   - What prompts are offered (waxing = building energy, waning = reflection)
 *   - What seasonal markers appear (Vesak, New Year, etc.)
 *
 *   There is NO database table for moon phase — it is computed from the date alone.
 *   The moon is the same for everyone at any given moment; it needs no per-user record.
 *
 * See: docs/Core/GROWTH_MODEL.md v3.0 — Section 2B "The Moon Path"
 */

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type MoonPhaseName =
    | 'new_moon'
    | 'waxing_crescent'
    | 'first_quarter'
    | 'waxing_gibbous'
    | 'full_moon'
    | 'waning_gibbous'
    | 'last_quarter'
    | 'waning_crescent';

export interface MoonPhase {
    name: MoonPhaseName;
    /** Illumination fraction 0–1 (0 = new, 1 = full) */
    illumination: number;
    /** Age in days since last new moon (0–29.53) */
    age: number;
    /** Emoji glyph for display */
    emoji: string;
    /** What kind of energy this phase invites */
    invitation_en: string;
    /** Whether this phase qualifies as a Sri Lankan Poya day (within ±1 day of full moon) */
    is_poya: boolean;
}

export interface SriLankanCalendarEvent {
    name_en: string;
    name_si: string;  // pending native review
    date: string;     // ISO YYYY-MM-DD
    type: 'poya' | 'new_year' | 'term_start' | 'term_end' | 'other';
    app_theme: string; // which seasonal theme to activate
}

export interface SchoolSeasonContext {
    moon: MoonPhase;
    season: 'yala' | 'maha' | 'inter_monsoon_spring' | 'inter_monsoon_autumn';
    /** Current or upcoming Sri Lankan calendar event (within 3 days), if any */
    upcoming_event: SriLankanCalendarEvent | null;
    /** What the app should invite the user to do, given current moon + season */
    seasonal_invitation_en: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// LUNAR PHASE CALCULATION
// Based on the Jean Meeus algorithm (Astronomical Algorithms, 2nd ed.)
// Accurate to within ±0.5 days across the modern era.
// ─────────────────────────────────────────────────────────────────────────────

const LUNAR_CYCLE_DAYS = 29.530588853;

/** Convert a Date to Julian Day Number. */
function toJulianDay(date: Date): number {
    const y = date.getUTCFullYear();
    const m = date.getUTCMonth() + 1;
    const d = date.getUTCDate() +
        date.getUTCHours() / 24 +
        date.getUTCMinutes() / 1440;

    const A = Math.floor(y / 100);
    const B = 2 - A + Math.floor(A / 4);

    return Math.floor(365.25 * (y + 4716)) +
        Math.floor(30.6001 * (m + 1)) +
        d + B - 1524.5;
}

/**
 * Compute the lunar age (days since last new moon) for a given date.
 * Known new moon reference: Jan 6, 2000 18:14 UTC (Julian Day 2451550.2597)
 */
function getLunarAge(date: Date): number {
    const jd = toJulianDay(date);
    const cycleFraction = ((jd - 2451550.2597) / LUNAR_CYCLE_DAYS) % 1;
    return (cycleFraction < 0 ? cycleFraction + 1 : cycleFraction) * LUNAR_CYCLE_DAYS;
}

const MOON_PHASE_INVITATIONS: Record<MoonPhaseName, string> = {
    new_moon: 'A new cycle begins. What is quietly beginning in you?',
    waxing_crescent: 'First steps carry their own energy. What small thing can you start?',
    first_quarter: 'Effort and decision. The path is clear — what needs your attention today?',
    waxing_gibbous: 'Building toward fullness. What are you close to completing?',
    full_moon: 'Everything is visible. Share what you have been holding.',
    waning_gibbous: 'The harvest begins. What wisdom from this cycle is worth keeping?',
    last_quarter: 'Release what has served its purpose. What can you let go?',
    waning_crescent: 'Rest and gestation. The next cycle is already forming, quietly.',
};

const MOON_EMOJIS: Record<MoonPhaseName, string> = {
    new_moon: '🌑',
    waxing_crescent: '🌒',
    first_quarter: '🌓',
    waxing_gibbous: '🌔',
    full_moon: '🌕',
    waning_gibbous: '🌖',
    last_quarter: '🌗',
    waning_crescent: '🌘',
};

function ageToPhase(age: number): MoonPhaseName {
    // 8 phases, each ~3.69 days
    if (age < 1.85) return 'new_moon';
    if (age < 7.38) return 'waxing_crescent';
    if (age < 9.22) return 'first_quarter';
    if (age < 14.77) return 'waxing_gibbous';
    if (age < 16.61) return 'full_moon';
    if (age < 22.15) return 'waning_gibbous';
    if (age < 23.99) return 'last_quarter';
    return 'waning_crescent';
}

function ageToIllumination(age: number): number {
    // Approximation: sinusoidal fraction
    return (1 - Math.cos((2 * Math.PI * age) / LUNAR_CYCLE_DAYS)) / 2;
}

// ─────────────────────────────────────────────────────────────────────────────
// SRI LANKAN CALENDAR EVENTS
// Poya days: always the full moon of each month.
// Fixed events: Sinhala/Tamil New Year (April 13-14), school terms (approximate).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Named Sri Lankan Poya days (full moon observances).
 * The date varies yearly — this is a lookup for the name only.
 */
const POYA_NAMES: Record<number, { name_en: string; name_si: string }> = {
    1: { name_en: 'Duruthu Poya', name_si: 'දුරුතු පෝය' },
    2: { name_en: 'Navam Poya', name_si: 'නවම් පෝය' },
    3: { name_en: 'Medin Poya', name_si: 'මැදින් පෝය' },
    4: { name_en: 'Bak Poya', name_si: 'බක් පෝය' },
    5: { name_en: 'Vesak Poya', name_si: 'වෙසක් පෝය' },
    6: { name_en: 'Poson Poya', name_si: 'පොසොන් පෝය' },
    7: { name_en: 'Esala Poya', name_si: 'ඇසල පෝය' },
    8: { name_en: 'Nikini Poya', name_si: 'නිකිනි පෝය' },
    9: { name_en: 'Binara Poya', name_si: 'බිනර පෝය' },
    10: { name_en: 'Vap Poya', name_si: 'වප් පෝය' },
    11: { name_en: 'Il Poya', name_si: 'ඉල් පෝය' },
    12: { name_en: 'Unduvap Poya', name_si: 'උඳුවප් පෝය' },
};

/** Sri Lankan school terms (approximate — actual dates vary by MoE circular each year). */
const SCHOOL_TERM_WINDOWS = [
    { term: 1, start_approx: '01-07', end_approx: '04-12' },
    { term: 2, start_approx: '04-21', end_approx: '08-18' },
    { term: 3, start_approx: '09-01', end_approx: '12-12' },
];

/** Sri Lanka's monsoon seasons, keyed by month. */
function getSriLankanSeason(
    month: number
): 'yala' | 'maha' | 'inter_monsoon_spring' | 'inter_monsoon_autumn' {
    if (month >= 5 && month <= 9) return 'yala';
    if (month >= 10 || month <= 1) return 'maha';
    if (month >= 2 && month <= 4) return 'inter_monsoon_spring';
    return 'inter_monsoon_autumn';
}

const SEASONAL_INVITATIONS: Record<string, string> = {
    yala: 'The rains are here — a time of deep green and inward nourishment.',
    maha: 'The cool season settles. A good time for reflection and deep roots.',
    inter_monsoon_spring: 'The air is warm and transitional. New beginnings stir.',
    inter_monsoon_autumn: 'Between seasons — a threshold moment. Rest and readiness at once.',
};

// ─────────────────────────────────────────────────────────────────────────────
// MOON PHASE API
// ─────────────────────────────────────────────────────────────────────────────

export const moonPhaseAPI = {
    /**
     * Get the current moon phase.
     * Pure computation — no database access, instant.
     */
    getCurrentMoonPhase(now = new Date()): MoonPhase {
        const age = getLunarAge(now);
        const name = ageToPhase(age);
        const illumination = ageToIllumination(age);
        const isPoya = name === 'full_moon' || age > 13.5 && age < 15.5;

        return {
            name,
            illumination: Math.round(illumination * 100) / 100,
            age: Math.round(age * 10) / 10,
            emoji: MOON_EMOJIS[name],
            invitation_en: MOON_PHASE_INVITATIONS[name],
            is_poya: isPoya,
        };
    },

    /**
     * Get the full school season context for a given date.
     * Used by the home screen to determine the ambient aesthetic and invitation.
     */
    getSchoolSeasonContext(now = new Date()): SchoolSeasonContext {
        const moon = this.getCurrentMoonPhase(now);
        const month = now.getMonth() + 1;
        const season = getSriLankanSeason(month);

        // Check for upcoming calendar event (within 3 days)
        let upcoming_event: SriLankanCalendarEvent | null = null;

        // Vesak Poya (May full moon) — special treatment
        if (month === 5 && moon.is_poya) {
            upcoming_event = {
                name_en: 'Vesak Poya',
                name_si: 'වෙසක් පෝය',
                date: now.toISOString().slice(0, 10),
                type: 'poya',
                app_theme: 'vesak',
            };
        }
        // Sinhala/Tamil New Year
        else if (month === 4 && (now.getDate() === 13 || now.getDate() === 14)) {
            upcoming_event = {
                name_en: 'Sinhala and Tamil New Year',
                name_si: 'සිංහල හා දෙමළ අලුත් අවුරුද්ද',
                date: `${now.getUTCFullYear()}-04-14`,
                type: 'new_year',
                app_theme: 'new_year',
            };
        }
        // Other Poya days
        else if (moon.is_poya && POYA_NAMES[month]) {
            const poya = POYA_NAMES[month];
            upcoming_event = {
                name_en: poya.name_en,
                name_si: poya.name_si,
                date: now.toISOString().slice(0, 10),
                type: 'poya',
                app_theme: 'poya',
            };
        }

        // Combine moon + season invitation
        const seasonal_invitation_en = upcoming_event
            ? `${upcoming_event.name_en} — ${moon.invitation_en.toLowerCase()}`
            : `${SEASONAL_INVITATIONS[season]} ${moon.invitation_en}`;

        return {
            moon,
            season,
            upcoming_event,
            seasonal_invitation_en,
        };
    },

    /**
     * Generate a moon calendar for a given month (year + month, 1-indexed).
     * Returns the phase for each day of the month.
     * Used by the principal's Moon Calendar feature.
     */
    getMonthCalendar(year: number, month: number): Array<{
        date: string;
        phase: MoonPhaseName;
        emoji: string;
        is_poya: boolean;
    }> {
        const daysInMonth = new Date(year, month, 0).getDate();
        const calendar = [];

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
            const age = getLunarAge(date);
            const name = ageToPhase(age);
            calendar.push({
                date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
                phase: name,
                emoji: MOON_EMOJIS[name],
                is_poya: age > 13.5 && age < 15.5,
            });
        }

        return calendar;
    },

    /**
     * Get the Poya days for a given year.
     * Used for the school planning calendar view.
     */
    getPoyaDays(year: number): Array<{ date: string; name_en: string; name_si: string }> {
        const poyaDays = [];

        for (let month = 1; month <= 12; month++) {
            // Find the full moon date for this month by iterating days
            const calendar = this.getMonthCalendar(year, month);
            const fullMoonDay = calendar.find(d => d.is_poya);
            const poyaName = POYA_NAMES[month];
            if (fullMoonDay && poyaName) {
                poyaDays.push({
                    date: fullMoonDay.date,
                    name_en: poyaName.name_en,
                    name_si: poyaName.name_si,
                });
            }
        }

        return poyaDays;
    },
};
