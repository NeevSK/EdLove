/**
 * sections.tsx
 * modular dashboard sections for the Self package.
 * Refactored to Zero-Legacy: purged corrupted StyleSheets and migrated to @repo/ui primitives.
 */

import React from 'react';
import { 
    BookOpen, 
    Sparkles, 
    Target, 
    User, 
    MessageCircle, 
    Leaf, 
    Zap, 
    Brain, 
    Lightbulb 
} from 'lucide-react-native';
import { 
    Box, 
    VStack, 
    HStack, 
    Text, 
    Icon,
    Heading,
    Spinner
} from '@repo/ui/primitives';
import { usePermissions } from '@repo/core/logic';

// --- CROSS-ROLE SECTIONS ---

export const JournalSection: React.FC<{ entries: any[], loading?: boolean }> = ({ entries, loading }) => (
    <Box className="p-6 bg-white/5 rounded-2xl border border-white/10 mb-4">
        <HStack className="items-center mb-4 gap-2">
            <Icon as={BookOpen} size={18} className="text-violet-400" />
            <Text className="text-sm font-black uppercase tracking-widest text-violet-400">Inner Resonance</Text>
        </HStack>
        
        {loading ? (
            <VStack className="py-5 items-center justify-center">
                <Spinner className="text-violet-400" />
            </VStack>
        ) : entries.length > 0 ? (
            <VStack className="gap-3">
                {entries.slice(0, 2).map(entry => (
                    <Box key={entry.id} className="p-4 bg-white/[0.02] rounded-xl border-l-4 border-l-violet-400 border-white/5 shadow-sm">
                        <Text className="text-sacredWhite/80 text-sm leading-relaxed" numberOfLines={2}>
                            {entry.content || entry.title}
                        </Text>
                    </Box>
                ))}
            </VStack>
        ) : (
            <Text className="text-mistGray text-xs italic text-center py-2">
                No recent reflections captured.
            </Text>
        )}
    </Box>
);

export const MoodSection: React.FC<{ logs: any[], loading?: boolean }> = ({ logs, loading }) => (
    <Box className="p-6 bg-white/5 rounded-2xl border border-white/10 mb-4">
        <HStack className="items-center mb-4 gap-2">
            <Icon as={Sparkles} size={18} className="text-pink-400" />
            <Text className="text-sm font-black uppercase tracking-widest text-pink-400">Emotional Flow</Text>
        </HStack>
        
        {loading ? (
            <VStack className="py-5 items-center justify-center">
                <Spinner className="text-pink-400" />
            </VStack>
        ) : (
            <Text className="text-sacredWhite/70 text-sm leading-relaxed italic">
                {logs.length > 0 
                    ? `Currently resonant with ${logs[0].mood_type || logs[0].mood}.` 
                    : "The emotional waters are still."}
            </Text>
        )}
    </Box>
);

// --- TEACHER SECTIONS ---

export const TeacherPulse: React.FC<{ banyan?: any, loading?: boolean }> = ({ banyan, loading }) => {
    const { ability } = usePermissions();
    if (!ability.can('manage', 'TeacherDashboard')) return null;

    return (
        <Box className="p-6 bg-emeraldGreen/5 rounded-2xl border border-emeraldGreen/10 mb-4">
            <HStack className="items-center mb-4 gap-2">
                <Icon as={Zap} size={18} className="text-emeraldGreen" />
                <Text className="text-sm font-black uppercase tracking-widest text-emeraldGreen">Instructional Energy</Text>
            </HStack>
            
            {loading ? (
                <VStack className="py-5 items-center justify-center">
                    <Spinner className="text-emeraldGreen" />
                </VStack>
            ) : (
                <VStack className="gap-2">
                    <HStack className="justify-between items-center">
                        <Text className="text-mistGray text-xs uppercase tracking-wider font-bold">Banyan Stage</Text>
                        <Box className="bg-emeraldGreen/10 px-3 py-1 rounded-full border border-emeraldGreen/20">
                            <Text className="text-emeraldGreen text-[10px] font-black uppercase">
                                {banyan?.banyan_stage?.replace(/_/g, ' ') || 'Seedling'}
                            </Text>
                        </Box>
                    </HStack>
                    <HStack className="justify-between items-center">
                        <Text className="text-mistGray text-xs uppercase tracking-wider font-bold">Ecosystem Ripple</Text>
                        <Text className="text-sacredWhite font-bold">{banyan?.peer_mentored_count || 0} pts</Text>
                    </HStack>
                </VStack>
            )}
        </Box>
    );
};

export const BanyanSection: React.FC = () => (
    <Box className="p-6 bg-white/5 rounded-2xl border border-white/10 mb-4">
        <HStack className="items-center mb-3 gap-2">
            <Icon as={Leaf} size={18} className="text-emeraldGreen" />
            <Text className="text-sm font-black uppercase tracking-widest text-emeraldGreen">The Banyan Tree</Text>
        </HStack>
        <Text className="text-mistGray text-xs leading-relaxed italic">
            Visualizing your classroom's collective growth roots.
        </Text>
    </Box>
);

// --- PRINCIPAL SECTIONS ---

export const PrincipalPulse: React.FC<{ energy?: any, decisions?: any[], loading?: boolean }> = ({ energy, decisions, loading }) => {
    const { ability } = usePermissions();
    if (!ability.can('manage', 'PrincipalDashboard')) return null;

    return (
        <Box className="p-6 bg-amber-400/5 rounded-2xl border border-amber-400/20 mb-4">
            <HStack className="items-center mb-4 gap-2">
                <Icon as={Brain} size={18} className="text-amber-400" />
                <Text className="text-sm font-black uppercase tracking-widest text-amber-400">Systemic Pulse</Text>
            </HStack>
            {loading ? (
                <VStack className="py-5 items-center justify-center">
                    <Spinner className="text-amber-400" />
                </VStack>
            ) : (
                <VStack className="gap-2">
                    <Text className="text-sacredWhite/80 text-sm">
                        Energy Equilibrium: <Text className="font-bold text-amber-400">{energy?.energy_level || 'Balanced'}/5</Text>
                    </Text>
                    <Text className="text-sacredWhite/80 text-sm">
                        Strategic Acts: <Text className="font-bold text-amber-400">{decisions?.length || 0} active loops</Text>
                    </Text>
                </VStack>
            )}
        </Box>
    );
};

export const DecisionSection: React.FC<{ decisions: any[], loading?: boolean }> = ({ decisions, loading }) => (
    <Box className="p-6 bg-white/5 rounded-2xl border border-white/10 mb-4">
        <HStack className="items-center mb-4 gap-2">
            <Icon as={Zap} size={18} className="text-amber-400" />
            <Text className="text-sm font-black uppercase tracking-widest text-amber-400">Governance Mirror</Text>
        </HStack>
        {loading ? (
            <VStack className="py-5 items-center justify-center">
                <Spinner className="text-amber-400" />
            </VStack>
        ) : decisions.length > 0 ? (
            <VStack className="gap-3">
                {decisions.slice(0, 2).map(d => (
                    <Box key={d.id} className="p-4 bg-white/[0.02] rounded-xl border-l-4 border-l-amber-400 border-white/5 shadow-sm">
                        <Text className="text-sacredWhite/80 text-sm leading-relaxed" numberOfLines={2}>
                            {d.decision_text}
                        </Text>
                    </Box>
                ))}
            </VStack>
        ) : (
            <Text className="text-mistGray text-xs italic text-center py-2">
                No major steering decisions recorded.
            </Text>
        )}
    </Box>
);

// --- FOUNDER SECTIONS ---

export const VisionSection: React.FC = () => {
    const { ability } = usePermissions();
    if (!ability.can('manage', 'FounderDashboard')) return null;

    return (
        <Box className="p-6 bg-sanctuarySaffron/5 rounded-2xl border border-sanctuarySaffron/20 mb-4">
            <HStack className="items-center mb-4 gap-2">
                <Icon as={Sparkles} size={18} className="text-sanctuarySaffron" />
                <Text className="text-sm font-black uppercase tracking-widest text-sanctuarySaffron">Ecosystem Vision</Text>
            </HStack>
            <Text className="text-sanctuarySaffron italic text-sm leading-relaxed font-medium">
                "The architecture of education is the architecture of human potential."
            </Text>
        </Box>
    );
};

export const PhilosophySection: React.FC<{ wisdom: any[], loading?: boolean }> = ({ wisdom, loading }) => {
    const { ability } = usePermissions();
    if (!ability.can('manage', 'FounderDashboard')) return null;

    return (
        <Box className="p-6 bg-white/5 rounded-2xl border border-white/10 mb-4">
            <HStack className="items-center mb-4 gap-2">
                <Icon as={Lightbulb} size={18} className="text-sanctuarySaffron" />
                <Text className="text-sm font-black uppercase tracking-widest text-sanctuarySaffron">Philosophical Anchors</Text>
            </HStack>
            {loading ? (
                 <VStack className="py-5 items-center justify-center">
                    <Spinner className="text-sanctuarySaffron" />
                 </VStack>
            ) : wisdom.length > 0 ? (
                <VStack className="gap-3">
                    {wisdom.slice(0, 2).map(w => (
                        <Box key={w.id} className="p-4 bg-white/[0.02] rounded-xl border-l-4 border-l-sanctuarySaffron border-white/5 shadow-sm">
                            <Text className="text-sacredWhite/80 text-sm leading-relaxed">{w.insight}</Text>
                        </Box>
                    ))}
                </VStack>
            ) : (
                <Text className="text-mistGray text-xs italic text-center py-2">
                    No wisdom seeds planted yet.
                </Text>
            )}
        </Box>
    );
};

// --- STUDENT SECTIONS ---

export const GoalSection: React.FC<{ goals: any[], loading?: boolean }> = ({ goals, loading }) => {
    const { ability } = usePermissions();
    if (!ability.can('manage', 'StudentDashboard')) return null;

    return (
        <Box className="p-6 bg-indigo-400/5 rounded-2xl border border-indigo-400/10 mb-4">
            <HStack className="items-center mb-4 gap-2">
                <Icon as={Target} size={18} className="text-indigo-400" />
                <Text className="text-sm font-black uppercase tracking-widest text-indigo-400">Active Intentions</Text>
            </HStack>
            {loading ? (
                <VStack className="py-5 items-center justify-center">
                    <Spinner className="text-indigo-400" />
                </VStack>
            ) : goals.length > 0 ? (
                <VStack className="gap-2">
                    {goals.map(g => (
                        <HStack key={g.id} className="items-center gap-3 bg-white/[0.02] p-3 rounded-lg border border-white/5">
                            <Text className="text-lg">🎯</Text>
                            <Text className="text-sacredWhite/80 font-bold text-sm flex-1">{g.title}</Text>
                        </HStack>
                    ))}
                </VStack>
            ) : (
                <Text className="text-mistGray text-xs italic text-center py-2">
                    No active goals found.
                </Text>
            )}
        </Box>
    );
};

export const NatureSection: React.FC<{ paths: any, loading?: boolean }> = ({ paths, loading }) => (
    <Box className="p-6 bg-white/5 rounded-2xl border border-white/10 mb-4">
        <HStack className="items-center mb-4 gap-2">
            <Icon as={Leaf} size={18} className="text-emeraldGreen" />
            <Text className="text-sm font-black uppercase tracking-widest text-emeraldGreen">Residual Resonance</Text>
        </HStack>
        {loading ? (
            <VStack className="py-5 items-center justify-center">
                <Spinner className="text-emeraldGreen" />
            </VStack>
        ) : (
            <VStack className="gap-3">
                <HStack className="justify-between items-center bg-white/[0.02] p-3 rounded-lg border border-white/5">
                    <Text className="text-mistGray text-xs uppercase tracking-wider font-bold">Stage</Text>
                    <Text className="text-emeraldGreen font-black text-xs uppercase">
                        {paths?.banyan_stage?.replace(/_/g, ' ') || 'Growing'}
                    </Text>
                </HStack>
                <HStack className="justify-between items-center bg-white/[0.02] p-3 rounded-lg border border-white/5">
                    <Text className="text-mistGray text-xs uppercase tracking-wider font-bold">Mentorship Hub</Text>
                    <Text className="text-sacredWhite font-bold text-xs">{paths?.peer_mentored_count || 0} active ripples</Text>
                </HStack>
            </VStack>
        )}
    </Box>
);

export const IdentitySection: React.FC = () => (
    <Box className="p-6 bg-white/5 rounded-2xl border border-white/10 mb-4">
        <HStack className="items-center mb-4 gap-2">
            <Icon as={User} size={18} className="text-violet-300" />
            <Text className="text-sm font-black uppercase tracking-widest text-violet-300">Who Am I Becoming?</Text>
        </HStack>
        <Text className="text-mistGray text-xs italic text-center py-4">
            Reflecting your inner qualities...
        </Text>
    </Box>
);

export const TeacherFeedbackSection: React.FC = () => (
    <Box className="p-6 bg-white/5 rounded-2xl border border-white/10 mb-4">
        <HStack className="items-center mb-4 gap-2">
            <Icon as={MessageCircle} size={18} className="text-sky-300" />
            <Text className="text-sm font-black uppercase tracking-widest text-sky-300">Teacher Echoes</Text>
        </HStack>
        <Text className="text-mistGray text-xs italic text-center py-4">
            Guidance from your mentors.
        </Text>
    </Box>
);
