/**
 * SchoolForestScreen.web.tsx
 *
 * Full-page School Forest view for Principals on web.
 *
 * Shows all teacher "trees" in the school's wellbeing forest, with health
 * indicators, care-needed alerts, mood history sparklines, and the overall
 * forest weather narrative.
 */
import React, { useEffect, useState } from 'react';
import { Icon, useNavigation } from '@react-navigation/native';
import { usePermissions, schoolForestAPI } from '@repo/core';
import type { SchoolForestState, TeacherTree } from '@repo/core';
import { SkeletonCard } from '@repo/ui';
import { ArrowLeft, RefreshCw } from 'lucide-react-native';

const WEATHER_EMOJI: Record<string, string>  = {
    radiant: '\u2600\uFE0F',
    lush: '\uD83C\uDF3F',
    resting: '\uD83C\uDF19',
    steady: '\u26C5',
    quiet: '\uD83C\uDF2B\uFE0F',
    changing: '\uD83C\uDF24'};

const HEALTH_EMOJI: Record<TeacherTree['tree_health'], string> = { 
    seedling: '\uD83C\uDF31',
    growing: '\uD83C\uDF3F',
    flourishing: '\uD83C\uDF33',
    flowering: '\uD83C\uDF38',
    ancient: '\uD83E\uDEB5'};

const HEALTH_COLOR: Record<TeacherTree['tree_health'], string> = { 
    seedling: 'var(--amber-glow)',
    growing: 'var(--water)',
    flourishing: 'var(--moss)',
    flowering: 'var(--lotus)',
    ancient: 'var(--sanctuary-saffron)'};

function lastSignalLabel(days: number): string {
    if (days === 0) return '\u2705 Active today';
    if (days === 1) return '\uD83D\uDD50 Active yesterday';
    if (days <= 7) return `\uD83D\uDD50 ${days} days ago`;
    return '\u26A0\uFE0F Over a week silent';
}

export default function SchoolForestScreen() {
    const { can, context } = usePermissions();
    const navigation = useNavigation();
    const schoolId = context.schoolId ?? '';

    const [forest, setForest] = useState<SchoolForestState | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = async (silent = false) => {
        if (!schoolId) return;
        if (!silent) setLoading(true);
        else setRefreshing(true);
        try {
            const data = await schoolForestAPI.getForestOverview(schoolId);
            setForest(data);
        } catch (err) {
            console.warn('[SchoolForestScreen] load failed:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        };

    useEffect(() => { void load(); }, [schoolId]);

    return (
        <div className="sub-view-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <button
                    onClick={() => navigation.goBack()}
                    style={{ 
                        background: 'var(--background-alt)', 
                        border: 'none', 
                        borderRadius: '10px', 
                        padding: '8px 12px', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        fontWeight: '700', 
                        fontSize: '13px', 
                        color: 'var(--ink)', 
                        fontFamily: 'var(--font-body)' 
                    }}
                >
                    <Icon as={ArrowLeft} size={16} /> Back
                </button>
                <div style={{ flex: 1 }}>
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: 'var(--ink)' }}>
                        School Forest {'\uD83C\uDF33'}
                    </h1>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--ink-ghost)' }}>
                        A living map of your staff's wellbeing and growth
                    </p>
                </div>
                <button
                    onClick={() => void load(true)}
                    disabled={refreshing}
                    style={{ 
                        background: 'var(--background-alt)', 
                        border: 'none', 
                        borderRadius: '10px', 
                        padding: '8px 12px', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        fontWeight: '700', 
                        fontSize: '13px', 
                        color: 'var(--ink)', 
                        fontFamily: 'var(--font-body)', 
                        opacity: refreshing ? 0.6 : 1 
                    }}
                >
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {loading && <SkeletonCard />}

            {!loading && !can('read', 'SchoolForest') && (
                <div className="sanctuary-card" style={{ padding: '40px', textAlign: 'center' }}>
                    <p style={{ fontSize: '15px', color: 'var(--ink-ghost)' }}>
                        You do not have permission to view the School Forest.
                    </p>
                </div>
            )}

            {!loading && can('read', 'SchoolForest') && !forest && (
                <div className="sanctuary-card" style={{ padding: '40px', textAlign: 'center' }}>
                    <p style={{ fontSize: '15px', color: 'var(--ink-ghost)' }}>
                        No forest data yet. Check back after teachers have logged their first wellbeing check-in.
                    </p>
                </div>
            )}

            {!loading && forest && (
                <React.Fragment>
                    {/* Forest Weather Banner */}
                    <div
                        className="sanctuary-card"
                        style={{
                            padding: '28px',
                            marginBottom: '24px',
                            background: 'linear-gradient(135deg, var(--moss-soft) 0%, var(--background-alt) 100%)',
                            border: '1px solid var(--moss-soft)'}}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                            <span style={{ fontSize: '36px' }}>
                                {WEATHER_EMOJI[forest.forest_weather] ?? '\uD83C\uDF24'}
                            </span>
                            <div>
                                <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--moss)', textTransform: 'capitalize' }}>
                                    {forest.forest_weather} Season
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--ink-ghost)' }}>
                                    {forest.trees.length} teacher{forest.trees.length !== 1 ? 's' : ''} in your forest
                                    {forest.trees.filter(t => t.needs_rain).length > 0 && (
                                        <span style={{ color: '#c0392b', marginLeft: '8px', fontWeight: '700' }}>
                                            {'\u00B7'} {forest.trees.filter(t => t.needs_rain).length} needing care
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <p style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--ink)', fontStyle: 'italic', margin: 0 }}>
                            {forest.forest_narrative_en}
                        </p>
                    </div>

                    {/* Trees Grid */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))',
                            gap: '16px'}}
                    >
                        {forest.trees.map(tree => (
                            <div
                                key={tree.user_id}
                                className="sanctuary-card"
                                style={{
                                    padding: '20px',
                                    border: tree.needs_rain ? '1px solid rgba(192,57,43,0.3)' : undefined,
                                    background: tree.needs_rain ? 'rgba(231,76,60,0.03)' : undefined}}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '32px' }}>{HEALTH_EMOJI[tree.tree_health] ?? '\uD83C\uDF31'}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--ink)', textTransform: 'capitalize' }}>
                                            {tree.tree_health}
                                        </div>
                                        <div
                                            style={{
                                                display: 'inline-block',
                                                padding: '2px 8px',
                                                background: HEALTH_COLOR[tree.tree_health] + '20',
                                                borderRadius: '4px',
                                                fontSize: '10px',
                                                fontWeight: '700',
                                                color: HEALTH_COLOR[tree.tree_health],
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'}}
                                        >
                                            {tree.tree_health}
                                        </div>
                                    </div>
                                    {tree.needs_rain && (
                                        <div
                                            style={{
                                                padding: '4px 8px',
                                                background: 'rgba(192,57,43,0.1)',
                                                borderRadius: '6px',
                                                fontSize: '10px',
                                                fontWeight: '800',
                                                color: '#c0392b'}}
                                        >
                                            {'\uD83D\uDCA7'} Needs care
                                        </div>
                                    )}
                                </div>

                                {/* Days since last signal proxy for engagement */}
                                <div style={{ fontSize: '11px', color: 'var(--ink-ghost)', marginTop: '8px' }}>
                                    {lastSignalLabel(tree.days_since_signal)}
                                </div>
                            </div>
                        ))}
                    </div>

                    {forest.trees.length === 0 && (
                        <div className="sanctuary-card" style={{ padding: '40px', textAlign: 'center' }}>
                            <p style={{ fontSize: '15px', color: 'var(--ink-ghost)' }}>
                                Your forest is just beginning to grow. Encourage teachers to log their first mood check-in!
                            </p>
                        </div>
                    )}
                </React.Fragment>
            )}
        </div>
    );
}
