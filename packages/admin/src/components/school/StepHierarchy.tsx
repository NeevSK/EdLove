import React from 'react';
import { 
    Icon, 
    VStack,
    Text,
    HStack,
    Pressable,
    Box,
    Heading 
} from '@repo/ui';
import { Plus, X, GraduationCap, School } from 'lucide-react-native';

interface StepHierarchyProps {
    data: {
        levels: string[];
        gradeRange: { start: number; end: number };
        sections: { name: string; headName?: string }[];
    };
    onUpdate: (data: Partial<StepHierarchyProps['data']>) => void;
}

const AVAILABLE_LEVELS = [
    { id: 'Primary', label: 'Primary (Grade 1-5)' },
    { id: 'Junior Secondary', label: 'Junior Secondary (Grade 6-9)' },
    { id: 'Senior Secondary', label: 'Senior Secondary (Grade 10-11)' },
    { id: 'Advanced Level', label: 'Advanced Level (Grade 12-13)' }
];

export default function StepHierarchy({ 
    data, 
    onUpdate 
}: StepHierarchyProps) {

    const toggleLevel = (levelId: string) => {
        const currentLevels = data.levels || [];
        if (currentLevels.includes(levelId)) {
            onUpdate({ levels: currentLevels.filter(l => l !== levelId) });
        } else {
            onUpdate({ levels: [...currentLevels, levelId] });
        }
    };

    const addSection = () => {
        const currentSections = data.sections || [];
        onUpdate({ 
            sections: [...currentSections, { name: '' }] 
        });
    };

    const removeSection = (index: number) => {
        const currentSections = data.sections || [];
        onUpdate({ 
            sections: currentSections.filter((_, i) => i !== index) 
        });
    };

    return (
        <VStack className="gap-8">
            <VStack className="gap-4">
                <VStack className="gap-1">
                    <Heading className="text-lg font-black text-phaseText-primary uppercase tracking-wider">Academic Levels</Heading>
                    <Text className="text-xs font-bold text-phaseText-muted uppercase tracking-widest">
                        Define school educational tiers
                    </Text>
                </VStack>
                <VStack className="gap-2">
                    {AVAILABLE_LEVELS.map(level => {
                        const isActive = data.levels.includes(level.id);
                        return (
                            <Pressable 
                                key={level.id}
                                onPress={() => toggleLevel(level.id)}
                            >
                                <Box 
                                    className={`p-4 rounded-2xl border-2 transition-all ${
                                        isActive ? 'bg-phase-interactive/5 border-phase-interactive/20' : 'bg-phase-canvas border-phase-border'
                                    }`}
                                >
                                    <HStack className="gap-4 items-center">
                                        <Box className={`p-2 rounded-xl border border-phase-border ${isActive ? 'bg-phase-interactive/10' : 'bg-phase-surface'}`}>
                                            <Icon 
                                                as={GraduationCap}
                                                size={18} 
                                                className={isActive ? 'text-phase-interactive' : 'text-phaseText-muted'} 
                                            />
                                        </Box>
                                        <Text 
                                            className={`text-sm tracking-tight ${isActive ? 'font-black text-phaseText-primary' : 'font-bold text-phaseText-secondary'}`}
                                        >
                                            {level.label}
                                        </Text>
                                    </HStack>
                                </Box>
                            </Pressable>
                        );
                    })}
                </VStack>
            </VStack>

            <VStack className="gap-4">
                <HStack className="justify-between items-center">
                    <VStack className="gap-1">
                        <Heading className="text-lg font-black text-phaseText-primary uppercase tracking-wider">Administrative Sections</Heading>
                        <Text className="text-xs font-bold text-phaseText-muted uppercase tracking-widest">
                            Societies, Prefects, Council
                        </Text>
                    </VStack>
                    <Pressable 
                        onPress={addSection}
                        className="bg-phaseText-primary px-4 py-2 rounded-xl active:opacity-80"
                    >
                        <HStack className="items-center gap-2">
                            <Icon as={Plus} className="text-white" size="xs" />
                            <Text className="text-[10px] font-black text-white uppercase tracking-widest">ADD</Text>
                        </HStack>
                    </Pressable>
                </HStack>
                
                {data.sections.length === 0 ? (
                    <Box className="p-8 items-center justify-center bg-phase-canvas rounded-[32px] border-2 border-dashed border-phase-border">
                        <Text className="text-xs font-bold text-phaseText-muted uppercase tracking-widest">No divisions established</Text>
                    </Box>
                ) : (
                    <VStack className="gap-3">
                        {data.sections.map((section, idx) => (
                            <Box 
                                key={idx} 
                                className="p-4 rounded-2xl bg-phase-surface border border-phase-border"
                            >
                                <HStack className="gap-4 items-center">
                                    <Box className="p-2 bg-phase-canvas rounded-xl border border-phase-border">
                                        <Icon as={School} size={16} className="text-phaseText-muted" />
                                    </Box>
                                    <VStack className="flex-1">
                                        <Text className="text-sm font-bold text-phaseText-primary">{section.name || 'Unnamed Division'}</Text>
                                    </VStack>
                                    <Pressable 
                                        onPress={() => removeSection(idx)}
                                        className="p-2 active:bg-phase-danger/10 rounded-lg"
                                    >
                                        <Icon as={X} className="text-phase-danger" size="sm" />
                                    </Pressable>
                                </HStack>
                            </Box>
                        ))}
                    </VStack>
                )}
            </VStack>
        </VStack>
    );
}

