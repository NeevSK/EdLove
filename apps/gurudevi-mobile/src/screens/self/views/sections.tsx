import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '@repo/ui';

// This file provides the missing section components for StudentSelfView.
// These are simple wrappers that render the feature-specific data.

export const JournalSection: React.FC<{ entries: any[]; loading: boolean }> = ({ entries, loading }) => (
    <View style={styles.section}>
        <Text style={styles.title}>JOURNAL ENTRIES</Text>
        {loading ? <Text>Loading...</Text> : entries.map(e => <Text key={e.id} style={styles.item}>{e.title}</Text>)}
    </View>
);

export const MoodSection: React.FC<{ logs: any[]; loading: boolean }> = ({ logs, loading }) => (
    <View style={styles.section}>
        <Text style={styles.title}>MOOD HISTORY</Text>
        {loading ? <Text>Loading...</Text> : logs.map(l => <Text key={l.id} style={styles.item}>{l.mood_type}: {l.note}</Text>)}
    </View>
);

export const GoalSection: React.FC<{ goals: any[]; loading: boolean }> = ({ goals, loading }) => (
    <View style={styles.section}>
        <Text style={styles.title}>ACTIVE GOALS</Text>
        {loading ? <Text>Loading...</Text> : goals.map(g => <Text key={g.id} style={styles.item}>{g.title}</Text>)}
    </View>
);

export const IdentitySection: React.FC = () => (
    <View style={styles.section}>
        <Text style={styles.title}>IDENTITY RESONANCE</Text>
        <Text style={styles.placeholder}>Reflecting your inner qualities...</Text>
    </View>
);

export const TeacherFeedbackSection: React.FC = () => (
    <View style={styles.section}>
        <Text style={styles.title}>TEACHER ECHOES</Text>
        <Text style={styles.placeholder}>Guidance from your mentors.</Text>
    </View>
);

export const NatureSection: React.FC<{ paths: any; loading: boolean }> = ({ paths, loading }) => (
    <View style={styles.section}>
        <Text style={styles.title}>RESIDUAL RESONANCE (BANYAN)</Text>
        {loading ? <Text>Loading...</Text> : (
            <View>
                <Text style={styles.item}>Stage: {paths?.banyan_stage?.replace(/_/g, ' ') || 'Growing'}</Text>
                <Text style={styles.item}>Mentees: {paths?.peer_mentored_count || 0}</Text>
            </View>
        )}
    </View>
);

export const TeacherPulse: React.FC<{ banyan: any; loading: boolean }> = ({ banyan, loading }) => (
    <View style={styles.section}>
        <Text style={styles.title}>TEACHER PULSE</Text>
        {loading ? <Text>Loading...</Text> : (
            <View>
                <Text style={styles.item}>Banyan Growth: {banyan?.banyan_stage?.replace(/_/g, ' ')}</Text>
                <Text style={styles.item}>Ecosystem Ripple: {banyan?.peer_mentored_count} mentorship points</Text>
            </View>
        )}
    </View>
);

export const PrincipalPulse: React.FC<{ energy: any; decisions: any[]; loading: boolean }> = ({ energy, decisions, loading }) => (
    <View style={styles.section}>
        <Text style={styles.title}>LEADERSHIP PULSE</Text>
        {loading ? <Text>Loading...</Text> : (
            <View>
                <Text style={styles.item}>Energy: {energy?.energy_level || 'Neutral'}/5</Text>
                <Text style={styles.item}>Decisions Logged: {decisions?.length || 0}</Text>
            </View>
        )}
    </View>
);

// Re-export BaseSelfView from self package to satisfy the local import if needed,
// but StudentSelfView should ideally import it directly from @repo/self.
export { BaseSelfView } from '@repo/self';

const styles = StyleSheet.create({
    section: {
        marginBottom: 24,
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    title: {
        fontSize: 10,
        fontWeight: '900',
        color: '#F6BF8C',
        letterSpacing: 2,
        marginBottom: 12,
    },
    item: {
        color: '#fff',
        marginBottom: 8,
        fontSize: 14,
    },
    placeholder: {
        color: 'rgba(255,255,255,0.4)',
        fontStyle: 'italic',
        fontSize: 13,
    }
});
