import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LucideIcon, BookOpen, Sparkles, Target, User, MessageCircle, Leaf, Zap, Brain, Lightbulb } from 'lucide-react-native';

const styles = StyleSheet.create({
    sectionContainer: {
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        marginBottom: 16,
    },
    title: {
        fontSize: 14,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    contentText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        lineHeight: 20,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    placeholder: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.4)',
        fontStyle: 'italic',
        textAlign: 'center',
        padding: 10,
    },
    itemCard: {
        padding: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 12,
        borderLeftWidth: 3,
        marginBottom: 12,
    }
});

// --- CROSS-ROLE SECTIONS ---

export const JournalSection: React.FC<{ entries: any[], loading?: boolean }> = ({ entries, loading }) => (
    <View style={styles.sectionContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <BookOpen size={18} color="#8B5CF6" style={{ marginRight: 8 }} />
            <Text style={[styles.title, { color: '#8B5CF6' }]}>Inner Resonance</Text>
        </View>
        {loading ? (
            <View style={styles.loadingContainer}><ActivityIndicator color="#8B5CF6" /></View>
        ) : entries.length > 0 ? (
            entries.slice(0, 2).map(entry => (
                <View key={entry.id} style={[styles.itemCard, { borderLeftColor: '#8B5CF6' }]}>
                    <Text style={styles.contentText} numberOfLines={2}>{entry.content || entry.title}</Text>
                </View>
            ))
        ) : (
            <Text style={styles.placeholder}>No recent reflections captured.</Text>
        )}
    </View>
);

export const MoodSection: React.FC<{ logs: any[], loading?: boolean }> = ({ logs, loading }) => (
    <View style={styles.sectionContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Sparkles size={18} color="#EC4899" style={{ marginRight: 8 }} />
            <Text style={[styles.title, { color: '#EC4899' }]}>Emotional Flow</Text>
        </View>
        {loading ? (
            <View style={styles.loadingContainer}><ActivityIndicator color="#EC4899" /></View>
        ) : (
            <Text style={styles.contentText}>
                {logs.length > 0 ? `Currently resonant with ${logs[0].mood_type || logs[0].mood}.` : "The emotional waters are still."}
            </Text>
        )}
    </View>
);

// --- TEACHER SECTIONS ---

export const TeacherPulse: React.FC<{ banyan?: any, loading?: boolean }> = ({ banyan, loading }) => (
    <View style={[styles.sectionContainer, { borderColor: 'rgba(16, 185, 129, 0.2)' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Zap size={18} color="#10B981" style={{ marginRight: 8 }} />
            <Text style={[styles.title, { color: '#10B981' }]}>Instructional Energy</Text>
        </View>
        {loading ? (
            <View style={styles.loadingContainer}><ActivityIndicator color="#10B981" /></View>
        ) : (
            <View>
                <Text style={styles.contentText}>Banyan Stage: {banyan?.banyan_stage?.replace(/_/g, ' ') || 'Seedling'}</Text>
                <Text style={[styles.contentText, { marginTop: 4 }]}>Ecosystem Ripple: {banyan?.peer_mentored_count || 0} mentorship points</Text>
            </View>
        )}
    </View>
);

export const BanyanSection: React.FC = () => (
    <View style={styles.sectionContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Leaf size={18} color="#10B981" style={{ marginRight: 8 }} />
            <Text style={[styles.title, { color: '#10B981' }]}>The Banyan Tree</Text>
        </View>
        <Text style={styles.contentText}>Visualizing your classroom's collective growth roots.</Text>
    </View>
);

// --- PRINCIPAL SECTIONS ---

export const PrincipalPulse: React.FC<{ energy?: any, decisions?: any[], loading?: boolean }> = ({ energy, decisions, loading }) => (
    <View style={[styles.sectionContainer, { borderColor: 'rgba(245, 158, 11, 0.2)' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Brain size={18} color="#F59E0B" style={{ marginRight: 8 }} />
            <Text style={[styles.title, { color: '#F59E0B' }]}>Systemic Pulse</Text>
        </View>
        {loading ? (
            <View style={styles.loadingContainer}><ActivityIndicator color="#F59E0B" /></View>
        ) : (
            <View>
                <Text style={styles.contentText}>Energy Equilibrium: {energy?.energy_level || 'Balanced'}/5</Text>
                <Text style={[styles.contentText, { marginTop: 4 }]}>Strategic Acts: {decisions?.length || 0} active loops</Text>
            </View>
        )}
    </View>
);

export const DecisionSection: React.FC<{ decisions: any[], loading?: boolean }> = ({ decisions, loading }) => (
    <View style={styles.sectionContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Zap size={18} color="#F59E0B" style={{ marginRight: 8 }} />
            <Text style={[styles.title, { color: '#F59E0B' }]}>Governance Mirror</Text>
        </View>
        {loading ? (
            <View style={styles.loadingContainer}><ActivityIndicator color="#F59E0B" /></View>
        ) : decisions.length > 0 ? (
            decisions.slice(0, 2).map(d => (
                <View key={d.id} style={[styles.itemCard, { borderLeftColor: '#F59E0B' }]}>
                    <Text style={styles.contentText} numberOfLines={2}>{d.decision_text}</Text>
                </View>
            ))
        ) : (
            <Text style={styles.placeholder}>No major steering decisions recorded.</Text>
        )}
    </View>
);

// --- FOUNDER SECTIONS ---

export const VisionSection: React.FC = () => (
    <View style={[styles.sectionContainer, { borderColor: 'rgba(251, 191, 36, 0.3)' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Sparkles size={18} color="#FBBF24" style={{ marginRight: 8 }} />
            <Text style={[styles.title, { color: '#FBBF24' }]}>Ecosystem Vision</Text>
        </View>
        <Text style={[styles.contentText, { fontStyle: 'italic', color: '#FBBF24' }]}>
            "The architecture of education is the architecture of human potential."
        </Text>
    </View>
);

export const PhilosophySection: React.FC<{ wisdom: any[], loading?: boolean }> = ({ wisdom, loading }) => (
    <View style={styles.sectionContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Lightbulb size={18} color="#FBBF24" style={{ marginRight: 8 }} />
            <Text style={[styles.title, { color: '#FBBF24' }]}>Philosophical Anchors</Text>
        </View>
        {loading ? (
             <View style={styles.loadingContainer}><ActivityIndicator color="#FBBF24" /></View>
        ) : wisdom.length > 0 ? (
            wisdom.slice(0, 2).map(w => (
                <View key={w.id} style={[styles.itemCard, { borderLeftColor: '#FBBF24' }]}>
                    <Text style={styles.contentText}>{w.insight}</Text>
                </View>
            ))
        ) : (
            <Text style={styles.placeholder}>No wisdom seeds planted yet.</Text>
        )}
    </View>
);

// --- STUDENT SECTIONS ---

export const GoalSection: React.FC<{ goals: any[], loading?: boolean }> = ({ goals, loading }) => (
    <View style={[styles.sectionContainer, { borderColor: 'rgba(139, 92, 246, 0.2)' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Target size={18} color="#8B5CF6" style={{ marginRight: 8 }} />
            <Text style={[styles.title, { color: '#8B5CF6' }]}>Active Intentions</Text>
        </View>
        {loading ? (
            <View style={styles.loadingContainer}><ActivityIndicator color="#8B5CF6" /></View>
        ) : goals.length > 0 ? (
            goals.map(g => (
                <View key={g.id} style={{ marginBottom: 4 }}><Text style={styles.contentText}>🎯 {g.title}</Text></View>
            ))
        ) : (
            <Text style={styles.placeholder}>No active goals found.</Text>
        )}
    </View>
);

export const NatureSection: React.FC<{ paths: any, loading?: boolean }> = ({ paths, loading }) => (
    <View style={styles.sectionContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Leaf size={18} color="#10B981" style={{ marginRight: 8 }} />
            <Text style={[styles.title, { color: '#10B981' }]}>Residual Resonance</Text>
        </View>
        {loading ? (
            <View style={styles.loadingContainer}><ActivityIndicator color="#10B981" /></View>
        ) : (
            <View>
                <Text style={styles.contentText}>Stage: {paths?.banyan_stage?.replace(/_/g, ' ') || 'Growing'}</Text>
                <Text style={[styles.contentText, { marginTop: 4 }]}>Mentorship Hub: {paths?.peer_mentored_count || 0} active ripples</Text>
            </View>
        )}
    </View>
);

export const IdentitySection: React.FC = () => (
    <View style={styles.sectionContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <User size={18} color="#A78BFA" style={{ marginRight: 8 }} />
            <Text style={[styles.title, { color: '#A78BFA' }]}>Who Am I Becoming?</Text>
        </View>
        <Text style={styles.placeholder}>Reflecting your inner qualities...</Text>
    </View>
);

export const TeacherFeedbackSection: React.FC = () => (
    <View style={styles.sectionContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <MessageCircle size={18} color="#C4B5FD" style={{ marginRight: 8 }} />
            <Text style={[styles.title, { color: '#C4B5FD' }]}>Teacher Echoes</Text>
        </View>
        <Text style={styles.placeholder}>Guidance from your mentors.</Text>
    </View>
);
